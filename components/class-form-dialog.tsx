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
import type { Class } from "@/lib/mock";

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editClass?: Class | null;
}

export function ClassFormDialog({ open, onOpenChange, editClass }: ClassFormDialogProps) {
  const { createClass, updateClass } = useStore();
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (editClass) {
      setCode(editClass.code);
      setTitle(editClass.title);
    } else {
      setCode("");
      setTitle("");
    }
  }, [editClass, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) return;

    if (editClass) {
      updateClass(editClass.id, { code: code.trim(), title: title.trim() });
    } else {
      createClass({ code: code.trim(), title: title.trim() });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editClass ? "Edit Class" : "Add Class"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="class-code">Class Code</Label>
            <Input
              id="class-code"
              placeholder="e.g., MATH101"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={20}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class-title">Class Title</Label>
            <Input
              id="class-title"
              placeholder="e.g., Algebra I"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!code.trim() || !title.trim()}>
              {editClass ? "Save Changes" : "Add Class"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
