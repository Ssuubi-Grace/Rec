import React from 'react';
import { 
  GraduationCap, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  FileText, 
  Building, 
  Download,
  Award,
  CheckSquare
} from 'lucide-react';
import { Candidate } from '../../types';

interface CertificatesVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
}

export const CertificatesVerificationModal: React.FC<CertificatesVerificationModalProps> = ({
  isOpen,
  onClose,
  candidate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-sm border border-[#cbd5e1] max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 my-auto text-xs">
        
        {/* Header */}
        <div className="bg-[#0f4c81] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-[#0369a1]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-white/10 flex items-center justify-center border border-white/20">
              <GraduationCap className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-sky-200 block">
                Verification & Compliance Records
              </span>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>Academic & Identity Verification Record</span>
                <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[10px] font-bold">
                  ✓ Verified by HR
                </span>
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
            <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#0f4c81]">
                  Candidate Compliance File: {candidate.name}
                </h3>
                <p className="text-[11px] text-gray-500">
                  Role: {candidate.position} • Department: {candidate.department}
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Cleared
              </span>
            </div>

            <div className="space-y-3">
              {/* Item 1 */}
              <div className="p-3 bg-slate-50 border border-gray-200 rounded flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Uganda National ID (NIN) Verification</span>
                  </div>
                  <p className="text-[11px] text-gray-600 pl-5">
                    NIN: <strong className="font-mono">{candidate.nationalId || 'CM96023412X98A'}</strong> • Verified via NIRA Database Link
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Valid & Verified
                </span>
              </div>

              {/* Item 2 */}
              <div className="p-3 bg-slate-50 border border-gray-200 rounded flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Academic Degree Transcript & Certificate</span>
                  </div>
                  <p className="text-[11px] text-gray-600 pl-5">
                    {candidate.educationLevel} • Makerere University Kampala • Certified Official Copy on File
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Authenticated
                </span>
              </div>

              {/* Item 3 */}
              <div className="p-3 bg-slate-50 border border-gray-200 rounded flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Professional References & Background Checks</span>
                  </div>
                  <p className="text-[11px] text-gray-600 pl-5">
                    3 Independent Professional References Contacted & Verified Positive Recommendation
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Cleared
                </span>
              </div>

              {/* Item 4 */}
              <div className="p-3 bg-slate-50 border border-gray-200 rounded flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Interpol / Certificate of Good Conduct</span>
                  </div>
                  <p className="text-[11px] text-gray-600 pl-5">
                    Clear criminal background clearance record on file
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Clean Record
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#f1f5f9] px-6 py-3 border-t border-[#cbd5e1] flex items-center justify-between shrink-0 text-xs">
          <span className="text-[11px] text-gray-500">
            DataCare Uganda Limited • HR Compliance & Credential Registry
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
