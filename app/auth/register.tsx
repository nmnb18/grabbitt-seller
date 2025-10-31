import { useTheme } from '@/hooks/use-theme-color';
import { ROLE } from '@/utils/constant';
import { LinearGradient } from 'expo-linear-gradient';
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
    Button,
    Surface,
    Text,
    TextInput,
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';

export default function SellerRegister() {
    const sellerTheme = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [shopName, setShopName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();
    const { register } = useAuthStore();

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
        <LinearGradient colors={['#ff6b35', '#ffffff']} style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <Surface style={styles.iconCircle} elevation={0}>
                            <Text style={styles.iconEmoji}>🏪</Text>
                        </Surface>
                        <Text variant="headlineLarge" style={styles.title}>Seller Registration</Text>
                        <Text variant="bodyLarge" style={styles.subtitle}>Create your seller account</Text>
                    </View>

                    <Surface style={styles.formCard} elevation={4}>
                        <View style={styles.form}>
                            <TextInput
                                label="Full Name"
                                value={name}
                                onChangeText={setName}
                                mode="outlined"
                                autoCapitalize="words"
                                style={styles.input}
                                left={<TextInput.Icon icon="store" />}
                            />
                            <TextInput
                                label="Shop Name"
                                value={shopName}
                                onChangeText={setShopName}
                                mode="outlined"
                                autoCapitalize="words"
                                style={styles.input}
                                left={<TextInput.Icon icon="store" />}
                            />

                            <TextInput
                                label="Phone Number"
                                value={phone}
                                onChangeText={setPhone}
                                mode="outlined"
                                keyboardType="phone-pad"
                                style={styles.input}
                                left={<TextInput.Icon icon="phone" />}
                            />

                            <TextInput
                                label="Email"
                                value={email}
                                onChangeText={setEmail}
                                mode="outlined"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={styles.input}
                                left={<TextInput.Icon icon="email" />}
                            />

                            <TextInput
                                label="Password"
                                value={password}
                                onChangeText={setPassword}
                                mode="outlined"
                                secureTextEntry={!showPassword}
                                style={styles.input}
                                left={<TextInput.Icon icon="lock" />}
                                right={
                                    <TextInput.Icon
                                        icon={showPassword ? 'eye-off' : 'eye'}
                                        onPress={() => setShowPassword(!showPassword)}
                                    />
                                }
                            />

                            <Button
                                mode="contained"
                                onPress={handleRegister}
                                loading={loading}
                                disabled={loading}
                                style={styles.button}
                                contentStyle={styles.buttonContent}
                            >
                                Register
                            </Button>

                            <Button
                                mode="text"
                                onPress={() => router.push('/auth/login')}
                                style={styles.switchButton}
                                textColor={sellerTheme.colors.primary}
                            >
                                Already have an account? Login
                            </Button>
                        </View>
                    </Surface>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: { alignItems: 'center', marginBottom: 32 },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconEmoji: { fontSize: 40 },
    title: {
        color: '#FFFFFF',
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        color: '#FFFFFF',
        opacity: 0.9,
        textAlign: 'center',
    },
    formCard: { borderRadius: 24, padding: 24, backgroundColor: '#FFFFFF' },
    form: { gap: 16 },
    input: { backgroundColor: '#FFFFFF' },
    button: { marginTop: 8, borderRadius: 12 },
    buttonContent: { paddingVertical: 8 },
    switchButton: { marginTop: 8 },
});
