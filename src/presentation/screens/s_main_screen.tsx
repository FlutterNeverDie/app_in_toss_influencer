import { useState, useEffect } from 'react';
import { generateHapticFeedback, openURL } from '@apps-in-toss/web-framework';
import { motion } from 'framer-motion';
import { Search, Heart } from 'lucide-react';
import { Button, Top } from '@toss/tds-mobile';
import { useRegionStore } from '../stores/region_store';
import { useAuthStore } from '../stores/auth_store';
import { KoreaMapWidget } from '../widgets/w_korea_map';
import { RegionSelectorSheet } from '../widgets/w_region_selector_sheet';
import { DrawerMenu } from '../widgets/w_drawer_menu';
import { RegistrationModal } from '../widgets/w_registration_modal';
import { PROVINCE_DISPLAY_NAMES, REGION_DATA } from '../../data/constants/regions';
import { InfluencerService } from '../../data/services/influencer_service';
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
  if (!id) return '';
  if (id.length <= 3) return id;
  return id.substring(0, 3) + '***';
};
import type { Influencer } from '../../data/models/m_influencer';

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

  const { isLoggedIn, toggleLike, isLiked, login, member } = useAuthStore();
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
        const tossWindow = window as Window & { appLogin?: unknown };
        if (typeof tossWindow.appLogin === 'function' || (!isLocal && typeof tossWindow.appLogin !== 'undefined')) {
          const { appLogin } = await import('@apps-in-toss/web-framework');
          const authData = await appLogin() as { authorizationCode: string };

          if (authData?.authorizationCode) {
            const member = await MemberService.loginWithToss(authData.authorizationCode);
            if (member) {
              login(member);
            }
          }
        }
        // 2. 로컬 개발 환경인 경우 (Mock 로그인)
        else if (isLocal) {
          await useAuthStore.getState().mockLogin();
        }
      } catch (error) {
        console.error('Auto login failed:', error);
      }
    };

    handleAutoLogin();
  }, [isLoggedIn, login]);

  // [중요] 앱 시작 시 또는 로그인 상태 변경 시 인플루언서 상태 동기화
  useEffect(() => {
    if (isLoggedIn) {
      useAuthStore.getState().refreshInfluencerStatus();
    }
  }, [isLoggedIn]);

  // 다크모드 시스템 설정 동기화
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
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
      if (!selectedProvince || !selectedDistrict) {
        setInfluencers([]);
        return;
      }

      setIsLoading(true);
      try {
        // [FIX] 기초 자치단체 ID가 중복될 수 있으므로 (예: '중구'), 광역 자치단체 ID와 함께 쿼리합니다.
        const data = await InfluencerService.fetchInfluencersByRegion(selectedProvince, selectedDistrict);

        // 정렬 로직 적용: 본인 우선 -> 좋아요 수(많은 순) -> 등록일(빠른 순)
        const sortedData = [...data].sort((a, b) => {
          // 0. 본인 우선 (member_id 기준)
          const isAMe = a.member_id === useAuthStore.getState().member?.id;
          const isBMe = b.member_id === useAuthStore.getState().member?.id;
          if (isAMe && !isBMe) return -1;
          if (!isAMe && isBMe) return 1;

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
      } catch {
        setInfluencers([]);
      } finally {
        setIsLoading(false);
        setIsLoadingData(false);
      }
    };

    loadInfluencers();
  }, [selectedProvince, selectedDistrict, setIsLoadingData]);

  // 인플루언서 클릭 시 인스타그램 이동
  const handleInfluencerClick = (instagramId: string) => {
    triggerHaptic("tap");
    const url = `https://www.instagram.com/${instagramId}`;

    if (typeof openURL === 'function') {
      (openURL(url) as Promise<unknown>).catch(() => {
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
        <button
          onClick={() => { triggerHaptic("tickWeak"); openDrawer(); }}
          className="pointer-events-auto w-12 h-14 flex items-center justify-center liquid-glass rounded-r-[24px] border-l-0 active:scale-95 transition-all"
        >
          <div className="flex flex-col gap-1.5 ml-[-4px]">
            <div className="w-5 h-0.5 bg-[var(--text-color)] rounded-full" />
            <div className="w-3.5 h-0.5 bg-[var(--text-color)] rounded-full" />
            <div className="w-5 h-0.5 bg-[var(--text-color)] rounded-full" />
          </div>
        </button>
      </motion.div>

      {/* 2. 지도 영역 */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        <KoreaMapWidget
          hasResults={influencers.length > 0}
          isSearching={isSearching}
        />

        {/* [NEW] 전체 지도 보기 버튼 (상세 진입 시 노출) */}
        {selectedProvince && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-6 right-6 z-30"
          >
            <Button
              color="light"
              size="small"
              onClick={() => {
                triggerHaptic("tickWeak");
                selectProvince(null);
              }}
              style={{ borderRadius: '20px', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)' }}
            >
              전체 지도
            </Button>
          </motion.div>
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
                  <Top.TitleParagraph color="var(--text-color)">
                    {PROVINCE_DISPLAY_NAMES[selectedProvince!]}
                    {` ${REGION_DATA[selectedProvince!].find(d => d.id === selectedDistrict)?.name}`}
                  </Top.TitleParagraph>
                  {(isLoading || influencers.length > 0) && (
                    <p className="text-[#8B95A1] dark:text-[#ADB5BD] text-[14px] font-medium mt-1">
                      {isLoading ? '인플루언서를 찾고있습니다...' : `인플루언서 총 ${influencers.length}명을 찾았어요`}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    color="light"
                    size="small"
                    onClick={() => {
                      triggerHaptic("tickWeak");
                      selectProvince(null);
                    }}
                    style={{ borderRadius: '20px' }}
                  >
                    처음으로
                  </Button>
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
                        {inf.member_id === member?.id ? (
                          <div className="absolute -top-1 -right-1 bg-[#191F28] dark:bg-white text-white dark:text-[#191F28] px-2 py-0.5 rounded-full text-[11px] font-bold shadow-lg z-10 border border-white dark:border-[#191F28]">
                            Me
                          </div>
                        ) : (
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerHaptic("tap");
                              toggleLike(inf.id);
                            }}
                            className={`absolute -top-1 -right-1 w-8 h-8 flex items-center justify-center rounded-full shadow-lg transition-all z-10 focus:outline-none outline-none ${isLiked(inf.id) ? 'bg-[#FF80AB] text-white' : 'bg-white dark:bg-[#2C2E33] text-[#ADB5BD] border border-[#F2F4F6] dark:border-[#3A3D43]'}`}
                          >
                            <Heart size={16} fill={isLiked(inf.id) ? "currentColor" : "none"} strokeWidth={2.5} />
                          </motion.button>
                        )}
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
              <Top.TitleParagraph color="var(--text-color)">
                어느 지역이 궁금하세요?
              </Top.TitleParagraph>
              <div
                onClick={openSheet}
                className="flex items-center gap-3 bg-[#F2F4F6] dark:bg-[var(--input-bg)] px-5 py-4 rounded-[20px] cursor-pointer hover:bg-[#E5E8EB] dark:hover:bg-[#3A3D43] transition-colors"
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
