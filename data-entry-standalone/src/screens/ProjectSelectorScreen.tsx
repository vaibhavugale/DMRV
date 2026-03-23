import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { api } from '../services/api';
import { setActiveProjectId } from '../services/storage';
import { IProject } from '../types';

interface ProjectSelectorScreenProps {
  onProjectSelected: () => void;
}

export const ProjectSelectorScreen: React.FC<ProjectSelectorScreenProps> = ({
  onProjectSelected,
}) => {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await api.get<IProject[]>('/projects', { skipProjectScope: true });
      setProjects(response.data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (project: IProject) => {
    setSelectedId(project._id);
    await setActiveProjectId(project._id);
    onProjectSelected();
  };

  const renderProject = ({ item }: { item: IProject }) => (
    <TouchableOpacity
      style={[
        styles.projectCard,
        Shadows.sm,
        selectedId === item._id && styles.projectCardSelected,
      ]}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.projectIcon}>
        <Text style={styles.projectEmoji}>🌱</Text>
      </View>
      <View style={styles.projectInfo}>
        <Text style={styles.projectName}>{item.name}</Text>
        <Text style={styles.projectMeta}>
          {item.certificationStandard?.replace(/_/g, ' ').toUpperCase() || 'Standard N/A'}
          {item.country ? ` • ${item.country}` : ''}
        </Text>
        {item.methodology && (
          <Text style={styles.projectMethodology}>{item.methodology}</Text>
        )}
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Project</Text>
        <Text style={styles.subtitle}>
          Choose a project to begin field data collection
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading projects…</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item._id}
          renderItem={renderProject}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No projects available</Text>
              <Text style={styles.emptySubtext}>
                Contact your administrator to get assigned to a project.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxxl + Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  projectCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectCardSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  projectIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  projectEmoji: {
    fontSize: 22,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
  },
  projectMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
  projectMethodology: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginTop: Spacing.xxs,
  },
  arrow: {
    fontSize: 24,
    color: Colors.textTertiary,
    marginLeft: Spacing.sm,
  },
  separator: {
    height: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  emptyText: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  emptySubtext: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xxl,
  },
});
