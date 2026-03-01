import { ButtonRow, FormCard, FormRow } from '@/components/common';
import { GradientText } from '@/components/ui/gradient-text';
import { Button } from '@/components/ui/paper-button';
import AuthScreenWrapper from '@/components/wrappers/authScreenWrapper';
import { useTheme } from '@/hooks/use-theme-color';
import { userApi } from '@/services';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const theme = useTheme();

    const handleSend = async () => {
        if (!email) return Alert.alert('Error', 'Please enter your email');

        try {
            setLoading(true);
            await userApi.requestPasswordReset(email);
            Alert.alert('Email Sent', 'Check your inbox for reset link.');
            router.replace('/auth/login');
        } catch (error: any) {
            const message =
                error?.response?.data?.error ||
                error?.message ||
                "Password reset failed. Please check your email and try again.";
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthScreenWrapper>
            <FormCard>
                <GradientText style={styles.gradientTitle}>
                    Forgot Password
                </GradientText>

                <Text style={[styles.infoText, { color: theme.colors.accent }]}>
                    Enter your email and we'll send you a password reset link.
                </Text>

                <FormRow>

                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        mode="outlined"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={[styles.input, { backgroundColor: theme.colors.surface }]}
                        left={<TextInput.Icon icon="email" color={theme.colors.onSurface} />}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.onSurface}
                        theme={{
                            ...theme,
                            colors: {
                                ...theme.colors,
                                onSurfaceVariant: theme.colors.onSurfaceDisabled, // ðŸ‘ˆ placeholder color source
                            },
                        }}
                    />
                </FormRow>

                <ButtonRow vertical>
                    <Button
                        onPress={handleSend}
                        loading={loading}
                        disabled={loading}
                        variant="contained"
                        size="medium"
                        fullWidth
                    >
                        Send Reset Link
                    </Button>

                    <Button
                        onPress={() => router.back()}
                        variant="text"
                        size="medium"
                        fullWidth
                    >
                        Back to Login
                    </Button>
                </ButtonRow>
            </FormCard>
        </AuthScreenWrapper>
    );
}


const styles = StyleSheet.create({
    gradientTitle: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 16,
    },
    infoText: {
        textAlign: 'center',
        marginBottom: 16,
    },
    input: {},
});
