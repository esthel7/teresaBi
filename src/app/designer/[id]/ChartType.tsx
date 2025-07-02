'use client';

import {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  RefObject
} from 'react';
import distyles from './designerId.module.css';

type NeededDataType = 'X' | 'Y' | 'Series';

interface ChartTypeParameter {
  inventory: RefObject<Record<string, number>>;
  inventoryFormat: RefObject<Record<string, string>>;
  originalDataSource: RefObject<(string | number)[][]>;
  mosaicProperty: string | null;
  mosaicId: string;
  openDataProperty: boolean;
  setOpenDataProperty: Dispatch<SetStateAction<boolean>>;
}

export default function ChartType({
  inventory,
  originalDataSource,
  inventoryFormat,
  mosaicProperty,
  mosaicId,
  openDataProperty,
  setOpenDataProperty
}: ChartTypeParameter) {
  const [xDetail, setXDetail] = useState(false);
  const [yDetail, setYDetail] = useState(false);
  const [seriesDetail, setSeriesDetail] = useState(false);

  console.log(originalDataSource, inventoryFormat);

  useEffect(() => {
    if (openDataProperty) return;
    setXDetail(false);
    setYDetail(false);
    setSeriesDetail(false);
  }, [openDataProperty]);

  function changeOpenDetailProperty(flag: NeededDataType) {
    setXDetail(false);
    setYDetail(false);
    setSeriesDetail(false);
    switch (flag) {
      case 'X':
        setXDetail(true);
        break;
      case 'Y':
        setYDetail(true);
        break;
      case 'Series':
        setSeriesDetail(true);
        break;
      default:
        console.error('error!');
        break;
    }
  }

  return (
    <>
      {mosaicProperty === mosaicId && openDataProperty ? (
        <div className={distyles.openProperty}>
          <div className={distyles.title}>
            <div>데이터 연결</div>
            <div
              className={distyles.close}
              onClick={() => setOpenDataProperty(false)}
            >
              X
            </div>
          </div>
          <div className={distyles.propertySection}>
            <h5>x축</h5>
            <div
              className={distyles.propertyOpenBox}
              onClick={() => changeOpenDetailProperty('X')}
            >
              x축 추가
            </div>
          </div>
          <div className={distyles.propertySection}>
            <h5>y축</h5>
            <div
              className={distyles.propertyOpenBox}
              onClick={() => changeOpenDetailProperty('Y')}
            >
              y축 추가
            </div>
          </div>
          <div className={distyles.propertySection}>
            <h5>대분류</h5>
            <div
              className={distyles.propertyOpenBox}
              onClick={() => changeOpenDetailProperty('Series')}
            >
              대분류 추가
            </div>
          </div>
        </div>
      ) : null}
      {mosaicProperty === mosaicId && openDataProperty && xDetail ? (
        <div className={distyles.propertyDetail}>
          <div className={distyles.header} onClick={() => setXDetail(false)}>
            뒤로
          </div>
          <div className={distyles.drawer} style={{ borderTop: 'none' }}>
            <h5>데이터 선택</h5>
            <div>{JSON.stringify(inventory.current)}</div>
          </div>
          <div className={distyles.drawer}>
            <h5>데이터명 바꾸기</h5>
            <div>데이터명</div>
          </div>
        </div>
      ) : null}
      {mosaicProperty === mosaicId && openDataProperty && yDetail ? (
        <div className={distyles.propertyDetail}>
          <div className={distyles.header} onClick={() => setYDetail(false)}>
            뒤로
          </div>
          <div className={distyles.drawer} style={{ borderTop: 'none' }}>
            <h5>차트 타입</h5>
            <div>차트 종류 나열</div>
          </div>
          <div className={distyles.drawer}>
            <h5>데이터 선택</h5>
            <div>{JSON.stringify(inventory.current)}</div>
            <h5>집계 방식 선택</h5>
            <div>합계, 카운트,...</div>
          </div>
          <div className={distyles.drawer}>
            <h5>데이터명 바꾸기</h5>
            <div>데이터명</div>
          </div>
        </div>
      ) : null}
      {mosaicProperty === mosaicId && openDataProperty && seriesDetail ? (
        <div className={distyles.propertyDetail}>
          <div
            className={distyles.header}
            onClick={() => setSeriesDetail(false)}
          >
            뒤로
          </div>
          <div className={distyles.drawer} style={{ borderTop: 'none' }}>
            <h5>데이터 선택</h5>
            <div>{JSON.stringify(inventory.current)}</div>
          </div>
          <div className={distyles.drawer}>
            <h5>데이터명 바꾸기</h5>
            <div>데이터명</div>
          </div>
        </div>
      ) : null}
    </>
  );
}
