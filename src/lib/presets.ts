import type { PlannerProfile } from "./types";

export const PRESETS: {
  id: string;
  title: string;
  blurb: string;
  patch: Partial<PlannerProfile>;
}[] = [
  {
    id: "diabetic_veg",
    title: "Diabetic vegetarian",
    blurb: "Lower GI, plant-forward, no refined sugar.",
    patch: {
      conditions: ["Type 2 Diabetes", "Hypertension (High BP)"],
      excludedFoods: ["White rice", "Refined sugar", "Sugary drinks"],
      foodPrefs: ["vegetarian"],
      cuisines: ["Indian", "Mediterranean"],
      customCuisines: [],
      goal: "lose",
      customInstructions: "Keep breakfast under 15 minutes. Emphasize high-fiber carbs.",
    },
  },
  {
    id: "flexitarian",
    title: "Flexitarian",
    blurb: "Mostly plants, some fish or poultry.",
    patch: {
      conditions: ["High Cholesterol"],
      excludedFoods: ["Processed meats"],
      foodPrefs: ["vegetarian", "non_vegetarian"],
      cuisines: ["Mediterranean", "Italian", "Indian"],
      customCuisines: ["Lebanese"],
      goal: "maintain",
      customInstructions: "Fish twice a week. Light soups for dinner.",
    },
  },
  {
    id: "pcos_vegan",
    title: "PCOS vegan",
    blurb: "High fiber, no dairy, low refined flour.",
    patch: {
      conditions: ["Polycystic Ovary Syndrome (PCOS)"],
      excludedFoods: ["Dairy milk", "Cheese", "Refined flour"],
      foodPrefs: ["vegan"],
      cuisines: ["Mediterranean", "Thai", "Mexican"],
      customCuisines: ["Korean"],
      goal: "lose",
      gender: "female",
      customInstructions: "High-fiber afternoon snack. Limit added oils.",
    },
  },
];
