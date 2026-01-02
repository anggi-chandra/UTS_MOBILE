import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getShadowStyle } from '@/lib/ui-utils';
import { Tabs } from 'expo-router';
import { Home, Ticket, User } from 'lucide-react-native';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,

        // ...
        tabBarStyle: {
          backgroundColor: theme.background, // Match theme background
          borderTopWidth: 0,
          height: 90, // Increased height
          paddingBottom: 30, // Increased padding to avoid clipping
          paddingTop: 8,
          ...getShadowStyle(0, 0, 0, 0), // No shadow (Flat) - web & native
        },
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 10,
          marginTop: 4,
          fontFamily: 'Inter_600SemiBold',
        },
        tabBarItemStyle: {
          // Ensure items are centered vertically if needed, but default is usually fine
          justifyContent: 'center',
          marginTop: 4,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'My Orders',
          tabBarIcon: ({ color }) => <Ticket size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'My Account',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
