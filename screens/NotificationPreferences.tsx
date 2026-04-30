import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { ArrowLeft, Bell, CalendarDays, Target, Wallet } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type NotificationPreferencesNav = NativeStackNavigationProp<
  RootStackParamList,
  'NotificationPreferences'
>;

const rows = [
  {
    key: 'deductions',
    title: 'Deduction Reminders',
    description: 'Get notified before automatic deductions run.',
    icon: CalendarDays,
  },
  {
    key: 'milestones',
    title: 'Goal Milestones',
    description: 'Celebrate progress when goals reach important points.',
    icon: Target,
  },
  {
    key: 'expenses',
    title: 'Expense Alerts',
    description: 'Receive useful spending updates and category changes.',
    icon: Wallet,
  },
  {
    key: 'tips',
    title: 'Savings Tips',
    description: 'Get occasional tips to help improve saving habits.',
    icon: Bell,
  },
] as const;

export default function NotificationPreferences() {
  const navigation = useNavigation<NotificationPreferencesNav>();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 0 : 0
  );
  const [settings, setSettings] = useState<Record<(typeof rows)[number]['key'], boolean>>({
    deductions: true,
    milestones: true,
    expenses: false,
    tips: true,
  });

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#101828" />
        </Pressable>
        <Text style={styles.title}>Notification Preferences</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
      >
        <View style={styles.card}>
          {rows.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === rows.length - 1;

            return (
              <View key={item.key} style={[styles.row, !isLast && styles.rowBorder]}>
                <View style={styles.iconCircle}>
                  <Icon size={20} color={colors.primary} />
                </View>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowDescription}>{item.description}</Text>
                </View>
                <Switch
                  value={settings[item.key]}
                  onValueChange={(value) =>
                    setSettings((current) => ({ ...current, [item.key]: value }))
                  }
                  trackColor={{ true: colors.primary, false: '#D1D5DC' }}
                  thumbColor={colors.surface}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: colors.surface,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '600',
    color: '#101828',
  },
  content: {
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 8,
    backgroundColor: '#F8FAFB',
    overflow: 'hidden',
  },
  row: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowCopy: {
    flex: 1,
    paddingRight: 12,
  },
  rowTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: '#101828',
  },
  rowDescription: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: '#6A7282',
  },
});
