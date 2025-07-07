'use client';

import {
  Dispatch,
  SetStateAction,
  ReactNode,
  ChangeEvent,
  useState,
  useEffect
} from 'react';
import distyles from './designerId.module.css';

interface ImgTypeParameter {
  mosaicProperty: string | null;
  mosaicId: string;
  openDataProperty: boolean;
  setOpenDataProperty: Dispatch<SetStateAction<boolean>>;
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  setModalNode: Dispatch<SetStateAction<ReactNode>>;
}

export default function ImgType({
  mosaicProperty,
  mosaicId,
  openDataProperty,
  setOpenDataProperty,
  openModal,
  setOpenModal,
  setModalNode
}: ImgTypeParameter) {
  const [modalImg, setModalImg] = useState<string | null>(null);
  const [receivedImg, setReceivedImg] = useState<string | null>(null);

  useEffect(() => {
    if (!openModal) return;
    setModalNode(
      <div className={distyles.modalItem} onClick={e => e.stopPropagation()}>
        <div className={distyles.modalHeader}>
          <div>이미지</div>
          <div className={distyles.remove} onClick={closeModal}>
            X
          </div>
        </div>
        <div className={distyles.modalBody}>
          <input type="file" accept="image/*" onChange={handleImgFile} />
          {modalImg ? (
            <div className={distyles.modalImgBox}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={distyles.modalImg} src={modalImg} alt="Image" />
            </div>
          ) : null}
          <div className={distyles.modalConfirm} onClick={confirmModal}>
            확인
          </div>
        </div>
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal, modalImg]);

  function handleImgFile(e: ChangeEvent<HTMLInputElement>) {
    setModalImg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setModalImg(reader.result as string);
    };
  }

  function closeModal() {
    setOpenModal(false);
    setModalImg(null);
  }

  function confirmModal() {
    setOpenModal(false);
    if (modalImg) setReceivedImg(modalImg);
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
            <div
              className={distyles.propertyOpenBox}
              onClick={() => setOpenModal(true)}
            >
              이미지 업로드
            </div>
          </div>
        </div>
      ) : null}
      <div className={distyles.mosaicImgBox}>
        {receivedImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={distyles.mosaicImg} src={receivedImg} alt="Image" />
        ) : null}
      </div>
    </>
  );
}
