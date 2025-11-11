"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "ca-theme";
const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  ready: false,
});

function resolveInitialTheme(defaultTheme) {
  if (typeof window === "undefined") {
    return defaultTheme;
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return defaultTheme;
}

export function ThemeProvider({ children, defaultTheme = "light" }) {
  const [theme, setTheme] = useState(defaultTheme);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const resolved = resolveInitialTheme(defaultTheme);
    startTransition(() => {
      setTheme(resolved);
      setReady(true);
    });
  }, [defaultTheme]);

  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.classList.remove(theme === "light" ? "dark" : "light");
    root.classList.add(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, ready]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, ready }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

