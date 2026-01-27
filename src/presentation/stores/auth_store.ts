import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Member } from '../../data/models/m_member';
import { MemberService } from '../../data/services/member_service';
import { InfluencerService } from '../../data/services/influencer_service';
import type { Influencer } from '../../data/models/m_influencer';

export interface InfluencerStatus {
    status: 'pending' | 'approved' | 'rejected' | null;
    province_id?: string;
    district_id?: string;
}

interface AuthState {
    isLoggedIn: boolean;
    member: Member | null; // 현재 로그인한 사용자 정보
    likedInfluencerIds: string[]; // 사용자가 좋아요를 누른 인플루언서 ID 목록
    likedInfluencers: Influencer[]; // 좋아요한 인플루언서 상세 정보 목록
    influencerStatus: InfluencerStatus; // 인플루언서 등록 상태
}

interface AuthActions {
    login: (member: Member) => void;
    autoLogin: () => Promise<boolean>; // 앱 시작 시 자동 로그인 시도
    loginWithToss: () => Promise<boolean>; // 토스 로그인 수동 호출
    mockLogin: (memberId?: string) => Promise<boolean>; // 로컬용 mock 로그인
    logout: () => void;
    setUser: (member: Member) => void;
    toggleLike: (influencerId: string) => boolean; // 좋아요 토글 (성공 여부 반환)
    isLiked: (influencerId: string) => boolean; // 좋아요 여부 확인
    syncLikedInfluencers: () => Promise<void>; // 좋아요 내역 동기화
    refreshInfluencerStatus: () => Promise<void>; // 인플루언서 상태 새로고침
}

/**
 * 인증 및 사용자 활동 상태 관리 스토어
 */
