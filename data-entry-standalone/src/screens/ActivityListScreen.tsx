import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { SyncBadge } from '../components/SyncBadge';
import { FAB } from '../components/FAB';
import { api } from '../services/api';
import { IActivity, SyncStatus } from '../types';

interface ActivityListScreenProps {
  onCreateActivity: () => void;
  onEditActivity: (activity: IActivity) => void;
}

export const ActivityListScreen: React.FC<ActivityListScreenProps> = ({
  onCreateActivity,
  onEditActivity,
}) => {
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadActivities = useCallback(async () => {
    try {
      const response = await api.get<IActivity[]>('/activities', { params: { limit: '50' } });
      setActivities(response.data || []);
    } catch {
      // Offline/Error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadActivities(); }, [loadActivities]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  }, [loadActivities]);

  const renderActivity = ({ item }: { item: IActivity }) => {
    const date = new Date(item.timestamp).toLocaleDateString();
    return (
      <TouchableOpacity
        style={[styles.card, Shadows.sm]}
        onPress={() => onEditActivity(item)}
        activeOpacity={0.7}
      >
        <View style={styles.activityIcon}>
          <Text style={styles.activityEmoji}>📋</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.type}>{item.type.replace(/_/g, ' ')}</Text>
          <Text style={styles.meta} numberOfLines={1}>{item.description}</Text>
          <Text style={styles.meta}>{date} • Plot: {item.plotId}</Text>
        </View>
        <View style={styles.cardRight}>
          <SyncBadge status={item.syncStatus || SyncStatus.SYNCED} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.activityId}
          renderItem={renderActivity}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No activities logged</Text>
              <Text style={styles.emptySubtext}>Tap + to log an activity</Text>
            </View>
          }
        />
      )}
      <FAB onPress={onCreateActivity} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: 100 },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center' },
  activityIcon: { width: 44, height: 44, borderRadius: BorderRadius.md, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  activityEmoji: { fontSize: 20 },
  info: { flex: 1 },
  type: { ...Typography.subtitle, color: Colors.textPrimary, textTransform: 'capitalize' },
  meta: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: Spacing.xxs },
  cardRight: { alignItems: 'flex-end' },
  separator: { height: Spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: Spacing.xxxl },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.lg },
  emptyText: { ...Typography.h3, color: Colors.textPrimary },
  emptySubtext: { ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.xs },
});
