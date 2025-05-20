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
      
      // Add CSS variables for color temperature
      if (colorTemperature === "warm") {
        root.style.setProperty('--color-temp-overlay', 'rgba(255, 160, 0, 0.05)');
        root.style.setProperty('--color-temp-filter', 'sepia(20%) brightness(103%) hue-rotate(-10deg)');
        root.style.setProperty('--color-temp-strength', '0.15');
      } else if (colorTemperature === "cool") {
        root.style.setProperty('--color-temp-overlay', 'rgba(0, 102, 255, 0.04)');
        root.style.setProperty('--color-temp-filter', 'hue-rotate(10deg) saturate(95%) brightness(102%)');
        root.style.setProperty('--color-temp-strength', '0.1');
      }
    } else {
      root.style.removeProperty('--color-temp-overlay');
      root.style.removeProperty('--color-temp-filter');
      root.style.removeProperty('--color-temp-strength');
    }
    
    // Apply font size with smooth transition
    if (!document.getElementById('font-size-style')) {
      const style = document.createElement('style');
      style.id = 'font-size-style';
      style.textContent = `
        html {
          transition: font-size 0.3s ease;
        }
      `;
      document.head.appendChild(style);
    }
    
    root.style.fontSize = fontSize === "normal" ? "" : 
                         fontSize === "large" ? "110%" : "120%";
    
    // Apply reduce motion
    if (reduceMotion) {
      root.classList.add("reduce-motion");
      
      // Add global styles for reduced motion if not already added
      if (!document.getElementById('reduce-motion-style')) {
        const style = document.createElement('style');
        style.id = 'reduce-motion-style';
        style.textContent = `
          .reduce-motion * {
            animation-duration: 0.001ms !important;
            transition-duration: 0.001ms !important;
          }
        `;
        document.head.appendChild(style);
      }
    } else {
      root.classList.remove("reduce-motion");
    }
    
    // Apply blue light filter with improved implementation
    if (blueLight > 0) {
      // Create a blue light filter with adjustable intensity
      const intensity = blueLight / 100;
      
      // Calculate overlay properties based on intensity
      const overlayOpacity = intensity * 0.3; // Max opacity of 30%
      const overlayColor = `rgba(255, 223, 166, ${overlayOpacity})`;
      
      // Set CSS variables for the filter
      root.style.setProperty('--blue-light-overlay', overlayColor);
      root.style.setProperty('--blue-light-intensity', intensity.toString());
      
      // Apply filter to media elements
      const filterStrength = Math.min(intensity * 30, 30); // Cap at 30% sepia
      const contrastBoost = 100 + (intensity * 5); // Boost contrast slightly to compensate
      const brightnessAdjust = 100 + (intensity * 2); // Slightly increase brightness
      
      const mediaFilter = `sepia(${filterStrength}%) contrast(${contrastBoost}%) brightness(${brightnessAdjust}%)`;
      root.style.setProperty('--media-blue-light-filter', mediaFilter);
      
      // Add CSS to create the overlay if it doesn't exist yet
      if (!document.getElementById('blue-light-filter-style')) {
        const style = document.createElement('style');
        style.id = 'blue-light-filter-style';
        style.textContent = `
          /* Apply blue light filter to media elements */
          img, video, canvas, iframe {
            filter: var(--media-blue-light-filter, none);
            transition: filter 0.3s ease;
          }
          
          /* Ensure text remains readable in dark mode */
          .dark [data-blue-light-adjusted="true"] {
            --blue-light-text-compensation: calc(var(--blue-light-intensity, 0) * 10%);
            color: rgba(255, 255, 255, calc(1 + var(--blue-light-text-compensation, 0)));
          }
          
          /* Adjust link colors in dark mode with blue light filter */
          .dark [data-blue-light-adjusted="true"] a:not(.no-blue-light-adjust) {
            --blue-light-link-adjustment: calc(var(--blue-light-intensity, 0) * 15%);
            filter: brightness(calc(100% + var(--blue-light-link-adjustment, 0)));
          }
        `;
        document.head.appendChild(style);
      }
      
      // Mark text elements for adjustment
      document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a')
        .forEach(el => el.setAttribute('data-blue-light-adjusted', 'true'));
        
    } else {
      // Remove blue light filter
      root.style.removeProperty('--blue-light-overlay');
      root.style.removeProperty('--blue-light-intensity');
      root.style.removeProperty('--media-blue-light-filter');
      
      // Remove data attributes
      document.querySelectorAll('[data-blue-light-adjusted]')
        .forEach(el => el.removeAttribute('data-blue-light-adjusted'));
        
      // Remove the style element if it exists
      const styleElement = document.getElementById('blue-light-filter-style');
      if (styleElement) {
        styleElement.remove();
      }
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
