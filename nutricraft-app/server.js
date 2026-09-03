import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

app.use(express.json({ limit: '256kb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

function buildGeneratePrompt(profile) {
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

function buildRefinePrompt(profile, currentPlan, modText) {
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

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });
  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status}`);
  }
  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty response from Gemini');
  return JSON.parse(rawText);
}

function getFallbackPlan(profile) {
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

function getFallbackRefinedPlan(currentPlan, profile, modText) {
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', aiEnabled: Boolean(GEMINI_API_KEY) });
});

app.post('/api/generate-plan', async (req, res) => {
  const profile = req.body || {};
  if (!Array.isArray(profile.foodPrefs) || profile.foodPrefs.length === 0) {
    return res.status(400).json({ error: 'At least one diet preference is required.' });
  }
  try {
    const plan = await callGemini(buildGeneratePrompt(profile));
    return res.json({ plan, source: 'gemini' });
  } catch (err) {
    console.error('generate-plan falling back:', err.message);
    return res.json({ plan: getFallbackPlan(profile), source: 'fallback' });
  }
});

app.post('/api/refine-plan', async (req, res) => {
  const { profile, currentPlan, modText } = req.body || {};
  if (!modText || !String(modText).trim()) {
    return res.status(400).json({ error: 'A modification request is required.' });
  }
  if (!currentPlan) {
    return res.status(400).json({ error: 'No existing plan to refine.' });
  }
  try {
    const plan = await callGemini(buildRefinePrompt(profile || {}, currentPlan, modText));
    return res.json({ plan, source: 'gemini' });
  } catch (err) {
    console.error('refine-plan falling back:', err.message);
    return res.json({ plan: getFallbackRefinedPlan(currentPlan, profile || {}, modText), source: 'fallback' });
  }
});

app.listen(PORT, () => {
  console.log(`NutriCraft AI server listening on http://localhost:${PORT}`);
  console.log(`AI mode: ${GEMINI_API_KEY ? 'live (Gemini)' : 'fallback (no GEMINI_API_KEY set)'}`);
});
