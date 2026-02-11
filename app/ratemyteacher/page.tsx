"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { AuthGuard } from "@/components/auth-guard";
import { BottomNav } from "@/components/bottom-nav";
import { TopHeader } from "@/components/top-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RateTeacherDialog } from "@/components/rate-teacher-dialog";

function RatingBar({ value, max = 5 }: { value: number; max?: number }) {
  const percentage = (value / max) * 100;
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-foreground/60 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-6 text-right">{value.toFixed(1)}</span>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 7) return "bg-emerald-100 text-emerald-800";
  if (score >= 5) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

export default function RateMyTeacherPage() {
  const { teachers, getTeacherRatingSummary, getUserRatingForTeacher } = useStore();

  // Sort teachers alphabetically
  const sortedTeachers = useMemo(() => {
    return [...teachers].sort((a, b) => a.name.localeCompare(b.name));
  }, [teachers]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20">
        <TopHeader />

        <main className="max-w-lg mx-auto px-4 py-4">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-1">
              RateMyTeacher <span className="text-sm font-normal text-muted-foreground">(School-only)</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Aggregated, anonymous signals from students who've taken the class.
            </p>
          </div>

          <div className="space-y-3">
            {sortedTeachers.map((teacher) => {
              const summary = getTeacherRatingSummary(teacher.id);
              const userRating = getUserRatingForTeacher(teacher.id);

              // Teacher with NO ratings - empty state
              if (!summary) {
                return (
                  <Card key={teacher.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <h3 className="font-medium text-foreground mb-2">{teacher.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        No ratings yet<br />
                        <span className="text-xs">Be the first student to add a signal.</span>
                      </p>
                      <RateTeacherDialog teacher={teacher} />
                      <p className="text-xs text-muted-foreground mt-3">
                        Ratings are anonymous, aggregated, and visible only within your school.
                      </p>
                    </CardContent>
                  </Card>
                );
              }

              // Teacher WITH ratings
              return (
                <Card key={teacher.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="min-w-0">
                        <h3 className="font-medium text-foreground truncate">{teacher.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {summary.totalResponses} student {summary.totalResponses === 1 ? "response" : "responses"}
                        </p>
                      </div>
                      <Badge className={`${getScoreColor(summary.overallScore)} text-base font-semibold px-3 py-1`}>
                        {summary.overallScore.toFixed(1)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-20">Difficulty</span>
                        <RatingBar value={summary.avgDifficulty} />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-20">Fairness</span>
                        <RatingBar value={summary.avgFairness} />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-20">Workload</span>
                        <RatingBar value={summary.avgWorkload} />
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-border">
                      <RateTeacherDialog 
                        teacher={teacher} 
                        trigger={
                          <button className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
                            {userRating ? "Update my rating" : "Add my rating"}
                          </button>
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Quick signal only — no written reviews. Scores based on difficulty, fairness, and workload.
          </p>
        </main>

        <BottomNav />
      </div>
    </AuthGuard>
  );
}
