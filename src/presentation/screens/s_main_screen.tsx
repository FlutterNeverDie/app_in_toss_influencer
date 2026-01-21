import { motion } from 'framer-motion';
import { useRegionStore } from '../stores/region_store';
import { KoreaMapWidget } from '../widgets/w_korea_map';
import { RegionSelectorSheet } from '../widgets/w_region_selector_sheet';
import { PROVINCE_DISPLAY_NAMES, REGION_DATA } from '../../data/constants/regions';

/**
 * 인플루언서 맵 메인 화면
 * 전체적인 레이아웃 관리 및 지도/리스트 연동
 */
export const MainScreen = () => {
  const { selectedProvince, selectedDistrict, openSheet } = useRegionStore();

  const provinceName = PROVINCE_DISPLAY_NAMES[selectedProvince];
  const districtName = REGION_DATA[selectedProvince]?.find(d => d.id === selectedDistrict)?.name;

  return (
    <div className="relative w-full h-screen bg-[#F2F4F6] overflow-hidden flex flex-col">

      {/* 1. 상단: 지도 영역 (메인) */}
      <div className="flex-1 relative">
        <KoreaMapWidget />
      </div>

      {/* 2. 하단: 인플루언서 리스트 프리뷰 (Toss Style) */}
      <motion.div
        onClick={openSheet}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.y < -50) openSheet();
        }}
        whileTap={{ scale: 0.99 }}
        className="flex-none bg-white rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.04)] z-10 p-8 pb-12 cursor-pointer touch-none"
        <div className="w-12 h-1.5 bg-[#E5E8EB] rounded-full mx-auto mb-8" />

        <div className="mb-6 pointer-events-none">
          <h2 className="text-[22px] font-bold text-[#191F28] leading-tight">
            {selectedDistrict
              ? <><span className="text-[#3182F6]">{districtName}</span> 핫플 랭킹</>
              : '어느 지역이 궁금하세요?'}
          </h2>
          <p className="text-[#4E5968] text-[15px] mt-1">
            {selectedDistrict
              ? `${provinceName} ${districtName}의 인기 인플루언서입니다`
              : '지도를 클릭하여 지역을 선택해주세요'}
          </p>
        </div>

        {selectedDistrict ? (
          <div className="space-y-4 pointer-events-none">
            {/* 리스트 가상 데이터 (나중에 Supabase 연동) */}
            <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-[16px]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden" />
                <div>
                  <div className="text-[16px] font-bold text-[#333D4B]">준비 중...</div>
                  <div className="text-[13px] text-[#8B95A1]">곧 데이터가 공개됩니다</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center bg-[#F9FAFB] rounded-[24px] pointer-events-none">
            <span className="text-[14px] text-[#8B95A1]">서울 강남구, 부산 해운대구...</span>
          </div>
        )}
      </motion.div>

      {/* 3. 오버레이: 지역 선택 바텀 시트 */}
      <RegionSelectorSheet />
    </div>
  );
};
