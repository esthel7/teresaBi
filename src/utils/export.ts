import { RefObject } from 'react';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

export async function saveImg(
  chartBoxRef: RefObject<HTMLDivElement | null>,
  flag: 'pdf' | 'png'
) {
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

export function saveExcel(dataSource: Record<string, string | number>[]) {
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
