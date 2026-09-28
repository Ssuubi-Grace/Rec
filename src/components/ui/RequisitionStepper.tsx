import React from 'react';
import { Check } from 'lucide-react';

export interface RequisitionStepDef {
  num: number;
  label: string;
  shortLabel?: string;
}

interface RequisitionStepperProps {
  steps: RequisitionStepDef[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const RequisitionStepper: React.FC<RequisitionStepperProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => (
  <div className="wizard-stepper-bar">
    <div className="flex items-center justify-between relative px-2 sm:px-4">
      <div className="wizard-stepper-track" />
      {steps.map(s => {
        const isPassed = currentStep > s.num;
        const isCurrent = currentStep === s.num;
        return (
          <button
            key={s.num}
            type="button"
            onClick={() => onStepClick?.(s.num)}
            disabled={!onStepClick}
            className={`relative z-10 flex flex-col items-center group focus:outline-none min-w-0 flex-1 px-0.5 ${
              onStepClick ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            <div
              className={`wizard-step-circle ${
                isPassed ? 'wizard-step-circle-passed' : isCurrent ? 'wizard-step-circle-current' : 'wizard-step-circle-upcoming'
              }`}
            >
              {isPassed ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : s.num}
            </div>
            <span
              className={`wizard-step-label mt-1.5 text-center leading-tight ${
                isCurrent ? 'wizard-step-label-current' : isPassed ? 'wizard-step-label-passed' : 'wizard-step-label-upcoming'
              }`}
            >
              <span className="hidden lg:inline">{s.label}</span>
              <span className="lg:hidden">{s.shortLabel || s.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

export const REQUISITION_WIZARD_STEPS: RequisitionStepDef[] = [
  { num: 1, label: 'Position', shortLabel: 'Position' },
  { num: 2, label: 'Staffing Details', shortLabel: 'Staffing' },
  { num: 3, label: 'Requirements', shortLabel: 'Reqs' },
  { num: 4, label: 'Job Advert & JD', shortLabel: 'JD' },
  { num: 5, label: 'Recruitment Plan', shortLabel: 'Plan' },
  { num: 6, label: 'Review & Submit', shortLabel: 'Review' },
];
