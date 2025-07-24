'use client';

import {
  Dispatch,
  MouseEvent,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState
} from 'react';
import {
  ArgumentAxis,
  Chart,
  Chart as ChartComponent,
  CommonSeriesSettings,
  Export,
  Format,
  Label,
  Reduction,
  Series,
  Title,
  Tooltip,
  ValueAxis
} from 'devextreme-react/chart';
import { dateFormat } from '@/utils/dateFormat';
import { saveExcel, saveImg } from '@/utils/export';
import { isSameSource } from '@/utils/isSameSource';
import { useDashboardStore } from '@/store/dashboardStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useMosaicStore } from '@/store/mosaicStore';
import { useSourceStore } from '@/store/sourceStore';
import { DateProperty, DatePropertyType } from '@/constants';
import distyles from './designerId.module.css';

type NeededDataType = 'Date' | 'Value';
const DrawType = ['stock', 'candlestick'] as const;

interface FinancialTypeParameter {
  mosaicId: string;
  chartBoxRef: RefObject<HTMLDivElement | null>;
  openDataProperty: boolean;
  setOpenDataProperty: Dispatch<SetStateAction<boolean>>;
  openShareProperty: boolean;
  setOpenShareProperty: Dispatch<SetStateAction<boolean>>;
}

export default function FinancialType({
  mosaicId,
  chartBoxRef,
  openDataProperty,
  setOpenDataProperty,
  openShareProperty,
  setOpenShareProperty
}: FinancialTypeParameter) {
  const { mosaicProperty } = useMosaicStore();
  const { inventory, inventoryFormat, originalDataSource } =
    useInventoryStore();
  const { source } = useSourceStore();
  const { unit, setUnit } = useDashboardStore();
  const [dateInventory, setDateInventory] = useState<string[][]>([]);
  const [valueInventory, setValueInventory] = useState<string[][]>([]);
  const [dateDetail, setDateDetail] = useState(false);
  const [valueDetail, setValueDetail] = useState(false);
  const [selectData, setSelectData] = useState<string | null>(null);
  const [selectDataIdx, setSelectDataIdx] = useState<number>(-1);
  const [dateType, setDateType] = useState<DatePropertyType>(DateProperty[0]);
  const [drawType, setDrawType] = useState<(typeof DrawType)[number]>(
    DrawType[0]
  );
  const [dataSource, setDataSource] = useState<
    Record<string, string | number>[]>([]);
  const chartRef = useRef<ChartComponent>(null);

  useEffect(() => {
    if (openDataProperty) return;
    setDateDetail(false);
    setValueDetail(false);
    setSelectData(null);
    setSelectDataIdx(-1);
  }, [openDataProperty]);

  useEffect(() => {
    if (!selectData) return;
    // click to item in [dateDetail, valueDetail]
    changeOrAddInventory(selectData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectData, dateDetail, valueDetail, drawType]);

  useEffect(() => {
    if (!dateInventory.length || !valueInventory.length) {
      setDataSource([]);
      return;
    }
    const datekey = dateInventory[0][0];
    const valuekey = valueInventory[0][0];
    if (!isSameSource([datekey, valuekey], inventory)) {
      setDateInventory([]);
      setValueInventory([]);
      setDataSource([]);
      return;
    }
    const format: Record<string, string | number | (string | number)[]>[] = [];
    const match: Record<string, number> = {};
    let cnt = 0;
    const sortedOriginalDataSource = [...originalDataSource[source]].sort(
      (a, b) =>
        new Date(a[inventory[source][datekey]]).getTime() -
        new Date(b[inventory[source][datekey]]).getTime()
    );
    sortedOriginalDataSource.forEach(item => {
      let formatIdx = 0;
      const keyword = dateFormat(
        dateType,
        item[inventory[source][datekey]] as string
      );
      if (keyword in match) formatIdx = match[keyword];
      else {
        match[keyword] = cnt;
        formatIdx = cnt;
        cnt++;
        const newFormat: Record<string, string | number | number[]> = {
          [datekey]: keyword
        };
        newFormat[valuekey] = [];
        format.push(newFormat);
      }
      (format[formatIdx][valuekey] as (string | number)[]).push(
        item[inventory[source][valuekey]]
      );
    });

    const final: Record<string, string | number>[] = format.map(item => {
      const valueArray = item[valuekey] as number[];
      item['open'] = valueArray[0];
      item['close'] = valueArray[valueArray.length - 1];
      item['high'] = Math.max(...valueArray);
      item['low'] = Math.min(...valueArray);
      delete item[valuekey];
      return item as Record<string, string | number>;
    });
    console.log('check graph data', final);
    setDataSource(final);
    const prevUnit = JSON.parse(JSON.stringify(unit));
    prevUnit[mosaicId].unitInventory = {
      dateInventory: [...dateInventory.map(item => [...item])],
      valueInventory: [...valueInventory.map(item => [...item])]
    };
    setUnit(prevUnit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventory, originalDataSource, dateInventory, valueInventory, dateType]);

  useEffect(() => {
    if (!dataSource.length) {
      const prevUnit = JSON.parse(JSON.stringify(unit));
      prevUnit[mosaicId].unitInventory = {};
      setUnit(prevUnit);
      return;
    }
    const parent = document.getElementById(`chartBox ${mosaicId}`);
    if (!parent || !chartRef.current) return;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const observer = new ResizeObserver(() => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        chartRef.current?.instance?.render();
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
    setDateDetail(false);
    setValueDetail(false);
    setSelectData(null);
    setDrawType(DrawType[0]);
    switch (flag) {
      case 'Date':
        setDateDetail(true);
        setSelectDataIdx(dateInventory.length);
        break;
      case 'Value':
        setValueDetail(true);
        setSelectDataIdx(valueInventory.length);
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
      flag === 'Date'
        ? [dateInventory, setDateInventory]
        : [valueInventory, setValueInventory];
    const left = selectedInventory.slice(0, idx);
    const right = selectedInventory.slice(idx + 1);
    setSelectedInventory([...left, ...right]);
    setDataSource([]);
    setSelectData(null);
    setSelectDataIdx(-1);
  }

  function changeOrAddInventory(item: string) {
    if (!dateDetail && !valueDetail) return;
    if (dateDetail && inventoryFormat[source][item] !== 'Date') {
      alert('Date형만 가능합니다.');
      return;
    }
    if (valueDetail && inventoryFormat[source][item] !== 'number') {
      alert('Number형만 가능합니다.');
      return;
    }
    const [selectedInventory, setSelectedInventory] = dateDetail
      ? [dateInventory, setDateInventory]
      : [valueInventory, setValueInventory];
    const left = selectedInventory.slice(0, selectDataIdx);
    const right = selectedInventory.slice(selectDataIdx + 1);
    const newValue = [[item, item]]; // realname, alias
    setSelectedInventory([...left, ...newValue, ...right]);
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
    setDateDetail(false);
    setValueDetail(false);
    switch (flag) {
      case 'Date':
        setDateDetail(true);
        break;
      case 'Value':
        setValueDetail(true);
        break;
      default:
        console.error('error');
        break;
    }
  }

  function customizeTooltip(arg: {
    openValue: number;
    closeValue: number;
    highValue: number;
    lowValue: number;
  }) {
    return {
      text: `Open: ${arg.openValue}<br/>
Close: ${arg.closeValue}<br/>
High: ${arg.highValue}<br/>
Low: ${arg.lowValue}<br/>`
    };
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
            <h5>Date</h5>
            {dateInventory.map((item, idx) => (
              <div
                key={idx}
                className={`${distyles.propertyOpenBox} ${distyles.selectedData} ${dateDetail && selectDataIdx === idx ? distyles.selectedDataSelect : ''}`}
                onClick={() => chooseThisInventory('Date', item, idx)}>
                <div>{item[1]}</div>
                <div onClick={e => removeInventory(e, 'Date', idx)}>X</div>
              </div>
            ))}
            <div
              className={distyles.propertyOpenBox}
              onClick={() => openDetailProperty('Date')}>
              Date 추가
            </div>
          </div>
          <div className={distyles.propertySection}>
            <h5>value</h5>
            {valueInventory.map((item, idx) => (
              <div
                key={idx}
                className={`${distyles.propertyOpenBox} ${distyles.selectedData} ${valueDetail && selectDataIdx === idx ? distyles.selectedDataSelect : ''}`}
                onClick={() => chooseThisInventory('Value', item, idx)}>
                <div>{item[1]}</div>
                <div onClick={e => removeInventory(e, 'Value', idx)}>X</div>
              </div>
            ))}
            <div
              className={distyles.propertyOpenBox}
              onClick={() => openDetailProperty('Value')}>
              Value 추가
            </div>
          </div>
        </div>
      ) : null}

      {mosaicProperty === mosaicId && openDataProperty && dateDetail ? (
        <div
          className={distyles.propertyDetail}
          onClick={e => e.stopPropagation()}>
          <div className={distyles.header} onClick={() => setDateDetail(false)}>
            뒤로
          </div>
          <div className={distyles.drawer} style={{ borderTop: 'none' }}>
            <h5>데이터 선택</h5>
            <ViewAllData />
            <h5>그룹 간격</h5>
            {DateProperty.map(item => (
              <div
                key={item}
                className={`${distyles.drawType} ${dateType === item ? distyles.drawTypeSelect : ''}`}
                onClick={() => setDateType(item)}>
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

      {mosaicProperty === mosaicId && openDataProperty && valueDetail ? (
        <div
          className={distyles.propertyDetail}
          onClick={e => e.stopPropagation()}>
          <div
            className={distyles.header}
            onClick={() => setValueDetail(false)}>
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

      <div id={`chartBox ${mosaicId}`} className={distyles.chartBox}>
        {dataSource.length ? (
          <Chart
            id="chart"
            ref={chartRef}
            title="Stock"
            dataSource={dataSource}>
            <CommonSeriesSettings
              argumentField={dateInventory[0][0]}
              type={drawType} />
            <Series
              name={valueInventory[0][1]}
              openValueField="open"
              highValueField="high"
              lowValueField="low"
              closeValueField="close">
              <Reduction color="red" />
            </Series>

            {/* x value */}
            <ArgumentAxis argumentType="string" />

            {/* y value interval */}
            <ValueAxis tickInterval={1}>
              <Title text="Number View" />
              <Label>
                <Format precision={0} />
              </Label>
            </ValueAxis>

            <Export enabled={true} />
            <Tooltip
              enabled={true}
              customizeTooltip={customizeTooltip}
              location="edge" />
          </Chart>
        ) : null}
      </div>
    </>
  );
}
