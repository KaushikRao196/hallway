"use client";

import React from "react"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { currentUser, pendingSetup, isLoading } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (pendingSetup) {
      router.replace("/onboarding");
    } else if (!currentUser) {
      router.replace("/login");
    }
  }, [currentUser, pendingSetup, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return <>{children}</>;
}
