import React from 'react';
import { MapPin } from 'lucide-react';
import { useRegionStore } from '../stores/region_store';
import { KoreaMapWidget } from '../widgets/w_korea_map';
import { RegionSelectorSheet } from '../widgets/w_region_selector_sheet';
import { PROVINCE_DISPLAY_NAMES, REGION_DATA } from '../../data/constants/regions';

export const MainScreen = () => {
  const { selectedProvince, selectedDistrict, openSheet } = useRegionStore();

  // 현재 선택된 지역 이름 찾기 (UI 표시용)
  const provinceName = PROVINCE_DISPLAY_NAMES[selectedProvince];
  const districtName = REGION_DATA[selectedProvince]?.find(d => d.id === selectedDistrict)?.name;

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden flex flex-col">
      
      {/* 1. 상단: 지도 영역 (Flexible) */}
      <div className="flex-1 relative bg-gray-50">
        <KoreaMapWidget />
        
        {/* Floating Button (지역 선택 트리거) */}
        <button 
          onClick={openSheet}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full shadow-lg active:scale-95 transition-transform z-10"
        >
          <MapPin size={18} />
          <span className="font-bold">
            {selectedDistrict 
              ? `${provinceName} ${districtName}` 
              : '지역 선택하기'}
          </span>
        </button>
      </div>

      {/* 2. 하단: 인플루언서 리스트 영역 (Placeholder) */}
      <div className="flex-none h-[30vh] bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)] -mt-6 z-0 relative p-6">
        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
        
        <h2 className="text-xl font-bold mb-2">
          {selectedDistrict 
            ? `🔥 ${districtName} 핫플 랭킹` 
            : '지역을 선택해주세요'}
        </h2>
        
        {selectedDistrict ? (
          <div className="text-gray-500 text-sm">
             {/* 나중에 여기에 인플루언서 리스트 컴포넌트가 들어갑니다 */}
             여기에 인플루언서 리스트가 표시됩니다.
          </div>
        ) : (
          <div className="flex items-center justify-center h-20 text-gray-400 text-sm">
            지도를 클릭하거나 버튼을 눌러 지역을 선택하세요.
          </div>
        )}
      </div>

      {/* 3. 오버레이: 지역 선택 시트 */}
      <RegionSelectorSheet />
    </div>
  );
};
