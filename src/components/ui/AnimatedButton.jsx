import React, { useRef } from 'react';
import { Pressable, Animated, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { useSettings } from '../../contexts/SettingsContext';

export default function AnimatedButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  icon,
  style,
}) {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePress = () => {
    if (disabled) return;
    if (settings.hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Haptics not available
      }
    }
    onPress && onPress();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: styles.primaryContainer,
          text: { color: '#ffffff', fontWeight: '600' },
        };
      case 'secondary':
        return {
          container: [
            styles.secondaryContainer,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.cardBorder,
            },
          ],
          text: { color: theme.colors.primary, fontWeight: '600' },
        };
      case 'ghost':
        return {
          container: styles.ghostContainer,
          text: { color: theme.colors.primary, fontWeight: '600' },
        };
      default:
        return {
          container: {},
          text: { color: theme.colors.text },
        };
    }
  };

  const variantStyles = getVariantStyles();

  const renderContent = () => (
    <View style={styles.contentRow}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.text,
          variantStyles.text,
          { fontSize: theme.typography.body.fontSize },
          disabled && styles.disabledText,
        ]}
      >
        {title}
      </Text>
    </View>
  );

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        style={[styles.pressable, disabled && styles.disabled]}
      >
        {variant === 'primary' ? (
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, variantStyles.container]}
          >
            {renderContent()}
          </LinearGradient>
        ) : (
          <View style={[styles.buttonBase, variantStyles.container]}>
            {renderContent()}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonBase: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryContainer: {},
  secondaryContainer: {
    borderWidth: 1,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    textAlign: 'center',
  },
});
