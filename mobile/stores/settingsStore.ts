import { create } from 'zustand';

export type AIProvider = 'claude' | 'openai' | 'gemini';

type SettingsState = {
  aiProvider: AIProvider;
  aiModel: string;
  defaultReminderDays: number;
  setAIProvider: (provider: AIProvider) => void;
  setAIModel: (model: string) => void;
  setDefaultReminderDays: (days: number) => void;
};

const DEFAULT_MODELS: Record<AIProvider, string> = {
  claude: 'claude-opus-4-6',
  openai: 'gpt-4o',
  gemini: 'gemini-2.0-flash',
};

export const useSettingsStore = create<SettingsState>((set) => ({
  aiProvider: 'claude',
  aiModel: DEFAULT_MODELS.claude,
  defaultReminderDays: 7,
  setAIProvider: (aiProvider) =>
    set({ aiProvider, aiModel: DEFAULT_MODELS[aiProvider] }),
  setAIModel: (aiModel) => set({ aiModel }),
  setDefaultReminderDays: (defaultReminderDays) => set({ defaultReminderDays }),
}));

export { DEFAULT_MODELS };
