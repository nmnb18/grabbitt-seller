import { GradientText } from '@/components/ui/gradient-text';
import { Button } from '@/components/ui/paper-button';
import { useTheme, useThemeColor } from '@/hooks/use-theme-color';
import { ROLE } from '@/utils/constant';
import { AppStyles } from '@/utils/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
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

export default function SellerRegister() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [shopName, setShopName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();
    const { register } = useAuthStore();

    const theme = useTheme();
    const backgroundColor = useThemeColor({}, 'background');
    const surfaceVariantColor = useThemeColor({}, 'surfaceVariant');
    const outlineColor = useThemeColor({}, 'outline');
    const accentColor = useThemeColor({}, 'accent');

    const handleRegister = async () => {
        if (!email || !password || !name || !phone) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setLoading(true);
        const payload = {
            email, password, name, role: ROLE, phone, shopName
        }
        try {
            await register(payload);
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
                        <Image
                            source={require('@/assets/images/logo.png')}
                            style={styles.logo}
                        />

                        <Text style={[styles.subtitle]}>
                            For Business
                        </Text>
                    </View>

                    <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: outlineColor }]} elevation={2}>
                        <GradientText style={styles.gradientTitle}>
                            Registration
                        </GradientText>
                        <View style={styles.form}>
                            <TextInput
                                label="Full Name"
                                value={name}
                                onChangeText={setName}
                                mode="outlined"
                                autoCapitalize="words"
                                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                left={<TextInput.Icon icon="account" />}
                                outlineColor={outlineColor}
                                activeOutlineColor={accentColor}
                                theme={theme}
                            />

                            <TextInput
                                label="Shop Name"
                                value={shopName}
                                onChangeText={setShopName}
                                mode="outlined"
                                autoCapitalize="words"
                                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                left={<TextInput.Icon icon="store" />}
                                outlineColor={outlineColor}
                                activeOutlineColor={accentColor}
                                theme={theme}
                            />

                            <TextInput
                                label="Phone Number"
                                value={phone}
                                onChangeText={setPhone}
                                mode="outlined"
                                keyboardType="phone-pad"
                                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                left={<TextInput.Icon icon="phone" />}
                                outlineColor={outlineColor}
                                activeOutlineColor={accentColor}
                                theme={theme}
                            />

                            <TextInput
                                label="Email"
                                value={email}
                                onChangeText={setEmail}
                                mode="outlined"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                left={<TextInput.Icon icon="email" />}
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
                                left={<TextInput.Icon icon="lock" />}
                                right={
                                    <TextInput.Icon
                                        icon={showPassword ? 'eye-off' : 'eye'}
                                        onPress={() => setShowPassword(!showPassword)}
                                    />
                                }
                                outlineColor={outlineColor}
                                activeOutlineColor={accentColor}
                                theme={theme}
                            />

                            {/* Using the new Button component */}
                            <Button
                                onPress={handleRegister}
                                loading={loading}
                                disabled={loading}
                                variant="contained"
                                size="medium"
                                fullWidth
                            >
                                Register
                            </Button>

                            {/* Text button for navigation */}
                            <Button
                                onPress={() => router.push('/auth/login')}
                                variant="text"
                                size="medium"
                                fullWidth
                            >
                                Already have an account? Login
                            </Button>
                        </View>
                    </Surface>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1
    },

    logo: {
        width: 400,
        height: 150,
        alignSelf: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: AppStyles.spacing.lg,
        paddingTop: AppStyles.spacing.xxxl,
        paddingBottom: AppStyles.spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: AppStyles.spacing.xl
    },
    gradientTitle: {
        fontFamily: 'Poppins',
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: AppStyles.spacing.lg,
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