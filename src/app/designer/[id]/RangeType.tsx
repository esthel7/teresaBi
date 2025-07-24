'use client';

import {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  RefObject,
  useRef,
  MouseEvent
} from 'react';
import RangeSelector, {
  RangeSelector as RangeComponent,
  Chart,
  CommonSeriesSettings,
  Series,
  Scale
} from 'devextreme-react/range-selector';
import { useMosaicStore } from '@/store/mosaicStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useSourceStore } from '@/store/sourceStore';
import { useDashboardStore } from '@/store/dashboardStore';
import distyles from './designerId.module.css';
import { calculate } from '@/utils/calculate';
import { saveImg, saveExcel } from '@/utils/export';
import { isSameSource } from '@/utils/isSameSource';
import { NumberProperty, NumberPropertyType } from '@/constants';
import 'devextreme/dist/css/dx.light.css';

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
  const { source } = useSourceStore();
  const { unit, setUnit } = useDashboardStore();
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
  const rangeRef = useRef<RangeComponent>(null);
  const [range, setRange] = useState<(number | string)[]>([]);

  useEffect(() => {
    const prevUnit = JSON.parse(JSON.stringify(unit));
    prevUnit[mosaicId].type = 'filter';
    setUnit(prevUnit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const xkey = xInventory[0][0];
    const ykey = yInventory[0][0];
    if (!isSameSource([xkey, ykey], inventory)) {
      setXInventory([]);
      setYInventory([]);
      setDataSource([]);
      return;
    }
    const format: Record<string, string | number | (string | number)[]>[] = [];
    const match: Record<string, number> = {};
    let cnt = 0;
    const sortedOriginalDataSource = [...originalDataSource[source]].sort(
      (a, b) => {
        return inventoryFormat[source][xkey] === 'number'
          ? (a[inventory[source][xkey]] as number) -
              (b[inventory[source][xkey]] as number)
          : new Date(a[inventory[source][xkey]]).getTime() -
              new Date(b[inventory[source][xkey]]).getTime();
      }
    );
    sortedOriginalDataSource.forEach(item => {
      let formatIdx = 0;
      const keyword = item[inventory[source][xkey]];
      if (keyword in match) formatIdx = match[keyword];
      else {
        match[keyword] = cnt;
        formatIdx = cnt;
        cnt++;
        const newFormat: Record<string, string | number | number[]> = {
          [xkey]: keyword
        };
        newFormat[ykey] = [];
        format.push(newFormat);
      }
      (format[formatIdx][ykey] as (string | number)[]).push(
        item[inventory[source][ykey]]
      );
    });

    const final: Record<string, string | number>[] = format.map(item => {
      item[ykey] = calculate(
        yInventory[0][3] as NumberPropertyType,
        item[ykey] as number[]
      );
      return item as Record<string, string | number>;
    });
    console.log('check graph data', final);
    setDataSource(final);
    setRange([
      final[0][xkey] as number,
      final[final.length - 1][xkey] as number
    ]);
    const prevUnit = JSON.parse(JSON.stringify(unit));
    prevUnit[mosaicId].unitInventory = {
      xInventory: [...xInventory.map(item => [...item])],
      yInventory: [...yInventory.map(item => [...item])]
    };
    prevUnit[mosaicId].filterNum = {
      [xkey]: [
        final[0][xkey] as number | string,
        final[final.length - 1][xkey] as number | string
      ]
    };
    setUnit(prevUnit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventory, inventoryFormat, originalDataSource, xInventory, yInventory]);

  useEffect(() => {
    if (!dataSource.length) {
      const prevUnit = JSON.parse(JSON.stringify(unit));
      prevUnit[mosaicId].type = 'range';
      prevUnit[mosaicId].unitInventory = {};
      prevUnit[mosaicId].filterNum = {};
      setUnit(prevUnit);
      setRange([]);
      return;
    }
    const parent = document.getElementById('chartBox');
    if (!parent || !rangeRef.current) return;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const observer = new ResizeObserver(() => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        rangeRef.current?.instance?.render();
      }, 300); // render after 300ms from stoppipng resizing
    });
    observer.observe(parent);
    return () => {
      observer.disconnect();
      if (timeout) clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource]);

  function openDetailProperty(flag: NeededDataType) {
    setXDetail(false);
    setYDetail(false);
    setSelectData(null);
    switch (flag) {
      case 'X':
        if (xInventory.length) break;
        setXDetail(true);
        setSelectDataIdx(xInventory.length);
        break;
      case 'Y':
        if (yInventory.length) break;
        setYDetail(true);
        setSelectDataIdx(yInventory.length);
        setDrawType(DrawType[0]);
        setCalculateType(NumberProperty[0]);
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
    setDataSource([]);
    setSelectData(null);
    setSelectDataIdx(-1);
  }

  function changeOrAddInventory(item: string) {
    if (!xDetail && !yDetail) return;
    if (xDetail) {
      if (
        inventoryFormat[source][item] !== 'number' &&
        inventoryFormat[source][item] !== 'Date'
      ) {
        alert('number 혹은 Date 형식만 가능합니다.');
        return;
      }
      if (xInventory.length && xInventory[0][0] === item) return;
      // realname, alias
      setXInventory([[item, item]]);
    } else if (yDetail) {
      let nowCalculateType = calculateType;
      if (
        inventoryFormat[source][item] !== 'number' &&
        !ExceptNumberProperty.includes(calculateType)
      ) {
        if (calculateType !== NumberProperty[0])
          setCalculateType(NumberProperty[0]);
        nowCalculateType = NumberProperty[0];
      }
      if (yInventory.length && yInventory[0][0] === item) return;
      // realname, alias, drawType, calculateType
      setYInventory([[item, item, drawType, nowCalculateType]]);
    }
  }

  function ViewAllData() {
    if (!source) return null;
    const inventoryKeys = Object.keys(inventory[source]);
    return (
      <div className={distyles.dataBox}>
        <div className={distyles.header}>header</div>
        {inventoryKeys.map(item => (
          <div
            key={item}
            className={`${distyles.dataItem} ${item === selectData ? distyles.dataItemSelect : ''}`}
            onClick={() => setSelectData(item)}>
            <div>{item}</div>
            <div>{inventoryFormat[source][item]}</div>
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function filterRange({ value }: { value: any[] }) {
    setRange(value as (number | string)[]);
    const xkey = xInventory[0][0];
    const prevUnit = JSON.parse(JSON.stringify(unit));
    prevUnit[mosaicId].filterNum = {
      [xkey]: [value[0] as number | string, value[1] as number | string]
    };
    setUnit(prevUnit);
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
            {selectData &&
            source &&
            inventoryFormat[source][selectData] === 'number'
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

      <div id="chartBox" className={distyles.chartBox}>
        {dataSource.length ? (
          <RangeSelector
            id="chart"
            height="100%"
            ref={rangeRef}
            dataSource={dataSource}
            value={range}
            onValueChanged={filterRange}>
            <Scale
              startValue={dataSource[0][xInventory[0][0]]}
              endValue={dataSource[dataSource.length - 1][xInventory[0][0]]} />
            <Chart>
              <CommonSeriesSettings argumentField={xInventory[0][0]} />
              <Series
                key={yInventory[0][0]}
                valueField={yInventory[0][0]} // y value
                type={drawType}
                name={yInventory[0][1]} />
            </Chart>
          </RangeSelector>
        ) : null}
      </div>
    </>
  );
}
