import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut as signOutFromAuth } from '@react-native-firebase/auth';
import {
  getFirestore,
  collection,
  deleteDoc,
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
  createdAt?: string;
  autoSaveAmount?: number;
  autoSaveFrequency?: AutoSaveFrequency;
  autoSaveStartDate?: string;
  autoSaveActive?: boolean;
  autoSaveCreatedAt?: string;
};

export type ExpenseCategory = 'Food' | 'Transport' | 'Shopping' | 'Other';

export type ExpenseItem = {
  id: string;
  category: ExpenseCategory;
  amount: number;
  createdAt: string;
  description?: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read?: boolean;
  type: 'deduction' | 'goal' | 'expense' | 'tip';
};

export type InvestmentOption = {
  id: string;
  name: string;
  risk: string;
  returns: string;
  minAmount: number;
  description: string;
};

export type NotificationPreferences = {
  deductions: boolean;
  milestones: boolean;
  expenses: boolean;
  tips: boolean;
};

export type SessionUser = {
  phoneNumber: string;
  mode: SessionMode;
  fullName?: string;
  email?: string;
  provider?: 'mtn' | 'airtel' | 'zamtel';
};

type AddGoalInput = Omit<SavingsGoal, 'id' | 'currentAmount'> & {
  currentAmount?: number;
};
type AddExpenseInput = Omit<ExpenseItem, 'id' | 'createdAt'> & {
  createdAt?: string;
};

type AppDataContextValue = {
  goals: SavingsGoal[];
  expenses: ExpenseItem[];
  notifications: NotificationItem[];
  investments: InvestmentOption[];
  notificationPreferences: NotificationPreferences;
  currentUser: SessionUser | null;
  isAuthReady: boolean;
  addGoal: (goal: AddGoalInput) => void;
  updateGoal: (goalId: string, updates: Partial<SavingsGoal>) => void;
  addExpense: (expense: AddExpenseInput) => void;
  updateNotificationPreferences: (updates: Partial<NotificationPreferences>) => void;
  checkExistingUser: () => Promise<SessionUser | null>;
  signInDemo: (user: SessionUser) => void;
  updateCurrentUser: (updates: Partial<SessionUser>) => void;
  signOut: () => void;
};

const goalColors: Record<GoalCategory, string> = {
  education: '#3B82F6',
  emergency: '#EF4444',
  business: '#8B5CF6',
  housing: '#F97316',
};

const defaultNotificationPreferences: NotificationPreferences = {
  deductions: false,
  milestones: false,
  expenses: false,
  tips: false,
};

const withoutUndefined = <T extends Record<string, unknown>>(value: T) =>
  Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)
  ) as T;

const toFiniteNumber = (value: unknown, fallback = 0) => {
  const numberValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const normalizeGoal = (data: Record<string, unknown>, id: string): SavingsGoal => ({
  ...(data as SavingsGoal),
  id,
  name: typeof data.name === 'string' ? data.name : 'Savings Goal',
  category: ['education', 'emergency', 'business', 'housing'].includes(String(data.category))
    ? (data.category as GoalCategory)
    : 'business',
  targetAmount: toFiniteNumber(data.targetAmount),
  currentAmount: toFiniteNumber(data.currentAmount),
  timelineMonths: toFiniteNumber(data.timelineMonths),
  color: typeof data.color === 'string' ? data.color : goalColors.business,
  autoSaveAmount:
    data.autoSaveAmount === undefined ? undefined : toFiniteNumber(data.autoSaveAmount),
});

const normalizeExpense = (data: Record<string, unknown>, id: string): ExpenseItem => ({
  ...(data as ExpenseItem),
  id,
  category: ['Food', 'Transport', 'Shopping', 'Other'].includes(String(data.category))
    ? (data.category as ExpenseCategory)
    : 'Other',
  amount: toFiniteNumber(data.amount),
  createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
});

const normalizeInvestment = (data: Record<string, unknown>, id: string): InvestmentOption => ({
  ...(data as InvestmentOption),
  id,
  name: typeof data.name === 'string' ? data.name : 'Investment Option',
  risk: typeof data.risk === 'string' ? data.risk : 'Unknown',
  returns: typeof data.returns === 'string' ? data.returns : 'N/A',
  minAmount: toFiniteNumber(data.minAmount),
  description: typeof data.description === 'string' ? data.description : '',
});

const newestFirst = <T extends { createdAt?: string }>(items: T[]) =>
  [...items].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));

