import React, { useState } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  CheckCircle2, 
  X, 
  Building, 
  Download, 
  ShieldCheck, 
  UserCheck, 
  Info,
  CheckSquare
} from 'lucide-react';
import { Candidate } from '../../types';

export interface PayrollDetails {
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  accountName: string;
  nssfNumber: string;
  tinNumber: string;
  nextOfKinName: string;
  nextOfKinPhone: string;
  nextOfKinRelationship: string;
  isSubmitted: boolean;
  submittedDate?: string;
}

interface PayrollSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
  payrollData: PayrollDetails;
  onSubmit: (data: PayrollDetails) => void;
}

const UGANDA_BANKS = [
  'Stanbic Bank Uganda Limited',
  'Centenary Rural Development Bank',
  'Absa Bank Uganda Limited',
  'Standard Chartered Bank Uganda',
  'Equity Bank Uganda Limited',
  'DFCU Bank Limited',
  'Bank of Baroda Uganda',
  'KCB Bank Uganda',
  'PostBank Uganda Limited',
  'Diamond Trust Bank Uganda (DTB)',
  'Housing Finance Bank',
  'NCBA Bank Uganda'
];

export const PayrollSubmissionModal: React.FC<PayrollSubmissionModalProps> = ({
  isOpen,
  onClose,
  candidate,
  payrollData,
  onSubmit,
}) => {
  const [bankName, setBankName] = useState(payrollData.bankName || 'Stanbic Bank Uganda Limited');
  const [bankBranch, setBankBranch] = useState(payrollData.bankBranch || 'Forest Mall Branch');
  const [accountNumber, setAccountNumber] = useState(payrollData.accountNumber || '9030018823901');
  const [accountName, setAccountName] = useState(payrollData.accountName || candidate.name);
  const [nssfNumber, setNssfNumber] = useState(payrollData.nssfNumber || '109283746501');
  const [tinNumber, setTinNumber] = useState(payrollData.tinNumber || '1004839201');
  const [nextOfKinName, setNextOfKinName] = useState(payrollData.nextOfKinName || 'Sarah Nalwanga Kintu');
  const [nextOfKinPhone, setNextOfKinPhone] = useState(payrollData.nextOfKinPhone || '+256 772 889900');
  const [nextOfKinRelationship, setNextOfKinRelationship] = useState(payrollData.nextOfKinRelationship || 'Spouse');
  const [agreeAuth, setAgreeAuth] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim() || !accountName.trim() || !nssfNumber.trim() || !tinNumber.trim()) {
      alert('Please fill out all mandatory banking, NSSF, and TIN information.');
      return;
    }

    const updated: PayrollDetails = {
      bankName,
      bankBranch,
      accountNumber,
      accountName,
      nssfNumber,
      tinNumber,
      nextOfKinName,
      nextOfKinPhone,
      nextOfKinRelationship,
      isSubmitted: true,
      submittedDate: '16-Aug-2026'
    };

    onSubmit(updated);
    onClose();
  };

  const handleDownloadReceipt = () => {
    const text = `
================================================================================
                    DATACARE UGANDA LIMITED
        PAYROLL & STATUTORY INFORMATION ENROLMENT RECEIPT
================================================================================
Employee ID:       ${candidate.id.toUpperCase()}
Employee Name:     ${candidate.name}
Position:          ${candidate.position}
National ID (NIN): ${candidate.nationalId || 'CM96023412X98A'}
Date of Record:    ${payrollData.submittedDate || '16-Aug-2026'}

1. BANKING DETAILS FOR DIRECT SALARY DEPOSIT:
   Financial Institution: ${bankName}
   Branch:               ${bankBranch}
   Account Number:       ${accountNumber}
   Account Holder Name:  ${accountName}

2. STATUTORY COMPLIANCE REGISTRATIONS:
   National Social Security Fund (NSSF) No: ${nssfNumber}
   Uganda Revenue Authority (URA) TIN No:   ${tinNumber}

3. NEXT OF KIN & EMERGENCY CONTACT:
   Full Name:     ${nextOfKinName}
   Relationship:  ${nextOfKinRelationship}
   Contact Phone: ${nextOfKinPhone}

STATUS: VERIFIED & ENROLLED INTO PROMISE ERP PAYROLL MODULE
================================================================================
`.trim();

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payroll_Enrolment_${candidate.name.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-sm border border-[#cbd5e1] max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 my-auto text-xs">
        
        {/* Header */}
        <div className="bg-[#047857] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-white/10 flex items-center justify-center border border-white/20">
              <CreditCard className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-200 block">
                Finance & Payroll Setup
              </span>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>Bank Account, NSSF & URA TIN Submission</span>
                {payrollData.isSubmitted && (
                  <span className="px-2 py-0.5 bg-emerald-400 text-emerald-950 rounded text-[10px] font-bold">
                    ✓ Enrolled
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {payrollData.isSubmitted && (
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download Receipt</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 bg-[#f8fafc]">
          
          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Payroll Enrolment record downloaded successfully.
              </span>
              <button onClick={() => setDownloadSuccess(false)}>✕</button>
            </div>
          )}

          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded flex items-start gap-3">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-[11px] text-emerald-900 leading-relaxed">
              <strong>Mandatory Payroll Prerequisites:</strong> All incoming DataCare Uganda employees must provide verified bank account details alongside their <strong>National Social Security Fund (NSSF)</strong> membership number and <strong>Uganda Revenue Authority (URA) TIN</strong> for automated monthly remuneration and statutory tax compliance.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Bank Information Card */}
            <div className="bg-white border border-gray-300 rounded p-4 space-y-3 shadow-2xs">
              <h3 className="font-bold text-xs text-[#0f4c81] uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200 pb-2">
                <Building className="w-3.5 h-3.5 text-[#0284c7]" />
                <span>1. Bank Account Details (Salary Credit)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">
                    Financial Institution / Bank <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#047857] focus:outline-none"
                    required
                  >
                    {UGANDA_BANKS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">
                    Bank Branch <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                    placeholder="e.g. Forest Mall Branch"
                    className="w-full bg-slate-50 border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#047857] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 9030018823901"
                    className="w-full bg-slate-50 border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold focus:ring-1 focus:ring-[#047857] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">
                    Account Holder Legal Name (Matches ID) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. Robert Kintu"
                    className="w-full bg-slate-50 border border-gray-300 rounded px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-[#047857] focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Statutory Numbers Card */}
            <div className="bg-white border border-gray-300 rounded p-4 space-y-3 shadow-2xs">
              <h3 className="font-bold text-xs text-[#0f4c81] uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200 pb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. Statutory Tax & Social Security Numbers</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">
                    NSSF Number (10–13 digits) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nssfNumber}
                    onChange={(e) => setNssfNumber(e.target.value)}
                    placeholder="e.g. 109283746501"
                    className="w-full bg-slate-50 border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-800 focus:ring-1 focus:ring-[#047857] focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-gray-500">
                    National Social Security Fund member account identifier
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">
                    URA TIN (Tax Identification Number) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tinNumber}
                    onChange={(e) => setTinNumber(e.target.value)}
                    placeholder="e.g. 1004839201"
                    className="w-full bg-slate-50 border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-indigo-800 focus:ring-1 focus:ring-[#047857] focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-gray-500">
                    Uganda Revenue Authority 10-digit individual tax account
                  </span>
                </div>
              </div>
            </div>

            {/* Next of Kin Card */}
            <div className="bg-white border border-gray-300 rounded p-4 space-y-3 shadow-2xs">
              <h3 className="font-bold text-xs text-[#0f4c81] uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200 pb-2">
                <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>3. Next of Kin & Emergency Beneficiary</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">
                    Next of Kin Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nextOfKinName}
                    onChange={(e) => setNextOfKinName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-slate-50 border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#047857] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nextOfKinRelationship}
                    onChange={(e) => setNextOfKinRelationship(e.target.value)}
                    placeholder="e.g. Spouse, Parent, Sibling"
                    className="w-full bg-slate-50 border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#047857] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">
                    Contact Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nextOfKinPhone}
                    onChange={(e) => setNextOfKinPhone(e.target.value)}
                    placeholder="+256 7XX XXX XXX"
                    className="w-full bg-slate-50 border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#047857] focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Authorization checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeAuth}
                  onChange={(e) => setAgreeAuth(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600"
                  required
                />
                <span className="text-[11px] text-gray-700 leading-snug">
                  I certify that the bank account and statutory numbers provided above belong directly to me and authorize DataCare Uganda Limited to process all salary payments and tax remittances accordingly.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-slate-50 rounded text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!agreeAuth}
                className={`px-6 py-2 rounded text-xs font-bold shadow-md flex items-center gap-2 ${
                  agreeAuth
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{payrollData.isSubmitted ? 'Update & Save Payroll Details' : 'Submit Verified Payroll & Tax Details'}</span>
              </button>
            </div>

          </form>

        </div>

        {/* Footer */}
        <div className="bg-[#f1f5f9] px-6 py-3 border-t border-[#cbd5e1] flex items-center justify-between shrink-0 text-xs">
          <span className="text-[11px] text-gray-500">
            DataCare Uganda Limited • Finance & Payroll Administration
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
