"use client";

import { useState, useEffect } from "react";
import { GoalForm, TaskList, EmptyState, GoalSkeleton } from "@/components/goal";
import { Sidebar, SettingsPanel, MobileHeader, type ViewType } from "@/components/layout";
import { createGoal, getGoals, deleteGoal, deleteAllGoals, updateGoal, type Goal } from "@/lib/api";
import { useSettings } from "@/lib/settings-context";
import { Sparkles, History, AlertCircle, Lightbulb } from "lucide-react";

export default function Home() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [latestGoal, setLatestGoal] = useState<Goal | null>(null);
  const [activeView, setActiveView] = useState<ViewType>("new");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { showComplexity, selectedModel } = useSettings();

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
      const newGoal = await createGoal(title, selectedModel);
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
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleClearHistory = async () => {
    await deleteAllGoals();
    setGoals([]);
    setLatestGoal(null);
  };

  const handleEdit = async (id: number, newTitle: string) => {
    const updatedGoal = await updateGoal(id, newTitle, selectedModel);
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
      {/* Mobile Header */}
      <MobileHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      {/* Sidebar */}
      <Sidebar 
        goalCount={goals.length} 
        activeView={activeView}
        onViewChange={handleViewChange}
        onSettingsClick={() => setIsSettingsOpen(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        goals={goals}
        onClearHistory={handleClearHistory}
      />

      {/* Main Content */}
      <main className="pt-14 md:pt-0 pl-0 md:pl-64">
        <div className="min-h-screen flex flex-col">
          {activeView === "new" ? (
            /* New Goal View */
            <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-8 md:py-12">
              {/* Animated sparkle icon */}
              <div className="mb-4 md:mb-6">
                <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-primary animate-pulse" />
              </div>

              {/* Greeting */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-foreground mb-6 md:mb-8 text-center px-4">
                {getGreeting()}! What&apos;s your goal?
              </h1>

              {/* Goal Input */}
              <GoalForm onSubmit={handleSubmit} isLoading={isLoading} />

              {/* Error Messages */}
              {error && (
                <div className="mt-4 w-full max-w-2xl space-y-3">
                  {/* Error Card */}
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 md:p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm text-destructive break-words">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hint Card */}
                  <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 md:p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300 break-words">
                          Try switching to a different AI model from the settings and try again.
                        </p>
                      </div>
                    </div>
                  </div>
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
            <div className="flex-1 px-4 sm:px-6 md:px-8 py-8 md:py-12">
              <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                  <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-primary/10">
                    <History className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-semibold text-foreground">History</h1>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {goals.length} {goals.length === 1 ? 'goal' : 'goals'} saved
                    </p>
                  </div>
                </div>

                {/* Error Messages */}
                {error && (
                  <div className="mb-6 space-y-3">
                    {/* Error Card */}
                    <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 md:p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm text-destructive break-words">
                            {error}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Hint Card */}
                    <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 md:p-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300 break-words">
                            Try switching to a different AI model from the settings and try again.
                          </p>
                        </div>
                      </div>
                    </div>
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
