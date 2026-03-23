import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { SyncBadge } from '../components/SyncBadge';
import { FAB } from '../components/FAB';
import { api } from '../services/api';
import { ITreeInventory, SyncStatus } from '../types';

interface TreeListScreenProps {
  onCreateTree: () => void;
  onEditTree: (tree: ITreeInventory) => void;
}

export const TreeListScreen: React.FC<TreeListScreenProps> = ({
  onCreateTree,
  onEditTree,
}) => {
  const [trees, setTrees] = useState<ITreeInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const loadTrees = useCallback(async () => {
    try {
      const params: Record<string, string> = { limit: '50' };
      if (search.trim()) params.search = search.trim();
      const response = await api.get<ITreeInventory[]>('/trees', { params });
      setTrees(response.data || []);
    } catch {
      // Offline/Error
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { loadTrees(); }, [loadTrees]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTrees();
    setRefreshing(false);
  }, [loadTrees]);

  const renderTree = ({ item }: { item: ITreeInventory }) => (
    <TouchableOpacity
      style={[styles.card, Shadows.sm]}
      onPress={() => onEditTree(item)}
      activeOpacity={0.7}
    >
      <View style={styles.treeIcon}>
        <Text style={styles.treeEmoji}>🌳</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.speciesScientific}</Text>
        <Text style={styles.meta}>DBH: {item.dbhCm}cm • H: {item.heightM}m</Text>
        <Text style={styles.meta}>Plot: {item.plotId}</Text>
      </View>
      <View style={styles.cardRight}>
        <SyncBadge status={item.syncStatus || SyncStatus.SYNCED} />
        <Text style={[styles.conditionBadge, {
          color: item.conditionStatus === 'healthy' ? Colors.success : Colors.warning
        }]}>
          {item.conditionStatus}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search species or ID…"
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={loadTrees}
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={trees}
          keyExtractor={(item) => item.treeId}
          renderItem={renderTree}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🌳</Text>
              <Text style={styles.emptyText}>No trees recorded</Text>
              <Text style={styles.emptySubtext}>Tap + to start tree inventory</Text>
            </View>
          }
        />
      )}
      <FAB onPress={onCreateTree} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchContainer: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  searchInput: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    fontSize: Typography.body.fontSize, color: Colors.textPrimary,
  },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center' },
  treeIcon: { width: 44, height: 44, borderRadius: BorderRadius.md, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  treeEmoji: { fontSize: 20 },
  info: { flex: 1 },
  name: { ...Typography.subtitle, color: Colors.textPrimary, fontStyle: 'italic' },
  meta: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: Spacing.xxs },
  cardRight: { alignItems: 'flex-end' },
  conditionBadge: { ...Typography.caption, textTransform: 'capitalize', marginTop: Spacing.xs },
  separator: { height: Spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: Spacing.xxxl },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.lg },
  emptyText: { ...Typography.h3, color: Colors.textPrimary },
  emptySubtext: { ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.xs },
});
