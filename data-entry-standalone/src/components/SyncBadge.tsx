import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { SyncStatus } from '../types';

interface SyncBadgeProps {
  status: SyncStatus | string;
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  [SyncStatus.PENDING]: { color: Colors.syncPending, label: 'Pending' },
  [SyncStatus.SYNCED]: { color: Colors.syncSynced, label: 'Synced' },
  [SyncStatus.CONFLICT]: { color: Colors.syncConflict, label: 'Conflict' },
  [SyncStatus.FAILED]: { color: Colors.syncFailed, label: 'Failed' },
};

export const SyncBadge: React.FC<SyncBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status] || { color: Colors.textTertiary, label: status };

  return (
    <View style={[styles.badge, { backgroundColor: config.color + '18' }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xxs + 1,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs + 1,
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
