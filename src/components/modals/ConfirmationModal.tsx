import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Info, 
  Send, 
  ShieldCheck, 
  X 
} from 'lucide-react';

export type ConfirmationVariant = 'primary' | 'success' | 'danger' | 'warning';

export interface SummaryItem {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  variant?: ConfirmationVariant;
  icon?: React.ReactNode;
  summaryItems?: SummaryItem[];
  warningMessage?: string | React.ReactNode;
  notesLabel?: string;
  notesValue?: string;
  onNotesChange?: (val: string) => void;
  notesPlaceholder?: string;
  confirmText?: string;
  confirmIcon?: React.ReactNode;
  cancelText?: string;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  subtitle,
  variant = 'primary',
  icon,
  summaryItems,
  warningMessage,
  notesLabel,
  notesValue,
  onNotesChange,
  notesPlaceholder,
  confirmText = 'Confirm & Submit',
  confirmIcon,
  cancelText = 'Cancel',
  isSubmitting = false,
  onConfirm,
  onClose,
  children,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          headerBg: 'bg-emerald-50/70 border-emerald-100',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
          badgeBg: 'bg-emerald-100 text-emerald-800'
        };
      case 'danger':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
          headerBg: 'bg-rose-50/70 border-rose-100',
          btnBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20',
          badgeBg: 'bg-rose-100 text-rose-800'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
          headerBg: 'bg-amber-50/70 border-amber-100',
          btnBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20',
          badgeBg: 'bg-amber-100 text-amber-800'
        };
      case 'primary':
      default:
        return {
          icon: <Send className="w-5 h-5 text-[#0284c7]" />,
          headerBg: 'bg-blue-50/70 border-blue-100',
          btnBg: 'bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-blue-600/20',
          badgeBg: 'bg-blue-100 text-blue-800'
        };
    }
  };

  const style = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-lg shadow-2xl border border-slate-300 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
      >
        {/* Modal Header */}
        <div className={`p-4 border-b ${style.headerBg} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white shadow-2xs border border-slate-200">
              {icon || style.icon}
            </div>
            <div>
              <h3 id="confirmation-modal-title" className="font-bold text-sm text-gray-900 leading-snug">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
          {children}

          {/* Structured Summary Items Table/Grid */}
          {summaryItems && summaryItems.length > 0 && (
            <div className="border border-slate-200 rounded-md bg-slate-50/60 divide-y divide-slate-200 overflow-hidden">
              {summaryItems.map((item, idx) => (
                <div key={idx} className="p-2.5 flex items-start justify-between gap-3 text-xs">
                  <span className="text-gray-500 font-medium flex items-center gap-1.5 shrink-0">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                  <span className="text-gray-800 font-semibold text-right max-w-[65%] break-words">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Optional Warning / Notice */}
          {warningMessage && (
            <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>{warningMessage}</div>
            </div>
          )}

          {/* Optional Remarks or Notes Input */}
          {notesLabel && (
            <div>
              <label className="block text-gray-700 font-bold mb-1">
                {notesLabel}
              </label>
              <textarea
                value={notesValue || ''}
                onChange={(e) => onNotesChange && onNotesChange(e.target.value)}
                placeholder={notesPlaceholder || 'Add any comments, routing instructions, or context...'}
                rows={2}
                className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs text-gray-800 focus:ring-1 focus:ring-[#0284c7] focus:outline-none resize-none"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-100 text-gray-700 rounded text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`px-4 py-1.5 rounded text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ${style.btnBg}`}
          >
            {confirmIcon || (variant === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />)}
            <span>{isSubmitting ? 'Submitting...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
