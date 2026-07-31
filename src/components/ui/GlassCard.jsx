import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

let BlurView;
try {
  BlurView = require('expo-blur').BlurView;
} catch (e) {
  BlurView = null;
}

export default function GlassCard({ children, style, intensity = 30 }) {
  const { theme, isDark } = useTheme();

  const cardBackground = isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(255, 255, 255, 0.7)';

  const borderColor = isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.08)';

  const containerStyle = [
    styles.container,
    {
      borderRadius: theme.borderRadius.lg,
      borderColor,
    },
    style,
  ];

  if (BlurView && Platform.OS !== 'web') {
    return (
      <View style={containerStyle}>
        <BlurView
          intensity={intensity}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.content, { backgroundColor: cardBackground }]}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <View style={[containerStyle, { backgroundColor: cardBackground }]}>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
