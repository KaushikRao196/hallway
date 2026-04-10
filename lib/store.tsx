"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import {
  User,
  Question,
  Answer,
  Vote,
  Report,
  Class,
  Teacher,
  School,
  TeacherRating,
  TeacherRatingSummary,
  mockSchool,
  generateAnonHandle,
} from "./mock";

/* ------------------------------------------------------------------ */
/* DB row → TypeScript mappers                                         */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toClass(r: any): Class {
  return { id: r.id, schoolId: r.school_id, code: r.code, title: r.title };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toTeacher(r: any): Teacher {
  return { id: r.id, schoolId: r.school_id, name: r.name };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toQuestion(r: any): Question {
  return {
    id: r.id,
    userId: r.user_id,
    schoolId: r.school_id,
    classId: r.class_id,
    teacherId: r.teacher_id ?? undefined,
    title: r.title,
    body: r.body,
    createdAt: r.created_at,
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toAnswer(r: any): Answer {
  return { id: r.id, questionId: r.question_id, userId: r.user_id, body: r.body, score: r.score, createdAt: r.created_at };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toVote(r: any): Vote {
  return { userId: r.user_id, targetType: r.target_type as "answer", targetId: r.target_id, value: r.value as 1 | -1 };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toReport(r: any): Report {
  return { id: r.id, reporterId: r.reporter_id, targetType: r.target_type as "question" | "answer", targetId: r.target_id, reason: r.reason, createdAt: r.created_at };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toTeacherRating(r: any): TeacherRating {
  return { id: r.id, teacherId: r.teacher_id, userId: r.user_id, difficulty: r.difficulty, fairness: r.fairness, workload: r.workload, createdAt: r.created_at };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toUser(r: any): User {
  return { id: r.id, anonHandle: r.anon_handle, schoolId: r.school_id, email: r.email };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toSchool(r: any): School {
  return { id: r.id, name: r.name, domain: r.domain };
}

/* ------------------------------------------------------------------ */
/* Store types                                                         */
/* ------------------------------------------------------------------ */

interface StoreState {
  currentUser: User | null;
  school: School;
  classes: Class[];
  teachers: Teacher[];
  questions: Question[];
  answers: Answer[];
  votes: Vote[];
  reports: Report[];
  teacherRatings: TeacherRating[];
  isLoading: boolean;
}

interface StoreActions {
  login: () => Promise<void>;
  logout: () => Promise<void>;

  // Questions
  addQuestion: (data: { classId: string; teacherId?: string; title: string; body: string }) => Promise<Question>;
  updateQuestion: (id: string, data: { classId?: string; teacherId?: string; title?: string; body?: string }) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;

  // Answers
  addAnswer: (questionId: string, body: string) => Promise<Answer>;
  vote: (answerId: string, value: 1 | -1) => Promise<void>;
  report: (targetType: "question" | "answer", targetId: string, reason: string) => Promise<void>;

  // Classes
  createClass: (data: { code: string; title: string }) => Promise<Class>;
  updateClass: (id: string, data: { code?: string; title?: string }) => Promise<void>;
  deleteClass: (id: string, strategy: "nullify" | "delete" | { reassignTo: string }) => Promise<void>;

  // Teachers
  createTeacher: (data: { name: string }) => Promise<Teacher>;
  updateTeacher: (id: string, data: { name?: string }) => Promise<void>;
  deleteTeacher: (id: string, strategy: "nullify" | "delete" | { reassignTo: string }) => Promise<void>;

  // Teacher Ratings
  submitTeacherRating: (teacherId: string, data: { difficulty: number; fairness: number; workload: number }) => Promise<void>;
  deleteRating: (ratingId: string) => Promise<void>;
  getTeacherRatingSummary: (teacherId: string) => TeacherRatingSummary | null;
  getUserRatingForTeacher: (teacherId: string) => TeacherRating | null;
  getRatingsForTeacher: (teacherId: string) => TeacherRating[];

  // Queries
  getQuestionsByClass: (classId: string) => Question[];
  getQuestionsByTeacher: (teacherId: string) => Question[];
  getAnswersByQuestion: (questionId: string) => Answer[];
  getTopAnswersByClass: (classId: string) => Answer[];
  getUserVote: (answerId: string) => number;
  getClassById: (classId: string) => Class | undefined;
  getTeacherById: (teacherId: string) => Teacher | undefined;
  getUserById: (userId: string) => User | undefined;
  getQuestionById: (questionId: string) => Question | undefined;
  getLinkedPostCount: (type: "class" | "teacher", id: string) => number;
  getLinkedRatingCount: (teacherId: string) => number;
}

const StoreContext = createContext<(StoreState & StoreActions) | null>(null);

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [school, setSchool] = useState<School>(mockSchool);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [teacherRatings, setTeacherRatings] = useState<TeacherRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userCache, setUserCache] = useState<Map<string, User>>(new Map());

  /* ---- Load everything for a signed-in user ---- */
  const loadUserSession = useCallback(async (email: string) => {
    // 1. Resolve school from email domain
    const domain = email.split("@")[1];
    const { data: schoolRow } = await supabase.from("schools").select("*").eq("domain", domain).single();
    if (!schoolRow) throw new Error("School not found for domain: " + domain);
    const resolvedSchool = toSchool(schoolRow);
    setSchool(resolvedSchool);

    // 2. Upsert user
    const { data: existingRow } = await supabase.from("users").select("*").eq("email", email).single();
    let user: User;
    if (existingRow) {
      user = toUser(existingRow);
    } else {
      const newRow = { id: crypto.randomUUID(), anon_handle: generateAnonHandle(), school_id: resolvedSchool.id, email };
      const { data: inserted, error } = await supabase.from("users").insert(newRow).select().single();
      if (error || !inserted) throw new Error(error?.message ?? "Failed to create user");
      user = toUser(inserted);
    }
    setCurrentUser(user);
    setUserCache((prev) => new Map(prev).set(user.id, user));

    // 3. Fetch all school data + user-specific data in one parallel round-trip
    const [
      { data: classRows },
      { data: teacherRows },
      { data: questionRows },
      { data: answerRows },
      { data: ratingRows },
      { data: voteRows },
      { data: reportRows },
    ] = await Promise.all([
      supabase.from("classes").select("*").eq("school_id", resolvedSchool.id),
      supabase.from("teachers").select("*").eq("school_id", resolvedSchool.id),
      supabase.from("questions").select("*").eq("school_id", resolvedSchool.id).order("created_at", { ascending: false }),
      supabase.from("answers").select("*"),
      supabase.from("teacher_ratings").select("*"),
      supabase.from("votes").select("*").eq("user_id", user.id),
      supabase.from("reports").select("*").eq("reporter_id", user.id),
    ]);

    if (classRows) setClasses(classRows.map(toClass));
    if (teacherRows) setTeachers(teacherRows.map(toTeacher));
    if (questionRows) setQuestions(questionRows.map(toQuestion));
    if (answerRows) setAnswers(answerRows.map(toAnswer));
    if (ratingRows) setTeacherRatings(ratingRows.map(toTeacherRating));
    if (voteRows) setVotes(voteRows.map(toVote));
    if (reportRows) setReports(reportRows.map(toReport));
  }, []);

  /* ---- Auth listener + session restore ---- */
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        await loadUserSession(session.user.email);
      }
      setIsLoading(false);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user?.email) {
        await loadUserSession(session.user.email);
      } else if (event === "SIGNED_OUT") {
        setCurrentUser(null);
        setSchool(mockSchool);
        setClasses([]);
        setTeachers([]);
        setQuestions([]);
        setAnswers([]);
        setVotes([]);
        setReports([]);
        setTeacherRatings([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserSession]);

  /* ============ AUTH ============ */

  const login = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setSchool(mockSchool);
    setClasses([]);
    setTeachers([]);
    setQuestions([]);
    setAnswers([]);
    setVotes([]);
    setReports([]);
    setTeacherRatings([]);
  }, []);

  /* ============ CLASSES CRUD ============ */

  const createClass = useCallback(async (data: { code: string; title: string }): Promise<Class> => {
    if (!currentUser) throw new Error("Not logged in");
    const row = { id: crypto.randomUUID(), school_id: currentUser.schoolId, code: data.code, title: data.title };
    const { data: inserted, error } = await supabase.from("classes").insert(row).select().single();
    if (error || !inserted) throw new Error(error?.message ?? "Failed to create class");
    const cls = toClass(inserted);
    setClasses((prev) => [...prev, cls]);
    return cls;
  }, [currentUser]);

  const updateClass = useCallback(async (id: string, data: { code?: string; title?: string }) => {
    const { error } = await supabase.from("classes").update(data).eq("id", id);
    if (error) throw new Error(error.message);
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }, []);

  const deleteClass = useCallback(
    async (id: string, strategy: "nullify" | "delete" | { reassignTo: string }) => {
      if (strategy === "delete") {
        const { data: qs } = await supabase.from("questions").select("id").eq("class_id", id);
        if (qs && qs.length > 0) {
          await supabase.from("questions").delete().eq("class_id", id);
          const deletedIds = qs.map((q) => q.id);
          setQuestions((prev) => prev.filter((q) => !deletedIds.includes(q.id)));
          setAnswers((prev) => prev.filter((a) => !deletedIds.includes(a.questionId)));
        }
      } else if (strategy === "nullify") {
        await supabase.from("questions").delete().eq("class_id", id);
        setQuestions((prev) => prev.filter((q) => q.classId !== id));
      } else {
        await supabase.from("questions").update({ class_id: strategy.reassignTo }).eq("class_id", id);
        setQuestions((prev) => prev.map((q) => (q.classId === id ? { ...q, classId: strategy.reassignTo } : q)));
      }
      await supabase.from("classes").delete().eq("id", id);
      setClasses((prev) => prev.filter((c) => c.id !== id));
    },
    []
  );

  /* ============ TEACHERS CRUD ============ */

  const createTeacher = useCallback(async (data: { name: string }): Promise<Teacher> => {
    if (!currentUser) throw new Error("Not logged in");
    const row = { id: crypto.randomUUID(), school_id: currentUser.schoolId, name: data.name };
    const { data: inserted, error } = await supabase.from("teachers").insert(row).select().single();
    if (error || !inserted) throw new Error(error?.message ?? "Failed to create teacher");
    const teacher = toTeacher(inserted);
    setTeachers((prev) => [...prev, teacher]);
    return teacher;
  }, [currentUser]);

  const updateTeacher = useCallback(async (id: string, data: { name?: string }) => {
    const { error } = await supabase.from("teachers").update(data).eq("id", id);
    if (error) throw new Error(error.message);
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  }, []);

  const deleteTeacher = useCallback(
    async (id: string, strategy: "nullify" | "delete" | { reassignTo: string }) => {
      await supabase.from("teacher_ratings").delete().eq("teacher_id", id);
      setTeacherRatings((prev) => prev.filter((r) => r.teacherId !== id));
      if (strategy === "delete") {
        await supabase.from("questions").delete().eq("teacher_id", id);
        setQuestions((prev) => prev.filter((q) => q.teacherId !== id));
      } else if (strategy === "nullify") {
        await supabase.from("questions").update({ teacher_id: null }).eq("teacher_id", id);
        setQuestions((prev) => prev.map((q) => (q.teacherId === id ? { ...q, teacherId: undefined } : q)));
      } else {
        await supabase.from("questions").update({ teacher_id: strategy.reassignTo }).eq("teacher_id", id);
        setQuestions((prev) => prev.map((q) => (q.teacherId === id ? { ...q, teacherId: strategy.reassignTo } : q)));
      }
      await supabase.from("teachers").delete().eq("id", id);
      setTeachers((prev) => prev.filter((t) => t.id !== id));
    },
    []
  );

  /* ============ QUESTIONS CRUD ============ */

  const addQuestion = useCallback(
    async (data: { classId: string; teacherId?: string; title: string; body: string }) => {
      if (!currentUser) throw new Error("Not logged in");
      const row = {
        id: crypto.randomUUID(),
        user_id: currentUser.id,
        school_id: currentUser.schoolId,
        class_id: data.classId,
        teacher_id: data.teacherId ?? null,
        title: data.title,
        body: data.body,
      };
      const { data: inserted, error } = await supabase.from("questions").insert(row).select().single();
      if (error || !inserted) throw new Error(error?.message ?? "Failed to post question");
      const question = toQuestion(inserted);
      setQuestions((prev) => [question, ...prev]);
      return question;
    },
    [currentUser]
  );

  const updateQuestion = useCallback(
    async (id: string, data: { classId?: string; teacherId?: string; title?: string; body?: string }) => {
      const dbData: Record<string, unknown> = {};
      if (data.classId !== undefined) dbData.class_id = data.classId;
      if (data.teacherId !== undefined) dbData.teacher_id = data.teacherId;
      if (data.title !== undefined) dbData.title = data.title;
      if (data.body !== undefined) dbData.body = data.body;
      const { error } = await supabase.from("questions").update(dbData).eq("id", id);
      if (error) throw new Error(error.message);
      setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...data } : q)));
    },
    []
  );

  const deleteQuestion = useCallback(async (id: string) => {
    await supabase.from("questions").delete().eq("id", id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setAnswers((prev) => prev.filter((a) => a.questionId !== id));
  }, []);

  /* ============ ANSWERS + VOTES + REPORTS ============ */

  const addAnswer = useCallback(
    async (questionId: string, body: string) => {
      if (!currentUser) throw new Error("Not logged in");
      const row = { id: crypto.randomUUID(), question_id: questionId, user_id: currentUser.id, body, score: 0 };
      const { data: inserted, error } = await supabase.from("answers").insert(row).select().single();
      if (error || !inserted) throw new Error(error?.message ?? "Failed to post answer");
      const answer = toAnswer(inserted);
      setAnswers((prev) => [answer, ...prev]);
      return answer;
    },
    [currentUser]
  );

  const vote = useCallback(
    async (answerId: string, value: 1 | -1) => {
      if (!currentUser) throw new Error("Not logged in");

      const existingIndex = votes.findIndex((v) => v.userId === currentUser.id && v.targetId === answerId);
      const existing = existingIndex >= 0 ? votes[existingIndex] : null;
      let scoreDelta: number;
      let newVotes: Vote[];

      if (existing) {
        if (existing.value === value) {
          scoreDelta = -value;
          newVotes = votes.filter((_, i) => i !== existingIndex);
          await supabase.from("votes").delete().eq("user_id", currentUser.id).eq("target_id", answerId);
        } else {
          scoreDelta = value * 2;
          newVotes = votes.map((v, i) => (i === existingIndex ? { ...v, value } : v));
          await supabase.from("votes").update({ value }).eq("user_id", currentUser.id).eq("target_id", answerId);
        }
      } else {
        scoreDelta = value;
        newVotes = [...votes, { userId: currentUser.id, targetType: "answer", targetId: answerId, value }];
        await supabase.from("votes").insert({ user_id: currentUser.id, target_type: "answer", target_id: answerId, value });
      }

      setVotes(newVotes);
      setAnswers((prev) => prev.map((a) => (a.id === answerId ? { ...a, score: a.score + scoreDelta } : a)));
      const currentAnswer = answers.find((a) => a.id === answerId);
      if (currentAnswer) {
        await supabase.from("answers").update({ score: currentAnswer.score + scoreDelta }).eq("id", answerId);
      }
    },
    [currentUser, votes, answers]
  );

  const report = useCallback(
    async (targetType: "question" | "answer", targetId: string, reason: string) => {
      if (!currentUser) throw new Error("Not logged in");
      const row = { id: crypto.randomUUID(), reporter_id: currentUser.id, target_type: targetType, target_id: targetId, reason };
      const { data: inserted, error } = await supabase.from("reports").insert(row).select().single();
      if (error || !inserted) throw new Error(error?.message ?? "Failed to submit report");
      setReports((prev) => [...prev, toReport(inserted)]);
    },
    [currentUser]
  );

  /* ============ TEACHER RATINGS ============ */

  const submitTeacherRating = useCallback(
    async (teacherId: string, data: { difficulty: number; fairness: number; workload: number }) => {
      if (!currentUser) throw new Error("Not logged in");
      const existingRating = teacherRatings.find((r) => r.teacherId === teacherId && r.userId === currentUser.id);
      const row = {
        id: existingRating?.id ?? crypto.randomUUID(),
        teacher_id: teacherId,
        user_id: currentUser.id,
        difficulty: data.difficulty,
        fairness: data.fairness,
        workload: data.workload,
      };
      const { data: upserted, error } = await supabase.from("teacher_ratings").upsert(row, { onConflict: "teacher_id,user_id" }).select().single();
      if (error || !upserted) throw new Error(error?.message ?? "Failed to submit rating");
      const rating = toTeacherRating(upserted);
      setTeacherRatings((prev) => {
        const idx = prev.findIndex((r) => r.teacherId === teacherId && r.userId === currentUser.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = rating;
          return next;
        }
        return [...prev, rating];
      });
    },
    [currentUser, teacherRatings]
  );

  const deleteRating = useCallback(async (ratingId: string) => {
    await supabase.from("teacher_ratings").delete().eq("id", ratingId);
    setTeacherRatings((prev) => prev.filter((r) => r.id !== ratingId));
  }, []);

  /* ============ QUERIES ============ */

  const getTeacherRatingSummary = useCallback(
    (teacherId: string): TeacherRatingSummary | null => {
      const ratings = teacherRatings.filter((r) => r.teacherId === teacherId);
      if (ratings.length === 0) return null;
      const avgDifficulty = ratings.reduce((sum, r) => sum + r.difficulty, 0) / ratings.length;
      const avgFairness = ratings.reduce((sum, r) => sum + r.fairness, 0) / ratings.length;
      const avgWorkload = ratings.reduce((sum, r) => sum + r.workload, 0) / ratings.length;
      // Higher difficulty and workload = harder teacher = lower score
      // Higher fairness = better teacher = higher score
      // Scale: invert difficulty and workload (6 - x so 5→1, 1→5), keep fairness as-is, average out of 5, scale to 10
      const overallScore = (((6 - avgDifficulty) + avgFairness + (6 - avgWorkload)) / 3) * 2;
      return {
        teacherId,
        avgDifficulty: Math.round(avgDifficulty * 10) / 10,
        avgFairness: Math.round(avgFairness * 10) / 10,
        avgWorkload: Math.round(avgWorkload * 10) / 10,
        overallScore: Math.round(overallScore * 10) / 10,
        totalResponses: ratings.length,
      };
    },
    [teacherRatings]
  );

  const getUserRatingForTeacher = useCallback(
    (teacherId: string): TeacherRating | null => {
      if (!currentUser) return null;
      return teacherRatings.find((r) => r.teacherId === teacherId && r.userId === currentUser.id) ?? null;
    },
    [currentUser, teacherRatings]
  );

  const getRatingsForTeacher = useCallback(
    (teacherId: string): TeacherRating[] => teacherRatings.filter((r) => r.teacherId === teacherId),
    [teacherRatings]
  );

  const getQuestionsByClass = useCallback(
    (classId: string) => questions.filter((q) => q.classId === classId),
    [questions]
  );

  const getQuestionsByTeacher = useCallback(
    (teacherId: string) => questions.filter((q) => q.teacherId === teacherId),
    [questions]
  );

  const getAnswersByQuestion = useCallback(
    (questionId: string) => answers.filter((a) => a.questionId === questionId).sort((a, b) => b.score - a.score),
    [answers]
  );

  const getTopAnswersByClass = useCallback(
    (classId: string) => {
      const ids = new Set(questions.filter((q) => q.classId === classId).map((q) => q.id));
      return answers.filter((a) => ids.has(a.questionId)).sort((a, b) => b.score - a.score).slice(0, 10);
    },
    [questions, answers]
  );

  const getUserVote = useCallback(
    (answerId: string) => {
      if (!currentUser) return 0;
      return votes.find((v) => v.userId === currentUser.id && v.targetId === answerId)?.value ?? 0;
    },
    [currentUser, votes]
  );

  const getClassById = useCallback(
    (classId: string) => classes.find((c) => c.id === classId),
    [classes]
  );

  const getTeacherById = useCallback(
    (teacherId: string) => teachers.find((t) => t.id === teacherId),
    [teachers]
  );

  const getUserById = useCallback(
    (userId: string): User | undefined => {
      const cached = userCache.get(userId);
      if (cached) return cached;
      supabase.from("users").select("*").eq("id", userId).single().then(({ data }) => {
        if (data) setUserCache((prev) => new Map(prev).set(userId, toUser(data)));
      });
      return undefined;
    },
    [userCache]
  );

  const getQuestionById = useCallback(
    (questionId: string) => questions.find((q) => q.id === questionId),
    [questions]
  );

  const getLinkedPostCount = useCallback(
    (type: "class" | "teacher", id: string) => {
      if (type === "class") return questions.filter((q) => q.classId === id).length;
      return questions.filter((q) => q.teacherId === id).length;
    },
    [questions]
  );

  const getLinkedRatingCount = useCallback(
    (teacherId: string) => teacherRatings.filter((r) => r.teacherId === teacherId).length,
    [teacherRatings]
  );

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        school,
        classes,
        teachers,
        questions,
        answers,
        votes,
        reports,
        teacherRatings,
        isLoading,
        login,
        logout,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        addAnswer,
        vote,
        report,
        createClass,
        updateClass,
        deleteClass,
        createTeacher,
        updateTeacher,
        deleteTeacher,
        submitTeacherRating,
        deleteRating,
        getTeacherRatingSummary,
        getUserRatingForTeacher,
        getRatingsForTeacher,
        getQuestionsByClass,
        getQuestionsByTeacher,
        getAnswersByQuestion,
        getTopAnswersByClass,
        getUserVote,
        getClassById,
        getTeacherById,
        getUserById,
        getQuestionById,
        getLinkedPostCount,
        getLinkedRatingCount,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
