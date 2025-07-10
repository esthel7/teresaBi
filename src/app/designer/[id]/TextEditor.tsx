'use client';

import dynamic from 'next/dynamic';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import 'react-quill-new/dist/quill.snow.css';
import distyles from './designerId.module.css';

const QuillNoSSRWrapper = dynamic(
  () => import('react-quill-new').then(mod => mod.default),
  {
    ssr: false,
    loading: () => <p>Loading ...</p>
  }
);

const modules = {
  toolbar: [
    [{ header: '1' }, { header: '2' }, { font: [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [
      { list: 'ordered' },
      { list: 'bullet' },
      { indent: '-1' },
      { indent: '+1' }
    ],
    ['link', 'image']
  ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false
  }
};

const formats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'indent',
  'link',
  'image'
];

export default function TextEditor({
  value,
  setValue
}: {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const container = editorRef.current?.querySelector(
        '.ql-container'
      ) as HTMLDivElement;
      const editor = editorRef.current?.querySelector(
        '.ql-editor'
      ) as HTMLDivElement;
      if (!container || !editor) return;
      const handleClick = () => editor.focus();
      container.addEventListener('click', handleClick);
      return () => {
        container.removeEventListener('click', handleClick);
      };
    }, 300); // render after 300ms from setting DOM

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div ref={editorRef} className={distyles.textEditorBox}>
      <QuillNoSSRWrapper
        modules={modules}
        formats={formats}
        value={value}
        onChange={setValue}
        theme="snow"
        className={distyles.textEditor} />
    </div>
  );
}
