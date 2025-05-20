import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";
type ColorTemperature = "normal" | "warm" | "cool";
type FontSize = "normal" | "large" | "larger";
type ReduceMotion = boolean;

interface EyeCareSettings {
  colorTemperature: ColorTemperature;
  fontSize: FontSize;
  reduceMotion: ReduceMotion;
  blueLight: number; // 0-100 percentage of blue light filtering
}

type ThemeContextType = {
  theme: Theme;
  eyeCare: EyeCareSettings;
  toggleTheme: () => void;
  cycleTheme: () => void;
  setTheme: (theme: Theme) => void;
  toggleColorTemperature: () => void;
  setColorTemperature: (temp: ColorTemperature) => void;
  toggleFontSize: () => void;
  toggleReduceMotion: () => void;
  setBlueLight: (value: number) => void;
};

const defaultEyeCareSettings: EyeCareSettings = {
  colorTemperature: "normal",
  fontSize: "normal",
  reduceMotion: false,
  blueLight: 0
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  eyeCare: defaultEyeCareSettings,
  toggleTheme: () => {},
  cycleTheme: () => {},
  setTheme: () => {},
  toggleColorTemperature: () => {},
  setColorTemperature: () => {},
  toggleFontSize: () => {},
  toggleReduceMotion: () => {},
  setBlueLight: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>("system");
  const [eyeCare, setEyeCare] = useState<EyeCareSettings>(defaultEyeCareSettings);

  // Load saved theme preferences from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      // Set system theme as default if none saved
      setThemeState("system");
    }
    
    // Load eye care settings
    const savedEyeCare = localStorage.getItem("eyeCare");
    if (savedEyeCare) {
      try {
        const parsedSettings = JSON.parse(savedEyeCare);
        setEyeCare(parsedSettings);
      } catch (e) {
        console.error("Failed to parse eye care settings", e);
      }
    }
  }, []);

  // Handle system theme preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      if (theme === "system") {
        applyTheme(mediaQuery.matches ? "dark" : "light");
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Apply theme and eye care settings when they change
  useEffect(() => {
    if (theme === "system") {
      const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(isDarkMode ? "dark" : "light");
    } else {
      applyTheme(theme);
    }
    
    // Apply eye care settings
    applyEyeCareSettings();
    
    // Save to localStorage
    localStorage.setItem("theme", theme);
    localStorage.setItem("eyeCare", JSON.stringify(eyeCare));
  }, [theme, eyeCare]);

  const applyTheme = (resolvedTheme: "dark" | "light") => {
    const root = document.documentElement;
    const isDark = resolvedTheme === "dark";
    
    // Apply theme
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };
  
  const applyEyeCareSettings = () => {
    const root = document.documentElement;
    const { colorTemperature, fontSize, reduceMotion, blueLight } = eyeCare;
    
    // Apply color temperature
    root.classList.remove("warm", "cool");
    if (colorTemperature !== "normal") {
      root.classList.add(colorTemperature);
    }
    
    // Apply font size
    root.style.fontSize = fontSize === "normal" ? "" : 
                         fontSize === "large" ? "110%" : "120%";
    
    // Apply reduce motion
    if (reduceMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }
    
    // Apply blue light filter
    if (blueLight > 0) {
      const filterValue = `brightness(100%) sepia(${blueLight / 2}%) saturate(80%) hue-rotate(200deg)`;
      root.style.filter = filterValue;
    } else {
      root.style.filter = "";
    }
  };

  const toggleTheme = () => {
    setThemeState((prevTheme) => {
      if (prevTheme === "light") return "dark";
      if (prevTheme === "dark") return "system";
      return "light";
    });
  };
  
  const cycleTheme = () => {
    setThemeState((prevTheme) => {
      if (prevTheme === "light") return "dark";
      if (prevTheme === "dark") return "light";
      return "light";
    });
  };
  
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleColorTemperature = () => {
    setEyeCare(prev => {
      const nextTemp = prev.colorTemperature === "normal" ? "warm" : 
                       prev.colorTemperature === "warm" ? "cool" : "normal";
      return { ...prev, colorTemperature: nextTemp };
    });
  };
  
  const setColorTemperature = (temp: ColorTemperature) => {
    setEyeCare(prev => ({ ...prev, colorTemperature: temp }));
  };
  
  const toggleFontSize = () => {
    setEyeCare(prev => {
      const nextSize = prev.fontSize === "normal" ? "large" : 
                       prev.fontSize === "large" ? "larger" : "normal";
      return { ...prev, fontSize: nextSize };
    });
  };
  
  const toggleReduceMotion = () => {
    setEyeCare(prev => ({ ...prev, reduceMotion: !prev.reduceMotion }));
  };
  
  const setBlueLight = (value: number) => {
    setEyeCare(prev => ({ ...prev, blueLight: Math.max(0, Math.min(100, value)) }));
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        eyeCare,
        toggleTheme, 
        cycleTheme,
        setTheme,
        toggleColorTemperature,
        setColorTemperature,
        toggleFontSize,
        toggleReduceMotion,
        setBlueLight
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
