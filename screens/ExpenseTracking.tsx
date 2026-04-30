import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { Plus, ShoppingBag, Utensils, Bus, Phone, MoreHorizontal } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppData } from '../context/AppDataContext';
import { RootStackParamList } from '../types/navigation';
import { parseAmount, sanitizeAmountInput } from '../utils/auth';
import { formatExpenseDateLabel, isSameMonth } from '../utils/date';
import { BottomNav } from '../components/BottomVav';
import { colors, radii, shadows } from '../theme/colors';

type ExpenseTrackingNav = NativeStackNavigationProp<RootStackParamList, 'ExpenseTracking'>;

export default function ExpenseTracking() {
  const navigation = useNavigation<ExpenseTrackingNav>();
  const { expenses, addExpense } = useAppData();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Food' | 'Transport' | 'Shopping' | 'Other' | ''>('');
  const [errorMessage, setErrorMessage] = useState('');

  const expenseMeta = {
    Food: { icon: Utensils },
    Transport: { icon: Bus },
    Shopping: { icon: ShoppingBag },
    Other: { icon: Phone },
  } as const;

  const currentMonthExpenses = expenses.filter((expense) =>
    isSameMonth(expense.createdAt)
  );
  const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const parsedAmount = parseAmount(amount);

  const handleSaveExpense = () => {
    if (!parsedAmount || !selectedCategory) {
      setErrorMessage('Enter a valid amount and choose a category.');
      return;
    }

    addExpense({
      amount: parsedAmount,
      category: selectedCategory,
    });
    setAmount('');
    setSelectedCategory('');
    setErrorMessage('');
    setShowAddExpense(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Pressable onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Track Expenses</Text>
        <Text style={styles.subtitle}>A lighter view of where your money goes.</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>This Month's Spending</Text>
          <Text style={styles.summaryAmount}>K {totalExpenses}</Text>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summarySubLabel}>Last Month</Text>
              <Text style={styles.summarySubAmount}>K 850</Text>
            </View>
            <View>
              <Text style={styles.summarySubLabel}>Change</Text>
              <Text style={styles.summarySubAmount}>-15%</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => setShowAddExpense(!showAddExpense)}
        >
          <Plus size={18} color={colors.surface} />
          <Text style={styles.addButtonText}>Add Expense</Text>
        </Pressable>

        {showAddExpense ? (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>New Expense</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputPrefix}>K</Text>
                <TextInput
                  value={amount}
                  onChangeText={(value) => {
                    setAmount(sanitizeAmountInput(value));
                    setErrorMessage('');
                  }}
                  placeholder="0"
                  placeholderTextColor={colors.textSubtle}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryRow}>
                {[
                  { name: 'Food', icon: Utensils },
                  { name: 'Transport', icon: Bus },
                  { name: 'Shopping', icon: ShoppingBag },
                  { name: 'Other', icon: MoreHorizontal },
                ].map((cat) => (
                  <Pressable
                    key={cat.name}
                    style={[
                      styles.categoryBtn,
                      selectedCategory === cat.name && styles.categoryBtnSelected,
                    ]}
                    onPress={() => {
                      setSelectedCategory(cat.name as 'Food' | 'Transport' | 'Shopping' | 'Other');
                      setErrorMessage('');
                    }}
                  >
                    <cat.icon width={18} height={18} color={selectedCategory === cat.name ? colors.surface : colors.primary} />
                    <Text style={[styles.categoryText, selectedCategory === cat.name && styles.categoryTextSelected]}>{cat.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <Pressable
              style={[
                styles.saveButton,
                (!parsedAmount || !selectedCategory) && styles.saveButtonDisabled,
              ]}
              disabled={!parsedAmount || !selectedCategory}
              onPress={handleSaveExpense}
            >
              <Text style={styles.saveButtonText}>Save Expense</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          <Text style={styles.emptyChart}>Visualization can be added here without adding clutter.</Text>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          {expenses.map((exp) => (
            <View key={exp.id} style={styles.expenseRow}>
              <View style={styles.expenseIcon}>
                {React.createElement(expenseMeta[exp.category].icon, {
                  width: 18,
                  height: 18,
                  color: colors.primary,
                })}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.expenseCategory}>{exp.category}</Text>
                <Text style={styles.expenseDate}>{formatExpenseDateLabel(exp.createdAt)}</Text>
              </View>
              <Text style={styles.expenseAmount}>K {exp.amount}</Text>
            </View>
          ))}
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Insight</Text>
          <Text style={styles.insightText}>
            You spent K 120 less on transport this month. Keep the same rhythm.
          </Text>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContainer: { padding: 24, paddingBottom: 120 },
  backText: { color: colors.primary, marginBottom: 16, marginTop: 10, fontSize: 16 },
  title: { fontSize: 30, fontWeight: '700', color: colors.text, letterSpacing: -0.8 },
  subtitle: { fontSize: 15, color: colors.textMuted, marginBottom: 24, marginTop: 4 },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  summaryLabel: { color: colors.textMuted, marginBottom: 6 },
  summaryAmount: { color: colors.text, fontSize: 34, marginBottom: 12, fontWeight: '700', letterSpacing: -1 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summarySubLabel: { color: colors.textSubtle, fontSize: 12 },
  summarySubAmount: { color: colors.primary, fontSize: 16, fontWeight: '600', marginTop: 2 },
  addButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  addButtonText: { color: colors.surface, fontSize: 16, fontWeight: '600' },
  addForm: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: colors.text },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: colors.text, marginBottom: 8, fontWeight: '600' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingLeft: 36,
    paddingVertical: 12,
    backgroundColor: colors.surface,
  },
  inputPrefix: { position: 'absolute', left: 12, fontSize: 16, color: colors.textMuted },
  input: { flex: 1, fontSize: 16, color: colors.text },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  categoryBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
  },
  categoryBtnSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  categoryText: { fontSize: 12, color: colors.text, marginTop: 6 },
  categoryTextSelected: { color: colors.surface },
  saveButton: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radii.md, alignItems: 'center', marginTop: 8 },
  saveButtonDisabled: { opacity: 0.45 },
  saveButtonText: { color: colors.surface, fontSize: 16, fontWeight: '600' },
  errorText: { fontSize: 12, color: colors.danger, marginTop: 4 },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: colors.text },
  emptyChart: { color: colors.textMuted, lineHeight: 20 },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  expenseIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: colors.primarySoft,
  },
  expenseCategory: { fontSize: 14, color: colors.text, fontWeight: '500' },
  expenseDate: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  expenseAmount: { fontSize: 16, color: colors.text, fontWeight: '600' },
  insightCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 16,
  },
  insightTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6, color: colors.text },
  insightText: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
});
