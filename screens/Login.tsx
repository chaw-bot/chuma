import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TextInput as RNTextInput,
} from 'react-native';
import { ShieldCheck, Smartphone, ArrowRight, KeyRound } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppData } from '../context/AppDataContext';
import { RootStackParamList } from '../types/navigation';
import { normalizeZmPhone } from '../utils/auth';
import { colors, radii, shadows } from '../theme/colors';

type LoginNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

export default function Login() {
  const navigation = useNavigation<LoginNavigationProp>();
  const codeInputRef = useRef<RNTextInput>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verification, setVerification] = useState<{ phone: string; code: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);

  const normalizedPhone = useMemo(() => normalizeZmPhone(phoneNumber), [phoneNumber]);
  const e164Phone = normalizedPhone ? `+${normalizedPhone}` : '';
  const localPhoneDisplay = normalizedPhone ? normalizedPhone.slice(3) : phoneNumber.replace(/\D/g, '');
  const isCodeSent = Boolean(verification);
  const RESEND_WINDOW = 30;

  const canSendCode = useMemo(
    () => Boolean(normalizedPhone) && !isSubmitting,
    [normalizedPhone, isSubmitting]
  );
  const canVerifyCode = useMemo(
    () => isCodeSent && verificationCode.trim().length >= 6 && !isSubmitting,
    [isCodeSent, verificationCode, isSubmitting]
  );
  const canResendCode = useMemo(
    () => isCodeSent && resendSeconds <= 0 && !isSubmitting,
    [isCodeSent, resendSeconds, isSubmitting]
  );

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendSeconds]);

  const handleSendCode = async () => {
    if (!canSendCode) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (!normalizedPhone) {
        setErrorMessage('Enter a valid phone number.');
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 600));
      const demoCode = normalizedPhone.slice(-6);
      setVerification({ phone: e164Phone, code: demoCode });
      setVerificationCode('');
      setResendSeconds(RESEND_WINDOW);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!canVerifyCode || !verification) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (verificationCode.trim() !== verification.code) {
        setErrorMessage('Incorrect code. Use the demo code shown below.');
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 400));
      navigation.navigate('CompleteProfile', {
        phoneNumber: verification.phone,
      });
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : 'Invalid code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetPhoneEntry = () => {
    setVerification(null);
    setVerificationCode('');
    setErrorMessage('');
    setResendSeconds(0);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {!isCodeSent ? (
        <>
          <View style={styles.entryContent}>
            <View style={styles.brandBlock}>
              <View style={styles.brandIconWrap}>
                <Smartphone size={36} color={colors.surface} strokeWidth={2.2} />
              </View>
              <Text style={styles.brandTitle}>Chuma</Text>
              <Text style={styles.brandSubtitle}>Enter your phone number to get started</Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.label}>Phone Number</Text>

              <View style={styles.phoneRow}>
                <View style={styles.countryCodeBox}>
                  <Text style={styles.countryCodeText}>+260</Text>
                </View>

                <TextInput
                  value={localPhoneDisplay}
                  onChangeText={(text) => {
                    const digits = text.replace(/\D/g, '');
                    const normalizedLocal = digits.startsWith('0')
                      ? digits.slice(0, 10)
                      : digits.slice(0, 9);
                    setPhoneNumber(normalizedLocal);
                    setErrorMessage('');
                  }}
                  placeholder="97 123 4567"
                  placeholderTextColor={colors.textSubtle}
                  keyboardType="phone-pad"
                  autoCorrect={false}
                  maxLength={11}
                  style={styles.phoneInput}
                />
              </View>

              <Text style={styles.helperText}>We'll send you a verification code via SMS</Text>

              <View style={styles.securityCard}>
                <View style={styles.securityRow}>
                  <ShieldCheck size={16} color={colors.surface} />
                  <Text style={styles.securityText}>
                    One-time verification code will be sent to verify your number
                  </Text>
                </View>
              </View>

              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            </View>
          </View>

          <View style={styles.footer}>
            <Pressable
              style={[styles.primaryButton, !canSendCode && styles.primaryButtonDisabled]}
              onPress={handleSendCode}
              disabled={!canSendCode}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.primaryButtonText}>Continue</Text>
              )}
            </Pressable>

            <Text style={styles.legalText}>
              By continuing, you agree to Chuma&apos;s Terms of Service and Privacy Policy
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.verifyContainer}>
          <Pressable onPress={resetPhoneEntry}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          <View style={styles.verifyHeader}>
            <View style={styles.brandIconWrap}>
              <KeyRound size={34} color={colors.surface} strokeWidth={2.2} />
            </View>
            <Text style={styles.brandTitle}>Verify Number</Text>
            <Text style={styles.brandSubtitle}>Enter the code sent to {verification?.phone ?? e164Phone}</Text>
          </View>

          <Pressable
            style={styles.otpRow}
            onPress={() => codeInputRef.current?.focus()}
          >
            {Array.from({ length: 6 }).map((_, index) => {
              const digit = verificationCode[index] ?? '';
              const isActive = index === verificationCode.length && verificationCode.length < 6;
              return (
                <View
                  key={index}
                  style={[styles.otpBox, isActive && styles.otpBoxActive]}
                >
                  <Text style={styles.otpDigit}>{digit}</Text>
                </View>
              );
            })}
          </Pressable>

          <RNTextInput
            ref={codeInputRef}
            value={verificationCode}
            onChangeText={(text) => {
              setVerificationCode(text.replace(/\D/g, '').slice(0, 6));
              setErrorMessage('');
            }}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.hiddenInput}
          />

          <Text style={styles.demoCode}>Demo code: {verification?.code ?? '------'}</Text>

          <View style={styles.resendRow}>
            <Text style={styles.helperText}>
              {resendSeconds > 0
                ? `Resend in ${String(resendSeconds).padStart(2, '0')}s`
                : 'Did not get a code?'}
            </Text>
            <Pressable onPress={handleSendCode} disabled={!canResendCode}>
              <Text style={[styles.resendLink, !canResendCode && styles.resendLinkDisabled]}>
                Resend
              </Text>
            </Pressable>
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <View style={styles.verifyFooter}>
            <Pressable
              style={[styles.primaryButton, !canVerifyCode && styles.primaryButtonDisabled]}
              onPress={handleVerifyCode}
              disabled={!canVerifyCode}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Verify Code</Text>
                  <ArrowRight width={16} height={16} color={colors.surface} />
                </>
              )}
            </Pressable>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  entryContent: {
    flex: 1,
    // justifyContent: 'flex-end',
    gap: 32,
  },
  brandBlock: {
    alignItems: 'center',
    marginTop: 80,
  },
  brandIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...shadows.card,
  },
  brandTitle: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  brandSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
    textAlign: 'center',
  },
  formCard: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    color: '#364153',
    fontWeight: '500',
    marginBottom: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  countryCodeBox: {
    width: 80,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#364153',
  },
  phoneInput: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
  },
  helperText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#6A7282',
    marginTop: 4,
  },
  securityCard: {
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.surface,
  },
  footer: {
    gap: 16,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#87A38F',
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '500',
  },
  legalText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#6A7282',
    textAlign: 'center',
    paddingHorizontal: 18,
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.danger,
  },
  verifyContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  backText: {
    color: colors.primary,
    fontSize: 16,
  },
  verifyHeader: {
    alignItems: 'center',
    gap: 8,
    marginTop: 36,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 36,
  },
  otpBox: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  otpBoxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  otpDigit: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  demoCode: {
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  resendRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resendLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: colors.textSubtle,
  },
  verifyFooter: {
    paddingBottom: 8,
  },
});
