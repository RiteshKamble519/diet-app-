import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SectionCard } from '../components/SectionCard';
import { refinePlan } from '../api';
import { useStore } from '../store';
import { colors, spacing } from '../theme';

export function DashboardScreen() {
  const { profile, plan, planSource, setPlan, setPlanSource, selectedDayIndex, setSelectedDayIndex, setStep } = useStore();
  const [modText, setModText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!plan) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No plan generated yet.</Text>
        <Pressable style={styles.primaryBtn} onPress={() => setStep('biometrics')}>
          <Text style={styles.primaryBtnText}>Start Over</Text>
        </Pressable>
      </View>
    );
  }

  const day = plan.days[selectedDayIndex] ?? plan.days[0];

  const onRefine = async () => {
    if (!modText.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const { plan: updated, source } = await refinePlan(profile, plan, modText.trim());
      setPlan(updated);
      setPlanSource(source);
      setModText('');
    } catch (err) {
      setError((err as Error).message || 'Failed to refine plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Pressable style={styles.newPlanBtn} onPress={() => setStep('biometrics')}>
        <Text style={styles.newPlanBtnText}>+ New Plan</Text>
      </Pressable>

      <View style={styles.statGrid}>
        <View style={styles.statTile}>
          <Text style={styles.statLabel}>🔥 Target Calories</Text>
          <Text style={styles.statValue}>{plan.summary.dailyCalorieTarget} kcal</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statLabel}>🥗 Macro Balance</Text>
          <Text style={styles.statValueSm}>P: {plan.summary.proteinGrams}g · C: {plan.summary.carbsGrams}g · F: {plan.summary.fatsGrams}g</Text>
        </View>
      </View>

      <SectionCard style={styles.rationaleCard}>
        <Text style={styles.rationaleLabel}>💡 Diet & Health Rationale</Text>
        <Text style={styles.rationaleText}>{plan.summary.safetyRationale}</Text>
        {planSource ? <Text style={styles.sourceTag}>source: {planSource}</Text> : null}
      </SectionCard>

      <SectionCard>
        <Text style={styles.label}>🔄 Modify or Refine Plan</Text>
        <Text style={styles.subtitle}>Tweak a meal, adjust portions, or change a day.</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Replace Day 1 dinner with a light soup..."
          value={modText}
          onChangeText={setModText}
          onSubmitEditing={onRefine}
        />
        <Pressable style={styles.primaryBtn} onPress={onRefine} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>✨ Refine Plan</Text>}
        </Pressable>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </SectionCard>

      <Text style={styles.sectionTitle}>Daily Meal Schedule</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayRow}>
        {plan.days.map((d, idx) => (
          <Pressable
            key={d.dayNumber}
            onPress={() => setSelectedDayIndex(idx)}
            style={[styles.dayPill, idx === selectedDayIndex && styles.dayPillActive]}
          >
            <Text style={[styles.dayPillText, idx === selectedDayIndex && styles.dayPillTextActive]}>
              {d.isCheatDay ? '🎉 Cheat Day' : `Day ${d.dayNumber}`}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {day.meals.map((meal, idx) => (
        <SectionCard key={idx}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealType}>{meal.type} {meal.time ? `· ${meal.time}` : ''}</Text>
            <Text style={styles.mealCuisine}>{meal.cuisine || 'Special'}</Text>
          </View>
          <Text style={styles.mealTitle}>{meal.title}</Text>
          <Text style={styles.mealNote}>{meal.healthNote || 'Tailored nutrition.'}</Text>
          <View style={styles.mealFooter}>
            <Text style={styles.mealCalories}>🔥 {meal.calories} kcal</Text>
            <Text style={styles.mealMacros}>P: {meal.protein} · C: {meal.carbs}</Text>
          </View>
        </SectionCard>
      ))}

      <SectionCard>
        <Text style={styles.sectionTitle}>🛒 Smart Grocery List</Text>
        {Object.entries(plan.groceryList).map(([category, items]) => (
          <View key={category} style={styles.groceryGroup}>
            <Text style={styles.groceryCategory}>{category}</Text>
            {items.map((item) => (
              <Text key={item} style={styles.groceryItem}>• {item}</Text>
            ))}
          </View>
        ))}
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing(4), paddingBottom: spacing(10) },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing(8) },
  emptyText: { color: colors.textMuted, marginBottom: spacing(4) },
  newPlanBtn: { alignSelf: 'flex-end', backgroundColor: colors.brand, borderRadius: spacing(3), paddingVertical: spacing(2), paddingHorizontal: spacing(3.5), marginBottom: spacing(3) },
  newPlanBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  statGrid: { flexDirection: 'row', gap: spacing(3), marginBottom: spacing(3) },
  statTile: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: spacing(4), padding: spacing(3.5) },
  statLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '700', marginBottom: spacing(1.5) },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  statValueSm: { fontSize: 12, fontWeight: '700', color: colors.text },
  rationaleCard: { backgroundColor: colors.brandLight, borderColor: colors.brand },
  rationaleLabel: { fontWeight: '700', color: colors.brandDark, fontSize: 12, marginBottom: spacing(1.5) },
  rationaleText: { fontSize: 12, color: colors.text, lineHeight: 18 },
  sourceTag: { fontSize: 10, color: colors.textMuted, marginTop: spacing(2), fontStyle: 'italic' },
  label: { fontSize: 13, fontWeight: '700', color: colors.brandDark, marginBottom: spacing(1) },
  subtitle: { color: colors.textMuted, fontSize: 12, marginBottom: spacing(3) },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: spacing(3),
    paddingHorizontal: spacing(3), paddingVertical: spacing(2.5), fontSize: 14, color: colors.text, backgroundColor: colors.bg, marginBottom: spacing(3),
  },
  primaryBtn: { backgroundColor: colors.brand, borderRadius: spacing(3), paddingVertical: spacing(3), alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  errorText: { color: colors.danger, fontSize: 12, marginTop: spacing(2), textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing(3) },
  dayRow: { marginBottom: spacing(3) },
  dayPill: { borderWidth: 1, borderColor: colors.border, borderRadius: spacing(3), paddingVertical: spacing(1.5), paddingHorizontal: spacing(3.5), marginRight: spacing(2), backgroundColor: colors.chip },
  dayPillActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  dayPillText: { fontSize: 12, fontWeight: '700', color: colors.text },
  dayPillTextActive: { color: '#fff' },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing(2) },
  mealType: { fontSize: 10, fontWeight: '800', color: colors.brandDark, textTransform: 'uppercase' },
  mealCuisine: { fontSize: 11, color: colors.textMuted, fontWeight: '700' },
  mealTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing(1) },
  mealNote: { fontSize: 12, color: colors.textMuted, marginBottom: spacing(3) },
  mealFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing(2.5) },
  mealCalories: { fontSize: 12, fontWeight: '700', color: '#ea580c' },
  mealMacros: { fontSize: 11, color: colors.textMuted },
  groceryGroup: { marginBottom: spacing(3) },
  groceryCategory: { fontSize: 11, fontWeight: '800', color: colors.brandDark, textTransform: 'uppercase', marginBottom: spacing(1.5) },
  groceryItem: { fontSize: 12, color: colors.text, marginBottom: spacing(0.5) },
});
