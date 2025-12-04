"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, Sparkles } from "lucide-react";

const MIN_LENGTH = 3;
const MAX_LENGTH = 500;

interface GoalFormProps {
  onSubmit: (goal: string) => Promise<void>;
  isLoading: boolean;
}

export function GoalForm({ onSubmit, isLoading }: GoalFormProps) {
  const [goal, setGoal] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateGoal = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed.length < MIN_LENGTH) {
      return `Goal must be at least ${MIN_LENGTH} characters`;
    }
    if (trimmed.length > MAX_LENGTH) {
      return `Goal must be less than ${MAX_LENGTH} characters`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateGoal(goal);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    await onSubmit(goal.trim());
    setGoal("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGoal(e.target.value);
    if (error) setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isValid && !isLoading) {
        handleSubmit(e);
      }
    }
  };

  const isValid = goal.trim().length >= MIN_LENGTH && goal.trim().length <= MAX_LENGTH;

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit}>
        <div className="relative rounded-2xl border border-border bg-card shadow-lg transition-shadow focus-within:shadow-xl focus-within:border-primary/30">
          <textarea
            placeholder="What's your goal? e.g., Launch a startup, Learn a new language..."
            value={goal}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            maxLength={MAX_LENGTH}
            rows={3}
            className="w-full resize-none rounded-2xl bg-transparent px-5 py-4 pr-14 text-base placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          />
          <div className="absolute bottom-3 right-3">
            <Button 
              type="submit" 
              size="icon"
              disabled={isLoading || !isValid}
              className="h-9 w-9 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-30"
            >
              {isLoading ? (
                <Sparkles className="h-4 w-4 animate-pulse" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="mt-2 flex justify-between px-2 text-xs text-muted-foreground">
          {error ? (
            <span className="text-destructive">{error}</span>
          ) : (
            <span>Press Enter to submit</span>
          )}
          <span>{goal.trim().length}/{MAX_LENGTH}</span>
        </div>
      </form>
    </div>
  );
}
