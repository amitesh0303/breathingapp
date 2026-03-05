import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PHASE_LABELS } from '../constants/patterns';

export default function PhaseDisplay({ playing, phase, phaseTimeLeft, phaseDuration }) {
  const phaseProgress = phaseDuration > 0 ? 1 - phaseTimeLeft / phaseDuration : 0;

  if (!playing) {
    return (
      <View style={styles.container}>
        <Text style={styles.idleText}>Press play to begin</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.phaseName}>{PHASE_LABELS[phase]}</Text>
      <Text style={styles.phaseTimer}>{phaseTimeLeft}s</Text>
      <View style={styles.barWrap}>
        <View style={[styles.bar, { width: Math.min(phaseProgress, 1) * 180 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
    minHeight: 72,
    justifyContent: 'center',
  },
  phaseName: {
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: 'rgba(140,230,240,0.9)',
  },
  phaseTimer: {
    fontSize: 48,
    fontWeight: '200',
    color: 'rgba(200,245,255,0.95)',
    lineHeight: 52,
  },
  barWrap: {
    width: 180,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#4dd8e6',
  },
  idleText: {
    fontSize: 15,
    color: 'rgba(160,200,220,0.5)',
    letterSpacing: 0.8,
  },
});
