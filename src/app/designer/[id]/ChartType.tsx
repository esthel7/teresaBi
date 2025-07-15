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
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { NumberProperty, NumberPropertyType } from '@/constants';
import distyles from './designerId.module.css';
import { calculate } from '@/utils/calculate';

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
  inventory: RefObject<Record<string, number>>;
  inventoryFormat: RefObject<Record<string, string>>;
  originalDataSource: RefObject<(string | number)[][]>;
  mosaicProperty: string | null;
  mosaicId: string;
  chartBoxRef: RefObject<HTMLDivElement | null>;
  openDataProperty: boolean;
  setOpenDataProperty: Dispatch<SetStateAction<boolean>>;
  openShareProperty: boolean;
  setOpenShareProperty: Dispatch<SetStateAction<boolean>>;
}

export default function ChartType({
  inventory,
  originalDataSource,
  inventoryFormat,
  mosaicProperty,
  mosaicId,
  chartBoxRef,
  openDataProperty,
  setOpenDataProperty,
  openShareProperty,
  setOpenShareProperty
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
    const format: Record<string, string | number | (string | number)[]>[] = [];
    const match: Record<string, number> = {};
    let cnt = 0;
    originalDataSource.current.forEach(item => {
      let formatIdx = 0;
      const keyword = xkeys.map(key => item[inventory.current[key]]).join('/');
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
          item[inventory.current[key]]
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
  }, [inventory, originalDataSource, xInventory, yInventory, seriesInventory]);

  useEffect(() => {
    if (!dataSource.length) return;
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
  }, [dataSource]);

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
        inventoryFormat.current[item] !== 'number' &&
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
    const inventoryKeys = Object.keys(inventory.current);
    return (
      <div className={distyles.dataBox}>
        <div className={distyles.header}>header</div>
        {inventoryKeys.map(item => (
          <div
            key={item}
            className={`${distyles.dataItem} ${item === selectData ? distyles.dataItemSelect : ''}`}
            onClick={() => setSelectData(item)}>
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

  async function saveImg(flag: 'pdf' | 'png') {
    const element = chartBoxRef.current;
    if (!element) return;

    const shareSection = document.getElementById('shareSection') as HTMLElement;
    const focusMosaicBox = document.getElementById(
      'focusMosaicBox'
    ) as HTMLElement;
    shareSection.style.display = 'none';
    focusMosaicBox.style.display = 'none';

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');

    if (flag === 'png') {
      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'Chart.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    if (flag === 'pdf') {
      const componentWidth = element.offsetWidth;
      const componentHeight = element.offsetHeight;
      const orientation = componentWidth >= componentHeight ? 'l' : 'p';
      const pdf = new jsPDF({
        orientation,
        unit: 'px'
      });
      pdf.internal.pageSize.width = componentWidth;
      pdf.internal.pageSize.height = componentHeight;
      pdf.addImage(imgData, 'PNG', 0, 0, componentWidth, componentHeight);
      pdf.save('Chart.pdf');
    }

    shareSection.style.display = '';
    focusMosaicBox.style.display = '';
  }

  function saveExcel() {
    if (!dataSource.length) {
      alert('차트가 그려지지 않았습니다.');
      return;
    }
    const keys = Object.keys(dataSource[0]);
    const transformData: (string | number | Date)[][] = keys.map(key => {
      const row: (string | number | Date)[] = [key];
      dataSource.forEach(item => row.push(item[key]));
      return row;
    });
    const worksheet = XLSX.utils.aoa_to_sheet(transformData); // [][] to sheet
    const workbook = XLSX.utils.book_new(); // new excel
    XLSX.utils.book_append_sheet(workbook, worksheet, 'data'); // append sheet named 'data'
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], {
      type: 'application/octet-stream'
    });
    saveAs(blob, 'data.xlsx');
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
            {selectData && inventoryFormat.current[selectData] === 'number'
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
              onClick={() => saveImg('pdf')}>
              pdf
            </div>
            <div
              className={distyles.propertyOpenBox}
              onClick={() => saveImg('png')}>
              이미지
            </div>
            <div className={distyles.propertyOpenBox} onClick={saveExcel}>
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
