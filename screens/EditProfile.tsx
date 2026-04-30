import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData } from '../context/AppDataContext';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type EditProfileNav = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

export default function EditProfile() {
  const navigation = useNavigation<EditProfileNav>();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 0 : 0
  );
  const { currentUser, updateCurrentUser } = useAppData();
  const [fullName, setFullName] = useState(currentUser?.fullName ?? 'Chawanzi Banda');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState(
    currentUser?.phoneNumber ?? '+260 97 123 4567'
  );

  const canSave = fullName.trim().length > 1 && phoneNumber.trim().length > 6;

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    updateCurrentUser({
      fullName: fullName.trim(),
      email: email.trim() || undefined,
      phoneNumber: phoneNumber.trim(),
    });
    navigation.goBack();
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#101828" />
        </Pressable>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
      >
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
          placeholderTextColor="#99A1AF"
          style={styles.input}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          placeholder="+260 97 123 4567"
          placeholderTextColor="#99A1AF"
          style={styles.input}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="you@example.com"
          placeholderTextColor="#99A1AF"
          style={styles.input}
        />

        <Pressable
          disabled={!canSave}
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
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
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '600',
    color: '#101828',
  },
  content: {
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: '#101828',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DC',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#101828',
    marginBottom: 20,
  },
  saveButton: {
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.surface,
  },
});
