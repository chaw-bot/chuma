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
import { Plus, Target } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SavingsGoal, useAppData } from '../context/AppDataContext';
import { RootStackParamList } from '../types/navigation';
import { colors, shadows } from '../theme/colors';

type SavingsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SavingsProgress'
>;

type GoalListItem = {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  status: 'Active' | 'Completed' | 'Paused';
  accent: string;
  category?: SavingsGoal['category'];
};

const staticGoals: GoalListItem[] = [
  {
    id: 'new-phone',
    name: 'New Phone',
    currentAmount: 1500,
    targetAmount: 1500,
    status: 'Completed',
    accent: '#00A63E',
  },
  {
    id: 'wedding-savings',
    name: 'Wedding Savings',
    currentAmount: 800,
    targetAmount: 10000,
    status: 'Paused',
    accent: '#FE9A00',
  },
];

const goalOrder = [
  'goal-school-fees',
  'goal-business-stock',
  'goal-emergency-fund',
];

export default function SavingsProgress() {
  const navigation = useNavigation<SavingsNavigationProp>();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 0 : 0
  );
  const { goals } = useAppData();

  const appGoals: GoalListItem[] = [...goals]
    .sort((a, b) => {
      const aIndex = goalOrder.indexOf(a.id);
      const bIndex = goalOrder.indexOf(b.id);
      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    })
    .map((goal) => ({
      id: goal.id,
      name: goal.name,
      currentAmount: goal.currentAmount,
      targetAmount: goal.targetAmount,
      status: 'Active',
      accent: colors.primary,
      category: goal.category,
    }));

  const goalItems = [...appGoals, ...staticGoals];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 24 }]}>
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
          {goalItems.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onPress={() => {
                if (goal.category) {
                  navigation.navigate('AutomatedSavings', {
                    goalName: goal.name,
                    targetAmount: String(goal.targetAmount),
                    category: goal.category,
                  });
                }
              }}
            />
          ))}
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
    </View>
  );
}

function GoalCard({
  goal,
  onPress,
}: {
  goal: GoalListItem;
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

        <View style={[styles.statusPill, { backgroundColor: goal.accent }]}>
          <Text style={styles.statusText}>{goal.status}</Text>
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
    paddingHorizontal: 24,
    paddingBottom: 26,
    backgroundColor: colors.surface,
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
