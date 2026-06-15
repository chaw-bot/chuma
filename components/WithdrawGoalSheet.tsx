import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ArrowUpRight, Check, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  confirmWithdraw,
  GoalsApiError,
  Operator,
  withdrawGoal,
} from '../api/goalsApi';
import { parseAmount, sanitizeAmountInput } from '../utils/auth';
import { colors } from '../theme/colors';

type Phase = 'form' | 'awaiting' | 'success' | 'failed';

const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 60000;

const operatorOptions: Array<{ id: Operator; label: string; dot: string }> = [
  { id: 'mtn', label: 'MTN', dot: '#FCD34D' },
  { id: 'airtel', label: 'Airtel', dot: '#EF4444' },
  { id: 'zamtel', label: 'Zamtel', dot: '#22C55E' },
];

export type WithdrawGoalTarget = {
  goalId: string;
  goalName: string;
  availableAmount: number;
};

type WithdrawGoalSheetProps = {
  visible: boolean;
  uid: string;
  target: WithdrawGoalTarget | null;
  defaultPhone?: string;
  defaultOperator?: Operator;
  onClose: () => void;
};

export default function WithdrawGoalSheet({
  visible,
  uid,
  target,
  defaultPhone,
  defaultOperator,
  onClose,
}: WithdrawGoalSheetProps) {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('form');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [operator, setOperator] = useState<Operator>('mtn');
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [withdrawnAmount, setWithdrawnAmount] = useState<number | null>(null);
  const cancelledRef = useRef(false);

  // Reset the form each time the sheet is opened for a goal. The amount
  // pre-fills with the full available balance, mirroring the deposit sheet's
  // default-but-editable behaviour.
  useEffect(() => {
    if (!visible) return;
    cancelledRef.current = false;
    setPhase('form');
    setAmount(target?.availableAmount ? String(target.availableAmount) : '');
    setPhone(defaultPhone ?? '');
    setOperator(defaultOperator ?? 'mtn');
    setErrorMessage('');
    setStatusMessage('');
    setWithdrawnAmount(null);
  }, [visible, target?.goalId, target?.availableAmount, defaultPhone, defaultOperator]);

  useEffect(
    () => () => {
      cancelledRef.current = true;
    },
    []
  );

  const closeSheet = () => {
    cancelledRef.current = true;
    onClose();
  };

  const parsedAmount = parseAmount(amount);
  const phoneDigits = phone.replace(/\D/g, '');
  const available = target?.availableAmount ?? 0;
  const exceedsBalance = parsedAmount != null && parsedAmount > available;
  const canWithdraw =
    Boolean(target) &&
    Boolean(parsedAmount) &&
    !exceedsBalance &&
    phoneDigits.length >= 9;

  const handleWithdraw = async () => {
    if (!target || !parsedAmount || !uid) {
      setErrorMessage('Enter a valid amount and wallet number.');
      return;
    }
    if (parsedAmount > available) {
      setErrorMessage('Amount is more than the goal balance.');
      return;
    }

    setErrorMessage('');
    setPhase('awaiting');
    setStatusMessage('Sending your withdrawal request…');

    try {
      const result = await withdrawGoal(uid, target.goalId, {
        phone: phoneDigits,
        operator,
        amount: parsedAmount,
      });

      if (cancelledRef.current) return;

      if (result.status === 'failed') {
        setPhase('failed');
        setStatusMessage(result.message || 'The withdrawal could not be processed.');
        return;
      }

      if (result.applied) {
        setWithdrawnAmount(result.amount ?? parsedAmount);
        setStatusMessage('');
        setPhase('success');
        return;
      }

      setStatusMessage('Processing the payout to your wallet…');
      await pollConfirm(target.goalId, result.reference, parsedAmount);
    } catch (error) {
      if (cancelledRef.current) return;
      setPhase('failed');
      setStatusMessage(
        error instanceof GoalsApiError
          ? error.message
          : 'Something went wrong starting the withdrawal.'
      );
    }
  };

  const pollConfirm = async (
    goalId: string,
    reference: string,
    requestedAmount: number
  ) => {
    const deadline = Date.now() + POLL_TIMEOUT_MS;

    while (!cancelledRef.current && Date.now() < deadline) {
      try {
        const result = await confirmWithdraw(uid, goalId, reference);
        if (cancelledRef.current) return;

        if (result.applied || result.status === 'successful') {
          setWithdrawnAmount(result.amountApplied ?? requestedAmount);
          setStatusMessage('');
          setPhase('success');
          return;
        }

        if (result.status === 'failed') {
          setPhase('failed');
          setStatusMessage('The withdrawal was declined or failed.');
          return;
        }
      } catch (error) {
        if (cancelledRef.current) return;
        setPhase('failed');
        setStatusMessage(
          error instanceof GoalsApiError
            ? error.message
            : 'Could not confirm the withdrawal.'
        );
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    if (!cancelledRef.current) {
      setPhase('failed');
      setStatusMessage(
        'Timed out waiting for the payout. If it was approved, your wallet will be credited shortly.'
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={closeSheet}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropDismiss} onPress={closeSheet} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>
              {phase === 'success' ? 'Withdrawal requested' : 'Withdraw from goal'}
            </Text>
            <Pressable onPress={closeSheet} hitSlop={8} style={styles.closeButton}>
              <X size={20} color="#4A5565" strokeWidth={2.2} />
            </Pressable>
          </View>

          {target ? <Text style={styles.goalName}>{target.goalName}</Text> : null}

          {phase === 'form' ? (
            <View>
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
                style={styles.input}
              />
              <Text style={styles.helperText}>
                Available: ZMW {available.toLocaleString()}
              </Text>

              <Text style={styles.label}>Wallet number</Text>
              <TextInput
                value={phone}
                onChangeText={(value) => {
                  setPhone(value);
                  setErrorMessage('');
                }}
                keyboardType="phone-pad"
                placeholder="0977000000"
                placeholderTextColor="#99A1AF"
                style={styles.input}
              />

              <Text style={styles.label}>Operator</Text>
              <View style={styles.operatorRow}>
                {operatorOptions.map((item) => {
                  const selected = operator === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      style={[styles.operator, selected && styles.operatorSelected]}
                      onPress={() => setOperator(item.id)}
                    >
                      <View style={[styles.operatorDot, { backgroundColor: item.dot }]} />
                      <Text
                        style={[
                          styles.operatorText,
                          selected && styles.operatorTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              <Pressable
                disabled={!canWithdraw}
                onPress={handleWithdraw}
                style={[styles.primaryButton, !canWithdraw && styles.buttonDisabled]}
              >
                <Text style={styles.primaryButtonText}>Withdraw to wallet</Text>
              </Pressable>
            </View>
          ) : null}

          {phase === 'awaiting' ? (
            <View style={styles.statusBlock}>
              <View style={styles.statusIcon}>
                <ArrowUpRight size={28} color={colors.primary} strokeWidth={2} />
              </View>
              <ActivityIndicator color={colors.primary} style={styles.spinner} />
              <Text style={styles.statusText}>{statusMessage}</Text>
            </View>
          ) : null}

          {phase === 'success' ? (
            <View style={styles.statusBlock}>
              <View style={[styles.statusIcon, styles.successIcon]}>
                <Check size={28} color={colors.surface} strokeWidth={2.6} />
              </View>
              <Text style={styles.successText}>
                ZMW {withdrawnAmount?.toLocaleString()} is on its way to your wallet.
              </Text>
              <Pressable onPress={closeSheet} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Done</Text>
              </Pressable>
            </View>
          ) : null}

          {phase === 'failed' ? (
            <View style={styles.statusBlock}>
              <View style={[styles.statusIcon, styles.failedIcon]}>
                <X size={28} color={colors.surface} strokeWidth={2.6} />
              </View>
              <Text style={styles.statusText}>{statusMessage}</Text>
              <Pressable
                onPress={() => {
                  cancelledRef.current = false;
                  setPhase('form');
                }}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>Try again</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(16, 24, 40, 0.45)',
    justifyContent: 'flex-end',
  },
  backdropDismiss: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: '#101828',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalName: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4A5565',
    marginTop: 2,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#101828',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DC',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#101828',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#4A5565',
    marginBottom: 16,
  },
  operatorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  operator: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  operatorSelected: {
    borderColor: colors.primary,
    backgroundColor: '#ECFDF3',
  },
  operatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  operatorText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4A5565',
  },
  operatorTextSelected: {
    color: colors.primary,
  },
  errorText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: '#C10007',
  },
  primaryButton: {
    height: 54,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.surface,
  },
  statusBlock: {
    alignItems: 'center',
    paddingTop: 12,
  },
  statusIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successIcon: {
    backgroundColor: colors.primary,
  },
  failedIcon: {
    backgroundColor: '#E7000B',
  },
  spinner: {
    marginBottom: 12,
  },
  statusText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4A5565',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  successText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: '#101828',
    textAlign: 'center',
  },
});
