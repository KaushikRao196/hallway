"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatTimeAgo } from "@/lib/mock";
import { AuthGuard } from "@/components/auth-guard";
import { BottomNav } from "@/components/bottom-nav";
import { QuestionCard } from "@/components/question-card";
import { RateTeacherDialog } from "@/components/rate-teacher-dialog";
import { EmptyState } from "@/components/empty-state";

function RatingBar({ label, value, maxValue = 5 }: { label: string; value: number; maxValue?: number }) {
  const percentage = (value / maxValue) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-foreground/70 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 7) return "bg-emerald-100 text-emerald-800";
  if (score >= 5) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

export default function TeacherDetailPage() {
  const params = useParams();
  const teacherId = params.id as string;

  const {
    getTeacherById,
    getTeacherRatingSummary,
    getUserRatingForTeacher,
    getRatingsForTeacher,
    getQuestionsByTeacher,
    getUserById,
    deleteRating,
    currentUser,
  } = useStore();

  const teacher = getTeacherById(teacherId);
  const summary = getTeacherRatingSummary(teacherId);
  const userRating = getUserRatingForTeacher(teacherId);
  const ratings = getRatingsForTeacher(teacherId);
  const linkedQuestions = getQuestionsByTeacher(teacherId);

  const sortedQuestions = useMemo(() => {
    return [...linkedQuestions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [linkedQuestions]);

  if (!teacher) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold mb-2">Teacher not found</h1>
            <Link href="/ratemyteacher">
              <Button variant="outline">Back to Teachers</Button>
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
          <div className="flex items-center h-14 px-4 max-w-lg mx-auto">
            <Link href="/ratemyteacher">
              <Button variant="ghost" size="icon" className="h-8 w-8 mr-2">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-lg truncate">{teacher.name}</h1>
              <p className="text-xs text-muted-foreground">Teacher Detail</p>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
          {/* Rating Summary Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Rating Summary</p>
                  <CardTitle className="text-base font-semibold">{teacher.name}</CardTitle>
                  {summary && (
                    <p className="text-xs text-muted-foreground">
                      {summary.totalResponses} {summary.totalResponses === 1 ? "response" : "responses"}
                    </p>
                  )}
                </div>
                {summary && (
                  <Badge className={`${getScoreColor(summary.overallScore)} text-sm font-semibold px-2 py-0.5`}>
                    {summary.overallScore.toFixed(1)} / 10
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary ? (
                <>
                  <RatingBar label="Difficulty" value={summary.avgDifficulty} />
                  <RatingBar label="Grading Fairness" value={summary.avgFairness} />
                  <RatingBar label="Workload Intensity" value={summary.avgWorkload} />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No ratings yet. Be the first to add one.</p>
              )}

              <div className="pt-3 border-t border-border">
                <RateTeacherDialog
                  teacher={teacher}
                  trigger={
                    <Button variant="outline" size="sm" className="w-full">
                      {userRating ? "Update my rating" : "Rate this teacher"}
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="ratings" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="ratings">Ratings ({ratings.length})</TabsTrigger>
              <TabsTrigger value="questions">Questions ({sortedQuestions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="ratings" className="mt-4">
              {ratings.length > 0 ? (
                <div className="space-y-3">
                  {ratings.map((rating) => {
                    const ratingUser = getUserById(rating.userId);
                    const isOwn = currentUser?.id === rating.userId;

                    return (
                      <Card key={rating.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {ratingUser?.anonHandle || "Anonymous"}
                              </p>
                              <p className="text-xs text-muted-foreground">{formatTimeAgo(rating.createdAt)}</p>
                            </div>
                            {isOwn && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteRating(rating.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete rating</span>
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground text-xs">Difficulty</span>
                              <p className="font-medium">{rating.difficulty}/5</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs">Fairness</span>
                              <p className="font-medium">{rating.fairness}/5</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs">Workload</span>
                              <p className="font-medium">{rating.workload}/5</p>
                            </div>
                          </div>
                          {rating.comment && (
                            <p className="text-sm text-foreground/80 mt-3 pt-3 border-t border-border italic">
                              &ldquo;{rating.comment}&rdquo;
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <EmptyState type="no-answers" />
              )}
            </TabsContent>

            <TabsContent value="questions" className="mt-4">
              {sortedQuestions.length > 0 ? (
                <div className="space-y-3">
                  {sortedQuestions.map((question) => (
                    <QuestionCard key={question.id} question={question} />
                  ))}
                </div>
              ) : (
                <EmptyState type="no-questions" />
              )}
            </TabsContent>
          </Tabs>
        </main>

        <BottomNav />
      </div>
    </AuthGuard>
  );
}
