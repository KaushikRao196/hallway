"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";
import { AuthGuard } from "@/components/auth-guard";
import { TopHeader } from "@/components/top-header";
import { BottomNav } from "@/components/bottom-nav";
import { ClassFormDialog } from "@/components/class-form-dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { EmptyState } from "@/components/empty-state";
import type { Class } from "@/lib/mock";

export default function ClassesPage() {
  const { classes, getQuestionsByClass } = useStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editClass, setEditClass] = useState<Class | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Class | null>(null);

  const handleEdit = (c: Class) => {
    setEditClass(c);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditClass(null);
    setFormOpen(true);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20">
        <TopHeader />

        <main className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">All Classes</h2>
            <Button size="sm" onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-1" />
              Add Class
            </Button>
          </div>

          {classes.length === 0 ? (
            <EmptyState type="no-questions" />
          ) : (
            <div className="space-y-2">
              {classes.map((classItem) => {
                const questionCount = getQuestionsByClass(classItem.id).length;

                return (
                  <Card key={classItem.id} className="transition-shadow hover:shadow-md">
                    <CardContent className="p-4 flex items-center justify-between">
                      <Link href={`/class/${classItem.id}`} className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">{classItem.code}</span>
                          <Badge variant="secondary" className="text-xs">
                            {questionCount} {questionCount === 1 ? "question" : "questions"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {classItem.title}
                        </p>
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
                            <DropdownMenuItem onClick={() => handleEdit(classItem)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteTarget(classItem)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Link href={`/class/${classItem.id}`}>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>

        <ClassFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          editClass={editClass}
        />

        {deleteTarget && (
          <ConfirmDeleteDialog
            open={!!deleteTarget}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
            type="class"
            id={deleteTarget.id}
            name={`${deleteTarget.code} - ${deleteTarget.title}`}
          />
        )}

        <BottomNav />
      </div>
    </AuthGuard>
  );
}
