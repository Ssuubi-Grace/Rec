import React, { useState } from 'react';
import { CheckSquare, Mail, Plus, Save, Send, Trash2 } from 'lucide-react';
import { Candidate, Requisition } from '../../types';
import { FormModal } from '../ui/FormModal';
import { RequisitionStepper } from '../ui/RequisitionStepper';
import { SearchableSelect } from '../ui/SearchableSelect';
import { WizardModalFooter } from '../ui/WizardModalFooter';

export interface ShortlistRow {
  candidateId: string;
  interviewDate: string;
  interviewTime: string;
  venue: string;
  inviteChecked: boolean;
}

const STEPS = [
  { num: 1, label: 'Select Candidates', shortLabel: 'Candidates' },
  { num: 2, label: 'Interview Schedule', shortLabel: 'Schedule' },
  { num: 3, label: 'Review & Invite', shortLabel: 'Review' },
];

interface EditShortlistScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeReq: Requisition;
  candidates: Candidate[];
  shortlistRows: ShortlistRow[];
  allChecked: boolean;
  onToggleInviteAll: () => void;
  onAddCandidateRow: () => void;
  onRemoveRow: (index: number) => void;
  onUpdateRow: (index: number, updates: Partial<ShortlistRow>) => void;
  onSaveDraft: () => void;
  onInitiateSendInvitations: () => void;
}

