import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { FormInput } from '../components/FormInput';
import { FormPicker } from '../components/FormPicker';
import { queueForSync } from '../services/sync';
import { IFarmer, FarmerStatus } from '../types';

interface FarmerFormScreenProps {
  farmer?: IFarmer;
  onSave: () => void;
  onCancel: () => void;
}

const STATUS_OPTIONS = Object.values(FarmerStatus).map((s) => ({
  label: s.charAt(0).toUpperCase() + s.slice(1),
  value: s,
}));

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export const FarmerFormScreen: React.FC<FarmerFormScreenProps> = ({
  farmer,
  onSave,
  onCancel,
}) => {
  const isEditing = !!farmer;

  // Personal info
  const [firstName, setFirstName] = useState(farmer?.firstName || '');
  const [lastName, setLastName] = useState(farmer?.lastName || '');
  const [phone, setPhone] = useState(farmer?.contact?.phone || '');
  const [email, setEmail] = useState(farmer?.contact?.email || '');
  const [address, setAddress] = useState(farmer?.contact?.address || '');
  const [nationalId, setNationalId] = useState(farmer?.nationalId || '');
  const [status, setStatus] = useState(farmer?.status || FarmerStatus.PENDING);

  // Socioeconomic
  const [householdSize, setHouseholdSize] = useState(
    farmer?.socioEconomic?.householdSize?.toString() || ''
  );
  const [annualIncome, setAnnualIncome] = useState(
    farmer?.socioEconomic?.annualIncome?.toString() || ''
  );
  const [primaryLivelihood, setPrimaryLivelihood] = useState(
    farmer?.socioEconomic?.primaryLivelihood || ''
  );
  const [genderOfHousehold, setGenderOfHousehold] = useState(
    farmer?.socioEconomic?.genderOfHousehold || 'male'
  );
  const [accessToCredit, setAccessToCredit] = useState(
    farmer?.socioEconomic?.accessToCredit || false
  );

  // Consent
  const [fpicGranted, setFpicGranted] = useState(farmer?.consent?.fpicGranted || false);
  const [witnessName, setWitnessName] = useState(farmer?.consent?.witnessName || '');

  // Notes
  const [notes, setNotes] = useState(farmer?.notes || '');

  const [saving, setSaving] = useState(false);

  const validate = (): boolean => {
    if (!firstName.trim()) {
      Alert.alert('Validation', 'First name is required.');
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert('Validation', 'Last name is required.');
      return false;
    }
    if (!householdSize.trim() || isNaN(Number(householdSize))) {
      Alert.alert('Validation', 'Household size must be a number.');
      return false;
    }
    if (!primaryLivelihood.trim()) {
      Alert.alert('Validation', 'Primary livelihood is required.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const farmerId = farmer?.farmerId || `FRM-${Date.now().toString(36).toUpperCase()}`;

    const data: Partial<IFarmer> = {
      farmerId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      contact: {
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
      },
      nationalId: nationalId.trim() || undefined,
      status,
      registrationDate: farmer?.registrationDate || new Date().toISOString(),
      socioEconomic: {
        householdSize: Number(householdSize),
        annualIncome: annualIncome ? Number(annualIncome) : undefined,
        primaryLivelihood: primaryLivelihood.trim(),
        accessToCredit,
        genderOfHousehold: genderOfHousehold as 'male' | 'female' | 'other',
      },
      consent: {
        fpicGranted,
        consentDate: new Date().toISOString(),
        witnessName: witnessName.trim() || undefined,
      },
      notes: notes.trim() || undefined,
    };

    try {
      await queueForSync('farmer', data);
      Alert.alert('Success', `Farmer ${isEditing ? 'updated' : 'registered'} and queued for sync.`);
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Farmer' : 'Register Farmer'}
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.saveText, saving && styles.saveTextDisabled]}>
            {saving ? 'Saving…' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        {/* Personal Information */}
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <FormInput label="First Name" value={firstName} onChangeText={setFirstName} required />
        <FormInput label="Last Name" value={lastName} onChangeText={setLastName} required />
        <FormInput label="National ID" value={nationalId} onChangeText={setNationalId} />
        <FormPicker label="Status" options={STATUS_OPTIONS} value={status} onValueChange={(v) => setStatus(v as FarmerStatus)} />

        {/* Contact */}
        <Text style={styles.sectionTitle}>Contact Details</Text>

        <FormInput label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <FormInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <FormInput label="Address" value={address} onChangeText={setAddress} multiline />

        {/* Socioeconomic */}
        <Text style={styles.sectionTitle}>Socioeconomic Data</Text>

        <FormInput label="Household Size" value={householdSize} onChangeText={setHouseholdSize} keyboardType="numeric" required />
        <FormInput label="Annual Income (USD)" value={annualIncome} onChangeText={setAnnualIncome} keyboardType="numeric" />
        <FormInput label="Primary Livelihood" value={primaryLivelihood} onChangeText={setPrimaryLivelihood} required />
        <FormPicker label="Gender of Household Head" options={GENDER_OPTIONS} value={genderOfHousehold} onValueChange={setGenderOfHousehold} />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Access to Credit</Text>
          <Switch
            value={accessToCredit}
            onValueChange={setAccessToCredit}
            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            thumbColor={Colors.surface}
          />
        </View>

        {/* Consent */}
        <Text style={styles.sectionTitle}>FPIC Consent</Text>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>FPIC Granted</Text>
          <Switch
            value={fpicGranted}
            onValueChange={setFpicGranted}
            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            thumbColor={Colors.surface}
          />
        </View>

        <FormInput label="Witness Name" value={witnessName} onChangeText={setWitnessName} />

        {/* Notes */}
        <Text style={styles.sectionTitle}>Notes</Text>
        <FormInput label="Additional Notes" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxxl + Spacing.sm,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  cancelText: { ...Typography.body, color: Colors.textSecondary },
  headerTitle: { ...Typography.subtitle, color: Colors.textPrimary },
  saveText: { ...Typography.body, color: Colors.primary, fontWeight: '600' },
  saveTextDisabled: { opacity: 0.5 },
  form: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    marginTop: Spacing.lg,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  switchLabel: { ...Typography.body, color: Colors.textPrimary },
  bottomSpacer: { height: Spacing.xxxl },
});
