import React, { useState, useEffect } from 'react';
import { StatusView } from './registration/w_registration_status_view';
import { RegistrationForm } from './registration/w_registration_form';
import { useAuthStore } from '../stores/auth_store';
import { InfluencerService } from '../../data/services/influencer_service';
import { BottomSheet } from '@toss/tds-mobile';
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

    const isStatusView = regInfo.status === 'pending' || step === 3;

    return (
        <BottomSheet open={isOpen} onClose={handleClose}>
            <div className={`bg-white dark:bg-[#1C1E22] ${regInfo.status === 'pending' || step === 3 ? 'min-h-[50vh] pb-10' : 'h-[85vh]'} rounded-t-[32px] flex flex-col transition-all duration-300`}>
                {isStatusView ? (
                    <StatusView
                        regInfo={regInfo}
                        step={step}
                        handleClose={handleClose}
                    />
                ) : (
                    <RegistrationForm
                        step={step}
                        setStep={setStep}
                        regInfo={regInfo}
                        selectedProvince={selectedProvince}
                        setSelectedProvince={setSelectedProvince}
                        selectedDistrict={selectedDistrict}
                        setSelectedDistrict={setSelectedDistrict}
                        handleImageChange={handleImageChange}
                        imagePreview={imagePreview}
                        instagramId={instagramId}
                        setInstagramId={setInstagramId}
                        errorMessage={errorMessage}
                        isSubmitting={isSubmitting}
                        handleSubmit={handleSubmit}
                    />
                )}
            </div>
        </BottomSheet>
    );
};
