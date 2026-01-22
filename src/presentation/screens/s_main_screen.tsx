import { useState, useEffect } from 'react';
import { generateHapticFeedback } from '@apps-in-toss/web-framework';
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
import { MemberService } from '../../data/services/member_service';

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
      MemberService.syncMember({
        toss_id: 'local_dev_user',
        name: '로컬 개발자',
      }).then(member => {
        if (member) login(member);
      });
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
        setInfluencers(data);
      } catch (e) {
        setInfluencers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInfluencers();
  }, [selectedDistrict]);

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden flex flex-col font-toss">
      {/* 1. 상단 내비게이션 */}
      <nav className="flex items-center justify-between px-6 py-4 z-50">
        <button
          onClick={() => { triggerHaptic("tickWeak"); openDrawer(); }}
          className="p-2 -ml-2 hover:bg-[#F2F4F6] rounded-full transition-colors"
        >
          <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
            <div className="w-6 h-0.5 bg-[#191F28]" />
            <div className="w-4 h-0.5 bg-[#191F28]" />
            <div className="w-6 h-0.5 bg-[#191F28]" />
          </div>
        </button>
        <div
          onClick={() => { triggerHaptic("tickWeak"); selectProvince(null); }}
          className="flex flex-col items-center cursor-pointer"
        >
          <span className="text-[17px] font-bold text-[#191F28] tracking-tight">인플루언서 맵</span>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-[#3182F6] rounded-full" />
            <span className="text-[11px] font-bold text-[#3182F6] uppercase tracking-widest">Influencer Map</span>
          </div>
        </div>
        <div
          onClick={() => { triggerHaptic("tickWeak"); openSheet(); }}
          className="w-10 h-10 flex items-center justify-center bg-[#F2F4F6] hover:bg-[#E5E8EB] rounded-full transition-colors cursor-pointer"
        >
          <Search size={22} className="text-[#191F28]" />
        </div>
      </nav>

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
                      className="min-w-[140px] bg-white rounded-[24px] p-4 border border-[#F2F4F6] shadow-sm flex flex-col items-center text-center gap-3 active:bg-[#F9FAFB] transition-colors"
                    >
                      <div className="relative">
                        <img
                          src={inf.image_url}
                          alt={inf.instagram_id}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md font-bold text-[10px]"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerHaptic("tap");
                            toggleLike(inf.id);
                          }}
                          className={`absolute -bottom-1 -right-1 p-1.5 rounded-full shadow-lg transition-all ${isLiked(inf.id) ? 'bg-[#3182F6] text-white' : 'bg-white text-[#ADB5BD]'}`}
                        >
                          <Heart size={14} fill={isLiked(inf.id) ? "currentColor" : "none"} />
                        </button>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[14px] font-bold text-[#191F28] truncate max-w-[110px]">
                          {maskInstagramId(inf.instagram_id)}
                        </div>
                        <div className="text-[12px] font-medium text-[#3182F6]">
                          좋아요 {inf.like_count + (isLiked(inf.id) ? 1 : 0)}
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
