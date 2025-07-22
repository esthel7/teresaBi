import { create } from 'zustand';

interface SourceType {
  source: string;
  setSource: (source: string) => void;
}

export const useSourceStore = create<SourceType>(set => ({
  source: '',
  setSource: source => set({ source }),
}));
