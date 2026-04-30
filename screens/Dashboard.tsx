import React from 'react';
import {
  Platform,
  StatusBar as NativeStatusBar,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Target,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData, SavingsGoal } from '../context/AppDataContext';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type DashboardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

const dueDateLabels: Record<string, string> = {
  'goal-school-fees': 'Due Dec 2025',
  'goal-business-stock': 'Due Nov 2025',
  'goal-emergency-fund': 'Due Jan 2026',
};

const recentActivity = [
  {
    id: 'school-fees',
    title: 'Auto Save - School Fees',
    date: 'Apr 10',
    amount: '+ZMW 50',
    type: 'deposit',
  },
  {
    id: 'withdrawal',
    title: 'Withdrawal',
    date: 'Apr 9',
    amount: 'ZMW 200',
    type: 'withdrawal',
  },
  {
    id: 'business-stock',
    title: 'Auto Save - Business Stock',
    date: 'Apr 8',
    amount: '+ZMW 100',
    type: 'deposit',
  },
] as const;

export default function Dashboard() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 0 : 0
  );
  const { currentUser, goals } = useAppData();
  const figmaGoals = goals.filter((goal) =>
    ['goal-school-fees', 'goal-business-stock'].includes(goal.id)
  );
  const visibleGoals = figmaGoals.length >= 2 ? figmaGoals : goals.slice(0, 2);
  const totalSavings = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const autoSaveGoal = goals.find((goal) => goal.autoSaveAmount && goal.autoSaveFrequency);
  const displayName = currentUser?.fullName?.split(' ')[0] ?? 'Chawanzi';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 20 }]}>
        <View>
          <Text style={styles.name}>Hi, {displayName}!</Text>
        </View>

        <Pressable
          style={styles.avatarButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.avatarText}>{avatarInitial}</Text>
        </Pressable>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: topInset + 5,
            paddingBottom: insets.bottom + 104,
          },
        ]}
      >

        <Pressable
          style={styles.totalCard}
          onPress={() => navigation.navigate('SavingsProgress')}
        >
          <Text style={styles.totalLabel}>Total Saved</Text>
          <Text style={styles.totalAmount}>ZMW {totalSavings.toLocaleString()}</Text>

          <View style={styles.totalStats}>
            <View style={styles.totalStat}>
              <Text style={styles.totalStatLabel}>Active Goals</Text>
              <Text style={styles.totalStatValue}>{goals.length}</Text>
            </View>
            <View style={styles.totalStat}>
              <Text style={styles.totalStatLabel}>Next Deduction</Text>
              <Text style={styles.totalStatValue}>
                {autoSaveGoal ? '3 days' : 'Set plan'}
              </Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Goals</Text>
          <Pressable
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('SavingsProgress')}
          >
            <Text style={styles.viewAllText}>View all</Text>
            <ArrowRight size={16} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.goalList}>
          {visibleGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onPress={() => navigation.navigate('SavingsProgress', { goalId: goal.id })}
            />
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent</Text>
          <Pressable onPress={() => navigation.navigate('Notifications')}>
            <Bell size={18} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.recentList}>
          {recentActivity.map((activity) => {
            const isDeposit = activity.type === 'deposit';
            const ActivityIcon = isDeposit ? ArrowDownLeft : ArrowUpRight;

            return (
              <View key={activity.id} style={styles.activityRow}>
                <View
                  style={[
                    styles.activityIcon,
                    isDeposit ? styles.depositIcon : styles.withdrawalIcon,
                  ]}
                >
                  <ActivityIcon
                    size={16}
                    color={isDeposit ? '#00A63E' : '#E7000B'}
                    strokeWidth={2.2}
                  />
                </View>

                <View style={styles.activityCopy}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDate}>{activity.date}</Text>
                </View>

                <Text
                  style={[
                    styles.activityAmount,
                    isDeposit ? styles.depositAmount : styles.withdrawalAmount,
                  ]}
                >
                  {activity.amount}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function GoalCard({
  goal,
  onPress,
}: {
  goal: SavingsGoal;
  onPress: () => void;
}) {
  const progress = goal.targetAmount > 0
    ? Math.min(goal.currentAmount / goal.targetAmount, 1)
    : 0;
  const progressPercent = Math.round(progress * 100);

  return (
    <Pressable style={styles.goalCard} onPress={onPress}>
      <View style={styles.goalTopRow}>
        <View style={styles.goalIdentity}>
          <View style={styles.goalIcon}>
            <Target size={20} color={colors.surface} strokeWidth={2.1} />
          </View>
          <View>
            <Text style={styles.goalName}>{goal.name}</Text>
            <Text style={styles.goalDue}>{dueDateLabels[goal.id] ?? 'Due Dec 2025'}</Text>
          </View>
        </View>
        <Text style={styles.goalPercent}>{progressPercent}%</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      <Text style={styles.goalAmount}>
        ZMW {goal.currentAmount.toLocaleString()} of {goal.targetAmount.toLocaleString()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingHorizontal: 17,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 17,
    marginBottom: 5,
  },
  greeting: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    marginBottom: 2,
  },
  name: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '500',
    color: colors.text,
    letterSpacing: 0.1,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
    color: colors.surface,
  },
  totalCard: {
    minHeight: 188,
    borderRadius: 24,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 23,
    marginBottom: 25,
  },
  totalLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.surface,
    opacity: 0.8,
    marginBottom: 1,
  },
  totalAmount: {
    fontSize: 36,
    lineHeight: 42,
    color: colors.surface,
    fontWeight: '400',
    marginBottom: 28,
  },
  totalStats: {
    flexDirection: 'row',
    gap: 28,
  },
  totalStat: {
    minWidth: 72,
  },
  totalStatLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.surface,
    opacity: 0.8,
  },
  totalStatValue: {
    fontSize: 24,
    lineHeight: 32,
    color: colors.surface,
  },
  sectionHeader: {
    minHeight: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
    color: colors.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  viewAllText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: colors.primary,
  },
  goalList: {
    gap: 12,
    marginBottom: 25,
  },
  goalCard: {
    minHeight: 135,
    borderRadius: 16,
    backgroundColor: '#F8FAFB',
    padding: 20,
  },
  goalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  goalIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalName: {
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '500',
    color: colors.text,
  },
  goalDue: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },
  goalPercent: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.primary,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  goalAmount: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4A5565',
  },
  recentList: {
    gap: 8,
  },
  activityRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  depositIcon: {
    backgroundColor: '#DCFCE7',
  },
  withdrawalIcon: {
    backgroundColor: '#FFE2E2',
  },
  activityCopy: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  activityDate: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },
  activityAmount: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
  },
  depositAmount: {
    color: '#00A63E',
  },
  withdrawalAmount: {
    color: '#E7000B',
  },
});
