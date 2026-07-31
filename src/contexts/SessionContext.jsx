import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_HISTORY_KEY = '@session_history';
const ACHIEVEMENTS_KEY = '@achievements';

const ACHIEVEMENT_DEFINITIONS = [
  { id: 'first_session', title: 'First Breath', description: 'Complete your first session', icon: 'star' },
  { id: 'three_day_streak', title: 'Three Day Flow', description: 'Maintain a 3-day streak', icon: 'flame' },
  { id: 'seven_day_streak', title: 'Weekly Warrior', description: 'Maintain a 7-day streak', icon: 'trophy' },
  { id: 'thirty_day_streak', title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: 'crown' },
  { id: 'hundred_sessions', title: 'Century Club', description: 'Complete 100 sessions', icon: 'medal' },
  { id: 'early_bird', title: 'Early Bird', description: 'Complete a session before 7am', icon: 'sunrise' },
  { id: 'night_owl', title: 'Night Owl', description: 'Complete a session after 10pm', icon: 'moon' },
  { id: 'five_minutes', title: 'Deep Focus', description: 'Complete a 5+ minute session', icon: 'clock' },
  { id: 'marathon', title: 'Marathon Breather', description: 'Complete a 10+ minute session', icon: 'rocket' },
];

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

  const addSession = useCallback(
    async (session) => {
      const newSession = {
        id: Date.now().toString(),
        ...session,
      };

      const updatedSessions = [...sessions, newSession];
      setSessions(updatedSessions);

      const { currentStreak } = calculateStreak(updatedSessions);
      const updatedAchievements = checkAchievements(updatedSessions, currentStreak, achievements);
      setAchievements(updatedAchievements);

      try {
        await Promise.all([
          AsyncStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(updatedSessions)),
          AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(updatedAchievements)),
        ]);
      } catch (error) {
        // Persist failure is non-critical
      }
    },
    [sessions, achievements]
  );

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

  const value = useMemo(
    () => ({ sessions, addSession, getStats, getAchievements, achievements }),
    [sessions, addSession, getStats, getAchievements, achievements]
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
