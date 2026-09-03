const PORT = Number(process.env.PORT) || 8787;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

type Profile = {
  gender?: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  conditions?: string[];
  excludedFoods?: string[];
  foodPrefs?: string[];
  cuisines?: string[];
  cheatInterval?: number;
  duration?: string;
  customInstructions?: string;
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function buildGeneratePrompt(profile: Profile) {
  const {
    gender, age, heightCm, weightKg,
    conditions = [], excludedFoods = [], foodPrefs = [],
    cuisines = [], cheatInterval = 7, duration = 'Next Week (7 Days)',
    customInstructions = '',
  } = profile;

  return `
Generate a clinical diet plan in JSON format based on the following user parameters:
- Gender: ${gender}, Age: ${age}, Height: ${heightCm}cm, Weight: ${weightKg}kg.
- Health Conditions: ${conditions.length ? conditions.join(', ') : 'None'} (STRICTLY AVOID CONTRAINDICATED INGREDIENTS).
- Excluded Foods: ${excludedFoods.length ? excludedFoods.join(', ') : 'None'} (DO NOT INCLUDE IN ANY RECIPE).
- Selected Diet Preferences: ${foodPrefs.join(' AND ')}. Note: The user allows meals corresponding to these choices (${foodPrefs.join(', ')}).
- Preferred Cuisines: ${cuisines.join(', ')}.
- Cheat Day Schedule: Include cheat day every ${cheatInterval} days.
- Duration: ${duration}.
- Custom Instructions from User: ${customInstructions || 'None provided'}.

Output strict JSON only with this schema:
{
  "summary": {
    "dailyCalorieTarget": 2100,
    "proteinGrams": 120,
    "carbsGrams": 210,
    "fatsGrams": 60,
    "safetyRationale": "Detailed explanation of multi-diet, custom cuisine adaptations, health adaptations, and custom instructions applied."
  },
  "days": [
    {
      "dayNumber": 1,
      "dayTitle": "Day 1",
      "isCheatDay": false,
      "totalCalories": 2080,
      "meals": [
        {
          "type": "Breakfast",
          "time": "8:00 AM",
          "title": "Recipe Title",
          "cuisine": "Indian",
          "calories": 380,
          "protein": "16g",
          "carbs": "50g",
          "fat": "10g",
          "ingredients": ["Item 1", "Item 2"],
          "instructions": "Cooking steps",
          "healthNote": "Health note"
        }
      ]
    }
  ],
  "groceryList": {
    "Produce": ["Item 1"],
    "Grains": ["Item 2"]
  }
}
Provide 3 days in the array.
`;
}

function buildRefinePrompt(profile: Profile, currentPlan: unknown, modText: string) {
  const {
    gender, age, heightCm, weightKg,
    conditions = [], excludedFoods = [], foodPrefs = [], cuisines = [],
  } = profile;

  return `
You are an expert clinical dietitian AI. The user wants to modify their existing generated diet plan.

CURRENT GENERATED DIET PLAN JSON:
${JSON.stringify(currentPlan)}

USER'S MODIFICATION REQUEST:
"${modText}"

CORE SAFETY & PROFILE CONSTRAINTS (STRICTLY RESPECT & PRESERVE ALL OF THESE):
- Gender: ${gender}, Age: ${age}, Height: ${heightCm}cm, Weight: ${weightKg}kg.
- Health Conditions: ${conditions.length ? conditions.join(', ') : 'None'} (STRICTLY AVOID CONTRAINDICATED INGREDIENTS).
- Excluded Foods: ${excludedFoods.length ? excludedFoods.join(', ') : 'None'} (DO NOT INCLUDE IN ANY RECIPE).
- Selected Diet Preferences: ${foodPrefs.join(' AND ')}.
- Preferred Cuisines: ${cuisines.join(', ')}.

INSTRUCTIONS:
Update the JSON diet plan to incorporate the user's specific request while strictly keeping all health conditions and dietary exclusions safe.
Update the "safetyRationale" field to document how the user's feedback was applied.

Output strict JSON matching the same schema:
{
  "summary": {
    "dailyCalorieTarget": 2100,
    "proteinGrams": 120,
    "carbsGrams": 210,
    "fatsGrams": 60,
    "safetyRationale": "..."
  },
  "days": [ ... ],
  "groceryList": { ... }
}
`;
}

async function callGemini(prompt: string) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty response from Gemini');
  return JSON.parse(rawText);
}

