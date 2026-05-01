import { useMemo, useState } from 'react';
import {
  Platform,
  StatusBar as NativeStatusBar,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData, AutoSaveFrequency } from '../context/AppDataContext';
import { RootStackParamList } from '../types/navigation';
import { parseAmount, sanitizeAmountInput } from '../utils/auth';
import { colors } from '../theme/colors';
import DatePickerField, { formatPickerDate } from '../components/DatePickerField';

type CreateGoalNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateGoal'>;

const frequencies: AutoSaveFrequency[] = ['daily', 'weekly', 'monthly'];

const addMonths = (date: Date, months: number) => {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
};

const getTimelineMonths = (startDate: Date, targetDate: Date) => {
  const yearDiff = targetDate.getFullYear() - startDate.getFullYear();
  const monthDiff = targetDate.getMonth() - startDate.getMonth();
  const totalMonths = yearDiff * 12 + monthDiff;
  return Math.max(1, totalMonths);
};

export default function CreateGoal() {
  const navigation = useNavigation<CreateGoalNavigationProp>();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 0 : 0
  );
  const { addGoal } = useAppData();

  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [startDate, setStartDate] = useState(() => new Date());
  const [targetDate, setTargetDate] = useState(() => addMonths(new Date(), 6));
  const [frequency, setFrequency] = useState<AutoSaveFrequency>('weekly');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const parsedTargetAmount = useMemo(() => parseAmount(targetAmount), [targetAmount]);
  const parsedInitialDeposit = useMemo(() => parseAmount(initialDeposit), [initialDeposit]);
  const canCreate = goalName.trim().length > 0 && Boolean(parsedTargetAmount);

  const handleCreateGoal = () => {
    if (!parsedTargetAmount || !goalName.trim()) {
      setErrorMessage('Enter a goal name and target amount.');
      return;
    }

    addGoal({
      name: goalName.trim(),
      category: 'business',
      targetAmount: parsedTargetAmount,
      currentAmount: Math.min(parsedInitialDeposit ?? 0, parsedTargetAmount),
      timelineMonths: getTimelineMonths(startDate, targetDate),
      autoSaveFrequency: frequency,
      autoSaveStartDate: formatPickerDate(startDate),
      color: colors.primary,
    });

    navigation.navigate('SavingsProgress');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 24 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} strokeWidth={2.1} />
        </Pressable>
        <Text style={styles.title}>Create Goal</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <FieldLabel text="Goal Name" />
        <TextInput
          value={goalName}
          onChangeText={(value) => {
            setGoalName(value);
            setErrorMessage('');
          }}
          placeholder="e.g., School Fees, New Business"
          placeholderTextColor="rgba(10,10,10,0.5)"
          style={styles.input}
        />

        <FieldLabel text="Target Amount (ZMW)" />
        <TextInput
          value={targetAmount}
          onChangeText={(value) => {
            setTargetAmount(sanitizeAmountInput(value));
            setErrorMessage('');
          }}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor="rgba(10,10,10,0.5)"
          style={styles.input}
        />

        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <FieldLabel text="Start Date" />
            <DatePickerField
              value={startDate}
              minimumDate={new Date()}
              onChange={(selectedDate) => {
                setStartDate(selectedDate);
                if (selectedDate > targetDate) {
                  setTargetDate(addMonths(selectedDate, 1));
                }
              }}
              fieldStyle={styles.dateInput}
              textStyle={styles.dateText}
              iconSize={18}
            />
          </View>

          <View style={styles.dateField}>
            <FieldLabel text="Target Date" />
            <DatePickerField
              value={targetDate}
              minimumDate={startDate}
              onChange={setTargetDate}
              fieldStyle={styles.dateInput}
              textStyle={styles.dateText}
              iconSize={18}
            />
          </View>
        </View>

        <FieldLabel text="Contribution Frequency" />
        <View style={styles.frequencyRow}>
          {frequencies.map((item) => {
            const selected = frequency === item;
            const label = item.charAt(0).toUpperCase() + item.slice(1);

            return (
              <Pressable
                key={item}
                style={[styles.frequencyButton, selected && styles.frequencyButtonSelected]}
                onPress={() => setFrequency(item)}
              >
                <Text style={[styles.frequencyText, selected && styles.frequencyTextSelected]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FieldLabel text="Initial Deposit Amount (ZMW)" />
        <TextInput
          value={initialDeposit}
          onChangeText={(value) => setInitialDeposit(sanitizeAmountInput(value))}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor="rgba(10,10,10,0.5)"
          style={styles.input}
        />
        <Text style={styles.helperText}>Optional: Make your first contribution now</Text>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={[styles.createButton, !canCreate && styles.createButtonDisabled]}
          disabled={!canCreate}
          onPress={handleCreateGoal}
        >
          <Text style={styles.createButtonText}>Create Goal</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FieldLabel({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: colors.surface,
  },
  backButton: {
    width: 24,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '500',
    color: colors.text,
    letterSpacing: -0.45,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 32,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#364153',
    marginBottom: 8,
  },
  input: {
    height: 49,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dateField: {
    flex: 1,
  },
  dateInput: {
    height: 49,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  dateText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  frequencyButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frequencyButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  frequencyText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: '#364153',
  },
  frequencyTextSelected: {
    color: colors.surface,
  },
  helperText: {
    marginTop: -12,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },
  errorText: {
    marginTop: 12,
    color: colors.danger,
    fontSize: 12,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: colors.surface,
  },
  createButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: colors.surface,
  },
});