const legacySeedDocIds = {
  goals: ['goal-emergency-fund', 'goal-school-fees', 'goal-business-stock'],
  expenses: ['expense-food', 'expense-transport', 'expense-shopping', 'expense-airtime'],
  notifications: [
    'notification-autosave',
    'notification-next-deduction',
    'notification-milestone',
    'notification-tip',
  ],
};

const dummyGoals: SavingsGoal[] = [
  {
    id: 'dummy-goal-school-fees',
    name: 'School Fees',
    category: 'education',
    currentAmount: 1800,
    targetAmount: 3000,
    timelineMonths: 8,
    color: goalColors.education,
    createdAt: '2026-05-01T08:00:00.000Z',
    autoSaveAmount: 50,
    autoSaveFrequency: 'weekly',
    autoSaveStartDate: 'May 8, 2026',
    autoSaveActive: true,
    autoSaveCreatedAt: '2026-05-01T08:00:00.000Z',
  },
  {
    id: 'dummy-goal-business-stock',
    name: 'Business Stock',
    category: 'business',
    currentAmount: 800,
    targetAmount: 2000,
    timelineMonths: 6,
    color: goalColors.business,
    createdAt: '2026-04-30T16:30:00.000Z',
    autoSaveAmount: 100,
    autoSaveFrequency: 'monthly',
    autoSaveStartDate: 'May 20, 2026',
    autoSaveActive: true,
    autoSaveCreatedAt: '2026-04-30T16:30:00.000Z',
  },
  {
    id: 'dummy-goal-emergency-fund',
    name: 'Emergency Fund',
    category: 'emergency',
    currentAmount: 2500,
    targetAmount: 5000,
    timelineMonths: 10,
    color: goalColors.emergency,
    createdAt: '2026-04-29T11:45:00.000Z',
    autoSaveAmount: 20,
    autoSaveFrequency: 'daily',
    autoSaveStartDate: 'Tomorrow',
    autoSaveActive: true,
    autoSaveCreatedAt: '2026-04-29T11:45:00.000Z',
  },
  {
    id: 'dummy-goal-home-deposit',
    name: 'Home Deposit',
    category: 'housing',
    currentAmount: 4200,
    targetAmount: 15000,
    timelineMonths: 18,
    color: goalColors.housing,
    createdAt: '2026-04-28T09:15:00.000Z',
    autoSaveAmount: 250,
    autoSaveFrequency: 'monthly',
    autoSaveStartDate: 'Jun 1, 2026',
    autoSaveActive: true,
    autoSaveCreatedAt: '2026-04-28T09:15:00.000Z',
  },
  {
    id: 'dummy-goal-new-phone',
    name: 'New Phone',
    category: 'business',
    currentAmount: 950,
    targetAmount: 1500,
    timelineMonths: 3,
    color: goalColors.business,
    createdAt: '2026-04-27T13:20:00.000Z',
    autoSaveAmount: 75,
    autoSaveFrequency: 'weekly',
    autoSaveStartDate: 'May 10, 2026',
    autoSaveActive: false,
    autoSaveCreatedAt: '2026-04-27T13:20:00.000Z',
  },
];

