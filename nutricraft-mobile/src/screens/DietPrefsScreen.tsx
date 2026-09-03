import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Chip } from '../components/Chip';
import { SectionCard } from '../components/SectionCard';
import { useStore } from '../store';
import { colors, spacing } from '../theme';

const DIET_OPTIONS = [
  { id: 'Vegetarian', icon: '🌱', desc: 'Plant-based foods, legumes, dairy & eggs optional.' },
  { id: 'Non-Vegetarian', icon: '🍗', desc: 'Includes poultry, meats, fish, seafood & dairy.' },
  { id: 'Vegan', icon: '🥑', desc: 'Strictly 100% plant foods. Zero animal products.' },
];

const QUICK_EXCLUDES = ['Mushrooms', 'Eggplant', 'Bell Peppers', 'Cilantro'];

export function DietPrefsScreen() {
  const { profile, setProfile, setStep } = useStore();
  const [customExcluded, setCustomExcluded] = useState('');

  const toggleDiet = (id: string) => {
    setProfile((p) => ({
      ...p,
      foodPrefs: p.foodPrefs.includes(id) ? p.foodPrefs.filter((d) => d !== id) : [...p.foodPrefs, id],
    }));
  };

  const addExcluded = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed || profile.excludedFoods.length >= 50) return;
    if (profile.excludedFoods.some((f) => f.toLowerCase() === trimmed.toLowerCase())) return;
    setProfile((p) => ({ ...p, excludedFoods: [...p.excludedFoods, trimmed] }));
  };

  const removeExcluded = (idx: number) => {
    setProfile((p) => ({ ...p, excludedFoods: p.excludedFoods.filter((_, i) => i !== idx) }));
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <SectionCard>
        <Text style={styles.eyebrow}>STEP 2 OF 3 · DIETARY RULES & EXCLUSIONS</Text>
        <Text style={styles.title}>Food Preference & Excluded Items</Text>
        <Text style={styles.subtitle}>Select one or multiple diet preferences and eliminate unwanted ingredients.</Text>

        {DIET_OPTIONS.map((diet) => {
          const selected = profile.foodPrefs.includes(diet.id);
          return (
            <Pressable
              key={diet.id}
              onPress={() => toggleDiet(diet.id)}
              style={[styles.dietCard, selected && styles.dietCardActive]}
            >
              <View style={styles.dietCardHeader}>
                <Text style={styles.dietIcon}>{diet.icon}</Text>
                <View style={[styles.checkbox, selected && styles.checkboxActive]}>
                  {selected ? <Text style={styles.checkboxMark}>✓</Text> : null}
                </View>
              </View>
              <Text style={styles.dietTitle}>{diet.id}</Text>
              <Text style={styles.dietDesc}>{diet.desc}</Text>
            </Pressable>
          );
        })}
      </SectionCard>

      <SectionCard>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>Excluded Food Items</Text>
          <Text style={styles.counter}>{profile.excludedFoods.length} / 50</Text>
        </View>
        <Text style={styles.subtitle}>Add ingredients to exclude from every recipe.</Text>

        <View style={styles.row}>
          {QUICK_EXCLUDES.map((f) => (
            <Pressable key={f} onPress={() => addExcluded(f)} style={styles.presetPill}>
              <Text style={styles.presetPillText}>+ {f}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.flex1]}
            placeholder="e.g. Soy, Pork..."
            value={customExcluded}
            onChangeText={setCustomExcluded}
            onSubmitEditing={() => {
              addExcluded(customExcluded);
              setCustomExcluded('');
            }}
          />
          <Pressable
            style={styles.addBtn}
            onPress={() => {
              addExcluded(customExcluded);
              setCustomExcluded('');
            }}
          >
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>

        <View style={[styles.row, styles.tagBox]}>
          {profile.excludedFoods.length === 0 ? (
            <Text style={styles.emptyText}>No excluded items yet.</Text>
          ) : (
            profile.excludedFoods.map((f, idx) => (
              <Chip key={f} label={`🚫 ${f}`} tone="danger" onRemove={() => removeExcluded(idx)} />
            ))
          )}
        </View>
      </SectionCard>

      <View style={styles.navRow}>
        <Pressable style={styles.secondaryBtn} onPress={() => setStep('biometrics')}>
          <Text style={styles.secondaryBtnText}>← Back</Text>
        </Pressable>
        <Pressable style={[styles.primaryBtn, styles.flex1]} onPress={() => setStep('cuisines')}>
          <Text style={styles.primaryBtnText}>Continue to Cuisines →</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing(4), paddingBottom: spacing(10) },
  eyebrow: { color: colors.brandDark, fontWeight: '700', fontSize: 11, letterSpacing: 0.5, marginBottom: spacing(2) },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing(1) },
  subtitle: { color: colors.textMuted, fontSize: 13, marginBottom: spacing(4) },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  dietCard: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: spacing(4), padding: spacing(4), marginBottom: spacing(3), backgroundColor: colors.bg,
  },
  dietCardActive: { borderColor: colors.brand, backgroundColor: colors.brandLight },
  dietCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing(2) },
  dietIcon: { fontSize: 24 },
  checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  checkboxMark: { color: '#fff', fontSize: 11, fontWeight: '900' },
  dietTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  dietDesc: { fontSize: 12, color: colors.textMuted, marginTop: spacing(1) },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing(1) },
  counter: { fontSize: 11, fontWeight: '700', color: colors.brandDark, backgroundColor: colors.brandLight, paddingHorizontal: spacing(2), paddingVertical: spacing(1), borderRadius: spacing(3) },
  presetPill: {
    borderWidth: 1, borderColor: colors.border, borderRadius: spacing(2.5),
    paddingVertical: spacing(1.5), paddingHorizontal: spacing(2.5), marginRight: spacing(2), marginBottom: spacing(2), backgroundColor: colors.chip,
  },
  presetPillText: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  inputRow: { flexDirection: 'row', gap: spacing(2), marginBottom: spacing(3), alignItems: 'center' },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: spacing(3),
    paddingHorizontal: spacing(3), paddingVertical: spacing(2.5), fontSize: 14, color: colors.text, backgroundColor: colors.bg,
  },
  flex1: { flex: 1 },
  addBtn: { backgroundColor: colors.chip, borderRadius: spacing(3), paddingVertical: spacing(2.5), paddingHorizontal: spacing(4), borderWidth: 1, borderColor: colors.border },
  addBtnText: { color: colors.brandDark, fontWeight: '700', fontSize: 13 },
  tagBox: { backgroundColor: colors.bg, borderRadius: spacing(3), padding: spacing(3), minHeight: 48 },
  emptyText: { color: colors.textMuted, fontSize: 12, fontStyle: 'italic' },
  navRow: { flexDirection: 'row', gap: spacing(3) },
  primaryBtn: { backgroundColor: colors.brand, borderRadius: spacing(3), paddingVertical: spacing(3.5), alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  secondaryBtn: { backgroundColor: colors.chip, borderRadius: spacing(3), paddingVertical: spacing(3.5), paddingHorizontal: spacing(4), alignItems: 'center' },
  secondaryBtnText: { color: colors.text, fontWeight: '700', fontSize: 14 },
});
