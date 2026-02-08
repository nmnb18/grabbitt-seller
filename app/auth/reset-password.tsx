import { ButtonRow, FormCard, FormRow } from '@/components/common';
import { GradientText } from '@/components/ui/gradient-text';
import { Button } from '@/components/ui/paper-button';
import AuthScreenWrapper from '@/components/wrappers/authScreenWrapper';
import { useTheme } from '@/hooks/use-theme-color';
import { userApi } from '@/services';
import { isValidPassword } from '@/utils/helper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
} from 'react-native';
import { TextInput } from 'react-native-paper';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { oobCode } = useLocalSearchParams();

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [show, setShow] = useState(false);
    const [show2, setShow2] = useState(false);
    const [loading, setLoading] = useState(false);

    const theme = useTheme();

    useEffect(() => {
        if (!oobCode) {
            Alert.alert('Invalid Link', 'This reset link is invalid or expired.', [
                { text: 'OK', onPress: () => router.replace('/auth/login') },
            ]);
        }
    }, []);

    const handleReset = async () => {
        if (!password || !confirm)
            return Alert.alert('Error', 'All fields are required.');
        if (!isValidPassword(password)) {
            Alert.alert(
                'Weak Password',
                'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number and 1 special character.'
            );
            return false;
        }

        if (password !== confirm)
            return Alert.alert('Error', 'Passwords do not match.');

        try {
            setLoading(true);
            await userApi.confirmPasswordReset(oobCode as string, password);
            router.replace(`/auth/reset-success`);

        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthScreenWrapper>
            <FormCard>
                <GradientText style={styles.gradientTitle}>Reset Password</GradientText>

                <FormRow>
                    <TextInput
                        label="New Password"
                        value={password}
                        onChangeText={setPassword}
                        mode="outlined"
                        secureTextEntry={!show}
                        style={[styles.input, { backgroundColor: theme.colors.surface }]}
                        left={<TextInput.Icon color={theme.colors.onSurface} icon="lock" />}
                        right={<TextInput.Icon color={theme.colors.onSurface} icon={show ? 'eye-off' : 'eye'} onPress={() => setShow(!show)} />}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.onSurface}
                        theme={{
                            ...theme,
                            colors: {
                                ...theme.colors,
                                onSurfaceVariant: theme.colors.onSurfaceDisabled, // 👈 placeholder color source
                            },
                        }}
                    />

                    <TextInput
                        label="Confirm Password"
                        value={confirm}
                        onChangeText={setConfirm}
                        mode="outlined"
                        secureTextEntry={!show2}
                        style={[styles.input, { backgroundColor: theme.colors.surface }]}
                        left={<TextInput.Icon color={theme.colors.onSurface} icon="lock-check" />}
                        right={<TextInput.Icon color={theme.colors.onSurface} icon={show2 ? 'eye-off' : 'eye'} onPress={() => setShow2(!show2)} />}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.onSurface}
                        theme={{
                            ...theme,
                            colors: {
                                ...theme.colors,
                                onSurfaceVariant: theme.colors.onSurfaceDisabled,
                            },
                        }}
                    />
                </FormRow>

                <ButtonRow vertical>
                    <Button
                        variant="contained"
                        fullWidth
                        loading={loading}
                        disabled={loading}
                        onPress={handleReset}
                    >
                        Update Password
                    </Button>

                    <Button
                        variant="text"
                        fullWidth
                        onPress={() => router.replace('/auth/login')}
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
    input: {},
});
