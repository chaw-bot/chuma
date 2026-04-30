import React from 'react';
import {
  Platform,
  StatusBar as NativeStatusBar,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Shield, Clock, TrendingUp, Info } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types/navigation';
import { colors, radii, shadows } from '../theme/colors';

type InvestmentNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'InvestmentInsights'
>;

export default function InvestmentInsights() {
  const navigation = useNavigation<InvestmentNavigationProp>();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 0 : 0
  );

  const investments = [
    {
      id: 1,
      name: 'Treasury Bills',
      risk: 'Very Low',
      returns: '12-15% per year',
      minAmount: 500,
      description: 'Safe government bonds with steady returns.',
      icon: Shield,
    },
    {
      id: 2,
      name: 'Fixed Deposit',
      risk: 'Low',
      returns: '10-12% per year',
      minAmount: 200,
      description: 'Lock your money for a period and earn guaranteed interest.',
      icon: Clock,
    },
    {
      id: 3,
      name: 'Money Market Fund',
      risk: 'Low',
      returns: '8-10% per year',
      minAmount: 100,
      description: 'A more flexible option with easier access to cash.',
      icon: TrendingUp,
    },
  ];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: topInset + 14 }]}>
        <Pressable onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <View>
          <Text style={styles.title}>Investment Options</Text>
          <Text style={styles.subtitle}>Low-noise suggestions to help savings grow.</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + 120 },
        ]}
      >
        <View style={styles.infoBanner}>
          <Info width={18} height={18} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.infoTitle}>New to investing?</Text>
            <Text style={styles.infoText}>
              Start with lower-risk products and add complexity only when you need it.
            </Text>
          </View>
        </View>

        {investments.map((inv) => {
          const Icon = inv.icon;
          return (
            <View key={inv.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconWrapper}>
                  <Icon width={20} height={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{inv.name}</Text>
                  <Text style={styles.cardDesc}>{inv.description}</Text>
                </View>
              </View>

              <View style={styles.cardStats}>
                <StatRow label="Risk Level" value={inv.risk} />
                <StatRow label="Expected Returns" value={inv.returns} />
                <StatRow label="Minimum Amount" value={`K ${inv.minAmount}`} />
              </View>

              <Pressable style={styles.learnMoreButton}>
                <Text style={styles.learnMoreText}>Learn More</Text>
              </Pressable>
            </View>
          );
        })}

        <View style={styles.comparisonCard}>
          <Text style={styles.comparisonTitle}>Simple comparison</Text>
          <View style={styles.comparisonBox}>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Regular savings account</Text>
              <Text style={styles.comparisonValue}>K 100 → K 103</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Treasury bill</Text>
              <Text style={styles.comparisonValue}>K 100 → K 115</Text>
            </View>
          </View>
          <Text style={styles.comparisonNote}>After 1 year, the difference becomes easier to feel.</Text>
        </View>

        <Pressable
          style={styles.ctaButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.ctaText}>Talk to an Advisor</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 24,
  },
  backText: {
    color: colors.primary,
    fontSize: 16,
    marginBottom: 16,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
  },
  infoBanner: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 16,
    marginBottom: 18,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 3,
  },
  infoText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  cardStats: {
    marginBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  learnMoreButton: {
    backgroundColor: colors.primarySoft,
    paddingVertical: 12,
    borderRadius: radii.sm,
    alignItems: 'center',
    marginTop: 6,
  },
  learnMoreText: {
    color: colors.primary,
    fontWeight: '600',
  },
  comparisonCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  comparisonBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    padding: 12,
    marginBottom: 8,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  comparisonLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  comparisonValue: {
    color: colors.text,
    fontWeight: '600',
  },
  comparisonNote: {
    color: colors.textMuted,
    fontSize: 12,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radii.md,
    alignItems: 'center',
    marginBottom: 16,
  },
  ctaText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});
