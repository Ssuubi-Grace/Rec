import React from 'react';

interface WizardStepSectionProps {
  step: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const WizardStepSection: React.FC<WizardStepSectionProps> = ({
  step,
  title,
  description,
  children,
  actions,
}) => (
  <div className="wizard-step-section space-y-4">
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
      <div className="min-w-0">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2.5 flex-wrap">
          <span className="wizard-step-badge">{step}</span>
          <span>{title}</span>
        </h3>
        {description && <p className="text-xs text-slate-500 mt-1.5 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
    {children}
  </div>
);
