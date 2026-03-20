import { create } from 'zustand';
import type { LifePhase } from '@/constants/lifePhases';
import { loadUserProfile, saveUserProfile } from '@/lib/db/userProfile';

export type AIProvider = 'claude' | 'openai' | 'gemini';

type SettingsState = {
  // AI
  aiProvider: AIProvider;
  aiModel: string;
  defaultReminderDays: number;
  // User profile
  lifePhase: LifePhase;
  institutionName: string;
  context1: string;
  context2: string;
  profileLoaded: boolean;
  // Actions
  setAIProvider: (provider: AIProvider) => void;
  setAIModel: (model: string) => void;
  setDefaultReminderDays: (days: number) => void;
  setLifePhase: (phase: LifePhase) => void;
  setInstitutionName: (name: string) => void;
  setContext1: (value: string) => void;
  setContext2: (value: string) => void;
  loadProfile: () => Promise<void>;
  saveProfile: (patch: Partial<{ lifePhase: LifePhase; institutionName: string; context1: string; context2: string }>) => Promise<void>;
};

const DEFAULT_MODELS: Record<AIProvider, string> = {
  claude: 'claude-opus-4-6',
  openai: 'gpt-4o',
  gemini: 'gemini-2.0-flash',
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  aiProvider: 'claude',
  aiModel: DEFAULT_MODELS.claude,
  defaultReminderDays: 7,
  lifePhase: 'professional',
  institutionName: '',
  context1: '',
  context2: '',
  profileLoaded: false,

  setAIProvider: (aiProvider) => set({ aiProvider, aiModel: DEFAULT_MODELS[aiProvider] }),
  setAIModel: (aiModel) => set({ aiModel }),
  setDefaultReminderDays: (defaultReminderDays) => set({ defaultReminderDays }),
  setLifePhase: (lifePhase) => set({ lifePhase }),
  setInstitutionName: (institutionName) => set({ institutionName }),
  setContext1: (context1) => set({ context1 }),
  setContext2: (context2) => set({ context2 }),

  loadProfile: async () => {
    if (get().profileLoaded) return;
    const profile = await loadUserProfile();
    set({ ...profile, profileLoaded: true });
  },

  saveProfile: async (patch) => {
    set(patch);
    await saveUserProfile(patch);
  },
}));

export { DEFAULT_MODELS };
