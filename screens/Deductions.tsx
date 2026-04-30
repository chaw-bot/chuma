import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CalendarDays, Plus, Target } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type DeductionsNav = NativeStackNavigationProp<RootStackParamList, 'Deductions'>;

type DeductionItem = {
  id: string;
  title: string;
  amount: string;
  frequency: string;
  nextRun: string;
  active: boolean;
};

const deductionItems: DeductionItem[] = [
  {
    id: 'school-fees',
    title: 'School Fees',
    amount: 'ZMW 50',
    frequency: 'Weekly',
    nextRun: 'Apr 15, 2026',
    active: true,
  },
  {
    id: 'business-stock',
    title: 'Business Stock',
    amount: 'ZMW 100',
    frequency: 'Monthly',
    nextRun: 'Apr 20, 2026',
    active: true,
  },
  {
    id: 'emergency-fund',
    title: 'Emergency Fund',
    amount: 'ZMW 20',
    frequency: 'Daily',
    nextRun: 'Apr 13, 2026',
    active: true,
  },
  {
    id: 'wedding-savings',
    title: 'Wedding Savings',
    amount: 'ZMW 200',
    frequency: 'Monthly',
    nextRun: 'May 1, 2026',
    active: false,
  },
];

function Toggle({ active, onPress }: { active: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: active }}
      onPress={onPress}
      style={[styles.toggleTrack, active ? styles.toggleOn : styles.toggleOff]}
    >
      <View style={[styles.toggleThumb, active && styles.toggleThumbOn]} />
    </Pressable>
  );
}

export default function Deductions() {
  const navigation = useNavigation<DeductionsNav>();
  const insets = useSafeAreaInsets();
  const fallbackTop = Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 0 : 0;
  const topPadding = Math.max(insets.top, fallbackTop) + 24;
  const [items, setItems] = useState(deductionItems);

  const activeCount = useMemo(
    () => items.filter((item) => item.active).length,
    [items]
  );

  const toggleDeduction = (id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      )
    );
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <Text style={styles.title}>Deductions</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => navigation.navigate('AutomatedSavings')}
        >
          <Plus size={18} color={colors.primary} strokeWidth={2.4} />
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
        <Text style={styles.summary}>{activeCount} active automatic deductions</Text>

        <View style={styles.list}>
          {items.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.iconCircle}>
                  <Target size={24} color={colors.surface} strokeWidth={2.2} />
                </View>
                <View style={styles.cardTitleBlock}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardMeta}>
                    {item.amount} • {item.frequency}
                  </Text>
                </View>
                <Toggle active={item.active} onPress={() => toggleDeduction(item.id)} />
              </View>

              <View style={styles.divider} />

              <View style={styles.cardBottom}>
                <View style={styles.nextRun}>
                  <CalendarDays size={16} color="#4A5565" strokeWidth={2} />
                  <Text style={styles.nextRunText}>Next Run</Text>
                </View>
                <View style={styles.bottomRight}>
                  <Text style={styles.nextRunDate}>{item.nextRun}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      item.active ? styles.activePill : styles.pausedPill,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        item.active ? styles.activeText : styles.pausedText,
                      ]}
                    >
                      {item.active ? 'Active' : 'Paused'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
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
    paddingHorizontal: 24,
    paddingBottom: 12,
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: '#101828',
  },
  addButton: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addText: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '600',
    color: colors.primary,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4A5565',
    marginBottom: 28,
  },
  list: {
    gap: 16,
  },
  card: {
    backgroundColor: '#F8FAFB',
    borderRadius: 8,
    padding: 20,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginRight: 16,
  },
  cardTitleBlock: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600',
    color: '#101828',
  },
  cardMeta: {
    marginTop: 2,
    fontSize: 16,
    lineHeight: 24,
    color: '#4A5565',
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: colors.primary,
  },
  toggleOff: {
    backgroundColor: '#D1D5DC',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  nextRun: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextRunText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4A5565',
  },
  bottomRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  nextRunDate: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#101828',
  },
  statusPill: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  activePill: {
    backgroundColor: '#DCFCE7',
  },
  pausedPill: {
    backgroundColor: '#F3F4F6',
  },
  statusText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  activeText: {
    color: '#008236',
  },
  pausedText: {
    color: '#4A5565',
  },
});
