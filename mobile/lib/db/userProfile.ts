import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { LifePhase } from '@/constants/lifePhases';

export type UserProfile = {
  lifePhase: LifePhase;
  institutionName: string;
  context1: string; // course / role / industry / domain / former role
  context2: string; // batch year / industry / business type / years exp / industry
};

const KEYS = {
  lifePhase: 'profile_life_phase',
  institutionName: 'profile_institution_name',
  context1: 'profile_context_1',
  context2: 'profile_context_2',
} as const;

async function getSetting(key: string): Promise<string | null> {
  const rows = await db.select().from(settings).where(eq(settings.key, key));
  return rows[0]?.value ?? null;
}

async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}

export async function loadUserProfile(): Promise<UserProfile> {
  const [lifePhase, institutionName, context1, context2] = await Promise.all([
    getSetting(KEYS.lifePhase),
    getSetting(KEYS.institutionName),
    getSetting(KEYS.context1),
    getSetting(KEYS.context2),
  ]);

  return {
    lifePhase: (lifePhase as LifePhase) ?? 'professional',
    institutionName: institutionName ?? '',
    context1: context1 ?? '',
    context2: context2 ?? '',
  };
}

export async function saveUserProfile(profile: Partial<UserProfile>): Promise<void> {
  const ops: Promise<void>[] = [];
  if (profile.lifePhase !== undefined) ops.push(setSetting(KEYS.lifePhase, profile.lifePhase));
  if (profile.institutionName !== undefined) ops.push(setSetting(KEYS.institutionName, profile.institutionName));
  if (profile.context1 !== undefined) ops.push(setSetting(KEYS.context1, profile.context1));
  if (profile.context2 !== undefined) ops.push(setSetting(KEYS.context2, profile.context2));
  await Promise.all(ops);
}
