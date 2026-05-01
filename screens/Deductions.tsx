import React, { useMemo } from 'react';
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
import { SavingsGoal, useAppData } from '../context/AppDataContext';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type DeductionsNav = NativeStackNavigationProp<RootStackParamList, 'Deductions'>;

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
  const { goals, updateGoal } = useAppData();

  const deductions = useMemo(
    () =>
      goals
        .filter((goal) => Boolean(goal.autoSaveAmount && goal.autoSaveFrequency))
        .sort((a, b) =>
          (b.autoSaveCreatedAt ?? b.createdAt ?? '').localeCompare(
            a.autoSaveCreatedAt ?? a.createdAt ?? ''
          )
        ),
    [goals]
  );

  const activeCount = useMemo(
    () => deductions.filter((item) => item.autoSaveActive !== false).length,
    [deductions]
  );

  const toggleDeduction = (goal: SavingsGoal) => {
    updateGoal(goal.id, { autoSaveActive: goal.autoSaveActive === false });
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
          {deductions.length > 0 ? (
            deductions.map((item) => {
              const active = item.autoSaveActive !== false;
              const frequency = item.autoSaveFrequency
                ? item.autoSaveFrequency.charAt(0).toUpperCase() + item.autoSaveFrequency.slice(1)
                : 'Scheduled';

              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.iconCircle}>
                      <Target size={24} color={colors.surface} strokeWidth={2.2} />
                    </View>
                    <View style={styles.cardTitleBlock}>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      <Text style={styles.cardMeta}>
                        ZMW {item.autoSaveAmount?.toLocaleString()} • {frequency}
                      </Text>
                    </View>
                    <Toggle active={active} onPress={() => toggleDeduction(item)} />
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.cardBottom}>
                    <View style={styles.nextRun}>
                      <CalendarDays size={16} color="#4A5565" strokeWidth={2} />
                      <Text style={styles.nextRunText}>Next Run</Text>
                    </View>
                    <View style={styles.bottomRight}>
                      <Text style={styles.nextRunDate}>
                        {item.autoSaveStartDate ?? 'Scheduled'}
                      </Text>
                      <View
                        style={[
                          styles.statusPill,
                          active ? styles.activePill : styles.pausedPill,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            active ? styles.activeText : styles.pausedText,
                          ]}
                        >
                          {active ? 'Active' : 'Paused'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No automatic deductions yet.</Text>
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
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '500',
    color: colors.text,
    letterSpacing: 0.1,
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
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
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