export const EditShortlistScheduleModal: React.FC<EditShortlistScheduleModalProps> = ({
  isOpen,
  onClose,
  activeReq,
  candidates,
  shortlistRows,
  allChecked,
  onToggleInviteAll,
  onAddCandidateRow,
  onRemoveRow,
  onUpdateRow,
  onSaveDraft,
  onInitiateSendInvitations,
}) => {
  const [step, setStep] = useState(1);

  const candidateOptions = candidates.map(c => ({
    value: c.id,
    label: `${c.name} (${c.position})`,
    searchText: `${c.name} ${c.position} ${c.email}`,
  }));

  const invitedCount = shortlistRows.filter(r => r.inviteChecked).length;

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Short List & Schedule"
      subtitle={`${activeReq.reqNo} — ${activeReq.position}`}
      maxWidth="4xl"
    >
      <RequisitionStepper steps={STEPS} currentStep={step} onStepClick={setStep} />

      <div className="p-4 sm:p-6 space-y-4 text-xs max-h-[60vh] overflow-y-auto">
        {step === 1 && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-800">Shortlisted Candidates</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Select applicants confirmed for this requisition.</p>
              </div>
              <button type="button" onClick={onAddCandidateRow} className="btn btn-secondary">
                <Plus className="w-3.5 h-3.5" />
                Add Candidate
              </button>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-2 px-2 w-8 text-center">#</th>
                    <th className="py-2 px-3 min-w-[200px]">Applicant</th>
                    <th className="py-2 px-2 text-center w-16">Gender</th>
                    <th className="py-2 px-3 min-w-[120px]">Mobile</th>
                    <th className="py-2 px-3 min-w-[160px]">Email</th>
                    <th className="py-2 px-2 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shortlistRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No candidates in shortlist. Click &quot;Add Candidate&quot; to begin.
                      </td>
                    </tr>
                  ) : (
                    shortlistRows.map((row, idx) => {
                      const cand = candidates.find(c => c.id === row.candidateId);
                      return (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="py-2 px-2 text-center text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-3">
                            <SearchableSelect
                              value={row.candidateId}
                              onChange={v => onUpdateRow(idx, { candidateId: v })}
                              options={candidateOptions}
                              searchPlaceholder="Search candidate name, position…"
                            />
                          </td>
                          <td className="py-2 px-2 text-center text-slate-700">{cand?.gender || '—'}</td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                            {cand ? `+${cand.countryCode} ${cand.phone}` : '—'}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">{cand?.email || '—'}</td>
                          <td className="py-2 px-2 text-center">
                            <button type="button" onClick={() => onRemoveRow(idx)} className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-800">Interview Schedule & Invitations</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Assign dates, times, and mark candidates to invite.</p>
              </div>
              <button type="button" onClick={onToggleInviteAll} className={`btn ${allChecked ? 'btn-secondary' : 'btn-primary'}`}>
                <CheckSquare className="w-3.5 h-3.5" />
                {allChecked ? 'Uncheck All' : 'Invite All Candidates'}
              </button>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-2 px-3">Applicant</th>
                    <th className="py-2 px-3 min-w-[130px]">Date</th>
                    <th className="py-2 px-3 min-w-[110px]">Time</th>
                    <th className="py-2 px-3 min-w-[180px]">Venue</th>
                    <th className="py-2 px-3 text-center">Invite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shortlistRows.map((row, idx) => {
                    const cand = candidates.find(c => c.id === row.candidateId);
                    return (
                      <tr key={idx} className={row.inviteChecked ? 'bg-blue-50/30' : ''}>
                        <td className="py-2 px-3 font-bold text-[#0f4c81]">{cand?.name || '—'}</td>
                        <td className="py-2 px-3">
                          <input
                            type="date"
                            value={row.interviewDate}
                            onChange={e => onUpdateRow(idx, { interviewDate: e.target.value })}
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.interviewTime}
                            placeholder="09:30 AM"
                            onChange={e => onUpdateRow(idx, { interviewTime: e.target.value })}
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.venue}
                            onChange={e => onUpdateRow(idx, { venue: e.target.value })}
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <label className="inline-flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={row.inviteChecked}
                              onChange={e => onUpdateRow(idx, { inviteChecked: e.target.checked })}
                              className="rounded text-[#0284c7]"
                            />
                            <span className="text-[11px] text-slate-600">Email & Portal</span>
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#0284c7]" />
              Invited candidates receive digital notice via email and Candidate Portal.
            </p>
          </>
        )}

        {step === 3 && (
          <>
            <h3 className="font-bold text-sm text-slate-800">Review & Confirm</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="page-card p-4">
                <p className="text-[10px] uppercase font-bold text-slate-400">Shortlisted</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{shortlistRows.length}</p>
              </div>
              <div className="page-card p-4">
                <p className="text-[10px] uppercase font-bold text-slate-400">To Invite</p>
                <p className="text-2xl font-black text-emerald-700 mt-1">{invitedCount}</p>
              </div>
              <div className="page-card p-4">
                <p className="text-[10px] uppercase font-bold text-slate-400">Position</p>
                <p className="text-sm font-bold text-slate-800 mt-1 truncate">{activeReq.position}</p>
              </div>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold">
                    <th className="py-2 px-3">Candidate</th>
                    <th className="py-2 px-3">Schedule</th>
                    <th className="py-2 px-3 text-center">Invite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shortlistRows.map((row, idx) => {
                    const cand = candidates.find(c => c.id === row.candidateId);
                    return (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-semibold text-slate-800">{cand?.name}</td>
                        <td className="py-2 px-3 text-slate-600">{row.interviewDate} · {row.interviewTime}</td>
                        <td className="py-2 px-3 text-center">
                          {row.inviteChecked ? (
                            <span className="text-emerald-700 font-bold">Yes</span>
                          ) : (
                            <span className="text-slate-400">No</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <WizardModalFooter
        onClose={handleClose}
        closeLabel="Cancel"
        showBack={step > 1}
        onBack={() => setStep(s => s - 1)}
        showNext={step < 3}
        onNext={() => setStep(s => s + 1)}
        nextLabel="Continue"
        actions={
          step === 3 ? (
            <>
              <button type="button" onClick={onSaveDraft} className="wizard-btn-secondary">
                <Save className="w-4 h-4" /> Save Draft
              </button>
              <button type="button" onClick={onInitiateSendInvitations} className="wizard-btn-primary">
                <Send className="w-4 h-4" /> Invite ({invitedCount})
              </button>
            </>
          ) : undefined
        }
      />
    </FormModal>
  );
};
