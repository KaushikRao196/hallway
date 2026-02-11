"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, Shield, BookOpen, ChevronRight } from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "Insider Knowledge",
    description: "Get advice from students who've actually taken the class - not generic answers.",
  },
  {
    icon: Users,
    title: "Teacher Differences",
    description: "Learn what really matters for each teacher: grading style, workload, and exam format.",
  },
  {
    icon: Shield,
    title: "Anonymous & Safe",
    description: "Ask freely without judgment. Your identity stays private from other students.",
  },
  {
    icon: BookOpen,
    title: "Better Decisions",
    description: "Choose your classes wisely before schedules lock. No more regrets.",
  },
];

const exampleQuestions = [
  "How hard are Mr. Johnson's tests compared to homework?",
  "Is AP Bio manageable with 3 other APs?",
  "Does Ms. Rodriguez curve the final?",
  "If you don't get Teacher A, should you drop?",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background font-bold text-sm">H</span>
            </div>
            <span className="font-semibold text-lg text-foreground">Hallway</span>
          </div>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            School-verified students only
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight text-balance mb-6">
            Anonymous advice from students who've actually taken the class
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty leading-relaxed">
            Get insider knowledge about teachers, workloads, and grading that only upperclassmen know. 
            Make better academic decisions before your schedule locks.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/ask">
              <Button size="lg" className="w-full sm:w-auto">
                Ask Anonymously
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/feed">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                Browse Questions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Example Questions */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-medium text-muted-foreground text-center mb-6 uppercase tracking-wide">
            Questions you can finally ask
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exampleQuestions.map((question, index) => (
              <Card key={index} className="bg-background">
                <CardContent className="p-4">
                  <p className="text-foreground font-medium">{`"${question}"`}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Why students use Hallway
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Not For Section */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            What Hallway is NOT for
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Generic questions like "What is AP Environmental Science?" or "Explain photosynthesis" 
            don't belong here. Those answers are a Google search away. Hallway is for the stuff 
            only someone who took the class would know.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to get real answers?
          </h2>
          <p className="text-muted-foreground mb-6">
            Join your school's Hallway with your student email.
          </p>
          <Link href="/login">
            <Button size="lg">
              Get Started
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-foreground flex items-center justify-center">
              <span className="text-background font-bold text-xs">H</span>
            </div>
            <span className="text-sm text-muted-foreground">Hallway</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Anonymous, school-verified Q&A for students
          </p>
        </div>
      </footer>
    </div>
  );
}
