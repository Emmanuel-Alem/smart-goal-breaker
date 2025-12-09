"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const DEFAULT_MODEL = "gemini-2.0-flash";

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  showComplexity: boolean;
  setShowComplexity: (show: boolean) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [showComplexity, setShowComplexityState] = useState(true);
  const [selectedModel, setSelectedModelState] = useState(DEFAULT_MODEL);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load settings from localStorage on mount
    const savedTheme = localStorage.getItem("theme") as Theme;
    const savedShowComplexity = localStorage.getItem("showComplexity");
    const savedModel = localStorage.getItem("selectedModel");

    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      // Default to dark mode
      setThemeState("dark");
    }

    if (savedShowComplexity !== null) {
      setShowComplexityState(savedShowComplexity === "true");
    }

    if (savedModel) {
      setSelectedModelState(savedModel);
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Apply theme to document
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setShowComplexity = (show: boolean) => {
    setShowComplexityState(show);
    localStorage.setItem("showComplexity", String(show));
  };

  const setSelectedModel = (model: string) => {
    setSelectedModelState(model);
    localStorage.setItem("selectedModel", model);
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        showComplexity,
        setShowComplexity,
        selectedModel,
        setSelectedModel,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
