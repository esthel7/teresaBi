'use client';

import {
  ChangeEvent,
  Dispatch,
  MouseEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState
} from 'react';
import { Mosaic, MosaicNode, MosaicWindow } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import { useDashboardStore } from '@/store/dashboardStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useMosaicStore } from '@/store/mosaicStore';
import ChartType from './ChartType';
import FinancialType from './FinancialType';
import ImgType from './ImgType';
import RangeType from './RangeType';
import TextType from './TextType';
import distyles from './designerId.module.css';

interface ChartParameter {
  setChartCnt: Dispatch<SetStateAction<number>>;
  chartViews: string[];
  setChartViews: Dispatch<SetStateAction<string[]>>;
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
}

export default function Chart({
  setChartCnt,
  chartViews,
  setChartViews,
  openModal,
  setOpenModal
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
  const { unit, setUnit } = useDashboardStore();
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
    const prevUnit = JSON.parse(JSON.stringify(unit));
    delete prevUnit[removeId];
    setUnit(prevUnit);
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

  function changeTitle(e: ChangeEvent<HTMLInputElement>, id: string) {
    e.stopPropagation();
    const prevUnit = JSON.parse(JSON.stringify(unit));
    prevUnit[id].title = e.target.value;
    setUnit(prevUnit);
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
            <div>
              {id.split('-')[0]} / title:{' '}
              <input
                type="text"
                value={unit[id]?.title ?? ''}
                onChange={e => changeTitle(e, id)}
                onClick={e => e.stopPropagation()} />
            </div>
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
                setOpenModal={setOpenModal} />
            ) : null}
            {id.split('-')[0] === 'img' ? (
              <ImgType
                mosaicId={id}
                openDataProperty={openDataProperty}
                setOpenDataProperty={setOpenDataProperty}
                openModal={openModal}
                setOpenModal={setOpenModal} />
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
