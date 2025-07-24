'use client';

import {
  Dispatch,
  SetStateAction,
  ChangeEvent,
  useState,
  useEffect
} from 'react';
import { useMosaicStore } from '@/store/mosaicStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useModalStore } from '@/store/modalStore';
import distyles from './designerId.module.css';

const ImgPosition = ['bottom', ' top', 'left', 'right', 'center'] as const;

interface ImgTypeParameter {
  mosaicId: string;
  openDataProperty: boolean;
  setOpenDataProperty: Dispatch<SetStateAction<boolean>>;
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
}

export default function ImgType({
  mosaicId,
  openDataProperty,
  setOpenDataProperty,
  openModal,
  setOpenModal
}: ImgTypeParameter) {
  const { mosaicProperty } = useMosaicStore();
  const { unit, setUnit } = useDashboardStore();
  const { callerId, setCallerId, setModal } = useModalStore();
  const [imgPosition, setImgPosition] =
    useState<(typeof ImgPosition)[number]>('center');

  useEffect(() => {
    const prevUnit = JSON.parse(JSON.stringify(unit));
    prevUnit[mosaicId].type = 'none';
    setUnit(prevUnit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mosaicProperty === mosaicId) setCallerId(mosaicId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mosaicProperty, mosaicId]);

  useEffect(() => {
    if (!openModal || callerId !== mosaicId) return;
    setModal(<ImgModal />);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  function ImgModal() {
    const [modalImg, setModalImg] = useState<string | null>(
      typeof unit[mosaicId].property.receivedImg === 'string'
        ? unit[mosaicId].property.receivedImg
        : null
    );

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
      if (modalImg) {
        const prevUnit = JSON.parse(JSON.stringify(unit));
        prevUnit[mosaicId].property.receivedImg = modalImg;
        setUnit(prevUnit);
      }
    }

    return (
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
  }

  return (
    <>
      {mosaicProperty === mosaicId && openDataProperty ? (
        <div
          className={distyles.openProperty}
          onClick={e => e.stopPropagation()}>
          <div className={distyles.title}>
            <div>속성</div>
            <div
              className={distyles.close}
              onClick={() => setOpenDataProperty(false)}>
              X
            </div>
          </div>
          <div className={distyles.propertySection}>
            <h5>이미지</h5>
            <div
              className={distyles.propertyOpenBox}
              onClick={() => setOpenModal(true)}>
              이미지 업로드
            </div>
          </div>
          <div className={distyles.propertySection}>
            <h5>이미지 위치</h5>
            {ImgPosition.map(item => (
              <div
                key={item}
                className={`${distyles.propertyOpenBox} ${distyles.selectedData}`}
                onClick={() => setImgPosition(item)}>
                {item}
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div className={distyles.mosaicImgBox}>
        {unit[mosaicId].property.receivedImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={distyles.mosaicImg}
            src={unit[mosaicId].property.receivedImg as string}
            alt="Image"
            style={{ objectPosition: imgPosition }} />
        ) : null}
      </div>
    </>
  );
}
