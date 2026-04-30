import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Target, Calendar, TrendingUp, Award } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { BottomNav } from '../components/BottomVav';
import { useAppData } from '../context/AppDataContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { colors, radii, shadows } from '../theme/colors';

type SavingsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SavingsProgress'>;
type SavingsRouteProp = RouteProp<RootStackParamList, 'SavingsProgress'>;

export default function SavingsProgress() {
  const navigation = useNavigation<SavingsNavigationProp>();
  const route = useRoute<SavingsRouteProp>();
  const { goals } = useAppData();
  const goalId = route.params?.goalId;
  const goal = goalId ? goals.find((item) => item.id === goalId) ?? goals[0] : goals[0];

  if (!goal) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.backText}>← Back to Dashboard</Text>
        </Pressable>
        <View style={styles.header}>
          <Text style={styles.title}>Savings Progress</Text>
          <Text style={styles.subtitle}>Create a goal to see your progress here.</Text>
        </View>
      </ScrollView>
    );
  }

  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const monthlyAverage = Math.ceil(goal.targetAmount / goal.timelineMonths);
  const milestones = [
    { amount: Math.ceil(goal.targetAmount * 0.25), label: 'First Quarter' },
    { amount: Math.ceil(goal.targetAmount * 0.5), label: 'Halfway There' },
    { amount: Math.ceil(goal.targetAmount * 0.75), label: 'Almost There' },
    { amount: goal.targetAmount, label: 'Goal Reached!' },
  ].map((milestone) => ({
    ...milestone,
    reached: goal.currentAmount >= milestone.amount,
  }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => navigation.navigate('Dashboard')}>
        <Text style={styles.backText}>← Back to Dashboard</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>{goal.name}</Text>
        <Text style={styles.subtitle}>Track your progress with less visual noise.</Text>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View style={styles.progressIcon}>
            <Target width={18} height={18} color={colors.primary} />
          </View>
          <Text style={styles.progressLabel}>Current Progress</Text>
        </View>
        <Text style={styles.progressAmount}>K {goal.currentAmount.toLocaleString()}</Text>
        <Text style={styles.progressGoal}>of K {goal.targetAmount.toLocaleString()} goal</Text>

        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>

        <View style={styles.progressFooter}>
          <Text style={styles.progressText}>{progress.toFixed(0)}% complete</Text>
          <Text style={styles.progressText}>
            K {(goal.targetAmount - goal.currentAmount).toLocaleString()} to go
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Calendar width={16} height={16} color={colors.primary} />
            <Text style={styles.statLabel}>Time Left</Text>
          </View>
          <Text style={styles.statValue}>{goal.timelineMonths} months</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <TrendingUp width={16} height={16} color={colors.primary} />
            <Text style={styles.statLabel}>Monthly Avg</Text>
          </View>
          <Text style={styles.statValue}>K {monthlyAverage}</Text>
        </View>
      </View>

      <View style={styles.milestonesCard}>
        <View style={styles.milestoneHeader}>
          <Award width={18} height={18} color={colors.primary} />
          <Text style={styles.milestoneTitle}>Milestones</Text>
        </View>
        {milestones.map((m, idx) => (
          <View key={idx} style={styles.milestoneRow}>
            <View
              style={[
                styles.milestoneIconWrapper,
                { backgroundColor: m.reached ? colors.primarySoft : colors.surfaceMuted },
              ]}
            >
              {m.reached ? (
                <Award width={20} height={20} color={colors.primary} />
              ) : (
                <Target width={20} height={20} color={colors.textSubtle} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.milestoneLabel, !m.reached && { color: colors.textMuted }]}>
                {m.label}
              </Text>
              <Text style={styles.milestoneAmount}>K {m.amount.toLocaleString()}</Text>
            </View>
            {m.reached ? <Text style={styles.milestoneAchieved}>Achieved</Text> : null}
          </View>
        ))}
      </View>

      <Pressable
        style={styles.actionButton}
        onPress={() =>
          navigation.navigate('AutomatedSavings', {
            goalName: goal.name,
            targetAmount: String(goal.targetAmount),
            timeline: String(goal.timelineMonths),
            category: goal.category,
          })
        }
      >
        <Text style={styles.actionButtonText}>Adjust Auto-Save</Text>
      </Pressable>
      <Pressable
        style={[styles.actionButton, styles.actionButtonSecondary]}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
          Add One-Time Deposit
        </Text>
      </Pressable>

      <BottomNav />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 120,
    backgroundColor: colors.background,
  },
  backText: {
    color: colors.primary,
    fontSize: 16,
    marginBottom: 20,
    marginTop: 10,
  },
  header: { marginBottom: 20 },
  title: { fontSize: 30, fontWeight: '700', color: colors.text, marginBottom: 4, letterSpacing: -0.8 },
  subtitle: { fontSize: 15, color: colors.textMuted },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  progressHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  progressIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLabel: { color: colors.textMuted, fontSize: 14 },
  progressAmount: { fontSize: 34, color: colors.text, marginBottom: 4, fontWeight: '700', letterSpacing: -1 },
  progressGoal: { color: colors.textMuted, marginBottom: 14 },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.pill,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBarFill: { height: 8, backgroundColor: colors.primary, borderRadius: radii.pill },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { color: colors.textMuted, fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  statLabel: { fontSize: 12, color: colors.textMuted },
  statValue: { fontSize: 20, color: colors.text, fontWeight: '600' },
  milestonesCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  milestoneHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  milestoneTitle: { fontSize: 16, color: colors.text, fontWeight: '600' },
  milestoneRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  milestoneIconWrapper: { width: 44, height: 44, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  milestoneLabel: { fontSize: 14, color: colors.text, fontWeight: '500' },
  milestoneAmount: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  milestoneAchieved: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radii.md,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonSecondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  actionButtonText: { fontSize: 16, fontWeight: '600', color: colors.surface },
  actionButtonTextSecondary: { color: colors.text },
});
