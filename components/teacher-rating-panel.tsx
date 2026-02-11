"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { RateTeacherDialog } from "@/components/rate-teacher-dialog";
import type { Teacher } from "@/lib/mock";

interface TeacherRatingPanelProps {
  teacher: Teacher;
  className?: string;
}

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

export function TeacherRatingPanel({ teacher, className = "" }: TeacherRatingPanelProps) {
  const { getTeacherRatingSummary, getUserRatingForTeacher } = useStore();
  const summary = getTeacherRatingSummary(teacher.id);
  const userRating = getUserRatingForTeacher(teacher.id);

  // Empty state - no ratings yet
  if (!summary) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">RateMyTeacher</p>
          <CardTitle className="text-base font-semibold">{teacher.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-1">No ratings yet</p>
          <p className="text-xs text-muted-foreground mb-4">Be the first student to add a signal.</p>
          <RateTeacherDialog teacher={teacher} />
          <p className="text-xs text-muted-foreground mt-3">
            Ratings are anonymous, aggregated, and visible only within your school.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Has ratings
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">RateMyTeacher</p>
            <CardTitle className="text-base font-semibold">{teacher.name}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {summary.totalResponses} student {summary.totalResponses === 1 ? "response" : "responses"}
            </p>
          </div>
          <Badge className={`${getScoreColor(summary.overallScore)} text-sm font-semibold px-2 py-0.5`}>
            {summary.overallScore.toFixed(1)} / 10
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <RatingBar label="Difficulty" value={summary.avgDifficulty} />
        <RatingBar label="Grading Fairness" value={summary.avgFairness} />
        <RatingBar label="Workload Intensity" value={summary.avgWorkload} />

        <div className="pt-3 border-t border-border">
          <RateTeacherDialog
            teacher={teacher}
            trigger={
              <button className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-1">
                {userRating ? "Update my rating" : "Add my rating"}
              </button>
            }
          />
          <p className="text-xs text-muted-foreground leading-relaxed text-center mt-2">
            Quick signal only — no written reviews.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
