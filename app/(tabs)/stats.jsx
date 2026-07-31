import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../src/components/ui/GradientBackground';
import GlassCard from '../../src/components/ui/GlassCard';
import { Heading, Subheading, Body, Caption } from '../../src/components/ui/Typography';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useSession } from '../../src/contexts/SessionContext';
import { PATTERNS } from '../../src/constants/patterns';

const ACHIEVEMENT_ICONS = {
  star: 'star',
  flame: 'flame',
  trophy: 'trophy',
  crown: 'ribbon',
  medal: 'medal',
  sunrise: 'sunny',
  moon: 'moon',
  clock: 'time',
  rocket: 'rocket',
};

export default function StatsScreen() {
  const { theme } = useTheme();
  const { sessions, getStats, achievements } = useSession();
  const stats = getStats();

  const completedSessions = sessions
    .filter((s) => s.completed)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);

  const allAchievements = [
    { id: 'first_session', title: 'First Breath', description: 'Complete your first session', icon: 'star' },
    { id: 'three_day_streak', title: 'Three Day Flow', description: '3-day streak', icon: 'flame' },
    { id: 'seven_day_streak', title: 'Weekly Warrior', description: '7-day streak', icon: 'trophy' },
    { id: 'thirty_day_streak', title: 'Monthly Master', description: '30-day streak', icon: 'crown' },
    { id: 'hundred_sessions', title: 'Century Club', description: '100 sessions', icon: 'medal' },
    { id: 'early_bird', title: 'Early Bird', description: 'Session before 7am', icon: 'sunrise' },
    { id: 'night_owl', title: 'Night Owl', description: 'Session after 10pm', icon: 'moon' },
    { id: 'five_minutes', title: 'Deep Focus', description: '5+ minute session', icon: 'clock' },
    { id: 'marathon', title: 'Marathon Breather', description: '10+ minute session', icon: 'rocket' },
  ];

  const unlockedIds = new Set(achievements.map((a) => a.id));

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Heading style={styles.title}>Statistics</Heading>

          {/* Header Stats */}
          <View style={styles.statsRow}>
            <GlassCard style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                {stats.totalSessions}
              </Text>
              <Caption>Sessions</Caption>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Ionicons name="time" size={24} color={theme.colors.primary} />
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                {stats.totalMinutes}
              </Text>
              <Caption>Minutes</Caption>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Ionicons name="flame" size={24} color="#f59e0b" />
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                {stats.longestStreak}
              </Text>
              <Caption>Best Streak</Caption>
            </GlassCard>
          </View>

          {/* Current Streak */}
          <GlassCard style={styles.streakCard}>
            <View style={styles.streakRow}>
              <Ionicons name="flame" size={32} color="#f59e0b" />
              <View style={styles.streakText}>
                <Subheading style={{ color: theme.colors.text }}>
                  {stats.currentStreak} Day Streak
                </Subheading>
                <Body style={{ color: theme.colors.textMuted }}>
                  {stats.currentStreak > 0
                    ? 'Amazing consistency! Keep breathing.'
                    : 'Start a session to begin your streak!'}
                </Body>
              </View>
            </View>
          </GlassCard>

          {/* Achievements */}
          <Subheading style={styles.sectionTitle}>Achievements</Subheading>
          <View style={styles.achievementsGrid}>
            {allAchievements.map((ach) => {
              const unlocked = unlockedIds.has(ach.id);
              const iconName = ACHIEVEMENT_ICONS[ach.icon] || 'star';
              return (
                <GlassCard
                  key={ach.id}
                  style={styles.achievementCard}
                  accessible={true}
                  accessibilityLabel={`Achievement: ${ach.title}, ${ach.description}${unlocked ? ', unlocked' : ', locked'}`}
                >
                  <Ionicons
                    name={iconName}
                    size={28}
                    color={unlocked ? theme.colors.primary : theme.colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.achievementTitle,
                      { color: unlocked ? theme.colors.text : theme.colors.textMuted },
                    ]}
                  >
                    {ach.title}
                  </Text>
                  <Caption>{ach.description}</Caption>
                </GlassCard>
              );
            })}
          </View>

          {/* Session History */}
          <Subheading style={styles.sectionTitle}>Recent Sessions</Subheading>
          {completedSessions.length === 0 ? (
            <GlassCard>
              <Body style={{ textAlign: 'center', color: theme.colors.textMuted }}>
                No sessions yet. Start breathing!
              </Body>
            </GlassCard>
          ) : (
            completedSessions.map((session) => {
              const pat = PATTERNS[session.pattern];
              const mins = Math.round(session.duration / 60);
              return (
                <GlassCard key={session.id} style={styles.sessionCard}>
                  <View style={styles.sessionRow}>
                    <View>
                      <Body style={{ color: theme.colors.text, fontWeight: '600' }}>
                        {pat ? pat.label : session.pattern}
                      </Body>
                      <Caption>{formatDate(session.date)}</Caption>
                    </View>
                    <View style={styles.sessionRight}>
                      <Caption>{mins} min</Caption>
                      <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
                    </View>
                  </View>
                </GlassCard>
              );
            })
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 2,
  },
  streakCard: {
    marginBottom: 24,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    marginLeft: 12,
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  achievementCard: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 2,
    textAlign: 'center',
  },
  sessionCard: {
    marginBottom: 8,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
