import React, { useState } from 'react';
import { Briefcase, GraduationCap, Phone, Mail, MapPin, BrainCircuit, Award, Save } from 'lucide-react';
import { Candidate, Requisition } from '../../types';
import { FormModal } from '../ui/FormModal';
import { RequisitionStepper } from '../ui/RequisitionStepper';
import { WizardStepSection } from '../ui/WizardStepSection';
import { WizardModalFooter } from '../ui/WizardModalFooter';

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  requisition?: Requisition;
  onClose: () => void;
  onShortlist?: (candidateId: string) => void;
  onAdvanceToInterview?: (candidateId: string) => void;
  onDecline?: (candidate: Candidate) => void;
}

const STEPS = [
  { num: 1, label: 'Profile & Contact', shortLabel: 'Profile' },
  { num: 2, label: 'Qualifications', shortLabel: 'Quals' },
  { num: 3, label: 'Assessments & Actions', shortLabel: 'Review' },
];

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  requisition,
  onClose,
  onShortlist,
  onAdvanceToInterview,
  onDecline,
}) => {
  const [step, setStep] = useState(1);

  if (!candidate) return null;

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const statusClass =
    candidate.status === 'Selected' ? 'bg-emerald-100 text-emerald-800' :
    candidate.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
    candidate.status === 'Talent Pool' ? 'bg-purple-100 text-purple-800' :
    'bg-blue-100 text-blue-800';

  return (
    <FormModal
      isOpen={!!candidate}
      onClose={handleClose}
      title={`Applicant Profile — ${candidate.name}`}
      subtitle={`${candidate.position} • ${candidate.department}${requisition ? ` • ${requisition.reqNo}` : ''}`}
      maxWidth="4xl"
      badge={
        <span className={`wizard-completion-pill !text-[10px] ${statusClass} !border-0`}>
          {candidate.status}
        </span>
      }
    >
      <RequisitionStepper steps={STEPS} currentStep={step} onStepClick={setStep} />

      <div className="wizard-info-bar">
        <span><strong>Applicant file review</strong> — navigate steps to review profile, credentials, and assessment outcomes.</span>
        <span className="text-[11px] font-semibold opacity-80">Applied: {candidate.appliedDate}</span>
      </div>

      <div className="p-4 sm:p-6 overflow-y-auto max-h-[min(52vh,520px)] text-xs">
        {step === 1 && (
          <WizardStepSection step={1} title="Personal Bio-Data & Contact" description="Core applicant identity and contact channels.">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-3">
              <div>
                <h4 className="text-base font-extrabold text-[#001b48]">{candidate.name}</h4>
                <div className="flex flex-wrap items-center gap-3 text-gray-600 text-[11px] mt-2">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" />{candidate.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" />+{candidate.countryCode} {candidate.phone}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400" />{candidate.region || 'Central Uganda'} ({candidate.county || candidate.districtOfOrigin || 'Kampala'})</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ['Age', `${candidate.age} yrs`],
                ['Gender', candidate.gender || '—'],
                ['Experience', `${candidate.yearsOfExperience} Years`],
                ['Pre-Screen Match', `${candidate.matchScore}%`],
              ].map(([label, val]) => (
                <div key={label} className="page-card p-3 text-center">
                  <span className="text-[10px] text-gray-500 uppercase block font-semibold">{label}</span>
                  <strong className={`text-sm mt-1 block ${label === 'Pre-Screen Match' ? 'text-emerald-700' : 'text-gray-800'}`}>{val}</strong>
                </div>
              ))}
            </div>
          </WizardStepSection>
        )}

        {step === 2 && (
          <WizardStepSection step={2} title="Education & Employment History" description="Academic credentials and prior roles.">
            <div className="space-y-3">
              <div className="page-card p-4">
                <h5 className="font-bold text-gray-800 flex items-center gap-1.5 mb-2">
                  <GraduationCap className="w-4 h-4 text-[#005cb9]" />
                  Education & Credentials
                </h5>
                <p className="text-gray-700">{candidate.educationLevel}</p>
                <p className="text-[11px] text-gray-500 mt-1">National ID: <strong className="font-mono">{candidate.nationalId || 'CM90023412X98A'}</strong></p>
              </div>
              <div className="page-card p-4">
                <h5 className="font-bold text-gray-800 flex items-center gap-1.5 mb-2">
                  <Briefcase className="w-4 h-4 text-[#005cb9]" />
                  Employment History & Past Roles
                </h5>
                <p className="text-gray-700 leading-relaxed">{candidate.employmentHistory}</p>
              </div>
            </div>
          </WizardStepSection>
        )}

        {step === 3 && (
          <WizardStepSection step={3} title="Assessments, Interviews & Actions" description="Review scores and take workflow actions.">
            <div className="space-y-3">
              <div className="page-card p-4 flex items-center justify-between">
                <span className="text-[10px] text-gray-500 uppercase font-semibold flex items-center gap-1"><BrainCircuit className="w-3.5 h-3.5" /> Psychometric</span>
                <strong className={`text-sm ${candidate.testScore && candidate.testScore >= 70 ? 'text-emerald-700' : candidate.testScore ? 'text-rose-700' : 'text-gray-500'}`}>
                  {candidate.testScore ? `${candidate.testScore}% (${candidate.testStatus})` : candidate.testStatus || 'Not Sent'}
                </strong>
              </div>
              {candidate.testScore && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <h5 className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                    <BrainCircuit className="w-4 h-4 text-emerald-600" />
                    Psychometric Assessment Scorecard
                  </h5>
                  <p className="text-emerald-800 text-[11px]">
                    Achieved <strong>{candidate.testScore}%</strong> on standardized screening battery. Completed: {candidate.testCompletedAt || 'Completed'}. Status: <strong>{candidate.testStatus}</strong>.
                  </p>
                </div>
              )}
              {candidate.interviewScore && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <h5 className="font-bold text-blue-900 flex items-center gap-1.5 mb-1">
                    <Award className="w-4 h-4 text-blue-600" />
                    Interview Board Evaluation
                  </h5>
                  <p className="text-blue-800 text-[11px]">
                    Board Score: <strong>{candidate.interviewScore}%</strong>. Recommendation: <strong>{candidate.interviewRecommendation || 'Recommended'}</strong>.
                  </p>
                  {candidate.panelRemarks && (
                    <p className="text-gray-600 text-[11px] italic mt-2 bg-white p-2 rounded-xl border border-blue-100">
                      &quot;{candidate.panelRemarks}&quot;
                    </p>
                  )}
                </div>
              )}
              {candidate.status === 'Rejected' && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
                  <h5 className="font-bold text-rose-900 mb-1">Decline Notice Record</h5>
                  <p className="text-rose-800 text-[11px]">Reason: {candidate.declineReason || 'General recruitment decision'}</p>
                </div>
              )}
            </div>
          </WizardStepSection>
        )}
      </div>

      <WizardModalFooter
        onClose={handleClose}
        showBack={step > 1}
        onBack={() => setStep(s => s - 1)}
        showNext={step < 3}
        onNext={() => setStep(s => s + 1)}
        nextLabel={step < 3 ? 'Continue' : 'Done'}
        actions={
          step === 3 ? (
            <>
              {onDecline && candidate.status !== 'Rejected' && (
                <button type="button" onClick={() => { handleClose(); onDecline(candidate); }} className="wizard-btn-danger">
                  Decline Applicant
                </button>
              )}
              {onShortlist && candidate.status === 'Applied' && (
                <button type="button" onClick={() => { onShortlist(candidate.id); handleClose(); }} className="wizard-btn-primary">
                  <Save className="w-4 h-4" /> Shortlist
                </button>
              )}
              {onAdvanceToInterview && candidate.status !== 'Rejected' && candidate.status !== 'Selected' && (
                <button type="button" onClick={() => { onAdvanceToInterview(candidate.id); handleClose(); }} className="wizard-btn-primary">
                  Advance to Interview
                </button>
              )}
            </>
          ) : undefined
        }
      />
    </FormModal>
  );
};
