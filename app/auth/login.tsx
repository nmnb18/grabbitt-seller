import { GradientText } from '@/components/ui/gradient-text';
import { Button } from '@/components/ui/paper-button';
import { AppStyles } from '@/constants/theme';
import { useTheme, useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import {
    Surface,
    Text,
    TextInput,
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';

export default function SellerLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();
    const { login } = useAuthStore();

    const theme = useTheme();
    const backgroundColor = useThemeColor({}, 'background');
    const surfaceVariantColor = useThemeColor({}, 'surfaceVariant');
    const outlineColor = useThemeColor({}, 'outline');
    const accentColor = useThemeColor({}, 'accent');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            await login(email, password, 'seller');
            router.replace('/(tabs)/dashboard');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <Surface style={[styles.iconCircle, { backgroundColor: surfaceVariantColor, borderColor: outlineColor }]} elevation={2}>
                            <Text style={styles.iconEmoji}>🏪</Text>
                        </Surface>

                        <GradientText style={styles.gradientTitle}>
                            Seller Login
                        </GradientText>

                        <Text style={[styles.subtitle, { color: accentColor }]}>
                            Welcome back to Grabbitt!
                        </Text>
                    </View>

                    <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: outlineColor }]} elevation={2}>
                        <View style={styles.form}>
                            <TextInput
                                label="Email"
                                value={email}
                                onChangeText={setEmail}
                                mode="outlined"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                left={<TextInput.Icon icon="email" color={accentColor} />}
                                outlineColor={outlineColor}
                                activeOutlineColor={accentColor}
                                theme={theme}
                            />

                            <TextInput
                                label="Password"
                                value={password}
                                onChangeText={setPassword}
                                mode="outlined"
                                secureTextEntry={!showPassword}
                                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                left={<TextInput.Icon icon="lock" color={accentColor} />}
                                right={
                                    <TextInput.Icon
                                        icon={showPassword ? 'eye-off' : 'eye'}
                                        color={accentColor}
                                        onPress={() => setShowPassword(!showPassword)}
                                    />
                                }
                                outlineColor={outlineColor}
                                activeOutlineColor={accentColor}
                                theme={theme}
                            />

                            {/* Using the new GrabbittButton component */}
                            <Button
                                onPress={handleLogin}
                                loading={loading}
                                disabled={loading}
                                variant="contained"
                                size="medium"
                                fullWidth
                            >
                                Login
                            </Button>

                            {/* Outline button example */}
                            <Button
                                onPress={() => router.push('/auth/register')}
                                variant="outlined"
                                size="medium"
                                fullWidth
                            >
                                Don't have an account? Register
                            </Button>
                        </View>
                    </Surface>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

// ... styles remain the same (remove old button styles)
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: AppStyles.spacing.lg,
        paddingTop: AppStyles.spacing.xxl,
        paddingBottom: AppStyles.spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: AppStyles.spacing.xl
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: AppStyles.spacing.lg,
        borderWidth: 2,
    },
    iconEmoji: {
        fontSize: 40
    },
    gradientTitle: {
        fontFamily: 'Poppins',
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: AppStyles.spacing.sm,
    },
    subtitle: {
        textAlign: 'center',
        fontFamily: 'Inter',
        fontSize: 16,
    },
    formCard: {
        borderRadius: 12,
        padding: AppStyles.spacing.lg,
        borderWidth: 1,
    },
    form: {
        gap: AppStyles.spacing.md
    },
    input: {}
});