export const useAuthStore = create<AuthState & AuthActions>()(
    persist(
        (set, get) => ({
            isLoggedIn: false,
            member: null,
            likedInfluencerIds: [],
            likedInfluencers: [],
            influencerStatus: { status: null },

            login: (member) => {
                set({ isLoggedIn: true, member });
                get().refreshInfluencerStatus(); // 로그인 시 상태 확인
                get().syncLikedInfluencers(); // 좋아요 내역 동기화
            },

            autoLogin: async () => {
                // 이미 로그인된 상태라면 스킵
                if (get().isLoggedIn && get().member) {
                    await get().refreshInfluencerStatus();
                    await get().syncLikedInfluencers();
                    return true;
                }

                // 환경 감지
                const hostname = window.location.hostname;
                const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('ngrok') || import.meta.env.DEV;

                if (isLocal) {
                    return get().mockLogin();
                }

                // 토스 브릿지를 통해 현재 세션의 인가 코드 획득 시도
                return get().loginWithToss();
            },

            loginWithToss: async () => {
                try {
                    // 1. 토스 환경 감지 (브릿지 객체 + User Agent)
                    const tossWindow = window as any;
                    const ua = navigator.userAgent.toLowerCase();
                    const isTossApp = ua.includes('toss') || ua.includes('toss-bridge');

                    const hasTossBridge =
                        typeof tossWindow.appLogin === 'function' ||
                        typeof tossWindow.toss !== 'undefined' ||
                        typeof tossWindow.TOSSB !== 'undefined' ||
                        isTossApp;

                    if (!hasTossBridge) {
                        console.warn('Toss bridge not detected. (If you are in browser, use mock login)');
                        return false;
                    }

                    const { appLogin } = await import('@apps-in-toss/web-framework');
                    const response = await appLogin() as { authorizationCode: string };
                    const authCode = response?.authorizationCode;

                    if (!authCode) {
                        console.error('Failed to get authorizationCode from Toss');
                        return false;
                    }

                    // 2. 서버(Edge Function)를 통해 로그인 처리
                    const member = await MemberService.loginWithToss(authCode);

                    if (member) {
                        set({ isLoggedIn: true, member });
                        await get().refreshInfluencerStatus();
                        await get().syncLikedInfluencers();
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error('Error during Toss Login:', error);
                    return false;
                }
            },

            mockLogin: async (memberId?: string) => {
                // 로컬 개발 환경에서만 동작
                if (!import.meta.env.DEV) return false;

                const member = await MemberService.mockLogin(memberId);
                if (member) {
                    set({ isLoggedIn: true, member });
                    await get().refreshInfluencerStatus(); // Mock 로그인 시에도 상태 확인
                    await get().syncLikedInfluencers(); // Mock 로그인 시에도 좋아요 내역 동기화
                    return true;
                }
                return false;
            },

            logout: () => set({ isLoggedIn: false, member: null, likedInfluencerIds: [], influencerStatus: { status: null } }),
            setUser: (member) => set({ member }),

            toggleLike: (influencerId: string) => {
                const { isLoggedIn, member, likedInfluencerIds, likedInfluencers } = get();
                if (!isLoggedIn || !member) return false;

                const isCurrentlyLiked = likedInfluencerIds.includes(influencerId);

                // 1. UI 즉시 반영 (Optimistic UI)
                if (isCurrentlyLiked) {
                    set({
                        likedInfluencerIds: likedInfluencerIds.filter(id => id !== influencerId),
                        likedInfluencers: likedInfluencers.filter(inf => inf.id !== influencerId)
                    });
                } else {
                    set({
                        likedInfluencerIds: [...likedInfluencerIds, influencerId]
                        // Note: influencer 객체 정보는 DB 반영 후나 목록 새로고침 시 채워지거나, 
                        // 메인에서 toggle 시 인플루언서 정보를 찾을 수 있는 경우에만 추가 가능.
                        // 일단 ID 위주로 업데이트 후 sync 호출 유도 가능.
                    });
                }

                // 2. DB 반영 (비동기)
                InfluencerService.toggleLike(influencerId, member.id).then(res => {
                    if (!res.success) {
                        // 실패 시 롤백
                        set({ likedInfluencerIds, likedInfluencers });
                    } else {
                        // 성공 시 상세 목록 동기화 (새로운 좋아요 시 객체 정보를 모르므로 전체 다시 불러오기 권장)
                        get().syncLikedInfluencers();
                    }
                });

                return true;
            },

            isLiked: (influencerId: string) => {
                return get().likedInfluencerIds.includes(influencerId);
            },

            syncLikedInfluencers: async () => {
                const { member } = get();
                if (!member?.id) return;

                // ID 목록과 함께 상세 정보도 함께 가져오기
                const influencers = await InfluencerService.fetchLikedInfluencers(member.id);
                set({
                    likedInfluencerIds: influencers.map(inf => inf.id),
                    likedInfluencers: influencers
                });
            },

            refreshInfluencerStatus: async () => {
                const { member } = get();
                if (!member?.id) {
                    set({ influencerStatus: { status: null } });
                    return;
                }

                try {
                    const status = await InfluencerService.getMyRegistrationStatus(member.id);
                    set({ influencerStatus: status });
                } catch (error) {
                    console.error('Failed to refresh influencer status:', error);
                }
            },
        }),
        {
            name: 'influencer-auth-storage', // 로컬 스토리지 키
            // influencerStatus는 영구 저장하지 않음 (새로고침 시 항상 서버에서 최신 상태 로드 유도)
            partialize: (state) => ({
                isLoggedIn: state.isLoggedIn,
                member: state.member,
                likedInfluencerIds: state.likedInfluencerIds,
            }),
            onRehydrateStorage: () => (state) => {
                // 저장된 member ID가 유효한 UUID가 아니면 로그아웃 처리 (Legacy 데이터 클린업)
                if (state?.member?.id) {
                    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                    if (!uuidRegex.test(state.member.id)) {
                        console.warn('[AuthStore] Invalid Legacy ID detected. Logging out...', state.member.id);
                        state.logout();
                    }
                }
            }
        }
    )
);
