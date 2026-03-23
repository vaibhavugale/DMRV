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
import { IFarmPlot, PlotLandUse } from '../types';

interface PlotFormScreenProps {
  plot?: IFarmPlot;
  farmerId: string;
  onSave: () => void;
  onCancel: () => void;
}

const LAND_USE_OPTIONS = Object.values(PlotLandUse).map((v) => ({
  label: v.charAt(0).toUpperCase() + v.slice(1),
  value: v,
}));

const VERIFICATION_OPTIONS = [
  { label: 'Unverified', value: 'unverified' },
  { label: 'Verified', value: 'verified' },
  { label: 'Flagged', value: 'flagged' },
];

export const PlotFormScreen: React.FC<PlotFormScreenProps> = ({
  plot,
  farmerId,
  onSave,
  onCancel,
}) => {
  const isEditing = !!plot;

  const [name, setName] = useState(plot?.name || '');
  const [areaHectares, setAreaHectares] = useState(plot?.areaHectares?.toString() || '');
  const [elevation, setElevation] = useState(plot?.elevation?.toString() || '');
  const [soilType, setSoilType] = useState(plot?.soilType || '');
  const [currentLandUse, setCurrentLandUse] = useState(plot?.currentLandUse || PlotLandUse.AGROFORESTRY);
  const [plantingDensity, setPlantingDensity] = useState(plot?.plantingDensity?.toString() || '');
  const [verificationStatus, setVerificationStatus] = useState(plot?.verificationStatus || 'unverified');
  const [notes, setNotes] = useState(plot?.notes || '');

  const [saving, setSaving] = useState(false);

  const validate = (): boolean => {
    if (!name.trim()) { Alert.alert('Validation', 'Plot name is required.'); return false; }
    if (!areaHectares.trim() || isNaN(Number(areaHectares))) {
      Alert.alert('Validation', 'Area (hectares) must be a valid number.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const plotId = plot?.plotId || `PLT-${Date.now().toString(36).toUpperCase()}`;

    const data: Partial<IFarmPlot> = {
      plotId,
      farmerId: farmerId.trim(),
      name: name.trim(),
      boundary: plot?.boundary || {
        type: 'Polygon',
        coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]],
      },
      areaHectares: Number(areaHectares),
      elevation: elevation ? Number(elevation) : undefined,
      soilType: soilType.trim() || undefined,
      currentLandUse,
      landUseHistory: plot?.landUseHistory || [],
      plantingDensity: plantingDensity ? Number(plantingDensity) : undefined,
      verificationStatus: verificationStatus as 'unverified' | 'verified' | 'flagged',
      notes: notes.trim() || undefined,
    };

    try {
      await queueForSync('plot', data);
      Alert.alert('Success', `Plot ${isEditing ? 'updated' : 'registered'} and queued for sync.`);
      onSave();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Plot' : 'New Farm Plot'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.saveText, saving && styles.saveTextDisabled]}>
            {saving ? 'Saving…' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Plot Details</Text>

        <FormInput label="Plot Name" value={name} onChangeText={setName} required />
        <FormInput label="Area (Hectares)" value={areaHectares} onChangeText={setAreaHectares} keyboardType="decimal-pad" required />
        <FormInput label="Elevation (m)" value={elevation} onChangeText={setElevation} keyboardType="decimal-pad" />
        <FormInput label="Soil Type" value={soilType} onChangeText={setSoilType} placeholder="e.g. Loam, Clay, Sandy" />

        <Text style={styles.sectionTitle}>Land Use</Text>

        <FormPicker label="Current Land Use" options={LAND_USE_OPTIONS} value={currentLandUse} onValueChange={(v) => setCurrentLandUse(v as PlotLandUse)} />
        <FormInput label="Planting Density (trees/ha)" value={plantingDensity} onChangeText={setPlantingDensity} keyboardType="numeric" />
        <FormPicker label="Verification Status" options={VERIFICATION_OPTIONS} value={verificationStatus} onValueChange={setVerificationStatus} />

        <Text style={styles.sectionTitle}>Notes</Text>
        <FormInput label="Additional Notes" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />

        <View style={styles.boundaryNote}>
          <Text style={styles.boundaryNoteText}>
            📍 GPS boundary capture will be available in a future update. A placeholder boundary is used for now.
          </Text>
        </View>

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
  boundaryNote: {
    backgroundColor: Colors.primarySurface, borderRadius: BorderRadius.md, padding: Spacing.lg, marginTop: Spacing.md,
  },
  boundaryNoteText: { ...Typography.bodySmall, color: Colors.primary },
});
