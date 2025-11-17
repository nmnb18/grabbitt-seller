import SellerFreeAIInsights from '@/components/ai-insights/free-analytics';
import SellerProAnalyticsInsights from '@/components/ai-insights/pro-analytics';
import { useTheme } from '@/hooks/use-theme-color';
import { useAuthStore } from '@/store/authStore';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

export default function AnalyticsScreen() {
  const { user } = useAuthStore();
  const theme = useTheme();

  const [tab, setTab] = useState<'free' | 'pro'>('free');

  const inactiveTextColor = theme.colors.onSurface + "99"; // subtle
  const activeTextColor = theme.colors.onSurface;
  const tabBackground = theme.colors.surface + "33";       // subtle surface tint

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {/* TAB SWITCH */}
      <View
        style={[
          styles.tabs,
          { backgroundColor: tabBackground }
        ]}
      >
        {/* FREE TAB */}
        <TouchableOpacity
          onPress={() => setTab('free')}
          style={[
            styles.tab,
            tab === 'free' && {
              backgroundColor: theme.colors.surface,
              elevation: 2
            }
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: inactiveTextColor },
              tab === 'free' && {
                color: activeTextColor,
                fontWeight: '700'
              }
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>

        {/* PRO TAB */}
        <TouchableOpacity
          onPress={() => setTab('pro')}
          style={[
            styles.tab,
            tab === 'pro' && {
              backgroundColor: theme.colors.surface,
              elevation: 2
            }
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: inactiveTextColor },
              tab === 'pro' && {
                color: activeTextColor,
                fontWeight: '700'
              }
            ]}
          >
            Insights
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      {tab === 'free' ? <SellerFreeAIInsights /> : <SellerProAnalyticsInsights />}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  tabs: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabText: {
    fontSize: 14,
    fontWeight: '500',
  }
});
