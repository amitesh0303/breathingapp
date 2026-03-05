import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

const LUNG_CIRCLES = [
  { ox: 0, oy: 0, r: 1.0 },
  { ox: -0.4, oy: -0.6, r: 0.65 },
  { ox: 0.4, oy: -0.5, r: 0.6 },
  { ox: -0.55, oy: 0.3, r: 0.55 },
  { ox: 0.45, oy: 0.4, r: 0.5 },
];

const BALL_POSITIONS = [
  { ox: 0, oy: -0.25 },
  { ox: -0.3, oy: 0.1 },
  { ox: 0.3, oy: 0.0 },
  { ox: -0.15, oy: 0.4 },
  { ox: 0.2, oy: 0.4 },
  { ox: 0, oy: -0.6 },
];

const BALL_COLORS = [
  'rgba(100,240,240,0.85)',
  'rgba(120,220,255,0.8)',
  'rgba(80,230,230,0.85)',
  'rgba(140,210,255,0.75)',
  'rgba(100,245,240,0.8)',
  'rgba(130,225,250,0.8)',
];

export default function BreathingVisual({ width, height, phase, playing, patternDuration }) {
  const breathFraction = useRef(new Animated.Value(0)).current;
  const currentAnim = useRef(null);

  // Ball drift animations
  const ballDrifts = useRef(
    BALL_POSITIONS.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const anims = ballDrifts.map((drift, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(drift, {
            toValue: 1,
            duration: 2500 + i * 400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(drift, {
            toValue: -1,
            duration: 2500 + i * 400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [ballDrifts]);

  useEffect(() => {
    if (currentAnim.current) {
      currentAnim.current.stop();
      currentAnim.current = null;
    }

    if (!playing) {
      breathFraction.setValue(0);
      return;
    }

    if (phase === 'inhale') {
      breathFraction.setValue(0);
      currentAnim.current = Animated.timing(breathFraction, {
        toValue: 1,
        duration: patternDuration * 1000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      });
      currentAnim.current.start();
    } else if (phase === 'exhale') {
      breathFraction.setValue(1);
      currentAnim.current = Animated.timing(breathFraction, {
        toValue: 0,
        duration: patternDuration * 1000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      });
      currentAnim.current.start();
    } else if (phase === 'holdIn') {
      breathFraction.setValue(1);
    } else {
      breathFraction.setValue(0);
    }

    return () => {
      if (currentAnim.current) {
        currentAnim.current.stop();
      }
    };
  }, [phase, playing, patternDuration, breathFraction]);

  const scale = breathFraction.interpolate({
    inputRange: [0, 1],
    outputRange: [0.78, 1.0],
  });

  const glowOpacity = breathFraction.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.85],
  });

  const bodyOpacity = breathFraction.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.38],
  });

  const ballOpacity = breathFraction.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.95],
  });

  const baseRadius = Math.min(width, height) * 0.115;
  const lungY = height * 0.37;
  const lungSep = width * 0.22;
  const leftX = width / 2 - lungSep;
  const rightX = width / 2 + lungSep;

  const renderLung = (cx, cy, side) => (
    <Animated.View
      key={side}
      style={[
        styles.lungGroup,
        {
          left: cx - baseRadius * 2,
          top: cy - baseRadius * 2,
          width: baseRadius * 4,
          height: baseRadius * 4,
          transform: [{ scale }],
        },
      ]}
    >
      {/* Lung circles */}
      {LUNG_CIRCLES.map(({ ox, oy, r }, i) => {
        const x = ox * baseRadius + baseRadius * 2;
        const y = oy * baseRadius + baseRadius * 2;
        const radius = r * baseRadius;
        const isTeal = i % 2 === 0;
        const baseColor = isTeal
          ? 'rgba(32,200,200,'
          : 'rgba(160,130,255,';

        return (
          <React.Fragment key={`circle-${i}`}>
            {/* Outer glow */}
            <Animated.View
              style={[
                styles.circle,
                {
                  left: x - radius * 1.5,
                  top: y - radius * 1.5,
                  width: radius * 3,
                  height: radius * 3,
                  borderRadius: radius * 1.5,
                  backgroundColor: `${baseColor}0.08)`,
                  opacity: glowOpacity,
                },
              ]}
            />
            {/* Body */}
            <Animated.View
              style={[
                styles.circle,
                {
                  left: x - radius,
                  top: y - radius,
                  width: radius * 2,
                  height: radius * 2,
                  borderRadius: radius,
                  backgroundColor: isTeal
                    ? 'rgba(60,210,220,0.22)'
                    : 'rgba(140,120,240,0.18)',
                  borderWidth: 1,
                  borderColor: `rgba(100,220,240,0.15)`,
                  opacity: bodyOpacity,
                },
              ]}
            />
          </React.Fragment>
        );
      })}

      {/* Floating balls */}
      {BALL_POSITIONS.map(({ ox, oy }, i) => {
        const bx = ox * baseRadius + baseRadius * 2;
        const by = oy * baseRadius + baseRadius * 2;
        const br = baseRadius * 0.085;

        const driftX = ballDrifts[i].interpolate({
          inputRange: [-1, 1],
          outputRange: [-baseRadius * 0.04 * side, baseRadius * 0.04 * side],
        });

        return (
          <React.Fragment key={`ball-${i}`}>
            {/* Ball glow */}
            <Animated.View
              style={[
                styles.circle,
                {
                  left: bx - br * 3,
                  top: by - br * 3,
                  width: br * 6,
                  height: br * 6,
                  borderRadius: br * 3,
                  backgroundColor: 'rgba(100,240,240,0.12)',
                  opacity: ballOpacity,
                  transform: [{ translateX: driftX }],
                },
              ]}
            />
            {/* Ball body */}
            <Animated.View
              style={[
                styles.circle,
                {
                  left: bx - br,
                  top: by - br,
                  width: br * 2,
                  height: br * 2,
                  borderRadius: br,
                  backgroundColor: BALL_COLORS[i],
                  opacity: ballOpacity,
                  transform: [{ translateX: driftX }],
                },
              ]}
            />
          </React.Fragment>
        );
      })}
    </Animated.View>
  );

  return (
    <View style={[styles.container, { width, height }]}>
      {renderLung(leftX, lungY, -1)}
      {renderLung(rightX, lungY, 1)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  lungGroup: {
    position: 'absolute',
  },
  circle: {
    position: 'absolute',
  },
});
