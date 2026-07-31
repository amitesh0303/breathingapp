import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export function Heading({ children, style, ...props }) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        {
          ...theme.typography.heading,
          color: theme.colors.text,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Subheading({ children, style, ...props }) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        {
          ...theme.typography.subheading,
          color: theme.colors.text,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Body({ children, style, ...props }) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        {
          ...theme.typography.body,
          color: theme.colors.textSecondary,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Caption({ children, style, ...props }) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        {
          ...theme.typography.caption,
          color: theme.colors.textMuted,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
