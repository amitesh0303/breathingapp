import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../src/components/ui/GradientBackground';
import GlassCard from '../../src/components/ui/GlassCard';
import { Heading, Subheading, Body, Caption } from '../../src/components/ui/Typography';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useSession } from '../../src/contexts/SessionContext';
import { PATTERNS } from '../../src/constants/patterns';

const QUOTES = [
  'Breathe in peace, breathe out tension.',
  'The present moment is filled with joy and happiness.',
  'Feelings come and go like clouds in a windy sky.',
  'In the midst of movement and chaos, keep stillness inside of you.',
  'Your calm mind is the ultimate weapon against your challenges.',
  'Inhale the future, exhale the past.',
  'Peace comes from within. Do not seek it without.',
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getDailyQuote() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return QUOTES[dayOfYear % QUOTES.length];
}

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { getStats } = useSession();

  const stats = getStats();
  const patternKeys = Object.keys(PATTERNS);

  const handlePatternPress = (key) => {
    router.push({ pathname: '/(tabs)/breathe', params: { pattern: key } });
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting */}
          <View style={styles.greetingSection}>
            <Heading>{getGreeting()}</Heading>
            <Body style={{ marginTop: 4 }}>{getDailyQuote()}</Body>
          </View>

          {/* Streak */}
          <GlassCard style={styles.streakCard}>
            <View style={styles.streakRow}>
              <Ionicons name="flame" size={28} color="#f59e0b" />
              <View style={styles.streakText}>
                <Subheading style={{ color: theme.colors.text }}>
                  {stats.currentStreak} day streak
                </Subheading>
                <Caption>Keep it going!</Caption>
              </View>
            </View>
          </GlassCard>

          {/* Quick Start */}
          <View style={styles.section}>
            <Subheading style={styles.sectionTitle}>Quick Start</Subheading>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.patternsRow}
            >
              {patternKeys.map((key) => {
                const pattern = PATTERNS[key];
                return (
                  <Pressable key={key} onPress={() => handlePatternPress(key)}>
                    <GlassCard style={styles.patternCard}>
                      <Body style={[styles.patternLabel, { color: theme.colors.text }]}>
                        {pattern.label}
                      </Body>
                      <Caption style={{ color: theme.colors.primary }}>
                        {pattern.inhale}-{pattern.holdIn}-{pattern.exhale}
                        {pattern.holdOut ? `-${pattern.holdOut}` : ''}
                      </Caption>
                    </GlassCard>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Stats Summary */}
          <View style={styles.section}>
            <Subheading style={styles.sectionTitle}>Your Progress</Subheading>
            <View style={styles.statsRow}>
              <GlassCard style={styles.statCard}>
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                <Subheading style={[styles.statNumber, { color: theme.colors.text }]}>
                  {stats.totalSessions}
                </Subheading>
                <Caption>Sessions</Caption>
              </GlassCard>
              <GlassCard style={styles.statCard}>
                <Ionicons name="time" size={24} color={theme.colors.primary} />
                <Subheading style={[styles.statNumber, { color: theme.colors.text }]}>
                  {stats.totalMinutes}
                </Subheading>
                <Caption>Minutes</Caption>
              </GlassCard>
              <GlassCard style={styles.statCard}>
                <Ionicons name="flame" size={24} color="#f59e0b" />
                <Subheading style={[styles.statNumber, { color: theme.colors.text }]}>
                  {stats.longestStreak}
                </Subheading>
                <Caption>Best Streak</Caption>
              </GlassCard>
            </View>
          </View>

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
  greetingSection: {
    marginBottom: 20,
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
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  patternsRow: {
    paddingRight: 20,
  },
  patternCard: {
    width: 120,
    marginRight: 12,
    paddingVertical: 12,
  },
  patternLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
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
});
