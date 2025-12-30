import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStorage } from '@/hooks/use-auth-storage';
import { useThemeColor } from '@/hooks/use-theme-color';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, setUser } = useAuthStorage();
    const tint = useThemeColor({}, 'tint');
    const textColor = useThemeColor({}, 'text');
    const [name, setName] = useState(user?.name || '');
    const [loading, setLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
    const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');

    const pickImage = async () => {
        try {
            if (Platform.OS !== 'web') {
                const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!perm.granted) {
                    Alert.alert('Izin ditolak', 'Berikan izin akses galeri untuk upload foto profil.');
                    return;
                }
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setAvatarUrl(asset.uri);
                if (asset.mimeType) {
                    setImageMimeType(asset.mimeType);
                }
            }
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Gagal memilih gambar' });
        }
    };

    const handleSave = async () => {
        if (!user) return;
        if (!name.trim()) {
            Toast.show({ type: 'error', text1: 'Nama tidak boleh kosong' });
            return;
        }

        setLoading(true);
        try {
            let finalAvatarUrl = avatarUrl;

            // Upload image if it's a local URI (not already a http url)
            if (avatarUrl && !avatarUrl.startsWith('http')) {
                const ext = imageMimeType.split('/')[1] || 'jpg';
                const fileName = `${user.id}/${Date.now()}.${ext}`;

                if (Platform.OS === 'web') {
                    const res = await fetch(avatarUrl);
                    const blob = await res.blob();
                    const { error: uploadError } = await supabase.storage
                        .from('avatars')
                        .upload(fileName, blob, {
                            contentType: imageMimeType,
                            upsert: true
                        });
                    if (uploadError) throw uploadError;
                } else {
                    const base64 = await FileSystem.readAsStringAsync(avatarUrl, {
                        encoding: 'base64',
                    });
                    const arrayBuffer = decode(base64);
                    const { error: uploadError } = await supabase.storage
                        .from('avatars')
                        .upload(fileName, arrayBuffer, {
                            contentType: imageMimeType,
                            upsert: true
                        });
                    if (uploadError) throw uploadError;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName);

                finalAvatarUrl = publicUrl;
            }

            // Update Supabase Profile
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: name,
                    avatar_url: finalAvatarUrl
                })
                .eq('id', user.id);

            if (error) throw error;

            // Update local state
            setUser({
                ...user,
                name,
                avatar_url: finalAvatarUrl
            });

            Toast.show({ type: 'success', text1: 'Profil berhasil diperbarui' });
            router.back();
        } catch (error: any) {
            console.error('Update profile error:', error);
            Toast.show({ type: 'error', text1: 'Gagal memperbarui profil', text2: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                        {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: '#e1e1e1' }]}>
                                <ThemedText style={{ fontSize: 40 }}>📷</ThemedText>
                            </View>
                        )}
                        <View style={[styles.editIconBadge, { backgroundColor: tint }]}>
                            <ThemedText style={{ color: 'white', fontSize: 12 }}>Edit</ThemedText>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Nama Lengkap</ThemedText>
                    <TextInput
                        style={[styles.input, { color: textColor, borderColor: textColor }]}
                        value={name}
                        onChangeText={setName}
                        placeholder="Masukkan nama lengkap"
                        placeholderTextColor="#999"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: tint, opacity: loading ? 0.7 : 1 }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    <ThemedText style={styles.saveButtonText}>
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </ThemedText>
                </TouchableOpacity>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'white',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    saveButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
