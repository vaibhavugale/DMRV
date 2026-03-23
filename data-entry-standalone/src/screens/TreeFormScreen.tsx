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
import { ITreeInventory, TreeCondition } from '../types';

interface TreeFormScreenProps {
  tree?: ITreeInventory;
  onSave: () => void;
  onCancel: () => void;
}

const CONDITION_OPTIONS = Object.values(TreeCondition).map((c) => ({
  label: c.charAt(0).toUpperCase() + c.slice(1),
  value: c,
}));

export const TreeFormScreen: React.FC<TreeFormScreenProps> = ({
  tree,
  onSave,
  onCancel,
}) => {
  const isEditing = !!tree;

  const [plotId, setPlotId] = useState(tree?.plotId || '');
  const [farmerId, setFarmerId] = useState(tree?.farmerId || '');
  
  // Real app would have a hierarchical picker: Family -> Genus -> Species
  const [speciesScientific, setSpeciesScientific] = useState(tree?.speciesScientific || '');
  const [family, setFamily] = useState(tree?.family || '');
  
  const [dbhCm, setDbhCm] = useState(tree?.dbhCm?.toString() || '');
  const [heightM, setHeightM] = useState(tree?.heightM?.toString() || '');
  const [conditionStatus, setConditionStatus] = useState(tree?.conditionStatus || TreeCondition.HEALTHY);

  const [saving, setSaving] = useState(false);

  const validate = (): boolean => {
    if (!plotId.trim()) { Alert.alert('Validation', 'Plot ID is required.'); return false; }
    if (!speciesScientific.trim()) { Alert.alert('Validation', 'Species is required.'); return false; }
    if (!dbhCm.trim() || isNaN(Number(dbhCm))) { Alert.alert('Validation', 'DBH must be a valid number.'); return false; }
    if (!heightM.trim() || isNaN(Number(heightM))) { Alert.alert('Validation', 'Height must be a valid number.'); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const treeId = tree?.treeId || `TRE-${Date.now().toString(36).toUpperCase()}`;

    const data: Partial<ITreeInventory> = {
      treeId,
      plotId: plotId.trim(),
      farmerId: farmerId.trim(),
      coordinates: tree?.coordinates || { type: 'Point', coordinates: [0, 0] },
      speciesScientific: speciesScientific.trim(),
      family: family.trim() || 'Unknown',
      genus: speciesScientific.split(' ')[0] || 'Unknown',
      species: speciesScientific.split(' ')[1] || 'Unknown',
      dbhCm: Number(dbhCm),
      heightM: Number(heightM),
      conditionStatus: conditionStatus as TreeCondition,
      plantingDate: tree?.plantingDate || new Date().toISOString(),
      lastMeasurementDate: new Date().toISOString(),
    };

    try {
      await queueForSync('tree', data);
      Alert.alert('Success', `Tree ${isEditing ? 'updated' : 'recorded'} and queued for sync.`);
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
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Tree' : 'New Tree'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.saveText, saving && styles.saveTextDisabled]}>
            {saving ? 'Saving…' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Location</Text>
        <FormInput label="Plot ID" value={plotId} onChangeText={setPlotId} required placeholder="e.g. PLT-XYZ" />
        <FormInput label="Farmer ID" value={farmerId} onChangeText={setFarmerId} placeholder="e.g. FRM-ABC" />

        <Text style={styles.sectionTitle}>Species</Text>
        <FormInput label="Scientific Name" value={speciesScientific} onChangeText={setSpeciesScientific} required placeholder="e.g. Mangifera indica" />
        <FormInput label="Family" value={family} onChangeText={setFamily} placeholder="e.g. Anacardiaceae" />

        <Text style={styles.sectionTitle}>Biometrics</Text>
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: Spacing.md }}>
            <FormInput label="DBH (cm)" value={dbhCm} onChangeText={setDbhCm} keyboardType="decimal-pad" required />
          </View>
          <View style={{ flex: 1 }}>
            <FormInput label="Height (m)" value={heightM} onChangeText={setHeightM} keyboardType="decimal-pad" required />
          </View>
        </View>

        <FormPicker label="Condition" options={CONDITION_OPTIONS} value={conditionStatus} onValueChange={(v) => setConditionStatus(v as TreeCondition)} />

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
  row: { flexDirection: 'row' },
});
