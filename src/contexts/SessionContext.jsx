import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACHIEVEMENT_DEFINITIONS } from '../constants/achievements';

const SESSION_HISTORY_KEY = '@session_history';
const ACHIEVEMENTS_KEY = '@achievements';

// Maximum sessions to keep in memory/storage to prevent unbounded growth
const MAX_STORED_SESSIONS = 500;

const SessionContext = createContext(undefined);

function calculateStreak(sessions) {
  if (!sessions || sessions.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const completedSessions = sessions
    .filter((s) => s.completed)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (completedSessions.length === 0) return { currentStreak: 0, longestStreak: 0 };

  // Get unique dates (by day)
  const uniqueDays = [...new Set(completedSessions.map((s) => s.date.split('T')[0]))].sort(
    (a, b) => new Date(b) - new Date(a)
  );

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < uniqueDays.length; i++) {
    const sessionDate = new Date(uniqueDays[i]);
    sessionDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - sessionDate) / (1000 * 60 * 60 * 24));

    if (diffDays === i || diffDays === i + 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diff = Math.floor((prev - curr) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return { currentStreak, longestStreak };
}

function checkAchievements(sessions, currentStreak, existingAchievements) {
  const newAchievements = [...existingAchievements];
  const unlockedIds = new Set(existingAchievements.map((a) => a.id));
  const now = new Date().toISOString();

  const completedSessions = sessions.filter((s) => s.completed);
  const totalSessions = completedSessions.length;

  // First session
  if (totalSessions >= 1 && !unlockedIds.has('first_session')) {
    newAchievements.push({ ...ACHIEVEMENT_DEFINITIONS.find((a) => a.id === 'first_session'), unlockedAt: now });
  }

  // Streak achievements
  if (currentStreak >= 3 && !unlockedIds.has('three_day_streak')) {
    newAchievements.push({ ...ACHIEVEMENT_DEFINITIONS.find((a) => a.id === 'three_day_streak'), unlockedAt: now });
  }
  if (currentStreak >= 7 && !unlockedIds.has('seven_day_streak')) {
    newAchievements.push({ ...ACHIEVEMENT_DEFINITIONS.find((a) => a.id === 'seven_day_streak'), unlockedAt: now });
  }
  if (currentStreak >= 30 && !unlockedIds.has('thirty_day_streak')) {
    newAchievements.push({ ...ACHIEVEMENT_DEFINITIONS.find((a) => a.id === 'thirty_day_streak'), unlockedAt: now });
  }

  // Hundred sessions
  if (totalSessions >= 100 && !unlockedIds.has('hundred_sessions')) {
    newAchievements.push({ ...ACHIEVEMENT_DEFINITIONS.find((a) => a.id === 'hundred_sessions'), unlockedAt: now });
  }

  // Time-based achievements - check latest session
  if (completedSessions.length > 0) {
    const latest = completedSessions[completedSessions.length - 1];
    const latestDate = new Date(latest.date);
    const hour = latestDate.getHours();

    if (hour < 7 && !unlockedIds.has('early_bird')) {
      newAchievements.push({ ...ACHIEVEMENT_DEFINITIONS.find((a) => a.id === 'early_bird'), unlockedAt: now });
    }
    if (hour >= 22 && !unlockedIds.has('night_owl')) {
      newAchievements.push({ ...ACHIEVEMENT_DEFINITIONS.find((a) => a.id === 'night_owl'), unlockedAt: now });
    }

    // Duration-based
    if (latest.duration >= 300 && !unlockedIds.has('five_minutes')) {
      newAchievements.push({ ...ACHIEVEMENT_DEFINITIONS.find((a) => a.id === 'five_minutes'), unlockedAt: now });
    }
    if (latest.duration >= 600 && !unlockedIds.has('marathon')) {
      newAchievements.push({ ...ACHIEVEMENT_DEFINITIONS.find((a) => a.id === 'marathon'), unlockedAt: now });
    }
  }

  return newAchievements;
}

export function SessionProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // Use refs to avoid stale closure in addSession
  const sessionsRef = useRef(sessions);
  const achievementsRef = useRef(achievements);

  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedSessions, storedAchievements] = await Promise.all([
        AsyncStorage.getItem(SESSION_HISTORY_KEY),
        AsyncStorage.getItem(ACHIEVEMENTS_KEY),
      ]);

      if (storedSessions !== null) {
        setSessions(JSON.parse(storedSessions));
      }
      if (storedAchievements !== null) {
        setAchievements(JSON.parse(storedAchievements));
      }
    } catch (error) {
      // Fallback to empty state
    }
  };

  const addSession = useCallback(async (session) => {
    const newSession = {
      id: Date.now().toString(),
      ...session,
    };

    // Use functional updater to avoid stale closure over sessions
    let updatedSessions;
    setSessions((prev) => {
      updatedSessions = [...prev, newSession];
      // Trim to MAX_STORED_SESSIONS to prevent unbounded growth
      if (updatedSessions.length > MAX_STORED_SESSIONS) {
        updatedSessions = updatedSessions.slice(updatedSessions.length - MAX_STORED_SESSIONS);
      }
      return updatedSessions;
    });

    // Use ref for achievements to get the latest value and update inline to avoid timing window
    const currentAchievements = achievementsRef.current;
    const currentSessions = [...sessionsRef.current, newSession];
    const { currentStreak } = calculateStreak(currentSessions);
    const updatedAchievements = checkAchievements(currentSessions, currentStreak, currentAchievements);
    // Update ref inline before setAchievements to prevent duplicate grants on rapid calls
    achievementsRef.current = updatedAchievements;
    setAchievements(updatedAchievements);

    try {
      const sessionsToStore = currentSessions.length > MAX_STORED_SESSIONS
        ? currentSessions.slice(currentSessions.length - MAX_STORED_SESSIONS)
        : currentSessions;
      await Promise.all([
        AsyncStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(sessionsToStore)),
        AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(updatedAchievements)),
      ]);
    } catch (error) {
      // Persist failure is non-critical
    }
  }, []);

  const getStats = useCallback(() => {
    const completedSessions = sessions.filter((s) => s.completed);
    const { currentStreak, longestStreak } = calculateStreak(sessions);
    const totalMinutes = Math.round(
      completedSessions.reduce((sum, s) => sum + s.duration, 0) / 60
    );

    return {
      totalSessions: completedSessions.length,
      totalMinutes,
      currentStreak,
      longestStreak,
    };
  }, [sessions]);

  const getAchievements = useCallback(() => {
    return achievements;
  }, [achievements]);

  const reset = useCallback(async () => {
    setSessions([]);
    setAchievements([]);
    sessionsRef.current = [];
    achievementsRef.current = [];
    try {
      await AsyncStorage.multiRemove([SESSION_HISTORY_KEY, ACHIEVEMENTS_KEY]);
    } catch (error) {
      // non-critical
    }
  }, []);

  const value = useMemo(
    () => ({ sessions, addSession, getStats, getAchievements, achievements, reset }),
    [sessions, addSession, getStats, getAchievements, achievements, reset]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
