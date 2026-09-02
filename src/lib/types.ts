export type Gender = "female" | "male" | "nonbinary" | "other";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type Goal = "lose" | "maintain" | "gain";
export type DietPref = "vegetarian" | "non_vegetarian" | "vegan";
export type DietPattern = "vegan" | "vegetarian" | "flexitarian" | "omnivore";
export type DurationDays = 3 | 7;
export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export type PlannerProfile = {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: Goal;
  mealsPerDay: 3 | 4;
  conditions: string[];
  excludedFoods: string[];
  foodPrefs: DietPref[];
  cuisines: string[];
  customCuisines: string[];
  cheatInterval: number;
  durationDays: DurationDays;
  monthCycle: boolean;
  customInstructions: string;
};

export type NutritionTargets = {
  bmr: number;
  tdee: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  bmi: number;
  dietPattern: DietPattern;
  dietPatternNote: string;
};

export type PlanMeal = {
  type: MealType;
  time: string;
  title: string;
  cuisine: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  ingredients: string[];
  instructions: string;
  healthNote: string;
  prepMinutes: number;
};

export type PlanDay = {
  dayNumber: number;
  title: string;
  isCheatDay: boolean;
  totalCalories: number;
  meals: PlanMeal[];
};

export type GroceryList = {
  produce: string[];
  proteins: string[];
  grains: string[];
  dairy: string[];
  pantry: string[];
  spices: string[];
};

export type DietPlan = {
  rationale: string;
  targets: NutritionTargets;
  generatedAt: string;
  days: PlanDay[];
  grocery: GroceryList;
  monthCycle: boolean;
};

export type GenerateResult =
  | { ok: true; plan: DietPlan }
  | { ok: false; error: string };
