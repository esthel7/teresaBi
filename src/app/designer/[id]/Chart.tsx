'use client';

import {
  Dispatch,
  SetStateAction,
  MouseEvent,
  useState,
  useEffect,
  RefObject,
  ReactNode
} from 'react';
import { Mosaic, MosaicWindow, MosaicNode } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import ChartType from './ChartType';
import ImgType from './ImgType';
import distyles from './designerId.module.css';

interface ChartParameter {
  inventory: RefObject<Record<string, number>>;
  inventoryFormat: RefObject<Record<string, string>>;
  originalDataSource: RefObject<(string | number)[][]>;
  selectedChartType: ChartType | null;
  setChartCnt: Dispatch<SetStateAction<number>>;
  chartViews: string[];
  mosaicValue: MosaicNode<string> | null;
  setMosaicValue: Dispatch<SetStateAction<MosaicNode<string> | null>>;
  setChartViews: Dispatch<SetStateAction<string[]>>;
  mosaicProperty: string | null;
  setMosaicProperty: Dispatch<SetStateAction<string | null>>;
  mosaicPropertyDetail: boolean;
  setMosaicPropertyDetail: Dispatch<SetStateAction<boolean>>;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  setModalNode: Dispatch<SetStateAction<ReactNode>>;
}

export default function Chart({
  inventory,
  originalDataSource,
  inventoryFormat,
  selectedChartType,
  setChartCnt,
  chartViews,
  setChartViews,
  mosaicValue,
  setMosaicValue,
  mosaicProperty,
  setMosaicProperty,
  mosaicPropertyDetail,
  setMosaicPropertyDetail,
  setOpenModal,
  setModalNode
}: ChartParameter) {
  const [openDataProperty, setOpenDataProperty] = useState(false);

  useEffect(() => {
    if (!inventory.current.length) {
      // redirect /designer after fetching data
    }
  }, [inventory]);

  useEffect(() => {
    setOpenDataProperty(false);
  }, [mosaicProperty]);

  function changeProperty() {
    setMosaicPropertyDetail(!mosaicPropertyDetail);
    if (mosaicPropertyDetail) setOpenDataProperty(false);
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

  function openDataConnectSection(
    e: MouseEvent<HTMLDivElement>,
    settingId: string
  ) {
    setMosaicProperty(settingId);
    setMosaicPropertyDetail(true);
    setOpenDataProperty(true);
    e.stopPropagation();
  }

  return (
    <Mosaic<string>
      renderTile={(id, path) => (
        <MosaicWindow<string>
          key={id}
          path={path}
          title={'-'}
          className={mosaicProperty === id ? '' : 'hide-mosaic-header'}
        >
          <div className={distyles.chart} onClick={e => openProperty(e, id)}>
            <div>{id.split('-')[0]}</div>
            <div
              className={distyles.connectData}
              onClick={e => openDataConnectSection(e, id)}
            >
              데이터 연결
            </div>
            {mosaicProperty === id ? (
              <div className={distyles.chartPropertyBox}>
                <div
                  className={distyles.chartPropertyItem}
                  onClick={changeProperty}
                >
                  길이조절
                </div>
                {mosaicPropertyDetail ? (
                  <>
                    <div
                      className={distyles.chartPropertyItem}
                      onClick={() => setOpenDataProperty(true)}
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
            {selectedChartType === 'chart' ? (
              <ChartType
                inventory={inventory}
                inventoryFormat={inventoryFormat}
                originalDataSource={originalDataSource}
                mosaicProperty={mosaicProperty}
                mosaicId={id}
                openDataProperty={openDataProperty}
                setOpenDataProperty={setOpenDataProperty}
              />
            ) : null}
            {selectedChartType === 'img' ? (
              <ImgType
                mosaicProperty={mosaicProperty}
                mosaicId={id}
                openDataProperty={openDataProperty}
                setOpenDataProperty={setOpenDataProperty}
                setOpenModal={setOpenModal}
                setModalNode={setModalNode}
              />
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
