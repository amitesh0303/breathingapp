import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const NUM_PARTICLES = 7;

function FloatingParticle({ delay, size, startX, startY, color }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateX = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 30 + Math.random() * 40,
          duration: 4000 + Math.random() * 3000,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -(30 + Math.random() * 40),
          duration: 4000 + Math.random() * 3000,
          useNativeDriver: true,
        }),
      ])
    );

    const animateY = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -(20 + Math.random() * 30),
          duration: 5000 + Math.random() * 3000,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 20 + Math.random() * 30,
          duration: 5000 + Math.random() * 3000,
          useNativeDriver: true,
        }),
      ])
    );

    const animateOpacity = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 3000 + Math.random() * 2000,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
      ])
    );

    animateX.start();
    animateY.start();
    animateOpacity.start();

    return () => {
      animateX.stop();
      animateY.stop();
      animateOpacity.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: startX,
          top: startY,
          opacity,
          transform: [{ translateX }, { translateY }],
        },
      ]}
    />
  );
}

export default function GradientBackground({ children, colors }) {
  const { theme } = useTheme();
  const gradientColors = colors || theme.gradients.background;

  const particles = useRef(
    Array.from({ length: NUM_PARTICLES }, (_, i) => ({
      id: i,
      delay: i * 500,
      size: 6 + Math.random() * 12,
      startX: Math.random() * SCREEN_WIDTH * 0.8,
      startY: Math.random() * SCREEN_HEIGHT * 0.8,
      color: i % 2 === 0 ? theme.colors.primary : theme.colors.accent,
    }))
  ).current;

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {particles.map((p) => (
        <FloatingParticle
          key={p.id}
          delay={p.delay}
          size={p.size}
          startX={p.startX}
          startY={p.startY}
          color={p.color}
        />
      ))}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
  },
});
