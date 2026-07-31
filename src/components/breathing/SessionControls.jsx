import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AnimatedButton from '../ui/AnimatedButton';
import { useTheme } from '../../contexts/ThemeContext';
import { useSettings } from '../../contexts/SettingsContext';

export default function SessionControls({ playing, onPlayPause, onReset }) {
  const { theme } = useTheme();
  const { settings } = useSettings();

  const handlePlayPause = () => {
    if (settings.hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {
        // Haptics not available
      }
    }
    onPlayPause();
  };

  const handleReset = () => {
    if (settings.hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Haptics not available
      }
    }
    onReset();
  };

  return (
    <View style={styles.container}>
      <AnimatedButton
        title=""
        variant="ghost"
        onPress={handleReset}
        icon={<Ionicons name="refresh" size={24} color={theme.colors.textSecondary} />}
        style={styles.resetButton}
      />
      <AnimatedButton
        title=""
        variant="primary"
        onPress={handlePlayPause}
        icon={
          <Ionicons
            name={playing ? 'pause' : 'play'}
            size={32}
            color="#ffffff"
          />
        }
        style={styles.playButton}
      />
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  resetButton: {
    width: 48,
    height: 48,
  },
  spacer: {
    width: 48,
  },
});
