import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../src/components/ui/GradientBackground';
import GlassCard from '../src/components/ui/GlassCard';
import AnimatedButton from '../src/components/ui/AnimatedButton';
import { Heading, Body } from '../src/components/ui/Typography';
import { useTheme } from '../src/contexts/ThemeContext';

const BENEFITS = [
  { icon: 'leaf-outline', title: 'Reduce Stress', description: 'Calm your nervous system with guided breathing' },
  { icon: 'bulb-outline', title: 'Improve Focus', description: 'Sharpen your mind through mindful practice' },
  { icon: 'moon-outline', title: 'Better Sleep', description: 'Fall asleep faster with relaxation techniques' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('@onboarding_complete', 'true');
    } catch (e) {
      // non-critical
    }
    router.replace('/(tabs)');
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Heading style={styles.title}>Breathe</Heading>
          <Body style={styles.tagline}>
            Find your calm, one breath at a time
          </Body>
        </Animated.View>

        <Animated.View style={[styles.benefits, { opacity: fadeAnim }]}>
          {BENEFITS.map((benefit, index) => (
            <GlassCard key={benefit.title} style={styles.benefitCard}>
              <View style={styles.benefitRow}>
                <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Ionicons name={benefit.icon} size={28} color={theme.colors.primary} />
                </View>
                <View style={styles.benefitText}>
                  <Body style={[styles.benefitTitle, { color: theme.colors.text }]}>
                    {benefit.title}
                  </Body>
                  <Body style={[styles.benefitDesc, { color: theme.colors.textMuted }]}>
                    {benefit.description}
                  </Body>
                </View>
              </View>
            </GlassCard>
          ))}
        </Animated.View>

        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <AnimatedButton
            title="Get Started"
            variant="primary"
            onPress={handleGetStarted}
            style={styles.button}
            accessibilityLabel="Get started with Breathe app"
          />
        </Animated.View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    marginBottom: 12,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.8,
  },
  benefits: {
    gap: 12,
  },
  benefitCard: {
    marginBottom: 0,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 13,
  },
  footer: {
    alignItems: 'center',
  },
  button: {
    width: '100%',
  },
});
