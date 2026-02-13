"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import type { Question } from "@/lib/mock";

interface QuestionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editQuestion: Question;
}

export function QuestionFormDialog({ open, onOpenChange, editQuestion }: QuestionFormDialogProps) {
  const { classes, teachers, updateQuestion } = useStore();
  const [classId, setClassId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (editQuestion) {
      setClassId(editQuestion.classId);
      setTeacherId(editQuestion.teacherId || "none");
      setTitle(editQuestion.title);
      setBody(editQuestion.body);
    }
  }, [editQuestion, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !title.trim()) return;

    updateQuestion(editQuestion.id, {
      classId,
      teacherId: teacherId === "none" ? undefined : teacherId,
      title: title.trim(),
      body: body.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-class">Class</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger id="edit-class">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.code} - {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-teacher">Teacher (optional)</Label>
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger id="edit-teacher">
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific teacher</SelectItem>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-body">Details</Label>
            <Textarea
              id="edit-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!classId || !title.trim()}>
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
