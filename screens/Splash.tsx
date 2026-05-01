import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Coins, Leaf } from 'lucide-react-native';
import { useAppData } from '../context/AppDataContext';
import { RootStackParamList } from '../types/navigation';
import { colors, radii, shadows } from '../theme/colors';

type SplashNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Splash'
>;

export default function Splash() {
  const navigation = useNavigation<SplashNavigationProp>();
  const { currentUser, isAuthReady } = useAppData();
  const [timerDone, setTimerDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTimerDone(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!timerDone || !isAuthReady) return;
    navigation.replace(currentUser ? 'Dashboard' : 'Onboarding');
  }, [timerDone, isAuthReady, currentUser, navigation]);

  return (
    <LinearGradient
      colors={[colors.background, colors.primarySoft, colors.surface]}
      style={styles.container}
    >
      <View style={styles.brandWrap}>
        <View style={styles.iconOuter}>
          <View style={styles.iconInner}>
            <Coins size={48} color={colors.surface} strokeWidth={2.2} />
            <View style={styles.leafBadge}>
              <Leaf size={18} color={colors.primary} strokeWidth={2.4} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Chuma</Text>
        <Text style={styles.subtitle}>Save small. Grow steady.</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  brandWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOuter: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
    ...shadows.card,
  },
  iconInner: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leafBadge: {
    position: 'absolute',
    right: 5,
    bottom: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primarySoft,
    borderWidth: 3,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  progressTrack: {
    width: 96,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    width: 54,
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
});
