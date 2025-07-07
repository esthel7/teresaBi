'use client';

import { Dispatch, SetStateAction, ReactNode } from 'react';
import distyles from './designerId.module.css';

interface ImgTypeParameter {
  mosaicProperty: string | null;
  mosaicId: string;
  openDataProperty: boolean;
  setOpenDataProperty: Dispatch<SetStateAction<boolean>>;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  setModalNode: Dispatch<SetStateAction<ReactNode>>;
}

export default function ImgType({
  mosaicProperty,
  mosaicId,
  openDataProperty,
  setOpenDataProperty,
  setOpenModal,
  setModalNode
}: ImgTypeParameter) {
  function viewModal() {
    setOpenModal(true);
    setModalNode(
      <div className={distyles.modalItem}>
        modal
        <div onClick={() => setOpenModal(false)}>X</div>
      </div>
    );
  }

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
            <div className={distyles.propertyOpenBox} onClick={viewModal}>
              이미지 업로드
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