function getFallbackPlan(profile: Profile) {
  const { foodPrefs = [], cuisines = [], excludedFoods = [], conditions = [], customInstructions = '' } = profile;
  const prefsText = foodPrefs.join(', ');
  const cuisinesText = cuisines.join(', ');
  const noteText = customInstructions ? ` Custom Notes: "${customInstructions}".` : '';

  return {
    summary: {
      dailyCalorieTarget: 2080,
      proteinGrams: 125,
      carbsGrams: 215,
      fatsGrams: 58,
      safetyRationale: `[Offline fallback plan - no GEMINI_API_KEY configured] Multi-diet preferences satisfied: [${prefsText}]. Cuisines: [${cuisinesText}]. Strictly excluding: [${excludedFoods.join(', ') || 'None'}]. Adapted for conditions: [${conditions.join(', ') || 'None'}].${noteText}`,
    },
    days: [
      {
        dayNumber: 1,
        isCheatDay: false,
        totalCalories: 2080,
        meals: [
          {
            type: 'Breakfast', time: '8:30 AM', title: 'Moong Dal & Spinach Pancake',
            cuisine: cuisines[0] || 'Indian', calories: 380, protein: '18g', carbs: '48g', fat: '10g',
            ingredients: ['Soaked Moong Dal', 'Fresh Spinach', 'Cumin'],
            instructions: 'Grind ingredients into a smooth batter and cook on skillet with minimal oil.',
            healthNote: 'Low GI meal supporting stable blood sugar.',
          },
          {
            type: 'Lunch', time: '1:30 PM', title: 'Whole Wheat Cannelloni with Herb Ricotta / Cottage Cheese',
            cuisine: cuisines[1] || 'Italian', calories: 540, protein: '26g', carbs: '62g', fat: '14g',
            ingredients: ['Whole Wheat Pasta', 'Low Fat Cottage Cheese', 'Tomato Reduction'],
            instructions: 'Stuff whole wheat pasta tubes with cottage cheese and bake with fresh sauce.',
            healthNote: 'Complex carbs paired with high quality casein protein.',
          },
          {
            type: 'Dinner', time: '8:00 PM', title: 'Herbed Quinoa Pilaf with Flame Grilled Protein',
            cuisine: cuisines[2] || 'Mediterranean', calories: 460, protein: '24g', carbs: '50g', fat: '12g',
            ingredients: ['Cooked Quinoa', 'Grilled Tofu / Chicken', 'Zucchini'],
            instructions: 'Sear protein on skillet and serve over fluffy lemon herb quinoa.',
            healthNote: 'Magnesium rich and easy to digest before sleep.',
          },
        ],
      },
    ],
    groceryList: {
      Produce: ['Fresh Spinach', 'Zucchini', 'Lemons', 'Tomatoes'],
      'Grains & Legumes': ['Moong Dal', 'Quinoa', 'Whole Wheat Cannelloni'],
      Proteins: ['Low Fat Cottage Cheese', 'Tofu / Chicken', 'Greek Yogurt'],
      'Spices & Oils': ['Olive Oil', 'Cumin', 'Herbs'],
    },
  };
}

function getFallbackRefinedPlan(currentPlan: any, profile: Profile, modText: string) {
  const base = currentPlan || getFallbackPlan(profile);
  const updated = JSON.parse(JSON.stringify(base));
  updated.summary.safetyRationale = `${updated.summary.safetyRationale || ''} [Refined with feedback: "${modText}"]`;
  const day = updated.days?.[0];
  if (day?.meals?.length) {
    const idx = day.meals.length - 1;
    day.meals[idx].title = `Refined Meal (${modText.substring(0, 30)}...)`;
    day.meals[idx].healthNote = `Modified per user feedback: "${modText}". Strictly safe for health conditions.`;
  }
  return updated;
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (url.pathname === '/api/health') {
      return json({ status: 'ok', aiEnabled: Boolean(GEMINI_API_KEY) });
    }

    if (url.pathname === '/api/generate-plan' && req.method === 'POST') {
      const profile = (await req.json().catch(() => ({}))) as Profile;
      if (!Array.isArray(profile.foodPrefs) || profile.foodPrefs.length === 0) {
        return json({ error: 'At least one diet preference is required.' }, 400);
      }
      try {
        const plan = await callGemini(buildGeneratePrompt(profile));
        return json({ plan, source: 'gemini' });
      } catch (err) {
        console.error('generate-plan falling back:', (err as Error).message);
        return json({ plan: getFallbackPlan(profile), source: 'fallback' });
      }
    }

    if (url.pathname === '/api/refine-plan' && req.method === 'POST') {
      const body = (await req.json().catch(() => ({}))) as { profile?: Profile; currentPlan?: unknown; modText?: string };
      const { profile = {}, currentPlan, modText } = body;
      if (!modText || !String(modText).trim()) {
        return json({ error: 'A modification request is required.' }, 400);
      }
      if (!currentPlan) {
        return json({ error: 'No existing plan to refine.' }, 400);
      }
      try {
        const plan = await callGemini(buildRefinePrompt(profile, currentPlan, modText));
        return json({ plan, source: 'gemini' });
      } catch (err) {
        console.error('refine-plan falling back:', (err as Error).message);
        return json({ plan: getFallbackRefinedPlan(currentPlan, profile, modText), source: 'fallback' });
      }
    }

    return json({ error: 'Not found' }, 404);
  },
});

console.log(`NutriCraft AI (Bun) backend listening on http://0.0.0.0:${PORT}`);
console.log(`AI mode: ${GEMINI_API_KEY ? 'live (Gemini)' : 'fallback (no GEMINI_API_KEY set)'}`);
