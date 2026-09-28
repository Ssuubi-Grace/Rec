import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Download, 
  Printer, 
  X, 
  ShieldCheck, 
  Building, 
  PenTool, 
  CheckSquare,
  Lock,
  Calendar,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { Candidate, OfferLetter } from '../../types';

interface ContractSigningModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
  offer?: OfferLetter | null;
  isSigned: boolean;
  signedDate?: string;
  signedBy?: string;
  onSign: (signatureName: string) => void;
}

export const ContractSigningModal: React.FC<ContractSigningModalProps> = ({
  isOpen,
  onClose,
  candidate,
  offer,
  isSigned,
  signedDate,
  signedBy,
  onSign,
}) => {
  const [signatureName, setSignatureName] = useState(signedBy || candidate.name);
  const [agreeTerms, setAgreeTerms] = useState(isSigned);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const position = offer?.position || candidate.position;
  const department = offer?.department || candidate.department;
  const salary = offer?.grossSalaryMonthly || offer?.basicSalary || '4,800,000';
  const startDate = offer?.startDate || candidate.offerDetails?.startDate || '01-Sep-2026';
  const supervisor = offer?.reportingSupervisor || 'Managing Director / Head of Department';
  const contractDuration = offer?.contractDuration || '2 Years Renewable';

  const handleDownload = () => {
    const docText = `
================================================================================
                    DATACARE UGANDA LIMITED
          OFFICIAL EMPLOYMENT CONTRACT • FIXED TERM (2 YEARS)
================================================================================
Ref: DC-CONTRACT-2026-${candidate.id.toUpperCase()}
Date of Agreement: ${isSigned ? (signedDate || '16-Aug-2026') : '16-Aug-2026'}
Jurisdiction: Republic of Uganda (Employment Act, No. 6 of 2006)

PARTIES:
1. THE EMPLOYER:
   DATACARE UGANDA LIMITED
   Plot 14, Acacia Avenue, Kololo, P.O. Box 28411, Kampala, Uganda
   (hereinafter referred to as the "Company" or "Employer")

2. THE EMPLOYEE:
   ${candidate.name.toUpperCase()}
   National ID / NIN: ${candidate.nationalId || 'CM96023412X98A'}
   Email: ${candidate.email}
   Phone: +${candidate.countryCode} ${candidate.phone}
   (hereinafter referred to as the "Employee")

--------------------------------------------------------------------------------
TERMS AND CONDITIONS OF EMPLOYMENT
--------------------------------------------------------------------------------

1. APPOINTMENT AND DURATION:
   1.1 The Company hereby employs the Employee, and the Employee agrees to serve 
       as ${position.toUpperCase()} in the ${department.toUpperCase()} DEPARTMENT.
   1.2 This Contract shall be for a duration of ${contractDuration}, commencing on 
       ${startDate} (the "Commencement Date").

2. PROBATIONARY PERIOD:
   2.1 The first 3 (three) months of employment shall constitute a probationary period.
   2.2 During probation, either party may terminate this Contract by giving 2 weeks' 
       written notice or payment in lieu of notice.
   2.3 Upon successful completion of probation and performance appraisal, the Employee 
       shall receive written confirmation.

3. REMUNERATION AND BENEFITS:
   3.1 Basic Monthly Gross Salary: UGX ${salary} payable on or before the 28th day 
       of each calendar month.
   3.2 Statutory Deductions: The Company shall deduct Pay As You Earn (PAYE) tax and 
       5% Employee contribution to the National Social Security Fund (NSSF).
   3.3 Employer NSSF: The Company shall contribute 10% employer portion to NSSF.
   3.4 Medical Insurance: Comprehensive inpatient & outpatient coverage for Employee 
       and up to 3 registered legal dependents.

4. DUTIES AND REPORTING:
   4.1 The Employee shall report directly to ${supervisor}.
   4.2 The Employee shall devote full working time, attention, and ability to the 
       business and affairs of the Company and discharge duties diligently in 
       compliance with corporate SOPs and standards.

5. HOURS OF WORK:
   5.1 Official working hours are 8:00 AM to 5:00 PM, Monday through Friday (40 hours/week), 
       with one hour lunch break.

6. LEAVE ENTITLEMENT:
   6.1 Annual Leave: 21 working days of fully paid annual leave per completed 12 months.
   6.2 Sick Leave: Up to 14 days on full pay upon presentation of a valid medical 
       certificate registered by the Uganda Medical and Dental Practitioners Council.
   6.3 Maternity / Paternity Leave: Granted in strict accordance with the Employment 
       Act of Uganda.

7. CONFIDENTIALITY AND INTELLECTUAL PROPERTY:
   7.1 The Employee agrees that all proprietary code, systems, datasets, algorithmic 
       models, and client records developed during employment shall remain the sole 
       and exclusive property of DataCare Uganda Limited.
   7.2 The Employee shall sign and execute the standalone Non-Disclosure Agreement (NDA).

8. TERMINATION:
   8.1 Subsequent to probation confirmation, either party may terminate this agreement 
       by giving one (1) month's written notice or one (1) month's gross salary in lieu.
   8.2 The Company reserves the right to summary dismissal without notice for gross 
       misconduct as defined in the DataCare HR Manual and Ugandan Labor Laws.

--------------------------------------------------------------------------------
EXECUTION AND DIGITAL SIGNATURES:
--------------------------------------------------------------------------------

SIGNED FOR AND ON BEHALF OF DATACARE UGANDA LIMITED:

Dr. Arthur K.
Managing Director / Appointing Authority
DataCare Uganda Limited
[Official Corporate Digital Seal • ProMISe ERP Verified]

--------------------------------------------------------------------------------
SIGNED AND ACCEPTED BY THE EMPLOYEE:

Full Legal Name: ${isSigned ? (signedBy || candidate.name) : signatureName}
National ID:     ${candidate.nationalId || 'CM96023412X98A'}
Execution Date:  ${isSigned ? (signedDate || '16-Aug-2026') : '16-Aug-2026'}
Status:          ${isSigned ? 'LEGALLY EXECUTED & ENROLLED' : 'PENDING E-SIGNATURE'}
Verification:    Cryptographic Digital Signature Record • ProMISe Core e-Sign
================================================================================
`.trim();

    const blob = new Blob([docText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Employment_Contract_${candidate.name.replace(/[^a-zA-Z0-9]/g, '_')}_${position.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
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
      alert('Please enter your full legal name and accept the terms to execute this employment contract.');
      return;
    }
    onSign(signatureName.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-sm border border-[#cbd5e1] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 my-auto">
        
        {/* Modal Header */}
        <div className="bg-[#0f4c81] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-[#0369a1]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-white/10 flex items-center justify-center border border-white/20">
              <FileText className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-sky-200 block">
                DataCare Uganda • Formal Legal Instrument
              </span>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>Contract of Employment (Fixed Term - 2 Years)</span>
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
              title="Download Contract as Text/Document"
            >
              <Download className="w-3.5 h-3.5 text-sky-300" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
              title="Print Contract Document"
            >
              <Printer className="w-3.5 h-3.5 text-sky-300" />
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

        {/* Contract Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-gray-800 font-sans leading-relaxed bg-[#f8fafc]">
          
          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Employment Contract downloaded successfully.
              </span>
              <button onClick={() => setDownloadSuccess(false)}>✕</button>
            </div>
          )}

          {/* Document Sheet Layout */}
          <div className="bg-white border border-gray-300 rounded-sm p-6 sm:p-10 shadow-sm space-y-6 max-w-3xl mx-auto">
            
            {/* Header Letterhead */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-[#0f4c81] pb-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building className="w-6 h-6 text-[#0f4c81]" />
                  <span className="text-base font-black text-[#0f4c81] tracking-wide">
                    DATACARE UGANDA LIMITED
                  </span>
                </div>
                <p className="text-[11px] text-gray-600">
                  Plot 14, Acacia Avenue, Kololo • P.O. Box 28411, Kampala, Uganda
                </p>
                <p className="text-[10px] text-gray-500 font-mono">
                  Web: www.datacare.co.ug • Tel: +256 414 556677 • ProMISe ERP System
                </p>
              </div>

              <div className="text-right sm:border-l sm:pl-4 border-gray-200 text-[11px] space-y-0.5">
                <div className="font-bold text-gray-900">CONTRACT REF:</div>
                <div className="font-mono text-emerald-800 font-bold">
                  DC-CONTRACT-2026-{candidate.id.toUpperCase()}
                </div>
                <div className="text-gray-500">Date: 16-Aug-2026</div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded">
              <h1 className="text-sm font-black text-[#0f4c81] uppercase tracking-wider">
                CONTRACT OF EMPLOYMENT (FIXED TERM - 2 YEARS)
              </h1>
              <p className="text-[11px] text-gray-600">
                Governed by the Employment Act No. 6 of 2006 of the Republic of Uganda
              </p>
            </div>

            {/* Parties Summary Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-blue-50/50 border border-blue-200 rounded text-[11px]">
              <div className="space-y-1">
                <strong className="text-[#0f4c81] block uppercase tracking-wide">The Employer:</strong>
                <p className="font-bold text-gray-800">DataCare Uganda Limited</p>
                <p className="text-gray-600">P.O. Box 28411, Kampala, Uganda</p>
              </div>
              <div className="space-y-1">
                <strong className="text-[#0f4c81] block uppercase tracking-wide">The Employee:</strong>
                <p className="font-bold text-gray-800">{candidate.name}</p>
                <p className="text-gray-600">National ID (NIN): <span className="font-mono">{candidate.nationalId || 'CM96023412X98A'}</span></p>
                <p className="text-gray-600">Email: {candidate.email}</p>
              </div>
            </div>

            {/* Key Contract Clauses */}
            <div className="space-y-4 text-[11px] text-gray-700 leading-relaxed">
              
              <div>
                <h3 className="font-bold text-xs text-[#0f4c81] uppercase mb-1">
                  1. APPOINTMENT & TERM
                </h3>
                <p>
                  The Employer hereby engages the Employee to serve in the position of <strong>{position}</strong> in the <strong>{department}</strong> department for a fixed duration of <strong>{contractDuration}</strong>, commencing on <strong>{startDate}</strong>, subject to the terms and conditions set forth herein.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-xs text-[#0f4c81] uppercase mb-1">
                  2. PROBATIONARY PERIOD & CONFIRMATION
                </h3>
                <p>
                  The first 3 (three) months of service shall be a probationary period. During this period, performance will be evaluated. Upon satisfactory appraisal, the Employee shall be confirmed in writing. Either party may terminate during probation by providing two (2) weeks' notice in writing.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-xs text-[#0f4c81] uppercase mb-1">
                  3. REMUNERATION, ALLOWANCES & DEDUCTIONS
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-800">
                  <li><strong>Gross Monthly Salary:</strong> UGX {salary} payable by direct bank deposit by the 28th of every month.</li>
                  <li><strong>Statutory PAYE & NSSF:</strong> The Employer shall deduct statutory Pay-As-You-Earn (PAYE) income tax and 5% employee NSSF contribution.</li>
                  <li><strong>Employer NSSF Contribution:</strong> The Employer shall remit 10% employer NSSF contribution.</li>
                  <li><strong>Medical Insurance:</strong> Comprehensive health cover with tier-1 hospitals across Uganda for Employee + 3 legal dependents.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-xs text-[#0f4c81] uppercase mb-1">
                  4. WORKING HOURS & DUTIES
                </h3>
                <p>
                  Official business hours are 8:00 AM to 5:00 PM, Monday to Friday (40 hours per week). The Employee shall report to <strong>{supervisor}</strong> and perform all assigned tasks diligently in accordance with DataCare quality frameworks.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-xs text-[#0f4c81] uppercase mb-1">
                  5. ANNUAL & STATUTORY LEAVE
                </h3>
                <p>
                  The Employee is entitled to 21 working days of paid annual leave per calendar year, accrued monthly. Sick leave of up to 14 days on full pay is granted upon medical practitioner certification. Maternity and paternity leave shall be granted in accordance with the Uganda Employment Act.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-xs text-[#0f4c81] uppercase mb-1">
                  6. INTELLECTUAL PROPERTY & CONFIDENTIALITY
                </h3>
                <p>
                  All source code, database architectures, analytical algorithms, trade secrets, documentation, and technical deliverables developed by the Employee during the course of employment shall be the sole and exclusive intellectual property of DataCare Uganda Limited. The Employee agrees to execute the standalone Corporate Non-Disclosure Agreement (NDA).
                </p>
              </div>

              <div>
                <h3 className="font-bold text-xs text-[#0f4c81] uppercase mb-1">
                  7. TERMINATION OF EMPLOYMENT
                </h3>
                <p>
                  After probation confirmation, either party may terminate this agreement by providing one (1) calendar month's written notice or payment of one month's gross salary in lieu of notice. The Company reserves the right to summary dismissal without notice in cases of proven gross misconduct or fraud.
                </p>
              </div>

            </div>

            {/* Signature Block */}
            <div className="pt-4 border-t-2 border-gray-200 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Employer Sign-Off */}
                <div className="p-3 bg-slate-50 border border-gray-200 rounded space-y-2">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                    FOR DATACARE UGANDA LIMITED:
                  </div>
                  <div className="h-10 flex items-center">
                    <span className="font-serif italic text-lg text-[#0f4c81] font-bold">
                      Arthur K. (MD)
                    </span>
                  </div>
                  <div className="text-[11px] border-t border-gray-300 pt-1 space-y-0.5">
                    <strong className="block text-gray-900">Dr. Arthur K.</strong>
                    <span className="text-gray-600 block">Managing Director / Appointing Authority</span>
                    <span className="text-[10px] text-emerald-800 font-mono font-bold block">
                      ✓ ProMISe Corporate Digital Seal Verified
                    </span>
                  </div>
                </div>

                {/* Employee Sign-Off */}
                <div className={`p-3 rounded space-y-2 border ${
                  isSigned 
                    ? 'bg-emerald-50/80 border-emerald-300' 
                    : 'bg-amber-50/60 border-amber-200'
                }`}>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide flex justify-between items-center">
                    <span>FOR THE EMPLOYEE:</span>
                    {isSigned && (
                      <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Signed
                      </span>
                    )}
                  </div>
                  <div className="h-10 flex items-center">
                    <span className="font-serif italic text-lg text-emerald-900 font-black">
                      {isSigned ? (signedBy || candidate.name) : (signatureName || candidate.name)}
                    </span>
                  </div>
                  <div className="text-[11px] border-t border-gray-300 pt-1 space-y-0.5">
                    <strong className="block text-gray-900">{isSigned ? (signedBy || candidate.name) : candidate.name}</strong>
                    <span className="text-gray-600 block">Appointee Signature</span>
                    <span className="text-[10px] text-gray-500 font-mono block">
                      Date: {isSigned ? (signedDate || '16-Aug-2026') : 'Awaiting Execution'}
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Interactive Digital Signature Form */}
          {!isSigned && (
            <form onSubmit={handleSubmitSign} className="bg-white border border-[#0284c7] p-5 rounded-sm shadow-md space-y-4 max-w-3xl mx-auto">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <PenTool className="w-4 h-4 text-[#0284c7]" />
                <h4 className="font-bold text-xs text-[#0f4c81] uppercase tracking-wide">
                  Candidate Digital E-Signature & Formal Execution
                </h4>
              </div>

              <p className="text-xs text-gray-600">
                Please type your full legal name as it appears on your Uganda National ID. By typing your name and checking the agreement box below, you append your binding electronic signature to this 2-Year Employment Contract.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">
                    Full Legal Name (Electronic Signature) <span className="text-red-500">*</span>
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
                    Cursive Digital Signature Preview:
                  </label>
                  <div className="bg-slate-100 border border-dashed border-gray-300 rounded px-3 py-1.5 h-[38px] flex items-center font-serif italic text-base text-[#0f4c81] select-none">
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
                    className="mt-0.5 rounded text-[#0284c7]"
                    required
                  />
                  <span className="text-[11px] text-gray-700 leading-snug">
                    I, <strong>{signatureName || candidate.name}</strong>, confirm that I have read, understood, and agreed to all 7 clauses of this Employment Contract with DataCare Uganda Limited. I understand that this digital signature constitutes a binding legal agreement under the Electronic Signatures Act of Uganda.
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
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Execute & E-Sign Employment Contract</span>
                </button>
              </div>
            </form>
          )}

          {isSigned && (
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded text-center space-y-2 max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Employment Contract Successfully Signed & Verified</span>
              </div>
              <p className="text-xs text-emerald-700">
                Executed by <strong>{signedBy || candidate.name}</strong> on {signedDate || '16-Aug-2026'}. A copy has been stored in your employee personnel file and forwarded to HR.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Signed Contract Copy</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-[#f1f5f9] px-6 py-3 border-t border-[#cbd5e1] flex items-center justify-between shrink-0 text-xs">
          <span className="text-[11px] text-gray-500">
            ProMISe ERP • Human Resources Management System
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
