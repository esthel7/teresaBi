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
// import {
//   Chart as ChartComponent,
// } from 'devextreme-react/chart';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import distyles from './designerId.module.css';

type NeededDataType = 'Date' | 'Value';
const DrawType = ['stock', 'candlestick'] as const;

interface FinancialTypeParameter {
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

export default function FinancialType({
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
}: FinancialTypeParameter) {
  const [dateInventory, setDateInventory] = useState<string[][]>([]);
  const [valueInventory, setValueInventory] = useState<string[][]>([]);
  const [dateDetail, setDateDetail] = useState(false);
  const [valueDetail, setValueDetail] = useState(false);
  const [selectData, setSelectData] = useState<string | null>(null);
  const [selectDataIdx, setSelectDataIdx] = useState<number>(-1);
  const [drawType, setDrawType] = useState<(typeof DrawType)[number]>(
    DrawType[0]
  );
  const [dataSource, setDataSource] = useState<
    Record<string, string | number>[]>([]);
  // const chartRef = useRef<ChartComponent>(null);

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
    const format: Record<string, string | number | (string | number)[]>[] = [];
    const match: Record<string, number> = {};
    let cnt = 0;
    const sortedOriginalDataSource = originalDataSource.current.sort(
      (a, b) =>
        new Date(a[inventory.current[datekey]]).getTime() -
        new Date(b[inventory.current[datekey]]).getTime()
    );
    sortedOriginalDataSource.forEach(item => {
      let formatIdx = 0;
      const keyword = item[inventory.current[datekey]];
      // keyword 변환 년, 년월, 년월일, ...
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
        item[inventory.current[valuekey]]
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
  }, [inventory, originalDataSource, dateInventory, valueInventory]);

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
    setSelectData(null);
    setSelectDataIdx(-1);
  }

  function changeOrAddInventory(item: string) {
    if (!dateDetail && !valueDetail) return;
    if (dateDetail && inventoryFormat.current[item] !== 'Date') {
      alert('Date형만 가능합니다.');
      return;
    }
    if (valueDetail && inventoryFormat.current[item] !== 'number') {
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
            {/* 년월일 ... */}
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
        {dataSource.length ? <>Chart</> : null}
      </div>
    </>
  );
}
