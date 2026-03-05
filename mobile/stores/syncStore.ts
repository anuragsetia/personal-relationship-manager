import { create } from 'zustand';

type SyncStatus = 'idle' | 'syncing' | 'error' | 'success';

type SyncState = {
  status: SyncStatus;
  lastSyncAt: number | null;
  errorMessage: string | undefined;
  setStatus: (status: SyncStatus, errorMessage?: string) => void;
  setLastSyncAt: (timestamp: number) => void;
};

export const useSyncStore = create<SyncState>((set) => ({
  status: 'idle',
  lastSyncAt: null,
  errorMessage: undefined,
  setStatus: (status, errorMessage = undefined) => set({ status, errorMessage }),
  setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
}));
