import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DialogProps {
    isOpen: boolean;
    title: string;
    description?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    type?: 'alert' | 'confirm';
}

export const Dialog: React.FC<DialogProps> = ({
    isOpen,
    title,
    description,
    confirmText = '확인',
    cancelText = '취소',
    onConfirm,
    onCancel,
    type = 'alert',
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Dimmed Background */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-[2px]"
                        onClick={type === 'confirm' ? onCancel : onConfirm}
                    />

                    {/* Dialog Content */}
                    <div className="fixed inset-0 z-[201] flex items-center justify-center pointer-events-none px-6">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ type: "spring", damping: 25, stiffness: 350 }}
                            className="w-full max-w-[320px] bg-[var(--bg-color)] rounded-[24px] overflow-hidden shadow-2xl pointer-events-auto"
                        >
                            <div className="p-6 pb-5 text-center">
                                <h3 className="text-[18px] font-bold text-[var(--text-color)] mb-2 whitespace-pre-wrap leading-tight">
                                    {title}
                                </h3>
                                {description && (
                                    <div className="text-[14px] text-[var(--text-color)] opacity-60 whitespace-pre-wrap leading-relaxed">
                                        {description}
                                    </div>
                                )}
                            </div>

                            <div className="flex border-t border-[var(--glass-border)]">
                                {type === 'confirm' && (
                                    <button
                                        onClick={onCancel}
                                        className="flex-1 py-4 text-[16px] font-bold text-[#FF3B30] active:bg-black/5 dark:active:bg-white/5 transition-colors"
                                    >
                                        {cancelText}
                                    </button>
                                )}
                                {type === 'confirm' && <div className="w-[1px] bg-[var(--glass-border)]" />}
                                <button
                                    onClick={onConfirm}
                                    className={`flex-1 py-4 text-[16px] font-bold text-[#3182F6] active:bg-black/5 dark:active:bg-white/5 transition-colors ${type === 'alert' ? 'w-full' : ''}`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
