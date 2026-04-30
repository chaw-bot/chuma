import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SessionUser, useAppData } from '../context/AppDataContext';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type LinkedMobileMoneyNav = NativeStackNavigationProp<
  RootStackParamList,
  'LinkedMobileMoney'
>;

const providers: Array<{
  id: NonNullable<SessionUser['provider']>;
  name: string;
  description: string;
  dotColor: string;
  enabled: boolean;
}> = [
  {
    id: 'mtn',
    name: 'MTN Mobile Money',
    description: 'Primary deductions and savings account',
    dotColor: '#FCD34D',
    enabled: true,
  },
  {
    id: 'airtel',
    name: 'Airtel Money',
    description: 'Coming soon',
    dotColor: '#EF4444',
    enabled: false,
  },
  {
    id: 'zamtel',
    name: 'Zamtel Kwacha',
    description: 'Coming soon',
    dotColor: '#22C55E',
    enabled: false,
  },
];

export default function LinkedMobileMoney() {
  const navigation = useNavigation<LinkedMobileMoneyNav>();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 0 : 0
  );
  const { currentUser, updateCurrentUser } = useAppData();
  const [selectedProvider, setSelectedProvider] = useState<
    NonNullable<SessionUser['provider']>
  >(currentUser?.provider === 'mtn' ? currentUser.provider : 'mtn');

  const handleSave = () => {
    updateCurrentUser({ provider: selectedProvider });
    navigation.goBack();
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#101828" />
        </Pressable>
        <Text style={styles.title}>Linked Mobile Money</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
      >
        <Text style={styles.helper}>
          MTN Mobile Money is the only supported provider for now.
        </Text>

        <View style={styles.card}>
          {providers.map((provider, index) => {
            const selected = selectedProvider === provider.id;
            const isLast = index === providers.length - 1;

            return (
              <Pressable
                key={provider.id}
                disabled={!provider.enabled}
                style={[
                  styles.providerRow,
                  !isLast && styles.providerBorder,
                  !provider.enabled && styles.providerRowDisabled,
                ]}
                onPress={() => setSelectedProvider(provider.id)}
              >
                <View style={[styles.providerDot, { backgroundColor: provider.dotColor }]} />
                <View style={styles.providerCopy}>
                  <Text style={styles.providerName}>{provider.name}</Text>
                  <Text style={styles.providerDescription}>{provider.description}</Text>
                </View>
                {selected ? (
                  <View style={styles.checkCircle}>
                    <Check size={16} color={colors.surface} strokeWidth={2.4} />
                  </View>
                ) : !provider.enabled ? (
                  <Text style={styles.unavailableText}>Soon</Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Account</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: colors.surface,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '600',
    color: '#101828',
  },
  content: {
    paddingHorizontal: 24,
  },
  helper: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4A5565',
    marginBottom: 20,
  },
  card: {
    borderRadius: 8,
    backgroundColor: '#F8FAFB',
    overflow: 'hidden',
    marginBottom: 24,
  },
  providerRow: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  providerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  providerRowDisabled: {
    opacity: 0.45,
  },
  providerDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  providerCopy: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: '#101828',
  },
  providerDescription: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: '#6A7282',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginLeft: 12,
  },
  unavailableText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#4A5565',
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 12,
  },
  saveButton: {
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.surface,
  },
});
