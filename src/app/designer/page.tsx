'use client';

import { useState, ChangeEvent, useRef } from 'react';
import * as XLSX from 'xlsx';
import dstyles from './designer.module.css';

const DataFormat = ['Excel', 'JSON', 'Database'] as const;

export default function Home() {
  const [connectDataFormat, setConnectDataFormat] = useState<
    (typeof DataFormat)[number] | null>(null);
  const [dataSources] = useState(['1번 데이터소스', '2번 데이터소스']);
  const inventory = useRef<Record<string, number>>({});
  const originalDataSource = useRef<(string | number)[][]>([]);

  function connectFormat(flag: (typeof DataFormat)[number]) {
    setConnectDataFormat(flag);
  }

  function formatCell(value: unknown) {
    if (!isNaN(Number(value)) && typeof value === 'string')
      return Number(value);
    if (value instanceof Date) return value.toISOString().split('T')[0];
    return value as string;
  }

  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = evt => {
      const binaryStr = evt.target?.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      inventory.current = {};
      const jsonData: (string | number)[][] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        cellDates: true,
        raw: false
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      const originalInventory = jsonData.shift() as string[];
      originalInventory.forEach((item, index) => {
        inventory.current[item] = index;
      });
      const refined = jsonData.map(row =>
        row.map(cell => formatCell(cell))
      ) as (string | number)[][];
      originalDataSource.current = refined;
      console.log('check original data', refined);
    };

    reader.readAsArrayBuffer(file);
  }

  function connectData() {
    setConnectDataFormat(null);
  }

  return (
    <>
      <div className={dstyles.designer}>
        <div className={dstyles.designerSection}>
          <div className={dstyles.title}>대시보드 이름</div>
          <input type="text" defaultValue="새 대시보드" />
        </div>
        <div className={dstyles.designerSection}>
          <div className={dstyles.title}>데이터 소스 생성</div>
          <div className={dstyles.dataBox}>
            {DataFormat.map(item => (
              <div
                key={item}
                className={dstyles.dataItem}
                onClick={() => connectFormat(item)}>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className={dstyles.designerSection}>
          <div className={dstyles.title}>대시보드 데이터 소스 선택</div>
          <div className={dstyles.dataSourceSearch}>검색..</div>
          {dataSources.map(item => (
            <div key={item} className={dstyles.dataSourceList}>
              (대시보드 데이터 소스 선택 리스트 영역) {item}
            </div>
          ))}
        </div>
      </div>
      {connectDataFormat === 'Excel' ? (
        <div
          className={dstyles.modal}
          onClick={() => setConnectDataFormat(null)}>
          <div className={dstyles.modalItem} onClick={e => e.stopPropagation()}>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload} />
            <div className={dstyles.modalBottom}>
              <div onClick={() => setConnectDataFormat(null)}>취소</div>
              <div className={dstyles.modalBottomRight}>
                <div>이전</div>
                <div>다음</div>
                <div onClick={connectData}>완료</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
