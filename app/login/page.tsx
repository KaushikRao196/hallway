"use client";

import React from "react"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const { login, isLoading, school } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate school email domain
    if (!email.endsWith(`@${school.domain}`)) {
      setError(`Please use your ${school.domain} email address.`);
      return;
    }

    await login(email);
    router.push("/feed");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Hallway</h1>
          <p className="text-muted-foreground">
            Your anonymous school Q&A
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>
              Continue with your school email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">School Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={`you@${school.domain}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Continue with school email"}
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Anonymous to other students. Your email is only used for verification.
            </p>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground mt-6">
          By continuing, you agree to keep Hallway safe and respectful.
        </p>
      </div>
    </main>
  );
}
