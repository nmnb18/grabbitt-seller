import { GradientHeader } from '@/components/shared/app-header';
import { useTheme } from '@/hooks/use-theme-color';
import { notificationApi } from '@/services/firebaseFunctions';
import { useNotificationStore } from '@/store/notificationStore';
import { AppStyles } from '@/utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { Card, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

type Notification = {
    id: string;
    title: string;
    body: string;
    read: boolean;
    created_at: any;
};

export default function NotificationScreen() {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { setUnreadCount } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);

            const res = await notificationApi.getNotifications();
            if (res?.success) {
                setNotifications(res.notifications || res.data?.notifications || []);
            }
            setUnreadCount(0);
        } catch (err) {
            console.error('Notification fetch failed', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
            <GradientHeader title="Notifications" />

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={fetchNotifications} />
                    }
                >
                    {notifications.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons
                                name="bell-outline"
                                size={64}
                                color={theme.colors.outline}
                            />
                            <Text style={styles.emptyTitle}>
                                No notifications yet
                            </Text>
                            <Text style={styles.emptySub}>
                                We’ll notify you when something important happens.
                            </Text>
                        </View>
                    ) : (
                        notifications.map((item) => (
                            <Card
                                key={item.id}
                                style={[
                                    styles.card,
                                    !item.read && styles.unreadCard,
                                ]}
                                elevation={1}
                            >
                                <Card.Content style={styles.cardContent}>
                                    <MaterialCommunityIcons
                                        name={
                                            item.read
                                                ? 'bell-outline'
                                                : 'bell-ring-outline'
                                        }
                                        size={22}
                                        color={
                                            item.read
                                                ? theme.colors.onSurface
                                                : theme.colors.primary
                                        }
                                    />

                                    <View style={styles.textWrap}>
                                        <Text
                                            variant="titleSmall"
                                            style={[
                                                styles.title,
                                                !item.read && styles.unreadTitle,
                                            ]}
                                        >
                                            {item.title}
                                        </Text>

                                        <Text style={styles.body}>
                                            {item.body}
                                        </Text>

                                        <Text style={styles.time}>
                                            {new Date(
                                                item.created_at
                                            ).toLocaleString()}
                                        </Text>
                                    </View>
                                </Card.Content>
                            </Card>
                        ))
                    )}
                    <View style={{ height: 60 }} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
const createStyles = (theme: any) =>
    StyleSheet.create({
        screen: {
            flex: 1,
        },
        scrollContainer: {
            padding: AppStyles.spacing.lg,
        },
        loader: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        card: {
            marginBottom: AppStyles.spacing.md,
            borderRadius: 14,
            backgroundColor: theme.colors.surface,
        },
        unreadCard: {
            borderLeftWidth: 3,
            borderLeftColor: theme.colors.primary,
        },
        cardContent: {
            flexDirection: 'row',
            gap: 12,
        },
        textWrap: {
            flex: 1,
        },
        title: {
            color: theme.colors.primary,
            fontWeight: '500',
        },
        unreadTitle: {
            fontWeight: '700',
        },
        body: {
            marginTop: 2,
            color: theme.colors.text,
        },
        time: {
            marginTop: 6,
            fontSize: 11,
            color: theme.colors.accent,
        },
        emptyState: {
            marginTop: 120,
            alignItems: 'center',
        },
        emptyTitle: {
            marginTop: 12,
            fontSize: 16,
            fontWeight: '600',
        },
        emptySub: {
            marginTop: 4,
            fontSize: 13,
            color: theme.colors.text,
            textAlign: 'center',
        },
    });
