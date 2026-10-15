import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'default' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'default',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="zcm-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`zcm-modal ${size === 'lg' ? 'zcm-modal--lg' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="zcm-modal__header">
          <h3>{title}</h3>
          <button
            onClick={onClose}
            className="zcm-modal-close-btn"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>
        <div className="zcm-modal__body">{children}</div>
        {footer && <div className="zcm-modal__footer">{footer}</div>}
      </div>
    </div>
  );
};
