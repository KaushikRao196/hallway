"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { AuthGuard } from "@/components/auth-guard";
import { BottomNav } from "@/components/bottom-nav";
import { TopHeader } from "@/components/top-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Pencil, Trash2, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RateTeacherDialog } from "@/components/rate-teacher-dialog";
import { TeacherFormDialog } from "@/components/teacher-form-dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { EmptyState } from "@/components/empty-state";
import type { Teacher } from "@/lib/mock";

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

  const [formOpen, setFormOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);

  const sortedTeachers = useMemo(() => {
    return [...teachers].sort((a, b) => a.name.localeCompare(b.name));
  }, [teachers]);

  const handleEdit = (t: Teacher) => {
    setEditTeacher(t);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditTeacher(null);
    setFormOpen(true);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20">
        <TopHeader />

        <main className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                RateMyTeacher <span className="text-sm font-normal text-muted-foreground">(School-only)</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Aggregated, anonymous signals from students.
              </p>
            </div>
            <Button size="sm" onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-1" />
              Add Teacher
            </Button>
          </div>

          {sortedTeachers.length === 0 ? (
            <div className="mt-4">
              <EmptyState type="no-questions" />
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {sortedTeachers.map((teacher) => {
                const summary = getTeacherRatingSummary(teacher.id);
                const userRating = getUserRatingForTeacher(teacher.id);

                if (!summary) {
                  return (
                    <Card key={teacher.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <Link href={`/teacher/${teacher.id}`} className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground mb-2">{teacher.name}</h3>
                          </Link>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(teacher)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setDeleteTarget(teacher)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Link href={`/teacher/${teacher.id}`}>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </Link>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          No ratings yet. Be the first student to add a signal.
                        </p>
                        <RateTeacherDialog teacher={teacher} />
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <Card key={teacher.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <Link href={`/teacher/${teacher.id}`} className="min-w-0 flex-1">
                          <h3 className="font-medium text-foreground truncate">{teacher.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {summary.totalResponses} {summary.totalResponses === 1 ? "response" : "responses"}
                          </p>
                        </Link>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Badge className={`${getScoreColor(summary.overallScore)} text-base font-semibold px-3 py-1`}>
                            {summary.overallScore.toFixed(1)}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(teacher)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteTarget(teacher)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Link href={`/teacher/${teacher.id}`}>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </Link>
                        </div>
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
          )}

          <p className="text-xs text-muted-foreground text-center mt-6">
            Quick signal only -- no written reviews. Scores based on difficulty, fairness, and workload.
          </p>
        </main>

        <TeacherFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          editTeacher={editTeacher}
        />

        {deleteTarget && (
          <ConfirmDeleteDialog
            open={!!deleteTarget}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
            type="teacher"
            id={deleteTarget.id}
            name={deleteTarget.name}
          />
        )}

        <BottomNav />
      </div>
    </AuthGuard>
  );
}
