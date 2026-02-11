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
  addQuestion: (data: { classId: string; teacherId?: string; title: string; body: string }) => Promise<Question>;
  addAnswer: (questionId: string, body: string) => Promise<Answer>;
  vote: (answerId: string, value: 1 | -1) => Promise<void>;
  report: (targetType: "question" | "answer", targetId: string, reason: string) => Promise<void>;
  submitTeacherRating: (teacherId: string, data: { difficulty: number; fairness: number; workload: number }) => Promise<void>;
  getTeacherRatingSummary: (teacherId: string) => TeacherRatingSummary | null;
  getUserRatingForTeacher: (teacherId: string) => TeacherRating | null;
  getQuestionsByClass: (classId: string) => Question[];
  getAnswersByQuestion: (questionId: string) => Answer[];
  getTopAnswersByClass: (classId: string) => Answer[];
  getUserVote: (answerId: string) => number;
  getClassById: (classId: string) => Class | undefined;
  getTeacherById: (teacherId: string) => Teacher | undefined;
  getUserById: (userId: string) => User | undefined;
  getQuestionById: (questionId: string) => Question | undefined;
}

const StoreContext = createContext<(StoreState & StoreActions) | null>(null);

// Simulate async delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [teacherRatings, setTeacherRatings] = useState<TeacherRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user and ratings from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("hallway_user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("hallway_user");
      }
    }
    
    // Load teacher ratings from localStorage
    const storedRatings = localStorage.getItem("hallway_teacher_ratings");
    if (storedRatings) {
      try {
        setTeacherRatings(JSON.parse(storedRatings));
      } catch {
        localStorage.removeItem("hallway_teacher_ratings");
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string) => {
    setIsLoading(true);
    await delay(800); // Simulate network delay

    // Check if user exists or create new
    let user = mockUsers.find((u) => u.email === email);
    if (!user) {
      user = {
        id: generateId(),
        anonHandle: generateAnonHandle(),
        schoolId: mockSchool.id,
        email,
      };
    }

    localStorage.setItem("hallway_user", JSON.stringify(user));
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("hallway_user");
    setCurrentUser(null);
  }, []);

  const addQuestion = useCallback(
    async (data: { classId: string; teacherId?: string; title: string; body: string }) => {
      if (!currentUser) throw new Error("Not logged in");
      await delay(500);

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

  const addAnswer = useCallback(
    async (questionId: string, body: string) => {
      if (!currentUser) throw new Error("Not logged in");
      await delay(500);

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
      await delay(200);

      setVotes((prev) => {
        const existingIndex = prev.findIndex(
          (v) => v.userId === currentUser.id && v.targetId === answerId
        );

        let newVotes = [...prev];
        let scoreDelta = value;

        if (existingIndex >= 0) {
          const existing = prev[existingIndex];
          if (existing.value === value) {
            // Remove vote (toggle off)
            newVotes.splice(existingIndex, 1);
            scoreDelta = -value;
          } else {
            // Change vote
            newVotes[existingIndex] = { ...existing, value };
            scoreDelta = value * 2;
          }
        } else {
          // New vote
          newVotes.push({
            userId: currentUser.id,
            targetType: "answer",
            targetId: answerId,
            value,
          });
        }

        // Update answer score
        setAnswers((prevAnswers) =>
          prevAnswers.map((a) =>
            a.id === answerId ? { ...a, score: a.score + scoreDelta } : a
          )
        );

        return newVotes;
      });
    },
    [currentUser]
  );

  const report = useCallback(
    async (targetType: "question" | "answer", targetId: string, reason: string) => {
      if (!currentUser) throw new Error("Not logged in");
      await delay(300);

      const newReport: Report = {
        id: generateId(),
        reporterId: currentUser.id,
        targetType,
        targetId,
        reason,
        createdAt: new Date().toISOString(),
      };

      setReports((prev) => [...prev, newReport]);
    },
    [currentUser]
  );

  const submitTeacherRating = useCallback(
    async (teacherId: string, data: { difficulty: number; fairness: number; workload: number }) => {
      if (!currentUser) throw new Error("Not logged in");
      await delay(300);

      setTeacherRatings((prev) => {
        // Check if user already rated this teacher
        const existingIndex = prev.findIndex(
          (r) => r.teacherId === teacherId && r.userId === currentUser.id
        );

        const rating: TeacherRating = {
          id: existingIndex >= 0 ? prev[existingIndex].id : generateId(),
          teacherId,
          userId: currentUser.id,
          difficulty: data.difficulty,
          fairness: data.fairness,
          workload: data.workload,
          createdAt: new Date().toISOString(),
        };

        let newRatings: TeacherRating[];
        if (existingIndex >= 0) {
          // Update existing rating
          newRatings = [...prev];
          newRatings[existingIndex] = rating;
        } else {
          // Add new rating
          newRatings = [...prev, rating];
        }

        // Persist to localStorage
        localStorage.setItem("hallway_teacher_ratings", JSON.stringify(newRatings));
        return newRatings;
      });
    },
    [currentUser]
  );

  const getTeacherRatingSummary = useCallback(
    (teacherId: string): TeacherRatingSummary | null => {
      const ratings = teacherRatings.filter((r) => r.teacherId === teacherId);
      if (ratings.length === 0) return null;

      const avgDifficulty = ratings.reduce((sum, r) => sum + r.difficulty, 0) / ratings.length;
      const avgFairness = ratings.reduce((sum, r) => sum + r.fairness, 0) / ratings.length;
      const avgWorkload = ratings.reduce((sum, r) => sum + r.workload, 0) / ratings.length;

      // Overall score = average of all three metrics * 2 (to get 0-10 scale)
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
      return teacherRatings.find(
        (r) => r.teacherId === teacherId && r.userId === currentUser.id
      ) || null;
    },
    [currentUser, teacherRatings]
  );

  const getQuestionsByClass = useCallback(
    (classId: string) => questions.filter((q) => q.classId === classId),
    [questions]
  );

  const getAnswersByQuestion = useCallback(
    (questionId: string) =>
      answers
        .filter((a) => a.questionId === questionId)
        .sort((a, b) => b.score - a.score),
    [answers]
  );

  const getTopAnswersByClass = useCallback(
    (classId: string) => {
      const classQuestionIds = questions
        .filter((q) => q.classId === classId)
        .map((q) => q.id);
      return answers
        .filter((a) => classQuestionIds.includes(a.questionId))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    },
    [questions, answers]
  );

  const getUserVote = useCallback(
    (answerId: string) => {
      if (!currentUser) return 0;
      const vote = votes.find(
        (v) => v.userId === currentUser.id && v.targetId === answerId
      );
      return vote?.value ?? 0;
    },
    [currentUser, votes]
  );

  const getClassById = useCallback(
    (classId: string) => mockClasses.find((c) => c.id === classId),
    []
  );

  const getTeacherById = useCallback(
    (teacherId: string) => mockTeachers.find((t) => t.id === teacherId),
    []
  );

  const getUserById = useCallback(
    (userId: string) => mockUsers.find((u) => u.id === userId),
    []
  );

  const getQuestionById = useCallback(
    (questionId: string) => questions.find((q) => q.id === questionId),
    [questions]
  );

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        school: mockSchool,
        classes: mockClasses,
        teachers: mockTeachers,
        questions,
        answers,
        votes,
        reports,
        teacherRatings,
        isLoading,
        login,
        logout,
        addQuestion,
        addAnswer,
        vote,
        report,
        submitTeacherRating,
        getTeacherRatingSummary,
        getUserRatingForTeacher,
        getQuestionsByClass,
        getAnswersByQuestion,
        getTopAnswersByClass,
        getUserVote,
        getClassById,
        getTeacherById,
        getUserById,
        getQuestionById,
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
