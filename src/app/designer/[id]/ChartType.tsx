'use client';

import {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  RefObject
} from 'react';
import { NumberProperty } from '@/constants';
import distyles from './designerId.module.css';

type NeededDataType = 'X' | 'Y' | 'Series';
const DrawType = [
  'side-by-side bar',
  'stack bar',
  'full-stack bar',
  'line',
  'stack line',
  'full-stack line'
] as const;

interface ChartTypeParameter {
  inventory: RefObject<Record<string, number>>;
  inventoryFormat: RefObject<Record<string, string>>;
  originalDataSource: RefObject<(string | number)[][]>;
  mosaicProperty: string | null;
  mosaicId: string;
  openDataProperty: boolean;
  setOpenDataProperty: Dispatch<SetStateAction<boolean>>;
}

export default function ChartType({
  inventory,
  originalDataSource,
  inventoryFormat,
  mosaicProperty,
  mosaicId,
  openDataProperty,
  setOpenDataProperty
}: ChartTypeParameter) {
  const [xInventory, setXInventory] = useState<string[][]>([]);
  const [yInventory, setYInventory] = useState<string[][]>([]);
  const [seriesInventory, setSeriesInventory] = useState<string[][]>([]);
  const [xDetail, setXDetail] = useState(false);
  const [yDetail, setYDetail] = useState(false);
  const [seriesDetail, setSeriesDetail] = useState(false);
  const [selectData, setSelectData] = useState<string | null>(null);
  const [selectDataIdx, setSelectDataIdx] = useState<number>(-1);
  const [drawType, setDrawType] = useState<(typeof DrawType)[number]>(
    DrawType[0]
  );

  useEffect(() => {
    if (openDataProperty) return;
    setXDetail(false);
    setYDetail(false);
    setSeriesDetail(false);
    setSelectData(null);
    setSelectDataIdx(-1);
  }, [openDataProperty]);

  useEffect(() => {
    if (!selectData) return;
    // click to item in [xDetail, yDetail, seriesDetail]
    changeOrAddInventory(selectData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectData, xDetail, yDetail, seriesDetail, drawType]);

  function openDetailProperty(flag: NeededDataType) {
    setXDetail(false);
    setYDetail(false);
    setSeriesDetail(false);
    setSelectData(null);
    setDrawType(DrawType[0]);
    switch (flag) {
      case 'X':
        setXDetail(true);
        setSelectDataIdx(xInventory.length);
        break;
      case 'Y':
        setYDetail(true);
        setSelectDataIdx(yInventory.length);
        break;
      case 'Series':
        setSeriesDetail(true);
        setSelectDataIdx(seriesInventory.length);
        break;
      default:
        console.error('error!');
        break;
    }
  }

  function removeInventory(flag: NeededDataType, idx: number) {
    const [selectedInventory, setSelectedInventory] =
      flag === 'X'
        ? [xInventory, setXInventory]
        : flag === 'Y'
          ? [yInventory, setYInventory]
          : [seriesInventory, setSeriesInventory];
    const left = selectedInventory.slice(0, idx);
    const right = selectedInventory.slice(idx + 1);
    setSelectedInventory([...left, ...right]);
    setSelectData(null);
    setSelectDataIdx(seriesInventory.length - 1);
  }

  function changeOrAddInventory(item: string) {
    const [selectedInventory, setSelectedInventory] = xDetail
      ? [xInventory, setXInventory]
      : yDetail
        ? [yInventory, setYInventory]
        : [seriesInventory, setSeriesInventory];
    const left = selectedInventory.slice(0, selectDataIdx);
    const right = selectedInventory.slice(selectDataIdx + 1);
    const newValue: string[][] = [];
    if (xDetail) {
      // realname, alias
      newValue.push([item, item]);
    } else if (yDetail) {
      // realname, alias, drawType, calculateType
      newValue.push([item, item, drawType, NumberProperty[0]]);
    } else if (seriesDetail) {
      // realname, alias
      newValue.push([item, item]);
    }
    setSelectedInventory([...left, ...newValue, ...right]);
  }

  function ViewAllData() {
    const inventoryKeys = Object.keys(inventory.current);
    return (
      <div className={distyles.dataBox}>
        <div className={distyles.header}>header</div>
        {inventoryKeys.map(item => (
          <div
            key={item}
            className={`${distyles.dataItem} ${item === selectData ? distyles.dataItemSelect : ''}`}
            onClick={() => setSelectData(item)}
          >
            <div>{item}</div>
            <div>{inventoryFormat.current[item]}</div>
          </div>
        ))}
      </div>
    );
  }

  function chooseThisInventory(
    flag: NeededDataType,
    item: string[],
    idx: number
  ) {
    setSelectDataIdx(idx);
    setSelectData(item[0]);
    setXDetail(false);
    setYDetail(false);
    setSeriesDetail(false);
    switch (flag) {
      case 'X':
        setXDetail(true);
        break;
      case 'Y':
        setYDetail(true);
        setDrawType(item[2] as (typeof DrawType)[number]);
        break;
      case 'Series':
        setSeriesDetail(true);
        break;
      default:
        console.error('error');
        break;
    }
  }

  return (
    <>
      {mosaicProperty === mosaicId && openDataProperty ? (
        <div className={distyles.openProperty}>
          <div className={distyles.title}>
            <div>데이터 연결</div>
            <div
              className={distyles.close}
              onClick={() => setOpenDataProperty(false)}
            >
              X
            </div>
          </div>
          <div className={distyles.propertySection}>
            <h5>x축</h5>
            {xInventory.map((item, idx) => (
              <div
                key={idx}
                className={`${distyles.propertyOpenBox} ${distyles.selectedData} ${xDetail && selectDataIdx === idx ? distyles.selectedDataSelect : ''}`}
                onClick={() => chooseThisInventory('X', item, idx)}
              >
                <div>{item[1]}</div>
                <div onClick={() => removeInventory('X', idx)}>X</div>
              </div>
            ))}
            <div
              className={distyles.propertyOpenBox}
              onClick={() => openDetailProperty('X')}
            >
              x축 추가
            </div>
          </div>
          <div className={distyles.propertySection}>
            <h5>y축</h5>
            {yInventory.map((item, idx) => (
              <div
                key={idx}
                className={`${distyles.propertyOpenBox} ${distyles.selectedData} ${yDetail && selectDataIdx === idx ? distyles.selectedDataSelect : ''}`}
                onClick={() => chooseThisInventory('Y', item, idx)}
              >
                <div>
                  {item[1]}
                  {item[2]} ({item[3]})
                </div>
                <div onClick={() => removeInventory('Y', idx)}>X</div>
              </div>
            ))}
            <div
              className={distyles.propertyOpenBox}
              onClick={() => openDetailProperty('Y')}
            >
              y축 추가
            </div>
          </div>
          <div className={distyles.propertySection}>
            <h5>대분류</h5>
            {seriesInventory.map((item, idx) => (
              <div
                key={idx}
                className={`${distyles.propertyOpenBox} ${distyles.selectedData} ${seriesDetail && selectDataIdx === idx ? distyles.selectedDataSelect : ''}`}
                onClick={() => chooseThisInventory('Series', item, idx)}
              >
                <div>{item[1]}</div>
                <div onClick={() => removeInventory('Series', idx)}>X</div>
              </div>
            ))}
            <div
              className={distyles.propertyOpenBox}
              onClick={() => openDetailProperty('Series')}
            >
              대분류 추가
            </div>
          </div>
        </div>
      ) : null}
      {mosaicProperty === mosaicId && openDataProperty && xDetail ? (
        <div className={distyles.propertyDetail}>
          <div className={distyles.header} onClick={() => setXDetail(false)}>
            뒤로
          </div>
          <div className={distyles.drawer} style={{ borderTop: 'none' }}>
            <h5>데이터 선택</h5>
            <ViewAllData />
          </div>
          <div className={distyles.drawer}>
            <h5>데이터명 바꾸기</h5>
            <div>데이터명</div>
          </div>
        </div>
      ) : null}
      {mosaicProperty === mosaicId && openDataProperty && yDetail ? (
        <div className={distyles.propertyDetail}>
          <div className={distyles.header} onClick={() => setYDetail(false)}>
            뒤로
          </div>
          <div className={distyles.drawer} style={{ borderTop: 'none' }}>
            <h5>차트 타입</h5>
            {DrawType.map(item => (
              <div
                key={item}
                className={`${distyles.drawType} ${drawType === item ? distyles.drawTypeSelect : ''}`}
                onClick={() => setDrawType(item)}
              >
                {item}
              </div>
            ))}
          </div>
          <div className={distyles.drawer}>
            <h5>데이터 선택</h5>
            <ViewAllData />
            <h5>집계 방식 선택</h5>
            <div>합계, 카운트,...</div>
          </div>
          <div className={distyles.drawer}>
            <h5>데이터명 바꾸기</h5>
            <div>데이터명</div>
          </div>
        </div>
      ) : null}
      {mosaicProperty === mosaicId && openDataProperty && seriesDetail ? (
        <div className={distyles.propertyDetail}>
          <div
            className={distyles.header}
            onClick={() => setSeriesDetail(false)}
          >
            뒤로
          </div>
          <div className={distyles.drawer} style={{ borderTop: 'none' }}>
            <h5>데이터 선택</h5>
            <ViewAllData />
          </div>
          <div className={distyles.drawer}>
            <h5>데이터명 바꾸기</h5>
            <div>데이터명</div>
          </div>
        </div>
      ) : null}
    </>
  );
}
