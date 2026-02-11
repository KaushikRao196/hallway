"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatTimeAgo, type Question } from "@/lib/mock";

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const { getClassById, getTeacherById, getAnswersByQuestion } = useStore();

  const classInfo = getClassById(question.classId);
  const teacher = question.teacherId ? getTeacherById(question.teacherId) : null;
  const answers = getAnswersByQuestion(question.id);

  return (
    <Link href={`/q/${question.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs font-medium">
              {classInfo?.code || "Unknown"}
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
        </CardContent>
      </Card>
    </Link>
  );
}
