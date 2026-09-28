import React, { useState } from 'react';
import { X, AlertCircle, Mail, Send, Ban, CheckCircle2 } from 'lucide-react';
import { Candidate } from '../../types';

interface DeclineCandidateModalProps {
  candidate: Candidate | null;
  onClose: () => void;
  onConfirmDecline: (candidateId: string, reason: string, message: string, sendEmail: boolean) => void;
}

export const DeclineCandidateModal: React.FC<DeclineCandidateModalProps> = ({
  candidate,
  onClose,
  onConfirmDecline,
}) => {
  if (!candidate) return null;

  const [reason, setReason] = useState('Qualifications more closely aligned with other applicants');
  const [customMessage, setCustomMessage] = useState(
    `Dear ${candidate.name},\n\nThank you for taking the time to apply for the ${candidate.position} position at DataCare (U) LTD. We reviewed your application carefully; however, we have decided to proceed with other candidates whose background and competencies more closely match our current requirements for this vacancy.\n\nWe appreciate your interest in our organization and encourage you to apply for future opportunities that match your qualifications.\n\nBest regards,\nHuman Resources Department\nProMISe ERP - DataCare (U) LTD`
  );
  const [sendEmail, setSendEmail] = useState(true);

  const handleReasonChange = (newReason: string) => {
    setReason(newReason);
    if (newReason.includes('Psychometric')) {
      setCustomMessage(
        `Dear ${candidate.name},\n\nThank you for completing the initial assessment for the ${candidate.position} role. Unfortunately, your score did not meet the minimum cut-off required to advance to the final interview stage.\n\nWe appreciate your effort and wish you the best in your career pursuits.\n\nBest regards,\nHuman Resources Department\nProMISe ERP`
      );
    } else if (newReason.includes('Experience')) {
      setCustomMessage(
        `Dear ${candidate.name},\n\nThank you for applying for the ${candidate.position} position. While your qualifications are notable, the position requires more extensive practical field experience in this specialized domain.\n\nWe will keep your resume in our talent records for matching openings.\n\nBest regards,\nHuman Resources Department`
      );
    } else {
      setCustomMessage(
        `Dear ${candidate.name},\n\nThank you for applying for the ${candidate.position} position at DataCare (U) LTD. After thorough evaluation, we have chosen to proceed with other candidates for this specific recruitment cycle.\n\nWe wish you every success in your job search.\n\nBest regards,\nHuman Resources Department`
      );
    }
  };

  const handleConfirm = () => {
    onConfirmDecline(candidate.id, reason, customMessage, sendEmail);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
      <div className="bg-white rounded-md shadow-2xl max-w-xl w-full border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#b91c1c] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ban className="w-5 h-5" />
            <h3 className="font-bold text-sm">Decline Applicant: {candidate.name}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Candidate Info Box */}
          <div className="bg-rose-50 border border-rose-200 rounded p-3 text-rose-950 flex justify-between items-center">
            <div>
              <span className="font-bold text-sm text-[#991b1b]">{candidate.name}</span>
              <p className="text-gray-600 text-[11px] mt-0.5">
                Applied for: <strong>{candidate.position}</strong> ({candidate.department})
              </p>
              <p className="text-gray-500 text-[11px] font-mono">{candidate.email} • +{candidate.countryCode} {candidate.phone}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] bg-white border border-rose-300 text-rose-700 px-2 py-0.5 rounded font-bold">
                Current: {candidate.status}
              </span>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Decline Reason Category <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => handleReasonChange(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#b91c1c] focus:outline-none cursor-pointer"
            >
              <option value="Qualifications more closely aligned with other applicants">
                Qualifications more closely aligned with other applicants
              </option>
              <option value="Did not meet minimum experience threshold">
                Did not meet minimum experience threshold
              </option>
              <option value="Psychometric assessment benchmark score not reached">
                Psychometric assessment benchmark score not reached
              </option>
              <option value="Interview board scoring below threshold">
                Interview board scoring below threshold
              </option>
              <option value="Position filled or requisition rescinded">
                Position filled or requisition rescinded
              </option>
              <option value="Other non-matching criteria">
                Other non-matching criteria
              </option>
            </select>
          </div>

          {/* Email / Notification Message */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-gray-700 font-semibold">
                Notification Message (Displayed in Candidate Portal & Sent via Email)
              </label>
              <span className="text-[10px] text-gray-400">Editable preview</span>
            </div>
            <textarea
              rows={5}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded p-2.5 text-xs text-gray-800 focus:bg-white focus:ring-1 focus:ring-[#b91c1c] focus:outline-none font-sans leading-relaxed"
            />
          </div>

          {/* Email Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="sendEmailCheck"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="rounded text-[#b91c1c] focus:ring-rose-500 cursor-pointer"
            />
            <label htmlFor="sendEmailCheck" className="text-gray-700 cursor-pointer font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-500" />
              <span>Simulate instant email dispatch to <strong>{candidate.email}</strong> and record in portal</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-5 py-3 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-semibold cursor-pointer shadow-2xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-1.5 bg-[#b91c1c] hover:bg-[#991b1b] text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Confirm & Decline Applicant</span>
          </button>
        </div>
      </div>
    </div>
  );
};
