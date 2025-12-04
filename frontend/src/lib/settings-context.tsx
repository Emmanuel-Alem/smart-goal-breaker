"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  showComplexity: boolean;
  setShowComplexity: (show: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [showComplexity, setShowComplexityState] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load settings from localStorage on mount
    const savedTheme = localStorage.getItem("theme") as Theme;
    const savedShowComplexity = localStorage.getItem("showComplexity");

    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      // Default to dark mode
      setThemeState("dark");
    }

    if (savedShowComplexity !== null) {
      setShowComplexityState(savedShowComplexity === "true");
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
