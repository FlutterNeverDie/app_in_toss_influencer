import React from 'react';
import { MapPin, Camera, Image as ImageIcon } from 'lucide-react';
import { REGION_DATA, PROVINCE_DISPLAY_NAMES } from '../../../data/constants/regions';
import { BottomSheet, Button, TextField } from '@toss/tds-mobile';
import { generateHapticFeedback } from '@apps-in-toss/web-framework';

const triggerHaptic = (type: "tickWeak" | "tap" | "tickMedium" | "success" = "tickWeak") => {
    if (typeof generateHapticFeedback === 'function') {
        generateHapticFeedback({ type }).catch(() => { });
    }
};

interface RegistrationFormProps {
    step: 1 | 2;
    setStep: (step: 1 | 2 | 3) => void;
    regInfo: any;
    selectedProvince: string | null;
    setSelectedProvince: (val: string | null) => void;
    selectedDistrict: string | null;
    setSelectedDistrict: (val: string | null) => void;
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    imagePreview: string | null;
    instagramId: string;
    setInstagramId: (val: string) => void;
    errorMessage: string | null;
    isSubmitting: boolean;
    handleSubmit: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
    step, setStep, regInfo, selectedProvince, setSelectedProvince,
    selectedDistrict, setSelectedDistrict, handleImageChange, imagePreview,
    instagramId, setInstagramId, errorMessage, isSubmitting, handleSubmit
}) => {
    return (
        <>
            <BottomSheet.Header>
                <span style={{ color: 'var(--text-color)' }}></span>
            </BottomSheet.Header>
            <div className="px-6 flex-1 overflow-y-auto scrollbar-hide pb-32 overscroll-contain">
                {step === 1 ? (
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
                                <div className="h-12" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6 pt-2">
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

                        <div className="space-y-6">
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full bg-[#f2f4f6] dark:bg-[#2C2E33] flex items-center justify-center overflow-hidden border border-[#E5E8EB] dark:border-[#3A3D43]">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera className="opacity-40 text-[#8B95A1] dark:text-[#FFFFFF]" size={36} />
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#3182F6] rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg border-2 border-white dark:border-[#1C1E22]">
                                        <ImageIcon size={16} />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                </div>
                                <span className="text-[12px] text-[#8B95A1]">본인 확인이 가능한 프로필 사진</span>
                            </div>

                            <div className="space-y-4 registration-input-wrapper">
                                <TextField
                                    variant="box"
                                    label="인스타그램 아이디"
                                    value={instagramId}
                                    /* @ts-ignore: TDS TextField supports left/right slots */
                                    left={<span className="text-[#8B95A1] dark:text-[#FFFFFF] ml-3 text-[16px] font-medium">@</span>}
                                    onChange={(e) => {
                                        const val = e.target.value.replace('@', '').trim();
                                        setInstagramId(val);
                                    }}
                                    placeholder="아이디 입력"
                                    maxLength={30}
                                    className="tds-search-input registration-id-input scale-[1.02] transition-all focus-within:ring-2 focus-within:ring-[#3182F6]/20"
                                />
                            </div>
                            <div className="bg-[#3182F6]/5 p-4 rounded-[20px] border border-[#3182F6]/10">
                                <h4 className="text-[14px] font-bold text-[#3182F6] mb-1.5">등록 전 안내사항</h4>
                                <ul className="text-[12px] opacity-70 space-y-1 leading-relaxed" style={{ color: 'var(--text-color)' }}>
                                    <li>• 신청 후 관리자가 내용 검토를 진행합니다.</li>
                                    <li>• 본인 확인을 위해 팔로우 및 DM 발송이 필요합니다.</li>
                                    <li>• 부적합한 계정은 신청이 거절될 수 있습니다.</li>
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
                            disabled={!instagramId || !imagePreview || isSubmitting || regInfo.status === 'pending'}
                            onClick={handleSubmit}
                            loading={isSubmitting}
                            style={{ borderRadius: '24px' }}
                        >
                            {regInfo.status === 'pending' ? '검수 대기 중' : '등록 신청하기'}
                        </Button>
                        <div className="h-12" />
                    </div>
                )}
            </div>
        </>
    );
};
