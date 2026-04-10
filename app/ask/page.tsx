"use client";

import React from "react"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { AuthGuard } from "@/components/auth-guard";
import { BottomNav } from "@/components/bottom-nav";

export default function AskPage() {
  const { classes, teachers, addQuestion } = useStore();
  const router = useRouter();

  const [classId, setClassId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!classId) {
      setError("Please select a class.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }

    setIsSubmitting(true);

    try {
      const question = await addQuestion({
        classId,
        teacherId: teacherId && teacherId !== "none" ? teacherId : undefined,
        title: title.trim(),
        body: body.trim(),
      });
      router.push(`/q/${question.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
          <div className="flex items-center h-14 px-4 max-w-lg mx-auto">
            <Link href="/feed">
              <Button variant="ghost" size="icon" className="h-8 w-8 mr-2">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <h1 className="font-semibold text-lg">Ask a Question</h1>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What do you need help with?</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Class Select */}
                <div className="space-y-2">
                  <Label htmlFor="class">Class *</Label>
                  <Select value={classId} onValueChange={setClassId}>
                    <SelectTrigger id="class">
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

                {/* Teacher Select (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="teacher">Teacher (optional)</Label>
                  <Select value={teacherId} onValueChange={setTeacherId}>
                    <SelectTrigger id="teacher">
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

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., How do I solve quadratic equations?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                  />
                </div>

                {/* Body */}
                <div className="space-y-2">
                  <Label htmlFor="body">Details (optional)</Label>
                  <Textarea
                    id="body"
                    placeholder="Add more context or details about your question..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !classId || !title.trim()}
                >
                  {isSubmitting ? "Posting..." : "Post Question"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Your question will be posted anonymously. Be respectful and follow school guidelines.
          </p>
        </main>

        <BottomNav />
      </div>
    </AuthGuard>
  );
}
