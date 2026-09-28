import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  PenTool, 
  Clock, 
  DollarSign, 
  Calendar, 
  Download, 
  Printer, 
  ArrowRight,
  ShieldCheck,
  Building,
  Sparkles,
  Users,
  Upload,
  Paperclip,
  Edit3,
  FileCode,
  Eye,
  RefreshCw,
  Copy,
  BookOpen
} from 'lucide-react';
import { Candidate, OfferLetter, OnboardingDocumentTemplate } from '../../types';
import { ActiveView } from '../layout/Navbar';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import { DEFAULT_DOCUMENT_TEMPLATES, replaceTemplateTags } from '../../data/documentTemplatesData';
import {
  ViewShell, PageHeader, MetricGrid, MetricCard, TabPills, NotificationBanner, GRADIENTS,
} from '../ui/RecruitmentUI';
import { RichTextEditor, RichTextEditorHandle } from '../ui/RichTextEditor';

interface OfferManagementViewProps {
  candidates: Candidate[];
  offers: OfferLetter[];
  selectedCandidateForOffer?: Candidate | null;
  documentTemplates?: OnboardingDocumentTemplate[];
  onUpdateTemplates?: (templates: OnboardingDocumentTemplate[]) => void;
  onNavigate: (view: ActiveView) => void;
  onIssueOffer: (offer: OfferLetter) => void;
  onBatchIssueOffers?: (offers: OfferLetter[]) => void;
  onAcceptOffer: (offerId: string, signatureName: string) => void;
}

