"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import type { Teacher } from "@/lib/mock";

interface TeacherFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTeacher?: Teacher | null;
}

export function TeacherFormDialog({ open, onOpenChange, editTeacher }: TeacherFormDialogProps) {
  const { createTeacher, updateTeacher } = useStore();
  const [name, setName] = useState("");

  useEffect(() => {
    if (editTeacher) {
      setName(editTeacher.name);
    } else {
      setName("");
    }
  }, [editTeacher, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editTeacher) {
      updateTeacher(editTeacher.id, { name: name.trim() });
    } else {
      createTeacher({ name: name.trim() });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editTeacher ? "Edit Teacher" : "Add Teacher"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="teacher-name">Teacher Name</Label>
            <Input
              id="teacher-name"
              placeholder="e.g., Mr. Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {editTeacher ? "Save Changes" : "Add Teacher"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
