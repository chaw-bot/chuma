import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  StatusBar as NativeStatusBar,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowUpRight, Plus, Target, Wallet } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SavingsGoal, useAppData } from '../context/AppDataContext';
import { RootStackParamList } from '../types/navigation';
import { colors, shadows } from '../theme/colors';
import ChargeGoalSheet, { ChargeGoalTarget } from '../components/ChargeGoalSheet';
import {
  GoalsApiError,
  listDueGoals,
  Operator,
  withdrawGoal,
} from '../api/goalsApi';
import { toLocalZmPhone } from '../utils/auth';

type SavingsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SavingsProgress'
>;

type GoalListItem = {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  autoSaveAmount?: number;
  status: 'Active' | 'Completed' | 'Paused';
  accent: string;
  category?: SavingsGoal['category'];
  due: boolean;
};

const sessionOperator = (
  provider?: SessionProvider
): Operator => (provider === 'airtel' || provider === 'zamtel' ? provider : 'mtn');

type SessionProvider = 'mtn' | 'airtel' | 'zamtel';

export default function SavingsProgress() {
  const navigation = useNavigation<SavingsNavigationProp>();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 0 : 0
  );
  const { goals, currentUser, uid } = useAppData();

  const [dueIds, setDueIds] = useState<Set<string>>(new Set());
  const [chargeTarget, setChargeTarget] = useState<ChargeGoalTarget | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const defaultPhone = toLocalZmPhone(currentUser?.phoneNumber);
  const defaultOperator = sessionOperator(currentUser?.provider);

  // Pull the API's "due" flag so we can surface goals that need a charge now.
  // Falls back silently to no badges if the savings server is unreachable.
  const refreshDue = useCallback(() => {
    if (!uid) return;
    listDueGoals(uid)
      .then((due) => setDueIds(new Set(due.map((goal) => goal.id))))
      .catch(() => setDueIds(new Set()));
  }, [uid]);

  useFocusEffect(
    useCallback(() => {
      refreshDue();
    }, [refreshDue])
  );

  const openCharge = (goal: GoalListItem) => {
    setChargeTarget({
      goalId: goal.id,
      goalName: goal.name,
      defaultAmount: goal.autoSaveAmount,
    });
    setSheetVisible(true);
  };

  const handleWithdraw = (goal: GoalListItem) => {
    if (!uid) return;
    Alert.alert(
      'Request withdrawal',
      `Withdraw ZMW ${goal.currentAmount.toLocaleString()} from "${goal.name}" to your wallet (${defaultPhone || 'your number'})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'default',
          onPress: async () => {
            setWithdrawingId(goal.id);
            try {
              await withdrawGoal(uid, goal.id, {
                phone: defaultPhone.replace(/\D/g, ''),
                operator: defaultOperator,
                amount: goal.currentAmount,
              });
              Alert.alert(
                'Withdrawal requested',
                'Your withdrawal is being processed. You will receive the funds in your wallet shortly.'
              );
            } catch (error) {
              Alert.alert(
                'Withdrawal failed',
                error instanceof GoalsApiError
                  ? error.message
                  : 'Could not request the withdrawal. Please try again.'
              );
            } finally {
              setWithdrawingId(null);
            }
          },
        },
      ]
    );
  };

  const appGoals: GoalListItem[] = goals.map((goal) => ({
    id: goal.id,
    name: goal.name,
    currentAmount: goal.currentAmount,
    targetAmount: goal.targetAmount,
    autoSaveAmount: goal.autoSaveAmount,
    status: goal.currentAmount >= goal.targetAmount ? 'Completed' : 'Active',
    accent: colors.primary,
    category: goal.category,
    due: dueIds.has(goal.id),
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 20 }]}>
        <Text style={styles.title}>Goals</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 110,
          },
        ]}
      >
        <View style={styles.goalList}>
          {appGoals.length > 0 ? (
            appGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                withdrawing={withdrawingId === goal.id}
                onPress={() => {
                  if (goal.category) {
                    navigation.navigate('AutomatedSavings', {
                      goalId: goal.id,
                      goalName: goal.name,
                      targetAmount: String(goal.targetAmount),
                      category: goal.category,
                    });
                  }
                }}
                onSave={() => openCharge(goal)}
                onWithdraw={() => handleWithdraw(goal)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No goals yet. Create one to get started.</Text>
          )}
        </View>
      </ScrollView>

      <Pressable
        style={[
          styles.fab,
          { bottom: Math.max(insets.bottom, 10) + 76 },
        ]}
        onPress={() => navigation.navigate('CreateGoal')}
      >
        <Plus size={28} color={colors.surface} strokeWidth={2.2} />
      </Pressable>

      <ChargeGoalSheet
        visible={sheetVisible}
        uid={uid}
        target={chargeTarget}
        defaultPhone={defaultPhone}
        defaultOperator={defaultOperator}
        onClose={() => {
          setSheetVisible(false);
          refreshDue();
        }}
      />
    </View>
  );
}

function GoalCard({
  goal,
  withdrawing,
  onPress,
  onSave,
  onWithdraw,
}: {
  goal: GoalListItem;
  withdrawing: boolean;
  onPress: () => void;
  onSave: () => void;
  onWithdraw: () => void;
}) {
  const progress = goal.targetAmount > 0
    ? Math.min(goal.currentAmount / goal.targetAmount, 1)
    : 0;
  const progressPercent = Math.round(progress * 100);
  const completed = goal.status === 'Completed';

  return (
    <Pressable style={styles.goalCard} onPress={onPress}>
      <View style={styles.goalTopRow}>
        <View style={styles.goalIdentity}>
          <View style={[styles.goalIcon, { backgroundColor: goal.accent }]}>
            <Target size={20} color={colors.surface} strokeWidth={2.1} />
          </View>

          <View style={styles.goalCopy}>
            <Text style={styles.goalName} numberOfLines={1}>
              {goal.name}
            </Text>
            <Text style={styles.goalAmount} numberOfLines={1}>
              ZMW {goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.pillStack}>
          <View style={[styles.statusPill, { backgroundColor: goal.accent }]}>
            <Text style={styles.statusText}>{goal.status}</Text>
          </View>
          {goal.due && !completed ? (
            <View style={styles.duePill}>
              <Text style={styles.dueText}>Due now</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progressPercent}%`,
              backgroundColor: goal.accent,
            },
          ]}
        />
      </View>

      <Text style={styles.progressText}>{progressPercent}% complete</Text>

      {completed ? (
        <Pressable
          disabled={withdrawing}
          onPress={onWithdraw}
          style={[styles.actionButton, styles.withdrawButton, withdrawing && styles.actionDisabled]}
        >
          <ArrowUpRight size={18} color={colors.surface} strokeWidth={2.2} />
          <Text style={styles.withdrawButtonText}>
            {withdrawing ? 'Requesting…' : 'Request withdrawal'}
          </Text>
        </Pressable>
      ) : (
        <Pressable onPress={onSave} style={[styles.actionButton, styles.saveButton]}>
          <Wallet size={18} color={colors.primary} strokeWidth={2.2} />
          <Text style={styles.saveButtonText}>Save now</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 17,
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '500',
    color: colors.text,
    letterSpacing: 0.1,
  },
  goalList: {
    gap: 12,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  goalCard: {
    minHeight: 139,
    borderRadius: 16,
    backgroundColor: '#F8FAFB',
    padding: 20,
  },
  goalTopRow: {
    minHeight: 49,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  goalIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCopy: {
    flex: 1,
    minWidth: 0,
  },
  goalName: {
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '500',
    color: colors.text,
    letterSpacing: -0.4,
  },
  goalAmount: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4A5565',
  },
  statusPill: {
    height: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  statusText: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.surface,
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
  },
  progressText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4A5565',
  },
  pillStack: {
    alignItems: 'flex-end',
    gap: 6,
  },
  duePill: {
    height: 22,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#FEF3C7',
  },
  dueText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: '#8A6A16',
  },
  actionButton: {
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  saveButton: {
    backgroundColor: '#ECFDF3',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  withdrawButton: {
    backgroundColor: colors.primary,
  },
  withdrawButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.surface,
  },
  actionDisabled: {
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
});
