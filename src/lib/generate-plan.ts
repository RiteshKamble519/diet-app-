import { createServerFn } from "@tanstack/react-start";
import { computeTargets } from "./nutrition";
import { DIET_PLAN_JSON_SCHEMA } from "./plan-schema";
import type {
  DietPlan,
  GenerateResult,
  GroceryList,
  PlanDay,
  PlanMeal,
  PlannerProfile,
} from "./types";

const MODEL = "grok-4.5";
const MAX_RETRIES = 1;

type ModelPlan = {
  rationale: string;
  days: PlanDay[];
  grocery: GroceryList;
};

function buildSystemPrompt(): string {
  return [
    "You are a constraint-aware meal planner, not a clinician.",
    "Write practical home-cook meals with real ingredients and clear steps.",
    "Never invent medical treatment. Do not claim to diagnose or cure.",
    "Hard rules:",
    "- Never include excluded foods, even as garnishes or oils derived from them when the exclusion is an allergy.",
    "- Respect the resolved diet pattern exactly (vegan = no animal products; vegetarian = no meat/fish; flexitarian = mostly plants with some animal protein; omnivore = mixed).",
    "- Adapt for listed health conditions using widely accepted food patterns (e.g. lower GI for type 2 diabetes, lower sodium for hypertension, gluten-free for celiac). Stay conservative.",
    "- Daily meal calories should sum to within 10% of the calorie target. Macros should roughly match the targets.",
    "- Use the preferred cuisines. Rotate them across the week. Do not repeat the same title.",
    "- Cheat days may be more indulgent but must still obey exclusions, allergies, and the diet pattern.",
    "- Honor custom instructions when they do not conflict with safety constraints.",
    "- Keep recipes cookable in a normal kitchen. Prefer whole foods.",
    "Return only structured JSON matching the schema.",
  ].join("\n");
}

function buildUserPrompt(
  profile: PlannerProfile,
  targets: ReturnType<typeof computeTargets>,
  extra?: string,
): string {
  const cuisines = [...profile.cuisines, ...profile.customCuisines];
  const cuisineText = cuisines.length ? cuisines.join(", ") : "seasonal home cooking";
  const mealLine =
    profile.mealsPerDay === 4
      ? "4 meals per day: Breakfast, Lunch, Snack, Dinner."
      : "3 meals per day: Breakfast, Lunch, Dinner. No snacks.";

  return [
    `Person: ${profile.gender}, age ${profile.age}, ${profile.heightCm} cm, ${profile.weightKg} kg.`,
    `Activity: ${profile.activity}. Goal: ${profile.goal}.`,
    `BMI ${targets.bmi}. BMR ${targets.bmr} kcal. TDEE ${targets.tdee} kcal.`,
    `Daily targets: ${targets.calories} kcal, protein ${targets.proteinG} g, carbs ${targets.carbsG} g, fat ${targets.fatG} g.`,
    `Diet pattern: ${targets.dietPattern}. ${targets.dietPatternNote}`,
    `Health conditions: ${profile.conditions.length ? profile.conditions.join(", ") : "none listed"}.`,
    `Excluded foods (never use): ${profile.excludedFoods.length ? profile.excludedFoods.join(", ") : "none"}.`,
    `Preferred cuisines: ${cuisineText}.`,
    mealLine,
    `Plan length: exactly ${profile.durationDays} days in the days array.`,
    `Cheat day every ${profile.cheatInterval} days (day ${profile.cheatInterval}, ${profile.cheatInterval * 2}, … if they fall in range). If interval is 0, no cheat days.`,
    `Custom instructions: ${profile.customInstructions.trim() || "none"}.`,
    extra ? `Additional request: ${extra}` : "",
    "Grocery lists should cover the whole plan without excluded items.",
  ]
    .filter(Boolean)
    .join("\n");
}

function containsExcluded(plan: ModelPlan, excluded: string[]): boolean {
  if (!excluded.length) return false;
  const needles = excluded.map((e) => e.trim().toLowerCase()).filter(Boolean);
  const hay: string[] = [];
  for (const day of plan.days) {
    for (const meal of day.meals) {
      hay.push(meal.title, ...meal.ingredients, meal.instructions);
    }
  }
  for (const cat of Object.values(plan.grocery)) {
    hay.push(...cat);
  }
  const blob = hay.join(" ").toLowerCase();
  return needles.some((n) => n.length >= 3 && blob.includes(n));
}

function normalizePlan(raw: ModelPlan, expectedDays: number): ModelPlan {
  const days = (raw.days ?? []).slice(0, expectedDays).map((day, i) => ({
    ...day,
    dayNumber: i + 1,
    meals: (day.meals ?? []).map(normalizeMeal),
    totalCalories: (day.meals ?? []).reduce((s, m) => s + (m.calories || 0), 0),
  }));
  const grocery: GroceryList = {
    produce: raw.grocery?.produce ?? [],
    proteins: raw.grocery?.proteins ?? [],
    grains: raw.grocery?.grains ?? [],
    dairy: raw.grocery?.dairy ?? [],
    pantry: raw.grocery?.pantry ?? [],
    spices: raw.grocery?.spices ?? [],
  };
  return {
    rationale: raw.rationale || "Plan matched to your constraints.",
    days,
    grocery,
  };
}

