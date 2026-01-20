import React from 'react';
import { X, Check } from 'lucide-react';
import { useRegionStore } from '../stores/region_store';
import { REGION_DATA, PROVINCE_DISPLAY_NAMES } from '../../data/constants/regions';

export const RegionSelectorSheet = () => {
  const { 
    isSheetOpen, 
    selectedProvince, 
    selectedDistrict, 
    closeSheet, 
    selectProvince, 
    selectDistrict 
  } = useRegionStore();

  // 시트가 닫혀있으면 아무것도 렌더링하지 않음
  if (!isSheetOpen) return null;

  return (
    // 1. 배경 (Dimmed Layer) - 클릭 시 닫기
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 transition-opacity"
      onClick={closeSheet}
    >
      {/* 2. 시트 본체 (이벤트 전파 방지) */}
      <div 
        className="w-full h-[60vh] bg-white rounded-t-2xl flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-900">
            지역 선택
          </h3>
          <button onClick={closeSheet} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* 컨텐츠 영역 (좌우 분할) */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* 왼쪽: 광역 (Province) 리스트 */}
          <ul className="w-1/3 bg-gray-50 overflow-y-auto border-r scrollbar-hide">
            {Object.keys(REGION_DATA).map((provKey) => (
              <li 
                key={provKey}
                onClick={() => selectProvince(provKey)}
                className={`
                  p-4 text-sm font-medium cursor-pointer transition-colors
                  ${selectedProvince === provKey 
                    ? 'bg-white text-blue-600 border-l-4 border-blue-600' 
                    : 'text-gray-500 hover:bg-gray-100'}
                `}
              >
                {PROVINCE_DISPLAY_NAMES[provKey] || provKey}
              </li>
            ))}
          </ul>

          {/* 오른쪽: 기초 (District) 리스트 */}
          <ul className="w-2/3 overflow-y-auto bg-white p-2">
            <div className="mb-2 px-2 py-1 text-xs text-gray-400 font-bold uppercase">
              {PROVINCE_DISPLAY_NAMES[selectedProvince]} 상세 지역
            </div>
            
            {REGION_DATA[selectedProvince]?.map((dist) => (
              <li 
                key={dist.id}
                onClick={() => selectDistrict(dist.id)}
                className={`
                  flex items-center justify-between p-3 mb-1 rounded-lg cursor-pointer
                  ${selectedDistrict === dist.id 
                    ? 'bg-blue-50 text-blue-700 font-bold' 
                    : 'text-gray-700 hover:bg-gray-50'}
                `}
              >
                <span>{dist.name}</span>
                {selectedDistrict === dist.id && <Check size={16} />}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
