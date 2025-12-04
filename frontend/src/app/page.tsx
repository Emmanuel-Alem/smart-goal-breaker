"use client";

import { useState, useEffect } from "react";
import { GoalForm, TaskList, EmptyState, GoalSkeleton } from "@/components/goal";
import { Sidebar, SettingsPanel, type ViewType } from "@/components/layout";
import { createGoal, getGoals, deleteGoal, deleteAllGoals, updateGoal, type Goal } from "@/lib/api";
import { useSettings } from "@/lib/settings-context";
import { Sparkles, History } from "lucide-react";

export default function Home() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [latestGoal, setLatestGoal] = useState<Goal | null>(null);
  const [activeView, setActiveView] = useState<ViewType>("new");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { showComplexity } = useSettings();

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await getGoals();
      setGoals(data);
    } catch {
      console.error("Failed to load goals");
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleSubmit = async (title: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const newGoal = await createGoal(title);
      setLatestGoal(newGoal);
      setGoals((prev) => [newGoal, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      if (latestGoal?.id === id) {
        setLatestGoal(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete goal");
    }
  };

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    setError(null);
  };

  const handleClearHistory = async () => {
    await deleteAllGoals();
    setGoals([]);
    setLatestGoal(null);
  };

  const handleEdit = async (id: number, newTitle: string) => {
    const updatedGoal = await updateGoal(id, newTitle);
    setGoals((prev) => prev.map((g) => (g.id === id ? updatedGoal : g)));
    if (latestGoal?.id === id) {
      setLatestGoal(updatedGoal);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        goalCount={goals.length} 
        activeView={activeView}
        onViewChange={handleViewChange}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        goals={goals}
        onClearHistory={handleClearHistory}
      />

      {/* Main Content */}
      <main className="pl-64">
        <div className="min-h-screen flex flex-col">
          {activeView === "new" ? (
            /* New Goal View */
            <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
              {/* Animated sparkle icon */}
              <div className="mb-6">
                <Sparkles className="h-10 w-10 text-primary animate-pulse" />
              </div>

              {/* Greeting */}
              <h1 className="text-4xl font-serif font-normal text-foreground mb-8 text-center">
                {getGreeting()}! What&apos;s your goal?
              </h1>

              {/* Goal Input */}
              <GoalForm onSubmit={handleSubmit} isLoading={isLoading} />

              {/* Error Message */}
              {error && (
                <div className="mt-4 w-full max-w-2xl rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Latest Goal Result */}
              <div className="mt-12 w-full max-w-2xl">
                {isLoading ? (
                  <GoalSkeleton />
                ) : latestGoal ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Latest Result
                      </span>
                    </div>
                    <TaskList goal={latestGoal} onDelete={handleDelete} onEdit={handleEdit} showComplexity={showComplexity} />
                  </div>
                ) : (
                  <EmptyState />
                )}
              </div>
            </div>
          ) : (
            /* History View */
            <div className="flex-1 px-8 py-12">
              <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <History className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-foreground">History</h1>
                    <p className="text-sm text-muted-foreground">
                      {goals.length} {goals.length === 1 ? 'goal' : 'goals'} saved
                    </p>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-destructive text-sm">
                    {error}
                  </div>
                )}

                {/* Goals List */}
                {isInitialLoading ? (
                  <div className="space-y-4">
                    <GoalSkeleton />
                    <GoalSkeleton />
                    <GoalSkeleton />
                  </div>
                ) : goals.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-6">
                      <History className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">No history yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Create your first goal to see it here.
                    </p>
                    <button
                      onClick={() => setActiveView("new")}
                      className="text-primary hover:underline font-medium"
                    >
                      Create a new goal
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {goals.map((goal) => (
                      <TaskList key={goal.id} goal={goal} onDelete={handleDelete} onEdit={handleEdit} showComplexity={showComplexity} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
