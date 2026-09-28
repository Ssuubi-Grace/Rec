import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Printer, 
  X, 
  Building, 
  PenTool, 
  CheckCircle2, 
  Lock, 
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { Candidate } from '../../types';

interface NdaSigningModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
  isSigned: boolean;
  signedDate?: string;
  signedBy?: string;
  onSign: (signatureName: string) => void;
}

export const NdaSigningModal: React.FC<NdaSigningModalProps> = ({
  isOpen,
  onClose,
  candidate,
  isSigned,
  signedDate,
  signedBy,
  onSign,
}) => {
  const [signatureName, setSignatureName] = useState(signedBy || candidate.name);
  const [agreeTerms, setAgreeTerms] = useState(isSigned);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    const docText = `
================================================================================
                    DATACARE UGANDA LIMITED
   EMPLOYEE NON-DISCLOSURE & INTELLECTUAL PROPERTY ASSIGNMENT AGREEMENT
================================================================================
Agreement Ref: DC-NDA-2026-${candidate.id.toUpperCase()}
Execution Date: ${isSigned ? (signedDate || '16-Aug-2026') : '16-Aug-2026'}
Statutory Authority: Uganda Data Protection & Privacy Act, 2019 • Employment Act 2006

PARTIES:
1. DATACARE UGANDA LIMITED ("The Company")
   Plot 14, Acacia Avenue, Kololo, Kampala, Uganda

2. ${candidate.name.toUpperCase()} ("The Employee / Recipient")
   National ID: ${candidate.nationalId || 'CM96023412X98A'}
   Position:    ${candidate.position}
   Email:       ${candidate.email}

--------------------------------------------------------------------------------
1. PURPOSE & PREAMBLE:
   The Employee is entering into employment with DataCare Uganda Limited and in 
   the course of performing duties will have access to highly proprietary, trade 
   secret, customer, and confidential data ("Confidential Information").

2. DEFINITION OF CONFIDENTIAL INFORMATION:
   "Confidential Information" encompasses all technical architectures, enterprise 
   source code repositories, PostgreSQL database schemas, machine learning models, 
   API keys, security tokens, pricing structures, payroll records, and sensitive 
   personal data relating to clients, ministries, development partners, and staff.

3. NON-DISCLOSURE & SAFEGUARDING OBLIGATIONS:
   The Employee unconditionally covenants and undertakes:
   (a) To hold all Confidential Information in strictest confidence and not disclose 
       it to any unauthorized person, third party, or public forum.
   (b) To maintain strict compliance with ISO/IEC 27001 data security standards and 
       the Uganda Data Protection and Privacy Act 2019.
   (c) To utilize corporate credentials and devices solely for bona fide business 
       activities of the Company.
   (d) Not to copy, exfiltrate, export, or transmit source code or customer data 
       to personal cloud drives, external USB devices, or unauthorized AI systems.

4. INTELLECTUAL PROPERTY ASSIGNMENT:
   All inventions, software code, UI designs, analytical methodologies, and patentable 
   or copyrightable works created during the tenure of employment shall automatically 
   and exclusively vest in DataCare Uganda Limited without additional compensation.

5. RETURN OF PROPERTY UPON SEPARATION:
   Upon separation or termination of employment for any reason, the Employee shall 
   immediately surrender all hardware assets, access cards, authentication tokens, 
   code repositories, and confidential documents to the IT and HR departments.

6. SURVIVAL & REMEDIES:
   These confidentiality covenants shall survive the termination or expiration of 
   the Employee's employment for a period of 5 (five) years. The Employee acknowledges 
   that a breach will cause irreparable harm, entitling the Company to injunctive 
   relief in the High Court of Uganda (Commercial Division) alongside actual damages.

--------------------------------------------------------------------------------
EXECUTION AND DIGITAL SIGNATURE RECORD:
--------------------------------------------------------------------------------

SIGNED FOR AND ON BEHALF OF DATACARE UGANDA LIMITED:
Dr. Arthur K. - Managing Director / Appointing Authority
DataCare Uganda Limited • Corporate Legal Affairs
[ProMISe Cryptographic Security Verification SHA-256 Validated]

--------------------------------------------------------------------------------
SIGNED AND CONFIRMED BY EMPLOYEE:
Appointee:    ${isSigned ? (signedBy || candidate.name) : signatureName}
National ID:  ${candidate.nationalId || 'CM96023412X98A'}
Date:         ${isSigned ? (signedDate || '16-Aug-2026') : '16-Aug-2026'}
Status:       ${isSigned ? 'LEGALLY EXECUTED & ENROLLED' : 'PENDING E-SIGNATURE'}
================================================================================
`.trim();

    const blob = new Blob([docText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Non_Disclosure_Agreement_NDA_${candidate.name.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmitSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureName.trim() || !agreeTerms) {
      alert('Please enter your full legal name and accept the terms to execute this NDA.');
      return;
    }
    onSign(signatureName.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-sm border border-[#cbd5e1] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 my-auto">
        
        {/* Header */}
        <div className="bg-[#1e293b] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 block">
                DataCare Uganda • Security & Compliance Instrument
              </span>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>Non-Disclosure Agreement (NDA) & Confidentiality</span>
                {isSigned && (
                  <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[10px] font-bold">
                    ✓ Executed & Signed
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
            >
              <Download className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-gray-800 font-sans leading-relaxed bg-[#f8fafc]">
          
          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Non-Disclosure Agreement downloaded successfully.
              </span>
              <button onClick={() => setDownloadSuccess(false)}>✕</button>
            </div>
          )}

          <div className="bg-white border border-gray-300 rounded-sm p-6 sm:p-10 shadow-sm space-y-6 max-w-3xl mx-auto">
            
            {/* Header Letterhead */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-800 pb-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building className="w-6 h-6 text-slate-800" />
                  <span className="text-base font-black text-slate-900 tracking-wide">
                    DATACARE UGANDA LIMITED
                  </span>
                </div>
                <p className="text-[11px] text-gray-600">
                  Legal & Information Security Department • Kampala, Uganda
                </p>
                <p className="text-[10px] text-gray-500 font-mono">
                  Uganda Data Protection & Privacy Act (2019) Standard Enactment
                </p>
              </div>

              <div className="text-right sm:border-l sm:pl-4 border-gray-200 text-[11px] space-y-0.5">
                <div className="font-bold text-gray-900">SECURITY REF:</div>
                <div className="font-mono text-emerald-800 font-bold">
                  DC-NDA-2026-{candidate.id.toUpperCase()}
                </div>
                <div className="text-gray-500">Date: 16-Aug-2026</div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center py-2.5 bg-slate-900 text-white rounded">
              <h1 className="text-sm font-black uppercase tracking-wider text-emerald-400">
                EMPLOYEE NON-DISCLOSURE & INTELLECTUAL PROPERTY ASSIGNMENT AGREEMENT
              </h1>
              <p className="text-[11px] text-slate-300">
                Confidentiality Undertaking & Data Protection Compliance
              </p>
            </div>

            {/* Clauses */}
            <div className="space-y-4 text-[11px] text-gray-700 leading-relaxed">
              <div>
                <h3 className="font-bold text-xs text-slate-900 uppercase mb-1">
                  1. SCOPE OF CONFIDENTIAL INFORMATION
                </h3>
                <p>
                  The Employee acknowledges that in the course of service with DataCare Uganda Limited, they will obtain access to confidential proprietary trade secrets, enterprise algorithms, software source code, customer databases, government data pipelines, financial models, and strategic plans.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-xs text-slate-900 uppercase mb-1">
                  2. STRICT NON-DISCLOSURE OBLIGATIONS
                </h3>
                <p>
                  The Employee covenants to hold all such information in strict confidence and shall not, directly or indirectly, publish, disclose, duplicate, transfer, or make available any Confidential Information to any unauthorized third party or public repository without prior written authorization from the Managing Director.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-xs text-slate-900 uppercase mb-1">
                  3. INTELLECTUAL PROPERTY & CODE ASSIGNMENT
                </h3>
                <p>
                  All programs, technical frameworks, architectures, inventions, documentation, and algorithmic models designed or contributed to by the Employee during their employment shall be the sole, perpetual, and exclusive intellectual property of DataCare Uganda Limited.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-xs text-slate-900 uppercase mb-1">
                  4. UGANDA DATA PRIVACY ACT COMPLIANCE
                </h3>
                <p>
                  The Employee undertakes strict compliance with the Uganda Data Protection and Privacy Act of 2019. Processing of citizen, customer, or employee personal data must adhere strictly to lawful purpose, security safeguard mandates, and encryption standards.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-xs text-slate-900 uppercase mb-1">
                  5. DURATION & LEGAL REMEDIES
                </h3>
                <p>
                  The covenants contained herein shall remain in full force and effect throughout the Employee's tenure and for a period of five (5) years following termination of employment. Breach shall entitle the Company to immediate injunctive relief and punitive damages.
                </p>
              </div>
            </div>

            {/* Signature Preview */}
            <div className="pt-4 border-t-2 border-gray-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-gray-200 rounded space-y-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">FOR THE COMPANY:</span>
                  <div className="font-serif italic text-base text-slate-800 font-bold">Dr. Arthur K.</div>
                  <span className="text-[10px] text-gray-600 block">Managing Director • Legal Authority</span>
                  <span className="text-[10px] text-emerald-700 font-mono font-bold block">✓ Corporate Seal Authenticated</span>
                </div>

                <div className={`p-3 rounded space-y-1 border ${
                  isSigned ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-200'
                }`}>
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">EMPLOYEE COVENANTOR:</span>
                  <div className="font-serif italic text-base text-emerald-900 font-bold">
                    {isSigned ? (signedBy || candidate.name) : (signatureName || candidate.name)}
                  </div>
                  <span className="text-[10px] text-gray-600 block">{candidate.name} ({candidate.position})</span>
                  <span className="text-[10px] text-gray-500 font-mono block">
                    {isSigned ? `Signed: ${signedDate || '16-Aug-2026'}` : 'Pending Digital Signature'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Form */}
          {!isSigned && (
            <form onSubmit={handleSubmitSign} className="bg-white border border-slate-400 p-5 rounded-sm shadow-md space-y-4 max-w-3xl mx-auto">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <PenTool className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                  Candidate NDA Digital Signature Execution
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">
                    Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    placeholder="Enter full legal name..."
                    className="w-full bg-slate-50 border border-gray-300 rounded px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">
                    Digital Signature Preview:
                  </label>
                  <div className="bg-slate-100 border border-dashed border-gray-300 rounded px-3 py-1.5 h-[38px] flex items-center font-serif italic text-base text-slate-900 select-none">
                    {signatureName || 'Your Signature Will Appear Here'}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600"
                    required
                  />
                  <span className="text-[11px] text-gray-700 leading-snug">
                    I hereby execute this Non-Disclosure & Intellectual Property Assignment Agreement and agree to be legally bound by all provisions under the laws of the Republic of Uganda.
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
                      ? 'bg-slate-900 hover:bg-black text-emerald-400 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Execute & E-Sign NDA Agreement</span>
                </button>
              </div>
            </form>
          )}

          {isSigned && (
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded text-center space-y-2 max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>NDA & Confidentiality Agreement Successfully Executed</span>
              </div>
              <p className="text-xs text-emerald-700">
                Signed by <strong>{signedBy || candidate.name}</strong> on {signedDate || '16-Aug-2026'}. Recorded in the security registry.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Signed NDA Copy</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#f1f5f9] px-6 py-3 border-t border-[#cbd5e1] flex items-center justify-between shrink-0 text-xs">
          <span className="text-[11px] text-gray-500">
            DataCare Uganda Limited • Legal & Security Registry
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-slate-100 cursor-pointer"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
