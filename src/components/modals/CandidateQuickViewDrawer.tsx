import React from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Calendar, 
  Award, 
  Briefcase, 
  ExternalLink,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Candidate } from '../../types';

interface CandidateQuickViewDrawerProps {
  candidate: Candidate | null;
  onClose: () => void;
  onAdvanceStage: (candidate: Candidate, nextStage: Candidate['status']) => void;
  onScheduleInterview?: (candidate: Candidate) => void;
  onOpenOffer?: (candidate: Candidate) => void;
  onTransferToTalentPool?: (candidate: Candidate) => void;
}

export const CandidateQuickViewDrawer: React.FC<CandidateQuickViewDrawerProps> = ({
  candidate,
  onClose,
  onAdvanceStage,
  onScheduleInterview,
  onOpenOffer,
  onTransferToTalentPool
}) => {
  if (!candidate) return null;

  const stageList: Candidate['status'][] = [
    'Applied',
    'Pre-Shortlisted',
    'Interview Scheduled',
    'Selected',
    'Offer Issued',
    'Hired'
  ];

  const currentStageIndex = stageList.findIndex(s => s === candidate.status);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end transition-opacity"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-base border border-blue-200 shadow-2xs">
              {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{candidate.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  candidate.matchScore >= 85 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  candidate.matchScore >= 70 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {candidate.matchScore}% Match
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {candidate.position} • {candidate.department}
              </p>
              <div className="flex items-center gap-3 text-slate-400 text-xs mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{candidate.fieldRegion || 'Kampala, Uganda'}</span>
                </span>
                <span>•</span>
                <span>Applied {candidate.appliedDate}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stage Progress Ribbon */}
        <div className="px-5 py-3 bg-white border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {stageList.map((stg, idx) => {
              const isPassed = currentStageIndex > idx;
              const isCurrent = candidate.status === stg;
              return (
                <div key={stg} className="flex items-center gap-1 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isCurrent ? 'bg-blue-600 text-white' :
                    isPassed ? 'bg-emerald-100 text-emerald-800' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {stg}
                  </span>
                  {idx < stageList.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Quick Metrics & Contact */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Experience</span>
              <strong className="text-slate-900 text-sm">{candidate.yearsOfExperience} Years</strong>
              <span className="text-[10px] text-slate-500 block truncate">{candidate.employmentHistory || 'Software Lead'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Education</span>
              <strong className="text-slate-900 text-sm">{candidate.educationLevel}</strong>
              <span className="text-[10px] text-slate-500 block truncate">{candidate.fieldOfStudy || 'Computer Science'}</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">{candidate.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">{candidate.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">National ID / Ref: {candidate.nationalId || 'CM92019482012K'}</span>
            </div>
          </div>

          {/* Transparent Role Requirement Match (Section 31 of blueprint) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Documented Criteria Match
              </h4>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                5 of 6 Requirements Met
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-700">Degree Qualification ({candidate.educationLevel})</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Meets
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-700">Minimum Experience (4+ Years Required)</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> {candidate.yearsOfExperience} Years
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-700">Python & API Architecture</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-700">SQL & Database Systems</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-700">Systems Analysis Competency</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-700">Professional AWS / PMP Certification</span>
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> In Review
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-200">
              <strong className="text-slate-700">Auditable Summary:</strong> Candidate demonstrates strong technical depth across full-stack systems and aligns with vacancy establishment prerequisites.
            </div>
          </div>

          {/* Candidate Submitted Documents (Section 32 of blueprint) */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Submitted Documents
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs shadow-2xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-semibold text-slate-800">{candidate.name.replace(' ', '_')}_CV.pdf</div>
                    <div className="text-[10px] text-slate-400">Curriculum Vitae • 1.8 MB</div>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => alert(`Opening in-system PDF preview for ${candidate.name}'s CV...`)}
                  className="text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer text-xs"
                >
                  <span>Preview</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs shadow-2xs">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-semibold text-slate-800">Academic_Transcript.pdf</div>
                    <div className="text-[10px] text-slate-400">Certified Transcript • 3.2 MB</div>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => alert(`Opening in-system PDF preview for Academic Transcript...`)}
                  className="text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer text-xs"
                >
                  <span>Preview</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Activity Timeline (Section 33 of blueprint) */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Recruitment Activity Log
            </h4>
            <div className="space-y-2 text-xs border-l-2 border-slate-200 pl-3 ml-2">
              <div className="relative">
                <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                <div className="font-bold text-slate-900">Current Stage: {candidate.status}</div>
                <div className="text-[10px] text-slate-400">Today at 10:42 • Updated by Grace Ssuubi (HR Lead)</div>
              </div>
              {candidate.interviewScore && (
                <div className="relative">
                  <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-purple-600 ring-4 ring-white" />
                  <div className="font-bold text-slate-900">Interview Evaluation Completed: {candidate.interviewScore}%</div>
                  <div className="text-[10px] text-slate-400">Panel recommendation: {candidate.interviewRecommendation || 'Recommended'}</div>
                </div>
              )}
              {candidate.testScore && (
                <div className="relative">
                  <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                  <div className="font-bold text-slate-900">Psychometric Assessment: {candidate.testScore}% (Passed)</div>
                  <div className="text-[10px] text-slate-400">Verified by automated testing suite</div>
                </div>
              )}
              <div className="relative">
                <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400 ring-4 ring-white" />
                <div className="font-bold text-slate-700">Application Submitted via Career Portal</div>
                <div className="text-[10px] text-slate-400">{candidate.appliedDate} • Acknowledgement sent</div>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {onTransferToTalentPool && (
              <button
                type="button"
                onClick={() => onTransferToTalentPool(candidate)}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
              >
                Save to Talent Pool
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {candidate.status === 'Applied' && (
              <button
                type="button"
                onClick={() => onAdvanceStage(candidate, 'Pre-Shortlisted')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Pass to Shortlist →
              </button>
            )}
            {candidate.status === 'Pre-Shortlisted' && onScheduleInterview && (
              <button
                type="button"
                onClick={() => onScheduleInterview(candidate)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Schedule Interview →
              </button>
            )}
            {(candidate.status === 'Selected' || candidate.status === 'Interview Scheduled') && onOpenOffer && (
              <button
                type="button"
                onClick={() => onOpenOffer(candidate)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Prepare Offer Letter →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
