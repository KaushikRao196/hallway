"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Flag } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatTimeAgo, type Answer } from "@/lib/mock";
import { ReportDialog } from "./report-dialog";

interface AnswerCardProps {
  answer: Answer;
  showQuestion?: boolean;
}

export function AnswerCard({ answer, showQuestion }: AnswerCardProps) {
  const { getUserById, getUserVote, vote, currentUser, getQuestionById } = useStore();
  const [reportOpen, setReportOpen] = useState(false);

  const user = getUserById(answer.userId);
  const userVote = getUserVote(answer.id);
  const question = showQuestion ? getQuestionById(answer.questionId) : null;

  const handleVote = async (value: 1 | -1) => {
    if (!currentUser) return;
    await vote(answer.id, value);
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          {showQuestion && question && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
              Re: {question.title}
            </p>
          )}

          <div className="flex gap-3">
            {/* Vote buttons */}
            <div className="flex flex-col items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${userVote === 1 ? "text-primary bg-primary/10" : ""}`}
                onClick={() => handleVote(1)}
                disabled={!currentUser}
              >
                <ChevronUp className="h-5 w-5" />
              </Button>
              <span className="text-sm font-semibold tabular-nums">{answer.score}</span>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${userVote === -1 ? "text-destructive bg-destructive/10" : ""}`}
                onClick={() => handleVote(-1)}
                disabled={!currentUser}
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            </div>

            {/* Answer content */}
            <div className="flex-1 min-w-0">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {answer.body}
              </p>

              <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{user?.anonHandle || "Anonymous"}</span>
                  <span>·</span>
                  <span>{formatTimeAgo(answer.createdAt)}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setReportOpen(true)}
                  disabled={!currentUser}
                >
                  <Flag className="h-4 w-4 mr-1" />
                  Report
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        targetType="answer"
        targetId={answer.id}
      />
    </>
  );
}
