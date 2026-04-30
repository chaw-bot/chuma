import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import {
  User,
  Phone,
  Lock,
  Bell,
  HelpCircle,
  Shield,
  LogOut,
  ChevronRight,
  Edit,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppData } from '../context/AppDataContext';
import { RootStackParamList } from '../types/navigation';
import { BottomNav } from '../components/BottomVav';
import { colors, radii, shadows } from '../theme/colors';

type ProfileNav = NativeStackNavigationProp<RootStackParamList, 'Profile'>;
type OptionItem = {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  onPress: () => void;
};

export default function Profile() {
  const navigation = useNavigation<ProfileNav>();
  const { currentUser, goals, signOut } = useAppData();

  const handleLogout = async () => {
    Alert.alert('Signed out', 'Your demo session has ended.', [
      {
        text: 'OK',
        onPress: () => {
          signOut();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Onboarding' }],
          });
        },
      },
    ]);
  };

  const profileCard = {
    name: currentUser?.fullName ?? 'Chuma User',
    phone: currentUser?.phoneNumber ?? 'No phone linked',
    memberSince: 'Jan 2026',
    activeGoals: `${goals.length} ${goals.length === 1 ? 'Goal' : 'Goals'}`,
  };

  const accountOptions: OptionItem[] = [
    { label: 'Phone Number', value: profileCard.phone, icon: Phone, onPress: () => {} },
    { label: 'Security PIN', value: 'Change your PIN', icon: Lock, onPress: () => {} },
  ];

  const preferencesOptions: OptionItem[] = [
    { label: 'Notifications', value: 'Manage reminders and alerts', icon: Bell, onPress: () => navigation.navigate('Notifications') },
    { label: 'Privacy & Data', value: 'Control your information', icon: Shield, onPress: () => {} },
  ];

  const supportOptions: OptionItem[] = [
    { label: 'Help & FAQs', value: 'Get answers to common questions', icon: HelpCircle, onPress: () => {} },
    { label: 'Contact Support', value: 'Chat or call us', icon: Phone, onPress: () => {} },
  ];

  const renderOption = (option: OptionItem, last = false) => (
    <Pressable
      key={option.label}
      onPress={option.onPress}
      style={[
        styles.optionRow,
        !last && styles.optionRowBorder,
      ]}
    >
      <View style={styles.optionIcon}>
        <option.icon size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.optionLabel}>{option.label}</Text>
        <Text style={styles.optionValue}>{option.value}</Text>
      </View>
      <ChevronRight width={18} height={18} color={colors.textSubtle} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Pressable onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Profile & Settings</Text>
        <Text style={styles.subtitle}>Manage your account with less clutter.</Text>

        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <User width={28} height={28} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{profileCard.name}</Text>
              <Text style={styles.profilePhone}>{profileCard.phone}</Text>
            </View>
            <Pressable style={styles.editBtn}>
              <Edit width={18} height={18} color={colors.primary} />
            </Pressable>
          </View>
          <View style={styles.profileStats}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Member Since</Text>
              <Text style={styles.statValue}>{profileCard.memberSince}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Active Goals</Text>
              <Text style={styles.statValue}>{profileCard.activeGoals}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.optionCard}>
          {accountOptions.map((opt, idx) =>
            renderOption(opt, idx === accountOptions.length - 1)
          )}
        </View>

        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <View style={styles.optionCard}>
          {preferencesOptions.map((opt, idx) =>
            renderOption(opt, idx === preferencesOptions.length - 1)
          )}
        </View>

        <Text style={styles.sectionTitle}>SUPPORT</Text>
        <View style={styles.optionCard}>
          {supportOptions.map((opt, idx) =>
            renderOption(opt, idx === supportOptions.length - 1)
          )}
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Chuma Version 1.0.0</Text>
          <Text style={styles.appInfoSubText}>© 2026 Chuma. All rights reserved.</Text>
        </View>

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut width={18} height={18} color={colors.surface} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContainer: { padding: 24, paddingBottom: 120 },
  backText: { color: colors.primary, marginBottom: 16, marginTop: 10, fontSize: 16 },
  title: { fontSize: 30, fontWeight: '700', color: colors.text, letterSpacing: -0.8 },
  subtitle: { fontSize: 15, color: colors.textMuted, marginBottom: 24, marginTop: 4 },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  profileTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileName: { fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 2 },
  profilePhone: { fontSize: 14, color: colors.textMuted },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
  },
  stat: { flex: 1 },
  statLabel: { fontSize: 12, color: colors.textSubtle },
  statValue: { fontSize: 16, color: colors.text, fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: 12, color: colors.textSubtle, marginBottom: 8, marginTop: 16, letterSpacing: 1 },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  optionRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.surfaceMuted },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLabel: { fontSize: 14, color: colors.text, marginBottom: 2, fontWeight: '500' },
  optionValue: { fontSize: 12, color: colors.textMuted },
  appInfo: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  appInfoText: { fontSize: 14, color: colors.textMuted, marginBottom: 4 },
  appInfoSubText: { fontSize: 12, color: colors.textSubtle },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  logoutText: { color: colors.surface, fontSize: 16, fontWeight: '600' },
});
