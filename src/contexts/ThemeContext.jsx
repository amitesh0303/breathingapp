import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme } from '../styles/theme';

const THEME_STORAGE_KEY = '@theme_preference';

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored !== null) {
        setIsDark(stored === 'dark');
      }
    } catch (error) {
      // Fallback to default dark theme
    }
  };

  const toggleTheme = useCallback(async () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newIsDark ? 'dark' : 'light');
    } catch (error) {
      // Persist failure is non-critical
    }
  }, [isDark]);

  const reset = useCallback(async () => {
    setIsDark(true);
    try {
      await AsyncStorage.removeItem(THEME_STORAGE_KEY);
    } catch (error) {
      // non-critical
    }
  }, []);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, reset }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
