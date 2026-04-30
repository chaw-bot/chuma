import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Coins, Target, TrendingUp, ArrowRight } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { colors, radii, shadows } from '../theme/colors';

type OnboardingNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

export default function Onboarding() {
  const navigation = useNavigation<OnboardingNavigationProp>();

  return (
    <LinearGradient
      colors={['#F7F8F4', '#EEF2EC']}
      style={styles.container}
    >
      <View style={styles.logoWrapper}>
        <View style={styles.logoCircle}>
          <Coins size={34} color={colors.primary} />
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Chuma</Text>
        <Text style={styles.subtitle}>
          A calmer way to save, plan, and track money without noise.
        </Text>
      </View>

      <View style={styles.features}>
        <FeatureCard
          icon={<Target size={22} color="#FFFFFF" />}
          
          title="Set Your Goals"
          description="Save for school fees, emergencies, or business growth"
        />
        <FeatureCard
          icon={<Coins size={22} color="#FFFFFF" />}
          title="Auto-Save Daily"
          description="Small amounts add up. Save as little as K5 per day"
        />
        <FeatureCard
          icon={<TrendingUp size={22} color="#FFFFFF" />}
          title="Watch It Grow"
          description="Track your progress and celebrate your wins"
        />
      </View>

      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
        <ArrowRight size={20} color={colors.surface} />
      </Pressable>
    </LinearGradient>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.iconBox}>{icon}</View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 40,
  },
  logoWrapper: {
    marginBottom: 28,
  },
  logoCircle: {
    width: 72,
    height: 72,
    backgroundColor: colors.surface,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 34,
    color: colors.text,
    fontWeight: '700',
    letterSpacing: -1,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 24,
    maxWidth: 320,
  },
  features: {
    flex: 1,
    gap: 14,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 14,
  },
  iconBox: {
    width: 45,
    height: 45,
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardDescription: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: '600',
  },
});
