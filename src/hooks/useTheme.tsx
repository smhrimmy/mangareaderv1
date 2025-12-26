import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "dark";
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user, profile } = useAuth();
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored && ["light", "dark", "system"].includes(stored)) {
      return stored;
    }
    return "dark";
  });

  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;

  // Sync with user profile on login
  useEffect(() => {
    if (profile?.theme && profile.theme !== theme) {
      setThemeState(profile.theme as Theme);
    }
  }, [profile]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    localStorage.setItem("theme", theme);
  }, [theme, resolvedTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(getSystemTheme());
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);

    // Persist to profile if logged in
    if (user) {
      await supabase
        .from("profiles")
        .update({ theme: newTheme })
        .eq("user_id", user.id);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
