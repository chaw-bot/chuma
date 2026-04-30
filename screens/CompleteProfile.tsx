import React, { useMemo, useState } from 'react';
import {
  Platform,
  StatusBar as NativeStatusBar,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData } from '../context/AppDataContext';
import { RootStackParamList } from '../types/navigation';
import { colors, radii, shadows } from '../theme/colors';

type CompleteProfileNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CompleteProfile'
>;
type CompleteProfileRouteProp = RouteProp<RootStackParamList, 'CompleteProfile'>;

const providers = [
  { id: 'mtn', label: 'MTN', badge: 'MTN', fill: '#FFCB05', textColor: '#004F71' },
  { id: 'airtel', label: 'Airtel', badge: 'airtel', fill: '#FFFFFF', textColor: '#D71920' },
  { id: 'zamtel', label: 'Zamtel', badge: 'Zamtel', fill: '#39B86C', textColor: '#FFFFFF' },
] as const;

export default function CompleteProfile() {
  const navigation = useNavigation<CompleteProfileNavigationProp>();
  const route = useRoute<CompleteProfileRouteProp>();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 0 : 0
  );
  const { signInDemo } = useAppData();
  const phoneNumber = route.params?.phoneNumber ?? '';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<(typeof providers)[number]['id'] | null>(null);

  const canComplete = useMemo(
    () => fullName.trim().length > 1 && Boolean(selectedProvider),
    [fullName, selectedProvider]
  );

  const handleCompleteSetup = () => {
    if (!canComplete || !selectedProvider) {
      return;
    }

    signInDemo({
      phoneNumber,
      mode: 'demo',
      fullName: fullName.trim(),
      email: email.trim() || undefined,
      provider: selectedProvider,
    });

    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 14 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>

        <View style={styles.headerCopy}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.phoneText}>{phoneNumber}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Just a few more details to set up your savings account
          </Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor={colors.textSubtle}
            style={styles.input}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email (Optional)</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="your.email@example.com"
            placeholderTextColor={colors.textSubtle}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <Text style={styles.helperText}>Get account updates and notifications</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Mobile Money Provider</Text>
          <Text style={styles.helperText}>Select your primary mobile money account</Text>

          <View style={styles.providerRow}>
            {providers.map((provider) => {
              const selected = selectedProvider === provider.id;

              return (
                <Pressable
                  key={provider.id}
                  style={[styles.providerCard, selected && styles.providerCardSelected]}
                  onPress={() => setSelectedProvider(provider.id)}
                >
                  <View style={[styles.providerBadge, { backgroundColor: provider.fill }]}>
                    <Text style={[styles.providerBadgeText, { color: provider.textColor }]}>
                      {provider.badge}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.primaryButton, !canComplete && styles.primaryButtonDisabled]}
          onPress={handleCompleteSetup}
          disabled={!canComplete}
        >
          <Text style={styles.primaryButtonText}>Complete Setup</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  phoneText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  banner: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 24,
  },
  bannerText: {
    color: colors.surface,
    fontSize: 14,
    lineHeight: 20,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    color: '#364153',
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 49,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    color: '#6A7282',
  },
  providerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  providerCard: {
    flex: 1,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  providerCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  providerBadge: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  providerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  providerLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: '#364153',
    fontWeight: '500',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: colors.surface,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
});
