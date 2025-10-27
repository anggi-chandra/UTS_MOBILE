import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import 'react-native-reanimated';

import { ColorSchemeProvider, useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <ColorSchemeProvider>
      <RootLayoutInner />
    </ColorSchemeProvider>
  );
}

function RootLayoutInner() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="movie/[id]" options={{ title: 'Detail Film' }} />
        <Stack.Screen name="manage-movie" options={{ title: 'Kelola Film' }} />
      </Stack>
      <StatusBar style="auto" />
      <Toast />
    </ThemeProvider>
  );
}
