"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { AuthGuard } from "@/components/auth-guard";
import { TopHeader } from "@/components/top-header";
import { BottomNav } from "@/components/bottom-nav";
import { FiltersBar } from "@/components/filters-bar";
import { QuestionCard } from "@/components/question-card";
import { EmptyState } from "@/components/empty-state";

export default function FeedPage() {
  const { questions, getAnswersByQuestion } = useStore();

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "top">("recent");

  const filteredQuestions = useMemo(() => {
    let result = [...questions];

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (q) =>
          q.title.toLowerCase().includes(searchLower) ||
          q.body.toLowerCase().includes(searchLower)
      );
    }

    // Filter by class
    if (classFilter !== "all") {
      result = result.filter((q) => q.classId === classFilter);
    }

    // Filter by teacher
    if (teacherFilter !== "all") {
      result = result.filter((q) => q.teacherId === teacherFilter);
    }

    // Sort
    if (sortBy === "recent") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // Sort by number of answers (proxy for "top")
      result.sort((a, b) => {
        const answersA = getAnswersByQuestion(a.id).length;
        const answersB = getAnswersByQuestion(b.id).length;
        return answersB - answersA;
      });
    }

    return result;
  }, [questions, search, classFilter, teacherFilter, sortBy, getAnswersByQuestion]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20">
        <TopHeader />

        <main className="max-w-3xl mx-auto px-4 py-4">
          <FiltersBar
            search={search}
            onSearchChange={setSearch}
            classFilter={classFilter}
            onClassFilterChange={setClassFilter}
            teacherFilter={teacherFilter}
            onTeacherFilterChange={setTeacherFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <div className="mt-4 space-y-3">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))
            ) : search || classFilter !== "all" || teacherFilter !== "all" ? (
              <EmptyState type="no-results" />
            ) : (
              <EmptyState type="no-questions" />
            )}
          </div>
        </main>

        {/* Floating Ask Button */}
        <Link href="/ask" className="fixed bottom-20 right-4 z-50">
          <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
            <Plus className="h-6 w-6" />
            <span className="sr-only">Ask a question</span>
          </Button>
        </Link>

        <BottomNav />
      </div>
    </AuthGuard>
  );
}
