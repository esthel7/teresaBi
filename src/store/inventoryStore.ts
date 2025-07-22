import { create } from 'zustand';

interface InventoryType {
  inventory: Record<string, Record<string, number>>;
  setInventory: (inventory: Record<string, Record<string, number>>) => void;
  inventoryFormat: Record<string, Record<string, string>>;
  setInventoryFormat: (
    inventory: Record<string, Record<string, string>>
  ) => void;
  originalDataSource: Record<string, (string | number)[][]>;
  setOriginalDataSource: (
    inventory: Record<string, (string | number)[][]>
  ) => void;
}

export const useInventoryStore = create<InventoryType>(set => ({
  inventory: {},
  setInventory: inventory => set({ inventory }),
  inventoryFormat: {},
  setInventoryFormat: inventoryFormat => set({ inventoryFormat }),
  originalDataSource: {},
  setOriginalDataSource: originalDataSource => set({ originalDataSource })
}));
