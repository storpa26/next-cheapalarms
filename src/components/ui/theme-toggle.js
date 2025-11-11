"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle({ className = "" }) {
  const { theme, setTheme, ready } = useTheme();
  const isDark = theme === "dark";

  if (!ready) {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-lg border border-transparent bg-muted px-3 py-2 text-sm text-muted-foreground ${className}`}
      >
        …
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 ${className}`}
      aria-pressed={isDark}
      aria-label="Toggle dark mode"
    >
      {isDark ? <Moon aria-hidden className="h-4 w-4" /> : <Sun aria-hidden className="h-4 w-4" />}
      <span>{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}

