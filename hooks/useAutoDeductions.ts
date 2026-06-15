import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { doc, getFirestore, setDoc } from '@react-native-firebase/firestore';
import {
  chargeGoal,
  confirmCharge,
  listDueGoals,
  Operator,
} from '../api/goalsApi';
import { SavingsGoal } from '../context/AppDataContext';

const CONFIRM_POLL_MS = 4_000;
const CONFIRM_TIMEOUT_MS = 60_000;
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

const db = getFirestore();

async function pollUntilSettled(uid: string, goalId: string, reference: string) {
  const deadline = Date.now() + CONFIRM_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const result = await confirmCharge(uid, goalId, reference);
    if (result.applied || result.status === 'successful') return { ...result, success: true };
    if (result.status === 'failed') return { ...result, success: false };
    await new Promise<void>((resolve) => setTimeout(resolve, CONFIRM_POLL_MS));
  }
  return null;
}

async function writeNotification(
  uid: string,
  goalName: string,
  success: boolean,
  amount: number,
) {
  const id = `auto-deduction-${Date.now()}`;
  await setDoc(doc(db, 'users', uid, 'notifications', id), {
    id,
    title: success ? 'Automatic deduction successful' : 'Automatic deduction failed',
    message: success
      ? `ZMW ${amount.toLocaleString()} was automatically saved to your ${goalName} goal.`
      : `We couldn't complete the automatic deduction for your ${goalName} goal. Please check your wallet balance.`,
    createdAt: new Date().toISOString(),
    read: false,
    type: 'deduction',
  });
}

export function useAutoDeductions(
  uid: string,
  goals: SavingsGoal[],
  phone: string,
  operator: Operator,
) {
  // Use a ref so runDeductions always sees the latest goals without being in its deps
  const goalsRef = useRef(goals);
  useEffect(() => { goalsRef.current = goals; });

  // Track in-flight and already-charged goals to prevent double-charging
  const inFlight = useRef(new Set<string>());
  const chargedThisSession = useRef(new Set<string>());

  const runDeductions = useCallback(async () => {
    if (!uid || !phone) return;

    let dueGoals;
    try {
      dueGoals = await listDueGoals(uid);
    } catch {
      return;
    }

    for (const dueGoal of dueGoals) {
      if (inFlight.current.has(dueGoal.id)) continue;
      if (chargedThisSession.current.has(dueGoal.id)) continue;

      const localGoal = goalsRef.current.find((g) => g.id === dueGoal.id);
      if (!localGoal || localGoal.autoSaveActive === false) continue;

      inFlight.current.add(dueGoal.id);

      // Each charge runs independently — don't block the loop
      (async () => {
        try {
          const charge = await chargeGoal(uid, dueGoal.id, { phone, operator });

          if (charge.status === 'failed') {
            await writeNotification(uid, localGoal.name, false, 0);
            return;
          }

          const settled = await pollUntilSettled(uid, dueGoal.id, charge.reference);
          const applied = settled?.success ?? false;

          await writeNotification(
            uid,
            localGoal.name,
            applied,
            applied ? (settled?.amountApplied ?? localGoal.autoSaveAmount ?? 0) : 0,
          );

          if (applied) chargedThisSession.current.add(dueGoal.id);
        } catch {
          writeNotification(uid, localGoal.name, false, 0).catch(() => {});
        } finally {
          inFlight.current.delete(dueGoal.id);
        }
      })();
    }
  }, [uid, phone, operator]);

  useEffect(() => {
    if (!uid || !phone) return;

    // Run immediately, then on a 5-minute interval
    runDeductions();
    const interval = setInterval(runDeductions, CHECK_INTERVAL_MS);

    // Also run whenever the app returns to foreground
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') runDeductions();
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [uid, phone, runDeductions]);
}
