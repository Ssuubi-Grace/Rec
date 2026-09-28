import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  CreditCard, 
  BookOpen, 
  GraduationCap, 
  Building, 
  Download, 
  Printer, 
  ArrowRight, 
  CheckSquare, 
  Laptop, 
  AlertCircle, 
  UserCheck,
  ChevronRight,
  Eye,
  PenTool,
  Lock
} from 'lucide-react';
import { Candidate, OfferLetter, OnboardingTaskItem } from '../../types';
import { ContractSigningModal } from './ContractSigningModal';
import { NdaSigningModal } from './NdaSigningModal';
import { PayrollSubmissionModal, PayrollDetails } from './PayrollSubmissionModal';
import { HandbookAcknowledgmentModal } from './HandbookAcknowledgmentModal';
import { CertificatesVerificationModal } from './CertificatesVerificationModal';

interface CandidateOnboardingHubProps {
  candidate: Candidate;
  offer?: OfferLetter | null;
  onboardingTasks?: OnboardingTaskItem[];
  onToggleTask?: (taskId: string) => void;
  onOpenOfferModal: () => void;
  onAcceptOffer?: (offerId: string, signatureName: string) => void;
  onNavigateToPortal?: (screen: string) => void;
}

export const CandidateOnboardingHub: React.FC<CandidateOnboardingHubProps> = ({
  candidate,
  offer,
  onboardingTasks = [],
  onToggleTask,
  onOpenOfferModal,
  onAcceptOffer,
}) => {
  // Modal visibility states
  const [showContractModal, setShowContractModal] = useState(false);
  const [showNdaModal, setShowNdaModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [showHandbookModal, setShowHandbookModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  // Document Signing States
  const [contractSigned, setContractSigned] = useState<boolean>(() => {
    return offer?.status === 'Accepted' || candidate.status === 'Offer Accepted' || candidate.status === 'Orientation' || candidate.status === 'Hired';
  });
  const [contractSignedDate, setContractSignedDate] = useState<string>('16-Aug-2026');
  const [contractSignedBy, setContractSignedBy] = useState<string>(candidate.name);

  const [ndaSigned, setNdaSigned] = useState<boolean>(() => {
    return candidate.status === 'Orientation' || candidate.status === 'Hired';
  });
  const [ndaSignedDate, setNdaSignedDate] = useState<string>('16-Aug-2026');
  const [ndaSignedBy, setNdaSignedBy] = useState<string>(candidate.name);

  const [payrollData, setPayrollData] = useState<PayrollDetails>({
    bankName: 'Stanbic Bank Uganda Limited',
    bankBranch: 'Forest Mall Branch',
    accountNumber: '9030018823901',
    accountName: candidate.name,
    nssfNumber: '109283746501',
    tinNumber: '1004839201',
    nextOfKinName: 'Sarah Nalwanga Kintu',
    nextOfKinPhone: '+256 772 889900',
    nextOfKinRelationship: 'Spouse',
    isSubmitted: candidate.status === 'Orientation' || candidate.status === 'Hired',
    submittedDate: '16-Aug-2026'
  });

  const [handbookAcknowledged, setHandbookAcknowledged] = useState<boolean>(() => {
    return candidate.status === 'Orientation' || candidate.status === 'Hired';
  });
  const [handbookDate, setHandbookDate] = useState<string>('16-Aug-2026');
  const [handbookBy, setHandbookBy] = useState<string>(candidate.name);

  const [notification, setNotification] = useState<string | null>(null);

  // Handlers for document executions
  const handleSignContract = (legalName: string) => {
    setContractSigned(true);
    setContractSignedBy(legalName);
    setContractSignedDate('16-Aug-2026');
    if (offer && onAcceptOffer && offer.status !== 'Accepted') {
      onAcceptOffer(offer.id, legalName);
    }
    setNotification('✓ 2-Year Employment Contract digitally executed and added to employee file!');
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSignNda = (legalName: string) => {
    setNdaSigned(true);
    setNdaSignedBy(legalName);
    setNdaSignedDate('16-Aug-2026');
    setNotification('✓ Non-Disclosure Agreement (NDA) signed & security clearance active!');
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmitPayroll = (data: PayrollDetails) => {
    setPayrollData(data);
    setNotification('✓ Bank Account, NSSF & TIN numbers registered into payroll system!');
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAcknowledgeHandbook = (legalName: string) => {
    setHandbookAcknowledged(true);
    setHandbookBy(legalName);
    setHandbookDate('16-Aug-2026');
    setNotification('✓ Code of Conduct & Employee Handbook acknowledgment recorded!');
    setTimeout(() => setNotification(null), 5000);
  };

  // Calculate Induction Readiness Percentage
  const isOfferAccepted = offer?.status === 'Accepted' || candidate.status === 'Offer Accepted' || candidate.status === 'Orientation' || candidate.status === 'Hired';
  const checks = [
    isOfferAccepted,
    contractSigned,
    ndaSigned,
    payrollData.isSubmitted,
    handbookAcknowledged,
    true // Academic Credentials Verified
  ];
  const completedDocsCount = checks.filter(Boolean).length;
  const docProgressPct = Math.round((completedDocsCount / checks.length) * 100);

  // Filter or synthesize candidate orientation tasks
  const candidateTasks = onboardingTasks.filter(t => t.candidateId === candidate.id);
  const displayTasks: OnboardingTaskItem[] = candidateTasks.length > 0 ? candidateTasks : [
    {
      id: 'task-1',
      candidateId: candidate.id,
      taskName: 'Official Appointment Offer Letter Signed & Verified',
      category: 'Documentation',
      isMandatory: true,
      completed: isOfferAccepted,
      status: isOfferAccepted ? 'Completed' : 'Pending',
      assignedRole: 'Candidate & HR Officer',
      assignedOfficer: 'Sarah Namubiru (HR Officer)'
    },
    {
      id: 'task-2',
      candidateId: candidate.id,
      taskName: '2-Year Fixed Term Employment Contract & NDA Executed',
      category: 'Documentation',
      isMandatory: true,
      completed: contractSigned && ndaSigned,
      status: (contractSigned && ndaSigned) ? 'Completed' : 'Pending',
      assignedRole: 'Candidate & Legal Affairs',
      assignedOfficer: 'Sarah Namubiru (HR Lead)'
    },
    {
      id: 'task-3',
      candidateId: candidate.id,
      taskName: 'Bank Account & NSSF / TIN Number Submission for Payroll Setup',
      category: 'Finance & Payroll',
      isMandatory: true,
      completed: payrollData.isSubmitted,
      status: payrollData.isSubmitted ? 'Completed' : 'Pending',
      assignedRole: 'Candidate & Payroll Manager',
      assignedOfficer: 'Ronald Kafeero (Payroll Lead)'
    },
    {
      id: 'task-4',
      candidateId: candidate.id,
      taskName: 'Corporate Email & ProMISe ERP System Role Provisioning',
      category: 'IT & Workspace',
      isMandatory: true,
      completed: true,
      status: 'Completed',
      assignedRole: 'I.T Helpdesk (Paul Okello)',
      assignedOfficer: 'Paul Okello (IT Helpdesk)'
    },
    {
      id: 'task-5',
      candidateId: candidate.id,
      taskName: 'Corporate Laptop Asset Issuance & Security Key Installation',
      category: 'IT & Workspace',
      isMandatory: true,
      completed: candidate.status === 'Hired',
      status: candidate.status === 'Hired' ? 'Completed' : 'Pending',
      assignedRole: 'I.T Helpdesk (Paul Okello)',
      assignedOfficer: 'Paul Okello (IT Helpdesk)'
    },
    {
      id: 'task-6',
      candidateId: candidate.id,
      taskName: 'Company Culture, Code of Conduct & HR Policy Briefing',
      category: 'HR Induction',
      isMandatory: true,
      completed: handbookAcknowledged,
      status: handbookAcknowledged ? 'Completed' : 'Pending',
      assignedRole: 'Sarah Namubiru (HR Lead)',
      assignedOfficer: 'Sarah Namubiru (HR Lead)'
    },
    {
      id: 'task-7',
      candidateId: candidate.id,
      taskName: 'Departmental Head Introduction & 90-Day KPI Goal Setting',
      category: 'Departmental Orientation',
      isMandatory: true,
      completed: candidate.status === 'Hired',
      status: candidate.status === 'Hired' ? 'Completed' : 'Pending',
      assignedRole: 'Department Head / Supervisor',
      assignedOfficer: 'David Byamukama (HOD)'
    }
  ];

  return (
    <div className="space-y-6 text-xs animate-in fade-in">
      
      {/* Toast Notification */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {notification}
          </span>
          <button onClick={() => setNotification(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* Inductee Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-[#0369a1] via-[#0f4c81] to-[#1e293b] text-white p-6 rounded-sm shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-400 text-emerald-950 font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                New Staff Induction Suite
              </span>
              <span className="text-sky-200 text-xs font-mono">
                Staff Ref: DC-EMP-2026-{candidate.id.toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Welcome to DataCare Uganda, {candidate.name}!
            </h2>
            <p className="text-xs text-sky-100 max-w-2xl">
              You are being onboarded as <strong>{offer?.position || candidate.position}</strong> in the <strong>{offer?.department || candidate.department}</strong> Department. Complete the mandatory document sign-offs and induction actions below to finalize your employment records and payroll setup.
            </p>
          </div>

          {/* Overall Readiness Meter */}
          <div className="bg-white/10 backdrop-blur-xs border border-white/20 p-4 rounded min-w-[220px] text-center space-y-2 shrink-0">
            <span className="text-[10px] uppercase font-bold text-sky-200 tracking-wider block">
              Onboarding Readiness
            </span>
            <div className="text-3xl font-black text-emerald-400 font-mono">
              {docProgressPct}%
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${docProgressPct}%` }}
              />
            </div>
            <span className="text-[10px] text-sky-100 block">
              {completedDocsCount} of {checks.length} Onboarding Requirements Complete
            </span>
          </div>
        </div>

        {/* Quick Profile Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/15 text-[11px]">
          <div className="bg-black/20 p-2 rounded">
            <span className="text-sky-200 block text-[10px]">Reporting Date:</span>
            <strong className="text-white">{offer?.startDate || candidate.offerDetails?.startDate || '01-Sep-2026'}</strong>
          </div>
          <div className="bg-black/20 p-2 rounded">
            <span className="text-sky-200 block text-[10px]">Reporting Supervisor:</span>
            <strong className="text-white">{offer?.reportingSupervisor || 'Managing Director / HOD'}</strong>
          </div>
          <div className="bg-black/20 p-2 rounded">
            <span className="text-sky-200 block text-[10px]">National ID / NIN:</span>
            <strong className="text-white font-mono">{candidate.nationalId || 'CM96023412X98A'}</strong>
          </div>
          <div className="bg-black/20 p-2 rounded">
            <span className="text-sky-200 block text-[10px]">Contract Duration:</span>
            <strong className="text-white">{offer?.contractDuration || '2 Years (Renewable)'}</strong>
          </div>
        </div>
      </div>

      {/* Section 1: Candidate Document Execution Hub */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <div>
            <h3 className="font-bold text-sm text-[#0f4c81] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0284c7]" />
              <span>Mandatory Legal & Employment Documents (Self-Sign Off)</span>
            </h3>
            <p className="text-[11px] text-gray-500">
              Read, verify, and electronically sign all compliance documents. You can also download copies for your records.
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            {completedDocsCount}/{checks.length} Completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Card 1: Official Offer Letter */}
          <div className={`p-4 rounded-sm border shadow-xs flex flex-col justify-between space-y-3 transition-all ${
            isOfferAccepted ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-blue-300 ring-1 ring-blue-100'
          }`}>
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded bg-blue-100 text-[#0284c7] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isOfferAccepted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isOfferAccepted ? '✓ Accepted & Signed' : 'Pending Signature'}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">
                  1. Official Appointment Letter
                </h4>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
              <span className="text-[10px] text-gray-500 font-mono">
                {isOfferAccepted ? 'Signed 16-Aug-2026' : 'Action Required'}
              </span>
              <button
                type="button"
                onClick={onOpenOfferModal}
                className="px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isOfferAccepted ? 'View Offer Letter' : 'Review & Sign'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Employment Contract (2 Years) */}
          <div className={`p-4 rounded-sm border shadow-xs flex flex-col justify-between space-y-3 transition-all ${
            contractSigned ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-indigo-300 ring-1 ring-indigo-100'
          }`}>
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <PenTool className="w-4 h-4" />
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  contractSigned ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {contractSigned ? '✓ Executed & Signed' : 'Pending E-Sign'}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">
                  2. 2-Year Employment Contract
                </h4>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
              <span className="text-[10px] text-gray-500 font-mono">
                {contractSigned ? `Signed: ${contractSignedDate}` : 'E-Signature Required'}
              </span>
              <button
                type="button"
                onClick={() => setShowContractModal(true)}
                className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs ${
                  contractSigned 
                    ? 'bg-white border border-gray-300 text-gray-700 hover:bg-slate-50' 
                    : 'bg-indigo-700 hover:bg-indigo-800 text-white'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>{contractSigned ? 'View & Download Contract' : 'Review & E-Sign'}</span>
              </button>
            </div>
          </div>

          {/* Card 3: Non-Disclosure Agreement (NDA) */}
          <div className={`p-4 rounded-sm border shadow-xs flex flex-col justify-between space-y-3 transition-all ${
            ndaSigned ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-slate-400 ring-1 ring-slate-200'
          }`}>
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded bg-slate-100 text-slate-800 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  ndaSigned ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {ndaSigned ? '✓ Signed & Enforced' : 'Pending Signature'}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">
                  3. Non-Disclosure Agreement (NDA)
                </h4>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
              <span className="text-[10px] text-gray-500 font-mono">
                {ndaSigned ? `Signed: ${ndaSignedDate}` : 'Compliance Prerequisite'}
              </span>
              <button
                type="button"
                onClick={() => setShowNdaModal(true)}
                className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs ${
                  ndaSigned 
                    ? 'bg-white border border-gray-300 text-gray-700 hover:bg-slate-50' 
                    : 'bg-slate-900 hover:bg-black text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{ndaSigned ? 'View & Download NDA' : 'Review & E-Sign NDA'}</span>
              </button>
            </div>
          </div>

          {/* Card 4: Bank, NSSF & TIN Submission */}
          <div className={`p-4 rounded-sm border shadow-xs flex flex-col justify-between space-y-3 transition-all ${
            payrollData.isSubmitted ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-emerald-300 ring-1 ring-emerald-100'
          }`}>
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  payrollData.isSubmitted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {payrollData.isSubmitted ? '✓ Enrolled in Payroll' : 'Pending Submission'}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">
                  4. Bank Account, NSSF & TIN Form
                </h4>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
              <span className="text-[10px] text-gray-500 font-mono">
                {payrollData.isSubmitted ? `${payrollData.bankName.split(' ')[0]} Bank` : 'Required for Salary'}
              </span>
              <button
                type="button"
                onClick={() => setShowPayrollModal(true)}
                className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs ${
                  payrollData.isSubmitted
                    ? 'bg-white border border-gray-300 text-gray-700 hover:bg-slate-50'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>{payrollData.isSubmitted ? 'Edit / View Banking' : 'Submit Bank Details'}</span>
              </button>
            </div>
          </div>

          {/* Card 5: Code of Conduct & Handbook */}
          <div className={`p-4 rounded-sm border shadow-xs flex flex-col justify-between space-y-3 transition-all ${
            handbookAcknowledged ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-purple-300 ring-1 ring-purple-100'
          }`}>
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded bg-purple-100 text-purple-800 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  handbookAcknowledged ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {handbookAcknowledged ? '✓ Acknowledged' : 'Action Required'}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">
                  5. Code of Conduct & HR Handbook
                </h4>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
              <span className="text-[10px] text-gray-500 font-mono">
                {handbookAcknowledged ? `Acknowledged: ${handbookDate}` : 'Policy Briefing'}
              </span>
              <button
                type="button"
                onClick={() => setShowHandbookModal(true)}
                className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs ${
                  handbookAcknowledged
                    ? 'bg-white border border-gray-300 text-gray-700 hover:bg-slate-50'
                    : 'bg-purple-800 hover:bg-purple-900 text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{handbookAcknowledged ? 'View Handbook' : 'Acknowledge Policy'}</span>
              </button>
            </div>
          </div>

          {/* Card 6: Academic & Identity Verification */}
          <div className="p-4 rounded-sm border border-emerald-300 bg-emerald-50/50 shadow-xs flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded bg-teal-100 text-teal-800 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  ✓ Verified by HR
                </span>
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">
                  6. Academic Transcripts & NIN Records
                </h4>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
              <span className="text-[10px] text-emerald-800 font-mono font-bold">
                100% Cleared
              </span>
              <button
                type="button"
                onClick={() => setShowCertModal(true)}
                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-slate-50 rounded text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Verification Records</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Real-Time Departmental Induction Roadmap */}
      <div className="bg-white border border-[#cbd5e1] rounded-sm p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
          <div>
            <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Departmental Orientation & Provisioning Roadmap ({displayTasks.length} Milestones)</span>
            </h3>
            <p className="text-[11px] text-gray-500">
              Live progress tracking across Human Resources, IT Workspace, Finance, and Departmental Supervision.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-600">
              Assigned Supervisor: <strong>{offer?.reportingSupervisor || 'David Byamukama (HOD)'}</strong>
            </span>
          </div>
        </div>

        {/* Task Table */}
        <div className="space-y-2.5">
          {displayTasks.map((t, idx) => {
            const isDone = !!t.completed;
            return (
              <div
                key={t.id || `task-${idx}`}
                className={`p-3 rounded border flex items-center justify-between gap-3 transition-colors ${
                  isDone 
                    ? 'bg-emerald-50/70 border-emerald-200' 
                    : 'bg-white border-gray-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                    isDone ? 'bg-emerald-600 text-white' : 'border-2 border-gray-300 bg-white'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="text-[10px] text-gray-400 font-bold">{idx + 1}</span>}
                  </div>
                  <div>
                    <h5 className={`font-bold text-xs ${isDone ? 'text-emerald-950 line-through opacity-85' : 'text-gray-900'}`}>
                      {t.taskName || t.title}
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                      <span className="font-semibold text-gray-700">{t.category}</span>
                      <span>•</span>
                      <span>Responsible Officer: <strong className="text-gray-800">{t.assignedOfficer || t.assignedRole || 'HR / IT Lead'}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-gray-700'
                  }`}>
                    {isDone ? '✓ Completed' : 'In Progress'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#0284c7]" />
            <span>Need assistance with onboarding logistics? Contact DataCare HR Helpdesk at <strong>hr@datacare.co.ug</strong> or extension <strong>401</strong>.</span>
          </span>
          <span className="font-mono font-bold text-blue-800 hidden sm:inline">Kampala HQ</span>
        </div>
      </div>

      {/* Modals */}
      <ContractSigningModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        candidate={candidate}
        offer={offer}
        isSigned={contractSigned}
        signedDate={contractSignedDate}
        signedBy={contractSignedBy}
        onSign={handleSignContract}
      />

      <NdaSigningModal
        isOpen={showNdaModal}
        onClose={() => setShowNdaModal(false)}
        candidate={candidate}
        isSigned={ndaSigned}
        signedDate={ndaSignedDate}
        signedBy={ndaSignedBy}
        onSign={handleSignNda}
      />

      <PayrollSubmissionModal
        isOpen={showPayrollModal}
        onClose={() => setShowPayrollModal(false)}
        candidate={candidate}
        payrollData={payrollData}
        onSubmit={handleSubmitPayroll}
      />

      <HandbookAcknowledgmentModal
        isOpen={showHandbookModal}
        onClose={() => setShowHandbookModal(false)}
        candidate={candidate}
        isAcknowledged={handbookAcknowledged}
        acknowledgedDate={handbookDate}
        acknowledgedBy={handbookBy}
        onAcknowledge={handleAcknowledgeHandbook}
      />

      <CertificatesVerificationModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        candidate={candidate}
      />

    </div>
  );
};
