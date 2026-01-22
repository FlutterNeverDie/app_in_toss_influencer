import { useState, useEffect } from 'react';
import { generateHapticFeedback, openURL } from '@apps-in-toss/web-framework';
import { motion } from 'framer-motion';
import { Search, Heart } from 'lucide-react';
import { useRegionStore } from '../stores/region_store';
import { useAuthStore } from '../stores/auth_store';
import { KoreaMapWidget } from '../widgets/w_korea_map';
import { RegionSelectorSheet } from '../widgets/w_region_selector_sheet';
import { DrawerMenu } from '../widgets/w_drawer_menu';
import { RegistrationModal } from '../widgets/w_registration_modal';
import { PROVINCE_DISPLAY_NAMES, REGION_DATA } from '../../data/constants/regions';
import { InfluencerService } from '../../data/services/influencer_service';
import type { Influencer } from '../../data/models/m_influencer';


/**
 * 햅틱 피드백 유틸리티
 */
const triggerHaptic = (type: "tickWeak" | "tap" | "tickMedium" | "success" = "tickWeak") => {
  if (typeof generateHapticFeedback === 'function') {
    generateHapticFeedback({ type }).catch(() => { });
  }
};

/**
 * 인스타그램 ID 마스킹 (보안용)
 */
const maskInstagramId = (id: string) => {
  if (id.length <= 3) return id;
  return id.substring(0, 3) + '***';
};

/**
 * 인플루언서 맵 메인 화면
 */
