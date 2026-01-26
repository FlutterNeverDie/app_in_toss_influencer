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
            influencerStatus: { status: null },

            login: (member) => {
                set({ isLoggedIn: true, member });
                get().refreshInfluencerStatus(); // 로그인 시 상태 확인
                get().syncLikedInfluencers(); // 좋아요 내역 동기화
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
                const { isLoggedIn, member, likedInfluencerIds } = get();
                if (!isLoggedIn || !member) return false;

                const isCurrentlyLiked = likedInfluencerIds.includes(influencerId);

                // 1. UI 즉시 반영 (Optimistic UI)
                if (isCurrentlyLiked) {
                    set({
                        likedInfluencerIds: likedInfluencerIds.filter(id => id !== influencerId)
                    });
                } else {
                    set({
                        likedInfluencerIds: [...likedInfluencerIds, influencerId]
                    });
                }

                // 2. DB 반영 (비동기)
                InfluencerService.toggleLike(influencerId, member.id).then(res => {
                    if (!res.success) {
                        // 실패 시 롤백
                        set({ likedInfluencerIds });
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

                const likedIds = await InfluencerService.getLikedInfluencerIds(member.id);
                set({ likedInfluencerIds: likedIds });
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
