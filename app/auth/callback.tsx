import { useAuthStorage } from '@/hooks/use-auth-storage';
import { supabase } from '@/lib/supabase';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function AuthCallback() {
    const router = useRouter();
    const url = Linking.useURL();

    useEffect(() => {
        let isMounted = true;

        const handleAuth = async () => {
            try {
                const urlToProcess = url || await Linking.getInitialURL();

                if (urlToProcess) {
                    const hashIndex = urlToProcess.indexOf('#');
                    if (hashIndex !== -1) {
                        const hash = urlToProcess.substring(hashIndex + 1);
                        const params = new URLSearchParams(hash);
                        const accessToken = params.get('access_token');
                        const refreshToken = params.get('refresh_token');

                        if (accessToken && refreshToken) {
                            const { data, error } = await supabase.auth.setSession({
                                access_token: accessToken,
                                refresh_token: refreshToken,
                            });

                            if (error) console.error('setSession error:', error);

                            if (!error && data.session) {
                                // Pass the session directly to avoid race conditions with getSession()
                                await useAuthStorage.getState().syncSession(data.session);
                                if (isMounted) {
                                    router.replace('/(tabs)');
                                }
                                return;
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('Error processing callback:', e);
            }

            // Fallback: If we get here, something failed or no tokens were found.
            // Redirect to login or tabs anyway after a short delay to avoid being stuck.
            if (isMounted) {
                setTimeout(() => {
                    router.replace('/(tabs)');
                }, 1000);
            }
        };

        handleAuth();

        return () => {
            isMounted = false;
        };
    }, [url]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={{ marginTop: 20, color: '#333' }}>Menyelesaikan login...</Text>
        </View>
    );
}
