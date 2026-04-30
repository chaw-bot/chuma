import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ArrowLeft, ExternalLink } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type PrivacyPolicyNav = NativeStackNavigationProp<RootStackParamList, 'PrivacyPolicy'>;

const sections = [
  {
    title: 'Information We Use',
    body: 'Chuma uses your profile details, mobile money provider, savings goals, deductions, and expense entries to show your account experience in the app.',
  },
  {
    title: 'How We Use It',
    body: 'Your information helps us display balances, reminders, automatic deductions, spending summaries, and account settings clearly.',
  },
  {
    title: 'Mobile Money',
    body: 'Linked mobile money details are used to identify the provider selected for savings deductions and account setup.',
  },
  {
    title: 'Your Choices',
    body: 'You can update your profile, change your linked mobile money provider, and adjust notification preferences from Profile settings.',
  },
];

export default function PrivacyPolicy() {
  const navigation = useNavigation<PrivacyPolicyNav>();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 0 : 0
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#101828" />
        </Pressable>
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
      >
        <View style={styles.notice}>
          <Text style={styles.noticeText}>Last updated: April 30, 2026</Text>
        </View>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <Pressable style={styles.linkRow}>
          <Text style={styles.linkText}>View full policy online</Text>
          <ExternalLink size={18} color={colors.primary} />
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
  notice: {
    borderRadius: 8,
    backgroundColor: '#F8FAFB',
    padding: 16,
    marginBottom: 24,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4A5565',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '600',
    color: '#101828',
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4A5565',
  },
  linkRow: {
    minHeight: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  linkText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.primary,
  },
});
