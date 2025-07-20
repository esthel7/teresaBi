import { create } from 'zustand';
import { MosaicNode } from 'react-mosaic-component';

interface MosaicType {
  mosaicValue: MosaicNode<string> | null;
  setMosaicValue: (mosaicValue: MosaicNode<string> | null) => void;
  mosaicProperty: string | null;
  setMosaicProperty: (mosaicProperty: string | null) => void;
  mosaicPropertyDetail: boolean;
  setMosaicPropertyDetail: (mosaicPropertyDetail: boolean) => void;
}

export const useMosaicStore = create<MosaicType>(set => ({
  mosaicValue: null,
  setMosaicValue: mosaicValue => set({ mosaicValue }),
  mosaicProperty: null,
  setMosaicProperty: mosaicProperty => set({ mosaicProperty }),
  mosaicPropertyDetail: true,
  setMosaicPropertyDetail: mosaicPropertyDetail => set({ mosaicPropertyDetail })
}));
