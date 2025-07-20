import { create } from 'zustand';

interface InventoryType {
  inventory: Record<string, number>;
  setInventory: (inventory: Record<string, number>) => void;
  inventoryFormat: Record<string, string>;
  setInventoryFormat: (inventory: Record<string, string>) => void;
  originalDataSource: (string | number)[][];
  setOriginalDataSource: (inventory: (string | number)[][]) => void;
}

export const useInventoryStore = create<InventoryType>(set => ({
  inventory: {},
  setInventory: inventory => set({ inventory }),
  inventoryFormat: {},
  setInventoryFormat: inventoryFormat => set({ inventoryFormat }),
  originalDataSource: [],
  setOriginalDataSource: originalDataSource => set({ originalDataSource })
}));
