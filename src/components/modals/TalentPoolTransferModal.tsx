import React, { useState } from 'react';
import { Archive, BookmarkCheck, User, Sparkles } from 'lucide-react';
import { Candidate } from '../../types';

interface TalentPoolTransferModalProps {
  candidate: Candidate;
  onClose: () => void;
  onConfirmTransfer: (candidateId: string, reason: string, notes: string) => void;
}

export const TalentPoolTransferModal: React.FC<TalentPoolTransferModalProps> = ({
  candidate,
  onClose,
  onConfirmTransfer,
}) => {
  const [reason, setReason] = useState<string>('Runner-up');
  const [notes, setNotes] = useState<string>('Strong cultural fit and technical profile. Retained for imminent Q4 expansion.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmTransfer(candidate.id, reason, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-[#94a3b8]">
        <div className="bg-[#1e293b] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-sm">Transfer to Talent Pool Repository</h3>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-[#334155]">
          <div className="bg-purple-50/70 border border-purple-200 p-3 rounded space-y-1">
            <span className="font-bold text-purple-900 block">{candidate.name}</span>
            <span className="text-[11px] text-gray-600 block">{candidate.position} • {candidate.email}</span>
            <span className="text-[10px] text-purple-700 font-medium">Match: {candidate.matchScore}% | Test Score: {candidate.testScore}%</span>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Retention Categorization Tag <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-purple-600 focus:outline-none cursor-pointer"
            >
              <option value="Runner-up">Runner-up (Close 2nd Place)</option>
              <option value="High Potential">High Potential / Future Leadership</option>
              <option value="Overqualified">Overqualified for current grade</option>
              <option value="Future Expansion">Reserved for Future Projects / Branches</option>
              <option value="Strong Interviewee">Strong Interview Performance</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              HR Retention Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-[#cbd5e1] rounded p-2 text-xs focus:ring-1 focus:ring-purple-600 focus:outline-none"
              placeholder="Provide context on candidate strengths..."
            />
          </div>

          <div className="bg-slate-50 p-2.5 rounded text-[11px] text-gray-500 border border-gray-200">
            💡 Candidate will remain active in the Talent Pool searchable index and can be re-engaged or fast-tracked for new requisitions with 1 click.
          </div>

          <div className="pt-2 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-bold shadow-2xs transition-colors flex items-center gap-1"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>Confirm & Retain in Talent Pool</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