function normalizeMeal(meal: PlanMeal): PlanMeal {
  return {
    type: meal.type,
    time: meal.time || "",
    title: meal.title || "Meal",
    cuisine: meal.cuisine || "",
    calories: Number(meal.calories) || 0,
    proteinG: Number(meal.proteinG) || 0,
    carbsG: Number(meal.carbsG) || 0,
    fatG: Number(meal.fatG) || 0,
    ingredients: Array.isArray(meal.ingredients) ? meal.ingredients : [],
    instructions: meal.instructions || "",
    healthNote: meal.healthNote || "",
    prepMinutes: Number(meal.prepMinutes) || 20,
  };
}

async function callGrok(messages: { role: string; content: string }[], maxTokens: number) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return { ok: false as const, error: "AI is not available in this environment." };
  }

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.6,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "diet_plan",
          schema: DIET_PLAN_JSON_SCHEMA,
          strict: true,
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 401) {
      return { ok: false as const, error: "AI is not available in this environment." };
    }
    if (res.status === 403) {
      const spent =
        body.includes("spending-limit") ||
        body.includes("credits") ||
        body.includes("subscription");
      return {
        ok: false as const,
        error: spent
          ? "Grok credits for this app are exhausted, so a live plan cannot be written right now. The server-side model is wired; it will run once credits are available."
          : "The planner could not be authorized. Try again later.",
      };
    }
    return {
      ok: false as const,
      error: `Planner service error (${res.status}). Try again in a moment.`,
    };
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = json.choices?.[0]?.message?.content;
  if (!text) return { ok: false as const, error: "The planner returned an empty plan." };

  try {
    const parsed = JSON.parse(text) as ModelPlan;
    return { ok: true as const, plan: parsed };
  } catch {
    return { ok: false as const, error: "The planner returned an unreadable plan." };
  }
}

async function generateWithModel(
  profile: PlannerProfile,
  extra?: string,
): Promise<GenerateResult> {
  const targets = computeTargets(profile);
  if (profile.foodPrefs.length === 0) {
    return { ok: false, error: "Select at least one diet preference." };
  }
  if (profile.age < 10 || profile.age > 100) {
    return { ok: false, error: "Age must be between 10 and 100." };
  }

  const maxTokens = profile.durationDays === 3 ? 4500 : 8000;
  const messages = [
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: buildUserPrompt(profile, targets, extra) },
  ];

  let lastError = "Could not generate a plan.";
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const result = await callGrok(
      attempt === 0
        ? messages
        : [
            ...messages,
            {
              role: "user",
              content:
                "The previous draft used an excluded food or failed validation. Rewrite the entire plan. Strictly omit every excluded item.",
            },
          ],
      maxTokens,
    );
    if (!result.ok) {
      lastError = result.error;
      if (result.error.includes("not available") || result.error.includes("credits")) {
        return result;
      }
      continue;
    }
    const normalized = normalizePlan(result.plan, profile.durationDays);
    if (!normalized.days.length) {
      lastError = "The planner returned no days.";
      continue;
    }
    if (containsExcluded(normalized, profile.excludedFoods) && attempt < MAX_RETRIES) {
      lastError = "Plan still contained an excluded food.";
      continue;
    }
    const plan: DietPlan = {
      ...normalized,
      targets,
      generatedAt: new Date().toISOString(),
      monthCycle: profile.monthCycle,
    };
    return { ok: true, plan };
  }
  return { ok: false, error: lastError };
}

export const generateDietPlan = createServerFn({ method: "POST" })
  .validator((input: { profile: PlannerProfile }) => input)
  .handler(async ({ data }) => generateWithModel(data.profile));

export const refineDietPlan = createServerFn({ method: "POST" })
  .validator((input: { profile: PlannerProfile; request: string; current: DietPlan }) => input)
  .handler(async ({ data }) => {
    const request = data.request.trim();
    if (!request) return { ok: false as const, error: "Describe what to change." };
    if (request.length > 500) {
      return { ok: false as const, error: "Keep the change request under 500 characters." };
    }
    const compact = {
      days: data.current.days.map((d) => ({
        dayNumber: d.dayNumber,
        isCheatDay: d.isCheatDay,
        meals: d.meals.map((m) => ({
          type: m.type,
          title: m.title,
          cuisine: m.cuisine,
          calories: m.calories,
        })),
      })),
    };
    return generateWithModel(
      data.profile,
      `Revise the existing plan. User request: "${request}". Current outline: ${JSON.stringify(compact)}. Keep unchanged meals when the request is local. Still output a full valid plan.`,
    );
  });
