'use client';

import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState
} from 'react';
import 'react-quill-new/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import mammoth from 'mammoth';
import { useDashboardStore } from '@/store/dashboardStore';
import { useModalStore } from '@/store/modalStore';
import { useMosaicStore } from '@/store/mosaicStore';
import TextEditor from './TextEditor';
import distyles from './designerId.module.css';

interface TextTypeParameter {
  mosaicId: string;
  openDataProperty: boolean;
  setOpenDataProperty: Dispatch<SetStateAction<boolean>>;
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
}

export default function TextType({
  mosaicId,
  openDataProperty,
  setOpenDataProperty,
  openModal,
  setOpenModal
}: TextTypeParameter) {
  const { mosaicProperty } = useMosaicStore();
  const { unit, setUnit } = useDashboardStore();
  const { callerId, setCallerId, setModal } = useModalStore();

  useEffect(() => {
    const prevUnit = JSON.parse(JSON.stringify(unit));
    prevUnit[mosaicId].type = 'none';
    setUnit(prevUnit);

    // call this callback for every Element node
    DOMPurify.addHook('uponSanitizeElement', node => {
      if (!(node instanceof window.Element)) return;
      const className = node.getAttribute?.('class') || '';
      if (className.match(/ql-/)) node.setAttribute('class', className);
      if (node.hasAttribute('data-list'))
        node.setAttribute('data-list', node.getAttribute('data-list')!);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mosaicProperty === mosaicId) setCallerId(mosaicId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mosaicProperty, mosaicId]);

  useEffect(() => {
    if (!openModal || callerId !== mosaicId) return;
    setModal(<TextModal />);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  function TextModal() {
    const [putText, setPutText] = useState<string>(
      typeof unit[mosaicId].property.writtenText === 'string'
        ? unit[mosaicId].property.writtenText
        : ''
    );

    async function handleWordFile(e: ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      if (!file) return;
      const checkProgress = confirm(
        '기존 내용이 지워집니다. 진행하시겠습니까?'
      );
      if (!checkProgress) return;
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setPutText(result.value.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;'));
      } catch (error) {
        console.error('Error reading .docx file:', error);
        alert('파일을 읽는 중 오류가 발생했습니다.');
      }
    }

    function confirmModal() {
      const newWrittenText = DOMPurify.sanitize(putText, {
        ALLOWED_ATTR: ['class', 'data-list', 'src', 'alt', 'width', 'height'] // maintain class, data-list
      });
      const prevUnit = JSON.parse(JSON.stringify(unit));
      prevUnit[mosaicId].property.writtenText = newWrittenText;
      setUnit(prevUnit);
      setOpenModal(false);
    }

    return (
      <div className={distyles.modalItem} onClick={e => e.stopPropagation()}>
        <input type="file" accept=".docx" onChange={handleWordFile} />
        <TextEditor value={putText} setValue={setPutText} />
        <div onClick={confirmModal}>확인</div>
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
            <h5>텍스트</h5>
            <div
              className={distyles.propertyOpenBox}
              onClick={() => setOpenModal(true)}>
              텍스트 편집
            </div>
          </div>
        </div>
      ) : null}
      {unit[mosaicId].property?.writtenText ? (
        <div className={`ql-snow ${distyles.viewText}`}>
          <div
            className="ql-editor"
            dangerouslySetInnerHTML={{
              __html: unit[mosaicId].property?.writtenText as string
            }} />
        </div>
      ) : null}
    </>
  );
}
