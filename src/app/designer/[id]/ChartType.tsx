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
import {
  ArgumentAxis,
  Chart,
  Chart as ChartComponent,
  CommonSeriesSettings,
  Export,
  Label,
  Legend,
  Series,
  Tooltip,
  ZoomAndPan
} from 'devextreme-react/chart';
import { NumberProperty, NumberPropertyType } from '@/constants';
import { calculate } from '@/utils/calculate';
import { saveImg, saveExcel } from '@/utils/export';
import { isSameSource } from '@/utils/isSameSource';
import { useMosaicStore } from '@/store/mosaicStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useSourceStore } from '@/store/sourceStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useFilterStore } from '@/store/filterStore';
import distyles from './designerId.module.css';

type NeededDataType = 'X' | 'Y' | 'Series';
const DrawType = [
  'bar',
  'stackedbar',
  'fullstackedbar',
  'point',
  'line',
  'stackedline',
  'fullstackedline',
  'stepline',
  'spline',
  'area',
  'stackedarea',
  'fullstackedarea',
  'steparea',
  'splinearea',
  'stackedsplinearea',
  'fullstackedsplinearea'
] as const;

interface ChartTypeParameter {
  mosaicId: string;
  chartBoxRef: RefObject<HTMLDivElement | null>;
  openDataProperty: boolean;
  setOpenDataProperty: Dispatch<SetStateAction<boolean>>;
  openShareProperty: boolean;
  setOpenShareProperty: Dispatch<SetStateAction<boolean>>;
}

