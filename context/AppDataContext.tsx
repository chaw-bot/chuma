import React, { createContext, useContext, useMemo, useState } from 'react';

export type GoalCategory = 'education' | 'emergency' | 'business' | 'housing';
export type AutoSaveFrequency = 'daily' | 'weekly' | 'monthly';
export type SessionMode = 'demo';

export type SavingsGoal = {
  id: string;
  name: string;
  category: GoalCategory;
  targetAmount: number;
  currentAmount: number;
  timelineMonths: number;
  color: string;
  autoSaveAmount?: number;
  autoSaveFrequency?: AutoSaveFrequency;
  autoSaveStartDate?: string;
};

export type ExpenseCategory = 'Food' | 'Transport' | 'Shopping' | 'Other';

export type ExpenseItem = {
  id: string;
  category: ExpenseCategory;
  amount: number;
  createdAt: string;
};

export type SessionUser = {
  phoneNumber: string;
  mode: SessionMode;
};

type AddGoalInput = Omit<SavingsGoal, 'id' | 'currentAmount'>;
type AddExpenseInput = Omit<ExpenseItem, 'id' | 'createdAt'>;

type AppDataContextValue = {
  goals: SavingsGoal[];
  expenses: ExpenseItem[];
  currentUser: SessionUser | null;
  addGoal: (goal: AddGoalInput) => void;
  addExpense: (expense: AddExpenseInput) => void;
  signInDemo: (phoneNumber: string) => void;
  signOut: () => void;
};

const initialGoals: SavingsGoal[] = [
  {
    id: 'goal-emergency-fund',
    name: 'Emergency Fund',
    currentAmount: 2500,
    targetAmount: 5000,
    timelineMonths: 7,
    category: 'emergency',
    color: '#3B82F6',
    autoSaveAmount: 15,
    autoSaveFrequency: 'daily',
    autoSaveStartDate: 'Tomorrow',
  },
  {
    id: 'goal-school-fees',
    name: 'School Fees',
    currentAmount: 1800,
    targetAmount: 3000,
    timelineMonths: 6,
    category: 'education',
    color: '#8B5CF6',
  },
  {
    id: 'goal-business-stock',
    name: 'Business Stock',
    currentAmount: 800,
    targetAmount: 2000,
    timelineMonths: 8,
    category: 'business',
    color: '#F97316',
  },
];

const initialExpenses: ExpenseItem[] = [
  { id: 'expense-food', category: 'Food', amount: 350, createdAt: '2026-04-30T08:00:00.000Z' },
  { id: 'expense-transport', category: 'Transport', amount: 120, createdAt: '2026-04-30T12:30:00.000Z' },
  { id: 'expense-shopping', category: 'Shopping', amount: 200, createdAt: '2026-04-29T15:45:00.000Z' },
  { id: 'expense-airtime', category: 'Other', amount: 50, createdAt: '2026-04-29T18:10:00.000Z' },
];

const goalColors: Record<GoalCategory, string> = {
  education: '#3B82F6',
  emergency: '#EF4444',
  business: '#8B5CF6',
  housing: '#F97316',
};

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<SavingsGoal[]>(initialGoals);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);

  const value = useMemo<AppDataContextValue>(
    () => ({
      goals,
      expenses,
      currentUser,
      addGoal: (goal) => {
        setGoals((current) => {
          const existingGoal = current.find(
            (item) =>
              item.name.toLowerCase() === goal.name.toLowerCase() &&
              item.category === goal.category &&
              item.targetAmount === goal.targetAmount
          );

          if (!existingGoal) {
            return [
              {
                ...goal,
                id: `goal-${Date.now()}`,
                currentAmount: 0,
                color: goalColors[goal.category],
              },
              ...current,
            ];
          }

          return current.map((item) =>
            item.id === existingGoal.id
              ? {
                  ...item,
                  timelineMonths: goal.timelineMonths,
                  autoSaveAmount: goal.autoSaveAmount,
                  autoSaveFrequency: goal.autoSaveFrequency,
                  autoSaveStartDate: goal.autoSaveStartDate,
                  color: goalColors[goal.category],
                }
              : item
          );
        });
      },
      addExpense: (expense) => {
        setExpenses((current) => [
          {
            ...expense,
            id: `expense-${Date.now()}`,
            createdAt: new Date().toISOString(),
          },
          ...current,
        ]);
      },
      signInDemo: (phoneNumber) => {
        setCurrentUser({
          phoneNumber,
          mode: 'demo',
        });
      },
      signOut: () => {
        setCurrentUser(null);
      },
    }),
    [currentUser, expenses, goals]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }

  return context;
}
