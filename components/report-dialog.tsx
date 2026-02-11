"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: "question" | "answer";
  targetId: string;
}

const reportReasons = [
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "spam", label: "Spam or advertisement" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "cheating", label: "Academic dishonesty" },
  { value: "other", label: "Other" },
];

export function ReportDialog({
  open,
  onOpenChange,
  targetType,
  targetId,
}: ReportDialogProps) {
  const { report } = useStore();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;

    setIsSubmitting(true);
    const fullReason = details ? `${reason}: ${details}` : reason;
    await report(targetType, targetId, fullReason);
    setIsSubmitting(false);
    setReason("");
    setDetails("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report {targetType}</DialogTitle>
          <DialogDescription>
            Help us keep Hallway safe. Select a reason for your report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={reason} onValueChange={setReason}>
            {reportReasons.map((r) => (
              <div key={r.value} className="flex items-center space-x-2">
                <RadioGroupItem value={r.value} id={r.value} />
                <Label htmlFor={r.value} className="cursor-pointer">
                  {r.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {reason === "other" && (
            <Textarea
              placeholder="Please describe the issue..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="mt-2"
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
