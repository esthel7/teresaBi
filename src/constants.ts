export const NumberProperty = [
  '카운트',
  '고유 카운트',
  '합계',
  '최소값',
  '최대값',
  '평균',
  '표준편차',
  '모집단 표준편차',
  '분산',
  '모집단 분산',
  '중간값',
  '최빈값'
] as const;

export type NumberPropertyType = (typeof NumberProperty)[number];
