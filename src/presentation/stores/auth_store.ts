import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Member } from '../../data/models/m_member';
import { MemberService } from '../../data/services/member_service';
import { InfluencerService } from '../../data/services/influencer_service';

export interface InfluencerStatus {
    status: 'pending' | 'approved' | 'rejected' | null;
    province_id?: string;
    district_id?: string;
}

interface AuthState {
    isLoggedIn: boolean;
    member: Member | null; // 현재 로그인한 사용자 정보
    likedInfluencerIds: string[]; // 사용자가 좋아요를 누른 인플루언서 ID 목록
    influencerStatus: InfluencerStatus; // 인플루언서 등록 상태
}

interface AuthActions {
    login: (member: Member) => void;
    mockLogin: (memberId?: string) => Promise<boolean>; // 로컬용 mock 로그인
    logout: () => void;
    setUser: (member: Member) => void;
    toggleLike: (influencerId: string) => boolean; // 좋아요 토글 (성공 여부 반환)
    isLiked: (influencerId: string) => boolean; // 좋아요 여부 확인
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
            influencerStatus: { status: null },

            login: (member) => {
                set({ isLoggedIn: true, member });
                get().refreshInfluencerStatus(); // 로그인 시 상태 확인
            },

            mockLogin: async (memberId?: string) => {
                // 로컬 개발 환경에서만 동작
                if (!import.meta.env.DEV) return false;

                const member = await MemberService.mockLogin(memberId);
                if (member) {
                    set({ isLoggedIn: true, member });
                    await get().refreshInfluencerStatus(); // Mock 로그인 시에도 상태 확인
                    return true;
                }
                return false;
            },

            logout: () => set({ isLoggedIn: false, member: null, likedInfluencerIds: [], influencerStatus: { status: null } }),
            setUser: (member) => set({ member }),

            toggleLike: (influencerId: string) => {
                const { isLoggedIn, likedInfluencerIds } = get();
                if (!isLoggedIn) return false;

                if (likedInfluencerIds.includes(influencerId)) {
                    // 이미 좋아요를 눌렀다면 제거 (취소)
                    set({
                        likedInfluencerIds: likedInfluencerIds.filter(id => id !== influencerId)
                    });
                } else {
                    // 새로 좋아요 추가
                    set({
                        likedInfluencerIds: [...likedInfluencerIds, influencerId]
                    });
                }
                return true;
            },

            isLiked: (influencerId: string) => {
                return get().likedInfluencerIds.includes(influencerId);
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
        }
    )
);
