import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

interface SummaryCardProps {
  icon: string;
  count: number;
  label: string;
  accentColor?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  count,
  label,
  accentColor = Colors.primary,
}) => {
  return (
    <View style={[styles.card, Shadows.sm]}>
      <View style={[styles.iconContainer, { backgroundColor: accentColor + '15' }]}>
        <Text style={[styles.icon, { color: accentColor }]}>{icon}</Text>
      </View>
      <Text style={styles.count}>{count}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  count: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: Spacing.xxs,
  },
});
