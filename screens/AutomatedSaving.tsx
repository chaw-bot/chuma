import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AutoSaveFrequency,
  GoalCategory,
  useAppData,
} from '../context/AppDataContext';
import { RootStackParamList } from '../types/navigation';
import { parseAmount, sanitizeAmountInput } from '../utils/auth';
import { colors } from '../theme/colors';

type AutomatedSavingsNav = NativeStackNavigationProp<
  RootStackParamList,
  'AutomatedSavings'
>;
type AutomatedSavingsRoute = RouteProp<RootStackParamList, 'AutomatedSavings'>;

const frequencies: Array<{ label: string; value: AutoSaveFrequency }> = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
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

export default function AutomatedSavings() {
  const navigation = useNavigation<AutomatedSavingsNav>();
  const route = useRoute<AutomatedSavingsRoute>();
  const insets = useSafeAreaInsets();
  const fallbackTop = Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 0 : 0;
  const topPadding = Math.max(insets.top, fallbackTop) + 12;
  const { goals, addGoal } = useAppData();
  const params = route.params ?? {};

  const initialGoal = useMemo(() => {
    if (params.goalName) {
      return goals.find(
        (goal) => goal.name.toLowerCase() === params.goalName?.toLowerCase()
      );
    }

    return goals[0];
  }, [goals, params.goalName]);

  const [selectedGoalId] = useState(initialGoal?.id ?? '');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<AutoSaveFrequency>('weekly');
  const [startDate, setStartDate] = useState('');
  const [active, setActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedGoal = goals.find((goal) => goal.id === selectedGoalId);
  const displayGoalName = selectedGoal?.name ?? params.goalName ?? '';
  const parsedAmount = parseAmount(amount);
  const canSave = Boolean(displayGoalName && parsedAmount && frequency);

  const handleSave = () => {
    if (!parsedAmount || !displayGoalName) {
      setErrorMessage('Choose a goal and enter a valid amount.');
      return;
    }

    const category = selectedGoal?.category ?? params.category ?? 'education';
    const targetAmount =
      selectedGoal?.targetAmount ?? parseAmount(params.targetAmount ?? '') ?? 0;
    const timelineMonths =
      selectedGoal?.timelineMonths ?? (Number(params.timeline ?? 1) || 1);

    addGoal({
      name: displayGoalName,
      category: category as GoalCategory,
      targetAmount,
      timelineMonths,
      autoSaveAmount: parsedAmount,
      autoSaveFrequency: frequency,
      autoSaveStartDate: startDate || 'Apr 15, 2026',
      color: colors.primary,
    });

    navigation.navigate('Deductions');
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#101828" strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.title}>Add Deduction</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 116 },
        ]}
      >
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Set up automatic deductions from your mobile money account
          </Text>
        </View>

        <Text style={styles.label}>Select Goal</Text>
        <Pressable style={styles.selectField}>
          <Text style={[styles.selectText, !displayGoalName && styles.placeholder]}>
            {displayGoalName}
          </Text>
          <ChevronDown size={20} color="#4A5565" strokeWidth={2} />
        </Pressable>

        <Text style={styles.label}>Amount per Deduction (ZMW)</Text>
        <TextInput
          value={amount}
          onChangeText={(value) => {
            setAmount(sanitizeAmountInput(value));
            setErrorMessage('');
          }}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor="#99A1AF"
          style={styles.input}
        />
        <Text style={styles.helper}>Amount to save each time</Text>

        <Text style={styles.label}>Frequency</Text>
        <View style={styles.segmented}>
          {frequencies.map((item) => {
            const selected = frequency === item.value;

            return (
              <Pressable
                key={item.value}
                style={[styles.segment, selected && styles.segmentSelected]}
                onPress={() => setFrequency(item.value)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    selected && styles.segmentTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Start Date</Text>
        <TextInput
          value={startDate}
          onChangeText={setStartDate}
          placeholder=""
          placeholderTextColor="#99A1AF"
          style={styles.input}
        />

        <View style={styles.activeRow}>
          <Text style={styles.activeLabel}>Active</Text>
          <Toggle active={active} onPress={() => setActive((value) => !value)} />
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Pressable
          disabled={!canSave}
          onPress={handleSave}
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>Save Deduction</Text>
        </Pressable>
      </View>
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
    paddingBottom: 24,
    marginBottom: 24,
    backgroundColor: colors.surface,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '600',
    color: '#101828',
  },
  headerSpacer: {
    width: 44,
  },
  infoCard: {
    minHeight: 112,
    borderRadius: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    justifyContent: 'center',
    marginBottom: 28,
  },
  infoText: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
    color: colors.surface,
  },
  label: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: '#101828',
    marginBottom: 8,
  },
  selectField: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DC',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#101828',
  },
  placeholder: {
    color: '#99A1AF',
  },
  input: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DC',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#101828',
    marginBottom: 8,
  },
  helper: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6A7282',
    marginBottom: 20,
  },
  segmented: {
    height: 56,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    padding: 4,
    flexDirection: 'row',
    marginBottom: 24,
  },
  segment: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: '#4A5565',
  },
  segmentTextSelected: {
    color: colors.surface,
  },
  activeRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  activeLabel: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: '#101828',
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
  errorText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: '#C10007',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  saveButton: {
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.surface,
  },
});
