import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

const RING_COUNT = 4;
const CENTER_SIZE = 80;

function getPhaseColor(phase) {
  switch (phase) {
    case 'inhale':
      return '#06b6d4'; // teal
    case 'holdIn':
      return '#8b5cf6'; // purple
    case 'exhale':
      return '#f59e0b'; // warm orange
    case 'holdOut':
      return '#6366f1'; // indigo
    default:
      return '#06b6d4';
  }
}

function getPhaseScale(phase) {
  switch (phase) {
    case 'inhale':
      return 1.4;
    case 'holdIn':
      return 1.4;
    case 'exhale':
      return 0.8;
    case 'holdOut':
      return 0.8;
    default:
      return 1.0;
  }
}

function Ring({ index, phase, playing, duration }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    if (!playing) {
      scale.value = withTiming(1, { duration: 600 });
      opacity.value = withTiming(0.3, { duration: 600 });
      return;
    }

    const targetScale = getPhaseScale(phase);
    const delay = index * 80;
    const animDuration = duration * 1000;

    scale.value = withTiming(targetScale, {
      duration: animDuration,
      easing: Easing.inOut(Easing.ease),
    });

    opacity.value = withTiming(
      phase === 'inhale' || phase === 'holdIn' ? 0.5 + index * 0.05 : 0.2 + index * 0.03,
      { duration: animDuration, easing: Easing.inOut(Easing.ease) }
    );
  }, [phase, playing, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const ringSize = CENTER_SIZE + (index + 1) * 50;
  const color = getPhaseColor(phase);

  return (
    <Animated.View
      style={[
        styles.ring,
        animatedStyle,
        {
          width: ringSize,
          height: ringSize,
          borderRadius: ringSize / 2,
          borderColor: color,
          borderWidth: 2 - index * 0.3,
        },
      ]}
    />
  );
}

function CenterOrb({ phase, playing, duration }) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);

  useEffect(() => {
    if (!playing) {
      scale.value = withTiming(1, { duration: 600 });
      glowOpacity.value = withTiming(0.4, { duration: 600 });
      return;
    }

    const targetScale = phase === 'inhale' || phase === 'holdIn' ? 1.2 : 0.9;
    const animDuration = duration * 1000;

    scale.value = withTiming(targetScale, {
      duration: animDuration,
      easing: Easing.inOut(Easing.ease),
    });

    glowOpacity.value = withTiming(
      phase === 'inhale' ? 1 : phase === 'holdIn' ? 0.8 : 0.5,
      { duration: animDuration, easing: Easing.inOut(Easing.ease) }
    );
  }, [phase, playing, duration]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: glowOpacity.value,
  }));

  const color = getPhaseColor(phase);

  return (
    <Animated.View
      style={[
        styles.centerOrb,
        orbStyle,
        {
          backgroundColor: color,
          shadowColor: color,
        },
      ]}
    />
  );
}

export default function EnhancedBreathingVisual({ phase = 'inhale', playing = false, duration = 4 }) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {Array.from({ length: RING_COUNT }, (_, i) => (
        <Ring
          key={i}
          index={i}
          phase={phase}
          playing={playing}
          duration={duration}
        />
      ))}
      <CenterOrb phase={phase} playing={playing} duration={duration} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerOrb: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
});
