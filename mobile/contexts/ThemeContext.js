import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemTheme === "dark");

  useEffect(() => {
    // Load theme preference from storage
    const loadTheme = async () => {
      try {
        const saved = await SecureStore.getItemAsync("theme-preference");
        if (saved) {
          setIsDark(saved === "dark");
        } else {
          setIsDark(systemTheme === "dark");
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      setIsDark(!isDark);
      await SecureStore.setItemAsync(
        "theme-preference",
        isDark ? "light" : "dark"
      );
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
