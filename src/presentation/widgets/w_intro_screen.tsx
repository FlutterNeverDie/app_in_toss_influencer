import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/auth_store';
import { generateHapticFeedback } from '@apps-in-toss/web-framework';

/**
 * 햅틱 피드백 유틸리티
 */
const triggerHaptic = (type: "tickWeak" | "tap" | "tickMedium" | "success" = "tickWeak") => {
    if (typeof generateHapticFeedback === 'function') {
        generateHapticFeedback({ type }).catch(() => { });
    }
};

/**
 * 인플루언서 맵 서비스 인트로 화면
 * 토스 앱 심사 가이드라인 준수: 서비스의 성격과 가치를 설명한 후 로그인을 유도
 */
export const IntroScreen = () => {
    const { loginWithToss } = useAuthStore();

    const handleLogin = async () => {
        triggerHaptic("tickMedium");
        await loginWithToss();
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[var(--bg-color)] font-toss overflow-hidden">
            {/* 1. 상단 그래픽 영역 (55%) */}
            <div className="flex-1 relative flex items-center justify-center p-8 overflow-hidden bg-white dark:bg-[#191F28]">
                {/* 배경 그라데이션 원 */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                    className="absolute w-[300px] h-[300px] bg-[#3182F6] rounded-full blur-[100px] opacity-20"
                />

                {/* 메인 비주얼 아이콘 */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", damping: 20 }}
                    className="relative z-10 flex flex-col items-center gap-6"
                >
                    <div className="w-24 h-24 bg-white dark:bg-[#2C2E33] rounded-[32px] shadow-2xl flex items-center justify-center overflow-hidden">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                </motion.div>
            </div>

            {/* 2. 하단 텍스트 및 버튼 영역 (45%) */}
            <div className="relative z-20 bg-white dark:bg-[#191F28] p-8 pb-safe flex flex-col gap-8">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4 text-center mt-auto"
                >
                    <h1 className="text-[26px] font-bold text-[#191F28] dark:text-white leading-[1.3]">
                        내 주변 인플루언서를<br />
                        <span className="text-[#3182F6]">지도에서 확인해보세요</span>
                    </h1>
                    <p className="text-[15px] font-medium text-[#8B95A1] dark:text-[#8B95A1] leading-relaxed">
                        내가 사는 동네의 유명인을 찾아보세요.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-3 mb-6"
                >
                    <button
                        onClick={() => {
                            console.log('[Intro] Login button clicked');
                            handleLogin();
                        }}
                        className="w-full py-4 bg-[#3182F6] hover:bg-[#296DCE] active:scale-[0.98] text-white rounded-[16px] font-bold text-[16px] shadow-lg shadow-[#3182F6]/25 transition-all flex items-center justify-center gap-2"
                    >
                        토스로 계속하기
                    </button>

                    <p className="text-[11px] text-center text-[#ADB5BD] leading-tight">
                        계속하기를 누르면
                        <button className="underline mx-1">서비스 이용약관</button>및
                        <button className="underline mx-1">개인정보 처리방침</button>에<br />
                        동의하게 됩니다.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};
