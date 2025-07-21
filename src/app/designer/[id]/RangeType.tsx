'use client';

import {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  RefObject,
  // useRef,
  MouseEvent
} from 'react';
import { useMosaicStore } from '@/store/mosaicStore';
import { useInventoryStore } from '@/store/inventoryStore';
import distyles from './designerId.module.css';
import { calculate } from '@/utils/calculate';
import { saveImg, saveExcel } from '@/utils/export';
import { NumberProperty, NumberPropertyType } from '@/constants';

type NeededDataType = 'X' | 'Y';
const DrawType = [
  'bar',
  'stackedbar',
  'fullstackedbar',
  'line',
  'stackedline',
  'fullstackedline',
  'area',
  'stackedarea',
  'fullstackedarea'
] as const;

interface RangeTypeParameter {
  mosaicId: string;
  chartBoxRef: RefObject<HTMLDivElement | null>;
  openDataProperty: boolean;
  setOpenDataProperty: Dispatch<SetStateAction<boolean>>;
  openShareProperty: boolean;
  setOpenShareProperty: Dispatch<SetStateAction<boolean>>;
}

export default function RangeType({
  mosaicId,
  chartBoxRef,
  openDataProperty,
  setOpenDataProperty,
  openShareProperty,
  setOpenShareProperty
}: RangeTypeParameter) {
  const { mosaicProperty } = useMosaicStore();
  const { inventory, inventoryFormat, originalDataSource } =
    useInventoryStore();
  const [xInventory, setXInventory] = useState<string[][]>([]);
  const [yInventory, setYInventory] = useState<string[][]>([]);
  const [xDetail, setXDetail] = useState(false);
  const [yDetail, setYDetail] = useState(false);
  const [selectData, setSelectData] = useState<string | null>(null);
  const [selectDataIdx, setSelectDataIdx] = useState<number>(-1);
  const [drawType, setDrawType] = useState<(typeof DrawType)[number]>(
    DrawType[0]
  );
  const [calculateType, setCalculateType] = useState<NumberPropertyType>(
    NumberProperty[0]
  );
  const [dataSource, setDataSource] = useState<
    Record<string, string | number>[]>([]);
  const ExceptNumberProperty = ['카운트', '고유 카운트'];

  useEffect(() => {
    if (openDataProperty) return;
    setXDetail(false);
    setYDetail(false);
    setSelectData(null);
    setSelectDataIdx(-1);
  }, [openDataProperty]);

  useEffect(() => {
    if (!selectData) return;
    // click to item in [xDetail, yDetail, seriesDetail]
    changeOrAddInventory(selectData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectData, xDetail, yDetail, drawType, calculateType]);

  useEffect(() => {
    if (!xInventory.length || !yInventory.length) {
      setDataSource([]);
      return;
    }
    const xkeys = xInventory.map(item => item[0]);
    const ykeys = yInventory.map(item => item[0]);
    const format: Record<string, string | number | (string | number)[]>[] = [];
    const match: Record<string, number> = {};
    let cnt = 0;
    originalDataSource.forEach(item => {
      let formatIdx = 0;
      const keyword = xkeys.map(key => item[inventory[key]]).join('/');
      if (keyword in match) formatIdx = match[keyword];
      else {
        match[keyword] = cnt;
        formatIdx = cnt;
        cnt++;
        const newFormat: Record<string, string | number | number[]> = {
          [xkeys.join('/')]: keyword
        };
        ykeys.forEach((key, idx) => (newFormat[key + '-' + idx] = []));
        format.push(newFormat);
      }
      ykeys.forEach((key, idx) =>
        (format[formatIdx][key + '-' + idx] as (string | number)[]).push(
          item[inventory[key]]
        )
      );
    });

    const final: Record<string, string | number>[] = format.map(item => {
      ykeys.forEach((key, idx) => {
        item[key + '-' + idx] = calculate(
          yInventory[idx][3] as NumberPropertyType,
          item[key + '-' + idx] as number[]
        );
      });
      return item as Record<string, string | number>;
    });
    console.log('check graph data', final);
    setDataSource(final);
  }, [inventory, originalDataSource, xInventory, yInventory]);

  // useEffect(() => {
  //   if (!dataSource.length) return;
  //   const parent = document.getElementById('chartBox');
  //   if (!parent || !chartRef.current) return;
  //   let timeout: ReturnType<typeof setTimeout> | null = null;
  //   const observer = new ResizeObserver(() => {
  //     if (timeout) clearTimeout(timeout);
  //     timeout = setTimeout(() => {
  //       chartRef.current?.instance?.render();
  //     }, 300); // render after 300ms from stoppipng resizing
  //   });
  //   observer.observe(parent);
  //   return () => {
  //     observer.disconnect();
  //     if (timeout) clearTimeout(timeout);
  //   };
  // }, [dataSource]);

  function openDetailProperty(flag: NeededDataType) {
    setXDetail(false);
    setYDetail(false);
    setSelectData(null);
    setDrawType(DrawType[0]);
    setCalculateType(NumberProperty[0]);
    switch (flag) {
      case 'X':
        setXDetail(true);
        setSelectDataIdx(xInventory.length);
        break;
      case 'Y':
        setYDetail(true);
        setSelectDataIdx(yInventory.length);
        break;
      default:
        console.error('error!');
        break;
    }
  }

  function removeInventory(
    e: MouseEvent<HTMLDivElement>,
    flag: NeededDataType,
    idx: number
  ) {
    e.stopPropagation();
    const [selectedInventory, setSelectedInventory] =
      flag === 'X' ? [xInventory, setXInventory] : [yInventory, setYInventory];
    const left = selectedInventory.slice(0, idx);
    const right = selectedInventory.slice(idx + 1);
    setSelectedInventory([...left, ...right]);
    setSelectData(null);
    setSelectDataIdx(-1);
  }

  function changeOrAddInventory(item: string) {
    if (!xDetail && !yDetail) return;
    const [selectedInventory, setSelectedInventory] = xDetail
      ? [xInventory, setXInventory]
      : [yInventory, setYInventory];
    const left = selectedInventory.slice(0, selectDataIdx);
    const right = selectedInventory.slice(selectDataIdx + 1);
    const newValue: string[][] = [];
    if (xDetail) {
      // realname, alias
      newValue.push([item, item]);
    } else if (yDetail) {
      let nowCalculateType = calculateType;
      if (
        inventoryFormat[item] !== 'number' &&
        !ExceptNumberProperty.includes(calculateType)
      ) {
        setCalculateType(NumberProperty[0]);
        nowCalculateType = NumberProperty[0];
      }
      // realname, alias, drawType, calculateType
      newValue.push([item, item, drawType, nowCalculateType]);
    }
    setSelectedInventory([...left, ...newValue, ...right]);
  }

  function ViewAllData() {
    const inventoryKeys = Object.keys(inventory);
    return (
      <div className={distyles.dataBox}>
        <div className={distyles.header}>header</div>
        {inventoryKeys.map(item => (
          <div
            key={item}
            className={`${distyles.dataItem} ${item === selectData ? distyles.dataItemSelect : ''}`}
            onClick={() => setSelectData(item)}>
            <div>{item}</div>
            <div>{inventoryFormat[item]}</div>
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
    switch (flag) {
      case 'X':
        setXDetail(true);
        break;
      case 'Y':
        setYDetail(true);
        setDrawType(item[2] as (typeof DrawType)[number]);
        setCalculateType(item[3] as NumberPropertyType);
        break;
      default:
        console.error('error');
        break;
    }
  }

  return (
    <>
      {mosaicProperty === mosaicId && openDataProperty ? (
        <div
          className={distyles.openProperty}
          onClick={e => e.stopPropagation()}>
          <div className={distyles.title}>
            <div>데이터 연결</div>
            <div
              className={distyles.close}
              onClick={() => setOpenDataProperty(false)}>
              X
            </div>
          </div>
          <div className={distyles.propertySection}>
            <h5>x축</h5>
            {xInventory.map((item, idx) => (
              <div
                key={idx}
                className={`${distyles.propertyOpenBox} ${distyles.selectedData} ${xDetail && selectDataIdx === idx ? distyles.selectedDataSelect : ''}`}
                onClick={() => chooseThisInventory('X', item, idx)}>
                <div>{item[1]}</div>
                <div onClick={e => removeInventory(e, 'X', idx)}>X</div>
              </div>
            ))}
            <div
              className={distyles.propertyOpenBox}
              onClick={() => openDetailProperty('X')}>
              x축 추가
            </div>
          </div>
          <div className={distyles.propertySection}>
            <h5>y축</h5>
            {yInventory.map((item, idx) => (
              <div
                key={idx}
                className={`${distyles.propertyOpenBox} ${distyles.selectedData} ${yDetail && selectDataIdx === idx ? distyles.selectedDataSelect : ''}`}
                onClick={() => chooseThisInventory('Y', item, idx)}>
                <div>
                  {item[1]}
                  {item[2]} ({item[3]})
                </div>
                <div onClick={e => removeInventory(e, 'Y', idx)}>X</div>
              </div>
            ))}
            <div
              className={distyles.propertyOpenBox}
              onClick={() => openDetailProperty('Y')}>
              y축 추가
            </div>
          </div>
        </div>
      ) : null}

      {mosaicProperty === mosaicId && openDataProperty && xDetail ? (
        <div
          className={distyles.propertyDetail}
          onClick={e => e.stopPropagation()}>
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
        <div
          className={distyles.propertyDetail}
          onClick={e => e.stopPropagation()}>
          <div className={distyles.header} onClick={() => setYDetail(false)}>
            뒤로
          </div>
          <div className={distyles.drawer} style={{ borderTop: 'none' }}>
            <h5>차트 타입</h5>
            {DrawType.map(item => (
              <div
                key={item}
                className={`${distyles.drawType} ${drawType === item ? distyles.drawTypeSelect : ''}`}
                onClick={() => setDrawType(item)}>
                {item}
              </div>
            ))}
          </div>
          <div className={distyles.drawer}>
            <h5>데이터 선택</h5>
            <ViewAllData />
            <h5>집계 방식 선택</h5>
            {selectData && inventoryFormat[selectData] === 'number'
              ? NumberProperty.map(item => (
                  <div
                    key={item}
                    className={`${distyles.calculateType} ${calculateType === item ? distyles.calculateTypeSelect : ''}`}
                    onClick={() => setCalculateType(item)}>
                    {item}
                  </div>
                ))
              : ExceptNumberProperty.map(item => (
                  <div
                    key={item}
                    className={`${distyles.calculateType} ${calculateType === item ? distyles.calculateTypeSelect : ''}`}
                    onClick={() => setCalculateType(item as NumberPropertyType)}>
                    {item}
                  </div>
                ))}
          </div>
          <div className={distyles.drawer}>
            <h5>데이터명 바꾸기</h5>
            <div>데이터명</div>
          </div>
        </div>
      ) : null}

      {mosaicProperty === mosaicId && openShareProperty ? (
        <div
          id="shareSection"
          className={distyles.openProperty}
          onClick={e => e.stopPropagation()}>
          <div>
            <div
              className={distyles.propertyOpenBox}
              onClick={() => saveImg(chartBoxRef, 'pdf')}>
              pdf
            </div>
            <div
              className={distyles.propertyOpenBox}
              onClick={() => saveImg(chartBoxRef, 'png')}>
              이미지
            </div>
            <div
              className={distyles.propertyOpenBox}
              onClick={() => saveExcel(dataSource)}>
              excel
            </div>
          </div>
          <div onClick={() => setOpenShareProperty(false)}>닫기</div>
        </div>
      ) : null}

      <div id="chartBox" className={distyles.chartBox}></div>
    </>
  );
}
