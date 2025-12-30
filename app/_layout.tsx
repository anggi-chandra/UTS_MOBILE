import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { Colors } from '@/constants/theme';
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

import { useAuthStorage } from '@/hooks/use-auth-storage';
import { useEffect } from 'react';

function RootLayoutInner() {
  const colorScheme = useColorScheme();
  const { initialize } = useAuthStorage();

  useEffect(() => {
    initialize();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: true,
            title: 'CINEBOOK',
            headerTitleAlign: 'center',
            headerStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background },
            headerShadowVisible: false,
            headerTintColor: Colors[colorScheme ?? 'light'].text,
            headerTitleStyle: { fontWeight: '800' },
          }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="movie/[id]" options={{ title: 'Detail Film' }} />
        <Stack.Screen name="manage-movie" options={{ title: 'Kelola Film' }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
      <Toast />
    </ThemeProvider>
  );
}
