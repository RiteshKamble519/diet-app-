import { API_BASE_URL } from './config';
import type { Plan, Profile } from './types';

export async function generatePlan(profile: Profile): Promise<{ plan: Plan; source: string }> {
  const res = await fetch(`${API_BASE_URL}/api/generate-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return res.json();
}

export async function refinePlan(
  profile: Partial<Profile>,
  currentPlan: Plan,
  modText: string
): Promise<{ plan: Plan; source: string }> {
  const res = await fetch(`${API_BASE_URL}/api/refine-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, currentPlan, modText }),
  });
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return res.json();
}
