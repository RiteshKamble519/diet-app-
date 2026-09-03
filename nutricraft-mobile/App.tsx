import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { BiometricsScreen } from './src/screens/BiometricsScreen';
import { CuisinesScreen } from './src/screens/CuisinesScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { DietPrefsScreen } from './src/screens/DietPrefsScreen';
import { StoreProvider, useStore } from './src/store';
import { colors, spacing } from './src/theme';

const STEPS: { key: 'biometrics' | 'diet' | 'cuisines' | 'dashboard'; label: string }[] = [
  { key: 'biometrics', label: '1' },
  { key: 'diet', label: '2' },
  { key: 'cuisines', label: '3' },
  { key: 'dashboard', label: '4' },
];

function Header() {
  const { step, setStep, plan } = useStore();
  return (
    <View style={styles.header}>
      <Text style={styles.brand}>
        Nutri<Text style={styles.brandAccent}>Craft</Text> AI
      </Text>
      <View style={styles.stepRow}>
        {STEPS.map((s) => {
          const disabled = s.key === 'dashboard' && !plan;
          const active = step === s.key;
          return (
            <Text
              key={s.key}
              onPress={() => !disabled && setStep(s.key)}
              style={[
                styles.stepDot,
                active && styles.stepDotActive,
                disabled && styles.stepDotDisabled,
              ]}
            >
              {s.label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

function Screens() {
  const { step } = useStore();
  if (step === 'biometrics') return <BiometricsScreen />;
  if (step === 'diet') return <DietPrefsScreen />;
  if (step === 'cuisines') return <CuisinesScreen />;
  return <DashboardScreen />;
}

export default function App() {
  return (
    <StoreProvider>
      <SafeAreaView style={styles.container}>
        <Header />
        <Screens />
        <StatusBar style="dark" />
      </SafeAreaView>
    </StoreProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing(4), paddingTop: spacing(3), paddingBottom: spacing(2),
    backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  brand: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing(2) },
  brandAccent: { color: colors.brand },
  stepRow: { flexDirection: 'row', gap: spacing(2) },
  stepDot: {
    width: 28, height: 28, borderRadius: 14, textAlign: 'center', textAlignVertical: 'center',
    backgroundColor: colors.chip, color: colors.textMuted, fontWeight: '700', fontSize: 12, overflow: 'hidden',
  },
  stepDotActive: { backgroundColor: colors.brand, color: '#fff' },
  stepDotDisabled: { opacity: 0.4 },
});
