'use client';

import {
  Dispatch,
  SetStateAction,
  MouseEvent,
  useState,
  useEffect,
  ReactNode,
  useRef
} from 'react';
import { Mosaic, MosaicWindow, MosaicNode } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import { useMosaicStore } from '@/store/mosaicStore';
import { useInventoryStore } from '@/store/inventoryStore';
import ChartType from './ChartType';
import FinancialType from './FinancialType';
import TextType from './TextType';
import ImgType from './ImgType';
import RangeType from './RangeType';
import distyles from './designerId.module.css';

interface ChartParameter {
  setChartCnt: Dispatch<SetStateAction<number>>;
  chartViews: string[];
  setChartViews: Dispatch<SetStateAction<string[]>>;
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  setModalNode: Dispatch<SetStateAction<ReactNode>>;
}

export default function Chart({
  setChartCnt,
  chartViews,
  setChartViews,
  openModal,
  setOpenModal,
  setModalNode
}: ChartParameter) {
  const {
    mosaicValue,
    setMosaicValue,
    mosaicProperty,
    setMosaicProperty,
    mosaicPropertyDetail,
    setMosaicPropertyDetail
  } = useMosaicStore();
  const { inventory } = useInventoryStore();
  const [openDataProperty, setOpenDataProperty] = useState(false);
  const [openShareProperty, setOpenShareProperty] = useState(false);
  const chartBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!Object.keys(inventory).length) {
      // redirect /designer after fetching data
    }
  }, [inventory]);

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
    setOpenDataProperty(false);
    setOpenShareProperty(false);
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
    setOpenShareProperty(false);
    e.stopPropagation();
  }

  function openShareSection(e: MouseEvent<HTMLDivElement>, settingId: string) {
    setMosaicProperty(settingId);
    setMosaicPropertyDetail(true);
    setOpenDataProperty(false);
    setOpenShareProperty(true);
    e.stopPropagation();
  }

  return (
    <Mosaic<string>
      renderTile={(id, path) => (
        <MosaicWindow<string>
          key={id}
          path={path}
          title={'-'}
          className={mosaicProperty === id ? '' : 'hide-mosaic-header'}>
          <div
            className={distyles.chart}
            ref={chartBoxRef}
            onClick={e => openProperty(e, id)}>
            <div>{id.split('-')[0]}</div>
            <div
              className={distyles.connectData}
              onClick={e => openDataConnectSection(e, id)}>
              데이터 연결
            </div>
            {mosaicProperty === id ? (
              <div id="focusMosaicBox" className={distyles.chartPropertyBox}>
                <div
                  className={distyles.chartPropertyItem}
                  onClick={changeProperty}>
                  길이조절
                </div>
                {mosaicPropertyDetail ? (
                  <>
                    <div
                      className={distyles.chartPropertyItem}
                      onClick={e => openDataConnectSection(e, id)}>
                      데이터 연결
                    </div>
                    <div
                      className={distyles.chartPropertyItem}
                      onClick={e => openShareSection(e, id)}>
                      공유
                    </div>
                    <div
                      className={distyles.chartPropertyItem}
                      onClick={() => removeMosaic(id)}>
                      X
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
            {id.split('-')[0] === 'chart' ? (
              <ChartType
                mosaicId={id}
                chartBoxRef={chartBoxRef}
                openDataProperty={openDataProperty}
                setOpenDataProperty={setOpenDataProperty}
                openShareProperty={openShareProperty}
                setOpenShareProperty={setOpenShareProperty} />
            ) : null}
            {id.split('-')[0] === 'financial' ? (
              <FinancialType
                mosaicId={id}
                chartBoxRef={chartBoxRef}
                openDataProperty={openDataProperty}
                setOpenDataProperty={setOpenDataProperty}
                openShareProperty={openShareProperty}
                setOpenShareProperty={setOpenShareProperty} />
            ) : null}
            {id.split('-')[0] === 'text' ? (
              <TextType
                mosaicId={id}
                openDataProperty={openDataProperty}
                setOpenDataProperty={setOpenDataProperty}
                openModal={openModal}
                setOpenModal={setOpenModal}
                setModalNode={setModalNode} />
            ) : null}
            {id.split('-')[0] === 'img' ? (
              <ImgType
                mosaicId={id}
                openDataProperty={openDataProperty}
                setOpenDataProperty={setOpenDataProperty}
                openModal={openModal}
                setOpenModal={setOpenModal}
                setModalNode={setModalNode} />
            ) : null}
            {id.split('-')[0] === 'range' ? (
              <RangeType
                mosaicId={id}
                chartBoxRef={chartBoxRef}
                openDataProperty={openDataProperty}
                setOpenDataProperty={setOpenDataProperty}
                openShareProperty={openShareProperty}
                setOpenShareProperty={setOpenShareProperty} />
            ) : null}
          </div>
        </MosaicWindow>
      )}
      value={mosaicValue}
      onChange={setMosaicValue}
      className="" />
  );
}
