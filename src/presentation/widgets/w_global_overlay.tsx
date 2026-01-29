import { useOverlayStore } from '../stores/overlay_store';
import { Dialog } from '../components/c_dialog';

export const GlobalOverlay = () => {
    const { isOpen, type, title, description, confirmText, cancelText, onConfirm, onCancel } = useOverlayStore();

    return (
        <Dialog
            isOpen={isOpen}
            type={type}
            title={title}
            description={description}
            confirmText={confirmText}
            cancelText={cancelText}
            onConfirm={onConfirm}
            onCancel={onCancel}
        />
    );
};
