"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4 mr-2 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await login();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/30">
            <span className="text-primary-foreground font-bold text-2xl">H</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Hallway</h1>
          <p className="text-muted-foreground text-sm mt-1">Anonymous school Q&amp;A</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="text-center mb-5">
            <h2 className="font-semibold text-lg">Welcome</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Sign in with your school Google account</p>
          </div>

          <Button
            className="w-full h-11 rounded-xl font-medium"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <GoogleIcon />
            {loading ? "Redirecting to Google..." : "Continue with Google"}
          </Button>

          {error && (
            <p className="text-sm text-destructive text-center mt-3">{error}</p>
          )}

          <p className="text-xs text-center text-muted-foreground mt-4 leading-relaxed">
            Use your school Google account. You'll be anonymous to other students — only your school domain is used for verification.
          </p>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-5">
          By continuing, you agree to keep Hallway safe and respectful.
        </p>
      </div>
    </main>
  );
}
