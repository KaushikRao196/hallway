export interface School {
  id: string;
  name: string;
  domain: string;
}

export interface User {
  id: string;
  anonHandle: string;
  schoolId: string;
  email: string;
}

export interface Class {
  id: string;
  schoolId: string;
  code: string;
  title: string;
}

export interface Teacher {
  id: string;
  schoolId: string;
  name: string;
}

export interface Question {
  id: string;
  userId: string;
  schoolId: string;
  classId: string;
  teacherId?: string;
  title: string;
  body: string;
  createdAt: string;
}

export interface Answer {
  id: string;
  questionId: string;
  userId: string;
  body: string;
  score: number;
  createdAt: string;
}

export interface Vote {
  userId: string;
  targetType: "answer";
  targetId: string;
  value: -1 | 1;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: "question" | "answer";
  targetId: string;
  reason: string;
  createdAt: string;
}

export interface TeacherRating {
  id: string;
  teacherId: string;
  userId: string;
  difficulty: number; // 1-5
  fairness: number; // 1-5
  workload: number; // 1-5
  createdAt: string;
}

export interface TeacherRatingSummary {
  teacherId: string;
  avgDifficulty: number;
  avgFairness: number;
  avgWorkload: number;
  overallScore: number; // out of 10
  totalResponses: number;
}

// Utility functions
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function generateAnonHandle(): string {
  const adjectives = ["Blue", "Green", "Red", "Swift", "Calm", "Bright", "Silent", "Happy", "Wise", "Bold"];
  const animals = ["Panda", "Tiger", "Eagle", "Dolphin", "Fox", "Owl", "Bear", "Wolf", "Hawk", "Deer"];
  const number = Math.floor(Math.random() * 1000);
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `${adj}${animal}${number}`;
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

// Mock data
export const mockSchool: School = {
  id: "school-1",
  name: "Irving High School",
  domain: "irving.edu",
};

export const mockClasses: Class[] = [
  { id: "class-1", schoolId: "school-1", code: "MATH101", title: "Algebra I" },
  { id: "class-2", schoolId: "school-1", code: "MATH201", title: "Calculus AB" },
  { id: "class-3", schoolId: "school-1", code: "ENG101", title: "English Literature" },
  { id: "class-4", schoolId: "school-1", code: "SCI101", title: "Biology" },
  { id: "class-5", schoolId: "school-1", code: "HIST101", title: "World History" },
  { id: "class-6", schoolId: "school-1", code: "CS101", title: "Intro to Computer Science" },
];

export const mockTeachers: Teacher[] = [
  { id: "teacher-1", schoolId: "school-1", name: "Mr. Johnson" },
  { id: "teacher-2", schoolId: "school-1", name: "Ms. Rodriguez" },
  { id: "teacher-3", schoolId: "school-1", name: "Dr. Chen" },
  { id: "teacher-4", schoolId: "school-1", name: "Mrs. Thompson" },
  { id: "teacher-5", schoolId: "school-1", name: "Mr. Williams" },
];

export const mockUsers: User[] = [
  { id: "user-1", anonHandle: "BluePanda482", schoolId: "school-1", email: "student1@irving.edu" },
  { id: "user-2", anonHandle: "SwiftEagle123", schoolId: "school-1", email: "student2@irving.edu" },
  { id: "user-3", anonHandle: "CalmDolphin789", schoolId: "school-1", email: "student3@irving.edu" },
  { id: "user-4", anonHandle: "WiseOwl456", schoolId: "school-1", email: "student4@irving.edu" },
];

// Do not seed or hardcode any teacher ratings.
// All ratings must be user-generated during runtime and persisted in localStorage.

export const initialQuestions: Question[] = [
  {
    id: "q-1",
    userId: "user-2",
    schoolId: "school-1",
    classId: "class-1",
    teacherId: "teacher-1",
    title: "How hard are Mr. Johnson's tests compared to the homework?",
    body: "I'm doing fine on homework but worried about the midterm. Does he test on stuff that wasn't covered in class? Any surprises to watch out for?",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "q-2",
    userId: "user-3",
    schoolId: "school-1",
    classId: "class-3",
    teacherId: "teacher-4",
    title: "What actually determines your grade in Mrs. Thompson's English class?",
    body: "I hear participation matters a lot but is it really about talking in class or is the essay grading where it counts? How strict is she on formatting?",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "q-3",
    userId: "user-4",
    schoolId: "school-1",
    classId: "class-2",
    teacherId: "teacher-2",
    title: "Is Ms. Rodriguez's Calc AB manageable with 3 other APs?",
    body: "I'm signed up for AP Bio, APUSH, and AP Lang next year. Is her workload intense enough that I should drop one? How many hours of homework per night?",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "q-4",
    userId: "user-1",
    schoolId: "school-1",
    classId: "class-4",
    teacherId: "teacher-3",
    title: "If you don't get Dr. Chen for Bio, should you switch sections?",
    body: "I got assigned to a different teacher but everyone says Dr. Chen is the best. Is it worth the hassle to try to switch? What makes him so different?",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "q-5",
    userId: "user-2",
    schoolId: "school-1",
    classId: "class-6",
    teacherId: "teacher-5",
    title: "Does Mr. Williams curve the final in CS101?",
    body: "The class average on the midterm was rough. Does he typically curve at the end? What's the realistic grade distribution look like?",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "q-6",
    userId: "user-4",
    schoolId: "school-1",
    classId: "class-5",
    title: "Best time of year to take World History?",
    body: "Is there a difference between fall and spring semester? I heard the workload is lighter in spring because of testing schedule.",
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
];

export const initialAnswers: Answer[] = [
  {
    id: "a-1",
    questionId: "q-1",
    userId: "user-4",
    body: "His tests are definitely harder than homework. He throws in 1-2 'challenge problems' that weren't in any examples. Focus on understanding the concepts deeply, not just memorizing steps. The good news is he gives partial credit if you show your work.",
    score: 12,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a-2",
    questionId: "q-1",
    userId: "user-3",
    body: "Go to his office hours before the midterm! He basically hints at what types of problems will be on the test. Also, the review packet he gives out is very similar to the actual test format.",
    score: 8,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "a-3",
    questionId: "q-2",
    userId: "user-1",
    body: "Participation is like 15% but she really notices who speaks up. For essays, she cares way more about your thesis being original than perfect grammar. Use MLA format strictly though - she will dock points for wrong margins.",
    score: 15,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a-4",
    questionId: "q-3",
    userId: "user-1",
    body: "Honestly, it's doable but expect 1.5-2 hours of calc homework most nights. Her problem sets are long but she doesn't grade every problem - she randomly picks 5 to check. The real time sink is her weekly quizzes which require serious prep.",
    score: 20,
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a-5",
    questionId: "q-4",
    userId: "user-2",
    body: "100% worth switching if you can. Dr. Chen actually explains the 'why' behind everything. His tests are harder but he curves generously and writes amazing rec letters. Other bio teachers just have you memorize from the textbook.",
    score: 18,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a-6",
    questionId: "q-5",
    userId: "user-4",
    body: "He curved by about 8% last semester. But honestly the projects matter more than tests - he weights those heavily. If you do well on the final project, you can recover from a bad midterm. Class average usually ends up around B-.",
    score: 10,
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a-7",
    questionId: "q-6",
    userId: "user-3",
    body: "Spring is definitely easier because the AP testing window means teachers rush through less content. Fall semester covers more chapters but you have more time. I'd do spring if you're taking other hard classes.",
    score: 7,
    createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
  },
];
