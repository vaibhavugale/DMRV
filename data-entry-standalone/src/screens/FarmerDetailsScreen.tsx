import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { IFarmer, IFarmPlot, SyncStatus } from '../types';
import { api } from '../services/api';
import { SyncBadge } from '../components/SyncBadge';

interface FarmerDetailsScreenProps {
  farmer: IFarmer;
  onBack: () => void;
  onEditFarmer: (farmer: IFarmer) => void;
  onCreatePlot: (farmerId: string) => void;
  onEditPlot: (plot: IFarmPlot, farmerId: string) => void;
}

export const FarmerDetailsScreen: React.FC<FarmerDetailsScreenProps> = ({
  farmer,
  onBack,
  onEditFarmer,
  onCreatePlot,
  onEditPlot,
}) => {
  const [plots, setPlots] = useState<IFarmPlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPlots = useCallback(async () => {
    try {
      const response = await api.get<IFarmPlot[]>('/plots', {
        params: { limit: '50', search: farmer.farmerId }, // API might need a specific filter for farmerId if search isn't exactly mapping it. We assume search works or we pull all and filter.
      });
      // Filter locally just in case the API search doesn't strictly match farmerId
      const farmerPlots = (response.data || []).filter(
        (p) => p.farmerId === farmer.farmerId
      );
      setPlots(farmerPlots);
    } catch {
      // Offline or error
    } finally {
      setLoading(false);
    }
  }, [farmer.farmerId]);

  useEffect(() => {
    loadPlots();
  }, [loadPlots]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPlots();
    setRefreshing(false);
  }, [loadPlots]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return Colors.success;
      case 'flagged': return Colors.error;
      default: return Colors.textTertiary;
    }
  };

  const renderPlot = (item: IFarmPlot) => (
    <TouchableOpacity
      key={item.plotId}
      style={[styles.plotCard, Shadows.sm]}
      onPress={() => onEditPlot(item, farmer.farmerId)}
      activeOpacity={0.7}
    >
      <View style={styles.plotIcon}>
        <Text style={styles.plotEmoji}>🗺️</Text>
      </View>
      <View style={styles.plotInfo}>
        <Text style={styles.plotName}>{item.name}</Text>
        <Text style={styles.plotMeta}>{item.areaHectares} ha • {item.currentLandUse?.replace(/_/g, ' ')}</Text>
      </View>
      <View style={styles.plotRight}>
        <SyncBadge status={(item as any).syncStatus || SyncStatus.SYNCED} />
        <Text style={[styles.verificationBadge, { color: getStatusColor(item.verificationStatus) }]}>
          {item.verificationStatus}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backText}>Farmers</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onEditFarmer(farmer)}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
      >
        {/* Farmer Info Card */}
        <View style={[styles.infoCard, Shadows.md]}>
          <View style={styles.infoRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(farmer.firstName?.[0] || '') + (farmer.lastName?.[0] || '')}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.farmerName}>{farmer.firstName} {farmer.lastName}</Text>
              <Text style={styles.farmerId}>ID: {farmer.farmerId}</Text>
              <View style={styles.statusRow}>
                <SyncBadge status={farmer.syncStatus || SyncStatus.SYNCED} />
                <Text style={styles.statusBadge}>{farmer.status}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{farmer.contact?.phone || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>National ID</Text>
              <Text style={styles.detailValue}>{farmer.nationalId || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Livelihood</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{farmer.socioEconomic?.primaryLivelihood || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>FPIC</Text>
              <Text style={[styles.detailValue, { color: farmer.consent?.fpicGranted ? Colors.success : Colors.error }]}>
                {farmer.consent?.fpicGranted ? 'Granted' : 'Pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* Plots Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Farm Plots</Text>
          <TouchableOpacity onPress={() => onCreatePlot(farmer.farmerId)} style={styles.addButton}>
            <Text style={styles.addIcon}>+</Text>
            <Text style={styles.addText}>Add Plot</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : plots.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🗺️</Text>
            <Text style={styles.emptyText}>No plots registered</Text>
            <Text style={styles.emptySubtext}>Tap "Add Plot" to register the farm boundaries.</Text>
          </View>
        ) : (
          <View style={styles.plotList}>
            {plots.map(renderPlot)}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxxl + Spacing.sm, paddingBottom: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backIcon: { fontSize: 24, color: Colors.primary, marginRight: Spacing.xs, marginTop: -2 },
  backText: { ...Typography.body, color: Colors.primary, fontWeight: '500' },
  editText: { ...Typography.body, color: Colors.primary, fontWeight: '600' },
  content: { padding: Spacing.xl, paddingBottom: 100 },
  infoCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.xl },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 56, height: 56, borderRadius: BorderRadius.full,
    backgroundColor: Colors.primarySurface, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  avatarText: { ...Typography.h3, color: Colors.primary },
  farmerName: { ...Typography.h3, color: Colors.textPrimary },
  farmerId: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: Spacing.xxs },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs, gap: Spacing.sm },
  statusBadge: { ...Typography.caption, color: Colors.textTertiary, textTransform: 'capitalize' },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.md },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  detailItem: { width: '45%' },
  detailLabel: { ...Typography.caption, color: Colors.textSecondary, marginBottom: 2 },
  detailValue: { ...Typography.bodySmall, color: Colors.textPrimary, fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primarySurface, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.md },
  addIcon: { fontSize: 16, color: Colors.primary, fontWeight: '700', marginRight: Spacing.xxs },
  addText: { ...Typography.caption, color: Colors.primary, fontWeight: '600' },
  center: { padding: Spacing.xl, alignItems: 'center' },
  empty: { alignItems: 'center', padding: Spacing.xl, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.border },
  emptyIcon: { fontSize: 32, marginBottom: Spacing.sm },
  emptyText: { ...Typography.subtitle, color: Colors.textPrimary },
  emptySubtext: { ...Typography.bodySmall, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.xs },
  plotList: { gap: Spacing.md },
  plotCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center' },
  plotIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  plotEmoji: { fontSize: 18 },
  plotInfo: { flex: 1 },
  plotName: { ...Typography.subtitle, color: Colors.textPrimary },
  plotMeta: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: Spacing.xxs },
  plotRight: { alignItems: 'flex-end' },
  verificationBadge: { ...Typography.caption, textTransform: 'capitalize', marginTop: Spacing.xs },
});
