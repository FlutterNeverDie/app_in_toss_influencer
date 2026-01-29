import { create } from 'zustand';

interface OverlayState {
    isOpen: boolean;
    type: 'alert' | 'confirm';
    title: string;
    description?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface OverlayActions {
    showAlert: (title: string, description?: React.ReactNode, confirmText?: string) => Promise<void>;
    showConfirm: (title: string, description?: React.ReactNode, confirmText?: string, cancelText?: string) => Promise<boolean>;
    closeOverlay: () => void;
}

export const useOverlayStore = create<OverlayState & OverlayActions>((set) => ({
    isOpen: false,
    type: 'alert',
    title: '',
    description: null,
    confirmText: '확인',
    cancelText: '취소',
    onConfirm: undefined,
    onCancel: undefined,

    showAlert: (title, description, confirmText = '확인') => {
        return new Promise<void>((resolve) => {
            set({
                isOpen: true,
                type: 'alert',
                title,
                description,
                confirmText,
                onConfirm: () => {
                    set({ isOpen: false });
                    resolve();
                },
                onCancel: undefined, // Alert has no cancel
            });
        });
    },

    showConfirm: (title, description, confirmText = '확인', cancelText = '취소') => {
        return new Promise<boolean>((resolve) => {
            set({
                isOpen: true,
                type: 'confirm',
                title,
                description,
                confirmText,
                cancelText,
                onConfirm: () => {
                    set({ isOpen: false });
                    resolve(true);
                },
                onCancel: () => {
                    set({ isOpen: false });
                    resolve(false);
                },
            });
        });
    },

    closeOverlay: () => set({ isOpen: false }),
}));
