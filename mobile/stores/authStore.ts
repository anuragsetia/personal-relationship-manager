import { create } from 'zustand';

export type AuthProvider = 'google' | 'apple';

export type AuthUser = {
  id: string;
  name: string | null;
  email: string | null;
  photo: string | null;
  provider: AuthProvider;
  accessToken?: string; // Google only; Apple has no Drive access
};

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: () => set({ user: null }),
}));