export default function ChartType({
  mosaicId,
  chartBoxRef,
  openDataProperty,
  setOpenDataProperty,
  openShareProperty,
  setOpenShareProperty
}: ChartTypeParameter) {
  const { mosaicProperty } = useMosaicStore();
  const { inventory, inventoryFormat, originalDataSource } =
    useInventoryStore();
  const { source, setSource } = useSourceStore();
  const { unit, setUnit } = useDashboardStore();
  const { filterList, setFilterList } = useFilterStore();
  // const [usedSource, setUsedSource] = useState<string>(''); // after process
  const [usedSource, setUsedSource] = useState<string>(source); // now process -> delete after
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
  const [calculateType, setCalculateType] = useState<NumberPropertyType>(
    NumberProperty[0]
  );
  const [dataSource, setDataSource] = useState<
    Record<string, string | number>[]>([]);
  const ExceptNumberProperty = ['카운트', '고유 카운트'];
  const chartRef = useRef<ChartComponent>(null);

  useEffect(() => {
    if (openDataProperty) return;
    setXDetail(false);
    setYDetail(false);
    setSeriesDetail(false);
    setSelectData(null);
    setSelectDataIdx(-1);
  }, [openDataProperty]);

  useEffect(() => {
    if (filterList.includes(mosaicId)) {
      makeDataSource();
      setFilterList(filterList.filter(item => item !== mosaicId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterList, mosaicId]);

  // now process -> delete after
  useEffect(() => {
    if (mosaicProperty === mosaicId) setUsedSource(source);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  // now process -> delete after
  useEffect(() => {
    if (mosaicProperty === mosaicId) setSource(usedSource);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mosaicProperty, mosaicId]);

  // after process
  // useEffect(() => {
  //   if (mosaicProperty === mosaicId && usedSource!=='') setSource(usedSource);
  // },[mosaicProperty,mosaicId]);

  useEffect(() => {
    if (usedSource === '' || source === '') return;
    // if usedSource is not in inventory, display error view
    chartBoxRef.current!.style.background = !Object.keys(inventory).includes(
      usedSource
    )
      ? 'rgba(255, 0, 0, 0.2)'
      : 'white';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventory]);

  useEffect(() => {
    if (!selectData) return;
    // click to item in [xDetail, yDetail, seriesDetail]
    changeOrAddInventory(selectData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectData, xDetail, yDetail, seriesDetail, drawType, calculateType]);

  useEffect(() => {
    if (!xInventory.length || !yInventory.length) {
      setDataSource([]);
      return;
    }
    const xkeys = [
      ...seriesInventory.map(item => item[0]),
      ...xInventory.map(item => item[0])
    ];
    const ykeys = yInventory.map(item => item[0]);
    if (!isSameSource([...xkeys, ...ykeys], inventory)) {
      setXInventory([]);
      setYInventory([]);
      setSeriesInventory([]);
      setDataSource([]);
      setUsedSource('');
      return;
    }
    setUsedSource(source);
    makeDataSource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xInventory, yInventory, seriesInventory]);

  useEffect(() => {
    if (!dataSource.length) {
      const prevUnit = JSON.parse(JSON.stringify(unit));
      prevUnit[mosaicId].source = source;
      prevUnit[mosaicId].unitInventory = {};
      setUnit(prevUnit);
      return;
    }

    const parent = document.getElementById('chartBox');
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

  function makeDataSource() {
    const xkeys = [
      ...seriesInventory.map(item => item[0]),
      ...xInventory.map(item => item[0])
    ];
    const ykeys = yInventory.map(item => item[0]);

    const format: Record<string, string | number | (string | number)[]>[] = [];
    const match: Record<string, number> = {};
    let cnt = 0;
    originalDataSource[usedSource].forEach(item => {
      if (isFiltered(item)) return;
      let formatIdx = 0;
      const keyword = xkeys
        .map(key => item[inventory[usedSource][key]])
        .join('/');
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
          item[inventory[usedSource][key]]
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
    const prevUnit = JSON.parse(JSON.stringify(unit));
    prevUnit[mosaicId].unitInventory = {
      xInventory: [...xInventory.map(item => [...item])],
      yInventory: [...yInventory.map(item => [...item])],
      seriesInventory: [...seriesInventory.map(item => [...item])]
    };
    setUnit(prevUnit);
  }

  function isFiltered(arr: (string | number)[]) {
    for (let i = 0; i < unit[mosaicId].filterId.length; i++) {
      const fid = unit[mosaicId].filterId[i];
      const filterNumKeys = Object.keys(unit[fid].filterNum);
      for (let j = 0; j < filterNumKeys.length; j++) {
        const fkey = filterNumKeys[j];
        const filterArr = unit[fid].filterNum[filterNumKeys[j]];
        if (typeof filterArr[0] === 'number') {
          const value = arr[inventory[usedSource][fkey]];
          if (
            filterArr[0] <= (value as number) &&
            (value as number) <= (filterArr[1] as number)
          )
            continue;
          return true;
        } else {
          const value = new Date(arr[inventory[usedSource][fkey]]).getTime();
          if (
            new Date(filterArr[0]).getTime() <= value &&
            value <= new Date(filterArr[1]).getTime()
          )
            continue;
          return true;
        }
      }
    }
    return false;
  }

  function openDetailProperty(flag: NeededDataType) {
    setXDetail(false);
    setYDetail(false);
    setSeriesDetail(false);
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
      case 'Series':
        setSeriesDetail(true);
        setSelectDataIdx(seriesInventory.length);
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
    if (!xDetail && !yDetail && !seriesDetail) return;
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
      let nowCalculateType = calculateType;
      if (
        inventoryFormat[usedSource][item] !== 'number' &&
        !ExceptNumberProperty.includes(calculateType)
      ) {
        setCalculateType(NumberProperty[0]);
        nowCalculateType = NumberProperty[0];
      }
      // realname, alias, drawType, calculateType
      newValue.push([item, item, drawType, nowCalculateType]);
    } else if (seriesDetail) {
      // realname, alias
      newValue.push([item, item]);
    }
    setSelectedInventory([...left, ...newValue, ...right]);
  }

  function ViewAllData() {
    if (!usedSource) return null;
    const inventoryKeys = Object.keys(inventory[usedSource]);
    return (
      <div className={distyles.dataBox}>
        <div className={distyles.header}>header</div>
        {inventoryKeys.map(item => (
          <div
            key={item}
            className={`${distyles.dataItem} ${item === selectData ? distyles.dataItemSelect : ''}`}
            onClick={() => setSelectData(item)}>
            <div>{item}</div>
            <div>{inventoryFormat[usedSource][item]}</div>
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
        setCalculateType(item[3] as NumberPropertyType);
        break;
      case 'Series':
        setSeriesDetail(true);
        break;
      default:
        console.error('error');
        break;
    }
  }

  function customizeTooltip(arg: {
    argumentText: string;
    seriesName: string;
    valueText: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    point: any;
  }) {
    const keys = Object.keys(arg.point.data);
    const xName = [
      ...seriesInventory.map(item => item[0]),
      ...xInventory.map(item => item[0])
    ].join('/');
    const texts = keys
      .map(item => {
        if (xName.includes(item)) return `<br />${arg.point.data[item]}`;
        return `<br />${item.slice(0, item.lastIndexOf('-'))}: ${arg.point.data[item]}`;
      })
      .join('');
    return seriesInventory.length
      ? { text: `${texts}` }
      : {
          text: `${arg.argumentText}<br />${arg.seriesName}: ${arg.valueText} `
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
          <div className={distyles.propertySection}>
            <h5>대분류</h5>
            {seriesInventory.map((item, idx) => (
              <div
                key={idx}
                className={`${distyles.propertyOpenBox} ${distyles.selectedData} ${seriesDetail && selectDataIdx === idx ? distyles.selectedDataSelect : ''}`}
                onClick={() => chooseThisInventory('Series', item, idx)}>
                <div>{item[1]}</div>
                <div onClick={e => removeInventory(e, 'Series', idx)}>X</div>
              </div>
            ))}
            <div
              className={distyles.propertyOpenBox}
              onClick={() => openDetailProperty('Series')}>
              대분류 추가
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
            usedSource &&
            inventoryFormat[usedSource][selectData] === 'number'
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

      {mosaicProperty === mosaicId && openDataProperty && seriesDetail ? (
        <div
          className={distyles.propertyDetail}
          onClick={e => e.stopPropagation()}>
          <div
            className={distyles.header}
            onClick={() => setSeriesDetail(false)}>
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
          <Chart
            id="chart"
            height="100%"
            ref={chartRef}
            title="Teresa BI"
            dataSource={dataSource}
            redrawOnResize={true}>
            <CommonSeriesSettings
              argumentField={[
                ...seriesInventory.map(item => item[0]),
                ...xInventory.map(item => item[0])
              ].join('/')} // x value
              hoverMode={
                seriesInventory.length ? 'allArgumentPoints' : 'onlyPoint'
              }
              selectionMode={
                seriesInventory.length ? 'allArgumentPoints' : 'onlyPoint'
              } />
            {yInventory
              .map((item, idx) => [item[0], item[1], item[2], idx])
              .map(([original, alias, drawtype, idx]) => (
                <Series
                  key={original + String(idx)}
                  valueField={original + '-' + idx} // y value
                  type={drawtype === 'point' ? 'line' : drawtype}
                  width={drawtype === 'point' ? 0 : 2}
                  name={alias} />
              ))}

            {/* customize x layer name */}
            <ArgumentAxis>
              <Label
                customizeText={({ valueText }: { valueText: string }) =>
                  `X: ${valueText}`
                } />
            </ArgumentAxis>

            {/* location of chart property */}
            <Legend verticalAlignment="bottom" horizontalAlignment="center" />

            <Tooltip enabled={true} customizeTooltip={customizeTooltip} />
            <ZoomAndPan argumentAxis="both" valueAxis="both" />
            <Export enabled={true} />
          </Chart>
        ) : null}
      </div>
    </>
  );
}
