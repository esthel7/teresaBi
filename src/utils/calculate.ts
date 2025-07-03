import { NumberPropertyType } from '@/constants';

export function calculate(flag: NumberPropertyType, arr: (number | string)[]) {
  const Len = arr.length;
  if (flag === '카운트') return Len;
  if (flag === '고유 카운트') return new Set(arr).size;
  const numArr = arr as number[];
  const Sum = numArr.reduce((a, b) => a + b, 0);
  const Avg = Sum / Len;
  switch (flag) {
    case '합계':
      return Sum;
    case '최소값':
      return Math.min(...numArr);
    case '최대값':
      return Math.max(...numArr);
    case '평균':
      return Avg;
    case '표준편차':
      return Math.sqrt(
        numArr.reduce((a, b) => a + (b - Avg) ** 2, 0) / (Len - 1)
      );
    case '모집단 표준편차':
      return Math.sqrt(numArr.reduce((a, b) => a + (b - Avg) ** 2, 0) / Len);
    case '분산':
      return numArr.reduce((a, b) => a + (b - Avg) ** 2, 0) / (Len - 1);
    case '모집단 분산':
      return numArr.reduce((a, b) => a + (b - Avg) ** 2, 0) / Len;
    case '중간값':
      if (Len === 0) return 0;
      if (Len === 1) return numArr[0];
      const sorted = numArr.sort((a, b) => a - b);
      return Len % 2 === 0
        ? (sorted[Math.floor(Len / 2) - 1] + sorted[Math.floor(Len / 2)]) / 2
        : sorted[Math.floor(Len / 2)];
    case '최빈값':
      const freq: Record<number, number> = {};
      for (const num of numArr) {
        freq[num] = (freq[num] || 0) + 1;
      }
      const maxFreq = Math.max(...Object.values(freq));
      const modes = Object.entries(freq)
        .filter(([, v]) => v === maxFreq)
        .map(([k]) => Number(k));
      return modes[0];
    default:
      console.error('error');
      return 0;
  }
}