export const OfferManagementView: React.FC<OfferManagementViewProps> = ({
  candidates,
  offers,
  selectedCandidateForOffer,
  documentTemplates = DEFAULT_DOCUMENT_TEMPLATES,
  onUpdateTemplates,
  onNavigate,
  onIssueOffer,
  onBatchIssueOffers,
  onAcceptOffer,
}) => {
  // Main Mode: Individual Offer vs Batch Offer vs Document Management Hub
  const [offerMode, setOfferMode] = useState<'individual' | 'batch'>('individual');

  // Date helpers
  const formatDateToYMD = (dateStr?: string): string => {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) return dateStr.trim();
    const cleaned = dateStr.replace(/\s+/g, ' ').trim();
    const parsed = new Date(cleaned);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return '';
  };

  const formatYMDToDisplay = (ymdStr: string): string => {
    if (!ymdStr) return '';
    const [y, m, d] = ymdStr.split('-');
    if (!y || !m || !d) return ymdStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[parseInt(m, 10) - 1] || m;
    return `${d}-${monthName}-${y}`;
  };

  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    selectedCandidateForOffer?.id || candidates[0]?.id || 'c1'
  );

  const activeCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];
  const existingOffer = offers.find(o => o.candidateId === activeCandidate?.id);

  // Template vs Attachment Choice for Individual Offer
  const [documentSource, setDocumentSource] = useState<'template' | 'attachment'>(
    existingOffer?.documentSource || 'template'
  );
  const [attachedFileName, setAttachedFileName] = useState<string>(
    existingOffer?.attachedFileName || 'DataCare_Official_Appointment_Letter_2026.pdf'
  );
  const [attachedFileSize, setAttachedFileSize] = useState<string>(
    existingOffer?.attachedFileSize || '420 KB'
  );
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);

  // In-System Template Body
  const defaultLetterTemplate = documentTemplates.find(t => t.category === 'appointment_letter')?.templateBody || `DATACARE UGANDA LIMITED
Plot 14 Lumumba Avenue, Kampala • P.O. Box 7421, Kampala, Uganda
Ref: DC/HR/{YEAR}/OFR-{CANDIDATE_ID}

Date: {DATE}

To: {CANDIDATE_NAME}
Email: {CANDIDATE_EMAIL} • Phone: +{COUNTRY_CODE} {PHONE}
National Identification Number (NIN): {NATIONAL_ID}

RE: FORMAL OFFER OF APPOINTMENT AS {POSITION_UPPERCASE}

Dear {CANDIDATE_NAME},

Following your successful participation in our recruitment and selection process, including the technical assessments and final interview board evaluation, the Board of Directors and Management of DataCare Uganda Limited are pleased to offer you employment as {POSITION} under the following contractual terms:

1. POSITION AND DEPARTMENT:
   You will be appointed to the position of {POSITION} within the {DEPARTMENT} Department, reporting directly to {SUPERVISOR}.

2. REMUNERATION AND COMPENSATION PACKAGE:
   - Basic Monthly Gross Salary: UGX {SALARY}
   - Monthly Operational Allowances: UGX {ALLOWANCES}
   - Total Gross Monthly Remuneration: UGX {TOTAL_SALARY} (Subject to statutory PAYE and 5% employee NSSF deductions).

3. COMMENCEMENT AND TENURE:
   Your effective reporting date shall be {START_DATE}. This appointment is for a tenure of {CONTRACT_DURATION}, renewable upon mutual agreement and satisfactory performance appraisal.

4. PROBATIONARY PERIOD:
   You will serve a standard probationary period of {PROBATION_MONTHS} months from your commencement date, during which your performance and conduct will be reviewed.

5. BENEFITS AND STATUTORY COVENANTS:
   {SPECIAL_TERMS}

6. ACCEPTANCE OF OFFER:
   Please indicate your formal acceptance of this appointment by digitally counter-signing this letter in your candidate induction portal before {ACCEPTANCE_DEADLINE}.

Yours sincerely,

Dr. Arthur K.
Managing Director / Appointing Authority
DataCare Uganda Limited`;

  const [customTemplateBody, setCustomTemplateBody] = useState<string>(
    existingOffer?.customTemplateBody || defaultLetterTemplate
  );
  const [showCustomTemplateDrawer, setShowCustomTemplateDrawer] = useState(false);
  const customTemplateEditorRef = useRef<RichTextEditorHandle>(null);

  // Form states
  const [salary, setSalary] = useState(existingOffer?.basicSalary || '4,500,000');
  const [allowances, setAllowances] = useState(existingOffer?.allowances || '500,000');
  const [probationMonths, setProbationMonths] = useState(existingOffer?.probationMonths || 6);
  const [startDate, setStartDate] = useState(
    existingOffer?.startDate ? (formatDateToYMD(existingOffer.startDate) || existingOffer.startDate) : '2026-09-01'
  );
  const [expiryDate, setExpiryDate] = useState(
    existingOffer?.acceptanceDeadline ? (formatDateToYMD(existingOffer.acceptanceDeadline) || existingOffer.acceptanceDeadline) : '2026-08-25'
  );
  const [supervisor, setSupervisor] = useState(existingOffer?.reportingSupervisor || 'IT Manager');
  const [specialTerms, setSpecialTerms] = useState(
    existingOffer?.specialTerms || 
    'Standard medical health insurance coverage, 21 days annual leave entitlement, and compliance with company non-disclosure agreements.'
  );

  const [signatureInput, setSignatureInput] = useState('');
  const [showSignModal, setShowSignModal] = useState(false);
  const [showConfirmIssueModal, setShowConfirmIssueModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // ==========================================
  // BATCH OFFER ISSUANCE STATE
  // ==========================================
  const uniquePositions = Array.from(new Set(candidates.map(c => c.position))).filter(Boolean);
  const [batchPosition, setBatchPosition] = useState<string>(uniquePositions[0] || 'Lead Systems Architect');
  
  const batchEligibleCandidates = candidates.filter(c => 
    c.position === batchPosition && 
    c.status !== 'Rejected' && 
    c.status !== 'Offer Accepted' &&
    c.status !== 'Hired'
  );

  const [batchSelectedCandidateIds, setBatchSelectedCandidateIds] = useState<string[]>([]);
  const [batchDeliveryFormat, setBatchDeliveryFormat] = useState<'template' | 'attachment'>('template');
  const [batchAttachedFileName, setBatchAttachedFileName] = useState('DataCare_Standard_Appointment_Contract_Master.pdf');
  const [batchSalary, setBatchSalary] = useState('4,500,000');
  const [batchAllowances, setBatchAllowances] = useState('500,000');
  const [batchProbation, setBatchProbation] = useState(6);
  const [batchStartDate, setBatchStartDate] = useState('2026-09-01');
  const [batchExpiryDate, setBatchExpiryDate] = useState('2026-08-25');
  const [batchSupervisor, setBatchSupervisor] = useState('Department Head / Director');
  const [batchTerms, setBatchTerms] = useState('Standard medical health insurance coverage, 21 days annual leave entitlement, and compliance with company non-disclosure agreements.');
  const [showConfirmBatchModal, setShowConfirmBatchModal] = useState(false);

  // Sync batch selected candidate IDs when position changes
  React.useEffect(() => {
    const defaultSelected = candidates
      .filter(c => c.position === batchPosition && (c.status === 'Selected' || c.status === 'Interview Evaluated' || c.status === 'Interview Scheduled' || c.status === 'Pre-Shortlisted'))
      .map(c => c.id);
    setBatchSelectedCandidateIds(defaultSelected);
  }, [batchPosition, candidates]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAttachment(true);
    setTimeout(() => {
      setIsUploadingAttachment(false);
      setAttachedFileName(file.name);
      setAttachedFileSize(`${(file.size / 1024).toFixed(0)} KB`);
      setDocumentSource('attachment');
      setNotification(`✓ Uploaded "${file.name}" and attached to offer letter for ${activeCandidate.name}.`);
      setTimeout(() => setNotification(null), 4000);
    }, 600);
  };

  const handleToggleBatchCandidate = (candId: string) => {
    if (batchSelectedCandidateIds.includes(candId)) {
      setBatchSelectedCandidateIds(batchSelectedCandidateIds.filter(id => id !== candId));
    } else {
      setBatchSelectedCandidateIds([...batchSelectedCandidateIds, candId]);
    }
  };

  const handleSelectAllBatch = () => {
    if (batchSelectedCandidateIds.length === batchEligibleCandidates.length) {
      setBatchSelectedCandidateIds([]);
    } else {
      setBatchSelectedCandidateIds(batchEligibleCandidates.map(c => c.id));
    }
  };

  const handleConfirmBatchIssue = () => {
    setShowConfirmBatchModal(false);
    const selectedCands = candidates.filter(c => batchSelectedCandidateIds.includes(c.id));
    const newOffers: OfferLetter[] = selectedCands.map(cand => ({
      id: `offer-${cand.id}-${Date.now()}`,
      candidateId: cand.id,
      candidateName: cand.name,
      position: cand.position,
      department: cand.department || 'Operations',
      basicSalary: batchSalary,
      allowances: batchAllowances,
      startDate: batchStartDate ? formatYMDToDisplay(batchStartDate) : '01-Sep-2026',
      probationMonths: Number(batchProbation),
      reportingSupervisor: batchSupervisor,
      acceptanceDeadline: batchExpiryDate ? formatYMDToDisplay(batchExpiryDate) : '25-Aug-2026',
      specialTerms: batchTerms,
      documentSource: batchDeliveryFormat,
      attachedFileName: batchDeliveryFormat === 'attachment' ? batchAttachedFileName : undefined,
      attachedFileSize: batchDeliveryFormat === 'attachment' ? '520 KB' : undefined,
      status: 'Issued',
      issuedDate: '16-Aug-2026',
    }));

    if (onBatchIssueOffers) {
      onBatchIssueOffers(newOffers);
    } else {
      newOffers.forEach(o => onIssueOffer(o));
    }

    setNotification(`✓ Successfully generated and dispatched batch offer letters for ${selectedCands.length} candidate(s) for "${batchPosition}".`);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleInitiateIssueOffer = () => {
    setShowConfirmIssueModal(true);
  };

  const handleConfirmIssueOffer = () => {
    setShowConfirmIssueModal(false);
    const newOffer: OfferLetter = {
      id: existingOffer?.id || `offer-${Date.now()}`,
      candidateId: activeCandidate.id,
      candidateName: activeCandidate.name,
      position: activeCandidate.position,
      department: activeCandidate.department || 'Technology & Digital Transformation',
      basicSalary: salary,
      allowances,
      startDate: startDate ? formatYMDToDisplay(startDate) : '01-Sep-2026',
      probationMonths: Number(probationMonths),
      reportingSupervisor: supervisor,
      acceptanceDeadline: expiryDate ? formatYMDToDisplay(expiryDate) : '25-Aug-2026',
      specialTerms,
      documentSource,
      attachedFileName: documentSource === 'attachment' ? attachedFileName : undefined,
      attachedFileSize: documentSource === 'attachment' ? attachedFileSize : undefined,
      customTemplateBody: documentSource === 'template' ? customTemplateBody : undefined,
      status: 'Issued',
      issuedDate: '16-Aug-2026',
    };

    onIssueOffer(newOffer);
    setNotification(`✓ Official Offer Letter issued and sent to ${activeCandidate.name} (${activeCandidate.email}).`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSignOffer = () => {
    if (!signatureInput.trim()) {
      alert('Please type your legal full name to sign.');
      return;
    }
    if (existingOffer) {
      onAcceptOffer(existingOffer.id, signatureInput.trim());
      setShowSignModal(false);
      setNotification(`✓ Offer Letter accepted and digitally counter-signed by ${signatureInput}!`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const issuedOffersCount = offers.filter(o => o.status === 'Issued').length;
  const acceptedOffersCount = offers.filter(o => o.status === 'Accepted').length;
  const draftOffersCount = offers.filter(o => o.status === 'Draft' || o.status === 'Pending Approval').length;
  const declinedOffersCount = offers.filter(o => o.status === 'Declined' || o.status === 'Rejected').length;

  return (
    <ViewShell className="text-xs">
      <PageHeader
        badge="Offer & Onboarding"
        badgeColor="bg-slate-50 text-slate-700 border-slate-200"
        title="Offer Letters & Document Management"
        subtitle="Issue appointment letters, manage contract templates, and track candidate signatures."
        actions={
          <button type="button" onClick={() => onNavigate('new-staff-approval')} className="btn btn-primary">
            Approvals
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      />

      {notification && (
        <NotificationBanner message={notification} onDismiss={() => setNotification(null)} variant="success" />
      )}

      <MetricGrid cols="grid-cols-2 sm:grid-cols-4">
        <MetricCard label="Total Offers" value={offers.length} icon={FileText} gradient={GRADIENTS[0]} />
        <MetricCard label="Issued / Awaiting Sign" value={issuedOffersCount} icon={Send} gradient={GRADIENTS[3]} />
        <MetricCard label="Accepted" value={acceptedOffersCount} icon={CheckCircle2} gradient={GRADIENTS[1]} />
        <MetricCard label="Draft / Pending" value={draftOffersCount + declinedOffersCount} icon={Clock} gradient={GRADIENTS[4]} sublabel={declinedOffersCount > 0 ? `${declinedOffersCount} declined/rejected` : undefined} />
      </MetricGrid>

      <TabPills
        tabs={[
          { id: 'individual', label: 'Individual Offer', icon: FileText },
          { id: 'batch', label: 'Batch Offers', icon: Users },
        ]}
        active={offerMode}
        onChange={(id) => setOfferMode(id as 'individual' | 'batch')}
      />

      {/* ========================================================================= */}
      {/* MODE 2: BATCH OFFER ISSUANCE VIEW                                          */}
      {/* ========================================================================= */}
      {offerMode === 'batch' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#cbd5e1] rounded-sm p-4 text-xs shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2e8f0] pb-3">
              <div>
                <h3 className="font-bold text-xs text-[#0f4c81] uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#0284c7]" />
                  <span>Batch Candidate Offer Issuance by Position</span>
                </h3>
                <p className="text-[11px] text-gray-500">
                  Select a position and simultaneously dispatch uniform contracts to multiple selected applicants.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-semibold">Select Position:</span>
                <select
                  value={batchPosition}
                  onChange={(e) => setBatchPosition(e.target.value)}
                  className="bg-white border border-[#cbd5e1] rounded px-3 py-1.5 text-xs font-bold text-[#0f4c81] focus:ring-1 focus:ring-[#0284c7] focus:outline-none cursor-pointer"
                >
                  {uniquePositions.map(pos => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Batch Form + Candidates Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
              {/* Left 6 cols: Candidate Selection Roster */}
              <div className="lg:col-span-6 space-y-3 pr-0 lg:pr-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1e293b]">
                    Candidates for &quot;{batchPosition}&quot; ({batchEligibleCandidates.length} eligible)
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAllBatch}
                    className="text-[11px] text-[#0284c7] font-semibold hover:underline cursor-pointer"
                  >
                    {batchSelectedCandidateIds.length === batchEligibleCandidates.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="max-h-[380px] overflow-y-auto border border-[#e2e8f0] rounded divide-y divide-[#e2e8f0]">
                  {batchEligibleCandidates.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No candidates currently available for batch offer in this position.
                    </div>
                  ) : (
                    batchEligibleCandidates.map(c => {
                      const isChecked = batchSelectedCandidateIds.includes(c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => handleToggleBatchCandidate(c.id)}
                          className={`p-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${
                            isChecked ? 'bg-sky-50/70' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleBatchCandidate(c.id)}
                              className="rounded text-[#0284c7] cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div>
                              <div className="font-bold text-gray-900">{c.name}</div>
                              <div className="text-[11px] text-gray-500 font-mono">{c.email} • {c.phone}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-semibold border border-slate-200">
                              {c.status}
                            </span>
                            <div className="text-[10px] text-gray-400 mt-0.5">{c.educationLevel}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right 6 cols: Uniform Contract Parameters */}
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-[#1e293b] uppercase tracking-wider">
                    Remuneration & Document Delivery Mode
                  </h4>
                  
                  {/* Delivery Mode Toggle for Batch */}
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-300">
                    <button
                      type="button"
                      onClick={() => setBatchDeliveryFormat('template')}
                      className={`px-2 py-1 rounded text-[10.5px] font-bold ${
                        batchDeliveryFormat === 'template' ? 'bg-white text-[#0f4c81] shadow-2xs' : 'text-gray-600'
                      }`}
                    >
                      Dynamic Template
                    </button>
                    <button
                      type="button"
                      onClick={() => setBatchDeliveryFormat('attachment')}
                      className={`px-2 py-1 rounded text-[10.5px] font-bold ${
                        batchDeliveryFormat === 'attachment' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-gray-600'
                      }`}
                    >
                      Attach Master PDF
                    </button>
                  </div>
                </div>

                {batchDeliveryFormat === 'attachment' && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-emerald-700" />
                      <div>
                        <span className="font-bold text-emerald-950 block text-xs">{batchAttachedFileName}</span>
                        <span className="text-[10px] text-emerald-700">Will be attached to each applicant&apos;s portal</span>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">
                      Corporate Master
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Basic Monthly Salary (UGX) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={batchSalary}
                      onChange={(e) => setBatchSalary(e.target.value)}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none font-bold text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Allowances / Perks (UGX)
                    </label>
                    <input
                      type="text"
                      value={batchAllowances}
                      onChange={(e) => setBatchAllowances(e.target.value)}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Reporting Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={batchStartDate}
                      onChange={(e) => setBatchStartDate(e.target.value)}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none cursor-pointer font-medium text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Probation Period (Months)
                    </label>
                    <input
                      type="number"
                      value={batchProbation}
                      onChange={(e) => setBatchProbation(parseInt(e.target.value) || 6)}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Reporting Supervisor
                    </label>
                    <input
                      type="text"
                      value={batchSupervisor}
                      onChange={(e) => setBatchSupervisor(e.target.value)}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Acceptance Expiry Date
                    </label>
                    <input
                      type="date"
                      value={batchExpiryDate}
                      onChange={(e) => setBatchExpiryDate(e.target.value)}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none cursor-pointer font-medium text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Standard Contractual Terms Clause
                  </label>
                  <RichTextEditor
                    value={batchTerms}
                    onChange={setBatchTerms}
                    minHeight={80}
                    aria-label="Standard contractual terms clause"
                  />
                </div>

                <button
                  type="button"
                  disabled={batchSelectedCandidateIds.length === 0}
                  onClick={() => setShowConfirmBatchModal(true)}
                  className={`w-full py-2.5 rounded font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer ${
                    batchSelectedCandidateIds.length > 0
                      ? 'bg-[#16a34a] hover:bg-[#15803d] text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Generate & Issue Batch Offers ({batchSelectedCandidateIds.length} Selected)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Batch Confirmation Modal */}
          <ConfirmationModal
            isOpen={showConfirmBatchModal}
            title="Confirm Batch Offer Letter Issuance"
            subtitle={`You are about to issue ${batchSelectedCandidateIds.length} employment contracts for "${batchPosition}".`}
            variant="success"
            confirmText={`Confirm & Issue ${batchSelectedCandidateIds.length} Offers`}
            summaryItems={[
              {
                label: 'Position Title',
                value: batchPosition
              },
              {
                label: 'Delivery Mode',
                value: batchDeliveryFormat === 'attachment' ? `Master PDF (${batchAttachedFileName})` : 'Dynamic System Template'
              },
              {
                label: 'Total Selected Candidates',
                value: `${batchSelectedCandidateIds.length} applicants`
              },
              {
                label: 'Basic Monthly Salary',
                value: `UGX ${batchSalary}`
              },
              {
                label: 'Start Date',
                value: formatYMDToDisplay(batchStartDate)
              }
            ]}
            warningMessage="Each selected candidate will receive an official offer letter in their portal and notification email for digital signature."
            onConfirm={handleConfirmBatchIssue}
            onClose={() => setShowConfirmBatchModal(false)}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: INDIVIDUAL OFFER LETTER VIEW (WITH TEMPLATE / ATTACHMENT OPTIONS) */}
      {/* ========================================================================= */}
      {offerMode === 'individual' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left 5 Cols: Offer Letter Configuration Parameters */}
        <div className="lg:col-span-5 bg-white border border-[#cbd5e1] rounded-sm p-4 space-y-4 shadow-xs text-xs">
          <div className="border-b border-gray-200 pb-2 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs text-[#1e293b] uppercase tracking-wider">
                1. Offer Terms & Remuneration Package
              </h3>
              <p className="text-[11px] text-gray-500">Configure candidate remuneration, terms, and document format.</p>
            </div>
            
            <span className="text-[10px] bg-blue-50 text-[#0f4c81] font-bold px-2 py-0.5 rounded border border-blue-200">
              ProMISe HR
            </span>
          </div>

          {/* Candidate Selection */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Select Appointed Candidate <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCandidateId}
              onChange={(e) => {
                setSelectedCandidateId(e.target.value);
                const cand = candidates.find(c => c.id === e.target.value);
                if (cand) {
                  const off = offers.find(o => o.candidateId === cand.id);
                  if (off) {
                    setSalary(off.basicSalary || '4,500,000');
                    setAllowances(off.allowances || '500,000');
                    setStartDate(off.startDate);
                    setExpiryDate(off.acceptanceDeadline);
                    if (off.documentSource) setDocumentSource(off.documentSource);
                    if (off.attachedFileName) setAttachedFileName(off.attachedFileName);
                    if (off.customTemplateBody) setCustomTemplateBody(off.customTemplateBody);
                  }
                }
              }}
              className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs font-semibold text-[#0f4c81] focus:ring-1 focus:ring-[#0284c7] focus:outline-none cursor-pointer"
            >
              {candidates.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.position} ({c.status})
                </option>
              ))}
            </select>
          </div>

          {/* DOCUMENT DELIVERY MODE TOGGLE: Template vs Attachment */}
          <div className="bg-slate-50 border border-slate-300 rounded p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-gray-900 font-bold text-xs">
                Document Generation Method:
              </label>
              <span className="text-[10px] font-semibold text-[#0284c7]">
                {documentSource === 'template' ? 'Dynamic Text' : 'PDF File'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Option A: In-System Template */}
              <button
                type="button"
                onClick={() => setDocumentSource('template')}
                className={`p-2.5 rounded border text-left transition-all cursor-pointer ${
                  documentSource === 'template'
                    ? 'bg-white border-[#0284c7] ring-2 ring-blue-100 shadow-2xs'
                    : 'bg-white/60 border-gray-300 hover:bg-white text-gray-600'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <FileCode className={`w-4 h-4 ${documentSource === 'template' ? 'text-[#0284c7]' : 'text-gray-500'}`} />
                  <strong className="text-xs text-gray-900">Editable Template</strong>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Dynamic letter generated from system clauses & merge tags.
                </p>
              </button>

              {/* Option B: Upload/Attach File */}
              <button
                type="button"
                onClick={() => setDocumentSource('attachment')}
                className={`p-2.5 rounded border text-left transition-all cursor-pointer ${
                  documentSource === 'attachment'
                    ? 'bg-white border-emerald-600 ring-2 ring-emerald-100 shadow-2xs'
                    : 'bg-white/60 border-gray-300 hover:bg-white text-gray-600'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Upload className={`w-4 h-4 ${documentSource === 'attachment' ? 'text-emerald-600' : 'text-gray-500'}`} />
                  <strong className="text-xs text-gray-900">Attach Document</strong>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Upload official signed PDF or company contract file.
                </p>
              </button>
            </div>

            {/* Template Specific Actions */}
            {documentSource === 'template' && (
              <div className="pt-1 flex items-center justify-between border-t border-slate-200">
                <span className="text-[10.5px] text-gray-600">Standard DataCare Appointment Format</span>
                <button
                  type="button"
                  onClick={() => setShowCustomTemplateDrawer(true)}
                  className="text-[11px] text-[#0284c7] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Customize Template Text & Clauses</span>
                </button>
              </div>
            )}

            {/* Attachment Specific Upload Box */}
            {documentSource === 'attachment' && (
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between bg-white border border-emerald-300 rounded p-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-emerald-600" />
                    <div>
                      <strong className="text-gray-900 block text-xs truncate max-w-[170px]">{attachedFileName}</strong>
                      <span className="text-[10px] text-gray-500 font-mono">Size: {attachedFileSize}</span>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">
                    Ready to attach
                  </span>
                </div>

                <label className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload / Replace Attached PDF</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {isUploadingAttachment && (
                  <div className="text-[10.5px] text-emerald-800 font-bold flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Uploading attachment...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Offer Status & Governance Feedback Banner */}
          {existingOffer && (
            <div className={`p-3 rounded border text-xs space-y-1 ${
              existingOffer.status === 'Returned for Revision' ? 'bg-amber-50 border-amber-300 text-amber-900' :
              existingOffer.status === 'Rejected' ? 'bg-rose-50 border-rose-300 text-rose-900' :
              existingOffer.status === 'Issued' ? 'bg-sky-50 border-sky-300 text-sky-900' :
              existingOffer.status === 'Accepted' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
              'bg-slate-50 border-slate-300 text-slate-900'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>Current Status: {existingOffer.status}</span>
                {existingOffer.approvedBy && (
                  <span className="text-[10px] text-gray-500">Authorized by {existingOffer.approvedBy}</span>
                )}
              </div>
              {existingOffer.revisionNotes && (
                <p className="text-[11px] text-amber-800">
                  <strong>↩ Revision Notes from Executive Approver:</strong> {existingOffer.revisionNotes}
                </p>
              )}
              {existingOffer.rejectionReason && (
                <p className="text-[11px] text-rose-800">
                  <strong>✕ Rejection Rationale:</strong> {existingOffer.rejectionReason}
                </p>
              )}
            </div>
          )}

          {/* Remuneration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Basic Monthly Salary (UGX) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="4,500,000"
                className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none font-bold text-emerald-700"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Allowances / Perks (UGX)
              </label>
              <input
                type="text"
                value={allowances}
                onChange={(e) => setAllowances(e.target.value)}
                placeholder="500,000"
                className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
              />
            </div>
          </div>

          {/* Dates & Probation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-semibold mb-1 flex items-center justify-between">
                <span>Commencement Date <span className="text-red-500">*</span></span>
                {startDate && (
                  <span className="text-[10px] font-semibold text-[#0284c7]">
                    {formatYMDToDisplay(startDate)}
                  </span>
                )}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none cursor-pointer font-medium text-gray-800"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Probation Period (Months)
              </label>
              <input
                type="number"
                value={probationMonths}
                onChange={(e) => setProbationMonths(parseInt(e.target.value) || 6)}
                className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
              />
            </div>
          </div>

          {/* Reporting Manager & Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Reporting Supervisor
              </label>
              <input
                type="text"
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
                placeholder="e.g. IT Director"
                className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 flex items-center justify-between">
                <span>Acceptance Deadline</span>
                {expiryDate && (
                  <span className="text-[10px] font-semibold text-[#0284c7]">
                    {formatYMDToDisplay(expiryDate)}
                  </span>
                )}
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none cursor-pointer font-medium text-gray-800"
              />
            </div>
          </div>

          {/* Special terms */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Contractual Terms & Benefits Clause
            </label>
            <RichTextEditor
              value={specialTerms}
              onChange={setSpecialTerms}
              minHeight={90}
              aria-label="Contractual terms and benefits clause"
            />
          </div>

          {/* Action Trigger */}
          <div className="pt-2 border-t border-gray-200 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleInitiateIssueOffer}
              className="w-full py-2 bg-[#16a34a] hover:bg-[#15803d] text-white rounded font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Official Offer Letter to Applicant</span>
            </button>

            {existingOffer?.status === 'Issued' && (
              <button
                type="button"
                onClick={() => setShowSignModal(true)}
                className="w-full py-2 bg-[#0f4c81] hover:bg-[#1e3a8a] text-white rounded font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Simulate Candidate e-Signature & Acceptance</span>
              </button>
            )}

            {existingOffer?.status === 'Accepted' && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded text-center space-y-1">
                <span className="font-bold text-emerald-800 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Contract Signed & Formally Accepted!
                </span>
                <span className="text-[10px] text-gray-500 block font-mono">
                  Signee: {existingOffer.signedBy} • Hash: 0x9f4a...83d2
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('new-staff-orientation')}
                  className="mt-1 px-3 py-1 bg-[#0284c7] text-white rounded text-[11px] font-semibold hover:bg-[#0369a1] cursor-pointer"
                >
                  Proceed to Onboarding & Induction →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 7 Cols: Live Letter / Attachment Preview matching ProMISe ERP Typography */}
        <div className="lg:col-span-7 bg-white border border-[#cbd5e1] rounded-sm p-6 space-y-5 shadow-xs text-[#334155] text-xs">
          
          {/* Header Banner */}
          <div className="flex items-center justify-between border-b-2 border-[#1e293b] pb-4">
            <div>
              <h1 className="text-lg font-black text-[#1e293b] tracking-wider uppercase">
                DATACARE UGANDA LIMITED
              </h1>
              <p className="text-[11px] text-gray-500">
                Plot 14 Lumumba Avenue, Kampala • P.O. Box 7421, Kampala, Uganda
              </p>
              <p className="text-[10px] text-gray-400">
                ProMISe ERP Human Resource System — Ref: DC/HR/{activeCandidate?.id || '2026'}/OFR
              </p>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
              <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase inline-block ${
                existingOffer?.status === 'Accepted'
                  ? 'bg-emerald-100 text-emerald-800'
                  : existingOffer?.status === 'Issued'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {existingOffer?.status || 'Draft'}
              </span>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                documentSource === 'attachment'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
              }`}>
                {documentSource === 'attachment' ? 'Attached PDF Document' : 'In-System Template'}
              </span>
            </div>
          </div>

          {/* IF ATTACHMENT MODE: Show Embedded Document Preview Card */}
          {documentSource === 'attachment' ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/70 border-2 border-emerald-300 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">
                        {attachedFileName}
                      </h4>
                      <p className="text-[11px] text-gray-600">
                        Official corporate offer document uploaded for {activeCandidate.name}.
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-emerald-700 text-white rounded text-xs font-bold">
                    {attachedFileSize}
                  </span>
                </div>

                {/* Simulated In-Browser PDF Document Viewer */}
                <div className="bg-white border border-gray-300 rounded p-4 shadow-inner space-y-3 font-mono text-[11px]">
                  <div className="flex items-center justify-between border-b pb-2 text-gray-500 font-sans">
                    <span>Document Viewer: Page 1 of 2</span>
                    <span className="text-emerald-700 font-bold">✓ 256-Bit Encrypted Master PDF</span>
                  </div>
                  
                  <div className="space-y-2 text-gray-700 font-sans leading-relaxed">
                    <p className="font-bold text-sm text-[#0f4c81]">
                      OFFICIAL APPOINTMENT OF {activeCandidate.name.toUpperCase()} AS {activeCandidate.position.toUpperCase()}
                    </p>
                    <p>
                      This is an attached certified company PDF document detailing the remuneration package of <strong>UGX {salary}</strong> per month, reporting start date of <strong>{startDate}</strong>, and reporting to <strong>{supervisor}</strong>.
                    </p>
                    <div className="p-2.5 bg-slate-50 border rounded text-[11px]">
                      <strong>Terms & Benefits:</strong> {specialTerms}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-gray-500">
                    Candidate can review and download this PDF directly in their induction portal.
                  </span>
                  <button
                    type="button"
                    onClick={() => alert(`Downloading ${attachedFileName}...`)}
                    className="px-3 py-1 bg-white border border-emerald-400 hover:bg-emerald-50 text-emerald-800 rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Master PDF</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* IF TEMPLATE MODE: Letter Body */
            <div className="space-y-3 leading-relaxed text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded whitespace-pre-line font-sans text-gray-800 leading-relaxed">
                {replaceTemplateTags(customTemplateBody, activeCandidate, {
                  id: existingOffer?.id || 'temp-id',
                  candidateId: activeCandidate.id,
                  candidateName: activeCandidate.name,
                  position: activeCandidate.position,
                  department: activeCandidate.department || 'Operations',
                  basicSalary: salary,
                  allowances,
                  startDate: startDate ? formatYMDToDisplay(startDate) : '01-Sep-2026',
                  probationMonths: Number(probationMonths),
                  reportingSupervisor: supervisor,
                  acceptanceDeadline: expiryDate ? formatYMDToDisplay(expiryDate) : '25-Aug-2026',
                  specialTerms,
                  status: existingOffer?.status || 'Draft',
                  issuedDate: '16-Aug-2026'
                })}
              </div>
            </div>
          )}

          {/* Signature Block */}
          <div className="pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[11px] text-gray-500 block font-semibold">For DataCare Uganda Limited:</span>
              <div className="font-serif italic text-sm text-[#0f4c81] pt-1">Dr. Arthur K.</div>
              <p className="text-[11px] font-bold text-gray-700">Managing Director / Appointing Authority</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-gray-500 block font-semibold">Candidate Acceptance:</span>
              {existingOffer?.status === 'Accepted' ? (
                <div>
                  <div className="font-serif italic text-sm text-emerald-800 font-bold pt-1">
                    {existingOffer.signedBy}
                  </div>
                  <p className="text-[10px] text-emerald-700 font-mono">
                    ✓ Verified e-Signature ({existingOffer.signedDate})
                  </p>
                </div>
              ) : (
                <div className="h-9 border-b border-dashed border-gray-400 flex items-center text-gray-400 text-[11px] italic">
                  Awaiting candidate signature...
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-gray-700 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Letter</span>
            </button>
          </div>

        </div>

      </div>
      )}

      {/* CUSTOM TEMPLATE CLAUSES DRAWER MODAL */}
      {showCustomTemplateDrawer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-[#94a3b8]">
            <div className="bg-[#1e293b] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-sm">Customize Offer Letter Template Clauses</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomTemplateDrawer(false)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              <p className="text-gray-600">
                You can customize the text template for this offer letter. Dynamic tags like <code>{'{CANDIDATE_NAME}'}</code>, <code>{'{SALARY}'}</code>, <code>{'{START_DATE}'}</code> will be substituted automatically.
              </p>

              {/* Merge tag buttons */}
              <div className="bg-slate-50 border p-2 rounded flex flex-wrap gap-1">
                {['{CANDIDATE_NAME}', '{POSITION}', '{DEPARTMENT}', '{SALARY}', '{ALLOWANCES}', '{START_DATE}', '{SUPERVISOR}', '{PROBATION_MONTHS}'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => customTemplateEditorRef.current?.insertText(`${tag} `)}
                    className="px-2 py-0.5 bg-white border border-slate-300 text-[#0f4c81] rounded text-[10px] font-mono font-bold hover:bg-sky-50 cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              <RichTextEditor
                ref={customTemplateEditorRef}
                value={customTemplateBody}
                onChange={setCustomTemplateBody}
                minHeight={280}
                maxHeight={360}
                aria-label="Offer letter template body"
              />
            </div>

            <div className="bg-slate-50 border-t p-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCustomTemplateDrawer(false)}
                className="px-4 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded text-xs font-bold cursor-pointer"
              >
                Apply Custom Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Digital Signature Modal */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-[#94a3b8]">
            <div className="bg-[#1e293b] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm">Digital Offer Acceptance & Sign</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSignModal(false)}
                className="text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-blue-900">
                <strong className="block text-xs font-bold mb-1">
                  Candidate Acceptance Declaration:
                </strong>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  I, <strong>{activeCandidate?.name}</strong>, hereby formally accept the offer of employment as <strong>{activeCandidate?.position}</strong> at a gross basic salary of <strong>UGX {salary}</strong> per month, starting on <strong>{startDate}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Type Full Legal Name as Electronic Signature <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={signatureInput}
                  onChange={(e) => setSignatureInput(e.target.value)}
                  placeholder={activeCandidate?.name}
                  className="w-full bg-white border border-[#cbd5e1] rounded px-3 py-2 text-xs font-serif italic text-base focus:ring-1 focus:ring-[#0284c7] focus:outline-none text-[#0f4c81]"
                />
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input type="checkbox" id="terms-agree" defaultChecked className="mt-0.5 text-[#0284c7]" />
                <label htmlFor="terms-agree" className="text-[11px] text-gray-600">
                  I confirm that this electronic signature carries the full legal effect under the Uganda Electronic Signatures Act, 2011.
                </label>
              </div>
            </div>

            <div className="bg-[#f8fafc] border-t border-[#cbd5e1] px-4 py-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSignModal(false)}
                className="px-3 py-1.5 bg-white border border-[#cbd5e1] text-gray-700 rounded font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignOffer}
                className="px-4 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm & Sign Offer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmIssueModal}
        title="Confirm Dispatch of Employment Offer Letter"
        subtitle="You are about to issue a formal contract of employment to the selected candidate."
        variant="success"
        confirmText="Confirm & Dispatch Offer"
        summaryItems={[
          {
            label: 'Candidate Name',
            value: <span className="text-[#0f4c81] font-bold">{activeCandidate?.name}</span>
          },
          {
            label: 'Position Title',
            value: activeCandidate?.position
          },
          {
            label: 'Document Format',
            value: documentSource === 'attachment' ? `Attached PDF (${attachedFileName})` : 'Editable System Template'
          },
          {
            label: 'Basic Monthly Remuneration',
            value: <span className="font-bold text-emerald-800 font-mono">UGX {salary}</span>
          },
          {
            label: 'Monthly Allowances',
            value: <span className="font-mono text-gray-700">UGX {allowances}</span>
          },
          {
            label: 'Reporting Start Date',
            value: startDate ? formatYMDToDisplay(startDate) : '01-Sep-2026'
          },
          {
            label: 'Acceptance Expiration Deadline',
            value: expiryDate ? formatYMDToDisplay(expiryDate) : '25-Aug-2026'
          }
        ]}
        warningMessage="This generates a timestamped digital contract in the candidate's portal and notifies them via email for digital counter-signing."
        onConfirm={handleConfirmIssueOffer}
        onClose={() => setShowConfirmIssueModal(false)}
      />

    </ViewShell>
  );
};
