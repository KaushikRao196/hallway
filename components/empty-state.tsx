import { MessageSquare, Search, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  type: "no-questions" | "no-results" | "no-answers";
  className?: string;
}

const emptyStates = {
  "no-questions": {
    icon: HelpCircle,
    title: "No questions yet",
    description: "Be the first to ask a question!",
  },
  "no-results": {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search or filters.",
  },
  "no-answers": {
    icon: MessageSquare,
    title: "No answers yet",
    description: "Be the first to help out!",
  },
};

export function EmptyState({ type, className }: EmptyStateProps) {
  const state = emptyStates[type];
  const Icon = state.icon;

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-foreground mb-1">{state.title}</h3>
      <p className="text-sm text-muted-foreground">{state.description}</p>
    </div>
  );
}
