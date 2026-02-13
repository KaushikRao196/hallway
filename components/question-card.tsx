"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { formatTimeAgo, type Question } from "@/lib/mock";
import { QuestionFormDialog } from "@/components/question-form-dialog";

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const { getClassById, getTeacherById, getAnswersByQuestion, deleteQuestion, currentUser } = useStore();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const classInfo = getClassById(question.classId);
  const teacher = question.teacherId ? getTeacherById(question.teacherId) : null;
  const answers = getAnswersByQuestion(question.id);
  const isOwner = currentUser?.id === question.userId;

  const handleDelete = () => {
    deleteQuestion(question.id);
    setDeleteOpen(false);
  };

  return (
    <>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/q/${question.id}`} className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs font-medium">
                  {classInfo?.code || (question.classId === "__deleted__" ? "Deleted Class" : "Unknown")}
                </Badge>
                {teacher && (
                  <Badge variant="outline" className="text-xs bg-transparent">
                    {teacher.name}
                  </Badge>
                )}
              </div>

              <h3 className="font-semibold text-foreground leading-snug mb-2 line-clamp-2">
                {question.title}
              </h3>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{answers.length} {answers.length === 1 ? "answer" : "answers"}</span>
                </div>
                <span>{formatTimeAgo(question.createdAt)}</span>
              </div>
            </Link>

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => setDeleteOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>

      {editOpen && (
        <QuestionFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          editQuestion={question}
        />
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This will also remove all its answers. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
