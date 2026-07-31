import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import GlassCard from '../ui/GlassCard';
import { useTheme } from '../../contexts/ThemeContext';

const DIFFICULTY_COLORS = {
  easy: '#10b981',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
};

export default function PatternCard({ pattern, patternKey, isActive, onPress }) {
  const { theme } = useTheme();

  const timing = `${pattern.inhale}-${pattern.holdIn}-${pattern.exhale}${pattern.holdOut ? `-${pattern.holdOut}` : ''}`;
  const difficultyColor = DIFFICULTY_COLORS[pattern.difficulty] || '#94a3b8';

  return (
    <Pressable onPress={() => onPress(patternKey)} style={styles.pressable}>
      <GlassCard
        style={[
          styles.card,
          isActive && {
            borderColor: theme.colors.primary,
            borderWidth: 2,
          },
        ]}
      >
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {pattern.label}
        </Text>
        <Text style={[styles.timing, { color: theme.colors.primary }]}>
          {timing}
        </Text>
        {pattern.description && (
          <Text style={[styles.description, { color: theme.colors.textMuted }]} numberOfLines={1}>
            {pattern.description}
          </Text>
        )}
        {pattern.difficulty && (
          <View style={styles.difficultyRow}>
            <View style={[styles.difficultyDot, { backgroundColor: difficultyColor }]} />
            <Text style={[styles.difficultyText, { color: difficultyColor }]}>
              {pattern.difficulty}
            </Text>
          </View>
        )}
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginRight: 12,
  },
  card: {
    width: 140,
    minHeight: 120,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  timing: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 11,
    marginBottom: 6,
  },
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});
