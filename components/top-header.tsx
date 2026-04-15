"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useStore } from "@/lib/store";

export function TopHeader() {
  const { school, currentUser, logout } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-3">
          <Link href="/feed" className="font-bold text-xl tracking-tight">
            Hallway
          </Link>
          <Badge variant="secondary" className="text-xs font-normal">
            {school.name}
          </Badge>
        </div>

        {currentUser && (
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="h-8 w-8 text-muted-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Log out</span>
          </Button>
        )}
      </div>
    </header>
  );
}
