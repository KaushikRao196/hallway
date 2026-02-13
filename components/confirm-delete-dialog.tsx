"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "class" | "teacher";
  id: string;
  name: string;
}

export function ConfirmDeleteDialog({ open, onOpenChange, type, id, name }: ConfirmDeleteDialogProps) {
  const { classes, teachers, getLinkedPostCount, getLinkedRatingCount, deleteClass, deleteTeacher } = useStore();
  const [strategy, setStrategy] = useState<"nullify" | "delete" | "reassign">("nullify");
  const [reassignTarget, setReassignTarget] = useState("");

  const postCount = getLinkedPostCount(type, id);
  const ratingCount = type === "teacher" ? getLinkedRatingCount(id) : 0;
  const hasLinked = postCount > 0 || ratingCount > 0;

  const otherItems = type === "class"
    ? classes.filter((c) => c.id !== id)
    : teachers.filter((t) => t.id !== id);

  const handleDelete = () => {
    const deleteStrategy =
      strategy === "reassign" && reassignTarget
        ? { reassignTo: reassignTarget }
        : strategy === "delete"
        ? "delete" as const
        : "nullify" as const;

    if (type === "class") {
      deleteClass(id, deleteStrategy);
    } else {
      deleteTeacher(id, deleteStrategy);
    }
    onOpenChange(false);
    setStrategy("nullify");
    setReassignTarget("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {type === "class" ? "Class" : "Teacher"}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span className="font-semibold text-foreground">{name}</span>?
          </DialogDescription>
        </DialogHeader>

        {hasLinked && (
          <div className="space-y-4 py-2">
            <div className="rounded-md bg-muted p-3 text-sm">
              {postCount > 0 && (
                <p>This {type} has <span className="font-semibold">{postCount} {postCount === 1 ? "post" : "posts"}</span> linked.</p>
              )}
              {ratingCount > 0 && (
                <p className="mt-1">This teacher has <span className="font-semibold">{ratingCount} {ratingCount === 1 ? "rating" : "ratings"}</span> linked (will be removed).</p>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">How should linked posts be handled?</p>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="strategy"
                    checked={strategy === "nullify"}
                    onChange={() => setStrategy("nullify")}
                    className="accent-foreground"
                  />
                  {type === "class"
                    ? "Mark posts as \"Deleted Class\""
                    : "Remove teacher reference from posts"}
                </label>

                {otherItems.length > 0 && (
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="strategy"
                      checked={strategy === "reassign"}
                      onChange={() => setStrategy("reassign")}
                      className="accent-foreground"
                    />
                    Reassign posts to another {type}
                  </label>
                )}

                {strategy === "reassign" && (
                  <div className="ml-6">
                    <Select value={reassignTarget} onValueChange={setReassignTarget}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={`Select a ${type}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {otherItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {type === "class" ? `${(item as typeof classes[0]).code} - ${(item as typeof classes[0]).title}` : (item as typeof teachers[0]).name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="strategy"
                    checked={strategy === "delete"}
                    onChange={() => setStrategy("delete")}
                    className="accent-foreground"
                  />
                  <span className="text-destructive">Delete all linked posts too</span>
                </label>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={strategy === "reassign" && !reassignTarget}
          >
            Delete {type === "class" ? "Class" : "Teacher"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
