import React, { useState } from 'react';
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
import {
  ArrowLeft,
  BriefcaseBusiness,
  Car,
  Home,
  MoreHorizontal,
  Plus,
  Utensils,
  Zap,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExpenseCategory, useAppData } from '../context/AppDataContext';
import { RootStackParamList } from '../types/navigation';
import { parseAmount, sanitizeAmountInput } from '../utils/auth';
import { colors } from '../theme/colors';

type AddExpenseNav = NativeStackNavigationProp<RootStackParamList, 'AddExpense'>;

type UiCategory = {
  label: string;
  icon: typeof Utensils;
  color: string;
  bg: string;
  expenseCategory: ExpenseCategory;
};

const categoryItems: UiCategory[] = [
  {
    label: 'Food',
    icon: Utensils,
    color: colors.primary,
    bg: '#DCFCE7',
    expenseCategory: 'Food',
  },
  {
    label: 'Transport',
    icon: Car,
    color: '#2563EB',
    bg: '#DBEAFE',
    expenseCategory: 'Transport',
  },
  {
    label: 'Business',
    icon: BriefcaseBusiness,
    color: '#D97706',
    bg: '#FEF3C7',
    expenseCategory: 'Other',
  },
  {
    label: 'Home',
    icon: Home,
    color: '#9333EA',
    bg: '#F3E8FF',
    expenseCategory: 'Other',
  },
  {
    label: 'Utilities',
    icon: Zap,
    color: '#EA580C',
    bg: '#FFEDD5',
    expenseCategory: 'Other',
  },
  {
    label: 'Other',
    icon: MoreHorizontal,
    color: '#4A5565',
    bg: '#F3F4F6',
    expenseCategory: 'Other',
  },
];

export default function AddExpense() {
  const navigation = useNavigation<AddExpenseNav>();
  const insets = useSafeAreaInsets();
  const fallbackTop = Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 0 : 0;
  const topPadding = Math.max(insets.top, fallbackTop) + 12;
  const { addExpense } = useAppData();

  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<UiCategory | null>(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const parsedAmount = parseAmount(amount);
  const canSave = Boolean(parsedAmount && selectedCategory);

  const handleSave = () => {
    if (!parsedAmount || !selectedCategory) {
      setErrorMessage('Enter an amount and choose a category.');
      return;
    }

    addExpense({
      amount: parsedAmount,
      category: selectedCategory.expenseCategory,
    });
    navigation.navigate('ExpenseTracking');
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#101828" strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.title}>Add Expense</Text>
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
        <Text style={styles.label}>Amount (ZMW)</Text>
        <TextInput
          value={amount}
          onChangeText={(value) => {
            setAmount(sanitizeAmountInput(value));
            setErrorMessage('');
          }}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor="#99A1AF"
          style={styles.amountInput}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {categoryItems.map((item) => {
            const Icon = item.icon;
            const selected = selectedCategory?.label === item.label;

            return (
              <Pressable
                key={item.label}
                style={[styles.categoryCard, selected && styles.categorySelected]}
                onPress={() => {
                  setSelectedCategory(item);
                  setErrorMessage('');
                }}
              >
                <View style={[styles.categoryIcon, { backgroundColor: item.bg }]}>
                  <Icon size={24} color={item.color} strokeWidth={2.1} />
                </View>
                <Text style={styles.categoryLabel}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.customCategory}>
          <Plus size={20} color={colors.primary} strokeWidth={2.4} />
          <Text style={styles.customCategoryText}>Add Custom Category</Text>
        </Pressable>

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="e.g., Groceries at Shoprite"
          placeholderTextColor="#99A1AF"
          style={styles.input}
        />

        <Text style={styles.label}>Date</Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder=""
          placeholderTextColor="#99A1AF"
          style={styles.input}
        />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Pressable
          disabled={!canSave}
          onPress={handleSave}
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>Save Expense</Text>
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
  label: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: '#101828',
    marginBottom: 8,
  },
  amountInput: {
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DC',
    paddingHorizontal: 16,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 28,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 12,
    marginBottom: 16,
  },
  categoryCard: {
    width: '30.9%',
    minHeight: 104,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  categorySelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#101828',
  },
  customCategory: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  customCategoryText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: colors.primary,
  },
  input: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DC',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#101828',
    marginBottom: 24,
  },
  errorText: {
    marginTop: -8,
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
