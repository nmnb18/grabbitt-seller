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
  SegmentedButtons,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import { sellerTheme } from '../constants/sellerTheme';
import { useAuthStore } from '../store/authStore';

export default function SellerAuth() {
  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();
  const { loginWithEmail, registerWithEmail } = useAuthStore();

  const handleEmailAuth = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await loginWithEmail(email, password, 'seller');
      } else {
        await registerWithEmail(email, password, name, 'seller');
      }
      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = () => {
    Alert.alert(
      'Phone Auth Not Available',
      'Phone authentication requires physical device testing. Please use Email/Password for now.',
      [{ text: 'OK', onPress: () => setAuthMode('email') }]
    );
  };

  return (
    <LinearGradient
      colors={['#ff6b35', '#ffffff']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Surface style={styles.iconCircle} elevation={0}>
              <Text style={styles.iconEmoji}>🏪</Text>
            </Surface>
            <Text variant="headlineLarge" style={styles.title}>
              {isLogin ? 'Seller Login' : 'Seller Registration'}
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              {isLogin ? 'Welcome back!' : 'Create your seller account'}
            </Text>
          </View>

          <Surface style={styles.formCard} elevation={4}>
            <SegmentedButtons
              value={authMode}
              onValueChange={(value) => {
                if (value === 'phone') {
                  handleSendOTP();
                } else {
                  setAuthMode(value as 'email' | 'phone');
                }
              }}
              buttons={[
                {
                  value: 'email',
                  label: 'Email',
                  icon: 'email',
                },
                {
                  value: 'phone',
                  label: 'Phone OTP',
                  icon: 'phone',
                },
              ]}
              style={styles.segmentedButtons}
            />

            <View style={styles.form}>
              {!isLogin && (
                <TextInput
                  label="Shop Name"
                  value={name}
                  onChangeText={setName}
                  mode="outlined"
                  autoCapitalize="words"
                  style={styles.input}
                  left={<TextInput.Icon icon="store" />}
                />
              )}

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
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />

              <Button
                mode="contained"
                onPress={handleEmailAuth}
                loading={loading}
                disabled={loading}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                {isLogin ? 'Login' : 'Register'}
              </Button>

              <Button
                mode="text"
                onPress={() => setIsLogin(!isLogin)}
                style={styles.switchButton}
                textColor={sellerTheme.colors.primary}
              >
                {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
              </Button>
            </View>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 40,
  },
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
  formCard: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  segmentedButtons: {
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  switchButton: {
    marginTop: 8,
  },
});