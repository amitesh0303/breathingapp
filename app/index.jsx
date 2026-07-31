import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GradientBackground from '../src/components/ui/GradientBackground';

export default function IndexScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const value = await AsyncStorage.getItem('@onboarding_complete');
      if (value === 'true') {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    } catch (e) {
      router.replace('/onboarding');
    }
    setChecking(false);
  };

  if (checking) {
    return (
      <GradientBackground>
        <View style={styles.container} />
      </GradientBackground>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
