import React from 'react';
import { View, ScrollView, StyleSheet, Switch, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GradientBackground from '../../src/components/ui/GradientBackground';
import GlassCard from '../../src/components/ui/GlassCard';
import AnimatedButton from '../../src/components/ui/AnimatedButton';
import { Heading, Subheading, Body, Caption } from '../../src/components/ui/Typography';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useSettings } from '../../src/contexts/SettingsContext';

function SettingRow({ label, description, children, theme }) {
  return (
    <View style={settingRowStyles.row}>
      <View style={settingRowStyles.textCol}>
        <Body style={{ color: theme.colors.text }}>{label}</Body>
        {description && <Caption>{description}</Caption>}
      </View>
      {children}
    </View>
  );
}

const settingRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  textCol: {
    flex: 1,
    marginRight: 12,
  },
});

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { settings, updateSetting } = useSettings();

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will clear all your sessions, achievements, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              // Only remove app-owned keys instead of clearing all AsyncStorage
              await AsyncStorage.multiRemove([
                '@session_history',
                '@achievements',
                '@theme_preference',
                '@settings',
                '@onboarding_complete',
              ]);
            } catch (e) {
              // non-critical
            }
          },
        },
      ]
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Heading style={styles.title}>Settings</Heading>

          {/* Appearance */}
          <Subheading style={styles.sectionTitle}>Appearance</Subheading>
          <GlassCard style={styles.sectionCard}>
            <SettingRow label="Dark Mode" description="Toggle dark/light theme" theme={theme}>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: theme.colors.primary }}
                thumbColor="#ffffff"
                accessibilityLabel="Toggle dark mode"
                accessibilityRole="switch"
              />
            </SettingRow>
          </GlassCard>

          {/* Feedback */}
          <Subheading style={styles.sectionTitle}>Feedback</Subheading>
          <GlassCard style={styles.sectionCard}>
            <SettingRow label="Haptics" description="Vibration feedback on actions" theme={theme}>
              <Switch
                value={settings.hapticsEnabled}
                onValueChange={(val) => updateSetting('hapticsEnabled', val)}
                trackColor={{ false: '#767577', true: theme.colors.primary }}
                thumbColor="#ffffff"
                accessibilityLabel="Toggle haptic feedback"
                accessibilityRole="switch"
              />
            </SettingRow>
            <View style={styles.separator} />
            <SettingRow label="Sound" description="Audio cues during sessions" theme={theme}>
              <Switch
                value={settings.soundEnabled}
                onValueChange={(val) => updateSetting('soundEnabled', val)}
                trackColor={{ false: '#767577', true: theme.colors.primary }}
                thumbColor="#ffffff"
                accessibilityLabel="Toggle sound"
                accessibilityRole="switch"
              />
            </SettingRow>
          </GlassCard>

          {/* Sessions */}
          <Subheading style={styles.sectionTitle}>Sessions</Subheading>
          <GlassCard style={styles.sectionCard}>
            <SettingRow
              label="Default Duration"
              description={`${settings.sessionDurationPreference} minutes`}
              theme={theme}
            >
              <View style={styles.durationPicker}>
                {[1, 3, 5, 10].map((min) => (
                  <Text
                    key={min}
                    onPress={() => updateSetting('sessionDurationPreference', min)}
                    style={[
                      styles.durationOption,
                      {
                        color:
                          settings.sessionDurationPreference === min
                            ? theme.colors.primary
                            : theme.colors.textMuted,
                        fontWeight:
                          settings.sessionDurationPreference === min ? '700' : '400',
                      },
                    ]}
                  >
                    {min}
                  </Text>
                ))}
              </View>
            </SettingRow>
          </GlassCard>

          {/* About */}
          <Subheading style={styles.sectionTitle}>About</Subheading>
          <GlassCard style={styles.sectionCard}>
            <SettingRow label="Version" theme={theme}>
              <Caption>2.0.0</Caption>
            </SettingRow>
            <View style={styles.separator} />
            <Body style={{ color: theme.colors.textMuted, textAlign: 'center', paddingTop: 8 }}>
              Made with love for mindful breathing
            </Body>
          </GlassCard>

          {/* Data */}
          <Subheading style={styles.sectionTitle}>Data</Subheading>
          <GlassCard style={styles.sectionCard}>
            <AnimatedButton
              title="Reset All Data"
              variant="ghost"
              onPress={handleResetData}
              style={styles.resetButton}
            />
          </GlassCard>

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
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    marginTop: 8,
  },
  sectionCard: {
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 8,
  },
  durationPicker: {
    flexDirection: 'row',
    gap: 12,
  },
  durationOption: {
    fontSize: 16,
    paddingHorizontal: 4,
  },
  resetButton: {
    alignSelf: 'center',
  },
});
