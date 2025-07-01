'use client';

import { Dispatch, SetStateAction, MouseEvent } from 'react';
import { Mosaic, MosaicWindow, MosaicNode } from 'react-mosaic-component';
import distyles from './designerId.module.css';
import 'react-mosaic-component/react-mosaic-component.css';

interface ChartType {
  setChartCnt: Dispatch<SetStateAction<number>>;
  chartViews: string[];
  mosaicValue: MosaicNode<string> | null;
  setMosaicValue: Dispatch<SetStateAction<MosaicNode<string> | null>>;
  setChartViews: Dispatch<SetStateAction<string[]>>;
  mosaicProperty: string | null;
  setMosaicProperty: Dispatch<SetStateAction<string | null>>;
  mosaicPropertyDetail: boolean;
  setMosaicPropertyDetail: Dispatch<SetStateAction<boolean>>;
}

export default function Chart({
  setChartCnt,
  chartViews,
  setChartViews,
  mosaicValue,
  setMosaicValue,
  mosaicProperty,
  setMosaicProperty,
  mosaicPropertyDetail,
  setMosaicPropertyDetail
}: ChartType) {
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

  return (
    <Mosaic<string>
      renderTile={(id, path) => (
        <MosaicWindow<string>
          key={`${id}-${path.join('-')}`}
          path={path}
          title={'-'}
          className={mosaicProperty === id ? '' : 'hide-mosaic-header'}
        >
          <div className={distyles.chart} onClick={e => openProperty(e, id)}>
            {id} 내용
            {mosaicProperty === id ? (
              <div className={distyles.chartPropertyBox}>
                <div
                  className={distyles.chartPropertyItem}
                  onClick={() => setMosaicPropertyDetail(!mosaicPropertyDetail)}
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
  );
}
