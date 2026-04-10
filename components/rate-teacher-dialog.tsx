"use client";

import React from "react"

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import type { Teacher } from "@/lib/mock";

interface RateTeacherDialogProps {
  teacher: Teacher;
  trigger?: React.ReactNode;
}

export function RateTeacherDialog({ teacher, trigger }: RateTeacherDialogProps) {
  const { submitTeacherRating, getUserRatingForTeacher } = useStore();
  const existingRating = getUserRatingForTeacher(teacher.id);
  
  const [open, setOpen] = useState(false);
  const [difficulty, setDifficulty] = useState<string>(
    existingRating?.difficulty.toString() || ""
  );
  const [fairness, setFairness] = useState<string>(
    existingRating?.fairness.toString() || ""
  );
  const [workload, setWorkload] = useState<string>(
    existingRating?.workload.toString() || ""
  );
  const [comment, setComment] = useState(existingRating?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!difficulty || !fairness || !workload) return;
    
    setIsSubmitting(true);
    try {
      await submitTeacherRating(teacher.id, {
        difficulty: parseInt(difficulty),
        fairness: parseInt(fairness),
        workload: parseInt(workload),
        comment: comment.trim() || undefined,
      });
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = difficulty && fairness && workload;

  const ratingOptions = [
    { value: "1", label: "1 - Very Low" },
    { value: "2", label: "2 - Low" },
    { value: "3", label: "3 - Moderate" },
    { value: "4", label: "4 - High" },
    { value: "5", label: "5 - Very High" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-xs">
            {existingRating ? "Update my rating" : "Add first rating"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Rate {teacher.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Ratings are anonymous and visible only within your school.
          </p>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="difficulty" className="text-sm font-medium">
              Difficulty
            </Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Select difficulty level" />
              </SelectTrigger>
              <SelectContent>
                {ratingOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fairness" className="text-sm font-medium">
              Grading Fairness
            </Label>
            <Select value={fairness} onValueChange={setFairness}>
              <SelectTrigger id="fairness">
                <SelectValue placeholder="Select fairness level" />
              </SelectTrigger>
              <SelectContent>
                {ratingOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workload" className="text-sm font-medium">
              Workload Intensity
            </Label>
            <Select value={workload} onValueChange={setWorkload}>
              <SelectTrigger id="workload">
                <SelectValue placeholder="Select workload level" />
              </SelectTrigger>
              <SelectContent>
                {ratingOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium">
              Your thoughts <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="comment"
              placeholder="What should students know about this teacher?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{comment.length}/500</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid || isSubmitting}
            className="w-full"
          >
            {isSubmitting 
              ? "Submitting..." 
              : existingRating 
                ? "Update rating" 
                : "Submit rating"
            }
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            One rating per teacher. You can update it anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
