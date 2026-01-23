import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, UserPlus, ChevronDown, ChevronUp, User, ArrowLeft } from 'lucide-react';
import { useRegionStore } from '../stores/region_store';
import { useAuthStore } from '../stores/auth_store';
import { FAQ_DATA } from '../../data/constants/faq';
import { REGION_DATA, PROVINCE_DISPLAY_NAMES } from '../../data/constants/regions';
import { generateHapticFeedback, openURL } from '@apps-in-toss/web-framework';
import { MockLoginButton } from './w_mock_login';

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
    const [view, setView] = useState<'main' | 'faq'>('main');
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

    // 메뉴가 닫힐 때 상태 리셋
    useEffect(() => {
        if (!isDrawerOpen) {
            setTimeout(() => setView('main'), 300);
        }
    }, [isDrawerOpen]);

    const toggleFAQ = (index: number) => {
        triggerHaptic("tickWeak");
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    const { member, influencerStatus: regInfo, refreshInfluencerStatus } = useAuthStore();

    // 드로어가 열릴 때마다 최신 등록 상태 로드 (자동 갱신 보증)
    useEffect(() => {
        if (isDrawerOpen && member?.id) {
            refreshInfluencerStatus();
        }
    }, [isDrawerOpen, member?.id, refreshInfluencerStatus]);

    // 지역 이름 가져오기 유틸
    const getRegionName = () => {
        if (!regInfo.province_id || !regInfo.district_id) return '';
        const provinceName = PROVINCE_DISPLAY_NAMES[regInfo.province_id as keyof typeof PROVINCE_DISPLAY_NAMES] || '';
        const districts = REGION_DATA[regInfo.province_id as keyof typeof REGION_DATA] || [];
        const districtName = districts.find(d => d.id === regInfo.district_id)?.name || '';
        return `${provinceName} ${districtName}`;
    };

    const handleInstagramClick = (username: string) => {
        triggerHaptic("tap");
        const url = `https://www.instagram.com/${username.replace('@', '')}`;
        if (typeof openURL === 'function') {
            (openURL(url) as Promise<unknown>).catch(() => window.open(url, '_blank'));
        } else {
            window.open(url, '_blank');
        }
    };

    const renderAnswer = (text: string) => {
        const parts = text.split(/(@\w+)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                return (
                    <span
                        key={part + i}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleInstagramClick(part);
                        }}
                        className="text-[#3182F6] font-bold underline cursor-pointer active:opacity-60 transition-opacity inline-block"
                    >
                        {part}
                    </span>
                );
            }
            return part;
        });
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
                        className="fixed inset-y-0 left-0 z-[111] w-[85%] max-w-[320px] bg-[var(--bg-color)] shadow-2xl flex flex-col pt-safe"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 헤더 */}
                        <div className="flex items-center justify-between p-6 border-b border-[var(--glass-border)]">
                            <div className="flex items-center gap-3">
                                {view === 'faq' && (
                                    <button
                                        onClick={() => { triggerHaptic("tickWeak"); setView('main'); }}
                                        className="p-1 hover:bg-[var(--glass-border)] rounded-full transition-colors"
                                    >
                                        <ArrowLeft size={24} className="text-[var(--text-color)]" />
                                    </button>
                                )}
                                <h2 className="text-[20px] font-bold text-[var(--text-color)]">
                                    {view === 'faq' ? '자주 묻는 질문' : '메뉴'}
                                </h2>
                            </div>
                            <button
                                onClick={closeDrawer}
                                className="p-2 -mr-2 hover:bg-[var(--glass-border)] rounded-full transition-colors"
                            >
                                <X size={24} className="text-[var(--text-color)]" />
                            </button>
                        </div>

                        {/* 컨텐츠 (애니메이션 전환) */}
                        <div className="flex-1 overflow-hidden relative">
                            <AnimatePresence mode="wait">
                                {view === 'main' ? (
                                    <motion.div
                                        key="main-view"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="absolute inset-0 overflow-y-auto px-6 py-4 space-y-8"
                                    >
                                        {/* 프로필 섹션 */}
                                        <section>
                                            <div className="flex items-center gap-4 mb-4 liquid-glass p-5 rounded-[24px]">
                                                <div className="w-16 h-16 bg-[var(--bg-color)] rounded-full flex items-center justify-center text-[var(--text-color)] opacity-60 shadow-sm border border-[var(--glass-border)]">
                                                    <User size={36} />
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <h3 className="text-[19px] font-bold text-[var(--text-color)] leading-tight">
                                                        {member?.name || '토스 사용자'}
                                                    </h3>
                                                    <p className="text-[14px] font-medium text-[var(--text-color)] opacity-70 mb-2">
                                                        반가워요!
                                                    </p>
                                                    {/* 로컬 개발용 Mock 로그인 버튼 */}
                                                    <div className="mt-1">
                                                        <MockLoginButton />
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        {/* 인플루언서 등록 / 관리 */}
                                        <section>
                                            <div className="liquid-glass rounded-[24px] p-6">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <UserPlus size={20} className={regInfo.status === 'approved' ? 'text-[#00D082]' : 'text-[#3182F6]'} />
                                                    <h3 className="text-[16px] font-bold text-[var(--text-color)]">
                                                        {regInfo.status === 'approved' ? '인플루언서 활동 중' : '인플루언서 등록하기'}
                                                    </h3>
                                                </div>
                                                <div className="text-[14px] font-medium text-[var(--text-color)] opacity-80 mb-1 leading-relaxed">
                                                    {regInfo.status === 'approved'
                                                        ? (
                                                            <div className="flex flex-col gap-1">
                                                                <p>현재 아래 지역에 노출되고 있습니다.</p>
                                                                <div className="inline-flex items-center gap-1.5 text-[#00D082] font-bold mt-1">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#00D082] animate-pulse" />
                                                                    {getRegionName()}
                                                                </div>
                                                            </div>
                                                        )
                                                        : regInfo.status === 'pending'
                                                            ? '신청하신 정보가 검수 중입니다. 조금만 기다려주세요!'
                                                            : '나의 영향력을 지도에 표시해보세요. 등록은 100% 무료입니다!'}
                                                </div>

                                                {regInfo.status !== 'approved' && (
                                                    <motion.button
                                                        whileTap={{ scale: 0.96 }}
                                                        onClick={() => {
                                                            triggerHaptic("tickWeak");
                                                            useRegionStore.getState().openRegistrationModal();
                                                        }}
                                                        className={`w-full mt-4 py-3.5 rounded-[14px] font-bold text-[15px] transition-all border ${regInfo.status === 'pending'
                                                            ? 'bg-[#3182F6]/10 text-[#3182F6] border-[#3182F6]'
                                                            : 'bg-[var(--bg-color)] text-[#3182F6] border-[#3182F6] hover:bg-[#3182F6]/5'
                                                            }`}
                                                    >
                                                        {regInfo.status === 'pending' ? '검수 대기 중' : '지금 신청하기'}
                                                    </motion.button>
                                                )}
                                            </div>
                                        </section>

                                        {/* 서비스 메뉴 리스트 (2-Depth) */}
                                        <section className="space-y-1">
                                            <button
                                                onClick={() => { triggerHaptic("tickWeak"); setView('faq'); }}
                                                className="w-full flex items-center justify-between p-4 hover:bg-[var(--glass-border)] rounded-[16px] transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-[var(--glass-border)] rounded-full flex items-center justify-center text-[var(--text-color)] opacity-70 group-hover:bg-[var(--bg-color)] transition-colors border border-transparent">
                                                        <HelpCircle size={20} />
                                                    </div>
                                                    <span className="text-[16px] font-bold text-[var(--text-color)] opacity-90">자주 묻는 질문</span>
                                                </div>
                                                <ArrowLeft size={18} className="text-[var(--text-color)] opacity-30 rotate-180" />
                                            </button>
                                        </section>

                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="faq-view"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="absolute inset-0 overflow-y-auto px-6 py-4"
                                    >
                                        <div className="space-y-3 pb-10">
                                            {FAQ_DATA.map((item, index) => {
                                                const isOpen = expandedFAQ === index;
                                                return (
                                                    <div key={index} className="liquid-glass rounded-[20px] overflow-hidden">
                                                        <button
                                                            onClick={() => toggleFAQ(index)}
                                                            className="w-full flex items-center justify-between p-5 text-left active:bg-[var(--glass-border)] transition-colors"
                                                        >
                                                            <span className="text-[15px] font-bold text-[var(--text-color)] pr-4 leading-snug">
                                                                {item.question}
                                                            </span>
                                                            {isOpen ? <ChevronUp size={20} className="text-[var(--text-color)] opacity-50 flex-shrink-0" /> : <ChevronDown size={20} className="text-[var(--text-color)] opacity-50 flex-shrink-0" />}
                                                        </button>
                                                        <AnimatePresence>
                                                            {isOpen && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: "auto", opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="p-5 pt-0 text-[14px] font-medium text-[var(--text-color)] opacity-80 leading-relaxed border-t border-[var(--glass-border)] border-dashed mt-0.5">
                                                                        <div className="pt-4">{renderAnswer(item.answer)}</div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* 푸터 */}
                        <div className="p-6 border-t border-[var(--glass-border)]">
                            <p className="text-[12px] text-[var(--text-color)] opacity-40 text-center">
                                © 2026 Influencer Map. All rights reserved.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
