"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
  mockClasses,
  mockTeachers,
  mockUsers,
  initialQuestions,
  initialAnswers,
  generateId,
  generateAnonHandle,
} from "./mock";

/* ------------------------------------------------------------------ */
/* Persistence helpers                                                 */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "hallway_store";

interface PersistedState {
  classes: Class[];
  teachers: Teacher[];
  questions: Question[];
  answers: Answer[];
  votes: Vote[];
  reports: Report[];
  teacherRatings: TeacherRating[];
}

function loadState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function saveState(state: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full – silently ignore
  }
}

/* ------------------------------------------------------------------ */
/* Seed data (used only on first visit)                                */
/* ------------------------------------------------------------------ */

function seedState(): PersistedState {
  return {
    classes: mockClasses,
    teachers: mockTeachers,
    questions: initialQuestions,
    answers: initialAnswers,
    votes: [],
    reports: [],
    teacherRatings: [],
  };
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
  login: (email: string) => Promise<void>;
  logout: () => void;

  // Questions
  addQuestion: (data: { classId: string; teacherId?: string; title: string; body: string }) => Promise<Question>;
  updateQuestion: (id: string, data: { classId?: string; teacherId?: string; title?: string; body?: string }) => void;
  deleteQuestion: (id: string) => void;

  // Answers
  addAnswer: (questionId: string, body: string) => Promise<Answer>;
  vote: (answerId: string, value: 1 | -1) => Promise<void>;
  report: (targetType: "question" | "answer", targetId: string, reason: string) => Promise<void>;

  // Classes
  createClass: (data: { code: string; title: string }) => Class;
  updateClass: (id: string, data: { code?: string; title?: string }) => void;
  deleteClass: (id: string, strategy: "nullify" | "delete" | { reassignTo: string }) => void;

  // Teachers
  createTeacher: (data: { name: string }) => Teacher;
  updateTeacher: (id: string, data: { name?: string }) => void;
  deleteTeacher: (id: string, strategy: "nullify" | "delete" | { reassignTo: string }) => void;

  // Teacher Ratings
  submitTeacherRating: (teacherId: string, data: { difficulty: number; fairness: number; workload: number }) => Promise<void>;
  deleteRating: (ratingId: string) => void;
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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [teacherRatings, setTeacherRatings] = useState<TeacherRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ---- Hydrate from localStorage (or seed) on mount ----
  useEffect(() => {
    const stored = loadState();
    const data = stored ?? seedState();
    setClasses(data.classes);
    setTeachers(data.teachers);
    setQuestions(data.questions);
    setAnswers(data.answers);
    setVotes(data.votes);
    setReports(data.reports);
    setTeacherRatings(data.teacherRatings);

    // If first time, persist the seed
    if (!stored) saveState(data);

    // User session
    const storedUser = localStorage.getItem("hallway_user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("hallway_user");
      }
    }

    setIsLoading(false);
  }, []);

  // ---- Persist whenever data changes (skip initial empty state) ----
  useEffect(() => {
    if (isLoading) return;
    saveState({ classes, teachers, questions, answers, votes, reports, teacherRatings });
  }, [classes, teachers, questions, answers, votes, reports, teacherRatings, isLoading]);

  /* ============ AUTH ============ */

  const login = useCallback(async (email: string) => {
    setIsLoading(true);
    await delay(800);
    let user = mockUsers.find((u) => u.email === email);
    if (!user) {
      user = { id: generateId(), anonHandle: generateAnonHandle(), schoolId: mockSchool.id, email };
    }
    localStorage.setItem("hallway_user", JSON.stringify(user));
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("hallway_user");
    setCurrentUser(null);
  }, []);

  /* ============ CLASSES CRUD ============ */

  const createClass = useCallback(
    (data: { code: string; title: string }): Class => {
      const c: Class = { id: generateId(), schoolId: mockSchool.id, code: data.code, title: data.title };
      setClasses((prev) => [...prev, c]);
      return c;
    },
    []
  );

  const updateClass = useCallback(
    (id: string, data: { code?: string; title?: string }) => {
      setClasses((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, ...(data.code !== undefined && { code: data.code }), ...(data.title !== undefined && { title: data.title }) } : c
        )
      );
    },
    []
  );

  const deleteClass = useCallback(
    (id: string, strategy: "nullify" | "delete" | { reassignTo: string }) => {
      setClasses((prev) => prev.filter((c) => c.id !== id));
      if (strategy === "delete") {
        setQuestions((prev) => prev.filter((q) => q.classId !== id));
      } else if (strategy === "nullify") {
        setQuestions((prev) =>
          prev.map((q) => (q.classId === id ? { ...q, classId: "__deleted__" } : q))
        );
      } else {
        setQuestions((prev) =>
          prev.map((q) => (q.classId === id ? { ...q, classId: strategy.reassignTo } : q))
        );
      }
    },
    []
  );

  /* ============ TEACHERS CRUD ============ */

  const createTeacher = useCallback(
    (data: { name: string }): Teacher => {
      const t: Teacher = { id: generateId(), schoolId: mockSchool.id, name: data.name };
      setTeachers((prev) => [...prev, t]);
      return t;
    },
    []
  );

  const updateTeacher = useCallback(
    (id: string, data: { name?: string }) => {
      setTeachers((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...(data.name !== undefined && { name: data.name }) } : t))
      );
    },
    []
  );

  const deleteTeacher = useCallback(
    (id: string, strategy: "nullify" | "delete" | { reassignTo: string }) => {
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      // Clean up ratings
      setTeacherRatings((prev) => prev.filter((r) => r.teacherId !== id));
      if (strategy === "delete") {
        setQuestions((prev) => prev.filter((q) => q.teacherId !== id));
      } else if (strategy === "nullify") {
        setQuestions((prev) =>
          prev.map((q) => (q.teacherId === id ? { ...q, teacherId: undefined } : q))
        );
      } else {
        setQuestions((prev) =>
          prev.map((q) => (q.teacherId === id ? { ...q, teacherId: strategy.reassignTo } : q))
        );
      }
    },
    []
  );

  /* ============ QUESTIONS CRUD ============ */

  const addQuestion = useCallback(
    async (data: { classId: string; teacherId?: string; title: string; body: string }) => {
      if (!currentUser) throw new Error("Not logged in");
      await delay(300);
      const question: Question = {
        id: generateId(),
        userId: currentUser.id,
        schoolId: currentUser.schoolId,
        classId: data.classId,
        teacherId: data.teacherId,
        title: data.title,
        body: data.body,
        createdAt: new Date().toISOString(),
      };
      setQuestions((prev) => [question, ...prev]);
      return question;
    },
    [currentUser]
  );

  const updateQuestion = useCallback(
    (id: string, data: { classId?: string; teacherId?: string; title?: string; body?: string }) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...data } : q))
      );
    },
    []
  );

  const deleteQuestion = useCallback(
    (id: string) => {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      setAnswers((prev) => prev.filter((a) => a.questionId !== id));
    },
    []
  );

  /* ============ ANSWERS + VOTES + REPORTS ============ */

  const addAnswer = useCallback(
    async (questionId: string, body: string) => {
      if (!currentUser) throw new Error("Not logged in");
      await delay(300);
      const answer: Answer = {
        id: generateId(),
        questionId,
        userId: currentUser.id,
        body,
        score: 0,
        createdAt: new Date().toISOString(),
      };
      setAnswers((prev) => [answer, ...prev]);
      return answer;
    },
    [currentUser]
  );

  const vote = useCallback(
    async (answerId: string, value: 1 | -1) => {
      if (!currentUser) throw new Error("Not logged in");
      await delay(100);
      setVotes((prev) => {
        const existingIndex = prev.findIndex((v) => v.userId === currentUser.id && v.targetId === answerId);
        const newVotes = [...prev];
        let scoreDelta: number = value;
        if (existingIndex >= 0) {
          const existing = prev[existingIndex];
          if (existing.value === value) {
            newVotes.splice(existingIndex, 1);
            scoreDelta = -value;
          } else {
            newVotes[existingIndex] = { ...existing, value };
            scoreDelta = value * 2;
          }
        } else {
          newVotes.push({ userId: currentUser.id, targetType: "answer", targetId: answerId, value });
        }
        setAnswers((prevAnswers) =>
          prevAnswers.map((a) => (a.id === answerId ? { ...a, score: a.score + scoreDelta } : a))
        );
        return newVotes;
      });
    },
    [currentUser]
  );

  const report = useCallback(
    async (targetType: "question" | "answer", targetId: string, reason: string) => {
      if (!currentUser) throw new Error("Not logged in");
      await delay(200);
      const newReport: Report = { id: generateId(), reporterId: currentUser.id, targetType, targetId, reason, createdAt: new Date().toISOString() };
      setReports((prev) => [...prev, newReport]);
    },
    [currentUser]
  );

  /* ============ TEACHER RATINGS ============ */

  const submitTeacherRating = useCallback(
    async (teacherId: string, data: { difficulty: number; fairness: number; workload: number }) => {
      if (!currentUser) throw new Error("Not logged in");
      await delay(200);
      setTeacherRatings((prev) => {
        const existingIndex = prev.findIndex((r) => r.teacherId === teacherId && r.userId === currentUser.id);
        const rating: TeacherRating = {
          id: existingIndex >= 0 ? prev[existingIndex].id : generateId(),
          teacherId,
          userId: currentUser.id,
          difficulty: data.difficulty,
          fairness: data.fairness,
          workload: data.workload,
          createdAt: new Date().toISOString(),
        };
        if (existingIndex >= 0) {
          const newRatings = [...prev];
          newRatings[existingIndex] = rating;
          return newRatings;
        }
        return [...prev, rating];
      });
    },
    [currentUser]
  );

  const deleteRating = useCallback((ratingId: string) => {
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
      const overallScore = ((avgDifficulty + avgFairness + avgWorkload) / 3) * 2;
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
      return teacherRatings.find((r) => r.teacherId === teacherId && r.userId === currentUser.id) || null;
    },
    [currentUser, teacherRatings]
  );

  const getRatingsForTeacher = useCallback(
    (teacherId: string): TeacherRating[] => {
      return teacherRatings.filter((r) => r.teacherId === teacherId);
    },
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
      const classQuestionIds = questions.filter((q) => q.classId === classId).map((q) => q.id);
      return answers.filter((a) => classQuestionIds.includes(a.questionId)).sort((a, b) => b.score - a.score).slice(0, 10);
    },
    [questions, answers]
  );

  const getUserVote = useCallback(
    (answerId: string) => {
      if (!currentUser) return 0;
      const v = votes.find((v) => v.userId === currentUser.id && v.targetId === answerId);
      return v?.value ?? 0;
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
    (userId: string) => mockUsers.find((u) => u.id === userId),
    []
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
        school: mockSchool,
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
