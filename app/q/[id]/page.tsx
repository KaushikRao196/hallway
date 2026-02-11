"use client";

import React from "react";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Flag, Send } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatTimeAgo } from "@/lib/mock";
import { AuthGuard } from "@/components/auth-guard";
import { BottomNav } from "@/components/bottom-nav";
import { AnswerCard } from "@/components/answer-card";
import { EmptyState } from "@/components/empty-state";
import { ReportDialog } from "@/components/report-dialog";
import { TeacherRatingPanel } from "@/components/teacher-rating-panel";

export default function QuestionPage() {
  const params = useParams();
  const questionId = params.id as string;

  const {
    getQuestionById,
    getClassById,
    getTeacherById,
    getUserById,
    getAnswersByQuestion,
    addAnswer,
    currentUser,
  } = useStore();

  const [answerBody, setAnswerBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const question = getQuestionById(questionId);
  const classInfo = question ? getClassById(question.classId) : null;
  const teacher = question?.teacherId ? getTeacherById(question.teacherId) : null;
  const author = question ? getUserById(question.userId) : null;
  const answers = getAnswersByQuestion(questionId);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerBody.trim() || !currentUser) return;

    setIsSubmitting(true);
    await addAnswer(questionId, answerBody.trim());
    setAnswerBody("");
    setIsSubmitting(false);
  };

  if (!question) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold mb-2">Question not found</h1>
            <Link href="/feed">
              <Button variant="outline">Back to Feed</Button>
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
          <div className="flex items-center h-14 px-4 max-w-4xl mx-auto">
            <Link href="/feed">
              <Button variant="ghost" size="icon" className="h-8 w-8 mr-2">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <h1 className="font-semibold text-lg truncate">Question</h1>
          </div>
        </header>

        {/* Teacher Rating Panel - Mobile (below header) */}
        {teacher && (
          <div className="lg:hidden border-b border-border bg-muted/30 px-4 py-3">
            <TeacherRatingPanel teacher={teacher} className="border-0 shadow-none bg-transparent" />
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 py-4 flex gap-6">
          {/* Main Content */}
          <main className="flex-1 max-w-lg space-y-4">
            {/* Question Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Link href={`/class/${question.classId}`}>
                    <Badge variant="secondary" className="text-xs font-medium hover:bg-secondary/80">
                      {classInfo?.code || "Unknown"}
                    </Badge>
                  </Link>
                  {teacher && (
                    <Badge variant="outline" className="text-xs bg-transparent">
                      {teacher.name}
                    </Badge>
                  )}
                </div>

                <h1 className="text-xl font-semibold text-foreground leading-tight mb-3">
                  {question.title}
                </h1>

                {question.body && (
                  <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap mb-4">
                    {question.body}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{author?.anonHandle || "Anonymous"}</span>
                    <span>·</span>
                    <span>{formatTimeAgo(question.createdAt)}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setReportOpen(true)}
                  >
                    <Flag className="h-4 w-4 mr-1" />
                    Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Answer Composer */}
            <Card>
              <CardContent className="p-4">
                <form onSubmit={handleSubmitAnswer}>
                  <Textarea
                    placeholder="Write your answer..."
                    value={answerBody}
                    onChange={(e) => setAnswerBody(e.target.value)}
                    rows={3}
                    className="mb-3"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={!answerBody.trim() || isSubmitting}
                      size="sm"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      {isSubmitting ? "Posting..." : "Post Answer"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Answers Section */}
            <div>
              <h2 className="font-semibold text-foreground mb-3">
                {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
              </h2>

              {answers.length > 0 ? (
                <div className="space-y-3">
                  {answers.map((answer) => (
                    <AnswerCard key={answer.id} answer={answer} />
                  ))}
                </div>
              ) : (
                <EmptyState type="no-answers" />
              )}
            </div>
          </main>

          {/* Sidebar - Teacher Rating Panel (Desktop) */}
          {teacher && (
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-20">
                <TeacherRatingPanel teacher={teacher} />
              </div>
            </aside>
          )}
        </div>

        <BottomNav />

        <ReportDialog
          open={reportOpen}
          onOpenChange={setReportOpen}
          targetType="question"
          targetId={question.id}
        />
      </div>
    </AuthGuard>
  );
}
