'use client';

import {
  Dispatch,
  ChangeEvent,
  SetStateAction,
  ReactNode,
  useEffect,
  useState
} from 'react';
import distyles from './designerId.module.css';

interface TextTypeParameter {
  mosaicProperty: string | null;
  mosaicId: string;
  openDataProperty: boolean;
  setOpenDataProperty: Dispatch<SetStateAction<boolean>>;
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  setModalNode: Dispatch<SetStateAction<ReactNode>>;
}

export default function TextType({
  mosaicProperty,
  mosaicId,
  openDataProperty,
  setOpenDataProperty,
  openModal,
  setOpenModal,
  setModalNode
}: TextTypeParameter) {
  const [putText, setPutText] = useState<string>('');
  const [writtenText, setWrittenText] = useState<string>('');

  useEffect(() => {
    if (!openModal) return;
    setModalNode(
      <div className={distyles.modalItem} onClick={e => e.stopPropagation()}>
        <textarea defaultValue={putText} onChange={e => updateText(e)} />
        <div onClick={confirmModal}>확인</div>
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal, putText]);

  function updateText(e: ChangeEvent<HTMLTextAreaElement>) {
    setPutText(e.target.value);
  }

  function confirmModal() {
    setWrittenText(putText);
    setOpenModal(false);
  }

  return (
    <>
      {mosaicProperty === mosaicId && openDataProperty ? (
        <div
          className={distyles.openProperty}
          onClick={e => e.stopPropagation()}
        >
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
            <h5>텍스트</h5>
            <div
              className={distyles.propertyOpenBox}
              onClick={() => setOpenModal(true)}
            >
              텍스트 편집
            </div>
          </div>
        </div>
      ) : null}
      {writtenText ? <div>{writtenText}</div> : null}
    </>
  );
}
