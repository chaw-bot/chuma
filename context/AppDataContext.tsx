import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut as signOutFromAuth } from '@react-native-firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  writeBatch,
} from '@react-native-firebase/firestore';

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
  fullName?: string;
  email?: string;
  provider?: 'mtn' | 'airtel' | 'zamtel';
};

type AddGoalInput = Omit<SavingsGoal, 'id' | 'currentAmount'>;
type AddExpenseInput = Omit<ExpenseItem, 'id' | 'createdAt'>;

type AppDataContextValue = {
  goals: SavingsGoal[];
  expenses: ExpenseItem[];
  currentUser: SessionUser | null;
  isAuthReady: boolean;
  addGoal: (goal: AddGoalInput) => void;
  addExpense: (expense: AddExpenseInput) => void;
  checkExistingUser: () => Promise<SessionUser | null>;
  signInDemo: (user: SessionUser) => void;
  updateCurrentUser: (updates: Partial<SessionUser>) => void;
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

const db = getFirestore();
const auth = getAuth();

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<SavingsGoal[]>(initialGoals);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const goalsSeedDone = useRef(false);
  const expensesSeedDone = useRef(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      const uid = user?.uid ?? '';
      setUserId(uid);
      if (uid) {
        try {
          const snap = await getDoc(doc(db, 'users', uid, 'meta', 'profile'));
          if (snap.exists()) {
            setCurrentUser(snap.data() as SessionUser);
          }
        } catch {
          // profile not found, user will go through CompleteProfile
        }
      } else {
        setCurrentUser(null);
      }
      setIsAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    goalsSeedDone.current = false;
    const goalsRef = collection(db, 'users', userId, 'goals');

    const unsub = onSnapshot(goalsRef, async (snapshot) => {
      if (snapshot.empty && !goalsSeedDone.current) {
        goalsSeedDone.current = true;
        const batch = writeBatch(db);
        initialGoals.forEach((goal) => batch.set(doc(goalsRef, goal.id), goal));
        await batch.commit();
      } else {
        setGoals(snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as SavingsGoal)));
      }
    });

    return unsub;
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    expensesSeedDone.current = false;
    const expensesRef = collection(db, 'users', userId, 'expenses');

    const unsub = onSnapshot(expensesRef, async (snapshot) => {
      if (snapshot.empty && !expensesSeedDone.current) {
        expensesSeedDone.current = true;
        const batch = writeBatch(db);
        initialExpenses.forEach((expense) => batch.set(doc(expensesRef, expense.id), expense));
        await batch.commit();
      } else {
        const items = snapshot.docs
          .map((d) => ({ ...d.data(), id: d.id } as ExpenseItem))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setExpenses(items);
      }
    });

    return unsub;
  }, [userId]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      goals,
      expenses,
      currentUser,
      isAuthReady,
      addGoal: (goal) => {
        if (!userId) return;
        const goalsRef = collection(db, 'users', userId, 'goals');
        const existing = goals.find(
          (item) =>
            item.name.toLowerCase() === goal.name.toLowerCase() &&
            item.category === goal.category &&
            item.targetAmount === goal.targetAmount
        );

        if (existing) {
          setDoc(doc(goalsRef, existing.id), {
            ...existing,
            timelineMonths: goal.timelineMonths,
            autoSaveAmount: goal.autoSaveAmount,
            autoSaveFrequency: goal.autoSaveFrequency,
            autoSaveStartDate: goal.autoSaveStartDate,
            color: goalColors[goal.category],
          }).catch(console.error);
        } else {
          const newGoal: SavingsGoal = {
            ...goal,
            id: `goal-${Date.now()}`,
            currentAmount: 0,
            color: goalColors[goal.category],
          };
          setDoc(doc(goalsRef, newGoal.id), newGoal).catch(console.error);
        }
      },
      addExpense: (expense) => {
        if (!userId) return;
        const expensesRef = collection(db, 'users', userId, 'expenses');
        const newExpense: ExpenseItem = {
          ...expense,
          id: `expense-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        setDoc(doc(expensesRef, newExpense.id), newExpense).catch(console.error);
      },
      checkExistingUser: async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) return null;
        const snap = await getDoc(doc(db, 'users', uid, 'meta', 'profile'));
        return snap.exists() ? (snap.data() as SessionUser) : null;
      },
      signInDemo: (user) => {
        setCurrentUser(user);
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const profile = Object.fromEntries(
          Object.entries(user).filter(([, v]) => v !== undefined)
        );
        setDoc(doc(db, 'users', uid, 'meta', 'profile'), profile).catch(console.error);
      },
      updateCurrentUser: (updates) => {
        setCurrentUser((current) => {
          const base = current ?? ({ phoneNumber: '+260 97 123 4567', mode: 'demo' } satisfies SessionUser);
          return { ...base, ...updates };
        });
      },
      signOut: () => {
        setCurrentUser(null);
        setUserId('');
        signOutFromAuth(auth).catch(console.error);
      },
    }),
    [currentUser, expenses, goals, isAuthReady, userId]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used within an AppDataProvider');
  return context;
}
