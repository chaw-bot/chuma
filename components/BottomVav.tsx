import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { PiggyBank, Target, Plus, TrendingUp, User } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { colors, radii, shadows } from '../theme/colors';

type BottomNavProps = NativeStackNavigationProp<RootStackParamList>;

export function BottomNav() {
  const navigation = useNavigation<BottomNavProps>();
  const route = useRoute<RouteProp<RootStackParamList>>();
  const currentRoute = route.name;
  const isActive = (path: keyof RootStackParamList) => currentRoute === path;

  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        <NavItem
          label="Home"
          active={isActive('Dashboard')}
          onPress={() => navigation.navigate('Dashboard')}
          icon={<PiggyBank width={18} height={18} color={isActive('Dashboard') ? colors.primary : colors.textSubtle} />}
        />
        <NavItem
          label="Goals"
          active={isActive('SavingsProgress') || isActive('AutomatedSavings')}
          onPress={() => navigation.navigate('SavingsProgress')}
          icon={<Target width={18} height={18} color={isActive('SavingsProgress') || isActive('AutomatedSavings') ? colors.primary : colors.textSubtle} />}
        />
        <Pressable
          style={styles.addButtonWrapper}
          onPress={() => navigation.navigate('CreateGoal')}
        >
          <View style={styles.addButton}>
            <Plus width={22} height={22} color={colors.surface} />
          </View>
        </Pressable>
        <NavItem
          label="Invest"
          active={isActive('InvestmentInsights')}
          onPress={() => navigation.navigate('InvestmentInsights')}
          icon={<TrendingUp width={18} height={18} color={isActive('InvestmentInsights') ? colors.primary : colors.textSubtle} />}
        />
        <NavItem
          label="Profile"
          active={isActive('Profile')}
          onPress={() => navigation.navigate('Profile')}
          icon={<User width={18} height={18} color={isActive('Profile') ? colors.primary : colors.textSubtle} />}
        />
      </View>
    </View>
  );
}

function NavItem({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.navItem} onPress={onPress}>
      <View style={[styles.iconWrapper, active && styles.activeIconBg]}>
        {icon}
      </View>
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 18,
    left: 20,
    right: 20,
    backgroundColor: 'transparent',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...shadows.card,
  },
  navItem: {
    alignItems: 'center',
    minWidth: 54,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconBg: {
    backgroundColor: colors.primarySoft,
  },
  label: {
    fontSize: 11,
    color: colors.textSubtle,
    marginTop: 4,
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  addButtonWrapper: {
    marginTop: -18,
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
