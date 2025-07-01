'use client';

import { ChangeEvent, useRef, useState, MouseEvent } from 'react';
import { Mosaic, MosaicWindow, MosaicNode } from 'react-mosaic-component';
import * as XLSX from 'xlsx';
import distyles from './designerId.module.css';
import 'react-mosaic-component/react-mosaic-component.css';

export default function Home() {
  const inventory = useRef<Record<string, number>>({});
  const originalDataSource = useRef<(string | number)[][]>([]);
  const [dashboardTitle] = useState('새 대시보드');
  const [chartCnt, setChartCnt] = useState(0);
  const [chartViews, setChartViews] = useState<string[]>([]);
  const [mosaicValue, setMosaicValue] = useState<MosaicNode<string> | null>(
    null
  );
  const [mosaicProperty, setMosaicProperty] = useState<string | null>(null);
  const [mosaicPropertyDetail, setMosaicPropertyDetail] = useState(true);

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

  function sideBarClick(e: MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const item = target.closest(`.${distyles.sideBarItem}`);

    if (item && item instanceof HTMLElement) {
      const type = item.dataset.type;
      setChartCnt(prev => prev + 1);
      const newChartViews = [...chartViews, `${type}-${String(Date.now())}`];
      setChartViews(newChartViews);
      setMosaicValue(buildMosaicNode(newChartViews));

      switch (type) {
        case 'grid':
          // grid action
          break;
        case 'chart':
          // chart action
          break;
        default:
          break;
      }
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

  function removeMosaicNode(
    node: MosaicNode<string> | null,
    removeId: string
  ): MosaicNode<string> | null {
    if (!node) return null;
    if (typeof node === 'string') return node === removeId ? null : node;
    const first = removeMosaicNode(node.first, removeId);
    const second = removeMosaicNode(node.second, removeId);
    if (!first && !second) return null;
    if (!first || !second) return (first || second)!;
    return {
      ...node,
      first,
      second
    };
  }

  function removeMosaic(removeId: string) {
    setChartCnt(prev => prev - 1);
    setChartViews(chartViews.filter(id => id !== removeId));
    setMosaicValue(removeMosaicNode(mosaicValue, removeId));
    setMosaicProperty(null);
    setMosaicPropertyDetail(true);
  }

  function openProperty(e: MouseEvent<HTMLDivElement>, settingId: string) {
    setMosaicProperty(settingId);
    e.stopPropagation();
  }

  function onBlur() {
    setMosaicProperty(null);
    setMosaicPropertyDetail(true);
  }

  return (
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
                <Mosaic<string>
                  renderTile={(id, path) => (
                    <MosaicWindow<string>
                      key={`${id}-${path.join('-')}`}
                      path={path}
                      title={'-'}
                      className={
                        mosaicProperty === id ? '' : 'hide-mosaic-header'
                      }
                    >
                      <div
                        className={distyles.chart}
                        onClick={e => openProperty(e, id)}
                      >
                        {id} 내용
                        {mosaicProperty === id ? (
                          <div className={distyles.chartPropertyBox}>
                            <div
                              className={distyles.chartPropertyItem}
                              onClick={() =>
                                setMosaicPropertyDetail(!mosaicPropertyDetail)
                              }
                            >
                              길이조절
                            </div>
                            {mosaicPropertyDetail ? (
                              <>
                                <div
                                  className={distyles.chartPropertyItem}
                                  onClick={() => {}}
                                >
                                  데이터 연결
                                </div>
                                <div
                                  className={distyles.chartPropertyItem}
                                  onClick={() => removeMosaic(id)}
                                >
                                  X
                                </div>
                              </>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </MosaicWindow>
                  )}
                  value={mosaicValue}
                  onChange={setMosaicValue}
                  className=""
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
