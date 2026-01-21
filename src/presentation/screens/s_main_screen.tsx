import { useState, useEffect } from 'react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Menu, Search } from 'lucide-react';
import { useRegionStore } from '../stores/region_store';
import { KoreaMapWidget } from '../widgets/w_korea_map';
import { RegionSelectorSheet } from '../widgets/w_region_selector_sheet';
import { DrawerMenu } from '../widgets/w_drawer_menu';
import { PROVINCE_DISPLAY_NAMES, REGION_DATA } from '../../data/constants/regions';
import { InfluencerService } from '../../data/services/influencer_service';
import type { Influencer } from '../../data/models/m_influencer';

/**
 * 인플루언서 맵 메인 화면
 * 전체적인 레이아웃 관리 및 지도/리스트 연동
 */
export const MainScreen = () => {
  const { selectedProvince, selectedDistrict, openSheet, openDrawer } = useRegionStore();
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const provinceName = selectedProvince ? PROVINCE_DISPLAY_NAMES[selectedProvince] : '';
  const districtName = (selectedProvince && selectedDistrict)
    ? REGION_DATA[selectedProvince]?.find(d => d.id === selectedDistrict)?.name
    : '';

  // 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      if (selectedProvince && selectedDistrict) {
        setIsLoading(true);
        const data = await InfluencerService.fetchInfluencersByRegion(selectedProvince, selectedDistrict);
        setInfluencers(data);
        setIsLoading(false);
      } else {
        setInfluencers([]);
      }
    };
    fetchData();
  }, [selectedProvince, selectedDistrict]);

  // ID 마스킹 함수 (antigravity -> anti***)
  const maskInstagramId = (id: string) => {
    if (id.length <= 4) return id;
    return id.substring(0, 4) + '***';
  };

  return (
    <div className="relative w-full h-screen bg-[#F2F4F6] overflow-hidden flex flex-col">

      {/* 1. 상단: 지도 영역 (메인) */}
      <div className="flex-1 relative">
        {/* 메뉴 버튼 (Absolute Position) */}
        <button
          onClick={openDrawer}
          className="absolute top-12 left-6 z-20 p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors"
        >
          <Menu size={24} className="text-[#191F28]" />
        </button>

        <KoreaMapWidget />
      </div>

      {/* 2. 하단: 인플루언서 리스트 프리뷰 (Toss Style) */}
      <motion.div
        initial={false}
        animate={{
          height: selectedDistrict ? '60vh' : 'auto',
          paddingBottom: selectedDistrict ? 0 : 48
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="flex-none bg-white rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.04)] z-10 p-8 w-full overflow-hidden flex flex-col"
      >
        <div className="w-12 h-1.5 bg-[#E5E8EB] rounded-full mx-auto mb-8" />

        <div className="mb-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[22px] font-bold text-[#191F28] leading-tight">
              {selectedDistrict
                ? <><span className="text-[#3182F6]">{districtName}</span> 핫플 랭킹</>
                : '어느 지역이 궁금하세요?'}
            </h2>
            <button
              onClick={openSheet}
              className="p-2 -mr-2 text-[#4E5968] hover:bg-gray-100 rounded-full transition-colors"
              aria-label="지역 검색"
            >
              <Search size={24} />
            </button>
          </div>
          <p className="text-[#4E5968] text-[15px] mt-1">
            {selectedDistrict
              ? `${provinceName} ${districtName}의 인기 인플루언서입니다`
              : '지도를 클릭하여 지역을 선택해주세요'}
          </p>
        </div>

        {selectedDistrict ? (
          <div className="flex-1 overflow-y-auto space-y-4 pb-8 scrollbar-hide">
            {!isSupabaseConfigured && (
              <div className="flex items-center gap-3 rounded-[16px] border border-amber-200 bg-amber-50 p-4">
                <div className="text-2xl">⚠️</div>
                <div>
                  <div className="text-[15px] font-bold text-amber-900">Supabase 연결 필요</div>
                  <div className="text-[13px] text-amber-700">
                    .env 파일의 VITE_SUPABASE_URL 설정을 확인해주세요
                  </div>
                </div>
              </div>
            )}
            {isLoading ? (
              /* 로딩 스켈레톤 */
              <div className="flex items-center gap-3 rounded-[16px] bg-[#F9FAFB] p-4">
                <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ) : influencers.length > 0 ? (
              /* 실제 데이터 리스트 */
              influencers.map((influencer) => (
                <div
                  key={influencer.id}
                  className="flex items-center justify-between rounded-[16px] bg-[#F9FAFB] p-4"
                >
                  <div className="flex items-center gap-3">
                    {/* 프로필 이미지 (No-Storage Policy 준수) */}
                    <div className="h-12 w-12 overflow-hidden rounded-full border border-[#E5E8EB]">
                      <img
                        src={influencer.image_url}
                        alt="Profile"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          // 이미지 로드 실패 시 기본 색상으로 대체
                          ; (e.target as HTMLImageElement).style.display = 'none'
                            ; (e.target as HTMLImageElement).parentElement!.style.backgroundColor =
                              '#F2F4F6'
                        }}
                      />
                    </div>
                    <div>
                      <div className="text-[16px] font-bold text-[#333D4B]">
                        {maskInstagramId(influencer.instagram_id)}
                      </div>
                      <div className="text-[13px] text-[#8B95A1]">
                        좋아요 {influencer.like_count.toLocaleString()}개
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /* 데이터 없음 */
              <div className="flex items-center justify-between rounded-[16px] bg-[#F9FAFB] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-xs text-gray-400">
                    ?
                  </div>
                  <div>
                    <div className="text-[16px] font-bold text-[#333D4B]">
                      아직 등록된 인플루언서가 없어요
                    </div>
                    {!isSupabaseConfigured ? (
                      <div className="text-[13px] text-amber-600">설정을 완료하면 데이터가 보입니다</div>
                    ) : (
                      <div className="text-[13px] text-[#8B95A1]">가장 먼저 등록해 보세요!</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center bg-[#F9FAFB] rounded-[24px] pointer-events-none">
            <span className="text-[14px] text-[#8B95A1]">서울 강남구, 부산 해운대구...</span>
          </div>
        )}
      </motion.div>

      {/* 3. 오버레이: 지역 선택 바텀 시트 */}
      <RegionSelectorSheet />

      {/* 4. 오버레이: 사이드바 메뉴 (Drawer) */}
      <DrawerMenu />
    </div>
  );
};
