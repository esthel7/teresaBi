'use client';

import { Dispatch, SetStateAction } from 'react';
import distyles from './designerId.module.css';

interface ImgTypeParameter {
  mosaicProperty: string | null;
  mosaicId: string;
  openDataProperty: boolean;
  setOpenDataProperty: Dispatch<SetStateAction<boolean>>;
}

export default function ImgType({
  mosaicProperty,
  mosaicId,
  openDataProperty,
  setOpenDataProperty
}: ImgTypeParameter) {
  return (
    <>
      {mosaicProperty === mosaicId && openDataProperty ? (
        <div className={distyles.openProperty}>
          <div className={distyles.title}>
            <div>속성</div>
            <div
              className={distyles.close}
              onClick={() => setOpenDataProperty(false)}
            >
              X
            </div>
          </div>
          <div className={distyles.propertySection}>
            <h5>이미지</h5>
            <div className={distyles.propertyOpenBox}>이미지 업로드</div>
          </div>
        </div>
      ) : null}
    </>
  );
}
