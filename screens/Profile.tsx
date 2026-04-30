import React from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Bell,
  ChevronRight,
  FileText,
  LogOut,
  Smartphone,
  User,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData } from '../context/AppDataContext';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type ProfileNav = NativeStackNavigationProp<RootStackParamList, 'Profile'>;
type OptionItem = {
  label: string;
  icon: typeof User;
  onPress: () => void;
};

export default function Profile() {
  const navigation = useNavigation<ProfileNav>();
  const insets = useSafeAreaInsets();
  const fallbackTop = Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 0 : 0;
  const topPadding = Math.max(insets.top, fallbackTop) + 24;
  const { currentUser, signOut } = useAppData();
  const displayName = currentUser?.fullName ?? 'Chawanzi Banda';
  const phoneNumber = currentUser?.phoneNumber ?? '+260 97 123 4567';
  const initial = displayName.trim().charAt(0).toUpperCase() || 'C';

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
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

  const options: OptionItem[] = [
    { label: 'Edit Profile', icon: User, onPress: () => navigation.navigate('EditProfile') },
    {
      label: 'Notification Preferences',
      icon: Bell,
      onPress: () => navigation.navigate('NotificationPreferences'),
    },
    {
      label: 'Linked Mobile Money Account',
      icon: Smartphone,
      onPress: () => navigation.navigate('LinkedMobileMoney'),
    },
    { label: 'Privacy Policy', icon: FileText, onPress: () => navigation.navigate('PrivacyPolicy') },
  ];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 104 },
        ]}
      >
        <View style={styles.profileCard}>
          <View style={styles.identityRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
            <View style={styles.identityText}>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.phone}>{phoneNumber}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.mobileMoneyRow}>
            <View style={styles.providerDot} />
            <View>
              <Text style={styles.providerName}>MTN Mobile Money</Text>
              <Text style={styles.providerStatus}>Linked Account</Text>
            </View>
          </View>
        </View>

        <View style={styles.optionsCard}>
          {options.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === options.length - 1;

            return (
              <Pressable
                key={item.label}
                style={[styles.optionRow, !isLast && styles.optionBorder]}
                onPress={item.onPress}
              >
                <View style={styles.optionIcon}>
                  <Icon size={22} color="#4A5565" strokeWidth={2} />
                </View>
                <Text style={styles.optionLabel}>{item.label}</Text>
                <ChevronRight size={20} color="#99A1AF" strokeWidth={2} />
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#C10007" strokeWidth={2.2} />
          <Text style={styles.logoutText}>Log Out</Text>
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
  content: {
    paddingHorizontal: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: '#101828',
  },
  profileCard: {
    borderRadius: 8,
    backgroundColor: '#F8FAFB',
    padding: 24,
    marginBottom: 24,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarInitial: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '700',
    color: colors.surface,
  },
  identityText: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600',
    color: '#101828',
  },
  phone: {
    marginTop: 4,
    fontSize: 16,
    lineHeight: 24,
    color: '#4A5565',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 24,
  },
  mobileMoneyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FCD34D',
    marginRight: 16,
  },
  providerName: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: '#101828',
  },
  providerStatus: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    color: '#6A7282',
  },
  optionsCard: {
    borderRadius: 8,
    backgroundColor: '#F8FAFB',
    overflow: 'hidden',
    marginBottom: 24,
  },
  optionRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  optionIcon: {
    width: 32,
    alignItems: 'flex-start',
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#101828',
  },
  logoutButton: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFC9C9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: '#C10007',
  },
});
