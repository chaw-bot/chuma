import React from 'react';
import {
  Platform,
  StatusBar as NativeStatusBar,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
} from 'react-native';
import { CheckCircle, Calendar, TrendingUp, Gift } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotificationItem, useAppData } from '../context/AppDataContext';
import { RootStackParamList } from '../types/navigation';
import { colors, radii, shadows } from '../theme/colors';

type NotificationsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Notifications'
>;

export default function Notifications() {
  const navigation = useNavigation<NotificationsNavigationProp>();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 0 : 0
  );

  const {
    notifications,
    notificationPreferences,
    updateNotificationPreferences,
  } = useAppData();

  return (
    <View style={styles.screen}>
      <View style={[styles.headerShell, { paddingTop: topInset + 14 }]}>
        <Pressable onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>A simple feed of useful updates.</Text>
          </View>
          <Pressable>
            <Text style={styles.markAll}>Mark all read</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + 120 },
        ]}
      >
        {notifications.length > 0 ? notifications.map((notif) => {
          const Icon = getNotificationIcon(notif);
          return (
            <View key={notif.id} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.iconWrapper}>
                  <Icon width={18} height={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.cardTitle}>{notif.title}</Text>
                  <Text style={styles.cardMessage}>{notif.message}</Text>
                  <Text style={styles.cardTime}>{formatNotificationDate(notif.createdAt)}</Text>
                </View>
              </View>
            </View>
          );
        }) : (
          <Text style={styles.emptyText}>No notifications yet.</Text>
        )}

        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Preferences</Text>

          <SettingRow
            label="Savings reminders"
            description="Get notified before deductions"
            value={notificationPreferences.deductions}
            onChange={(value) => updateNotificationPreferences({ deductions: value })}
          />
          <SettingRow
            label="Milestone celebrations"
            description="Celebrate your progress"
            value={notificationPreferences.milestones}
            onChange={(value) => updateNotificationPreferences({ milestones: value })}
          />
          <SettingRow
            label="Savings tips"
            description="Receive weekly money tips"
            value={notificationPreferences.tips}
            onChange={(value) => updateNotificationPreferences({ tips: value })}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function getNotificationIcon(notification: NotificationItem) {
  if (notification.type === 'deduction') {
    return Calendar;
  }

  if (notification.type === 'goal') {
    return TrendingUp;
  }

  if (notification.type === 'expense') {
    return CheckCircle;
  }

  return Gift;
}

function formatNotificationDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function SettingRow({
  description,
  label,
  onChange,
  value,
}: {
  description: string;
  label: string;
  onChange: (value: boolean) => void;
  value: boolean;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary, false: colors.border }}
        thumbColor={colors.surface}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 24,
  },
  backText: {
    color: colors.primary,
    fontSize: 16,
    marginBottom: 16,
  },
  headerShell: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  markAll: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  cardMessage: {
    fontSize: 13,
    color: colors.textMuted,
    marginVertical: 4,
    lineHeight: 18,
  },
  cardTime: {
    fontSize: 11,
    color: colors.textSubtle,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  settingDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
