"use client";

import { Menu, X, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onSettingsClick: () => void;
}

export function MobileHeader({ isSidebarOpen, onToggleSidebar, onSettingsClick }: MobileHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-background border-b border-border md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Hamburger Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="h-9 w-9"
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-base font-semibold text-foreground">GoalBreaker</span>
        </div>

        {/* Settings Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onSettingsClick}
          className="h-9 w-9"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
