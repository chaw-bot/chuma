import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CalendarDays, Home, ReceiptText, Target } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

export type BottomNavRoute =
  | 'Dashboard'
  | 'SavingsProgress'
  | 'Deductions'
  | 'ExpenseTracking';

type BottomNavProps = {
  activeRoute: keyof RootStackParamList;
  onNavigate: (route: BottomNavRoute) => void;
};

const tabItems: Array<{
  label: string;
  route: BottomNavRoute;
  activeRoutes: Array<keyof RootStackParamList>;
  icon: typeof Home;
}> = [
  {
    label: 'Home',
    route: 'Dashboard',
    activeRoutes: ['Dashboard'],
    icon: Home,
  },
  {
    label: 'Goals',
    route: 'SavingsProgress',
    activeRoutes: ['SavingsProgress', 'CreateGoal'],
    icon: Target,
  },
  {
    label: 'Deductions',
    route: 'Deductions',
    activeRoutes: ['Deductions', 'AutomatedSavings'],
    icon: CalendarDays,
  },
  {
    label: 'Expenses',
    route: 'ExpenseTracking',
    activeRoutes: ['ExpenseTracking', 'AddExpense'],
    icon: ReceiptText,
  },
];

export function BottomNav({ activeRoute, onNavigate }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.navRow}>
        {tabItems.map((item) => {
          const active = item.activeRoutes.includes(activeRoute);
          const Icon = item.icon;

          return (
            <Pressable
              key={item.route}
              style={styles.navItem}
              onPress={() => onNavigate(item.route)}
            >
              <Icon
                width={24}
                height={24}
                color={active ? colors.primary : '#98A2B3'}
                strokeWidth={2.1}
              />
              <Text style={[styles.label, active && styles.activeLabel]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  navRow: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navItem: {
    width: 72,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
    fontWeight: '500',
  },
  activeLabel: {
    color: colors.primary,
  },
});