const dummyExpenses: ExpenseItem[] = [
  {
    id: 'dummy-expense-groceries',
    category: 'Food',
    amount: 250,
    description: 'Groceries - Shoprite',
    createdAt: '2026-05-01T08:30:00.000Z',
  },
  {
    id: 'dummy-expense-taxi',
    category: 'Transport',
    amount: 30,
    description: 'Taxi fare',
    createdAt: '2026-05-01T10:15:00.000Z',
  },
  {
    id: 'dummy-expense-stock',
    category: 'Shopping',
    amount: 800,
    description: 'Stock purchase',
    createdAt: '2026-04-30T14:20:00.000Z',
  },
  {
    id: 'dummy-expense-restaurant',
    category: 'Food',
    amount: 120,
    description: 'Restaurant',
    createdAt: '2026-04-29T18:00:00.000Z',
  },
  {
    id: 'dummy-expense-airtime',
    category: 'Other',
    amount: 50,
    description: 'Mobile airtime',
    createdAt: '2026-04-29T09:45:00.000Z',
  },
];

const dummyGoalTimestampById = Object.fromEntries(
  dummyGoals.map((goal) => [goal.id, goal.createdAt])
);

const db = getFirestore();
const auth = getAuth();

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [investments, setInvestments] = useState<InvestmentOption[]>([]);
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences>(defaultNotificationPreferences);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const seedDummyData = async () => {
      const seedRef = doc(db, 'users', userId, 'meta', 'dummyDataV1');
      const seedSnap = await getDoc(seedRef);

      if (seedSnap.exists()) {
        return;
      }

      const batch = writeBatch(db);
      dummyGoals.forEach((goal) => {
        batch.set(doc(db, 'users', userId, 'goals', goal.id), goal);
      });
      dummyExpenses.forEach((expense) => {
        batch.set(doc(db, 'users', userId, 'expenses', expense.id), expense);
      });
      batch.set(seedRef, {
        seededAt: new Date().toISOString(),
        goals: dummyGoals.length,
        deductions: dummyGoals.filter((goal) => goal.autoSaveAmount).length,
        expenses: dummyExpenses.length,
      });
      await batch.commit();
    };

    seedDummyData().catch(console.error);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    legacySeedDocIds.goals.forEach((id) => {
      deleteDoc(doc(db, 'users', userId, 'goals', id)).catch(console.error);
    });
    legacySeedDocIds.expenses.forEach((id) => {
      deleteDoc(doc(db, 'users', userId, 'expenses', id)).catch(console.error);
    });
    legacySeedDocIds.notifications.forEach((id) => {
      deleteDoc(doc(db, 'users', userId, 'notifications', id)).catch(console.error);
    });
  }, [userId]);

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
        setGoals([]);
        setExpenses([]);
        setNotifications([]);
        setInvestments([]);
        setNotificationPreferences(defaultNotificationPreferences);
      }
      setIsAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    const goalsRef = collection(db, 'users', userId, 'goals');

    const unsub = onSnapshot(goalsRef, (snapshot) => {
      const items = snapshot.docs.map((d) => normalizeGoal(d.data(), d.id));

      items.forEach((goal) => {
        if (goal.createdAt) return;

        const fallbackTimestamp =
          dummyGoalTimestampById[goal.id] ??
          (goal.id.startsWith('goal-')
            ? new Date(Number(goal.id.replace('goal-', '')) || Date.now()).toISOString()
            : new Date().toISOString());

        setDoc(
          doc(goalsRef, goal.id),
          withoutUndefined({
            createdAt: fallbackTimestamp,
            autoSaveCreatedAt:
              goal.autoSaveAmount && !goal.autoSaveCreatedAt ? fallbackTimestamp : undefined,
          }),
          { merge: true }
        ).catch(console.error);
      });

      setGoals(newestFirst(items));
    });

    return unsub;
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const notificationsRef = collection(db, 'users', userId, 'notifications');

    const unsub = onSnapshot(notificationsRef, (snapshot) => {
      const items = snapshot.docs
        .map((d) => ({ ...d.data(), id: d.id } as NotificationItem))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setNotifications(items);
    });

    return unsub;
  }, [userId]);

  useEffect(() => {
    const investmentsRef = collection(db, 'investmentOptions');

    const unsub = onSnapshot(investmentsRef, (snapshot) => {
      setInvestments(
        snapshot.docs.map((d) => normalizeInvestment(d.data(), d.id))
      );
    });

    return unsub;
  }, []);

  useEffect(() => {
    if (!userId) return;
    const expensesRef = collection(db, 'users', userId, 'expenses');

    const unsub = onSnapshot(expensesRef, (snapshot) => {
      const items = snapshot.docs
        .map((d) => normalizeExpense(d.data(), d.id))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setExpenses(items);
    });

    return unsub;
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const preferencesRef = doc(db, 'users', userId, 'meta', 'notificationPreferences');

    const unsub = onSnapshot(preferencesRef, (snapshot) => {
      setNotificationPreferences({
        ...defaultNotificationPreferences,
        ...(snapshot.exists() ? snapshot.data() : {}),
      } as NotificationPreferences);
    });

    return unsub;
  }, [userId]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      goals,
      expenses,
      notifications,
      investments,
      notificationPreferences,
      currentUser,
      isAuthReady,
      addGoal: (goal) => {
        if (!userId) return;
        const goalsRef = collection(db, 'users', userId, 'goals');
        const now = new Date().toISOString();
        const existing = goals.find(
          (item) =>
            item.name.toLowerCase() === goal.name.toLowerCase() &&
            item.category === goal.category &&
            item.targetAmount === goal.targetAmount
        );

        if (existing) {
          setDoc(
            doc(goalsRef, existing.id),
            withoutUndefined({
              ...existing,
              timelineMonths: goal.timelineMonths,
              autoSaveAmount: goal.autoSaveAmount,
              autoSaveFrequency: goal.autoSaveFrequency,
              autoSaveStartDate: goal.autoSaveStartDate,
              autoSaveActive: goal.autoSaveActive ?? true,
              autoSaveCreatedAt: goal.autoSaveAmount ? now : existing.autoSaveCreatedAt,
              color: goalColors[goal.category],
            })
          ).catch(console.error);
        } else {
          const newGoal: SavingsGoal = {
            ...goal,
            id: `goal-${Date.now()}`,
            currentAmount: goal.currentAmount ?? 0,
            color: goalColors[goal.category],
            createdAt: now,
            autoSaveActive: goal.autoSaveAmount ? goal.autoSaveActive ?? true : undefined,
            autoSaveCreatedAt: goal.autoSaveAmount ? now : undefined,
          };
          setDoc(doc(goalsRef, newGoal.id), withoutUndefined(newGoal)).catch(console.error);
        }
      },
      updateGoal: (goalId, updates) => {
        if (!userId) return;
        const sanitized = withoutUndefined(updates);
        setDoc(doc(db, 'users', userId, 'goals', goalId), sanitized, { merge: true }).catch(console.error);
      },
      addExpense: (expense) => {
        if (!userId) return;
        const expensesRef = collection(db, 'users', userId, 'expenses');
        const newExpense: ExpenseItem = {
          ...expense,
          id: `expense-${Date.now()}`,
          createdAt: expense.createdAt ?? new Date().toISOString(),
        };
        setDoc(doc(expensesRef, newExpense.id), newExpense).catch(console.error);
      },
      updateNotificationPreferences: (updates) => {
        if (!userId) return;
        setDoc(
          doc(db, 'users', userId, 'meta', 'notificationPreferences'),
          updates,
          { merge: true }
        ).catch(console.error);
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
          const base = current ?? ({ phoneNumber: '', mode: 'demo' } satisfies SessionUser);
          return { ...base, ...updates };
        });
        const uid = auth.currentUser?.uid;
        if (uid) {
          const sanitized = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined));
          setDoc(doc(db, 'users', uid, 'meta', 'profile'), sanitized, { merge: true }).catch(console.error);
        }
      },
      signOut: () => {
        setCurrentUser(null);
        setUserId('');
        signOutFromAuth(auth).catch(console.error);
      },
    }),
    [currentUser, expenses, goals, investments, isAuthReady, notificationPreferences, notifications, userId]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used within an AppDataProvider');
  return context;
}
