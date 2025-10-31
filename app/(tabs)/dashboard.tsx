import { useTheme } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Card,
  Chip,
  IconButton,
  Surface,
  Text
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

interface StatCardProps {
  icon: string;
  value: number;
  label: string;
  color: string;
  gradientColors: [string, string];
}

const StatCard = ({ icon, value, label, color, gradientColors }: StatCardProps) => (
  <Card style={styles.statCard} elevation={2}>
    <LinearGradient
      colors={gradientColors}
      style={styles.statGradient}
    >
      <MaterialCommunityIcons name={icon as any} size={32} color="#FFFFFF" />
      <Text variant="headlineMedium" style={styles.statValue}>
        {value}
      </Text>
      <Text variant="bodySmall" style={styles.statLabel}>
        {label}
      </Text>
    </LinearGradient>
  </Card>
);

interface ActionCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  iconColor: string;
}

const ActionCard = ({ icon, title, subtitle, onPress, iconColor }: ActionCardProps) => (
  <Card style={styles.actionCard} elevation={1} onPress={onPress}>
    <Card.Content style={styles.actionCardContent}>
      <Surface style={[styles.actionIcon, { backgroundColor: `${iconColor}20` }]} elevation={0}>
        <MaterialCommunityIcons name={icon as any} size={28} color={iconColor} />
      </Surface>
      <View style={styles.actionTextContainer}>
        <Text variant="titleMedium" style={styles.actionTitle}>{title}</Text>
        <Text variant="bodySmall" style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
    </Card.Content>
  </Card>
);

export default function SellerDashboard() {
  const { user, logout, } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const sellerTheme = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setTimeout(() => {
      setLoading(false);
    }, 2000)
    // try {
    //   // Load profile
    //   const profileRes = await axios.get(`${API_URL}/api/sellers/profile`, {
    //     headers: { Authorization: `Bearer ${user?.token}` }
    //   });
    //   setProfile(profileRes.data);

    //   // Load stats
    //   const statsRes = await axios.get(`${API_URL}/api/sellers/stats`, {
    //     headers: { Authorization: `Bearer ${user?.token}` }
    //   });
    //   setStats(statsRes.data);
    // } catch (error: any) {
    //   if (error.response?.status === 404) {
    //     // No profile yet, redirect to setup
    //     router.push('/seller/profile-setup');
    //   } else {
    //     console.error('Load error:', error);
    //   }
    // } finally {
    //   setLoading(false);
    //   setRefreshing(false);
    // }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await logout(user?.uid ?? '');
          router.replace('/auth/login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={sellerTheme.colors.primary} />
      </View>
    );
  }

  // if (!profile) {
  //   return null;
  // }

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#0D7377', '#14FFEC']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text variant="labelMedium" style={styles.greeting}>Welcome back,</Text>
            <Text variant="headlineSmall" style={styles.shopName}>{user?.shopName}</Text>
            <Chip
              mode="flat"
              icon="store"
              style={styles.categoryChip}
              textStyle={styles.chipText}
            >
              {profile?.category || 'General'}
            </Chip>
          </View>
          <IconButton
            icon="logout"
            iconColor="#FFFFFF"
            size={24}
            onPress={handleLogout}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <StatCard
              icon="account-group"
              value={stats?.total_users || 0}
              label="Total Users"
              color="#0D7377"
              gradientColors={['#0D7377', '#14FFEC']}
            />
            <StatCard
              icon="star-circle"
              value={stats?.total_points_issued || 0}
              label="Points Issued"
              color="#2B5F75"
              gradientColors={['#2B5F75', '#0D7377']}
            />
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              icon="gift"
              value={stats?.total_redemptions || 0}
              label="Redemptions"
              color="#323E48"
              gradientColors={['#323E48', '#5C6B7A']}
            />
            <StatCard
              icon="qrcode"
              value={stats?.active_qr_codes || 0}
              label="Active QRs"
              color="#0D7377"
              gradientColors={['#14FFEC', '#0D7377']}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>Quick Actions</Text>

          <ActionCard
            icon="qrcode-plus"
            title="Generate QR Code"
            subtitle="Create a new loyalty QR code"
            //onPress={() => router.push('/seller/generate-qr')}
            onPress={() => { }}
            iconColor="#0D7377"
          />

          <ActionCard
            icon="store-cog"
            title="Edit Profile"
            subtitle="Update shop details and rewards"
            //onPress={() => router.push('/seller/profile-setup')}
            onPress={() => { }}
            iconColor="#2B5F75"
          />

          <ActionCard
            icon="chart-line"
            title="AI Insights"
            subtitle="Get reward optimization suggestions"
            //onPress={() => router.push('/seller/ai-insights')}
            onPress={() => { }}
            iconColor="#323E48"
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  shopName: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: -12,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  statValue: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 16,
    paddingLeft: 4,
  },
  actionCard: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  actionSubtitle: {
  },
  bottomSpacer: {
    height: 24,
  },
});