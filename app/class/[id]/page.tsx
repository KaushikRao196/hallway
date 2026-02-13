"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { AuthGuard } from "@/components/auth-guard";
import { BottomNav } from "@/components/bottom-nav";
import { QuestionCard } from "@/components/question-card";
import { AnswerCard } from "@/components/answer-card";
import { EmptyState } from "@/components/empty-state";
import { TeacherRatingPanel } from "@/components/teacher-rating-panel";

export default function ClassPage() {
  const params = useParams();
  const classId = params.id as string;

  const { getClassById, getQuestionsByClass, getTopAnswersByClass, teachers, getTeacherById } = useStore();

  const [teacherFilter, setTeacherFilter] = useState("all");

  const classInfo = getClassById(classId);
  const questions = getQuestionsByClass(classId);
  const topAnswers = getTopAnswersByClass(classId);

  const filteredQuestions = useMemo(() => {
    if (teacherFilter === "all") return questions;
    return questions.filter((q) => q.teacherId === teacherFilter);
  }, [questions, teacherFilter]);

  const selectedTeacher = teacherFilter !== "all" ? getTeacherById(teacherFilter) : null;

  if (!classInfo) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold mb-2">Class not found</h1>
            <Link href="/classes">
              <Button variant="outline">Back to Classes</Button>
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
          <div className="flex items-center h-14 px-4 max-w-4xl mx-auto">
            <Link href="/classes">
              <Button variant="ghost" size="icon" className="h-8 w-8 mr-2">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-lg truncate">{classInfo.code}</h1>
              <p className="text-xs text-muted-foreground truncate">{classInfo.title}</p>
            </div>
            <Link href="/ask">
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Ask
              </Button>
            </Link>
          </div>
        </header>

        {selectedTeacher && (
          <div className="lg:hidden border-b border-border bg-muted/30 px-4 py-3">
            <TeacherRatingPanel teacher={selectedTeacher} className="border-0 shadow-none bg-transparent" />
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 py-4 flex gap-6">
          <main className="flex-1 max-w-lg">
            <div className="mb-4">
              <Select value={teacherFilter} onValueChange={setTeacherFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Teachers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teachers</SelectItem>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="questions" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="top-answers">Top Answers</TabsTrigger>
              </TabsList>

              <TabsContent value="questions" className="mt-4">
                {filteredQuestions.length > 0 ? (
                  <div className="space-y-3">
                    {filteredQuestions.map((question) => (
                      <QuestionCard key={question.id} question={question} />
                    ))}
                  </div>
                ) : (
                  <EmptyState type="no-questions" />
                )}
              </TabsContent>

              <TabsContent value="top-answers" className="mt-4">
                {topAnswers.length > 0 ? (
                  <div className="space-y-3">
                    {topAnswers.map((answer) => (
                      <AnswerCard key={answer.id} answer={answer} showQuestion />
                    ))}
                  </div>
                ) : (
                  <EmptyState type="no-answers" />
                )}
              </TabsContent>
            </Tabs>
          </main>

          {selectedTeacher && (
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-20">
                <TeacherRatingPanel teacher={selectedTeacher} />
              </div>
            </aside>
          )}
        </div>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
