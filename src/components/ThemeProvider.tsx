
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
type ColorTemperature = "normal" | "warm";

type ThemeContextType = {
  theme: Theme;
  colorTemperature: ColorTemperature;
  toggleTheme: () => void;
  toggleColorTemperature: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  colorTemperature: "normal",
  toggleTheme: () => {},
  toggleColorTemperature: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [colorTemperature, setColorTemperature] = useState<ColorTemperature>("normal");

  // Load saved theme preferences from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const savedColorTemp = localStorage.getItem("colorTemperature") as ColorTemperature | null;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }

    if (savedColorTemp) {
      setColorTemperature(savedColorTemp);
    }
  }, []);

  // Update document class when theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    // Set dark/light mode
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    // Set color temperature
    if (colorTemperature === "warm") {
      root.classList.add("warm");
    } else {
      root.classList.remove("warm");
    }
    
    // Save to localStorage
    localStorage.setItem("theme", theme);
    localStorage.setItem("colorTemperature", colorTemperature);
  }, [theme, colorTemperature]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const toggleColorTemperature = () => {
    setColorTemperature(colorTemperature === "normal" ? "warm" : "normal");
  };

  return (
    <ThemeContext.Provider value={{ theme, colorTemperature, toggleTheme, toggleColorTemperature }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
