import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Plan, Profile } from './types';

export type Step = 'biometrics' | 'diet' | 'cuisines' | 'dashboard';

type StoreState = {
  step: Step;
  setStep: (s: Step) => void;
  profile: Profile;
  setProfile: (updater: (p: Profile) => Profile) => void;
  plan: Plan | null;
  setPlan: (p: Plan | null) => void;
  planSource: string | null;
  setPlanSource: (s: string | null) => void;
  selectedDayIndex: number;
  setSelectedDayIndex: (i: number) => void;
};

const StoreContext = createContext<StoreState | null>(null);

const initialProfile: Profile = {
  gender: 'Male',
  age: 32,
  heightCm: 175,
  weightKg: 76,
  conditions: ['Type 2 Diabetes', 'Hypertension (High BP)'],
  excludedFoods: ['Mushrooms', 'Eggplant'],
  foodPrefs: ['Vegetarian'],
  cuisines: ['Indian', 'Mediterranean'],
  cheatInterval: 7,
  duration: 'Next Week (7 Days)',
  customInstructions: '',
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState<Step>('biometrics');
  const [profile, setProfileState] = useState<Profile>(initialProfile);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [planSource, setPlanSource] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const setProfile = (updater: (p: Profile) => Profile) => setProfileState(updater);

  const value = useMemo(
    () => ({ step, setStep, profile, setProfile, plan, setPlan, planSource, setPlanSource, selectedDayIndex, setSelectedDayIndex }),
    [step, profile, plan, planSource, selectedDayIndex]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
