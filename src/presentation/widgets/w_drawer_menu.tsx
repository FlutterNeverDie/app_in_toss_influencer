import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, UserPlus, ChevronDown, ChevronUp, User, ArrowLeft, Heart } from 'lucide-react';
import { useRegionStore } from '../stores/region_store';
import { useAuthStore } from '../stores/auth_store';
import { FAQ_DATA } from '../../data/constants/faq';
import { REGION_DATA, PROVINCE_DISPLAY_NAMES } from '../../data/constants/regions';
import { generateHapticFeedback, openURL } from '@apps-in-toss/web-framework';
import { Top } from '@toss/tds-mobile';
import { MockLoginButton } from './w_mock_login';
import { LogOut } from 'lucide-react';

/**
 * 인스타그램 ID 마스킹 (보안용)
 */
const maskInstagramId = (id: string) => {
    if (!id) return '';
    if (id.length <= 3) return id;
    return id.substring(0, 3) + '***';
};

/**
 * 내가 좋아요한 인플루언서 목록 컴포넌트
 */
const LikedInfluencerList = () => {
    const { likedInfluencers, toggleLike, syncLikedInfluencers, member } = useAuthStore();
    const [isInitialLoaded, setIsInitialLoaded] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (member?.id && !isInitialLoaded) {
            syncLikedInfluencers().then(() => setIsInitialLoaded(true));
        }
    }, [member?.id, syncLikedInfluencers, isInitialLoaded]);

    const handleUnlike = (id: string) => {
        triggerHaptic("tickMedium");
        toggleLike(id);
    };

    if (likedInfluencers.length === 0) return null;

    return (
        <section className="space-y-4">
            {/* 토글 버튼 */}
            <button
                onClick={() => { triggerHaptic("tickWeak"); setIsExpanded(!isExpanded); }}
                className="w-full flex items-center justify-between p-4 hover:bg-[var(--glass-border)] rounded-[16px] transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--glass-border)] rounded-full flex items-center justify-center text-[#FF80AB] group-hover:bg-[var(--bg-color)] transition-colors border border-transparent">
                        <Heart size={20} fill="#FF80AB" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[16px] font-bold text-[var(--text-color)] opacity-90">좋아요</span>
                        <span className="text-[12px] font-bold text-[#FF80AB] bg-[#FF80AB]/10 px-2 py-0.5 rounded-full">
                            {likedInfluencers.length}
                        </span>
                    </div>
                </div>
                {isExpanded ? <ChevronUp size={18} className="text-[var(--text-color)] opacity-30" /> : <ChevronDown size={18} className="text-[var(--text-color)] opacity-30" />}
            </button>

            {/* 펼쳐지는 리스트 */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-2 pb-2">
                            <AnimatePresence mode="popLayout">
                                {likedInfluencers.map((inf) => (
                                    <motion.div
                                        key={inf.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        className="relative group"
                                    >
                                        {/* 스와이프를 감싸는 최상위 컨테이너 */}
                                        <div className="relative overflow-hidden rounded-[20px] bg-[var(--bg-color)]">
                                            {/* 삭제 배경 (비침을 방지하기 위해 우측에 약간의 여백(inset)을 주거나 z-index 조정) */}
                                            <div className="absolute inset-y-[1px] right-[1px] w-16 overflow-hidden pointer-events-none">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUnlike(inf.id);
                                                    }}
                                                    className="w-full h-full flex flex-col items-center justify-center bg-[#FF80AB] text-white active:opacity-80 pointer-events-auto rounded-r-[20px]"
                                                >
                                                    <Heart size={20} fill="white" />
                                                    <span className="text-[10px] font-bold mt-0.5">취소</span>
                                                </button>
                                            </div>

                                            {/* 리스트 아이템 (스와이프 가능) */}
                                            <motion.div
                                                drag="x"
                                                dragConstraints={{ left: -64, right: 0 }}
                                                dragElastic={0.02}
                                                // items의 배경색과 border를 명확히 하여 하단 레이어를 가림
                                                className="relative bg-[var(--bg-color)] border border-black/[0.08] dark:border-white/10 rounded-[20px] overflow-hidden active:scale-[0.98] transition-shadow cursor-grab active:cursor-grabbing z-10"
                                            >
                                                <div className="flex items-center gap-3 p-4">
                                                    <img
                                                        src={inf.image_url}
                                                        alt={inf.instagram_id}
                                                        className="w-11 h-11 rounded-full object-cover border border-black/[0.05] dark:border-white/10 flex-shrink-0"
                                                    />
                                                    <div className="flex flex-col gap-0.5 min-w-0">
                                                        <span className="text-[16px] font-bold text-[var(--text-color)] dark:text-white truncate">
                                                            {maskInstagramId(inf.instagram_id)}
                                                        </span>
                                                        <span className="text-[13px] font-medium text-[var(--text-color)] dark:text-[#A1A1A1] opacity-60 truncate">
                                                            {`${PROVINCE_DISPLAY_NAMES[inf.province_id as keyof typeof PROVINCE_DISPLAY_NAMES] || ''} ${REGION_DATA[inf.province_id as keyof typeof REGION_DATA]?.find(d => d.id === inf.district_id)?.name || ''}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

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
    const { isDrawerOpen, closeDrawer, selectRegion } = useRegionStore();
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
                        <Top
                            title={
                                <Top.TitleParagraph color="var(--text-color)">
                                    {view === 'faq' ? '자주 묻는 질문' : '메뉴'}
                                </Top.TitleParagraph>
                            }
                            upper={
                                view === 'faq' ? (
                                    <Top.UpperAssetContent
                                        content={
                                            <button
                                                onClick={() => { triggerHaptic("tickWeak"); setView('main'); }}
                                                className="p-1 hover:bg-[var(--glass-border)] rounded-full transition-colors"
                                            >
                                                <ArrowLeft size={24} className="text-[var(--text-color)]" />
                                            </button>
                                        }
                                    />
                                ) : null
                            }
                            right={
                                <Top.RightButton onClick={closeDrawer}>
                                    <X size={24} />
                                </Top.RightButton>
                            }
                        />

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
                                            <div className="liquid-glass rounded-[24px] p-6 space-y-5">
                                                {member ? (
                                                    // 로그인 상태
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-14 h-14 bg-[var(--bg-color)] rounded-full flex items-center justify-center text-[var(--text-color)] opacity-60 shadow-sm border border-[var(--glass-border)]">
                                                                <User size={30} />
                                                            </div>
                                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                                <h3 className="text-[18px] font-bold text-[var(--text-color)] leading-tight truncate">
                                                                    {member.name}
                                                                </h3>
                                                                <p className="text-[13px] font-medium text-[var(--text-color)] opacity-60">
                                                                    반가워요!
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* 로그아웃 버튼 (작게) */}
                                                        <button
                                                            onClick={() => {
                                                                triggerHaptic("tickWeak");
                                                                useAuthStore.getState().logout();
                                                            }}
                                                            className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--text-color)] opacity-30 hover:opacity-100 transition-opacity ml-auto px-2 py-1"
                                                        >
                                                            <LogOut size={14} />
                                                            로그아웃
                                                        </button>
                                                    </div>
                                                ) : (
                                                    // 비로그인 상태 (자동 로그인 실패 시)
                                                    <div className="space-y-4">
                                                        <div className="flex flex-col gap-1">
                                                            <h3 className="text-[18px] font-bold text-[var(--text-color)]">
                                                                로그인 후 이용해주세요
                                                            </h3>
                                                            <p className="text-[13px] font-medium text-[var(--text-color)] opacity-60 leading-relaxed">
                                                                인플루언서 맵 서비스를 이용하려면<br />로그인이 필요합니다.
                                                            </p>
                                                        </div>

                                                        <div className="space-y-2 pt-2 border-t border-[var(--glass-border)] border-dashed">
                                                            <MockLoginButton />
                                                        </div>
                                                    </div>
                                                )}
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
                                                <div
                                                    className={`text-[14px] font-medium text-[var(--text-color)] opacity-80 mb-1 leading-relaxed ${regInfo.status === 'approved' ? 'cursor-pointer active:opacity-60 transition-opacity' : ''}`}
                                                    onClick={() => {
                                                        if (regInfo.status === 'approved' && regInfo.province_id && regInfo.district_id) {
                                                            triggerHaptic("tap");
                                                            selectRegion(regInfo.province_id, regInfo.district_id);
                                                            closeDrawer();
                                                        }
                                                    }}
                                                >
                                                    {regInfo.status === 'approved'
                                                        ? (
                                                            <div className="flex flex-col gap-1">
                                                                <p>현재 아래 지역에 노출되고 있습니다.</p>
                                                                <div className="inline-flex items-center gap-1.5 text-[#00D082] font-bold mt-1">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#00D082] animate-pulse" />
                                                                    {getRegionName()}
                                                                </div>
                                                                <p className="text-[11px] opacity-40 mt-1">클릭하면 지도로 이동해요</p>
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

                                        {/* 좋아요 리스트 (순서 상단으로 이동) */}
                                        <LikedInfluencerList />

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
                                                            className="w-full flex items-center justify-between p-5 text-left active:bg-white/5 outline-none focus:ring-0 select-none transition-colors"
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
                                                                    <div className="p-5 pt-0 text-[14px] font-medium text-[var(--text-color)] opacity-80 leading-relaxed border-t border-black/[0.05] dark:border-white/5 border-dashed mt-0.5">
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
