import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Coins, Target, Smartphone } from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { colors, radii, shadows } from '../theme/colors';

type OnboardingNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

const onboardingSlides = [
  {
    id: 'intro',
    title: 'Chuma',
    accent: 'Save small. Grow steady.',
    description: 'Start your journey to financial freedom with automated micro-savings',
    buttonLabel: 'Next',
    icon: Coins,
    iconSize: 58,
    titleWidth: 220,
  },
  {
    id: 'goals',
    title: 'Set your\nsavings goal',
    accent: 'Dream big, save smart',
    description: 'Create personalized savings goals and track your progress every step of the way',
    buttonLabel: 'Next',
    icon: Target,
    iconSize: 56,
    titleWidth: 260,
  },
  {
    id: 'deductions',
    title: 'Automated\ndeductions',
    accent: 'Save without thinking',
    description: 'Automatic deductions from MTN Mobile Money',
    buttonLabel: 'Get Started',
    icon: Smartphone,
    iconSize: 56,
    titleWidth: 280,
  },
] as const;

export default function Onboarding() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);

  const slide = onboardingSlides[currentIndex];
  const isLastSlide = currentIndex === onboardingSlides.length - 1;
  const SlideIcon = slide.icon;

  const nextAction = useMemo(() => {
    if (isLastSlide) {
      return () => navigation.navigate('Login');
    }

    return () => setCurrentIndex((index) => Math.min(index + 1, onboardingSlides.length - 1));
  }, [isLastSlide, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View />
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.illustrationWrap}>
          <View style={styles.illustrationCircle}>
            <SlideIcon
              size={slide.iconSize}
              color={colors.surface}
              strokeWidth={2.2}
            />
          </View>
        </View>

        <View style={styles.copyBlock}>
          <Text style={[styles.title, { maxWidth: slide.titleWidth }]}>{slide.title}</Text>
          <Text style={styles.accent}>{slide.accent}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {onboardingSlides.map((item, index) => {
            const active = index === currentIndex;
            return (
              <View
                key={item.id}
                style={[
                  styles.dot,
                  active ? styles.dotActive : styles.dotInactive,
                ]}
              />
            );
          })}
        </View>

        <Pressable style={styles.button} onPress={nextAction}>
          <Text style={styles.buttonText}>{slide.buttonLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 20,
  },
  skipText: {
    color: colors.textSubtle,
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 44,
  },
  illustrationWrap: {
    marginBottom: 34,
  },
  illustrationCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  copyBlock: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: 12,
  },
  accent: {
    fontSize: 18,
    lineHeight: 28,
    color: colors.success,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 320,
  },
  footer: {
    gap: 24,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: radii.pill,
  },
  dotActive: {
    width: 32,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#D1D5DC',
  },
  button: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});
