import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';
import { useRegionStore } from '../stores/region_store';
import { FAQ_DATA } from '../../data/constants/faq';

/**
 * 사이드바 메뉴 (Drawer)
 * 고객센터, FAQ, 인플루언서 등록 기능을 제공합니다.
 */
export const DrawerMenu = () => {
    const { isDrawerOpen, closeDrawer } = useRegionStore();
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
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

                            {/* 인플루언서 등록 (강조) */}
                            <section>
                                <div className="bg-[#F2F4F6] rounded-[20px] p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <UserPlus size={20} className="text-[#3182F6]" />
                                        <h3 className="text-[16px] font-bold text-[#191F28]">인플루언서 등록하기</h3>
                                    </div>
                                    <p className="text-[14px] text-[#4E5968] mb-4 leading-snug">
                                        나의 영향력을 지도에 표시해보세요.<br />등록은 100% 무료입니다!
                                    </p>
                                    <button
                                        onClick={() => alert('준비 중인 기능입니다! (Google Form 연동 예정)')}
                                        className="w-full py-3 bg-[#3182F6] text-white rounded-[12px] font-bold text-[14px] hover:bg-[#2563EB] transition-colors"
                                    >
                                        지금 신청하기
                                    </button>
                                </div>
                            </section>

                            {/* 자주 묻는 질문 (FAQ) */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <HelpCircle size={20} className="text-[#333D4B]" />
                                    <h3 className="text-[18px] font-bold text-[#191F28]">자주 묻는 질문</h3>
                                </div>
                                <div className="space-y-3">
                                    {FAQ_DATA.map((item, index) => {
                                        const isOpen = expandedFAQ === index;
                                        return (
                                            <div key={index} className="border border-[#F2F4F6] rounded-[16px] overflow-hidden">
                                                <button
                                                    onClick={() => toggleFAQ(index)}
                                                    className="w-full flex items-center justify-between p-4 bg-white text-left"
                                                >
                                                    <span className="text-[15px] font-medium text-[#333D4B] pr-4 leading-snug">
                                                        {item.question}
                                                    </span>
                                                    {isOpen ? <ChevronUp size={20} className="text-[#8B95A1] flex-shrink-0" /> : <ChevronDown size={20} className="text-[#8B95A1] flex-shrink-0" />}
                                                </button>
                                                <AnimatePresence>
                                                    {isOpen && (
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: "auto" }}
                                                            exit={{ height: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="p-4 pt-0 bg-white text-[14px] text-[#4E5968] leading-relaxed border-t border-[#F2F4F6] border-dashed mt-0.5">
                                                                <div className="pt-3">{item.answer}</div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
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
