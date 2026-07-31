import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { SettingsProvider } from '../src/contexts/SettingsContext';
import { SessionProvider } from '../src/contexts/SessionContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <SessionProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#0a0a1a' },
            }}
          />
        </SessionProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
