"use client";

import { useTheme } from "../../contexts/theme-context";
import { Button } from "./button";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-green-600" />
      ) : (
        <Sun className="h-4 w-4 text-green-400" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
