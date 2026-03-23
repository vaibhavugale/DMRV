import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { SyncBadge } from '../components/SyncBadge';
import { FAB } from '../components/FAB';
import { api } from '../services/api';
import { IFarmer, SyncStatus } from '../types';

interface FarmerListScreenProps {
  onCreateFarmer: () => void;
  onSelectFarmer: (farmer: IFarmer) => void;
}

export const FarmerListScreen: React.FC<FarmerListScreenProps> = ({
  onCreateFarmer,
  onSelectFarmer,
}) => {
  const [farmers, setFarmers] = useState<IFarmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const loadFarmers = useCallback(async () => {
    try {
      const params: Record<string, string> = { limit: '50' };
      if (search.trim()) params.search = search.trim();
      const response = await api.get<IFarmer[]>('/farmers', { params });
      setFarmers(response.data || []);
    } catch {
      // May be offline
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadFarmers();
  }, [loadFarmers]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFarmers();
    setRefreshing(false);
  }, [loadFarmers]);

  const renderFarmer = ({ item }: { item: IFarmer }) => (
    <TouchableOpacity
      style={[styles.card, Shadows.sm]}
      onPress={() => onSelectFarmer(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(item.firstName?.[0] || '') + (item.lastName?.[0] || '')}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.meta}>ID: {item.farmerId}</Text>
        {item.contact?.phone && (
          <Text style={styles.meta}>📞 {item.contact.phone}</Text>
        )}
      </View>
      <View style={styles.cardRight}>
        <SyncBadge status={item.syncStatus || SyncStatus.SYNCED} />
        <Text style={styles.statusBadge}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search farmers…"
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={loadFarmers}
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={farmers}
          keyExtractor={(item) => item.farmerId}
          renderItem={renderFarmer}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>👨‍🌾</Text>
              <Text style={styles.emptyText}>No farmers registered yet</Text>
              <Text style={styles.emptySubtext}>Tap + to register a new farmer</Text>
            </View>
          }
        />
      )}

      <FAB onPress={onCreateFarmer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchContainer: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  searchInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.body.fontSize,
    color: Colors.textPrimary,
  },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    ...Typography.subtitle,
    color: Colors.primary,
  },
  info: { flex: 1 },
  name: { ...Typography.subtitle, color: Colors.textPrimary },
  meta: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: Spacing.xxs },
  cardRight: { alignItems: 'flex-end' },
  statusBadge: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textTransform: 'capitalize',
    marginTop: Spacing.xs,
  },
  separator: { height: Spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: Spacing.xxxl },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.lg },
  emptyText: { ...Typography.h3, color: Colors.textPrimary },
  emptySubtext: { ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.xs },
});
