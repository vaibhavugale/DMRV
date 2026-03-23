import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { FormInput } from '../components/FormInput';
import { FormPicker } from '../components/FormPicker';
import { queueForSync } from '../services/sync';
import { IActivity, ActivityType } from '../types';

interface ActivityFormScreenProps {
  activity?: IActivity;
  onSave: () => void;
  onCancel: () => void;
}

const TYPE_OPTIONS = Object.values(ActivityType).map((t) => ({
  label: t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
  value: t,
}));

export const ActivityFormScreen: React.FC<ActivityFormScreenProps> = ({
  activity,
  onSave,
  onCancel,
}) => {
  const isEditing = !!activity;

  const [type, setType] = useState(activity?.type || ActivityType.MONITORING);
  const [description, setDescription] = useState(activity?.description || '');
  const [plotId, setPlotId] = useState(activity?.plotId || '');
  const [farmerId, setFarmerId] = useState(activity?.farmerId || '');
  const [duration, setDuration] = useState(activity?.duration?.toString() || '');
  const [notes, setNotes] = useState(activity?.notes || '');

  const [saving, setSaving] = useState(false);

  const validate = (): boolean => {
    if (!plotId.trim()) { Alert.alert('Validation', 'Plot ID is required.'); return false; }
    if (!description.trim()) { Alert.alert('Validation', 'Description is required.'); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const activityId = activity?.activityId || `ACT-${Date.now().toString(36).toUpperCase()}`;

    const data: Partial<IActivity> = {
      activityId,
      farmerId: farmerId.trim(),
      plotId: plotId.trim(),
      type: type as ActivityType,
      description: description.trim(),
      timestamp: activity?.timestamp || new Date().toISOString(),
      performedBy: activity?.performedBy || 'Current_User',
      duration: duration ? Number(duration) : undefined,
      notes: notes.trim() || undefined,
    };

    try {
      await queueForSync('activity', data);
      Alert.alert('Success', `Activity ${isEditing ? 'updated' : 'logged'} and queued for sync.`);
      onSave();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Activity' : 'Log Activity'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.saveText, saving && styles.saveTextDisabled]}>
            {saving ? 'Saving…' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <FormPicker label="Activity Type" options={TYPE_OPTIONS} value={type} onValueChange={(v) => setType(v as ActivityType)} required />
        <FormInput label="Description" value={description} onChangeText={setDescription} required placeholder="e.g. Applied organic compost" />
        
        <Text style={styles.sectionTitle}>Location</Text>
        <FormInput label="Plot ID" value={plotId} onChangeText={setPlotId} required placeholder="e.g. PLT-123" />
        <FormInput label="Farmer ID" value={farmerId} onChangeText={setFarmerId} placeholder="e.g. FRM-XYZ" />

        <Text style={styles.sectionTitle}>Details</Text>
        <FormInput label="Duration (minutes)" value={duration} onChangeText={setDuration} keyboardType="numeric" />
        <FormInput label="Notes" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxxl + Spacing.sm, paddingBottom: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  cancelText: { ...Typography.body, color: Colors.textSecondary },
  headerTitle: { ...Typography.subtitle, color: Colors.textPrimary },
  saveText: { ...Typography.body, color: Colors.primary, fontWeight: '600' },
  saveTextDisabled: { opacity: 0.5 },
  form: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: Spacing.lg, marginTop: Spacing.lg },
});
