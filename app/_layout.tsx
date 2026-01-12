import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts as useInterFonts,
} from '@expo-google-fonts/inter';
import {
  Outfit_400Regular,
  Outfit_600SemiBold,
  Outfit_700Bold,
  useFonts as useOutfitFonts,
} from '@expo-google-fonts/outfit';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import Airbridge from 'airbridge-react-native-sdk';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';


import { Colors } from '@/constants/theme';
import { useAuthStorage } from '@/hooks/use-auth-storage';
import { ColorSchemeProvider, useColorScheme } from '@/hooks/use-color-scheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [outfitLoaded] = useOutfitFonts({
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (interLoaded && outfitLoaded) {
      SplashScreen.hideAsync();
    }
  }, [interLoaded, outfitLoaded]);

  if (!interLoaded || !outfitLoaded) {
    return null;
  }

  return (
    <ColorSchemeProvider>
      <RootLayoutInner />
    </ColorSchemeProvider>
  );
}

function RootLayoutInner() {
  const colorScheme = useColorScheme();
  const { initialize } = useAuthStorage();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (Airbridge && (Airbridge as any).init) {
      (Airbridge as any).init("Nama Project", "token SDK");
    } else {
      console.log("Airbridge is not available");
    }
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
