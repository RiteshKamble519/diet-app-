import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SectionCard } from '../components/SectionCard';
import { generatePlan } from '../api';
import { useStore } from '../store';
import { colors, spacing } from '../theme';

const AVAILABLE_CUISINES = ['Indian', 'Italian', 'Mexican', 'Mughlai', 'Mediterranean', 'Thai', 'Middle Eastern', 'Continental', 'Greek', 'Chinese'];

export function CuisinesScreen() {
  const { profile, setProfile, setStep, setPlan, setPlanSource, setSelectedDayIndex } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCuisine = (c: string) => {
    setProfile((p) => ({
      ...p,
      cuisines: p.cuisines.includes(c) ? p.cuisines.filter((x) => x !== c) : [...p.cuisines, c],
    }));
  };

  const onGenerate = async () => {
    if (profile.foodPrefs.length === 0) {
      setError('Select at least one diet preference on the previous step first.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { plan, source } = await generatePlan(profile);
      setPlan(plan);
      setPlanSource(source);
      setSelectedDayIndex(0);
      setStep('dashboard');
    } catch (err) {
      setError((err as Error).message || 'Failed to generate plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <SectionCard>
        <Text style={styles.eyebrow}>STEP 3 OF 3 · CUISINES & SCHEDULE</Text>
        <Text style={styles.title}>Preferred Cuisines & Schedule</Text>
        <Text style={styles.subtitle}>Select cuisines, cheat day cadence, and any custom notes for the AI.</Text>

        <Text style={styles.label}>Preferred Cuisines ({profile.cuisines.length} selected)</Text>
        <View style={styles.row}>
          {AVAILABLE_CUISINES.map((c) => {
            const selected = profile.cuisines.includes(c);
            return (
              <Pressable key={c} onPress={() => toggleCuisine(c)} style={[styles.pill, selected && styles.pillActive]}>
                <Text style={[styles.pillText, selected && styles.pillTextActive]}>{c}</Text>
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard>
        <View style={styles.grid2}>
          <View style={styles.field}>
            <Text style={styles.label}>Cheat day every (days)</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={String(profile.cheatInterval)}
              onChangeText={(v) => setProfile((p) => ({ ...p, cheatInterval: parseInt(v, 10) || 7 }))}
            />
          </View>
        </View>

        <Text style={styles.label}>Plan Duration</Text>
        <View style={styles.row}>
          {['Next 3 Days', 'Next Week (7 Days)', 'Next Month (30 Days)'].map((d) => (
            <Pressable key={d} onPress={() => setProfile((p) => ({ ...p, duration: d }))} style={[styles.pill, profile.duration === d && styles.pillActive]}>
              <Text style={[styles.pillText, profile.duration === d && styles.pillTextActive]}>{d}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Custom Instructions for AI (optional)</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          multiline
          maxLength={500}
          placeholder="e.g. Keep breakfast under 15 mins, higher protein after 6 PM..."
          value={profile.customInstructions}
          onChangeText={(v) => setProfile((p) => ({ ...p, customInstructions: v }))}
        />
      </SectionCard>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.navRow}>
        <Pressable style={styles.secondaryBtn} onPress={() => setStep('diet')}>
          <Text style={styles.secondaryBtnText}>← Back</Text>
        </Pressable>
        <Pressable style={[styles.primaryBtn, styles.flex1]} onPress={onGenerate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>✨ Generate Diet Plan</Text>}
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
  label: { fontSize: 11, fontWeight: '700', color: colors.text, textTransform: 'uppercase', marginBottom: spacing(2) },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  grid2: { flexDirection: 'row', gap: spacing(3) },
  field: { flex: 1, marginBottom: spacing(4) },
  pill: {
    borderWidth: 1, borderColor: colors.border, borderRadius: spacing(3),
    paddingVertical: spacing(2), paddingHorizontal: spacing(3.5), marginRight: spacing(2), marginBottom: spacing(2),
  },
  pillActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  pillText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  pillTextActive: { color: '#fff' },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: spacing(3),
    paddingHorizontal: spacing(3), paddingVertical: spacing(2.5), fontSize: 14, color: colors.text, backgroundColor: colors.bg, marginBottom: spacing(4),
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  flex1: { flex: 1 },
  errorText: { color: colors.danger, fontSize: 13, marginBottom: spacing(3), textAlign: 'center' },
  navRow: { flexDirection: 'row', gap: spacing(3) },
  primaryBtn: { backgroundColor: colors.brand, borderRadius: spacing(3), paddingVertical: spacing(3.5), alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  secondaryBtn: { backgroundColor: colors.chip, borderRadius: spacing(3), paddingVertical: spacing(3.5), paddingHorizontal: spacing(4), alignItems: 'center' },
  secondaryBtnText: { color: colors.text, fontWeight: '700', fontSize: 14 },
});
