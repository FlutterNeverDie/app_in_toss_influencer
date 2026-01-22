import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Member } from '../../data/models/m_member';

interface AuthState {
    isLoggedIn: boolean;
    member: Member | null; // 현재 로그인한 사용자 정보
    likedInfluencerIds: string[]; // 사용자가 좋아요를 누른 인플루언서 ID 목록
}

interface AuthActions {
    login: (member?: Member) => void;
    logout: () => void;
    setUser: (member: Member) => void;
    toggleLike: (influencerId: string) => boolean; // 좋아요 토글 (성공 여부 반환)
    isLiked: (influencerId: string) => boolean; // 좋아요 여부 확인
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

            login: (member) => set({ isLoggedIn: true, member: member || null }),
            logout: () => set({ isLoggedIn: false, member: null, likedInfluencerIds: [] }),
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
        }),
        {
            name: 'influencer-auth-storage', // 로컬 스토리지 키
        }
    )
);
