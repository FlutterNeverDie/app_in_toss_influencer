import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Instagram, MapPin, CheckCircle2, Camera, Image as ImageIcon } from 'lucide-react';
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
    const { member, influencerStatus: regInfo, refreshInfluencerStatus } = useAuthStore();
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: 지역 선택, 2: 정보 입력, 3: 완료 안내
    const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [instagramId, setInstagramId] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && member?.id) {
            refreshInfluencerStatus();
        }
    }, [isOpen, member?.id, refreshInfluencerStatus]);

    const resetForm = () => {
        setStep(1);
        setSelectedProvince(null);
        setSelectedDistrict(null);
        setInstagramId('');
        setSelectedImage(null);
        setImagePreview(null);
        setIsSubmitting(false);
        setErrorMessage(null);
        // regInfo는 전역 상태이므로 여기서 리셋하지 않음 (필요 시 refresh 호출)
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        if (!selectedProvince || !selectedDistrict || !instagramId || !selectedImage) {
            setErrorMessage('이미지와 인스타그램 아이디를 모두 입력해주세요.');
            return;
        }

        // Instagram ID Validation Rules
        const instagramIdRegex = /^[a-z0-9_.]+$/;
        if (instagramId.length > 30) {
            setErrorMessage('인스타그램 아이디는 30자 이내여야 합니다.');
            return;
        }
        if (!instagramIdRegex.test(instagramId)) {
            setErrorMessage('아이디는 소문자, 숫자, 밑줄(_), 마침표(.)만 사용할 수 있습니다.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);
        triggerHaptic("tickMedium");

        try {
            // 1. 이미지 업로드
            const imageUrl = await InfluencerService.uploadProfileImage(selectedImage, member?.id || 'anonymous');

            if (!imageUrl) {
                setErrorMessage('이미지 업로드에 실패했습니다. (스토리지 설정을 확인해주세요)');
                setIsSubmitting(false);
                return;
            }

            // 2. 인플루언서 등록
            const result = await InfluencerService.registerInfluencer({
                instagram_id: instagramId.replace('@', ''),
                province_id: selectedProvince,
                district_id: selectedDistrict,
                member_id: member?.id,
                image_url: imageUrl,
            });

            if (result.success) {
                triggerHaptic("success");
                setStep(3);
                // 등록 성공 후 상태 갱신
                await refreshInfluencerStatus();
            } else {
                setErrorMessage(result.message || '등록 신청 중 오류가 발생했습니다. (데이터 형식을 확인해주세요)');
                setIsSubmitting(false);
            }
        } catch (e) {
            console.error('Registration error:', e);
            setErrorMessage('서버와의 통신이 원활하지 않습니다.');
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
                        className="fixed inset-x-0 bottom-0 z-[201] h-[85vh] bg-white dark:bg-[var(--sheet-bg)] rounded-t-[32px] flex flex-col overflow-hidden shadow-2xl"
                    >
                        {/* 헤더 */}
                        <div className="flex items-center justify-center p-6 border-b border-[var(--glass-border)]">
                            <h2 className="text-[20px] font-bold text-[var(--text-color)]">
                                {step === 3 ? '신청 완료' : (regInfo.status === 'pending' ? '신청 현황' : '인플루언서 등록')}
                            </h2>
                            <button
                                onClick={handleClose}
                                className="absolute right-6 p-2 hover:bg-[var(--glass-border)] rounded-full transition-colors"
                            >
                                <X size={24} className="text-[var(--text-color)]" />
                            </button>
                        </div>

                        {/* 단계별 컨텐츠 */}
                        <div className="flex-1 overflow-y-auto px-6 pb-12">
                            {regInfo.status === 'pending' && step !== 3 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 pt-10">
                                    <div className="w-24 h-24 bg-[#3182F6]/10 rounded-full flex items-center justify-center relative">
                                        <div className="absolute inset-0 border-2 border-[#3182F6]/20 rounded-full animate-ping opacity-20" />
                                        <CheckCircle2 size={48} className="text-[#3182F6]" />
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-[24px] font-bold text-[var(--text-color)]">
                                            꼼꼼하게 검토하고 있어요!
                                        </h3>
                                        <p className="text-[var(--text-color)] opacity-70 text-[16px] leading-relaxed">
                                            제출해주신 정보를 확인하고 있습니다.<br />
                                            조금만 기다려주시면 알림을 보내드릴게요.
                                        </p>
                                    </div>

                                    <div className="w-full max-w-[280px] bg-[var(--glass-border)] rounded-[20px] p-5 text-left space-y-3">
                                        <div className="flex justify-between items-center text-[14px]">
                                            <span className="text-[var(--text-color)] opacity-50">신청 지역</span>
                                            <span className="font-bold text-[var(--text-color)]">
                                                {regInfo.province_id && PROVINCE_DISPLAY_NAMES[regInfo.province_id]}
                                                {' '}
                                                {regInfo.province_id && regInfo.district_id && REGION_DATA[regInfo.province_id]?.find(d => d.id === regInfo.district_id)?.name}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-[14px]">
                                            <span className="text-[var(--text-color)] opacity-50">상태</span>
                                            <span className="text-[#3182F6] font-bold">검수 대기 중</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleClose}
                                        className="w-full py-4 rounded-[20px] bg-[#F2F4F6] dark:bg-[var(--glass-border)] text-[var(--text-color)] font-bold text-[15px] active:scale-98 transition-all"
                                    >
                                        닫기
                                    </button>
                                </div>
                            ) : step === 1 && (
                                <div className="space-y-6">
                                    <header>
                                        <h3 className="text-[22px] font-bold text-[var(--text-color)] mb-2 leading-tight">
                                            활동하시는 지역을<br />선택해주세요
                                        </h3>
                                        {regInfo.status === 'pending' ? (
                                            <p className="text-[#3182F6] text-[15px] font-bold bg-[#3182F6]/10 p-3 rounded-xl">이미 신청하신 정보가 검수 중입니다.</p>
                                        ) : regInfo.status === 'approved' ? (
                                            <p className="text-[#00D082] text-[15px] font-bold bg-[#00D082]/10 p-3 rounded-xl">이미 활동 중인 인플루언서입니다.</p>
                                        ) : (
                                            <p className="text-[var(--text-color)] opacity-70 text-[15px]">정확한 정보를 입력해야 지도에 노출됩니다.</p>
                                        )}
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
                                                    className="p-4 liquid-glass [@media(hover:hover)]:hover:bg-[var(--glass-border)] text-center font-bold text-[var(--text-color)] transition-all active:scale-95 active:bg-[var(--glass-border)]"
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
                                                    className="text-[13px] text-[var(--text-color)] opacity-50 underline"
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
                                                        className="p-4 liquid-glass [@media(hover:hover)]:hover:bg-[var(--glass-border)] text-center font-bold text-[var(--text-color)] transition-all active:scale-95 active:bg-[var(--glass-border)]"
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
                                        <h3 className="text-[22px] font-bold text-[var(--text-color)] mb-2 leading-tight">
                                            인스타그램 정보를<br />입력해주세요
                                        </h3>
                                        <div className="flex items-center gap-2 bg-[var(--glass-border)] px-3 py-1.5 rounded-full w-fit">
                                            <MapPin size={14} className="text-[#3182F6]" />
                                            <span className="text-[13px] font-bold text-[var(--text-color)] opacity-80">
                                                {PROVINCE_DISPLAY_NAMES[selectedProvince!]} {REGION_DATA[selectedProvince!].find(d => d.id === selectedDistrict)?.name}
                                            </span>
                                        </div>
                                    </header>

                                    <div className="space-y-6">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="relative group">
                                                <div className="w-24 h-24 rounded-full bg-[var(--glass-border)] flex items-center justify-center overflow-hidden border-2 border-[var(--glass-border)]">
                                                    {imagePreview ? (
                                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Camera className="text-[var(--text-color)] opacity-40" size={32} />
                                                    )}
                                                </div>
                                                <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#3182F6] rounded-full flex items-center justify-center text-white cursor-pointer shadow-md hover:bg-[#1B64DA] transition-colors">
                                                    <ImageIcon size={16} />
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                                </label>
                                            </div>
                                            <p className="text-[13px] text-[var(--text-color)] opacity-50">본인 확인이 가능한 사진을 올려주세요</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="liquid-glass p-5 rounded-[20px] flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-[var(--bg-color)] flex items-center justify-center shadow-sm text-[#3182F6]">
                                                    <Instagram size={22} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[13px] text-[var(--text-color)] opacity-50 mb-1">인스타그램 아이디</p>
                                                    <input
                                                        type="text"
                                                        value={instagramId}
                                                        onChange={(e) => setInstagramId(e.target.value)}
                                                        placeholder="@아이디 입력"
                                                        maxLength={30}
                                                        className="w-full bg-transparent text-[17px] font-bold text-[var(--text-color)] focus:outline-none placeholder:opacity-30"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-[#3182F6]/5 p-5 rounded-[24px] border border-[#3182F6]/10">
                                            <h4 className="text-[15px] font-bold text-[#3182F6] mb-2 flex items-center gap-2">
                                                <CheckCircle2 size={18} />
                                                등록 전 안내사항
                                            </h4>
                                            <ul className="text-[13px] text-[var(--text-color)] opacity-70 space-y-2 leading-relaxed font-medium">
                                                <li>• 신청 후 관리자가 내용 검토를 진행합니다.</li>
                                                <li>• 본인 확인을 위해 관리자 인스타 팔로우 및 DM을 보내셔야 최종 등록됩니다.</li>
                                                <li>• 부적절한 계정은 예고 없이 반려될 수 있습니다.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {errorMessage && (
                                        <div className="bg-[#FF4D4F]/10 p-4 rounded-[16px] border border-[#FF4D4F]/20 text-[#FF4D4F] text-[13px] font-bold text-center">
                                            {errorMessage}
                                        </div>
                                    )}

                                    {regInfo.status !== 'approved' && (
                                        <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            disabled={!instagramId || !selectedImage || isSubmitting || regInfo.status === 'pending'}
                                            onClick={handleSubmit}
                                            className={`
                                                w-full py-5 rounded-[20px] font-bold text-[17px] transition-all shadow-lg
                                                ${instagramId && selectedImage && !isSubmitting && regInfo.status !== 'pending'
                                                    ? 'bg-[#3182F6] text-white shadow-[#3182F6]/20'
                                                    : 'bg-[var(--glass-border)] text-[var(--text-color)] opacity-30 shadow-none cursor-not-allowed'}
                                            `}
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>처리 중...</span>
                                                </div>
                                            ) : regInfo.status === 'pending' ? (
                                                '검수 대기 중'
                                            ) : (
                                                '등록 신청하기'
                                            )}
                                        </motion.button>
                                    )}
                                </div>
                            )}

                            {step === 3 && (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-10">
                                    <div className="w-24 h-24 bg-[#3182F6]/10 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 size={56} className="text-[#3182F6]" />
                                    </div>
                                    <div>
                                        <h3 className="text-[24px] font-bold text-[var(--text-color)] mb-3">
                                            신청이 완료되었어요!
                                        </h3>
                                        <p className="text-[var(--text-color)] opacity-70 text-[16px] leading-relaxed font-medium">
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
                                                window.open('https://www.instagram.com/influer_map?igsh=OGM2bzExcXlqY25r&utm_source=qr', '_blank');
                                            }}
                                            className="w-full py-5 bg-[var(--text-color)] text-[var(--bg-color)] rounded-[20px] font-bold text-[17px] flex items-center justify-center gap-2 shadow-xl"
                                        >
                                            <Instagram size={20} />
                                            관리자에게 DM 보내기
                                        </motion.button>
                                        <button
                                            onClick={handleClose}
                                            className="w-full py-4 text-[var(--text-color)] opacity-50 font-bold text-[15px]"
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
