import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function RegisterScreen() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { control, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        }
    });
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const password = watch('password');

    const onSubmit = async (data: any) => {
        const { email, password, name } = data;

        try {
            const { error, data: signUpData } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                    }
                }
            });

            if (error) {
                Toast.show({
                    type: 'error',
                    text1: 'Registration Failed',
                    text2: error.message,
                });
                return;
            }

            if (signUpData.session) {
                Toast.show({
                    type: 'success',
                    text1: 'Registration Successful',
                    text2: 'Welcome to Cinebook!',
                });
                router.replace('/(tabs)');
            } else {
                // Email confirmation required
                Toast.show({
                    type: 'success',
                    text1: 'Registration Successful',
                    text2: 'Please check your email to verify your account.',
                });
                router.replace('/auth/login');
            }
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: err.message || 'Something went wrong',
            });
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
                    <Text style={[styles.subtitle, { color: theme.icon }]}>Sign up to get started</Text>
                </View>

                <View style={styles.form}>
                    <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
                    <Controller
                        control={control}
                        rules={{ required: 'Name is required' }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        color: theme.text,
                                        borderColor: errors.name ? 'red' : theme.icon,
                                        backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5'
                                    }
                                ]}
                                placeholder="Enter your full name"
                                placeholderTextColor="#999"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                        name="name"
                    />
                    {errors.name && <Text style={styles.errorText}>{errors.name.message as string}</Text>}

                    <Text style={[styles.label, { color: theme.text, marginTop: 16 }]}>Email</Text>
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
                        rules={{
                            required: 'Password is required',
                            minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters',
                            }
                        }}
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

                    <Text style={[styles.label, { color: theme.text, marginTop: 16 }]}>Confirm Password</Text>
                    <Controller
                        control={control}
                        rules={{
                            required: 'Confirm Password is required',
                            validate: value => value === password || 'Passwords do not match',
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            color: theme.text,
                                            borderColor: errors.confirmPassword ? 'red' : theme.icon,
                                            backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
                                            flex: 1
                                        }
                                    ]}
                                    placeholder="Confirm your password"
                                    placeholderTextColor="#999"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <IconSymbol
                                        name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                                        size={20}
                                        color={theme.icon}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                        name="confirmPassword"
                    />
                    {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message as string}</Text>}

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.tint }]}
                        onPress={handleSubmit(onSubmit)}
                    >
                        <Text style={styles.buttonText}>Register</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: theme.text }]}>Already have an account? </Text>
                        <Link href="/auth/login" asChild>
                            <TouchableOpacity>
                                <Text style={[styles.linkText, { color: theme.tint }]}>Login</Text>
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
});
