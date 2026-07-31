import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../src/components/ui/GradientBackground';
import GlassCard from '../../src/components/ui/GlassCard';
import ProgressRing from '../../src/components/ui/ProgressRing';
import AnimatedButton from '../../src/components/ui/AnimatedButton';
import { Subheading, Body, Caption } from '../../src/components/ui/Typography';
import EnhancedBreathingVisual from '../../src/components/breathing/EnhancedBreathingVisual';
import PatternCard from '../../src/components/breathing/PatternCard';
import SessionControls from '../../src/components/breathing/SessionControls';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useSession } from '../../src/contexts/SessionContext';
import { PATTERNS, PHASES, PHASE_LABELS } from '../../src/constants/patterns';

const DURATION_OPTIONS = [
  { label: '1 min', value: 60 },
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: '\u221E', value: 0 },
];

const ENCOURAGEMENT_MESSAGES = [
  'Your mind and body thank you for this moment of calm.',
  'Every breath is a step toward inner peace.',
  'Consistency builds resilience. Great work!',
  'You showed up for yourself today. That matters.',
  'A calm mind is a powerful mind. Keep going!',
  'Breathe in confidence, breathe out doubt.',
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BreatheScreen() {
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const { addSession } = useSession();

  const [selectedPattern, setSelectedPattern] = useState(params.pattern || '4-7-8');
  const [selectedDuration, setSelectedDuration] = useState(300);
  const [playing, setPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('inhale');
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [encouragement, setEncouragement] = useState('');

  const intervalRef = useRef(null);
  const phaseIndexRef = useRef(0);
  const phaseTimerRef = useRef(0);
  const modalScaleAnim = useRef(new Animated.Value(0)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

  const pattern = PATTERNS[selectedPattern] || PATTERNS['4-7-8'];

  // Get active phases (skip phases with 0 duration)
  const getActivePhases = useCallback(() => {
    return PHASES.filter((p) => pattern[p] > 0);
  }, [pattern]);

  const startSession = useCallback(() => {
    setPlaying(true);
    setSessionComplete(false);
    setTotalElapsed(0);
    phaseIndexRef.current = 0;

    const activePhases = getActivePhases();
    const firstPhase = activePhases[0];
    setCurrentPhase(firstPhase);
    phaseTimerRef.current = pattern[firstPhase];
    setPhaseTimeLeft(pattern[firstPhase]);
  }, [pattern, getActivePhases]);

  const resetSession = useCallback(() => {
    setPlaying(false);
    setSessionComplete(false);
    setTotalElapsed(0);
    phaseIndexRef.current = 0;

    const activePhases = getActivePhases();
    const firstPhase = activePhases[0];
    setCurrentPhase(firstPhase);
    setPhaseTimeLeft(pattern[firstPhase]);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Animate modal out
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pattern, getActivePhases, modalScaleAnim, modalOpacityAnim]);

  const handlePlayPause = () => {
    if (sessionComplete) {
      resetSession();
      return;
    }
    if (!playing) {
      if (totalElapsed === 0) {
        startSession();
      } else {
        setPlaying(true);
      }
    } else {
      setPlaying(false);
    }
  };

  // Animate modal in when session completes
  useEffect(() => {
    if (sessionComplete) {
      const randomMsg = ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
      setEncouragement(randomMsg);

      Animated.parallel([
        Animated.spring(modalScaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [sessionComplete, modalScaleAnim, modalOpacityAnim]);

  // Tick every second
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setTotalElapsed((prev) => prev + 1);
        setPhaseTimeLeft((prev) => {
          if (prev <= 1) {
            // Move to next phase
            const activePhases = getActivePhases();
            phaseIndexRef.current = (phaseIndexRef.current + 1) % activePhases.length;
            const nextPhase = activePhases[phaseIndexRef.current];
            setCurrentPhase(nextPhase);
            phaseTimerRef.current = pattern[nextPhase];
            return pattern[nextPhase];
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [playing, pattern, getActivePhases]);

  // Check if session is complete
  useEffect(() => {
    if (selectedDuration > 0 && totalElapsed >= selectedDuration && playing) {
      setPlaying(false);
      setSessionComplete(true);
      addSession({
        date: new Date().toISOString(),
        pattern: selectedPattern,
        duration: totalElapsed,
        completed: true,
      });
    }
  }, [totalElapsed, selectedDuration, playing]);

  // Update pattern from params
  useEffect(() => {
    if (params.pattern && PATTERNS[params.pattern]) {
      setSelectedPattern(params.pattern);
      resetSession();
    }
  }, [params.pattern]);

  const progress = selectedDuration > 0 ? Math.min(totalElapsed / selectedDuration, 1) : 0;
  const phaseDuration = pattern[currentPhase] || 4;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s} seconds`;
    if (s === 0) return `${m} minute${m > 1 ? 's' : ''}`;
    return `${m}m ${s}s`;
  };

  const patternKeys = Object.keys(PATTERNS);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Breathing Visual */}
          <View style={styles.visualContainer}>
            <EnhancedBreathingVisual
              phase={currentPhase}
              playing={playing}
              duration={phaseDuration}
            />
            {/* Phase label overlay */}
            <View
              style={styles.phaseOverlay}
              accessible={true}
              accessibilityLabel={`Current phase: ${PHASE_LABELS[currentPhase]}, ${phaseTimeLeft} seconds remaining`}
              accessibilityRole="text"
            >
              <Text style={[styles.phaseText, { color: theme.colors.text }]}>
                {PHASE_LABELS[currentPhase]}
              </Text>
              <Text style={[styles.phaseTimer, { color: theme.colors.primary }]}>
                {phaseTimeLeft}
              </Text>
            </View>
          </View>

          {/* Session Progress */}
          {selectedDuration > 0 && (
            <View style={styles.progressSection}>
              <ProgressRing progress={progress} size={60} strokeWidth={4}>
                <Caption>{formatTime(selectedDuration - totalElapsed > 0 ? selectedDuration - totalElapsed : 0)}</Caption>
              </ProgressRing>
            </View>
          )}

          {/* Controls */}
          <SessionControls
            playing={playing}
            onPlayPause={handlePlayPause}
            onReset={resetSession}
          />

          {/* Duration Picker */}
          <View style={styles.durationSection}>
            <Caption style={styles.sectionLabel}>Duration</Caption>
            <View style={styles.durationRow}>
              {DURATION_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => {
                    if (!playing) setSelectedDuration(opt.value);
                  }}
                  disabled={playing}
                  accessibilityLabel={`Select ${opt.label} duration`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedDuration === opt.value }}
                  style={[
                    styles.durationBtn,
                    {
                      backgroundColor:
                        selectedDuration === opt.value
                          ? theme.colors.primary + '30'
                          : theme.colors.card,
                      borderColor:
                        selectedDuration === opt.value
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.durationText,
                      {
                        color:
                          selectedDuration === opt.value
                            ? theme.colors.primary
                            : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Pattern Selector */}
          <View style={styles.patternSection}>
            <Caption style={styles.sectionLabel}>Pattern</Caption>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.patternScroll}
            >
              {patternKeys.map((key) => (
                <PatternCard
                  key={key}
                  patternKey={key}
                  pattern={PATTERNS[key]}
                  isActive={selectedPattern === key}
                  onPress={(k) => {
                    if (!playing) {
                      setSelectedPattern(k);
                      resetSession();
                    }
                  }}
                />
              ))}
            </ScrollView>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Session Complete Overlay */}
        {sessionComplete && (
          <Animated.View
            style={[
              styles.modalOverlay,
              { opacity: modalOpacityAnim },
            ]}
          >
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [{ scale: modalScaleAnim }],
                },
              ]}
            >
              <GlassCard style={styles.modalCard}>
                <Ionicons
                  name="checkmark-circle"
                  size={64}
                  color={theme.colors.success}
                  style={styles.modalIcon}
                />
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Well Done!
                </Text>
                <View style={styles.modalStats}>
                  <View style={styles.modalStatRow}>
                    <Caption>Duration</Caption>
                    <Text style={[styles.modalStatValue, { color: theme.colors.primary }]}>
                      {formatDuration(totalElapsed)}
                    </Text>
                  </View>
                  <View style={styles.modalStatRow}>
                    <Caption>Pattern</Caption>
                    <Text style={[styles.modalStatValue, { color: theme.colors.primary }]}>
                      {pattern.label || selectedPattern}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.modalEncouragement, { color: theme.colors.textMuted }]}>
                  {encouragement}
                </Text>
                <AnimatedButton
                  title="Done"
                  variant="primary"
                  onPress={resetSession}
                  style={styles.modalButton}
                  accessibilityLabel="Dismiss session complete and reset"
                />
              </GlassCard>
            </Animated.View>
          </Animated.View>
        )}
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
    alignItems: 'center',
    paddingTop: 20,
  },
  visualContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  phaseOverlay: {
    position: 'absolute',
    alignItems: 'center',
  },
  phaseText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  phaseTimer: {
    fontSize: 36,
    fontWeight: '700',
  },
  progressSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  durationSection: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
  },
  sectionLabel: {
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  patternSection: {
    width: '100%',
    paddingLeft: 20,
    marginBottom: 20,
  },
  patternScroll: {
    paddingRight: 20,
  },
  // Modal styles
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 360,
  },
  modalCard: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  modalStats: {
    width: '100%',
    marginBottom: 16,
    gap: 8,
  },
  modalStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  modalStatValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalEncouragement: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  modalButton: {
    width: '100%',
  },
});
