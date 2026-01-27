import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Instagram, MapPin, CheckCircle2, Camera, Image as ImageIcon } from 'lucide-react';
import { REGION_DATA, PROVINCE_DISPLAY_NAMES } from '../../data/constants/regions';
import { InfluencerService } from '../../data/services/influencer_service';
import { useAuthStore } from '../stores/auth_store';
import { BottomSheet, Button, TextField, Paragraph } from '@toss/tds-mobile';
import { generateHapticFeedback } from '@apps-in-toss/web-framework';

const triggerHaptic = (type: "tickWeak" | "tap" | "tickMedium" | "success" = "tickWeak") => {
    if (typeof generateHapticFeedback === 'function') {
        generateHapticFeedback({ type }).catch(() => { });
    }
};

interface IRegistrationBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export const RegistrationModal: React.FC<IRegistrationBottomSheetProps> = ({ isOpen, onClose }) => {
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
            const imageUrl = await InfluencerService.uploadProfileImage(selectedImage, member?.id || 'anonymous');

            if (!imageUrl) {
                setErrorMessage('이미지 업로드에 실패했습니다.');
                setIsSubmitting(false);
                return;
            }

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
                await refreshInfluencerStatus();
            } else {
                setErrorMessage(result.message || '등록 신청 중 오류가 발생했습니다.');
                setIsSubmitting(false);
            }
        } catch (e) {
            console.error('Registration error:', e);
            setErrorMessage('서버와의 통신이 원활하지 않습니다.');
            setIsSubmitting(false);
        }
    };

    return (
        <BottomSheet open={isOpen} onClose={handleClose}>
            <div className={`bg-white dark:bg-[#1C1E22] ${regInfo.status === 'pending' || step === 3 ? 'h-fit min-h-[60vh] pb-10' : 'h-[85vh]'} rounded-t-[32px] overflow-hidden flex flex-col transition-all duration-300`}>
                {!(regInfo.status === 'pending' || step === 3) && (
                    <BottomSheet.Header>
                        <span style={{ color: 'var(--text-color)' }}>
                            {''}
                        </span>
                    </BottomSheet.Header>
                )}

                <div className={`px-6 flex-1 ${regInfo.status === 'pending' || step === 3 ? 'flex flex-col justify-start pt-8 overflow-hidden' : 'overflow-y-auto scrollbar-hide'} registration-modal-content`}>
                    {regInfo.status === 'pending' && step !== 3 ? (
                        <div className="flex flex-col items-center justify-center text-center pt-4 pb-0">
                            <div className="w-20 h-20 bg-[#3182F6]/10 rounded-full flex items-center justify-center mb-10">
                                <CheckCircle2 size={42} className="text-[#3182F6]" />
                            </div>

                            <div className="space-y-4 mb-12">
                                <h3 className="text-[26px] font-bold" style={{ color: 'var(--text-color)' }}>검토 중이에요!</h3>
                                <Paragraph typography="t6" style={{ color: 'var(--text-color)', opacity: 0.8 }}>
                                    <span className="text-[#3182F6] font-bold">
                                        {regInfo.province_id && PROVINCE_DISPLAY_NAMES[regInfo.province_id]}
                                        {' '}
                                        {regInfo.province_id && regInfo.district_id && REGION_DATA[regInfo.province_id]?.find((d: any) => d.id === regInfo.district_id)?.name}
                                    </span> 지역 신청을 확인하고 있습니다.<br />
                                    본인 인증을 위해 아래 버튼을 눌러 관리자에게<br />
                                    <span className="text-[#3182F6] font-bold">"등록 신청했습니다"</span>라고 DM을 보내주세요.
                                </Paragraph>
                            </div>

                            <div className="w-full space-y-3">
                                <Button
                                    color="dark"
                                    size="large"
                                    display="block"
                                    onClick={() => {
                                        triggerHaptic("tickMedium");
                                        window.open('https://www.instagram.com/influer_map', '_blank');
                                    }}
                                    style={{ borderRadius: '24px' }}
                                >
                                    <Instagram size={20} className="mr-2 inline" />
                                    관리자에게 DM 보내기
                                </Button>
                                <Button size="large" color="light" display="block" onClick={handleClose} style={{ borderRadius: '24px', border: '1px solid #E5E8EB' }}>
                                    나중에 하기
                                </Button>
                            </div>
                        </div>
                    ) : step === 1 && (
                        <div className="space-y-6 pt-2">
                            <header className="mb-6">
                                <h3 className="text-[22px] font-bold leading-tight" style={{ color: 'var(--text-color)' }}>
                                    활동하시는 지역을<br />선택해주세요
                                </h3>
                                {regInfo.status === 'approved' && (
                                    <div className="mt-3 text-[#00D082] text-[14px] font-bold bg-[#00D082]/10 p-3 rounded-xl inline-block">
                                        이미 활동 중인 인플루언서입니다
                                    </div>
                                )}
                            </header>

                            {!selectedProvince ? (
                                <div className="grid grid-cols-2 gap-3 pb-8">
                                    {Object.entries(PROVINCE_DISPLAY_NAMES).map(([id, name]) => (
                                        <button
                                            key={id}
                                            onClick={() => {
                                                triggerHaptic("tickWeak");
                                                setSelectedProvince(id);
                                            }}
                                            className="h-[72px] bg-[#f9fafb] dark:bg-[#2C2E33] rounded-[24px] flex items-center justify-center text-[16px] font-bold transition-all active:scale-95"
                                            style={{ color: 'var(--text-color)' }}
                                        >
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2 bg-[#3182F6]/5 p-3 rounded-2xl w-fit">
                                        <MapPin size={16} className="text-[#3182F6]" />
                                        <span className="text-[15px] font-bold text-[#3182F6]">{PROVINCE_DISPLAY_NAMES[selectedProvince]}</span>
                                        <button
                                            onClick={() => setSelectedProvince(null)}
                                            className="text-[13px] text-[#8B95A1] underline ml-2"
                                        >
                                            변경
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pb-8">
                                        {REGION_DATA[selectedProvince]?.map((district: any) => (
                                            <button
                                                key={district.id}
                                                onClick={() => {
                                                    triggerHaptic("tap");
                                                    setSelectedDistrict(district.id);
                                                    setStep(2);
                                                }}
                                                className="h-[72px] bg-[#f9fafb] dark:bg-[#2C2E33] rounded-[24px] flex items-center justify-center text-[16px] font-bold transition-all active:scale-95"
                                                style={{ color: 'var(--text-color)' }}
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
                        <div className="space-y-8 pt-2">
                            <header>
                                <h3 className="text-[22px] font-bold leading-tight" style={{ color: 'var(--text-color)' }}>
                                    인스타그램 정보를<br />입력해주세요
                                </h3>
                                <div className="flex items-center gap-2 bg-[#f2f4f6] dark:bg-[#2C2E33] px-3 py-1.5 rounded-full w-fit mt-3">
                                    <MapPin size={14} className="text-[#3182F6]" />
                                    <span className="text-[13px] font-bold" style={{ color: 'var(--text-color)' }}>
                                        {selectedProvince && PROVINCE_DISPLAY_NAMES[selectedProvince]} {selectedProvince && selectedDistrict && REGION_DATA[selectedProvince]?.find((d: any) => d.id === selectedDistrict)?.name}
                                    </span>
                                </div>
                            </header>

                            <div className="space-y-8">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <div className="w-28 h-28 rounded-full bg-[#f2f4f6] dark:bg-[#2C2E33] flex items-center justify-center overflow-hidden border border-[#E5E8EB] dark:border-[#3A3D43]">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <Camera className="opacity-40 text-[#8B95A1] dark:text-[#FFFFFF]" size={36} />
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 w-9 h-9 bg-[#3182F6] rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg border-2 border-white dark:border-[#1C1E22]">
                                            <ImageIcon size={18} />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    </div>
                                    <span className="text-[13px] text-[#8B95A1]">본인 확인이 가능한 프로필 사진을 올려주세요</span>
                                </div>

                                <div className="space-y-4 registration-input-wrapper">
                                    <TextField
                                        variant="box"
                                        label="인스타그램 아이디"
                                        value={instagramId}
                                        /* @ts-ignore: TDS TextField supports left/right slots */
                                        left={<span className="text-[#8B95A1] dark:text-[#FFFFFF] ml-3">@</span>}
                                        onChange={(e) => {
                                            const val = e.target.value.replace('@', '').trim();
                                            setInstagramId(val);
                                        }}
                                        placeholder="아이디 입력"
                                        maxLength={30}
                                        className="tds-search-input registration-id-input"
                                    />
                                </div>
                                <div className="bg-[#3182F6]/5 p-5 rounded-[24px] border border-[#3182F6]/10">
                                    <h4 className="text-[15px] font-bold text-[#3182F6] mb-2">등록 전 안내사항</h4>
                                    <ul className="text-[13px] opacity-70 space-y-2 leading-relaxed" style={{ color: 'var(--text-color)' }}>
                                        <li>• 신청 후 관리자가 내용 검토를 진행합니다.</li>
                                        <li>• 본인 확인을 위해 관리자 팔로우 및 DM 발송이 필요합니다.</li>
                                        <li>• 부적합한 계정은 통보 없이 신청이 거절될 수 있습니다.</li>
                                    </ul>
                                </div>
                            </div>

                            {errorMessage && (
                                <div className="text-[#FF4D4F] text-[13px] font-bold text-center">
                                    {errorMessage}
                                </div>
                            )}

                            <Button
                                size="large"
                                color="primary"
                                display="block"
                                disabled={!instagramId || !selectedImage || isSubmitting || regInfo.status === 'pending'}
                                onClick={handleSubmit}
                                loading={isSubmitting}
                                style={{ borderRadius: '24px' }}
                            >
                                {regInfo.status === 'pending' ? '검수 대기 중' : '등록 신청하기'}
                            </Button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="flex flex-col items-center justify-center text-center pt-4 pb-0">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 10, stiffness: 100 }}
                                className="w-24 h-24 bg-[#3182F6]/10 rounded-full flex items-center justify-center mb-8"
                            >
                                <CheckCircle2 size={48} className="text-[#3182F6]" />
                            </motion.div>

                            <div className="mb-10">
                                <h3 className="text-[26px] font-bold mb-3" style={{ color: 'var(--text-color)' }}>신청이 완료되었어요!</h3>
                                <Paragraph typography="t6" style={{ color: 'var(--text-color)', opacity: 0.8 }}>
                                    본인 인증을 위해 아래 버튼을 눌러 관리자에게<br />
                                    <span className="text-[#3182F6] font-bold">"등록 신청했습니다"</span>라고 DM을 보내주세요.
                                </Paragraph>
                            </div>

                            <div className="w-full space-y-3">
                                <Button
                                    color="dark"
                                    size="large"
                                    display="block"
                                    onClick={() => {
                                        triggerHaptic("tickMedium");
                                        window.open('https://www.instagram.com/influer_map', '_blank');
                                    }}
                                    style={{ borderRadius: '24px' }}
                                >
                                    <Instagram size={20} className="mr-2 inline" />
                                    관리자에게 DM 보내기
                                </Button>
                                <Button size="large" color="light" display="block" onClick={handleClose} style={{ borderRadius: '24px', border: '1px solid #E5E8EB' }}>
                                    나중에 하기
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </BottomSheet >
    );
};
