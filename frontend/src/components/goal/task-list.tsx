"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ComplexityBadge } from "./complexity-badge";
import { Trash2, CheckCircle2, Pencil, X, RefreshCw } from "lucide-react";
import type { Goal } from "@/lib/api";

interface TaskListProps {
  goal: Goal;
  onDelete?: (id: number) => void;
  onEdit?: (id: number, newTitle: string) => Promise<void>;
  showComplexity?: boolean;
}

export function TaskList({ goal, onDelete, onEdit, showComplexity = true }: TaskListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(goal.title);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    if (!onEdit || editTitle.trim() === goal.title || editTitle.trim().length < 3) return;
    
    setIsUpdating(true);
    try {
      await onEdit(goal.id, editTitle.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update goal:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(goal.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isUpdating) {
    return (
      <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-center gap-3 py-8">
          <RefreshCw className="h-5 w-5 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground">Regenerating steps...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-4 mb-5">
        {isEditing ? (
          <div className="flex-1 space-y-3">
            <textarea
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={2}
              autoFocus
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Press Enter to save, Esc to cancel
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="h-8"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={editTitle.trim() === goal.title || editTitle.trim().length < 3}
                  className="h-8"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Regenerate
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-card-foreground leading-tight">
                {goal.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(goal.created_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {showComplexity && <ComplexityBadge score={goal.complexity_score} />}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                  onClick={() => onDelete(goal.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </div>
      {!isEditing && (
        <div className="space-y-3">
          {goal.tasks
            .sort((a, b) => a.step_number - b.step_number)
            .map((task) => (
              <div 
                key={task.id} 
                className="flex gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-medium text-primary mb-0.5 block">
                    Step {task.step_number}
                  </span>
                  <span className="text-sm text-card-foreground">{task.description}</span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
