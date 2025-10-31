import { useTheme } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  Card,
  Chip,
  Divider,
  SegmentedButtons,
  Text,
  TextInput
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

type QRMode = 'dynamic' | 'static' | 'static_with_code';

export default function SellerGenerateQR() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [qrMode, setQRMode] = useState<QRMode>('dynamic');
  const [hiddenCode, setHiddenCode] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState('60');
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrData, setQrData] = useState<any>(null);
  const sellerTheme = useTheme();

  const handleGenerateQR = async () => {
    if (qrMode === 'static_with_code' && !hiddenCode) {
      Alert.alert('Error', 'Please enter a hidden code');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        qr_type: qrMode,
      };

      if (qrMode === 'dynamic') {
        payload.expires_in = parseInt(expiryMinutes);
      } else if (qrMode === 'static_with_code') {
        payload.hidden_code = hiddenCode;
      }

      const response = await axios.post(
        `${API_URL}/api/qr/generate`,
        payload,
        {
          headers: { Authorization: `Bearer ${user?.token}` }
        }
      );

      setQrImage(response.data.qr_image);
      setQrData(response.data);

      Alert.alert('Success', 'QR code generated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!qrImage) return;

    try {
      await Share.share({
        message: `Scan this QR code to earn loyalty points!`,
        title: 'Loyalty QR Code',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const getModeDescription = () => {
    switch (qrMode) {
      case 'dynamic':
        return 'Expires after set time. Best for temporary use.';
      case 'static':
        return 'Never expires. Can be scanned unlimited times.';
      case 'static_with_code':
        return 'Never expires. Requires hidden code from customer.';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#0D7377', '#14FFEC']}
        style={styles.header}
      >
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Generate QR Code
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Create a QR code for your customers
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* QR Mode Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              🎯 QR Code Type
            </Text>
            <Divider style={styles.divider} />

            <SegmentedButtons
              value={qrMode}
              onValueChange={(value) => {
                setQRMode(value as QRMode);
                setQrImage(null);
                setQrData(null);
              }}
              buttons={[
                {
                  value: 'dynamic',
                  label: 'Dynamic',
                  icon: 'clock-outline',
                },
                {
                  value: 'static',
                  label: 'Static',
                  icon: 'qrcode',
                },
                {
                  value: 'static_with_code',
                  label: 'Hidden',
                  icon: 'lock',
                },
              ]}
              style={styles.segmentedButtons}
            />

            <Card style={styles.infoCard}>
              <Card.Content style={styles.infoContent}>
                <MaterialCommunityIcons
                  name="information"
                  size={20}
                  color={sellerTheme.colors.primary}
                />
                <Text variant="bodySmall" style={styles.infoText}>
                  {getModeDescription()}
                </Text>
              </Card.Content>
            </Card>
          </Card.Content>
        </Card>

        {/* QR Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              ⚙️ Settings
            </Text>
            <Divider style={styles.divider} />

            {qrMode === 'dynamic' && (
              <TextInput
                label="Expiry Time (minutes)"
                value={expiryMinutes}
                onChangeText={setExpiryMinutes}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                left={<TextInput.Icon icon="timer" />}
              />
            )}

            {qrMode === 'static_with_code' && (
              <TextInput
                label="Hidden Code"
                value={hiddenCode}
                onChangeText={setHiddenCode}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="key" />}
                placeholder="Enter a secret code..."
              />
            )}

            <Button
              mode="contained"
              onPress={handleGenerateQR}
              loading={loading}
              disabled={loading}
              style={styles.generateButton}
              contentStyle={styles.generateButtonContent}
              icon="qrcode-plus"
            >
              Generate QR Code
            </Button>
          </Card.Content>
        </Card>

        {/* Generated QR Code */}
        {qrImage && (
          <Card style={styles.qrCard}>
            <LinearGradient
              colors={['#323E48', '#5C6B7A']}
              style={styles.qrCardGradient}
            >
              <View style={styles.qrContainer}>
                <Image
                  source={{ uri: qrImage }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.qrInfo}>
                <Chip
                  icon="check-circle"
                  style={styles.qrChip}
                  textStyle={styles.qrChipText}
                >
                  Active
                </Chip>
                <Text variant="bodySmall" style={styles.qrText}>
                  QR Code ID: {qrData?.qr_id?.substring(0, 8)}...
                </Text>
                {qrMode === 'dynamic' && qrData?.expires_at && (
                  <Text variant="bodySmall" style={styles.qrText}>
                    Expires: {new Date(qrData.expires_at).toLocaleString()}
                  </Text>
                )}
                {qrMode === 'static_with_code' && (
                  <View style={styles.codeContainer}>
                    <MaterialCommunityIcons name="key" size={16} color="#FFFFFF" />
                    <Text variant="bodySmall" style={styles.qrText}>
                      Code: {hiddenCode}
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>

            <Card.Actions>
              <Button onPress={handleShare} icon="share-variant">
                Share
              </Button>
              <Button
                onPress={() => {
                  setQrImage(null);
                  setQrData(null);
                }}
                icon="refresh"
              >
                New QR
              </Button>
            </Card.Actions>
          </Card>
        )}

        {/* Usage Instructions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              📱 How to Use
            </Text>
            <Divider style={styles.divider} />

            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text variant="labelLarge" style={styles.instructionNumberText}>1</Text>
              </View>
              <Text variant="bodyMedium" style={styles.instructionText}>
                Display the QR code to your customer
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text variant="labelLarge" style={styles.instructionNumberText}>2</Text>
              </View>
              <Text variant="bodyMedium" style={styles.instructionText}>
                Customer scans the QR code with their app
              </Text>
            </View>

            {qrMode === 'static_with_code' && (
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text variant="labelLarge" style={styles.instructionNumberText}>3</Text>
                </View>
                <Text variant="bodyMedium" style={styles.instructionText}>
                  Customer enters the hidden code you shared
                </Text>
              </View>
            )}

            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text variant="labelLarge" style={styles.instructionNumberText}>
                  {qrMode === 'static_with_code' ? '4' : '3'}
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.instructionText}>
                Points are automatically added to their wallet!
              </Text>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  divider: {
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  infoCard: {
    elevation: 0,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  generateButton: {
    borderRadius: 12,
  },
  generateButtonContent: {
    paddingVertical: 8,
  },
  qrCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  qrCardGradient: {
    padding: 24,
    alignItems: 'center',
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  qrInfo: {
    alignItems: 'center',
    gap: 8,
  },
  qrChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  qrChipText: {
    color: '#FFFFFF',
  },
  qrText: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  instructionText: {
    flex: 1,
  },
  bottomSpacer: {
    height: 80,
  },
});