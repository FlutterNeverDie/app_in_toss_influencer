import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, UserPlus, ChevronDown, ChevronUp, Share2, User } from 'lucide-react';
import { useRegionStore } from '../stores/region_store';
import { FAQ_DATA } from '../../data/constants/faq';
import { share, generateHapticFeedback, appLogin } from '@apps-in-toss/web-framework';

/**
 * 햅틱 피드백 유틸리티
 */
const triggerHaptic = (type: "tickWeak" | "tap" | "tickMedium" | "success" = "tickWeak") => {
    if (typeof generateHapticFeedback === 'function') {
        generateHapticFeedback({ type }).catch(() => { });
    }
};

/**
 * 사이드바 메뉴 (Drawer)
 * 고객센터, FAQ, 인플루언서 등록 기능을 제공합니다.
 */
export const DrawerMenu = () => {
    const { isDrawerOpen, closeDrawer } = useRegionStore();
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        triggerHaptic("tickWeak");
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogin = async () => {
        triggerHaptic("tickMedium");
        try {
            if (typeof appLogin === 'function') {
                const response = await appLogin();
                console.log('Login Response:', response);
                // authorizationCode를 서버로 전달하여 세션 생성 가능
                setIsLoggedIn(true);
            } else {
                alert('로그인은 토스 앱 내에서 가능합니다.');
            }
        } catch (error) {
            console.error('Login Error:', error);
        }
    };

    const handleShare = async () => {
        triggerHaptic("tap");
        try {
            if (typeof share === 'function') {
                await share({
                    message: "내 주변 인플루언서는 누구? '인플루언서 맵'에서 확인해보세요! 📍\nhttps://toss.im/_m/influencer"
                });
            } else {
                alert('공유하기는 토스 앱 내에서 가능합니다.');
            }
        } catch (error) {
            console.error('Share Error:', error);
        }
    };

    return (
        <AnimatePresence>
            {isDrawerOpen && (
                <>
                    {/* 배경 (Dimmed) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeDrawer}
                        className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-[2px]"
                    />

                    {/* 드로어 본체 */}
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed inset-y-0 left-0 z-[111] w-[85%] max-w-[320px] bg-white shadow-2xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 헤더 */}
                        <div className="flex items-center justify-between p-6 border-b border-[#F2F4F6]">
                            <h2 className="text-[20px] font-bold text-[#191F28]">메뉴</h2>
                            <button
                                onClick={closeDrawer}
                                className="p-2 -mr-2 hover:bg-[#F2F4F6] rounded-full transition-colors"
                            >
                                <X size={24} className="text-[#333D4B]" />
                            </button>
                        </div>

                        {/* 컨텐츠 */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">

                            {/* 프로필 / 로그인 (TDS Style) */}
                            <section>
                                <div className="flex items-center gap-4 mb-4 bg-[#F9FAFB] p-5 rounded-[24px] border border-[#F2F4F6]">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#ADB5BD] shadow-sm border border-[#F2F4F6]">
                                        <User size={36} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <h3 className="text-[19px] font-bold text-[#191F28] leading-tight">
                                            {isLoggedIn ? '반가워요!' : '로그인 해주세요'}
                                        </h3>
                                        <p className="text-[14px] font-medium text-[#4E5968]">
                                            {isLoggedIn ? '오늘도 영향력을 확인해보세요' : '더 많은 추천을 받을 수 있어요'}
                                        </p>
                                    </div>
                                </div>
                                {!isLoggedIn && (
                                    <motion.button
                                        whileTap={{ scale: 0.96 }}
                                        onClick={handleLogin}
                                        className="w-full py-4 bg-[#3182F6] text-white rounded-[18px] font-bold text-[16px] hover:bg-[#2563EB] transition-all shadow-[0_4px_12px_rgba(49,130,246,0.2)]"
                                    >
                                        토스로 로그인하기
                                    </motion.button>
                                )}
                            </section>

                            {/* 인플루언서 등록 (강조) */}
                            <section>
                                <div className="bg-[#F2F4F6] rounded-[24px] p-6 border border-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        <UserPlus size={20} className="text-[#3182F6]" />
                                        <h3 className="text-[16px] font-bold text-[#191F28]">인플루언서 등록하기</h3>
                                    </div>
                                    <p className="text-[14px] font-medium text-[#4E5968] mb-5 leading-relaxed">
                                        나의 영향력을 지도에 표시해보세요.<br />등록은 100% 무료입니다!
                                    </p>
                                    <motion.button
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => {
                                            triggerHaptic("tickWeak");
                                            alert('준비 중인 기능입니다! (Google Form 연동 예정)');
                                        }}
                                        className="w-full py-3.5 bg-white text-[#3182F6] border border-[#3182F6] rounded-[14px] font-bold text-[15px] hover:bg-[#F2F8FF] transition-colors"
                                    >
                                        지금 신청하기
                                    </motion.button>
                                </div>
                            </section>

                            {/* 자주 묻는 질문 (FAQ) */}
                            <section>
                                <div className="flex items-center gap-2 mb-4 px-1">
                                    <HelpCircle size={20} className="text-[#333D4B]" />
                                    <h3 className="text-[18px] font-bold text-[#191F28]">자주 묻는 질문</h3>
                                </div>
                                <div className="space-y-3">
                                    {FAQ_DATA.map((item, index) => {
                                        const isOpen = expandedFAQ === index;
                                        return (
                                            <div key={index} className="border border-[#F2F4F6] rounded-[20px] overflow-hidden bg-white">
                                                <button
                                                    onClick={() => toggleFAQ(index)}
                                                    className="w-full flex items-center justify-between p-5 text-left active:bg-[#F9FAFB] transition-colors"
                                                >
                                                    <span className="text-[15px] font-bold text-[#333D4B] pr-4 leading-snug">
                                                        {item.question}
                                                    </span>
                                                    {isOpen ? <ChevronUp size={20} className="text-[#8B95A1] flex-shrink-0" /> : <ChevronDown size={20} className="text-[#8B95A1] flex-shrink-0" />}
                                                </button>
                                                <AnimatePresence>
                                                    {isOpen && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="p-5 pt-0 bg-white text-[14px] font-medium text-[#4E5968] leading-relaxed border-t border-[#F2F4F6] border-dashed mt-0.5">
                                                                <div className="pt-4">{item.answer}</div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* 친구에게 공유하기 (TDS Style) */}
                            <section>
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleShare}
                                    className="w-full flex items-center justify-between p-5 bg-[#F9FAFB] rounded-[24px] hover:bg-[#F2F4F6] transition-all border border-[#F2F4F6]"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#F2F4F6]">
                                            <Share2 size={20} className="text-[#333D4B]" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-[16px] font-bold text-[#191F28]">친구에게 공유하기</h3>
                                            <p className="text-[13px] font-medium text-[#8B95A1]">우리 동네 인플루언서를 알려주세요</p>
                                        </div>
                                    </div>
                                    <ChevronUp size={18} className="text-[#ADB5BD] rotate-90" />
                                </motion.button>
                            </section>
                        </div>

                        {/* 푸터 */}
                        <div className="p-6 border-t border-[#F2F4F6]">
                            <p className="text-[12px] text-[#ADB5BD] text-center">
                                © 2026 Influencer Map. All rights reserved.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
