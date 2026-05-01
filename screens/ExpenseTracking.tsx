import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  BriefcaseBusiness,
  Car,
  MoreHorizontal,
  Plus,
  Utensils,
} from 'lucide-react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExpenseCategory, ExpenseItem, useAppData } from '../context/AppDataContext';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { isSameMonth } from '../utils/date';

type ExpenseTrackingNav = NativeStackNavigationProp<
  RootStackParamList,
  'ExpenseTracking'
>;

const categoryStyle: Record<ExpenseCategory, {
  icon: typeof Utensils;
  iconBg: string;
  iconColor: string;
  color: string;
}> = {
  Food: {
    icon: Utensils,
    iconBg: '#DCFCE7',
    iconColor: colors.primary,
    color: colors.primary,
  },
  Transport: {
    icon: Car,
    iconBg: '#DBEAFE',
    iconColor: '#2563EB',
    color: '#22C55E',
  },
  Shopping: {
    icon: BriefcaseBusiness,
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    color: '#86EFAC',
  },
  Other: {
    icon: MoreHorizontal,
    iconBg: '#F3F4F6',
    iconColor: '#4A5565',
    color: '#D1D5DC',
  },
};

function formatExpenseDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getMonthLabel(expenses: ExpenseItem[]) {
  const sourceDate = expenses[0]?.createdAt ? new Date(expenses[0].createdAt) : new Date();
  return sourceDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function DonutChart({
  categories,
}: {
  categories: Array<{ label: ExpenseCategory; percent: number; color: string }>;
}) {
  const size = 176;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <Svg width={size} height={size}>
      <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
        {categories.map((category) => {
          const dashLength = (category.percent / 100) * circumference;
          const segment = (
            <Circle
              key={category.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={category.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              fill="transparent"
            />
          );
          offset += dashLength;
          return segment;
        })}
      </G>
    </Svg>
  );
}

export default function ExpenseTracking() {
  const navigation = useNavigation<ExpenseTrackingNav>();
  const insets = useSafeAreaInsets();
  const fallbackTop = Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 0 : 0;
  const topPadding = Math.max(insets.top, fallbackTop) + 24;
  const { expenses } = useAppData();
  const monthAnchor = expenses[0]?.createdAt ? new Date(expenses[0].createdAt) : new Date();
  const monthlyExpenses = expenses.filter((expense) => isSameMonth(expense.createdAt, monthAnchor));
  const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryTotals = (Object.keys(categoryStyle) as ExpenseCategory[]).map((category) => {
    const total = monthlyExpenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      label: category,
      total,
      percent: monthlyTotal ? Math.round((total / monthlyTotal) * 100) : 0,
      color: categoryStyle[category].color,
    };
  }).filter((category) => category.total > 0);
  const chartCategories = categoryTotals.length > 0
    ? categoryTotals
    : [{ label: 'Other' as ExpenseCategory, total: 1, percent: 100, color: '#D1D5DC' }];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <View>
          <Text style={styles.title}>Expenses</Text>
          <Text style={styles.subtitle}>{getMonthLabel(monthlyExpenses)}</Text>
        </View>
        <Pressable
          style={styles.addButton}
          onPress={() => navigation.navigate('AddExpense')}
        >
          <Plus size={16} color={colors.surface} strokeWidth={2.4} />
          <Text style={styles.addText}>Add</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 104 },
        ]}
      >
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Monthly Total</Text>
          <Text style={styles.totalAmount}>ZMW {monthlyTotal.toLocaleString()}</Text>
        </View>

        <View style={styles.categoryCard}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          <View style={styles.chartWrap}>
            <DonutChart categories={chartCategories} />
          </View>
          <View style={styles.legend}>
            {chartCategories.map((category) => (
              <View key={category.label} style={styles.legendRow}>
                <View style={styles.legendLeft}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: category.color },
                    ]}
                  />
                  <Text style={styles.legendLabel}>{category.label}</Text>
                </View>
                <Text style={styles.legendPercent}>{category.percent}%</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent</Text>
        </View>

        <View style={styles.recentList}>
          {expenses.length > 0 ? (
            expenses.map((expense) => {
              const meta = categoryStyle[expense.category];
              const Icon = meta.icon;

              return (
                <View key={expense.id} style={styles.expenseRow}>
                  <View
                    style={[
                      styles.expenseIcon,
                      { backgroundColor: meta.iconBg },
                    ]}
                  >
                    <Icon size={20} color={meta.iconColor} strokeWidth={2.1} />
                  </View>
                  <View style={styles.expenseTextBlock}>
                    <Text style={styles.expenseTitle}>
                      {expense.description || expense.category}
                    </Text>
                    <Text style={styles.expenseMeta}>
                      {expense.category} • {formatExpenseDate(expense.createdAt)}
                    </Text>
                  </View>
                  <Text style={styles.expenseAmount}>ZMW {expense.amount.toLocaleString()}</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No expenses yet.</Text>
          )}
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
  content: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 17,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '500',
    color: colors.text,
    letterSpacing: 0.1,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 16,
    lineHeight: 24,
    color: '#4A5565',
  },
  addButton: {
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 6,
  },
  addText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.surface,
  },
  totalCard: {
    minHeight: 132,
    borderRadius: 8,
    backgroundColor: '#F8FAFB',
    padding: 24,
    justifyContent: 'center',
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4A5565',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '700',
    color: '#101828',
  },
  categoryCard: {
    borderRadius: 8,
    backgroundColor: '#F8FAFB',
    padding: 20,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600',
    color: '#101828',
  },
  chartWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  legend: {
    gap: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendLabel: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4A5565',
  },
  legendPercent: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: '#101828',
  },
  recentHeader: {
    marginBottom: 8,
  },
  recentList: {
    gap: 2,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  expenseRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  expenseTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  expenseTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: '#101828',
  },
  expenseMeta: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    color: '#6A7282',
  },
  expenseAmount: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: '#101828',
  },
});
