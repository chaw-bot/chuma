import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Bell, Target, TrendingUp, Calendar, Wallet, PiggyBank, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppData } from '../context/AppDataContext';
import { RootStackParamList } from '../types/navigation';
import { colors, radii, shadows } from '../theme/colors';

type DashboardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

export default function Dashboard() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const { currentUser, goals } = useAppData();
  const savingsGoals = goals.slice(0, 3);
  const totalSavings = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const autoSaveGoal = goals.find((goal) => goal.autoSaveAmount && goal.autoSaveFrequency);
  const greetingName = currentUser?.fullName ?? currentUser?.phoneNumber ?? 'Chuma User';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.nameText}>{greetingName}</Text>
          </View>

          <View style={styles.headerIcons}>
            <Pressable
              style={styles.iconButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Bell size={18} color={colors.primary} />
            </Pressable>

            <Pressable
              style={styles.iconButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <User size={18} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <View style={styles.metricIcon}>
              <PiggyBank size={18} color={colors.primary} />
            </View>
            <Text style={styles.totalLabel}>Total savings</Text>
          </View>

          <Text style={styles.totalAmount}>K {totalSavings.toLocaleString()}</Text>

          <View style={styles.totalBottomRow}>
            <View>
              <Text style={styles.smallText}>This month</Text>
              <Text style={styles.monthIncrease}>+K 450</Text>
            </View>

            <View style={styles.percentRow}>
              <TrendingUp size={14} color={colors.primary} />
              <Text style={styles.percentText}>+12%</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Pressable
            style={styles.quickCard}
            onPress={() => navigation.navigate('CreateGoal')}
          >
            <View style={styles.quickIcon}>
              <Target size={18} color={colors.primary} />
            </View>
            <Text style={styles.quickTitle}>New Goal</Text>
            <Text style={styles.quickText}>Create a focused savings plan.</Text>
          </Pressable>

          <Pressable
            style={styles.quickCard}
            onPress={() => navigation.navigate('ExpenseTracking')}
          >
            <View style={styles.quickIcon}>
              <Wallet size={18} color={colors.primary} />
            </View>
            <Text style={styles.quickTitle}>Expenses</Text>
            <Text style={styles.quickText}>Track where your money went.</Text>
          </Pressable>
        </View>

        <View style={styles.nextDeduction}>
          <View style={styles.deductionRow}>
            <View style={styles.calendarIcon}>
              <Calendar size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.deductionText}>Next auto-save</Text>
              <Text style={styles.deductionAmount}>
                {autoSaveGoal
                  ? `${autoSaveGoal.autoSaveStartDate} • K ${autoSaveGoal.autoSaveAmount}`
                  : 'Set up a plan to start saving'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active goals</Text>
            <Pressable onPress={() => navigation.navigate('SavingsProgress')}>
              <Text style={styles.viewAll}>View all</Text>
            </Pressable>
          </View>

          {savingsGoals.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No savings goals yet</Text>
              <Text style={styles.emptyText}>
                Create your first goal to start tracking progress.
              </Text>
            </View>
          ) : null}

          {savingsGoals.map((goal) => {
            const progress = goal.targetAmount > 0
              ? (goal.currentAmount / goal.targetAmount) * 100
              : 0;

            return (
              <Pressable
                key={goal.id}
                style={styles.goalCard}
                onPress={() => navigation.navigate('SavingsProgress', { goalId: goal.id })}
              >
                <View style={styles.goalTop}>
                  <View>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalAmount}>
                      K {goal.currentAmount.toLocaleString()} of K {goal.targetAmount.toLocaleString()}
                    </Text>
                  </View>

                  <Text style={styles.progressPercent}>
                    {progress.toFixed(0)}%
                  </Text>
                </View>

                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progress}%`,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={styles.investmentCard}
          onPress={() => navigation.navigate('InvestmentInsights')}
        >
          <View style={styles.investRow}>
            <View style={styles.investIcon}>
              <TrendingUp size={18} color={colors.primary} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.investTitle}>Grow Your Money</Text>
              <Text style={styles.investText}>
                Explore safer investment options that match your goals.
              </Text>
              <Text style={styles.learnMore}>Learn more</Text>
            </View>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  welcomeText: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 4,
  },
  nameText: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  totalAmount: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
    letterSpacing: -1,
  },
  totalBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  smallText: {
    fontSize: 12,
    color: colors.textSubtle,
  },
  monthIncrease: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  percentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  percentText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 14,
  },
  quickCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    backgroundColor: colors.primarySoft,
  },
  quickTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  quickText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  nextDeduction: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deductionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  calendarIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deductionText: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  deductionAmount: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  viewAll: {
    color: colors.primary,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptyText: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  goalCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  goalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  goalAmount: {
    color: colors.textMuted,
    fontSize: 13,
  },
  progressPercent: {
    color: colors.text,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.pill,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
  },
  investmentCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  investRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  investIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  investTitle: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 6,
  },
  investText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  learnMore: {
    color: colors.primary,
    fontWeight: '600',
  },
});
