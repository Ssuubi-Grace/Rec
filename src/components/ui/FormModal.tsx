import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  badge?: React.ReactNode;
}

const maxWidths = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
};

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '4xl',
  badge,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="requisition-modal-overlay" onClick={onClose}>
      <div
        className={`requisition-modal-panel ${maxWidths[maxWidth]} w-full`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="requisition-modal-header">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-white tracking-tight truncate">{title}</h2>
            {subtitle && <p className="text-xs text-blue-100/90 mt-0.5 truncate">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {badge}
            <button type="button" onClick={onClose} className="requisition-modal-close" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="requisition-modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
};
