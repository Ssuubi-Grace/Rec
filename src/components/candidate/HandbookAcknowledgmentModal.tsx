import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Download, 
  X, 
  ShieldCheck, 
  Building, 
  PenTool,
  Award,
  AlertTriangle
} from 'lucide-react';
import { Candidate } from '../../types';

interface HandbookAcknowledgmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
  isAcknowledged: boolean;
  acknowledgedDate?: string;
  acknowledgedBy?: string;
  onAcknowledge: (signatureName: string) => void;
}

export const HandbookAcknowledgmentModal: React.FC<HandbookAcknowledgmentModalProps> = ({
  isOpen,
  onClose,
  candidate,
  isAcknowledged,
  acknowledgedDate,
  acknowledgedBy,
  onAcknowledge,
}) => {
  const [signatureName, setSignatureName] = useState(acknowledgedBy || candidate.name);
  const [agreeTerms, setAgreeTerms] = useState(isAcknowledged);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureName.trim() || !agreeTerms) {
      alert('Please enter your legal name and confirm policy acknowledgment.');
      return;
    }
    onAcknowledge(signatureName.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-sm border border-[#cbd5e1] max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 my-auto text-xs">
        
        {/* Header */}
        <div className="bg-[#1e1b4b] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-indigo-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-white/10 flex items-center justify-center border border-white/20">
              <BookOpen className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300 block">
                Corporate Governance & Ethics
              </span>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>Code of Conduct & Employee Handbook</span>
                {isAcknowledged && (
                  <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[10px] font-bold">
                    ✓ Acknowledged
                  </span>
                )}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 bg-[#f8fafc]">
          
          <div className="bg-white border border-gray-300 rounded p-5 space-y-4 shadow-sm max-w-2xl mx-auto">
            <div className="border-b border-gray-200 pb-3">
              <h3 className="text-sm font-black text-[#1e1b4b] uppercase tracking-wide">
                DataCare Uganda Limited • Ethical Charter & Values
              </h3>
              <p className="text-[11px] text-gray-500">
                Core operating principles, anti-corruption, information security, and respectful workplace mandates.
              </p>
            </div>

            <div className="space-y-3 text-[11px] text-gray-700 leading-relaxed">
              <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded">
                <strong className="text-indigo-950 font-bold block mb-0.5">1. Professional Integrity & Honesty</strong>
                <p>Every employee must conduct all company business with the highest standards of integrity, transparency, and compliance with the Laws of Uganda.</p>
              </div>

              <div className="p-3 bg-slate-50 border border-gray-200 rounded">
                <strong className="text-gray-900 font-bold block mb-0.5">2. Zero Tolerance for Bribery & Financial Impropriety</strong>
                <p>DataCare enforces a strict zero-tolerance anti-bribery and corruption policy in dealing with clients, vendors, public officials, and partners.</p>
              </div>

              <div className="p-3 bg-slate-50 border border-gray-200 rounded">
                <strong className="text-gray-900 font-bold block mb-0.5">3. Equal Opportunity & Anti-Harassment</strong>
                <p>We are committed to providing a safe, inclusive workplace free from discrimination, sexual harassment, or intimidation of any form.</p>
              </div>

              <div className="p-3 bg-slate-50 border border-gray-200 rounded">
                <strong className="text-gray-900 font-bold block mb-0.5">4. Information Security & Clean Desk Policy</strong>
                <p>All workstations, source repositories, and customer databases must remain strictly protected with multi-factor authentication and role-based access.</p>
              </div>
            </div>
          </div>

          {!isAcknowledged ? (
            <form onSubmit={handleSubmit} className="bg-white border border-indigo-300 p-5 rounded space-y-4 shadow-sm max-w-2xl mx-auto">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <PenTool className="w-4 h-4 text-indigo-700" />
                <h4 className="font-bold text-xs text-indigo-950 uppercase tracking-wide">
                  Candidate Digital Acknowledgment Sign-Off
                </h4>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700">
                  Full Legal Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Enter full legal name..."
                  className="w-full bg-slate-50 border border-gray-300 rounded px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600"
                    required
                  />
                  <span className="text-[11px] text-gray-700 leading-snug">
                    I acknowledge that I have received, read, and agree to uphold the DataCare Uganda Employee Handbook, Code of Conduct, and Information Security Policies throughout my employment.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-slate-50 rounded text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!signatureName.trim() || !agreeTerms}
                  className={`px-6 py-2 rounded text-xs font-bold shadow-md flex items-center gap-2 ${
                    signatureName.trim() && agreeTerms
                      ? 'bg-indigo-900 hover:bg-indigo-950 text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Acknowledge Code of Conduct</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded text-center space-y-1 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Code of Conduct & Handbook Formally Acknowledged</span>
              </div>
              <p className="text-xs text-emerald-700">
                Signed by <strong>{acknowledgedBy || candidate.name}</strong> on {acknowledgedDate || '16-Aug-2026'}.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#f1f5f9] px-6 py-3 border-t border-[#cbd5e1] flex items-center justify-between shrink-0 text-xs">
          <span className="text-[11px] text-gray-500">
            DataCare Uganda Limited • Human Resources Governance
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-slate-100 cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
