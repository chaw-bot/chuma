import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { GraduationCap, Heart, ShoppingBag, Home, ArrowRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { parseAmount, sanitizeAmountInput } from '../utils/auth';
import { colors, radii, shadows } from '../theme/colors';

type GoalCategory = NonNullable<NonNullable<RootStackParamList['AutomatedSavings']>['category']>;
type CreateGoalNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateGoal'>;

export default function CreateGoal() {
  const navigation = useNavigation<CreateGoalNavigationProp>();
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [timeline, setTimeline] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const categories = [
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'emergency', name: 'Emergency', icon: Heart },
    { id: 'business', name: 'Business', icon: ShoppingBag },
    { id: 'housing', name: 'Housing', icon: Home },
  ];

  const handleSubmit = () => {
    const parsedTargetAmount = parseAmount(targetAmount);

    if (!parsedTargetAmount || !selectedCategory) {
      setErrorMessage('Enter a valid target amount and choose a category.');
      return;
    }

    setErrorMessage('');
    navigation.navigate('AutomatedSavings', {
      goalName,
      targetAmount: String(parsedTargetAmount),
      timeline,
      category: selectedCategory as GoalCategory,
    });
  };

  const parsedTargetAmount = parseAmount(targetAmount);
  const weekly = parsedTargetAmount && timeline
    ? Math.ceil(parsedTargetAmount / (Number(timeline) * 4))
    : null;
  const daily = parsedTargetAmount && timeline
    ? Math.ceil(parsedTargetAmount / (Number(timeline) * 30))
    : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => navigation.navigate('Dashboard')}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Create Savings Goal</Text>
      <Text style={styles.subtitle}>A simple plan starts with one clear purpose.</Text>

      <Text style={styles.label}>Choose Category</Text>
      <View style={styles.grid}>
        {categories.map((category) => {
          const Icon = category.icon;
          const selected = selectedCategory === category.id;

          return (
            <Pressable
              key={category.id}
              style={[styles.categoryCard, selected && styles.categorySelected]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
                <Icon color={selected ? colors.surface : colors.primary} size={18} />
              </View>
              <Text style={styles.categoryText}>{category.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Goal Name</Text>
      <TextInput
        value={goalName}
        onChangeText={setGoalName}
        placeholder="e.g. School Fees"
        placeholderTextColor={colors.textSubtle}
        style={styles.input}
      />

      <Text style={styles.label}>How Much Do You Need?</Text>
      <View style={styles.amountContainer}>
        <Text style={styles.currency}>K</Text>
        <TextInput
          value={targetAmount}
          onChangeText={(value) => {
            setTargetAmount(sanitizeAmountInput(value));
            setErrorMessage('');
          }}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={colors.textSubtle}
          style={styles.amountInput}
        />
      </View>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <Text style={styles.label}>When Do You Need It?</Text>
      <View style={styles.timelineContainer}>
        {['3', '6', '12', '24'].map((month) => (
          <Pressable
            key={month}
            style={[styles.timelineButton, timeline === month && styles.timelineSelected]}
            onPress={() => setTimeline(month)}
          >
            <Text style={styles.timelineText}>In {month} months</Text>
          </Pressable>
        ))}
      </View>

      {weekly && daily ? (
        <View style={styles.previewBox}>
          <Text style={styles.previewTitle}>To reach your goal</Text>
          <Text style={styles.previewMain}>Save K {weekly} per week</Text>
          <Text style={styles.previewSub}>About K {daily} per day</Text>
        </View>
      ) : null}

      <Pressable
        style={[
          styles.button,
          (!goalName.trim() || !parsedTargetAmount || !timeline || !selectedCategory) &&
            styles.buttonDisabled,
        ]}
        disabled={!goalName.trim() || !parsedTargetAmount || !timeline || !selectedCategory}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>Continue to Setup</Text>
        <ArrowRight color={colors.surface} size={18} />
      </Pressable>
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
    marginBottom: 6,
    letterSpacing: -0.8,
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: 24,
    lineHeight: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    marginTop: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    padding: 16,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  categorySelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: colors.primarySoft,
  },
  iconContainerSelected: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 16,
    fontSize: 16,
    backgroundColor: colors.surface,
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
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 8,
  },
  timelineContainer: {
    gap: 10,
  },
  timelineButton: {
    padding: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  timelineSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  timelineText: {
    fontSize: 14,
    color: colors.text,
  },
  previewBox: {
    marginTop: 18,
    padding: 18,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  previewTitle: {
    marginBottom: 6,
    color: colors.textMuted,
  },
  previewMain: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  previewSub: {
    fontSize: 14,
    marginTop: 4,
    color: colors.textMuted,
  },
  button: {
    marginTop: 24,
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
    fontSize: 16,
    fontWeight: '600',
  },
});
