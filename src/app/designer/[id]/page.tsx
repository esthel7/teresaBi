'use client';

import { ChangeEvent, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import distyles from './designerId.module.css';

export default function Home() {
  const inventory = useRef<Record<string, number>>({});
  const originalDataSource = useRef<(string | number)[][]>([]);
  const [dashboardTitle] = useState('새 대시보드');
  const [chartView] = useState(0);

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

  return (
    <div className={distyles.designer}>
      <div className={distyles.sideBar}>
        <div style={{ height: '3rem' }}>햄버거</div>
        <div>
          <div className={distyles.sideBarTitle}>일반</div>
          <div className={distyles.sideBarItem}>그리드</div>
          <div className={distyles.sideBarItem}>차트</div>
          <div className={distyles.sideBarItem}>파이</div>
          <div className={distyles.sideBarItem}>트리</div>
          <div className={distyles.sideBarItem}>분산형</div>
          <div className={distyles.sideBarItem}>텍스트</div>
          <div className={distyles.sideBarItem}>이미지</div>
        </div>
        <div>
          <div className={distyles.sideBarTitle}>지도</div>
          <div className={distyles.sideBarItem}>지리적</div>
        </div>
        <div>
          <div className={distyles.sideBarTitle}>필터</div>
          <div className={distyles.sideBarItem}>범위</div>
          <div className={distyles.sideBarItem}>콤보</div>
          <div className={distyles.sideBarItem}>날짜</div>
          <div className={distyles.sideBarItem}>트리</div>
          <div className={distyles.sideBarItem}>리스트</div>
        </div>

        {/* temporary (delete after) */}
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          style={{
            border: '1px solid blue',
            height: '80px',
            width: 'inherit',
            marginTop: '20px'
          }}
        />
      </div>
      <main className={distyles.main}>
        <div className={distyles.topBar}>
          <div>
            <div>뒤로</div>
            <div>앞으로</div>
          </div>
          <div>
            <div>너비</div>
            <div>자동</div>
            <div>고정</div>
            <div>픽셀</div>
          </div>
          <div>
            <div>높이</div>
            <div>자동</div>
            <div>고정</div>
            <div>픽셀</div>
          </div>
        </div>
        <div className={distyles.dashboardBox}>
          <div className={distyles.dashboardTop}>
            <div className={distyles.dashboardTitle}>{dashboardTitle}</div>
            <div className={distyles.share}>공유</div>
          </div>
          <div
            className={distyles.dashboard}
            style={{ display: chartView ? 'table' : 'flex' }}
          >
            {!chartView ? (
              <div className={distyles.explain}>
                도구 상자에서 버튼을 클릭하여 새 항목을 만듭니다.
              </div>
            ) : (
              <div>chart</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
