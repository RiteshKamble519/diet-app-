import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DietPlan, PlannerProfile } from "./types";

export const defaultProfile: PlannerProfile = {
  gender: "female",
  age: 32,
  heightCm: 165,
  weightKg: 64,
  activity: "moderate",
  goal: "maintain",
  mealsPerDay: 3,
  conditions: [],
  excludedFoods: [],
  foodPrefs: [],
  cuisines: [],
  customCuisines: [],
  cheatInterval: 7,
  durationDays: 7,
  monthCycle: false,
  customInstructions: "",
};

type PlannerState = {
  hydrated: boolean;
  theme: "light" | "dark";
  step: 1 | 2 | 3 | 4;
  profile: PlannerProfile;
  heightUnit: "cm" | "ft";
  weightUnit: "kg" | "lbs";
  plan: DietPlan | null;
  selectedDayIndex: number;
  groceryChecked: Record<string, boolean>;
  generating: boolean;
  refining: boolean;
  error: string | null;
  setHydrated: (v: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
  setStep: (step: 1 | 2 | 3 | 4) => void;
  patchProfile: (patch: Partial<PlannerProfile>) => void;
  setHeightUnit: (unit: "cm" | "ft") => void;
  setWeightUnit: (unit: "kg" | "lbs") => void;
  setPlan: (plan: DietPlan | null) => void;
  setSelectedDayIndex: (i: number) => void;
  toggleGrocery: (key: string) => void;
  setGenerating: (v: boolean) => void;
  setRefining: (v: boolean) => void;
  setError: (error: string | null) => void;
  applyPreset: (profile: Partial<PlannerProfile>) => void;
  resetProfile: () => void;
};

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      hydrated: false,
      theme: "light",
      step: 1,
      profile: defaultProfile,
      heightUnit: "cm",
      weightUnit: "kg",
      plan: null,
      selectedDayIndex: 0,
      groceryChecked: {},
      generating: false,
      refining: false,
      error: null,
      setHydrated: (hydrated) => set({ hydrated }),
      setTheme: (theme) => set({ theme }),
      setStep: (step) => set({ step }),
      patchProfile: (patch) =>
        set((s) => ({ profile: { ...s.profile, ...patch } })),
      setHeightUnit: (heightUnit) => set({ heightUnit }),
      setWeightUnit: (weightUnit) => set({ weightUnit }),
      setPlan: (plan) =>
        set({
          plan,
          selectedDayIndex: 0,
          groceryChecked: {},
          error: null,
        }),
      setSelectedDayIndex: (selectedDayIndex) => set({ selectedDayIndex }),
      toggleGrocery: (key) =>
        set((s) => ({
          groceryChecked: {
            ...s.groceryChecked,
            [key]: !s.groceryChecked[key],
          },
        })),
      setGenerating: (generating) => set({ generating }),
      setRefining: (refining) => set({ refining }),
      setError: (error) => set({ error }),
      applyPreset: (patch) =>
        set((s) => ({
          profile: { ...s.profile, ...patch },
          step: 1,
        })),
      resetProfile: () =>
        set({
          profile: defaultProfile,
          plan: null,
          step: 1,
          groceryChecked: {},
          error: null,
        }),
    }),
    {
      name: "nutricraft-planner",
      skipHydration: true,
      partialize: (s) => ({
        theme: s.theme,
        step: s.step,
        profile: s.profile,
        heightUnit: s.heightUnit,
        weightUnit: s.weightUnit,
        plan: s.plan,
        selectedDayIndex: s.selectedDayIndex,
        groceryChecked: s.groceryChecked,
      }),
    },
  ),
);
