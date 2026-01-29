import React from 'react';
import { useAuthStore } from '../stores/auth_store';
import { useOverlayStore } from '../stores/overlay_store';
import { generateHapticFeedback } from '@apps-in-toss/web-framework';

/**
 * 개발/디버그용 Mock 로그인 버튼.
 * 로컬 환경에서만 동작하며, 클릭 시 mock 회원을 로드하여 로그인 처리합니다.
 */
export const MockLoginButton: React.FC = () => {
    const mockLogin = useAuthStore(state => state.mockLogin);
    const isLoggedIn = useAuthStore(state => state.isLoggedIn);

    // 로컬 개발 환경(localhost)이 아니면 렌더링하지 않음 (외부 접속 시 Mock 로그인 차단)
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!import.meta.env.DEV || !isLocalhost) return null;

    const handleMockLogin = async () => {
        // 햅틱 피드백 (있는 경우만)
        if (typeof generateHapticFeedback === 'function') {
            generateHapticFeedback({ type: 'success' }).catch(() => { });
        }

        const success = await mockLogin();
        if (success) {
            useOverlayStore.getState().showAlert('성공', '개발용 Mock 로그인 성공!');
        } else {
            useOverlayStore.getState().showAlert('실패', 'Mock 로그인 실패 (로컬 환경 여부 확인)');
        }
    };

    if (isLoggedIn) return null;

    return (
        <button
            onClick={handleMockLogin}
            className="w-full py-3.5 rounded-[14px] font-bold text-[15px] bg-[#3182F6]/10 text-[#3182F6] border border-[#3182F6] hover:bg-[#3182F6]/20 transition-all active:scale-95"
        >
            테스트 계정으로 로그인 (Mock)
        </button>
    );
};
