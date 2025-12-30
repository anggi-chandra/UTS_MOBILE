import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuthStorage } from '@/hooks/use-auth-storage';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { user, logout, isAuthenticated, syncSession } = useAuthStorage();

    useFocusEffect(
        useCallback(() => {
            syncSession();
        }, [])
    );

    const handleLogout = async () => {
        await logout();
        router.replace('/auth/login');
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <View style={[styles.avatarContainer, { borderColor: theme.text }]}>
                    {user?.avatar_url ? (
                        <Image
                            source={{ uri: user.avatar_url }}
                            style={{ width: 96, height: 96, borderRadius: 48 }}
                            contentFit="cover"
                        />
                    ) : (
                        <Text style={{ fontSize: 60 }}>😎</Text>
                    )}
                </View>
                <Text style={[styles.name, { color: theme.text }]}>{user?.name || 'Guest'}</Text>
                <Text style={[styles.email, { color: theme.icon }]}>{user?.email || 'Please login'}</Text>
                {user?.role === 'admin' && (
                    <View style={{ marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: theme.tint, borderRadius: 12 }}>
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>ADMIN</Text>
                    </View>
                )}
            </View>

            <View style={styles.section}>
                {isAuthenticated ? (
                    <>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Account Settings</Text>

                        <TouchableOpacity
                            style={[styles.menuItem, { borderBottomColor: theme.icon }]}
                            onPress={() => router.push('/profile/edit')}
                        >
                            <IconSymbol name="gear" size={24} color={theme.text} />
                            <Text style={[styles.menuText, { color: theme.text }]}>Edit Profile</Text>
                            <IconSymbol name="chevron.right" size={20} color={theme.icon} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.menuItem, { borderBottomColor: theme.icon }]}
                            onPress={() => Toast.show({ type: 'info', text1: 'Fitur akan segera hadir!' })}
                        >
                            <IconSymbol name="bell.fill" size={24} color={theme.text} />
                            <Text style={[styles.menuText, { color: theme.text }]}>Notifications</Text>
                            <IconSymbol name="chevron.right" size={20} color={theme.icon} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.menuItem, { borderBottomColor: theme.icon }]}
                            onPress={() => Toast.show({ type: 'info', text1: 'Fitur akan segera hadir!' })}
                        >
                            <IconSymbol name="lock.fill" size={24} color={theme.text} />
                            <Text style={[styles.menuText, { color: theme.text }]}>Privacy & Security</Text>
                            <IconSymbol name="chevron.right" size={20} color={theme.icon} />
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                        <Text style={{ color: theme.icon, textAlign: 'center', marginBottom: 20 }}>
                            Log in to manage your account settings, view booking history, and more.
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.section}>
                {isAuthenticated ? (
                    <TouchableOpacity
                        style={[styles.logoutButton, { backgroundColor: '#ff3b30' }]}
                        onPress={handleLogout}
                    >
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.logoutButton, { backgroundColor: theme.tint }]}
                        onPress={() => router.push('/auth/login')}
                    >
                        <Text style={styles.logoutText}>Log In</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#e1e1e1',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 16,
    },
    logoutButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
