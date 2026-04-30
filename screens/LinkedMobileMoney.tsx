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
}> = [
  {
    id: 'mtn',
    name: 'MTN Mobile Money',
    description: 'Primary deductions and savings account',
    dotColor: '#FCD34D',
  },
  {
    id: 'airtel',
    name: 'Airtel Money',
    description: 'Link your Airtel mobile money wallet',
    dotColor: '#EF4444',
  },
  {
    id: 'zamtel',
    name: 'Zamtel Kwacha',
    description: 'Use Zamtel for deductions and deposits',
    dotColor: '#22C55E',
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
  >(currentUser?.provider ?? 'mtn');

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
          Choose the mobile money account Chuma should use for deductions.
        </Text>

        <View style={styles.card}>
          {providers.map((provider, index) => {
            const selected = selectedProvider === provider.id;
            const isLast = index === providers.length - 1;

            return (
              <Pressable
                key={provider.id}
                style={[styles.providerRow, !isLast && styles.providerBorder]}
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
    justifyContent: 'space-between',
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
