import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, CheckCircle2 } from 'lucide-react';
import { REGION_DATA, PROVINCE_DISPLAY_NAMES } from '../../../data/constants/regions';
import { Button, Paragraph } from '@toss/tds-mobile';
import { generateHapticFeedback } from '@apps-in-toss/web-framework';

const triggerHaptic = (type: "tickWeak" | "tap" | "tickMedium" | "success" = "tickWeak") => {
    if (typeof generateHapticFeedback === 'function') {
        generateHapticFeedback({ type }).catch(() => { });
    }
};

interface StatusViewProps {
    regInfo: any;
    step: number;
    handleClose: () => void;
}

export const StatusView: React.FC<StatusViewProps> = ({ regInfo, step, handleClose }) => {
    return (
        <div className="flex flex-col justify-start pt-8 overflow-hidden h-fit min-h-[60vh] pb-20 px-6">
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
            ) : step === 3 && (
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
    );
};
