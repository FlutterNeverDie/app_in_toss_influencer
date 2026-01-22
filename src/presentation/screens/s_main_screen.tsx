import { useState, useEffect } from 'react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { motion, useDragControls } from 'framer-motion';
import { Menu, Search, ChevronDown, Map } from 'lucide-react';
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
  const { selectedProvince, selectedDistrict, openSheet, openDrawer, selectDistrict, selectProvince } = useRegionStore();
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 드래그 제스처 컨트롤
  const dragControls = useDragControls();

  // 토스트 메시지 상태
  // const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  /* 
  const showToast = (message: string) => {
    setToast({ message, visible: true });
    // 3초 후 자동으로 사라짐
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };
  */

  const provinceName = selectedProvince ? PROVINCE_DISPLAY_NAMES[selectedProvince] : '';
  const districtName = (selectedProvince && selectedDistrict)
    ? REGION_DATA[selectedProvince]?.find(d => d.id === selectedDistrict)?.name
    : '';

  // 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      // (기존 로직)
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

  // ID 마스킹 함수
  const maskInstagramId = (id: string) => {
    if (id.length <= 4) return id;
    return id.substring(0, 4) + '***';
  };

  return (
    <div className="relative w-full h-full bg-[#F2F4F6] overflow-hidden flex flex-col">
      {/* Toast Notification (임시 주석 처리)
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="fixed bottom-10 left-1/2 z-[9999] bg-gray-800/90 backdrop-blur-md text-white px-5 py-3 rounded-full text-[14px] font-medium shadow-lg pointer-events-none whitespace-nowrap"
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
      */}

      {/* 1. 상단: 지도 영역 (메인) - 전체 높이 사용 */}
      <div className="absolute inset-0 z-0">
        {/* 메뉴 버튼 */}
        <button
          onClick={openDrawer}
          className="absolute top-12 left-6 z-20 p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors"
        >
          <Menu size={24} className="text-[#191F28]" />
        </button>

        <KoreaMapWidget />

        {/* 전국 지도로 돌아가기 버튼 (상세 지역 선택 시 표시) */}
        {selectedProvince && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={() => selectProvince(null)}
            className="absolute top-12 right-6 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-black/5 hover:bg-white transition-colors"
          >
            <Map size={14} className="text-[#4E5968]" />
            <span className="text-[13px] font-semibold text-[#4E5968]">전국 지도</span>
          </motion.button>
        )}
      </div>

      {/* 2. 하단: 인플루언서 리스트 프리뷰 (Sheet Mode) */}
      <motion.div
        initial={false}
        animate={{
          height: selectedDistrict ? '92%' : 'auto', // 92% 까지만 올라와서 뒤에 지도 살짝 보이게
          y: 0
        }}
        drag="y"
        dragControls={dragControls}
        dragListener={false} // 내부 스크롤 충돌 방지: 핸들 부분만 드래그 가능하게
        dragConstraints={{
          top: selectedDistrict ? 0 : -window.innerHeight, // 선택 안 된 상태면 위로 올릴 수 있음
          bottom: 0
        }}
        dragElastic={0.1} // 약간의 탄성
        onDragEnd={(_, info) => {
          if (selectedDistrict) {
            // 1. 결과 모드: 아래로 내리면 닫기
            if (info.offset.y > 100 || info.velocity.y > 500) {
              selectDistrict(null);
            }
          } else {
            // 2. 대기 모드: 위로 올리면 검색 시트 열기
            if (info.offset.y < -80 || info.velocity.y < -500) {
              openSheet();
            }
          }
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`
          absolute bottom-0 left-0 right-0 z-10 
          bg-white rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.1)] 
          flex flex-col overflow-hidden touch-none
          ${selectedDistrict ? 'shadow-2xl' : ''}
        `}
      >
        {/* 드래그 핸들 / 닫기 영역 (이 부분을 잡고 드래그 가능) */}
        <div
          className="flex-none p-4 flex justify-center items-center cursor-pointer active:bg-gray-50 pt-5"
          onPointerDown={(e) => dragControls.start(e)}
          onClick={() => selectedDistrict && selectDistrict(null)}
        >
          {selectedDistrict ? (
            <ChevronDown className="text-gray-300" />
          ) : (
            <div className="w-12 h-1.5 bg-[#E5E8EB] rounded-full" />
          )}
        </div>

        {/* 컨텐츠 헤더 (결과 모드일 때만 표시) */}
        {selectedDistrict && (
          <div
            className="flex-none px-8 pb-6"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[22px] font-bold text-[#191F28] leading-tight">
                <span className="text-[#3182F6]">{districtName}</span> 핫플 랭킹
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
              {provinceName} {districtName}의 인기 인플루언서입니다
            </p>
          </div>
        )}

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
                  onClick={() => {
                    // DB 변경 없이 ID로 바로 링크 생성
                    const profileUrl = `https://www.instagram.com/${influencer.instagram_id}`;
                    window.open(profileUrl, '_blank');
                  }}
                  className="flex items-center justify-between rounded-[16px] bg-[#F9FAFB] p-4 cursor-pointer hover:bg-gray-100 transition-colors active:scale-[0.98]"
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
          /* 대기 모드: 검색바 표시 (클릭/드래그 시 시트 열림) */
          <div className="flex flex-col gap-3 pb-4 px-6">
            <div className="flex items-end gap-2 px-1">
              <h2 className="text-[20px] font-bold text-[#191F28]">
                어느 지역이 궁금하세요?
              </h2>
              <span className="text-[13px] text-[#8B95A1] font-medium mb-1">
                지도에서 직접 선택도 가능해요
              </span>
            </div>

            <div
              onClick={openSheet}
              className="flex items-center gap-2 bg-[#F2F4F6] px-4 py-3.5 rounded-[16px] cursor-pointer hover:bg-[#E5E8EB] transition-colors"
            >
              <Search size={20} className="text-[#8B95A1]" />
              <span className="text-[#ADB5BD] text-[16px] font-medium">지역 이름을 검색해보세요</span>
            </div>
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
