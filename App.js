import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { PATTERNS, PHASES } from './src/constants/patterns';
import BreathingVisual from './src/components/BreathingVisual';
import PhaseDisplay from './src/components/PhaseDisplay';
import Controls from './src/components/Controls';

export default function App() {
  const { width, height } = useWindowDimensions();

  const [playing, setPlaying] = useState(false);
  const [patternKey, setPatternKey] = useState('4-7-8');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(PATTERNS['4-7-8'].inhale);

  const phaseTimerRef = useRef(null);
  const countdownRef = useRef(null);

  const pattern = PATTERNS[patternKey];
  const activePhases = PHASES.filter((p) => pattern[p] > 0);
  const phase = activePhases[phaseIndex % activePhases.length];
  const phaseDuration = pattern[phase];

  const startPhaseTimers = useCallback(
    (pIndex) => {
      // Clear existing timers
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);

      const phases = PHASES.filter((p) => PATTERNS[patternKey][p] > 0);
      const currentPhase = phases[pIndex % phases.length];
      const duration = PATTERNS[patternKey][currentPhase];

      setPhaseTimeLeft(duration);

      // Countdown every second
      countdownRef.current = setInterval(() => {
        setPhaseTimeLeft((prev) => Math.max(prev - 1, 0));
      }, 1000);

      // Transition to next phase
      phaseTimerRef.current = setTimeout(() => {
        clearInterval(countdownRef.current);
        const nextIndex = (pIndex + 1) % phases.length;
        setPhaseIndex(nextIndex);
        startPhaseTimers(nextIndex);
      }, duration * 1000);
    },
    [patternKey]
  );

  const stopTimers = useCallback(() => {
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    phaseTimerRef.current = null;
    countdownRef.current = null;
  }, []);

  useEffect(() => {
    return () => stopTimers();
  }, [stopTimers]);

  const togglePlay = useCallback(() => {
    if (playing) {
      stopTimers();
      setPlaying(false);
      setPhaseIndex(0);
      setPhaseTimeLeft(pattern[activePhases[0]]);
    } else {
      setPhaseIndex(0);
      setPlaying(true);
      startPhaseTimers(0);
    }
  }, [playing, stopTimers, startPhaseTimers, pattern, activePhases]);

  const selectPattern = useCallback(
    (key) => {
      stopTimers();
      setPatternKey(key);
      setPlaying(false);
      setPhaseIndex(0);
      const phases = PHASES.filter((p) => PATTERNS[key][p] > 0);
      setPhaseTimeLeft(PATTERNS[key][phases[0]]);
    },
    [stopTimers]
  );

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="light" />
        <BreathingVisual
          width={width}
          height={height}
          phase={phase}
          playing={playing}
          patternDuration={phaseDuration}
        />
        <SafeAreaView style={styles.app} edges={['top', 'bottom']}>
          {/* Spacer to push content down */}
          <View style={styles.spacer} />
          <PhaseDisplay
            playing={playing}
            phase={phase}
            phaseTimeLeft={phaseTimeLeft}
            phaseDuration={phaseDuration}
          />
          <Controls
            playing={playing}
            patternKey={patternKey}
            phase={phase}
            onTogglePlay={togglePlay}
            onSelectPattern={selectPattern}
          />
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  app: {
    flex: 1,
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
});
