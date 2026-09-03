import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Chip } from '../components/Chip';
import { SectionCard } from '../components/SectionCard';
import { useStore } from '../store';
import { colors, spacing } from '../theme';

const PRESET_CONDITIONS = [
  'Type 2 Diabetes', 'Hypertension (High BP)', 'High Cholesterol',
  'Celiac Disease (Gluten Intolerance)', 'Irritable Bowel Syndrome (IBS)',
  'Polycystic Ovary Syndrome (PCOS)', 'Hypothyroidism', 'GERD / Acid Reflux',
  'Gout (High Uric Acid)', 'Lactose Intolerance', 'Nut Allergy (Peanuts/Tree Nuts)',
];

const GENDERS = ['Male', 'Female', 'Non-binary', 'Other'];

export function BiometricsScreen() {
  const { profile, setProfile, setStep } = useStore();
  const [customCondition, setCustomCondition] = useState('');

  const addCondition = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed || profile.conditions.length >= 20 || profile.conditions.includes(trimmed)) return;
    setProfile((p) => ({ ...p, conditions: [...p.conditions, trimmed] }));
  };

  const removeCondition = (idx: number) => {
    setProfile((p) => ({ ...p, conditions: p.conditions.filter((_, i) => i !== idx) }));
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <SectionCard>
        <Text style={styles.eyebrow}>STEP 1 OF 3 · BIOMETRICS & HEALTH PROFILE</Text>
        <Text style={styles.title}>Personal Metrics & Health Conditions</Text>
        <Text style={styles.subtitle}>Provide physical metrics and select diagnosed conditions (max 20) to prevent adverse reactions.</Text>

        <Text style={styles.label}>Gender</Text>
        <View style={styles.row}>
          {GENDERS.map((g) => (
            <Pressable
              key={g}
              onPress={() => setProfile((p) => ({ ...p, gender: g }))}
              style={[styles.pill, profile.gender === g && styles.pillActive]}
            >
              <Text style={[styles.pillText, profile.gender === g && styles.pillTextActive]}>{g}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.grid2}>
          <View style={styles.field}>
            <Text style={styles.label}>Age (years)</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={String(profile.age)}
              onChangeText={(v) => setProfile((p) => ({ ...p, age: parseInt(v, 10) || 0 }))}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={String(profile.heightCm)}
              onChangeText={(v) => setProfile((p) => ({ ...p, heightCm: parseInt(v, 10) || 0 }))}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={String(profile.weightKg)}
            onChangeText={(v) => setProfile((p) => ({ ...p, weightKg: parseInt(v, 10) || 0 }))}
          />
        </View>
      </SectionCard>

      <SectionCard>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>Medical Conditions</Text>
          <Text style={styles.counter}>{profile.conditions.length} / 20</Text>
        </View>
        <Text style={styles.subtitle}>Tap a preset to add it, or type a custom condition below.</Text>

        <View style={styles.row}>
          {PRESET_CONDITIONS.map((c) => (
            <Pressable key={c} onPress={() => addCondition(c)} style={styles.presetPill}>
              <Text style={styles.presetPillText}>+ {c}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.flex1]}
            placeholder="e.g. Histamine Intolerance..."
            value={customCondition}
            onChangeText={setCustomCondition}
          />
          <Pressable
            style={styles.addBtn}
            onPress={() => {
              addCondition(customCondition);
              setCustomCondition('');
            }}
          >
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>

        <View style={[styles.row, styles.tagBox]}>
          {profile.conditions.length === 0 ? (
            <Text style={styles.emptyText}>No conditions added yet.</Text>
          ) : (
            profile.conditions.map((c, idx) => (
              <Chip key={c} label={`🩺 ${c}`} onRemove={() => removeCondition(idx)} />
            ))
          )}
        </View>
      </SectionCard>

      <Pressable style={styles.primaryBtn} onPress={() => setStep('diet')}>
        <Text style={styles.primaryBtnText}>Continue to Diet Preferences →</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing(4), paddingBottom: spacing(10) },
  eyebrow: { color: colors.brandDark, fontWeight: '700', fontSize: 11, letterSpacing: 0.5, marginBottom: spacing(2) },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing(1) },
  subtitle: { color: colors.textMuted, fontSize: 13, marginBottom: spacing(4) },
  label: { fontSize: 11, fontWeight: '700', color: colors.text, textTransform: 'uppercase', marginBottom: spacing(1.5) },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  grid2: { flexDirection: 'row', gap: spacing(3) },
  field: { flex: 1, marginBottom: spacing(4) },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: spacing(3),
    paddingHorizontal: spacing(3), paddingVertical: spacing(2.5), fontSize: 14, color: colors.text, backgroundColor: colors.bg,
  },
  flex1: { flex: 1 },
  inputRow: { flexDirection: 'row', gap: spacing(2), marginBottom: spacing(3), alignItems: 'center' },
  pill: {
    borderWidth: 1, borderColor: colors.border, borderRadius: spacing(3),
    paddingVertical: spacing(2), paddingHorizontal: spacing(3.5), marginRight: spacing(2), marginBottom: spacing(3),
  },
  pillActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  pillText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: '#fff' },
  presetPill: {
    borderWidth: 1, borderColor: colors.border, borderRadius: spacing(2.5),
    paddingVertical: spacing(1.5), paddingHorizontal: spacing(2.5), marginRight: spacing(2), marginBottom: spacing(2), backgroundColor: colors.chip,
  },
  presetPillText: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  addBtn: { backgroundColor: colors.chip, borderRadius: spacing(3), paddingVertical: spacing(2.5), paddingHorizontal: spacing(4), borderWidth: 1, borderColor: colors.border },
  addBtnText: { color: colors.brandDark, fontWeight: '700', fontSize: 13 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing(1) },
  counter: { fontSize: 11, fontWeight: '700', color: colors.brandDark, backgroundColor: colors.brandLight, paddingHorizontal: spacing(2), paddingVertical: spacing(1), borderRadius: spacing(3) },
  tagBox: { backgroundColor: colors.bg, borderRadius: spacing(3), padding: spacing(3), minHeight: 48 },
  emptyText: { color: colors.textMuted, fontSize: 12, fontStyle: 'italic' },
  primaryBtn: { backgroundColor: colors.brand, borderRadius: spacing(3), paddingVertical: spacing(3.5), alignItems: 'center', marginTop: spacing(2) },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
