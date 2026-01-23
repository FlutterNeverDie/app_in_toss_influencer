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
import { MemberService } from '../../data/services/member_service';
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
    selectProvince,
    isSearching,
    isLoadingData,
    setIsLoadingData
  } = useRegionStore();

  const { isLoggedIn, toggleLike, isLiked, login } = useAuthStore();
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // [Toss Integration] 자동 로그인 및 초기화 로직
  useEffect(() => {
    const handleAutoLogin = async () => {
      // 이미 로그인되어 있다면 중단
      if (isLoggedIn) return;

      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      try {
        // 1. 토스 앱 브릿지 환경인 경우 (appLogin 존재 시)
        if (typeof (window as any).appLogin === 'function' || (!isLocal && typeof (window as any).appLogin !== 'undefined')) {
          const { appLogin } = await import('@apps-in-toss/web-framework');
          const authData: any = await appLogin();

          if (authData?.authorizationCode) {
            // 인가 코드를 받았으므로 Edge Function을 통해 서버 로그인 수행
            // (AuthCode -> AccessToken -> UserProfile -> DB Upsert)
            const member = await MemberService.loginWithToss(authData.authorizationCode);

            if (member) login(member);
          }
        }
        // 2. 로컬 개발 환경인 경우 (Mock 로그인)
        else if (isLocal) {
          // Supabase의 member_id는 UUID 타입이므로, 테스트를 위해 실제 UUID 형식을 사용해야 함
          // 이 ID로 DB에 인플루언서 정보가 박혀있어야 "활동 중"으로 뜹니다.
          // 편의상 고정된 테스트 UUID를 사용합니다.
          const mockMember = {
            id: '00000000-0000-0000-0000-000000000000', // 테스트용 고정 UUID
            toss_id: 'local_dev_user',
            name: '로컬 개발자',
            created_at: new Date().toISOString()
          };
          login(mockMember as any);
        }
      } catch (error) {
        console.error('Auto login failed:', error);
      }
    };

    handleAutoLogin();
  }, [isLoggedIn, login]);

  // 다크모드 시스템 설정 동기화
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    updateTheme(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => updateTheme(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);


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
        setIsLoadingData(false);
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
    <div className="relative w-full h-[100dvh] bg-[var(--bg-color)] overflow-hidden flex flex-col font-toss">

      {/* 1. 플로팅 버튼 (메뉴) - 바텀 시트 유무에 따라 위치 동적 조정 */}
      <motion.div
        animate={{
          y: (isSearching || isLoadingData || influencers.length > 0)
            ? -80       // 0. 검색 중 / 로딩 중 / 결과 있음: -80
            : !selectedDistrict
              ? 70      // 1. 기본 상태: 70
              : -10     // 3. 결과 없음: -10
        }}
        transition={{ type: "spring", damping: 30, stiffness: 350 }}
        className="absolute left-0 top-1/2 z-50 pointer-events-none"
      >
        <motion.button
          whileTap={{ scale: 0.9, x: 0 }}
          whileHover={{ x: 4 }}
          onClick={() => { triggerHaptic("tickWeak"); openDrawer(); }}
          className="pointer-events-auto w-12 h-14 flex items-center justify-center liquid-glass rounded-r-[24px] border-l-0 active:scale-95 transition-all"
        >
          <div className="flex flex-col gap-1.5 ml-[-4px]">
            <div className="w-5 h-0.5 bg-[var(--text-color)] rounded-full" />
            <div className="w-3.5 h-0.5 bg-[var(--text-color)] rounded-full" />
            <div className="w-5 h-0.5 bg-[var(--text-color)] rounded-full" />
          </div>
        </motion.button>
      </motion.div>

      {/* 2. 지도 영역 */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        <KoreaMapWidget
          hasResults={influencers.length > 0}
          isSearching={isSearching}
        />

        {/* [NEW] 전체 지도 보기 버튼 (상세 진입 시 노출) */}
        {selectedProvince && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => {
              triggerHaptic("tickWeak");
              selectProvince(null);
            }}
            className="absolute top-6 right-6 z-30 liquid-glass px-4 py-2.5 rounded-full flex items-center gap-2 group active:scale-95 transition-all"
          >
            <div className="w-1.5 h-1.5 bg-[#3182F6] rounded-full" />
            <span className="text-[14px] font-bold text-[var(--text-color)]">전체 지도</span>
          </motion.button>
        )}

        {/* 하단 패널 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-0 inset-x-0 bg-white dark:bg-[var(--sheet-bg)] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.3)] rounded-t-[32px] p-6 pb-10"
        >
          {selectedDistrict ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[22px] font-bold text-[#191F28] dark:text-white tracking-tight leading-tight">
                    {PROVINCE_DISPLAY_NAMES[selectedProvince!]}
                    {` ${REGION_DATA[selectedProvince!].find(d => d.id === selectedDistrict)?.name}`}
                  </h2>
                  <p className="text-[#8B95A1] dark:text-[#ADB5BD] text-[14px] font-medium mt-1">
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
                    className="bg-[#F2F4F6] dark:bg-[#2C2E33] px-4 py-2.5 rounded-full text-[#4E5968] dark:text-[#ADB5BD] text-[14px] font-bold flex items-center gap-1.5"
                  >
                    처음으로
                  </motion.button>
                </div>
              </div>

              {/* 리스트 프리뷰 */}
              <div className="flex gap-3 overflow-x-auto py-2 px-1 -mx-1 scrollbar-hide">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="min-w-[140px] h-[156px] bg-[#F9FAFB] dark:bg-[#2C2E33] rounded-[24px] animate-pulse" />
                  ))
                ) : influencers.length > 0 ? (
                  influencers.map((inf) => (
                    <motion.div
                      key={inf.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleInfluencerClick(inf.instagram_id)}
                      className="min-w-[140px] h-[156px] bg-white dark:bg-[#2C2E33] rounded-[24px] p-4 border border-[#F2F4F6] dark:border-[#3A3D43] shadow-sm flex flex-col items-center text-center gap-3 active:bg-[#F9FAFB] dark:active:bg-[#3A3D43] cursor-pointer transition-colors"
                    >
                      <div className="relative group/image">
                        <img
                          src={inf.image_url}
                          alt={inf.instagram_id}
                          className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-[#3A3D43] shadow-md font-bold text-[10px]"
                        />
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerHaptic("tap");
                            toggleLike(inf.id);
                          }}
                          className={`absolute -top-1 -right-1 w-8 h-8 flex items-center justify-center rounded-full shadow-lg transition-all z-10 ${isLiked(inf.id) ? 'bg-[#FF80AB] text-white' : 'bg-white dark:bg-[#2C2E33] text-[#ADB5BD] border border-[#F2F4F6] dark:border-[#3A3D43]'}`}
                        >
                          <Heart size={16} fill={isLiked(inf.id) ? "currentColor" : "none"} strokeWidth={2.5} />
                        </motion.button>
                      </div>
                      <div className="space-y-0.5 mt-1">
                        <div className="text-[14px] font-bold text-[#191F28] dark:text-white truncate max-w-[110px]">
                          {maskInstagramId(inf.instagram_id)}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="w-full flex flex-col items-center justify-center py-6 text-[#8B95A1] dark:text-[#5A636E] gap-2">
                    <div className="text-[13px]">검색 결과가 없어요</div>
                    <div className="text-[12px] opacity-60">가장 먼저 등록해 보세요!</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-[20px] font-bold text-[#191F28] dark:text-white tracking-tight">
                어느 지역이 궁금하세요?
              </h2>
              <div
                onClick={openSheet}
                className="flex items-center gap-3 bg-[#F2F4F6] dark:bg-[#2C2E33] px-5 py-4 rounded-[20px] cursor-pointer hover:bg-[#E5E8EB] dark:hover:bg-[#3A3D43] transition-colors"
              >
                <Search size={20} className="text-[#8B95A1]" />
                <span className="text-[#ADB5BD] dark:text-[#4E5968] text-[16px] font-medium">지역 이름을 검색해보세요</span>
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
