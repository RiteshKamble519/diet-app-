import type {
  ActivityLevel,
  DietPattern,
  DietPref,
  Gender,
  Goal,
  NutritionTargets,
  PlannerProfile,
} from "./types";

const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function mifflinStJeorBmr(input: {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  age: number;
}): number {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  if (input.gender === "male") return Math.round(base + 5);
  if (input.gender === "female") return Math.round(base - 161);
  return Math.round(base - 78);
}

export function resolveDietPattern(prefs: DietPref[]): {
  pattern: DietPattern;
  note: string;
} {
  const set = new Set(prefs);
  if (set.has("vegan")) {
    return {
      pattern: "vegan",
      note: "Vegan overrides other diet picks. No animal products, dairy, or eggs.",
    };
  }
  if (set.has("vegetarian") && set.has("non_vegetarian")) {
    return {
      pattern: "flexitarian",
      note: "Vegetarian plus non-vegetarian: mostly plants, with some fish, poultry, or meat.",
    };
  }
  if (set.has("vegetarian")) {
    return {
      pattern: "vegetarian",
      note: "Lacto-ovo vegetarian. Dairy and eggs allowed. No meat or fish.",
    };
  }
  if (set.has("non_vegetarian")) {
    return {
      pattern: "omnivore",
      note: "Omnivore. Mix of plants, dairy, eggs, fish, poultry, and meat.",
    };
  }
  return {
    pattern: "omnivore",
    note: "No diet selected yet. Choose at least one preference.",
  };
}

export function computeTargets(profile: PlannerProfile): NutritionTargets {
  const bmr = mifflinStJeorBmr(profile);
  const tdee = Math.round(bmr * ACTIVITY_FACTOR[profile.activity]);
  const raw =
    profile.goal === "lose" ? tdee - 400 : profile.goal === "gain" ? tdee + 300 : tdee;
  const calories = Math.max(1400, Math.min(4200, raw));

  const proteinPerKg =
    profile.goal === "lose" ? 2.0 : profile.goal === "gain" ? 1.8 : 1.6;
  const proteinG = Math.round(
    Math.min(profile.weightKg * proteinPerKg, (calories * 0.4) / 4),
  );
  const fatG = Math.round((calories * 0.28) / 9);
  const carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4));
  const bmi = Number((profile.weightKg / (profile.heightCm / 100) ** 2).toFixed(1));
  const diet = resolveDietPattern(profile.foodPrefs);

  return {
    bmr,
    tdee,
    calories,
    proteinG,
    carbsG,
    fatG,
    bmi,
    dietPattern: diet.pattern,
    dietPatternNote: diet.note,
  };
}

export function cmToFtIn(cm: number): { ft: number; inch: number } {
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inch = Math.round(totalIn - ft * 12);
  if (inch === 12) return { ft: ft + 1, inch: 0 };
  return { ft, inch };
}

export function ftInToCm(ft: number, inch: number): number {
  return Math.round(ft * 30.48 + inch * 2.54);
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462);
}

export function lbsToKg(lbs: number): number {
  return Math.round(lbs * 0.453592 * 10) / 10;
}

export function bmiLabel(bmi: number): string {
  if (bmi < 18.5) return "Underweight range";
  if (bmi < 25) return "Healthy range";
  if (bmi < 30) return "Overweight range";
  return "Obesity range";
}
