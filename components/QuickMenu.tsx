import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorSchemeController } from '@/hooks/use-color-scheme';
import { getShadowStyle } from '@/lib/ui-utils';
import { Clapperboard, Film, Popcorn, Ticket } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const MENU_ITEMS = [
    { id: 'cinema', label: 'Cinema', icon: Clapperboard, color: '#F59E0B' }, // Amber
    { id: 'movies', label: 'Movies', icon: Film, color: '#3B82F6' }, // Blue
    { id: 'food', label: 'm.food', icon: Popcorn, color: '#EF4444' }, // Red
    { id: 'booking', label: 'Private', icon: Ticket, color: '#10B981' }, // Emerald
];

export function QuickMenu() {
    const { scheme } = useColorSchemeController();
    const themeColors = Colors[scheme ?? 'light'];
    const isDark = scheme === 'dark';

    return (
        <View style={styles.container}>
            {MENU_ITEMS.map((item) => (
                <TouchableOpacity key={item.id} style={styles.menuItem} activeOpacity={0.7}>
                    <View style={[
                        styles.iconContainer,
                        {
                            borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                            ...getShadowStyle(0.1, 8, 4, 3)
                        }
                    ]}>
                        <item.icon size={28} color={item.color} strokeWidth={1.5} />
                    </View>
                    <ThemedText style={styles.label}>{item.label}</ThemedText>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    menuItem: {
        alignItems: 'center',
        gap: 8,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
        opacity: 0.8,
    },
});
