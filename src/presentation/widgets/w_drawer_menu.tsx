import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, UserPlus, ChevronDown, ChevronUp, Share2, User } from 'lucide-react';
import { useRegionStore } from '../stores/region_store';
import { useAuthStore } from '../stores/auth_store';
import { FAQ_DATA } from '../../data/constants/faq';
import { REGION_DATA, PROVINCE_DISPLAY_NAMES } from '../../data/constants/regions';
import { share, generateHapticFeedback, appLogin, openURL } from '@apps-in-toss/web-framework';
import { MemberService } from '../../data/services/member_service';
import { InfluencerService } from '../../data/services/influencer_service';
import { isSupabaseConfigured } from '../../lib/supabase';

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

    const { isLoggedIn, login, member } = useAuthStore();
    const [regInfo, setRegInfo] = useState<{
        status: 'pending' | 'approved' | 'rejected' | null;
        province_id?: string;
        district_id?: string;
    }>({ status: null });

    // 드로어가 열릴 때마다 등록 상태 확인
    useEffect(() => {
        if (isDrawerOpen && isLoggedIn && member?.id) {
            InfluencerService.getMyRegistrationStatus(member.id).then(info => {
                setRegInfo(info);
            });
        }
    }, [isDrawerOpen, isLoggedIn, member?.id]);

    // 지역 이름 가져오기 유틸
    const getRegionName = () => {
        if (!regInfo.province_id || !regInfo.district_id) return '';
        const provinceName = PROVINCE_DISPLAY_NAMES[regInfo.province_id as keyof typeof PROVINCE_DISPLAY_NAMES] || '';
        const districts = REGION_DATA[regInfo.province_id as keyof typeof REGION_DATA] || [];
        const districtName = districts.find(d => d.id === regInfo.district_id)?.name || '';
        return `${provinceName} ${districtName}`;
    };

    const handleLogin = async () => {
        triggerHaptic("tickMedium");

        // 로컬 환경 또는 개발 환경 체크 
        const isLocal = window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.startsWith('192.168.') ||
            window.location.hostname.endsWith('.local');

        try {
            // 1. 토스 내부 앱 환경인지 확인 (브릿지가 존재하고 로컬이 아닌 경우 우선)
            if (typeof appLogin === 'function' && !isLocal) {
                await appLogin();

                const member = await MemberService.syncMember({
                    toss_id: `toss_${Math.random().toString(36).substring(2, 11)}`,
                    name: '토스 사용자',
                });

                if (member) {
                    login(member);
                }
            } else {
                // 2. 로컬 환경이거나 토스 앱이 아닌 경우 (데모 모드)
                if (!isLocal) {
                    alert('로그인은 토스 앱 내에서 가능합니다.\n(로컬 환경에서는 데모 로그인이 실행됩니다.)');
                }

                // Supabase가 설정되어 있으면 Mock 유저라도 DB에 생성 시도 (외래 키 제약 조건 준수 위해 필수)
                const mockTossId = 'demo_user_123';
                const mockName = isLocal ? '로컬 테스터' : '데모 사용자';

                if (isSupabaseConfigured) {
                    try {
                        const demoMember = await MemberService.syncMember({
                            toss_id: mockTossId,
                            name: mockName,
                        });

                        if (demoMember) {
                            login(demoMember);
                            return;
                        }
                    } catch (e) {
                        console.warn('Supabase sync failed, falling back to instant mock login');
                    }
                }

                // 최후의 보루: DB 연결 안되어도 UI는 작동하게 함
                login({
                    id: '00000000-0000-0000-0000-000000000000',
                    toss_id: mockTossId,
                    name: mockName,
                    profile_image: '',
                    created_at: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Login Error:', error);
            // 에러 발생 시에도 로컬이면 로그인 상태로 진입하게 해줌 (개발 편의성)
            if (isLocal) {
                login({
                    id: '00000000-0000-0000-0000-000000000001',
                    toss_id: 'error_user',
                    name: '로컬 테스터(오류)',
                    profile_image: '',
                    created_at: new Date().toISOString()
                });
            }
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

    const handleInstagramClick = (username: string) => {
        triggerHaptic("tap");
        const url = `https://www.instagram.com/${username.replace('@', '')}`;
        if (typeof openURL === 'function') {
            (openURL(url) as any).catch(() => window.open(url, '_blank'));
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
                                        {!isLoggedIn && (
                                            <p className="text-[14px] font-medium text-[#4E5968]">
                                                더 많은 기능을 이용해보세요!
                                            </p>
                                        )}
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

                            {/* 인플루언서 등록 / 관리 (상태에 따라 분기) */}
                            {isLoggedIn && (
                                <section>
                                    <div className="bg-[#F2F4F6] rounded-[24px] p-6 border border-white">
                                        <div className="flex items-center gap-2 mb-2">
                                            <UserPlus size={20} className={regInfo.status === 'approved' ? 'text-[#00D082]' : 'text-[#3182F6]'} />
                                            <h3 className="text-[16px] font-bold text-[#191F28]">
                                                {regInfo.status === 'approved' ? '인플루언서 활동 중' : '인플루언서 등록하기'}
                                            </h3>
                                        </div>
                                        <div className="text-[14px] font-medium text-[#4E5968] mb-1 leading-relaxed">
                                            {regInfo.status === 'approved'
                                                ? (
                                                    <div className="flex flex-col gap-1">
                                                        <p>현재 아래 지역 인지도에 노출되고 있습니다.</p>
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
                                                className={`w-full mt-4 py-3.5 rounded-[14px] font-bold text-[15px] transition-colors border ${regInfo.status === 'pending'
                                                    ? 'bg-[#F2F8FF] text-[#3182F6] border-[#3182F6]'
                                                    : 'bg-white text-[#3182F6] border-[#3182F6] hover:bg-[#F2F8FF]'
                                                    }`}
                                            >
                                                {regInfo.status === 'pending' ? '검수 대기 중' : '지금 신청하기'}
                                            </motion.button>
                                        )}
                                    </div>
                                </section>
                            )}

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
                                                                <div className="pt-4">{renderAnswer(item.answer)}</div>
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
