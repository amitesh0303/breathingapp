import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = '@settings';

const defaultSettings = {
  hapticsEnabled: true,
  soundEnabled: true,
  dailyReminderEnabled: false,
  sessionDurationPreference: 5,
};

const SettingsContext = createContext(undefined);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      // Fallback to defaults
    }
  };

  const updateSetting = useCallback(async (key, value) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const reset = useCallback(async () => {
    setSettings(defaultSettings);
    try {
      await AsyncStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch (error) {
      // non-critical
    }
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, reset }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
