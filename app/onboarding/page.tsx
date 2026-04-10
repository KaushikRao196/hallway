"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export default function OnboardingPage() {
  const { pendingSetup, setupSchool, currentUser, isLoading } = useStore();
  const router = useRouter();

  const [schoolName, setSchoolName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && currentUser) {
      router.replace("/feed");
    }
    if (!isLoading && !pendingSetup && !currentUser) {
      router.replace("/login");
    }
  }, [currentUser, pendingSetup, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim()) return;
    setIsSubmitting(true);
    setError("");
    try {
      await setupSchool(schoolName.trim());
      router.replace("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsSubmitting(false);
    }
  };

  if (isLoading || !pendingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to Hallway</h1>
          <p className="text-sm text-muted-foreground">
            You&apos;re the first from <span className="font-medium text-foreground">{pendingSetup.domain}</span>.
            <br />
            What&apos;s your school called?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schoolName">School name</Label>
            <Input
              id="schoolName"
              placeholder="e.g. Coppell High School"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={!schoolName.trim() || isSubmitting}
          >
            {isSubmitting ? "Setting up..." : "Create my school"}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          Everyone from <span className="font-medium">{pendingSetup.domain}</span> will join automatically.
        </p>
      </div>
    </div>
  );
}
