export type Profile = {
  gender: string;
  age: number;
  heightCm: number;
  weightKg: number;
  conditions: string[];
  excludedFoods: string[];
  foodPrefs: string[];
  cuisines: string[];
  cheatInterval: number;
  duration: string;
  customInstructions: string;
};

export type Meal = {
  type: string;
  time?: string;
  title: string;
  cuisine?: string;
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  ingredients: string[];
  instructions: string;
  healthNote?: string;
};

export type PlanDay = {
  dayNumber: number;
  isCheatDay?: boolean;
  totalCalories: number;
  meals: Meal[];
};

export type Plan = {
  summary: {
    dailyCalorieTarget: number;
    proteinGrams: number;
    carbsGrams: number;
    fatsGrams: number;
    safetyRationale: string;
  };
  days: PlanDay[];
  groceryList: Record<string, string[]>;
};
