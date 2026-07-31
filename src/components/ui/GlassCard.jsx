import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

let BlurView;
try {
  BlurView = require('expo-blur').BlurView;
} catch (e) {
  BlurView = null;
}

export default function GlassCard({ children, style, intensity = 30, accessible, accessibilityLabel }) {
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

  const a11yProps = {};
  if (accessible != null) a11yProps.accessible = accessible;
  if (accessibilityLabel) a11yProps.accessibilityLabel = accessibilityLabel;

  if (BlurView && Platform.OS !== 'web') {
    return (
      <View style={containerStyle} {...a11yProps}>
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
    <View style={[containerStyle, { backgroundColor: cardBackground }]} {...a11yProps}>
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
