import React, { useState, useEffect } from 'react';
import { X, Instagram, MapPin, CheckCircle2, Camera, Image as ImageIcon } from 'lucide-react';
import { REGION_DATA, PROVINCE_DISPLAY_NAMES } from '../../data/constants/regions';
import { InfluencerService } from '../../data/services/influencer_service';
import { generateHapticFeedback } from '@apps-in-toss/web-framework';
import { useAuthStore } from '../stores/auth_store';
import { Modal, Button, TextField, Paragraph, Top } from '@toss/tds-mobile';

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
        <Modal open={isOpen} onOpenChange={(open) => !open && handleClose}>
            <Modal.Overlay onClick={handleClose} />
            <Modal.Content>
                <div className="bg-white dark:bg-[#1C1E22] h-[90vh] rounded-t-[32px] overflow-hidden flex flex-col">
                    <Top
                        title={
                            <Top.TitleParagraph color="var(--text-color)">
                                {step === 3 ? '신청 완료' : (regInfo.status === 'pending' ? '신청 현황' : '인플루언서 등록')}
                            </Top.TitleParagraph>
                        }
                        right={
                            <Top.RightButton onClick={handleClose}>
                                <X size={24} />
                            </Top.RightButton>
                        }
                    />

                    <div className="px-6 pb-12 overflow-y-auto flex-1">
                        {regInfo.status === 'pending' && step !== 3 ? (
                            <div className="flex flex-col items-center justify-center text-center space-y-8 pt-10">
                                <div className="w-24 h-24 bg-[#3182F6]/10 rounded-full flex items-center justify-center relative">
                                    <CheckCircle2 size={48} className="text-[#3182F6]" />
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-[24px] font-bold">꼼꼼하게 검토하고 있어요!</h3>
                                    <Paragraph color="grey600" typography="t6">
                                        제출해주신 정보를 확인하고 있습니다.<br />
                                        조금만 기다려주시면 알림을 보내드릴게요.
                                    </Paragraph>
                                </div>

                                <div className="w-full bg-[#f2f4f6] dark:bg-[#1C1E22] rounded-[20px] p-5 text-left space-y-3">
                                    <div className="flex justify-between items-center text-[14px]">
                                        <span className="opacity-50">신청 지역</span>
                                        <span className="font-bold">
                                            {regInfo.province_id && PROVINCE_DISPLAY_NAMES[regInfo.province_id]}
                                            {' '}
                                            {regInfo.province_id && regInfo.district_id && REGION_DATA[regInfo.province_id]?.find((d: any) => d.id === regInfo.district_id)?.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[14px]">
                                        <span className="opacity-50">상태</span>
                                        <span className="text-[#3182F6] font-bold">검수 대기 중</span>
                                    </div>
                                </div>

                                <Button size="large" color="light" display="block" onClick={handleClose}>
                                    닫기
                                </Button>
                            </div>
                        ) : step === 1 && (
                            <div className="space-y-6 pt-4">
                                <header>
                                    <h3 className="text-[22px] font-bold mb-2 leading-tight">
                                        활동하시는 지역을<br />선택해주세요
                                    </h3>
                                    {regInfo.status === 'approved' && (
                                        <p className="text-[#00D082] text-[15px] font-bold bg-[#00D082]/10 p-3 rounded-xl">이미 활동 중인 인플루언서입니다.</p>
                                    )}
                                </header>

                                {!selectedProvince ? (
                                    <div className="grid grid-cols-2 gap-3 pb-8">
                                        {Object.entries(PROVINCE_DISPLAY_NAMES).map(([id, name]) => (
                                            <Button
                                                key={id}
                                                color="light"
                                                size="large"
                                                onClick={() => {
                                                    triggerHaptic("tickWeak");
                                                    setSelectedProvince(id);
                                                }}
                                                style={{ height: '72px', borderRadius: '20px' }}
                                            >
                                                {name}
                                            </Button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin size={16} className="text-[#3182F6]" />
                                            <span className="text-[15px] font-bold text-[#3182F6]">{PROVINCE_DISPLAY_NAMES[selectedProvince]}</span>
                                            <button
                                                onClick={() => setSelectedProvince(null)}
                                                className="text-[13px] opacity-50 underline"
                                            >
                                                변경
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 pb-8">
                                            {REGION_DATA[selectedProvince]?.map((district: any) => (
                                                <Button
                                                    key={district.id}
                                                    color="light"
                                                    size="large"
                                                    onClick={() => {
                                                        triggerHaptic("tap");
                                                        setSelectedDistrict(district.id);
                                                        setStep(2);
                                                    }}
                                                    style={{ height: '72px', borderRadius: '20px' }}
                                                >
                                                    {district.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 pt-4">
                                <header>
                                    <h3 className="text-[22px] font-bold mb-2 leading-tight">
                                        인스타그램 정보를<br />입력해주세요
                                    </h3>
                                    <div className="flex items-center gap-2 bg-[#f2f4f6] dark:bg-[#1C1E22] px-3 py-1.5 rounded-full w-fit">
                                        <MapPin size={14} className="text-[#3182F6]" />
                                        <span className="text-[13px] font-bold">
                                            {selectedProvince && PROVINCE_DISPLAY_NAMES[selectedProvince]} {selectedProvince && selectedDistrict && REGION_DATA[selectedProvince]?.find((d: any) => d.id === selectedDistrict)?.name}
                                        </span>
                                    </div>
                                </header>

                                <div className="space-y-6">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-full bg-[#f2f4f6] dark:bg-[#1C1E22] flex items-center justify-center overflow-hidden">
                                                {imagePreview ? (
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Camera className="opacity-40" size={32} />
                                                )}
                                            </div>
                                            <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#3182F6] rounded-full flex items-center justify-center text-white cursor-pointer shadow-md">
                                                <ImageIcon size={16} />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                            </label>
                                        </div>
                                        <span className="text-[13px] opacity-50">본인 확인이 가능한 사진을 올려주세요</span>
                                    </div>

                                    <div className="space-y-4">
                                        <TextField
                                            variant="box"
                                            label="인스타그램 아이디"
                                            value={instagramId}
                                            onChange={(e) => setInstagramId(e.target.value)}
                                            placeholder="@아이디 입력"
                                            maxLength={30}
                                        />
                                    </div>

                                    <div className="bg-[#3182F6]/5 p-5 rounded-[24px] border border-[#3182F6]/10">
                                        <h4 className="text-[15px] font-bold text-[#3182F6] mb-2">등록 전 안내사항</h4>
                                        <ul className="text-[13px] opacity-70 space-y-2 leading-relaxed">
                                            <li>• 신청 후 관리자가 내용 검토를 진행합니다.</li>
                                            <li>• 본인 확인을 위해 관리자 인스타 팔로우 및 DM을 보내셔야 최종 등록됩니다.</li>
                                            <li>• 부적절한 계정은 예고 없이 반려될 수 있습니다.</li>
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
                                >
                                    {regInfo.status === 'pending' ? '검수 대기 중' : '등록 신청하기'}
                                </Button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 pt-10">
                                <div className="w-24 h-24 bg-[#3182F6]/10 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 size={56} className="text-[#3182F6]" />
                                </div>
                                <div>
                                    <h3 className="text-[24px] font-bold mb-3">신청이 완료되었어요!</h3>
                                    <Paragraph color="grey600" typography="t6">
                                        마지막 단계로 아래 버튼을 눌러<br />
                                        관리자에게 <span className="text-[#3182F6] font-bold">"등록 신청했습니다"</span>라고<br />
                                        DM을 보내주시면 가장 빠르게 승인됩니다.
                                    </Paragraph>
                                </div>

                                <div className="w-full pt-8 space-y-3">
                                    <Button
                                        color="dark"
                                        size="large"
                                        display="block"
                                        onClick={() => {
                                            triggerHaptic("tickMedium");
                                            window.open('https://www.instagram.com/influer_map', '_blank');
                                        }}
                                    >
                                        <Instagram size={20} className="mr-2 inline" />
                                        관리자에게 DM 보내기
                                    </Button>
                                    <Button color="light" size="large" display="block" onClick={handleClose}>
                                        나중에 하기
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal.Content>
        </Modal>
    );
};
