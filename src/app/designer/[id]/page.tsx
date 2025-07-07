'use client';

import { ChangeEvent, useRef, useState, MouseEvent, ReactNode } from 'react';
import { MosaicNode } from 'react-mosaic-component';
import * as XLSX from 'xlsx';
import distyles from './designerId.module.css';
import 'react-mosaic-component/react-mosaic-component.css';
import Chart from './Chart';

export default function Home() {
  const inventory = useRef<Record<string, number>>({});
  const inventoryFormat = useRef<Record<string, string>>({});
  const originalDataSource = useRef<(string | number)[][]>([]);
  const [dashboardTitle] = useState('새 대시보드');
  const [chartCnt, setChartCnt] = useState(0);
  const [chartViews, setChartViews] = useState<string[]>([]);
  const [mosaicValue, setMosaicValue] = useState<MosaicNode<string> | null>(
    null
  );
  const [mosaicProperty, setMosaicProperty] = useState<string | null>(null);
  const [mosaicPropertyDetail, setMosaicPropertyDetail] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [modalNode, setModalNode] = useState<ReactNode>(null);

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
      inventoryFormat.current = {};
      const jsonData: (string | number)[][] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        cellDates: true,
        raw: false
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      const originalInventory = jsonData.shift() as string[];
      originalInventory.forEach((item, index) => {
        inventory.current[item] = index;
        inventoryFormat.current[item] = /^\d{1,2}\/\d{1,2}\/\d{2}$/.test(
          String(jsonData[0][index])
        )
          ? 'Date'
          : !isNaN(Number(jsonData[0][index])) &&
              typeof jsonData[0][index] === 'string'
            ? 'number'
            : typeof jsonData[0][index];
      });
      const refined = jsonData.map(row =>
        row.map(cell => formatCell(cell))
      ) as (string | number)[][];
      originalDataSource.current = refined;
      console.log('check original data', refined);
    };

    reader.readAsArrayBuffer(file);
  }

  function sideBarClick(e: MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const item = target.closest(`.${distyles.sideBarItem}`);

    if (item && item instanceof HTMLElement) {
      const type = item.dataset.type as ChartType;
      setChartCnt(prev => prev + 1);
      const newChartViews = [...chartViews, `${type}-${String(Date.now())}`];
      setChartViews(newChartViews);
      setMosaicValue(buildMosaicNode(newChartViews));
    }
  }

  function buildMosaicNode(
    views: string[],
    horizontal = true
  ): MosaicNode<string> | null {
    if (views.length === 0) return null;
    if (views.length === 1) return views[0];
    const mid = Math.floor(views.length / 2);
    const first = buildMosaicNode(views.slice(0, mid), !horizontal);
    const second = buildMosaicNode(views.slice(mid), !horizontal);
    if (!first || !second) return (first || second)!;
    return { direction: horizontal ? 'row' : 'column', first, second };
  }

  function onBlur() {
    setMosaicProperty(null);
    setMosaicPropertyDetail(true);
  }

  return (
    <>
      <div className={distyles.designer}>
        <div className={distyles.sideBar} onClick={sideBarClick}>
          <div style={{ height: '3rem' }}>햄버거</div>
          <div>
            <div className={distyles.sideBarTitle}>일반</div>
            <div className={distyles.sideBarItem} data-type="grid">
              그리드
            </div>
            <div className={distyles.sideBarItem} data-type="chart">
              차트
            </div>
            <div className={distyles.sideBarItem} data-type="pie">
              파이
            </div>
            <div className={distyles.sideBarItem} data-type="tree">
              트리
            </div>
            <div className={distyles.sideBarItem} data-type="scatter">
              분산형
            </div>
            <div className={distyles.sideBarItem} data-type="text">
              텍스트
            </div>
            <div className={distyles.sideBarItem} data-type="img">
              이미지
            </div>
          </div>
          <div>
            <div className={distyles.sideBarTitle}>지도</div>
            <div className={distyles.sideBarItem} data-type="map">
              지리적
            </div>
          </div>
          <div>
            <div className={distyles.sideBarTitle}>필터</div>
            <div className={distyles.sideBarItem} data-type="range">
              범위
            </div>
            <div className={distyles.sideBarItem} data-type="combo">
              콤보
            </div>
            <div className={distyles.sideBarItem} data-type="date">
              날짜
            </div>
            <div className={distyles.sideBarItem} data-type="tree-filter">
              트리
            </div>
            <div className={distyles.sideBarItem} data-type="list">
              리스트
            </div>
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
          <div className={distyles.dashboardBox} onClick={onBlur}>
            <div className={distyles.dashboardTop}>
              <div className={distyles.dashboardTitle}>{dashboardTitle}</div>
              <div className={distyles.share}>공유</div>
            </div>
            <div className={distyles.dashboard}>
              {!chartCnt ? (
                <div className={distyles.explain}>
                  도구 상자에서 버튼을 클릭하여 새 항목을 만듭니다.
                </div>
              ) : (
                <div className={distyles.area}>
                  <Chart
                    inventory={inventory}
                    inventoryFormat={inventoryFormat}
                    originalDataSource={originalDataSource}
                    setChartCnt={setChartCnt}
                    chartViews={chartViews}
                    setChartViews={setChartViews}
                    mosaicValue={mosaicValue}
                    setMosaicValue={setMosaicValue}
                    mosaicProperty={mosaicProperty}
                    setMosaicProperty={setMosaicProperty}
                    mosaicPropertyDetail={mosaicPropertyDetail}
                    setMosaicPropertyDetail={setMosaicPropertyDetail}
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    setModalNode={setModalNode}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      {openModal ? (
        <div className={distyles.modal} onClick={() => setOpenModal(false)}>
          {modalNode}
        </div>
      ) : null}
    </>
  );
}
