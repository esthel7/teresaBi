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

export const DateProperty = [
  '년',
  '분기',
  '월',
  '일',
  '시간',
  '분',
  '초',
  '년의 일(365일)',
  '요일',
  '년의 주(52주)',
  '월의 주(4~6주)',
  '년 분기',
  '년-월',
  '년 주',
  '년-월-일',
  '날짜 시간',
  '날짜 시간 분',
  '날짜 시간 분 초',
  '정확한 날짜'
] as const;

export type DatePropertyType = (typeof DateProperty)[number];
