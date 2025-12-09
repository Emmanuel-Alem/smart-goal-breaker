"use client";

import { PlusCircle, History, Sparkles, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewType = "new" | "history";

interface SidebarProps {
  goalCount: number;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  onSettingsClick: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ goalCount, activeView, onViewChange, onSettingsClick, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">GoalBreaker</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <NavItem 
            icon={PlusCircle} 
            label="New Goal" 
            active={activeView === "new"}
            onClick={() => onViewChange("new")}
          />
          <NavItem 
            icon={History} 
            label="History"
            count={goalCount}
            active={activeView === "history"}
            onClick={() => onViewChange("history")}
          />
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div 
            onClick={onSettingsClick}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent cursor-pointer transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ icon: Icon, label, count, active, onClick }: NavItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full",
          active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
        )}>
          {count}
        </span>
      )}
    </div>
  );
}
