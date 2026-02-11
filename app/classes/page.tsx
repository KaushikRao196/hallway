"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { AuthGuard } from "@/components/auth-guard";
import { TopHeader } from "@/components/top-header";
import { BottomNav } from "@/components/bottom-nav";

export default function ClassesPage() {
  const { classes, getQuestionsByClass } = useStore();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20">
        <TopHeader />

        <main className="max-w-lg mx-auto px-4 py-4">
          <h2 className="font-semibold text-lg mb-4">All Classes</h2>

          <div className="space-y-2">
            {classes.map((classItem) => {
              const questionCount = getQuestionsByClass(classItem.id).length;

              return (
                <Link key={classItem.id} href={`/class/${classItem.id}`}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">{classItem.code}</span>
                          <Badge variant="secondary" className="text-xs">
                            {questionCount} {questionCount === 1 ? "question" : "questions"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {classItem.title}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </main>

        <BottomNav />
      </div>
    </AuthGuard>
  );
}
