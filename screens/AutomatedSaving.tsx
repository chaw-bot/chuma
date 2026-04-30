import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar, Repeat, Check } from 'lucide-react-native';
import { useAppData } from '../context/AppDataContext';
import { RootStackParamList } from '../types/navigation';
import { parseAmount, sanitizeAmountInput } from '../utils/auth';
import { colors, radii, shadows } from '../theme/colors';

type AutomatedSavingsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AutomatedSavings'>;
type AutomatedSavingsRouteProp = RouteProp<RootStackParamList, 'AutomatedSavings'>;

export default function AutomatedSavings() {
  const navigation = useNavigation<AutomatedSavingsNavigationProp>();
  const route = useRoute<AutomatedSavingsRouteProp>();
  const { addGoal } = useAppData();
  const params = route.params ?? {};

  const goalName = params.goalName as string;
  const targetAmount = params.targetAmount as string;
  const timeline = params.timeline as string;
  const category = params.category;

  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState('Tomorrow');
  const [errorMessage, setErrorMessage] = useState('');

  const frequencies = [
    { id: 'daily', label: 'Daily', desc: 'Small amounts every day' },
    { id: 'weekly', label: 'Weekly', desc: 'Once a week' },
    { id: 'monthly', label: 'Monthly', desc: 'Once a month' },
  ];

  const parsedAmount = parseAmount(amount);
  const monthlyTotal = parsedAmount && frequency
    ? frequency === 'daily'
      ? parsedAmount * 30
      : frequency === 'weekly'
        ? parsedAmount * 4
        : parsedAmount
    : 0;

  const handleActivate = () => {
    const parsedTarget = parseAmount(targetAmount);
    const parsedTimeline = Number(timeline);

    if (!parsedAmount || parsedAmount < 5) {
      setErrorMessage('Enter a valid amount of at least K 5.');
      return;
    }

    if (!parsedTarget || !parsedTimeline || !category || !goalName.trim()) {
      setErrorMessage('Goal details are incomplete. Please create the goal again.');
      return;
    }

    addGoal({
      name: goalName.trim(),
      category,
      targetAmount: parsedTarget,
      timelineMonths: parsedTimeline,
      autoSaveAmount: parsedAmount,
      autoSaveFrequency: frequency as 'daily' | 'weekly' | 'monthly',
      autoSaveStartDate: startDate,
      color: colors.primary,
    });

    navigation.navigate('Dashboard');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Setup Auto-Save</Text>
      <Text style={styles.subtitle}>Automate the habit and keep the interface calm.</Text>

      {goalName ? (
        <View style={styles.goalBox}>
          <Text style={styles.goalLabel}>Saving for</Text>
          <Text style={styles.goalName}>{goalName}</Text>
          <Text style={styles.goalTarget}>Target: K {targetAmount}</Text>
        </View>
      ) : null}

      <Text style={styles.label}>How Much Each Time?</Text>
      <View style={styles.amountContainer}>
        <Text style={styles.currency}>K</Text>
        <TextInput
          value={amount}
          onChangeText={(value) => {
            setAmount(sanitizeAmountInput(value));
            setErrorMessage('');
          }}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={colors.textSubtle}
          style={styles.amountInput}
        />
      </View>
      <Text style={styles.helper}>Minimum K 5 per deduction</Text>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <Text style={styles.label}>How Often?</Text>
      <View style={styles.frequencyContainer}>
        {frequencies.map((freq) => {
          const selected = frequency === freq.id;
          return (
            <Pressable
              key={freq.id}
              style={[styles.frequencyCard, selected && styles.frequencySelected]}
              onPress={() => setFrequency(freq.id)}
            >
              <View style={[styles.frequencyIcon, selected && styles.frequencyIconSelected]}>
                <Repeat size={18} color={selected ? colors.surface : colors.primary} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.frequencyTitle}>{freq.label}</Text>
                <Text style={styles.frequencyDesc}>{freq.desc}</Text>
              </View>

              {selected ? <Check size={18} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>When to Start?</Text>
      <View style={styles.startDateBox}>
        <Calendar size={18} color={colors.primary} />
        <View style={styles.startDateOptions}>
          {['Tomorrow', 'In 2 days', 'Next Monday', 'Next month'].map((option) => (
            <Pressable key={option} onPress={() => setStartDate(option)}>
              <Text
                style={[
                  styles.startDateOption,
                  startDate === option && styles.startDateSelected,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {parsedAmount && frequency ? (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Your Auto-Save Plan</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLight}>Amount</Text>
            <Text style={styles.summaryValue}>K {amount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLight}>Frequency</Text>
            <Text style={styles.summaryValue}>{frequency}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLight}>Monthly Total</Text>
            <Text style={styles.summaryBig}>K {monthlyTotal.toLocaleString()}</Text>
          </View>
        </View>
      ) : null}

      <Pressable
        style={[styles.button, (!parsedAmount || !frequency) && styles.buttonDisabled]}
        disabled={!parsedAmount || !frequency}
        onPress={handleActivate}
      >
        <Check color={colors.surface} size={18} />
        <Text style={styles.buttonText}>Activate Auto-Save</Text>
      </Pressable>

      <Text style={styles.footerText}>You can pause or adjust this anytime.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 48,
    backgroundColor: colors.background,
  },
  back: {
    color: colors.primary,
    marginBottom: 16,
    marginTop: 10,
    fontSize: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.8,
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: 22,
    marginTop: 6,
    lineHeight: 22,
  },
  goalBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
    ...shadows.card,
  },
  goalLabel: {
    fontSize: 12,
    color: colors.textSubtle,
    marginBottom: 4,
  },
  goalName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  goalTarget: {
    color: colors.textMuted,
    marginTop: 4,
  },
  label: {
    marginTop: 14,
    marginBottom: 8,
    fontWeight: '600',
    color: colors.text,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
  },
  currency: {
    fontSize: 18,
    marginRight: 8,
    color: colors.textMuted,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    paddingVertical: 14,
    color: colors.text,
  },
  helper: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 8,
  },
  frequencyContainer: {
    gap: 10,
  },
  frequencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
    backgroundColor: colors.surface,
  },
  frequencySelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  frequencyIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frequencyIconSelected: {
    backgroundColor: colors.primary,
  },
  frequencyTitle: {
    fontWeight: '600',
    color: colors.text,
  },
  frequencyDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  startDateBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  startDateOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  startDateOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textMuted,
  },
  startDateSelected: {
    backgroundColor: colors.primary,
    color: colors.surface,
    borderColor: colors.primary,
  },
  summaryBox: {
    marginTop: 20,
    padding: 20,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  summaryLabel: {
    color: colors.textMuted,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLight: {
    color: colors.textMuted,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  summaryBig: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  button: {
    marginTop: 22,
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: radii.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 16,
  },
  footerText: {
    textAlign: 'center',
    marginTop: 14,
    fontSize: 12,
    color: colors.textMuted,
  },
});
