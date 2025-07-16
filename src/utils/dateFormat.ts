import { DatePropertyType } from '@/constants';

export function dateFormat(flag: DatePropertyType, item: string) {
  const originDate = new Date(item);

  const year = originDate.getFullYear();
  const month = originDate.getMonth() + 1;
  const day = originDate.getDate();
  const hours = originDate.getHours();
  const minutes = originDate.getMinutes();
  const seconds = originDate.getSeconds();
  const quarter = Math.floor(originDate.getMonth() / 3) + 1;
  const startOfYear = new Date(year, 0, 1);
  const weekOfYear = Math.ceil(
    ((originDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24) +
      startOfYear.getDay() +
      1) /
      7
  );

  switch (flag) {
    case '년':
      return year;
    case '분기':
      return quarter;
    case '월':
      return month;
    case '일':
      return day;
    case '시간':
      return hours;
    case '분':
      return minutes;
    case '초':
      return seconds;
    case '년의 일(365일)':
      return (
        Math.floor(
          (originDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1
      );
    case '요일':
      return originDate.getDay();
    case '년의 주(52주)':
      return weekOfYear;
    case '월의 주(4~6주)':
      return Math.ceil((day + new Date(year, month - 1, 1).getDay()) / 7);
    case '년 분기':
      return `${year} Q${quarter}`;
    case '년-월':
      return `${year}-${month}`;
    case '년 주':
      return `${year} ${weekOfYear}W`;
    case '년-월-일':
      return `${year}-${month}-${day}`;
    case '날짜 시간':
      return `${year}-${month}-${day} ${hours}시`;
    case '날짜 시간 분':
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    case '날짜 시간 분 초':
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    case '정확한 날짜':
      return originDate.toISOString(); // "0000-00-00T00:00:00.000Z"
    default:
      console.error('error');
      return 0;
  }
}
