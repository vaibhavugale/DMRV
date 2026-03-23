import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { SummaryCard } from '../components/SummaryCard';
import { SyncBadge } from '../components/SyncBadge';
import { api } from '../services/api';
import { flushSyncQueue, getPendingCount } from '../services/sync';
import { clearAuth, clearAllData } from '../services/storage';
import { SyncStatus } from '../types';

interface DashboardScreenProps {
  onLogout: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onLogout }) => {
  const [stats, setStats] = useState({ farmers: 0, plots: 0, trees: 0, activities: 0 });
  const [pendingSync, setPendingSync] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [farmersRes, plotsRes, treesRes, activitiesRes] = await Promise.allSettled([
        api.get('/farmers', { params: { limit: '1' } }),
        api.get('/plots', { params: { limit: '1' } }),
        api.get('/trees', { params: { limit: '1' } }),
        api.get('/activities', { params: { limit: '1' } }),
      ]);

      setStats({
        farmers: farmersRes.status === 'fulfilled' ? farmersRes.value.pagination?.total || 0 : 0,
        plots: plotsRes.status === 'fulfilled' ? plotsRes.value.pagination?.total || 0 : 0,
        trees: treesRes.status === 'fulfilled' ? treesRes.value.pagination?.total || 0 : 0,
        activities: activitiesRes.status === 'fulfilled' ? activitiesRes.value.pagination?.total || 0 : 0,
      });
    } catch {
      // Silently fail — we may be offline
    }

    const pending = await getPendingCount();
    setPendingSync(pending);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await flushSyncQueue();
      if (result.total === 0) {
        Alert.alert('Sync', 'No items in the sync queue.');
      } else {
        Alert.alert(
          'Sync Complete',
          `Synced: ${result.synced}\nConflicts: ${result.conflicts}\nFailed: ${result.failed}`
        );
      }
      await loadData();
    } catch (error: any) {
      Alert.alert('Sync Error', error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await clearAuth();
          onLogout();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Field Dashboard</Text>
          <Text style={styles.headerSubtitle}>Agroforestry DMRV</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Sync Status Banner */}
      <View style={[styles.syncBanner, Shadows.sm]}>
        <View style={styles.syncInfo}>
          <Text style={styles.syncTitle}>Sync Status</Text>
          <SyncBadge status={pendingSync > 0 ? SyncStatus.PENDING : SyncStatus.SYNCED} />
        </View>
        <Text style={styles.syncCount}>
          {pendingSync > 0
            ? `${pendingSync} item${pendingSync !== 1 ? 's' : ''} pending`
            : 'All data synced'}
        </Text>
        <TouchableOpacity
          style={[styles.syncButton, syncing && styles.syncButtonDisabled]}
          onPress={handleSync}
          disabled={syncing}
          activeOpacity={0.8}
        >
          <Text style={styles.syncButtonText}>
            {syncing ? 'Syncing…' : 'Sync Now'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <Text style={styles.sectionTitle}>Project Overview</Text>
      <View style={styles.statsRow}>
        <SummaryCard icon="👨‍🌾" count={stats.farmers} label="Farmers" accentColor={Colors.primary} />
        <SummaryCard icon="🗺️" count={stats.plots} label="Plots" accentColor={Colors.info} />
      </View>
      <View style={styles.statsRow}>
        <SummaryCard icon="🌳" count={stats.trees} label="Trees" accentColor={Colors.success} />
        <SummaryCard icon="📋" count={stats.activities} label="Activities" accentColor={Colors.accent} />
      </View>

      {/* Quick Tips */}
      <View style={[styles.tipCard, Shadows.sm]}>
        <Text style={styles.tipTitle}>💡 Field Tips</Text>
        <Text style={styles.tipText}>
          • Collect data offline — it will auto-sync when you're back online.{'\n'}
          • Always capture FPIC consent before registering farmers.{'\n'}
          • Measure tree DBH at 1.3m height for accurate carbon estimates.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: Spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxxl + Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  greeting: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
  logoutBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  logoutText: {
    ...Typography.bodySmall,
    color: Colors.error,
    fontWeight: '600',
  },
  syncBanner: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  syncInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  syncTitle: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
  },
  syncCount: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  syncButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncButtonText: {
    ...Typography.button,
    color: Colors.textOnPrimary,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl - Spacing.xs,
    marginBottom: Spacing.sm,
  },
  tipCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  tipTitle: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  tipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
