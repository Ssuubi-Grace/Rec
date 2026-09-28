import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface WizardModalFooterProps {
  onClose?: () => void;
  closeLabel?: string;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  showBack?: boolean;
  showNext?: boolean;
  leftNote?: React.ReactNode;
  actions?: React.ReactNode;
}

export const WizardModalFooter: React.FC<WizardModalFooterProps> = ({
  onClose,
  closeLabel = 'Close',
  onBack,
  onNext,
  nextLabel = 'Next',
  showBack = false,
  showNext = true,
  leftNote,
  actions,
}) => (
  <div className="wizard-modal-footer">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
      <div className="flex items-center gap-2">
        {onClose && (
          <button type="button" onClick={onClose} className="wizard-btn-secondary">
            {closeLabel}
          </button>
        )}
        {leftNote && <span className="text-[11px] text-slate-500 hidden md:inline">{leftNote}</span>}
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {showBack && onBack && (
          <button type="button" onClick={onBack} className="wizard-btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
        {actions}
        {showNext && onNext && (
          <button type="button" onClick={onNext} className="wizard-btn-primary">
            {nextLabel}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  </div>
);
