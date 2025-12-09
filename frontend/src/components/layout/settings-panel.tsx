"use client";

import { X, Sun, Moon, FileJson, FileSpreadsheet, FileText, File, Trash2, AlertTriangle, Cpu, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/lib/settings-context";
import { exportAsJSON, exportAsCSV, exportAsPDF, exportAsDOC } from "@/lib/export-utils";
import type { Goal, AIModel, RateLimitStatus } from "@/lib/api";
import { getModels, getRateLimitStatus } from "@/lib/api";
import { useState, useEffect } from "react";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  goals: Goal[];
  onClearHistory: () => Promise<void>;
}

export function SettingsPanel({ isOpen, onClose, goals, onClearHistory }: SettingsPanelProps) {
  const { theme, setTheme, showComplexity, setShowComplexity, selectedModel, setSelectedModel } = useSettings();
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [models, setModels] = useState<AIModel[]>([]);
  const [rateLimitStatus, setRateLimitStatus] = useState<RateLimitStatus | null>(null);

  useEffect(() => {
    if (isOpen) {
      getModels().then(setModels).catch(console.error);
      getRateLimitStatus().then(setRateLimitStatus).catch(console.error);
    }
  }, [isOpen]);

  const handleClearHistory = async () => {
    setIsClearing(true);
    try {
      await onClearHistory();
      setShowConfirmClear(false);
      onClose();
    } catch (error) {
      console.error("Failed to clear history:", error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleExport = async (format: "json" | "csv" | "pdf" | "doc") => {
    if (goals.length === 0) return;

    switch (format) {
      case "json":
        exportAsJSON(goals);
        break;
      case "csv":
        exportAsCSV(goals);
        break;
      case "pdf":
        exportAsPDF(goals);
        break;
      case "doc":
        await exportAsDOC(goals);
        break;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full sm:w-96 md:w-80 bg-card border-l border-border shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Settings</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            {/* Appearance */}
            <section>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                Appearance
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                    theme === "light"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-muted-foreground/50 text-muted-foreground"
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  <span className="text-sm font-medium">Light</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                    theme === "dark"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-muted-foreground/50 text-muted-foreground"
                  }`}
                >
                  <Moon className="h-4 w-4" />
                  <span className="text-sm font-medium">Dark</span>
                </button>
              </div>
            </section>

            {/* Display */}
            <section>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                Display
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Show Complexity Badge</p>
                  <p className="text-xs text-muted-foreground">Display difficulty score on goals</p>
                </div>
                <Switch checked={showComplexity} onCheckedChange={setShowComplexity} />
              </div>
            </section>

            {/* AI Model */}
            <section>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                <Cpu className="h-4 w-4 inline mr-2" />
                AI Model
              </h3>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              {models.find(m => m.id === selectedModel) && (
                <p className="text-xs text-muted-foreground mt-2">
                  {models.find(m => m.id === selectedModel)?.description}
                </p>
              )}
            </section>

            {/* API Usage */}
            <section>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                <Activity className="h-4 w-4 inline mr-2" />
                API Usage
              </h3>
              {rateLimitStatus ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">This minute</span>
                      <span className="text-foreground font-medium">
                        {rateLimitStatus.requests_this_minute} / {rateLimitStatus.max_per_minute}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{
                          width: `${(rateLimitStatus.requests_this_minute / rateLimitStatus.max_per_minute) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Today</span>
                      <span className="text-foreground font-medium">
                        {rateLimitStatus.requests_today} / {rateLimitStatus.max_per_day}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{
                          width: `${(rateLimitStatus.requests_today / rateLimitStatus.max_per_day) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Loading usage data...</p>
              )}
            </section>

            {/* Export */}
            <section>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                Export Goals
              </h3>
              {goals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No goals to export</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleExport("json")}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border hover:bg-secondary transition-colors text-sm"
                  >
                    <FileJson className="h-4 w-4 text-blue-500" />
                    <span>JSON</span>
                  </button>
                  <button
                    onClick={() => handleExport("csv")}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border hover:bg-secondary transition-colors text-sm"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-green-500" />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={() => handleExport("pdf")}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border hover:bg-secondary transition-colors text-sm"
                  >
                    <FileText className="h-4 w-4 text-red-500" />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={() => handleExport("doc")}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border hover:bg-secondary transition-colors text-sm"
                  >
                    <File className="h-4 w-4 text-blue-600" />
                    <span>DOC</span>
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {goals.length} {goals.length === 1 ? "goal" : "goals"} available
              </p>
            </section>

            {/* Danger Zone */}
            <section>
              <h3 className="text-sm font-medium text-destructive uppercase tracking-wide mb-4">
                Danger Zone
              </h3>
              {!showConfirmClear ? (
                <Button
                  variant="outline"
                  className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setShowConfirmClear(true)}
                  disabled={goals.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All History
                </Button>
              ) : (
                <div className="space-y-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Are you sure?</p>
                      <p className="text-xs text-muted-foreground">
                        This will permanently delete all {goals.length} goals. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowConfirmClear(false)}
                      disabled={isClearing}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={handleClearHistory}
                      disabled={isClearing}
                    >
                      {isClearing ? "Deleting..." : "Delete All"}
                    </Button>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Smart Goal Breaker v1.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
