import React from 'react';
import { RichTextView } from '../ui/RichTextView';
import { 
  X, 
  FileText, 
  Building2, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  UserCheck, 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  BrainCircuit, 
  Clock, 
  Award, 
  ShieldCheck, 
  Layers, 
  HelpCircle,
  Eye,
  AlertCircle
} from 'lucide-react';
import { ApprovalTask, Requisition, OfferLetter, PsychometricTest, Candidate } from '../../types';
import { ApprovalActionType } from './ApprovalActionModal';

interface ApprovalItemDetailsModalProps {
  task: ApprovalTask;
  requisition?: Requisition | null;
  offer?: OfferLetter | null;
  test?: PsychometricTest | null;
  candidate?: Candidate | null;
  onInitiateAction: (actionType: ApprovalActionType) => void;
  onClose: () => void;
}

export const ApprovalItemDetailsModal: React.FC<ApprovalItemDetailsModalProps> = ({
  task,
  requisition,
  offer,
  test,
  candidate,
  onInitiateAction,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-[#0284c7]/10 text-[#0284c7] border border-[#0284c7]/20">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-bold rounded">
                  {task.taskType || 'Workflow Details'}
                </span>
                <span className="font-mono text-[11px] text-gray-500">
                  {task.referenceNo || task.id}
                </span>
              </div>
              <h3 className="font-bold text-sm text-gray-900 leading-tight mt-0.5">
                {task.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Submission Info Banner */}
          <div className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Initiator</span>
              <strong className="text-gray-800 block truncate">{task.submittedBy || task.initiator || 'HR Officer'}</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Department</span>
              <strong className="text-gray-800 block truncate">{task.department || 'Technology'}</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Date Submitted</span>
              <strong className="text-gray-800 block">{task.submittedDate || task.dateSubmitted || '16-Aug-2026'}</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Current Status</span>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                task.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                task.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                task.status === 'Returned' ? 'bg-amber-100 text-amber-800' :
                'bg-sky-100 text-sky-800'
              }`}>
                {task.status}
              </span>
            </div>
          </div>

          {/* Initiator Comments if any */}
          {task.comments && (
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded text-xs text-amber-900">
              <strong className="block text-[11px] uppercase tracking-wider text-amber-800 font-bold mb-0.5">
                Initiator Justification & Notes:
              </strong>
              <p>{task.comments}</p>
            </div>
          )}

          {/* Action Comments History if already acted upon */}
          {(task.rejectionReason || task.revisionNotes || task.details) && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
              <strong className="block text-[11px] uppercase tracking-wider text-gray-700 font-bold">
                Governance Audit Log / Feedback:
              </strong>
              {task.revisionNotes && (
                <p className="text-amber-800">
                  <strong>Revision Feedback:</strong> {task.revisionNotes}
                </p>
              )}
              {task.rejectionReason && (
                <p className="text-rose-800">
                  <strong>Rejection Rationale:</strong> {task.rejectionReason}
                </p>
              )}
              {task.details && (
                <p className="text-gray-600">
                  <strong>Details:</strong> {task.details}
                </p>
              )}
            </div>
          )}

          {/* SECTION 1: REQUISITION DETAILS */}
          {requisition && (
            <div className="border border-[#cbd5e1] rounded-sm p-4 space-y-4 bg-white">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h4 className="font-bold text-xs text-[#0f4c81] flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#0284c7]" />
                  <span>Job Requisition Specifications</span>
                </h4>
                <span className="text-[11px] text-gray-500">
                  Scale: <strong>{requisition.salaryScale}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Position Title</span>
                  <strong className="text-gray-900 text-xs">{requisition.position}</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Positions requested</span>
                  <strong className="text-gray-900 text-xs">{requisition.vacancies} Staff</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Monthly Budget</span>
                  <strong className="text-emerald-700 text-xs font-mono">
                    {requisition.currency || 'UGX'} {requisition.budget}
                  </strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Recruitment Type</span>
                  <span className="text-gray-800 text-xs">{requisition.type}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Reporting Supervisor</span>
                  <span className="text-gray-800 text-xs">{requisition.reportsTo}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Target Reporting Date</span>
                  <span className="text-gray-800 text-xs">{requisition.dateOfReporting}</span>
                </div>
              </div>

              {/* Pre-shortlist criteria */}
              <div className="bg-sky-50/50 border border-sky-200 rounded p-3 space-y-2">
                <span className="text-[11px] font-bold text-[#0f4c81] block">
                  Mandatory Candidate Screening Criteria:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-gray-500 block">Min Education:</span>
                    <strong>{requisition.educationLevel || 'Bachelor Degree'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Min Experience:</span>
                    <strong>{requisition.minExperience || 2} Years</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Age Bracket:</span>
                    <strong>{requisition.minAge || 22} - {requisition.maxAge || 45} Years</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Psychometric Test:</span>
                    <strong>{requisition.requirePsychometricTest ? 'Required (Mandatory)' : 'Not Required'}</strong>
                  </div>
                </div>
              </div>

              {/* Attached Document or In-System JD */}
              {requisition.jdFormat === 'attachment' || requisition.attachedJdFileName ? (
                <div className="bg-emerald-50/70 border border-emerald-300 rounded p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Attached Specification Document (Terms of Reference / JD):</span>
                    </span>
                    <span className="text-[10px] text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                      {requisition.attachedJdFileSize || '1.8 MB'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2.5 rounded border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <div>
                        <strong className="text-xs text-gray-900 block">{requisition.attachedJdFileName || 'Approved_Job_Specification.pdf'}</strong>
                        <span className="text-[10px] text-gray-500">Official Institutional Job Description</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                      ✓ Document Attached
                    </span>
                  </div>
                  {requisition.attachedJdNotes && (
                    <div className="text-[11px] text-gray-700 bg-white/80 p-2 rounded border border-emerald-100">
                      <strong className="text-emerald-900 block font-semibold mb-0.5">Author's Summary Notes:</strong>
                      {requisition.attachedJdNotes}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Role Purpose & JD */}
              {requisition.rolePurpose && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-700 block">Role Purpose & Description:</span>
                  <RichTextView html={requisition.rolePurpose} className="bg-slate-50 p-2 rounded border border-slate-200" />
                </div>
              )}

              {/* Key Responsibilities */}
              {requisition.keyResponsibilities && requisition.keyResponsibilities.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-700 block">Key Responsibilities:</span>
                  <ul className="list-disc pl-4 space-y-1 text-gray-600">
                    {requisition.keyResponsibilities.map((resp, i) => (
                      <li key={i}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: CANDIDATE OFFER LETTER DETAILS */}
          {offer && (
            <div className="border border-[#cbd5e1] rounded-sm p-4 space-y-4 bg-white">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h4 className="font-bold text-xs text-[#0f4c81] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0284c7]" />
                  <span>Employment Offer & Remuneration Terms</span>
                </h4>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {offer.contractDuration || '2 Years Renewable'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Candidate Name</span>
                  <strong className="text-gray-900 text-xs">{offer.candidateName}</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Designation</span>
                  <strong className="text-gray-900 text-xs">{offer.position}</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Gross Monthly Salary</span>
                  <strong className="text-emerald-700 text-xs font-mono">
                    {offer.grossSalaryMonthly || offer.basicSalary || 'UGX 4,800,000'}
                  </strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Probation Period</span>
                  <span className="text-gray-800 text-xs">{offer.probationMonths || 3} Months</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Official Start Date</span>
                  <span className="text-gray-800 text-xs">{offer.startDate || '01-Oct-2026'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Reporting Supervisor</span>
                  <span className="text-gray-800 text-xs">{offer.reportingSupervisor || 'Department Lead'}</span>
                </div>
              </div>

              {/* Benefits breakdown */}
              {offer.benefits && offer.benefits.length > 0 && (
                <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-gray-800 block">
                    Statutory & Contractual Benefits Included:
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-gray-600 text-[11px]">
                    {offer.benefits.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: PSYCHOMETRIC TEST BATTERY DETAILS */}
          {test && (
            <div className="border border-[#cbd5e1] rounded-sm p-4 space-y-4 bg-white">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h4 className="font-bold text-xs text-[#0f4c81] flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-purple-600" />
                  <span>Psychometric Test Calibration & Questions</span>
                </h4>
                <span className="text-[11px] text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  {test.category}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Duration</span>
                  <strong className="text-gray-900 text-xs">{test.durationMinutes} Minutes</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Passing Score</span>
                  <strong className="text-emerald-700 text-xs">{test.passingScorePct}% Pass Mark</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Questions Total</span>
                  <strong className="text-gray-900 text-xs">{test.questions?.length || 0} Questions</strong>
                </div>
              </div>

              {/* Questions preview */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-800 block">
                  Question Bank Samples ({test.questions?.length || 0}):
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {test.questions?.map((q, idx) => (
                    <div key={q.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-800">Q{idx + 1}. {q.text}</span>
                        <span className="text-[10px] bg-sky-100 text-sky-800 font-mono px-1.5 rounded">
                          {q.points} Pts ({q.section || 'tech'})
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-600 pt-1">
                        {q.options.map(opt => (
                          <div 
                            key={opt.key}
                            className={`px-2 py-0.5 rounded ${
                              opt.key === q.correctKey ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-white border border-gray-200'
                            }`}
                          >
                            {opt.key}: {opt.text} {opt.key === q.correctKey && '✓ (Correct)'}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: CANDIDATE APPLICANT DETAILS */}
          {candidate && (
            <div className="border border-[#cbd5e1] rounded-sm p-4 space-y-4 bg-white">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h4 className="font-bold text-xs text-[#0f4c81] flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Candidate Evaluation & Assessment Summary</span>
                </h4>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Match Score: {candidate.matchScore}%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Full Name</span>
                  <strong className="text-gray-900 text-xs">{candidate.name}</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Psychometric Score</span>
                  <strong className="text-purple-700 text-xs">{candidate.testScore ? `${candidate.testScore}% (Passed)` : 'N/A'}</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Interview Score</span>
                  <strong className="text-emerald-700 text-xs">{candidate.interviewScore ? `${candidate.interviewScore}%` : 'N/A'}</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 col-span-2 sm:col-span-3">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Interview Board Recommendation</span>
                  <p className="text-gray-800 text-xs font-semibold mt-0.5">
                    {candidate.interviewRecommendation || 'Recommend for Appointment'} — "{candidate.panelRemarks || 'Strong culture fit and deep domain competence.'}"
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with 3 Main Actions */}
        <div className="p-4 border-t border-gray-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded text-xs transition-colors cursor-pointer"
          >
            Close Details
          </button>

          {task.status === 'Pending' ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onInitiateAction('Reject')}
                className="px-3 py-1.5 bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 font-bold rounded text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject with Comment</span>
              </button>

              <button
                type="button"
                onClick={() => onInitiateAction('Return')}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Return for Revision</span>
              </button>

              <button
                type="button"
                onClick={() => onInitiateAction('Approve')}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Request</span>
              </button>
            </div>
          ) : (
            <span className="text-gray-500 italic text-xs">
              This item has already been marked as <strong>{task.status}</strong>.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
