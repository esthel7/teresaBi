import { create } from 'zustand';

interface DashboardType {
  unit: { [key: string]: DashboardUnitType };
  setUnit: (unit: { [key: string]: DashboardUnitType }) => void;
  sources: string[];
  setSources: (sources: string[]) => void;
}

export const useDashboardStore = create<DashboardType>(set => ({
  unit: {},
  setUnit: unit => set({ unit }),
  sources: [],
  setSources: sources => set({ sources })
}));