export const MainScreen = () => {
  const {
    selectedProvince,
    selectedDistrict,
    openSheet,
    openDrawer,
    selectProvince
  } = useRegionStore();

  const { isLoggedIn, toggleLike, isLiked, login } = useAuthStore();
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 로컬 개발 환경 자동 로그인 (유저 요청)
  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLoggedIn && isLocal) {
      // 로컬에서는 싱크 에러가 날 수 있으므로 최소한의 정보로 로그인 처리
      const mockMember = {
        id: 'local_dev_user',
        toss_id: 'local_dev_user',
        name: '로컬 개발자',
        created_at: new Date().toISOString()
      };
      login(mockMember as any);
    }
  }, [isLoggedIn, login]);


  // 데이터 페칭 로직
  useEffect(() => {
    const loadInfluencers = async () => {
      // 유저 요청: 소분류(selectedDistrict)가 선택되었을 때만 데이터 로드
      if (!selectedDistrict) {
        setInfluencers([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await InfluencerService.fetchInfluencersByDistrict(selectedDistrict);

        // 정렬 로직 적용: 좋아요 수(많은 순) -> 등록일(빠른 순)
        const sortedData = [...data].sort((a, b) => {
          // 1. 좋아요 수 내림차순
          if (b.like_count !== a.like_count) {
            return b.like_count - a.like_count;
          }
          // 2. 좋아요 수가 같으면 등록일(created_at) 오름차순 (선착순)
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateA - dateB;
        });

        setInfluencers(sortedData);
      } catch (e) {
        setInfluencers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInfluencers();
  }, [selectedDistrict]);

  // 인플루언서 클릭 시 인스타그램 이동
  const handleInfluencerClick = (instagramId: string) => {
    triggerHaptic("tap");
    const url = `https://www.instagram.com/${instagramId}`;

    if (typeof openURL === 'function') {
      (openURL(url) as any).catch(() => {
        window.open(url, '_blank');
      });
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="relative w-full h-[100dvh] bg-white overflow-hidden flex flex-col font-toss">

      {/* 1. 플로팅 버튼 (메뉴) - 토스 표준 내비바 하단에 위치 */}
      <div className="absolute top-[env(safe-area-inset-top,20px)] left-0 z-50 pointer-events-none p-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { triggerHaptic("tickWeak"); openDrawer(); }}
          className="pointer-events-auto w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg border border-[#F2F4F6] active:bg-[#F9FAFB] transition-all"
        >
          <div className="flex flex-col gap-1.5">
            <div className="w-5 h-0.5 bg-[#191F28] rounded-full" />
            <div className="w-3.5 h-0.5 bg-[#191F28] rounded-full" />
            <div className="w-5 h-0.5 bg-[#191F28] rounded-full" />
          </div>
        </motion.button>
      </div>

      {/* 2. 지도 영역 */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        <KoreaMapWidget />

        {/* [NEW] 전체 지도 보기 버튼 (상세 진입 시 노출) */}
        {selectedProvince && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => {
              triggerHaptic("tickWeak");
              selectProvince(null);
            }}
            className="absolute top-6 right-6 z-30 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-full shadow-lg border border-[#F2F4F6] flex items-center gap-2 group active:scale-95 transition-all"
          >
            <div className="w-1.5 h-1.5 bg-[#3182F6] rounded-full" />
            <span className="text-[14px] font-bold text-[#191F28]">전체 지도</span>
          </motion.button>
        )}

        {/* 하단 패널 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-0 inset-x-0 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.08)] rounded-t-[32px] p-6 pb-10"
        >
          {selectedDistrict ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[22px] font-bold text-[#191F28] tracking-tight leading-tight">
                    {PROVINCE_DISPLAY_NAMES[selectedProvince!]}
                    {` ${REGION_DATA[selectedProvince!].find(d => d.id === selectedDistrict)?.name}`}
                  </h2>
                  <p className="text-[#8B95A1] text-[14px] font-medium mt-1">
                    {isLoading ? '인플루언서를 찾고있습니다...' : `인플루언서 총 ${influencers.length}명을 찾았어요`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      triggerHaptic("tickWeak");
                      selectProvince(null);
                    }}
                    className="bg-[#F2F4F6] px-4 py-2.5 rounded-full text-[#4E5968] text-[14px] font-bold flex items-center gap-1.5"
                  >
                    처음으로
                  </motion.button>
                </div>
              </div>

              {/* 리스트 프리뷰 */}
              <div className="flex gap-3 overflow-x-auto py-2 px-1 -mx-1 scrollbar-hide">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="min-w-[140px] h-[180px] bg-[#F9FAFB] rounded-[24px] animate-pulse" />
                  ))
                ) : influencers.length > 0 ? (
                  influencers.map((inf) => (
                    <motion.div
                      key={inf.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleInfluencerClick(inf.instagram_id)}
                      className="min-w-[140px] bg-white rounded-[24px] p-4 border border-[#F2F4F6] shadow-sm flex flex-col items-center text-center gap-3 active:bg-[#F9FAFB] cursor-pointer transition-colors"
                    >
                      <div className="relative group/image">
                        <img
                          src={inf.image_url}
                          alt={inf.instagram_id}
                          className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md font-bold text-[10px]"
                        />
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerHaptic("tap");
                            toggleLike(inf.id);
                          }}
                          className={`absolute -top-1 -right-1 w-8 h-8 flex items-center justify-center rounded-full shadow-lg transition-all z-10 ${isLiked(inf.id) ? 'bg-[#FF80AB] text-white' : 'bg-white text-[#ADB5BD] border border-[#F2F4F6]'}`}
                        >
                          <Heart size={16} fill={isLiked(inf.id) ? "currentColor" : "none"} strokeWidth={2.5} />
                        </motion.button>
                      </div>
                      <div className="space-y-0.5 mt-1">
                        <div className="text-[14px] font-bold text-[#191F28] truncate max-w-[110px]">
                          {maskInstagramId(inf.instagram_id)}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="w-full flex flex-col items-center justify-center py-6 text-[#8B95A1] gap-2">
                    <div className="text-[13px]">검색 결과가 없어요</div>
                    <div className="text-[12px] opacity-60">가장 먼저 등록해 보세요!</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-[20px] font-bold text-[#191F28] tracking-tight">
                어느 지역이 궁금하세요?
              </h2>
              <div
                onClick={openSheet}
                className="flex items-center gap-3 bg-[#F2F4F6] px-5 py-4 rounded-[20px] cursor-pointer hover:bg-[#E5E8EB] transition-colors"
              >
                <Search size={20} className="text-[#8B95A1]" />
                <span className="text-[#ADB5BD] text-[16px] font-medium">지역 이름을 검색해보세요</span>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* 오버레이 컴포넌트들 */}
      <RegionSelectorSheet />
      <RegistrationModal
        isOpen={useRegionStore(state => state.isRegistrationModalOpen)}
        onClose={useRegionStore(state => state.closeRegistrationModal)}
      />
      <DrawerMenu />
    </div>
  );
};
