import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Instagram, MapPin, CheckCircle2, ArrowLeft } from 'lucide-react';
import { REGION_DATA, PROVINCE_DISPLAY_NAMES } from '../../data/constants/regions';
import { InfluencerService } from '../../data/services/influencer_service';
import { generateHapticFeedback } from '@apps-in-toss/web-framework';
import { useAuthStore } from '../stores/auth_store';

interface IRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const triggerHaptic = (type: "tickWeak" | "tap" | "tickMedium" | "success" = "tickWeak") => {
    if (typeof generateHapticFeedback === 'function') {
        generateHapticFeedback({ type }).catch(() => { });
    }
};

export const RegistrationModal: React.FC<IRegistrationModalProps> = ({ isOpen, onClose }) => {
    const { member } = useAuthStore();
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: 지역 선택, 2: 정보 입력, 3: 완료 안내
    const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [instagramId, setInstagramId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setStep(1);
        setSelectedProvince(null);
        setSelectedDistrict(null);
        setInstagramId('');
        setIsSubmitting(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (!selectedProvince || !selectedDistrict || !instagramId) return;

        setIsSubmitting(true);
        triggerHaptic("tickMedium");

        const result = await InfluencerService.registerInfluencer({
            instagram_id: instagramId.replace('@', ''),
            province_id: selectedProvince,
            district_id: selectedDistrict,
            member_id: member?.id,
            image_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&h=200&fit=crop', // 임시 이미지
        });

        if (result) {
            triggerHaptic("success");
            setStep(3);
        } else {
            alert('등록 신청 중 오류가 발생했습니다. 다시 시도해 주세요.');
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* 배경 */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
                    />

                    {/* 모달 본체 */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 z-[201] h-[85vh] bg-white rounded-t-[32px] flex flex-col overflow-hidden"
                    >
                        {/* 헤더 */}
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-2">
                                {step === 2 && (
                                    <button
                                        onClick={() => { triggerHaptic("tickWeak"); setStep(1); }}
                                        className="p-1 hover:bg-[#F2F4F6] rounded-full transition-colors"
                                    >
                                        <ArrowLeft size={24} className="text-[#333D4B]" />
                                    </button>
                                )}
                                <h2 className="text-[20px] font-bold text-[#191F28]">
                                    {step === 3 ? '신청 완료' : '인플루언서 등록'}
                                </h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-[#F2F4F6] rounded-full transition-colors"
                            >
                                <X size={24} className="text-[#333D4B]" />
                            </button>
                        </div>

                        {/* 단계별 컨텐츠 */}
                        <div className="flex-1 overflow-y-auto px-6 pb-12">
                            {step === 1 && (
                                <div className="space-y-6">
                                    <header>
                                        <h3 className="text-[22px] font-bold text-[#191F28] mb-2 leading-tight">
                                            활동하시는 지역을<br />선택해주세요
                                        </h3>
                                        <p className="text-[#4E5968] text-[15px]">정확한 정보를 입력해야 지도에 노출됩니다.</p>
                                    </header>

                                    {!selectedProvince ? (
                                        /* 1-1. 시/도 선택 */
                                        <div className="grid grid-cols-2 gap-3 pb-8">
                                            {Object.entries(PROVINCE_DISPLAY_NAMES).map(([id, name]) => (
                                                <button
                                                    key={id}
                                                    onClick={() => {
                                                        triggerHaptic("tickWeak");
                                                        setSelectedProvince(id);
                                                    }}
                                                    className="p-4 bg-[#F9FAFB] hover:bg-[#F2F4F6] rounded-[20px] text-center font-bold text-[#333D4B] transition-colors border border-transparent active:border-[#3182F6]"
                                                >
                                                    {name}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        /* 1-2. 구/군 선택 */
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin size={16} className="text-[#3182F6]" />
                                                <span className="text-[15px] font-bold text-[#3182F6]">{PROVINCE_DISPLAY_NAMES[selectedProvince]}</span>
                                                <button
                                                    onClick={() => setSelectedProvince(null)}
                                                    className="text-[13px] text-[#8B95A1] underline"
                                                >
                                                    변경
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 pb-8">
                                                {REGION_DATA[selectedProvince].map((district) => (
                                                    <button
                                                        key={district.id}
                                                        onClick={() => {
                                                            triggerHaptic("tap");
                                                            setSelectedDistrict(district.id);
                                                            setStep(2);
                                                        }}
                                                        className="p-4 bg-[#F9FAFB] hover:bg-[#F2F4F6] rounded-[20px] text-center font-bold text-[#333D4B] transition-colors border border-transparent active:border-[#3182F6]"
                                                    >
                                                        {district.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8">
                                    <header>
                                        <h3 className="text-[22px] font-bold text-[#191F28] mb-2 leading-tight">
                                            인스타그램 정보를<br />입력해주세요
                                        </h3>
                                        <div className="flex items-center gap-2 bg-[#F2F4F6] px-3 py-1.5 rounded-full w-fit">
                                            <MapPin size={14} className="text-[#3182F6]" />
                                            <span className="text-[13px] font-bold text-[#4E5968]">
                                                {PROVINCE_DISPLAY_NAMES[selectedProvince!]} {REGION_DATA[selectedProvince!].find(d => d.id === selectedDistrict)?.name}
                                            </span>
                                        </div>
                                    </header>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[14px] font-bold text-[#4E5968] ml-1">인스타그램 ID</label>
                                            <div className="relative">
                                                <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ADB5BD]" size={20} />
                                                <input
                                                    type="text"
                                                    value={instagramId}
                                                    onChange={(e) => setInstagramId(e.target.value)}
                                                    placeholder="아이디를 입력하세요 (예: my_insta)"
                                                    className="w-full pl-12 pr-4 py-4 bg-[#F9FAFB] rounded-[20px] border-2 border-transparent focus:border-[#3182F6] outline-none text-[16px] font-medium transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-[#F2F8FF] p-5 rounded-[24px] border border-[#3182F6]/10">
                                            <h4 className="text-[15px] font-bold text-[#3182F6] mb-2 flex items-center gap-2">
                                                <CheckCircle2 size={18} />
                                                등록 전 안내사항
                                            </h4>
                                            <ul className="text-[13px] text-[#4E5968] space-y-2 leading-relaxed font-medium">
                                                <li>• 신청 후 관리자가 내용 검토를 진행합니다.</li>
                                                <li>• 본인 확인을 위해 관리자 인스타 팔로우 및 DM을 보내셔야 최종 등록됩니다.</li>
                                                <li>• 부적절한 계정은 예고 없이 반려될 수 있습니다.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        disabled={!instagramId || isSubmitting}
                                        onClick={handleSubmit}
                                        className={`
                                            w-full py-5 rounded-[20px] font-bold text-[17px] transition-all shadow-lg
                                            ${instagramId && !isSubmitting
                                                ? 'bg-[#3182F6] text-white shadow-[#3182F6]/20'
                                                : 'bg-[#E5E8EB] text-[#ADB5BD] shadow-none cursor-not-allowed'}
                                        `}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>처리 중...</span>
                                            </div>
                                        ) : '등록 신청하기'}
                                    </motion.button>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-10">
                                    <div className="w-24 h-24 bg-[#3182F6]/10 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 size={56} className="text-[#3182F6]" />
                                    </div>
                                    <div>
                                        <h3 className="text-[24px] font-bold text-[#191F28] mb-3">
                                            신청이 완료되었어요!
                                        </h3>
                                        <p className="text-[#4E5968] text-[16px] leading-relaxed font-medium">
                                            마지막 단계로 아래 버튼을 눌러<br />
                                            관리자에게 <span className="text-[#3182F6] font-bold">"등록 신청했습니다"</span>라고<br />
                                            DM을 보내주시면 가장 빠르게 승인됩니다.
                                        </p>
                                    </div>

                                    <div className="w-full pt-8 space-y-3">
                                        <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                triggerHaptic("tickMedium");
                                                window.open('https://instagram.com/influencer_map', '_blank');
                                            }}
                                            className="w-full py-5 bg-[#191F28] text-white rounded-[20px] font-bold text-[17px] flex items-center justify-center gap-2 shadow-xl"
                                        >
                                            <Instagram size={20} />
                                            관리자에게 DM 보내기
                                        </motion.button>
                                        <button
                                            onClick={handleClose}
                                            className="w-full py-4 text-[#8B95A1] font-bold text-[15px]"
                                        >
                                            나중에 하기
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
