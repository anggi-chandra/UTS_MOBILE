import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuthStorage } from '@/hooks/use-auth-storage';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    }
  });
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { isAuthenticated } = useAuthStorage();

  React.useEffect(() => {
    let timeout: any;
    if (isAuthenticated) {
      // Add a small delay to ensure the render cycle is complete and WebBrowser is closed
      timeout = setTimeout(() => {
        router.replace('/(tabs)');
      }, 500);
    }
    return () => clearTimeout(timeout);
  }, [isAuthenticated]);

  const onSubmit = async (data: any) => {
    const { email, password } = data;
    setIsLoading(true);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Login Gagal',
          text2: error.message,
        });
        return;
      }

      if (authData.session) {
        await useAuthStorage.getState().syncSession(authData.session);
      }

      Toast.show({
        type: 'success',
        text1: 'Login Berhasil',
        text2: 'Selamat datang kembali!',
      });
      router.replace('/(tabs)');
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Terjadi Kesalahan',
        text2: 'Silakan coba lagi nanti',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const redirectUri = makeRedirectUri({
        scheme: 'cinebook',
        path: 'auth/callback',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

        if (result.type === 'success' && result.url) {
          const params = new URLSearchParams(result.url.split('#')[1]);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            try {
              const { data, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (sessionError) throw sessionError;

              if (data.session) {
                await useAuthStorage.getState().syncSession(data.session);
              }

              Toast.show({
                type: 'success',
                text1: 'Login Berhasil',
                text2: 'Selamat datang!',
              });
              // No manual redirect here, relying on useEffect or callback.tsx
            } catch (innerError) {
              console.error('Error inside handleGoogleLogin inner block:', innerError);
              throw innerError;
            }
          }
        }
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Google Login Gagal',
        text2: error.message || 'Terjadi kesalahan saat login dengan Google',
      });
    } finally {
      setIsLoading(false);
    }
  }; */

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: theme.icon }]}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.text }]}>Email</Text>
          <Controller
            control={control}
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    borderColor: errors.email ? 'red' : theme.icon,
                    backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5'
                  }
                ]}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
            name="email"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email.message as string}</Text>}

          <Text style={[styles.label, { color: theme.text, marginTop: 16 }]}>Password</Text>
          <Controller
            control={control}
            rules={{ required: 'Password is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      borderColor: errors.password ? 'red' : theme.icon,
                      backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
                      flex: 1
                    }
                  ]}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <IconSymbol
                    name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                    size={20}
                    color={theme.icon}
                  />
                </TouchableOpacity>
              </View>
            )}
            name="password"
          />
          {errors.password && <Text style={styles.errorText}>{errors.password.message as string}</Text>}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.tint, opacity: isLoading ? 0.7 : 1 }]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>{isLoading ? 'Loading...' : 'Login'}</Text>
          </TouchableOpacity>

          {/* <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: theme.icon }]} />
            <Text style={[styles.dividerText, { color: theme.icon }]}>OR</Text>
            <View style={[styles.divider, { backgroundColor: theme.icon }]} />
          </View>

          <TouchableOpacity
            style={[styles.googleButton, { borderColor: theme.icon, backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            <Ionicons name="logo-google" size={20} color={theme.text} style={{ marginRight: 10 }} />
            <Text style={[styles.googleButtonText, { color: theme.text }]}>Login with Google</Text>
          </TouchableOpacity> */}

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.text }]}>Don't have an account? </Text>
            <Link href="/auth/register" asChild>
              <TouchableOpacity>
                <Text style={[styles.linkText, { color: theme.tint }]}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
