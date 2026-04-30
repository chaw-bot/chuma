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
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type ExpenseTrackingNav = NativeStackNavigationProp<
  RootStackParamList,
  'ExpenseTracking'
>;

const categories = [
  { label: 'Food', percent: 35, color: colors.primary },
  { label: 'Transport', percent: 20, color: '#22C55E' },
  { label: 'Business Supplies', percent: 25, color: '#86EFAC' },
  { label: 'Other', percent: 20, color: '#D1D5DC' },
];

const recentExpenses = [
  {
    id: 'groceries',
    title: 'Groceries - Shoprite',
    meta: 'Food • Apr 11',
    amount: 'ZMW 250',
    icon: Utensils,
    iconBg: '#DCFCE7',
    iconColor: colors.primary,
  },
  {
    id: 'taxi',
    title: 'Taxi fare',
    meta: 'Transport • Apr 11',
    amount: 'ZMW 30',
    icon: Car,
    iconBg: '#DBEAFE',
    iconColor: '#2563EB',
  },
  {
    id: 'stock',
    title: 'Stock purchase',
    meta: 'Business Supplies • Apr 10',
    amount: 'ZMW 800',
    icon: BriefcaseBusiness,
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    id: 'restaurant',
    title: 'Restaurant',
    meta: 'Food • Apr 9',
    amount: 'ZMW 120',
    icon: Utensils,
    iconBg: '#DCFCE7',
    iconColor: colors.primary,
  },
  {
    id: 'airtime',
    title: 'Mobile airtime',
    meta: 'Other • Apr 9',
    amount: 'ZMW 50',
    icon: MoreHorizontal,
    iconBg: '#F3F4F6',
    iconColor: '#4A5565',
  },
];

function DonutChart() {
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

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <View>
          <Text style={styles.title}>Expenses</Text>
          <Text style={styles.subtitle}>April 2026</Text>
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
          <Text style={styles.totalAmount}>ZMW 3,450</Text>
        </View>

        <View style={styles.categoryCard}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          <View style={styles.chartWrap}>
            <DonutChart />
          </View>
          <View style={styles.legend}>
            {categories.map((category) => (
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
          {recentExpenses.map((expense) => {
            const Icon = expense.icon;

            return (
              <View key={expense.id} style={styles.expenseRow}>
                <View
                  style={[
                    styles.expenseIcon,
                    { backgroundColor: expense.iconBg },
                  ]}
                >
                  <Icon size={20} color={expense.iconColor} strokeWidth={2.1} />
                </View>
                <View style={styles.expenseTextBlock}>
                  <Text style={styles.expenseTitle}>{expense.title}</Text>
                  <Text style={styles.expenseMeta}>{expense.meta}</Text>
                </View>
                <Text style={styles.expenseAmount}>{expense.amount}</Text>
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
  content: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 24,
    marginBottom: 24,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: '#101828',
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
