import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Polygon, Rect } from 'react-native-svg';
import { PATTERNS, PHASES, PHASE_LABELS } from '../constants/patterns';

export default function Controls({
  playing,
  patternKey,
  phase,
  onTogglePlay,
  onSelectPattern,
}) {
  const pattern = PATTERNS[patternKey];
  const activePhases = PHASES.filter((p) => pattern[p] > 0);

  return (
    <View style={styles.container}>
      {/* Pattern selector */}
      <View style={styles.patternRow}>
        {Object.entries(PATTERNS).map(([key, pat]) => (
          <TouchableOpacity
            key={key}
            style={[styles.patternBtn, patternKey === key && styles.patternBtnActive]}
            onPress={() => onSelectPattern(key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.patternBtnText,
                patternKey === key && styles.patternBtnTextActive,
              ]}
            >
              {pat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pattern description */}
      <View style={styles.patternDesc}>
        {activePhases.map((p, i) => (
          <React.Fragment key={p}>
            <Text
              style={[
                styles.descText,
                phase === p && playing && styles.descTextActive,
              ]}
            >
              {PHASE_LABELS[p]} {pattern[p]}s
            </Text>
            {i < activePhases.length - 1 && (
              <Text style={styles.descSep}> – </Text>
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Play / Pause */}
      <TouchableOpacity
        style={styles.playBtn}
        onPress={onTogglePlay}
        activeOpacity={0.7}
        accessibilityLabel={playing ? 'Pause' : 'Play'}
        accessibilityRole="button"
      >
        {playing ? (
          <Svg viewBox="0 0 24 24" width={28} height={28}>
            <Rect x="6" y="5" width="4" height="14" rx="1.5" fill="rgba(160,240,255,0.9)" />
            <Rect x="14" y="5" width="4" height="14" rx="1.5" fill="rgba(160,240,255,0.9)" />
          </Svg>
        ) : (
          <Svg viewBox="0 0 24 24" width={28} height={28}>
            <Polygon points="6,4 20,12 6,20" fill="rgba(160,240,255,0.9)" />
          </Svg>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    paddingTop: 6,
    paddingBottom: 32,
  },
  patternRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  patternBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(100,200,230,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  patternBtnActive: {
    backgroundColor: 'rgba(60,190,220,0.18)',
    borderColor: 'rgba(80,220,240,0.7)',
  },
  patternBtnText: {
    color: 'rgba(160,220,240,0.75)',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.4,
  },
  patternBtnTextActive: {
    color: '#a8f0ff',
  },
  patternDesc: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  descText: {
    fontSize: 13,
    color: 'rgba(160,200,220,0.5)',
    letterSpacing: 0.5,
  },
  descTextActive: {
    color: 'rgba(150,240,255,0.9)',
    fontWeight: '500',
  },
  descSep: {
    fontSize: 13,
    color: 'rgba(160,200,220,0.25)',
  },
  playBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: 'rgba(80,220,240,0.45)',
    backgroundColor: 'rgba(20,40,80,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
