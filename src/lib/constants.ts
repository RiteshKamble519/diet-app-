import type { ActivityLevel, DietPref, DurationDays, Goal } from "./types";

export const CONDITION_OPTIONS = [
  "Type 2 Diabetes",
  "Hypertension (High BP)",
  "High Cholesterol",
  "Celiac Disease (Gluten Intolerance)",
  "Irritable Bowel Syndrome (IBS)",
  "Polycystic Ovary Syndrome (PCOS)",
  "Hypothyroidism",
  "GERD / Acid Reflux",
  "Gout (High Uric Acid)",
  "Lactose Intolerance",
  "Nut Allergy (Peanuts/Tree Nuts)",
  "Anemia",
  "Chronic Kidney Disease",
  "Fatty Liver",
] as const;

export const CUISINE_OPTIONS = [
  "Indian",
  "Italian",
  "Mexican",
  "Mediterranean",
  "Thai",
  "Middle Eastern",
  "Japanese",
  "Chinese",
  "Greek",
  "Continental",
] as const;

export const DIET_OPTIONS: {
  id: DietPref;
  title: string;
  desc: string;
}[] = [
  {
    id: "vegetarian",
    title: "Vegetarian",
    desc: "Plants, legumes, dairy and eggs. No meat or fish.",
  },
  {
    id: "non_vegetarian",
    title: "Non-vegetarian",
    desc: "Poultry, fish, meat, plus plants and dairy.",
  },
  {
    id: "vegan",
    title: "Vegan",
    desc: "Only plant foods. No animal products or dairy.",
  },
];

export const ACTIVITY_OPTIONS: {
  id: ActivityLevel;
  title: string;
  desc: string;
}[] = [
  { id: "sedentary", title: "Sedentary", desc: "Desk work, little exercise" },
  { id: "light", title: "Light", desc: "Walks, 1–3 workouts a week" },
  { id: "moderate", title: "Moderate", desc: "3–5 workouts a week" },
  { id: "active", title: "Active", desc: "Daily training" },
  { id: "very_active", title: "Very active", desc: "Physical job or two-a-days" },
];

export const GOAL_OPTIONS: { id: Goal; title: string; desc: string }[] = [
  { id: "lose", title: "Lose", desc: "Steady deficit" },
  { id: "maintain", title: "Maintain", desc: "Hold weight" },
  { id: "gain", title: "Gain", desc: "Lean surplus" },
];

export const DURATION_OPTIONS: {
  days: DurationDays;
  monthCycle: boolean;
  title: string;
  desc: string;
}[] = [
  { days: 3, monthCycle: false, title: "3 days", desc: "Quick start" },
  { days: 7, monthCycle: false, title: "7 days", desc: "Full week" },
  { days: 7, monthCycle: true, title: "30-day cycle", desc: "Repeat the week" },
];

export const QUICK_EXCLUSIONS = [
  "Mushrooms",
  "Eggplant",
  "Cilantro",
  "Bell peppers",
  "Olives",
  "Seafood",
];

export const GROCERY_LABELS: Record<
  "produce" | "proteins" | "grains" | "dairy" | "pantry" | "spices",
  string
> = {
  produce: "Produce",
  proteins: "Proteins",
  grains: "Grains & legumes",
  dairy: "Dairy & alternatives",
  pantry: "Pantry",
  spices: "Spices & oils",
};
