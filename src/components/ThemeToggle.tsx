"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-md transition-colors ${
          resolvedTheme === "light"
            ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
        title="Modo claro"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-md transition-colors ${
          resolvedTheme === "dark"
            ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
        title="Modo escuro"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-md transition-colors ${
          theme === "system"
            ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
        title="Sistema"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}
