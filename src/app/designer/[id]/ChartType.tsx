'use client';

import {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  RefObject,
  useRef
} from 'react';
import { NumberProperty } from '@/constants';
import distyles from './designerId.module.css';

type NeededDataType = 'X' | 'Y' | 'Series';

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
  const selectDataIdx = useRef<number>(-1);

  useEffect(() => {
    if (openDataProperty) return;
    setXDetail(false);
    setYDetail(false);
    setSeriesDetail(false);
    setSelectData(null);
    selectDataIdx.current = -1;
  }, [openDataProperty]);

  function changeOpenDetailProperty(flag: NeededDataType) {
    setXDetail(false);
    setYDetail(false);
    setSeriesDetail(false);
    setSelectData(null);
    switch (flag) {
      case 'X':
        setXDetail(true);
        selectDataIdx.current = xInventory.length;
        break;
      case 'Y':
        setYDetail(true);
        selectDataIdx.current = yInventory.length;
        break;
      case 'Series':
        setSeriesDetail(true);
        selectDataIdx.current = seriesInventory.length;
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
    selectDataIdx.current = selectedInventory.length - 1;
  }

  function changeInventory(item: string) {
    setSelectData(item);
    const [selectedInventory, setSelectedInventory] = xDetail
      ? [xInventory, setXInventory]
      : yDetail
        ? [yInventory, setYInventory]
        : [seriesInventory, setSeriesInventory];
    const left = selectedInventory.slice(0, selectDataIdx.current);
    const right = selectedInventory.slice(selectDataIdx.current + 1);
    const newValue: string[][] = [];
    if (xDetail) {
      // realname, alias
      newValue.push([item, item]);
    } else if (yDetail) {
      // realname, alias, calculateType
      newValue.push([item, item, NumberProperty[0]]);
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
            onClick={() => changeInventory(item)}
          >
            <div>{item}</div>
            <div>{inventoryFormat.current[item]}</div>
          </div>
        ))}
      </div>
    );
  }

  function chooseThisInventory(item: string, idx: number) {
    selectDataIdx.current = idx;
    changeInventory(item);
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
                className={`${distyles.propertyOpenBox} ${distyles.selectedData} ${xDetail && selectDataIdx.current === idx ? distyles.selectedDataSelect : ''}`}
                onClick={() => chooseThisInventory(item[0], idx)}
              >
                <div>{item[1]}</div>
                <div onClick={() => removeInventory('X', idx)}>X</div>
              </div>
            ))}
            <div
              className={distyles.propertyOpenBox}
              onClick={() => changeOpenDetailProperty('X')}
            >
              x축 추가
            </div>
          </div>
          <div className={distyles.propertySection}>
            <h5>y축</h5>
            {yInventory.map((item, idx) => (
              <div
                key={idx}
                className={`${distyles.propertyOpenBox} ${distyles.selectedData} ${yDetail && selectDataIdx.current === idx ? distyles.selectedDataSelect : ''}`}
                onClick={() => chooseThisInventory(item[0], idx)}
              >
                <div>
                  {item[1]} ({item[2]})
                </div>
                <div onClick={() => removeInventory('Y', idx)}>X</div>
              </div>
            ))}
            <div
              className={distyles.propertyOpenBox}
              onClick={() => changeOpenDetailProperty('Y')}
            >
              y축 추가
            </div>
          </div>
          <div className={distyles.propertySection}>
            <h5>대분류</h5>
            {seriesInventory.map((item, idx) => (
              <div
                key={idx}
                className={`${distyles.propertyOpenBox} ${distyles.selectedData} ${seriesDetail && selectDataIdx.current === idx ? distyles.selectedDataSelect : ''}`}
                onClick={() => chooseThisInventory(item[0], idx)}
              >
                <div>{item[1]}</div>
                <div onClick={() => removeInventory('Series', idx)}>X</div>
              </div>
            ))}
            <div
              className={distyles.propertyOpenBox}
              onClick={() => changeOpenDetailProperty('Series')}
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
            <div>차트 종류 나열</div>
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
