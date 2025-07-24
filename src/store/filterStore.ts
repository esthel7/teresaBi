import { create } from 'zustand';

interface FilterListType {
  filterList: string[];
  setFilterList: (filterList: string[]) => void;
}

export const useFilterStore = create<FilterListType>(set => ({
  filterList: [],
  setFilterList: filterList => set({ filterList })
}));
