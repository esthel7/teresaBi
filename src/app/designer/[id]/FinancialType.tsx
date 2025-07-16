'use client';

import { Dispatch, SetStateAction, RefObject } from 'react';

interface FinancialTypeParameter {
  inventory: RefObject<Record<string, number>>;
  inventoryFormat: RefObject<Record<string, string>>;
  originalDataSource: RefObject<(string | number)[][]>;
  mosaicProperty: string | null;
  mosaicId: string;
  chartBoxRef: RefObject<HTMLDivElement | null>;
  openDataProperty: boolean;
  setOpenDataProperty: Dispatch<SetStateAction<boolean>>;
  openShareProperty: boolean;
  setOpenShareProperty: Dispatch<SetStateAction<boolean>>;
}

export default function FinancialType({
  inventory,
  originalDataSource,
  inventoryFormat,
  mosaicProperty,
  mosaicId,
  chartBoxRef,
  openDataProperty,
  setOpenDataProperty,
  openShareProperty,
  setOpenShareProperty
}: FinancialTypeParameter) {
  return <></>;
}
