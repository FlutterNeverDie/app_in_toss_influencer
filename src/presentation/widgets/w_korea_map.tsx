import React from 'react';
import { useRegionStore } from '../stores/region_store';
import { PROVINCE_DISPLAY_NAMES } from '../../data/constants/regions';

export const KoreaMapWidget = () => {
  const { selectedProvince, selectProvince } = useRegionStore();

  // 테스트용: 간단한 격자 형태로 배치
  const provinces = Object.keys(PROVINCE_DISPLAY_NAMES);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50 p-4">
      <h2 className="text-gray-400 text-sm mb-4">대한민국 지도 (테스트 모드)</h2>
      
      <div className="grid grid-cols-3 gap-2 w-full max-w-sm aspect-[3/4]">
        {provinces.map((provKey) => (
          <button
            key={provKey}
            onClick={() => selectProvince(provKey)}
            className={`
              flex items-center justify-center p-2 rounded-lg text-xs font-bold shadow-sm transition-all
              ${selectedProvince === provKey
                ? 'bg-blue-600 text-white scale-105 ring-2 ring-blue-300 z-10'
                : 'bg-white text-gray-600 hover:bg-gray-100'}
            `}
          >
            {PROVINCE_DISPLAY_NAMES[provKey]}
          </button>
        ))}
      </div>
      
      <p className="mt-8 text-xs text-gray-400 text-center">
        * 나중에 실제 SVG 지도로 교체될 영역입니다. <br/>
        지금은 버튼을 눌러 상태 변경을 테스트하세요.
      </p>
    </div>
  );
};
