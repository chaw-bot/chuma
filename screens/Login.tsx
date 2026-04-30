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
import { ArrowRight, KeyRound, Phone } from 'lucide-react-native';
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
  const { signInDemo } = useAppData();
  const codeInputRef = useRef<RNTextInput>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verification, setVerification] = useState<{ phone: string; code: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);
  const normalizedPhone = useMemo(() => normalizeZmPhone(phoneNumber), [phoneNumber]);
  const e164Phone = normalizedPhone ? `+${normalizedPhone}` : '';
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

  const handleResendCode = async () => {
    if (!canResendCode) {
      return;
    }
    await handleSendCode();
  };

  const handleVerifyCode = async () => {
    if (!canVerifyCode || !verification) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (verificationCode.trim().length < 6) {
        setErrorMessage('Enter a valid 6-digit code.');
        return;
      }

      if (verificationCode.trim() !== verification.code) {
        setErrorMessage('Incorrect code. Use the demo code shown below.');
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 400));
      signInDemo(verification.phone);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : 'Invalid code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable onPress={() => navigation.navigate('Onboarding')}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>
          {isCodeSent
            ? `Demo mode: enter the 6-digit code for ${verification?.phone ?? e164Phone}`
            : 'A minimal demo sign-in flow using your phone number.'}
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>

          <View style={styles.inputWrapper}>
            <View style={styles.prefix}>
              <Phone width={18} height={18} color={colors.textMuted} />
            </View>

            <TextInput
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(text.replace(/[^\d+\s-]/g, ''))}
              placeholder="+260 97 123 4567"
              placeholderTextColor={colors.textSubtle}
              keyboardType="phone-pad"
              autoCorrect={false}
              maxLength={16}
              editable={!isCodeSent}
              style={styles.input}
            />
          </View>

          {phoneNumber.length > 0 && !normalizeZmPhone(phoneNumber) ? (
            <Text style={styles.helperText}>Use a valid Zambian number, for example 0971234567.</Text>
          ) : null}

          {isCodeSent ? <Text style={styles.label}>Verification Code</Text> : null}

          {isCodeSent ? (
            <View style={styles.codeSection}>
              <Pressable
                style={styles.otpRow}
                onPress={() => codeInputRef.current?.focus()}
              >
                <View style={styles.codeIcon}>
                  <KeyRound width={18} height={18} color={colors.textMuted} />
                </View>
                {Array.from({ length: 6 }).map((_, index) => {
                  const digit = verificationCode[index] ?? '';
                  const isActive = index === verificationCode.length && verificationCode.length < 6;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.otpBox,
                        isActive && styles.otpBoxActive,
                      ]}
                    >
                      <Text style={styles.otpDigit}>{digit}</Text>
                    </View>
                  );
                })}
              </Pressable>

              <RNTextInput
                ref={codeInputRef}
                value={verificationCode}
                onChangeText={(text) => setVerificationCode(text.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                style={styles.hiddenInput}
              />

              <View style={styles.resendRow}>
                <Text style={styles.resendTimer}>
                  {resendSeconds > 0
                    ? `Resend in ${String(resendSeconds).padStart(2, '0')}s`
                    : 'Did not get a code?'}
                </Text>
                <Pressable onPress={handleResendCode} disabled={!canResendCode}>
                  <Text style={[styles.resendLink, !canResendCode && styles.resendLinkDisabled]}>
                    Resend
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.demoCode}>
                Demo code: {verification?.code ?? '------'}
              </Text>
            </View>
          ) : null}

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>

        <View style={{ flex: 1 }} />

        <Pressable
          style={[
            styles.button,
            (!isCodeSent && !canSendCode) || (isCodeSent && !canVerifyCode)
              ? styles.buttonDisabled
              : null,
          ]}
          onPress={isCodeSent ? handleVerifyCode : handleSendCode}
          disabled={isCodeSent ? !canVerifyCode : !canSendCode}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <>
              <Text style={styles.buttonText}>
                {isCodeSent ? 'Verify Code' : 'Send Code'}
              </Text>
              <ArrowRight width={18} height={18} color={colors.surface} />
            </>
          )}
        </Pressable>

        {isCodeSent ? (
          <Pressable
            onPress={() => {
              setVerification(null);
              setVerificationCode('');
              setErrorMessage('');
              setResendSeconds(0);
            }}
          >
            <Text style={styles.linkText}>Use a different phone number</Text>
          </Pressable>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    backgroundColor: colors.background,
  },
  backText: {
    color: colors.primary,
    fontSize: 16,
    marginBottom: 28,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 10,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  prefix: {
    position: 'absolute',
    left: 16,
    alignItems: 'center',
    zIndex: 1,
  },
  input: {
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 16,
    color: colors.text,
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },
  codeSection: {
    marginTop: 6,
  },
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBox: {
    flex: 1,
    minWidth: 42,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  otpDigit: {
    fontSize: 20,
    color: colors.text,
    fontWeight: '600',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  resendRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resendTimer: {
    color: colors.textMuted,
    fontSize: 12,
  },
  resendLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: colors.textSubtle,
  },
  demoCode: {
    marginTop: 12,
    padding: 12,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    color: colors.primary,
    fontWeight: '600',
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 8,
  },
  button: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...shadows.card,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    marginTop: 16,
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '600',
  },
});
