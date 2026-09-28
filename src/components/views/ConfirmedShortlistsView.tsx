import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  UserCheck, 
  Search, 
  Filter, 
  BrainCircuit, 
  Archive, 
  Mail, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  ChevronLeft,
  Users,
  Eye,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  CheckSquare,
  FileCheck,
  Award
} from 'lucide-react';
import { Candidate, Requisition } from '../../types';
import { ActiveView } from '../layout/Navbar';
import { CandidateDetailModal } from '../modals/CandidateDetailModal';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import { useToast } from '../../context/ToastContext';
import { ViewShell, PageHeader, MetricGrid, NotificationBanner } from '../ui/RecruitmentUI';
import { DashboardKpiCard } from '../ui/DashboardKpiCard';
import { SearchableSelect } from '../ui/SearchableSelect';
import { EditShortlistScheduleModal } from '../modals/EditShortlistScheduleModal';

interface ConfirmedShortlistsViewProps {
  candidates: Candidate[];
  requisitions: Requisition[];
  targetRequisitionId?: string;
  targetCandidateId?: string;
  onNavigate: (view: ActiveView, param?: string) => void;
  onAdvanceToInterview: (candidateId: string) => void;
  onTransferToTalentPool: (candidate: Candidate) => void;
  onScheduleInterview?: (candidateId: string, date: string, time: string, venue: string, sendInvite: boolean) => void;
  onBatchInviteInterview?: (invitations: { candidateId: string; date: string; time: string; venue: string }[]) => void;
}

export const ConfirmedShortlistsView: React.FC<ConfirmedShortlistsViewProps> = ({
  candidates,
  requisitions,
  targetRequisitionId,
  targetCandidateId,
  onNavigate,
  onAdvanceToInterview,
  onTransferToTalentPool,
  onScheduleInterview,
  onBatchInviteInterview,
}) => {
  // Modes: 'edit-shortlist', 'list', or 'authority-approval'
  const [mode, setMode] = useState<'edit-shortlist' | 'list' | 'authority-approval'>('edit-shortlist');
  const [selectedReqId, setSelectedReqId] = useState<string>(() => {
    return targetRequisitionId || requisitions[0]?.id || 'req-1';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [viewCandidate, setViewCandidate] = useState<Candidate | null>(null);
  const [isScheduleWizardOpen, setIsScheduleWizardOpen] = useState(false);

  const { showSuccess, showWarning, showInfo } = useToast();

  // Shortlist Approval Authority state
  const [shortlistApprovals, setShortlistApprovals] = useState<Record<string, {
    isApproved: boolean;
    approvedBy: string;
    approvedAt: string;
    role: string;
    comments: string;
  }>>({
    'req-1': {
      isApproved: true,
      approvedBy: 'Dr. Sarah Namubiru',
      approvedAt: '16 Aug 2026, 09:45 AM',
      role: 'Director Human Capital & Governance',
      comments: 'Shortlist verified against approved headcount budget and qualification benchmarks. Cleared for interview invitations.'
    }
  });

  // Sync selectedReqId when targetRequisitionId changes from navigation
  useEffect(() => {
    if (targetRequisitionId) {
      setSelectedReqId(targetRequisitionId);
    }
  }, [targetRequisitionId]);

  // Active Requisition for Edit Short List form
  const activeReq = requisitions.find(r => r.id === selectedReqId) || requisitions[0] || {
    id: 'req-1',
    reqNo: 'REQ/2026/001',
    department: 'Technology & Systems',
    position: 'Lead Systems Architect',
    salaryScale: '4A Senior',
    reportsTo: 'Director of Human Capital',
    dateOfReporting: '01 -Sep -2026',
    budget: '5,500,000',
    currency: 'UGX',
    vacancies: 2,
  };

  // Edit Short List draft rows state
  interface ShortlistRow {
    candidateId: string;
    interviewDate: string;
    interviewTime: string;
    venue: string;
    inviteChecked: boolean;
  }

  // Candidates belonging to the active requisition
  const activeReqCandidates = candidates.filter(c => c.requisitionId === activeReq.id);

  const [shortlistRows, setShortlistRows] = useState<ShortlistRow[]>(() => {
    return activeReqCandidates.map(c => ({
      candidateId: c.id,
      interviewDate: c.interviewDate || '2026-08-28',
      interviewTime: c.interviewTime || '09:30 AM',
      venue: c.interviewVenue || 'Main Boardroom - Level 4, Head Office, Kampala',
      inviteChecked: c.interviewInvited ?? (c.status === 'Interview Scheduled' || c.status === 'Pre-Shortlisted' || c.status === 'ShortListed'),
    }));
  });

  // Re-synchronize shortlistRows when selectedReqId or candidates list changes
  useEffect(() => {
    const cands = candidates.filter(c => c.requisitionId === activeReq.id);
    setShortlistRows(
      cands.map(c => ({
        candidateId: c.id,
        interviewDate: c.interviewDate || '2026-08-28',
        interviewTime: c.interviewTime || '09:30 AM',
        venue: c.interviewVenue || 'Main Boardroom - Level 4, Head Office, Kampala',
        inviteChecked: c.interviewInvited ?? (c.status === 'Interview Scheduled' || c.status === 'Pre-Shortlisted' || c.status === 'ShortListed'),
      }))
    );
  }, [selectedReqId, candidates, activeReq.id]);

  // Sync rows when active requisition changes
  const handleReqChange = (reqId: string) => {
    setSelectedReqId(reqId);
  };

  const handleAddCandidateRow = () => {
    const unselected = activeReqCandidates.find(c => !shortlistRows.some(r => r.candidateId === c.id)) || 
      candidates.find(c => !shortlistRows.some(r => r.candidateId === c.id)) || candidates[0];
    if (unselected) {
      setShortlistRows([
        ...shortlistRows,
        {
          candidateId: unselected.id,
          interviewDate: '2026-08-28',
          interviewTime: '11:00 AM',
          venue: 'Main Boardroom - Level 4, Head Office, Kampala',
          inviteChecked: true,
        }
      ]);
    }
  };

  const handleRemoveRow = (index: number) => {
    setShortlistRows(shortlistRows.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index: number, updates: Partial<ShortlistRow>) => {
    const updated = [...shortlistRows];
    updated[index] = { ...updated[index], ...updates };
    setShortlistRows(updated);
  };

  // Confirmation Modals State
  const [showConfirmInviteModal, setShowConfirmInviteModal] = useState(false);
  const [showConfirmApprovalModal, setShowConfirmApprovalModal] = useState(false);

  // Toggle All / Invite All action
  const allChecked = shortlistRows.length > 0 && shortlistRows.every(r => r.inviteChecked);
  
  const handleToggleInviteAll = () => {
    const nextState = !allChecked;
    setShortlistRows(shortlistRows.map(r => ({ ...r, inviteChecked: nextState })));
  };

  // Submit and Invite action (dispatches email and updates Candidate Portal)
  const handleInitiateSendInterviewInvitations = () => {
    const toInvite = shortlistRows.filter(r => r.inviteChecked);
    if (toInvite.length === 0) {
      showWarning('Please check at least one candidate to invite for interview, or click "Invite All".', 'No Candidates Selected');
      return;
    }
    setShowConfirmInviteModal(true);
  };

  const handleExecuteSendInterviewInvitations = () => {
    setShowConfirmInviteModal(false);
    const toInvite = shortlistRows.filter(r => r.inviteChecked);

    if (onBatchInviteInterview) {
      onBatchInviteInterview(toInvite);
    } else if (onScheduleInterview) {
      toInvite.forEach(item => {
        onScheduleInterview(item.candidateId, item.interviewDate, item.interviewTime, item.venue, true);
      });
    }

    showSuccess(`Interview invitations dispatched to ${toInvite.length} candidate(s)! Details are synchronized with their Candidate Portal tracker.`, 'Invitations Dispatched');
  };

  const handleSaveDraft = () => {
    if (onScheduleInterview) {
      shortlistRows.forEach(item => {
        onScheduleInterview(item.candidateId, item.interviewDate, item.interviewTime, item.venue, item.inviteChecked);
      });
    }
    showSuccess('Short-list draft schedule saved successfully.', 'Draft Saved');
  };

  const handleInitiateApproveShortlist = () => {
    setShowConfirmApprovalModal(true);
  };

  const handleExecuteApproveShortlist = () => {
    setShowConfirmApprovalModal(false);
    setShortlistApprovals(prev => ({
      ...prev,
      [selectedReqId]: {
        isApproved: true,
        approvedBy: 'Director Human Capital & Governance (Executive)',
        approvedAt: new Date().toLocaleString(),
        role: 'Executive Sign-Off Authority',
        comments: 'Shortlist ratified & approved for formal interview panel execution.'
      }
    }));
    showSuccess('Confirmed Shortlist officially signed off and approved by Governance Authority!', 'Shortlist Approved');
  };

  // Candidates for List mode
  const listCandidates = candidates.filter(c => {
    const matchesReq = selectedReqId === '-All-' || c.requisitionId === selectedReqId;
    const matchesSearch = searchTerm === '' || 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isValidStage = ['Pre-Shortlisted', 'ShortListed', 'Interview Scheduled', 'Selected', 'Offer Issued', 'Offer Accepted', 'Orientation', 'Hired'].includes(c.status);
    return matchesReq && matchesSearch && isValidStage;
  });

  const currentApproval = shortlistApprovals[selectedReqId];

  const requisitionSelectOptions = requisitions.map(r => ({
    value: r.id,
    label: `${r.reqNo} - ${r.position} (${r.department})`,
    searchText: `${r.reqNo} ${r.position} ${r.department}`,
  }));

  const listFilterOptions = [
    { value: '-All-', label: '-All Positions-' },
    ...requisitions.map(r => ({
      value: r.id,
      label: `${r.position} (${r.department})`,
      searchText: `${r.position} ${r.department} ${r.reqNo}`,
    })),
  ];

  const inviteCount = shortlistRows.filter(r => r.inviteChecked).length;

  return (
    <ViewShell>
      <PageHeader
        badge="Step 3 • Confirmed Shortlists"
        badgeColor="bg-violet-50 text-violet-700 border-violet-200"
        title={mode === 'edit-shortlist' ? 'Edit Short List & Schedule' : mode === 'authority-approval' ? 'Shortlist Authority Sign-Off' : 'Confirmed Shortlists Directory'}
        subtitle={
          mode === 'edit-shortlist'
            ? 'Schedule panel interview slots, bulk dispatch invitations, and track candidate RSVPs.'
            : mode === 'authority-approval'
            ? 'Executive sign-off and compliance verification before interview panels.'
            : 'Validated candidates confirmed for formal panel assessment.'
        }
        actions={
          <>
            <button type="button" onClick={() => { setMode('edit-shortlist'); setIsScheduleWizardOpen(true); }} className={`btn ${mode === 'edit-shortlist' ? 'btn-primary' : 'btn-secondary'}`}>1. Schedule</button>
            <button type="button" onClick={() => setMode('authority-approval')} className={`btn ${mode === 'authority-approval' ? 'btn-primary' : 'btn-secondary'}`}><ShieldCheck className="w-4 h-4" />2. Approval</button>
            <button type="button" onClick={() => setMode('list')} className={`btn ${mode === 'list' ? 'btn-primary' : 'btn-secondary'}`}>3. Directory</button>
            <button type="button" onClick={() => onNavigate('final-interview')} className="btn btn-primary btn-lg">Interview Board <ArrowRight className="w-4 h-4" /></button>
          </>
        }
      />

      <MetricGrid cols="grid-cols-2 sm:grid-cols-4">
        <DashboardKpiCard title="Shortlisted" value={activeReqCandidates.length} icon={Users} theme="purple" footer={<span className="text-violet-600 font-semibold">Confirmed for {activeReq.position}</span>} />
        <DashboardKpiCard title="Invites Pending" value={inviteCount} icon={Mail} theme="cyan" footer={<><span className="text-cyan-600 font-semibold">{inviteCount}</span> marked for email & portal dispatch</>} />
        <DashboardKpiCard title="Authority Approved" value={currentApproval?.isApproved ? 'Yes' : 'Pending'} icon={ShieldCheck} theme="green" footer={currentApproval?.isApproved ? <span className="text-emerald-600 font-semibold">Cleared for interview panel</span> : <span>Awaiting governance sign-off</span>} />
        <DashboardKpiCard title="Vacancies" value={activeReq.vacancies} icon={Award} theme="blue" footer={<span>Open headcount on this requisition</span>} />
      </MetricGrid>

      {notificationMsg && (
        <NotificationBanner message={notificationMsg} onDismiss={() => setNotificationMsg(null)} />
      )}

      {/* Requisition Details Card (always visible for context) */}
      <div className="page-card p-4 text-xs space-y-3 app-form">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e2e8f0] pb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xs text-[#0f4c81] uppercase tracking-wider">
              Requisition Details
            </h3>
            {currentApproval?.isApproved && (
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Shortlist Approved by Authority
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:min-w-[280px]">
            <span className="text-gray-500 font-semibold text-[11px] shrink-0">Select Position:</span>
            <SearchableSelect
              value={selectedReqId}
              onChange={handleReqChange}
              options={requisitionSelectOptions}
              pill
              searchPlaceholder="Search requisition, position, department…"
              className="min-w-[220px] flex-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-[11px]">
          <div>
            <span className="text-gray-500 block">Department:</span>
            <strong className="text-gray-800">{activeReq.department}</strong>
          </div>
          <div>
            <span className="text-gray-500 block">Position:</span>
            <strong className="text-gray-800">{activeReq.position}</strong>
          </div>
          <div>
            <span className="text-gray-500 block">Salary Scale:</span>
            <strong className="text-gray-800">{activeReq.salaryScale}</strong>
          </div>
          <div>
            <span className="text-gray-500 block">Reports To:</span>
            <strong className="text-gray-800">{activeReq.reportsTo}</strong>
          </div>
          <div>
            <span className="text-gray-500 block">Date Of Reporting:</span>
            <strong className="text-gray-800">{activeReq.dateOfReporting}</strong>
          </div>
          <div>
            <span className="text-gray-500 block">Budget:</span>
            <strong className="text-gray-800 font-mono">{activeReq.currency || 'UGX'} {activeReq.budget}</strong>
          </div>
          <div>
            <span className="text-gray-500 block">Vacancies:</span>
            <strong className="text-gray-800">{activeReq.vacancies}</strong>
          </div>
        </div>
      </div>

      {/* Mode 1: Stepped schedule wizard (requisition-style modal) */}
      {mode === 'edit-shortlist' && (
        <div className="page-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Shortlisted Candidates & Interview Schedule</h3>
            <p className="text-xs text-slate-500 mt-1">
              {shortlistRows.length} candidate(s) on schedule · {inviteCount} marked for invitation
            </p>
          </div>
          <button type="button" onClick={() => setIsScheduleWizardOpen(true)} className="btn btn-primary btn-lg">
            <Calendar className="w-4 h-4" />
            Open Schedule Wizard
          </button>
        </div>
      )}

      <EditShortlistScheduleModal
        isOpen={isScheduleWizardOpen}
        onClose={() => setIsScheduleWizardOpen(false)}
        activeReq={activeReq}
        candidates={candidates}
        shortlistRows={shortlistRows}
        allChecked={allChecked}
        onToggleInviteAll={handleToggleInviteAll}
        onAddCandidateRow={handleAddCandidateRow}
        onRemoveRow={handleRemoveRow}
        onUpdateRow={handleUpdateRow}
        onSaveDraft={() => { handleSaveDraft(); setIsScheduleWizardOpen(false); }}
        onInitiateSendInvitations={handleInitiateSendInterviewInvitations}
      />

      {/* Mode 2: Authority Governance & Sign-Off (Directly solves user's request to see Shortlist Approval by authorities) */}
      {mode === 'authority-approval' && (
        <div className="bg-white border border-[#cbd5e1] rounded-sm p-6 shadow-xs space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#1e293b] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0284c7]" />
                <span>Official Shortlist Ratification & Governance Sign-Off</span>
              </h3>
              <p className="text-[11px] text-gray-500">
                Governance audit review for Position: <strong>{activeReq.position}</strong> (Req No: <strong>{activeReq.reqNo}</strong>)
              </p>
            </div>

            {currentApproval?.isApproved ? (
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-1 rounded text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Shortlist Officially Approved</span>
              </span>
            ) : (
              <button
                onClick={handleInitiateApproveShortlist}
                className="px-4 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold rounded text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Sign-Off Shortlist</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Candidate Summary Panel */}
            <div className="border border-gray-200 rounded p-4 space-y-3 bg-gray-50/50">
              <h4 className="font-bold text-[#0f4c81] uppercase tracking-wide">
                Shortlisted Applicants for Approval ({activeReqCandidates.length})
              </h4>
              <div className="space-y-2">
                {activeReqCandidates.map((c, idx) => (
                  <div key={c.id} className="bg-white p-2.5 rounded border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-800 block">{idx + 1}. {c.name}</span>
                      <span className="text-[11px] text-gray-500">{c.educationLevel} • {c.yearsOfExperience} yrs experience</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-emerald-700 font-bold block">{c.matchScore}% Pre-Screen</span>
                      <span className="text-[10px] text-gray-500">{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Authority Sign-Off Card */}
            <div className="border border-blue-200 rounded p-4 space-y-4 bg-blue-50/40">
              <h4 className="font-bold text-[#0f4c81] uppercase tracking-wide flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#0284c7]" />
                <span>Governance Sign-Off Certificate</span>
              </h4>

              {currentApproval?.isApproved ? (
                <div className="space-y-3 bg-white p-4 rounded border border-blue-200">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Approved Authority:</span>
                    <strong className="text-gray-900 text-xs">{currentApproval.approvedBy}</strong>
                    <span className="text-gray-600 block text-[10px]">{currentApproval.role}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Sign-Off Timestamp:</span>
                    <strong className="text-gray-800 font-mono text-[11px]">{currentApproval.approvedAt}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Governance Endorsement:</span>
                    <p className="text-gray-700 italic text-[11px] mt-0.5">{currentApproval.comments}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-white p-4 rounded border border-amber-200">
                  <p className="text-gray-700 text-xs">
                    This shortlist is pending official ratification. Clicking <strong>"Approve & Sign-Off Shortlist"</strong> creates an immutable compliance record authorizing the panel to conduct interviews.
                  </p>
                  <button
                    onClick={handleInitiateApproveShortlist}
                    className="w-full py-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold rounded text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Click to Sign Off & Approve Shortlist</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Standard Confirmed Shortlist Table Overview */}
      {mode === 'list' && (
        <div className="space-y-4">
          <div className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 min-w-[220px]">
                <span className="text-gray-500 font-semibold shrink-0">Filter Vacancy:</span>
                <SearchableSelect
                  value={selectedReqId}
                  onChange={setSelectedReqId}
                  options={listFilterOptions}
                  searchPlaceholder="Search position or department…"
                  className="flex-1"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="search candidate name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none w-48"
                />
              </div>
            </div>

            <div className="text-gray-500">
              Total Confirmed: <strong className="text-emerald-700">{listCandidates.length}</strong>
            </div>
          </div>

          <div className="bg-white border border-[#cbd5e1] rounded-sm shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[#334155] font-bold">
                  <th className="py-2.5 px-3 border-r border-[#e2e8f0] w-10 text-center">No.</th>
                  <th className="py-2.5 px-4 border-r border-[#e2e8f0]">Candidate Name</th>
                  <th className="py-2.5 px-4 border-r border-[#e2e8f0]">Target Position</th>
                  <th className="py-2.5 px-3 border-r border-[#e2e8f0] text-center">Status</th>
                  <th className="py-2.5 px-3 border-r border-[#e2e8f0] text-center">Pre-Screen Score</th>
                  <th className="py-2.5 px-3 border-r border-[#e2e8f0] text-center">Psychometric Assessment</th>
                  <th className="py-2.5 px-3 border-r border-[#e2e8f0] text-center">Interview Scheduled</th>
                  <th className="py-2.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {listCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      No candidates currently found for the selected filter. Switch to "Edit Short List & Schedule" or select "-All Positions-".
                    </td>
                  </tr>
                ) : (
                  listCandidates.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 border-r border-[#e2e8f0] text-center text-gray-500 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-4 border-r border-[#e2e8f0]">
                        <button
                          onClick={() => setViewCandidate(c)}
                          className="font-bold text-[#0f4c81] text-xs hover:underline text-left cursor-pointer"
                        >
                          {c.name}
                        </button>
                        <span className="text-[11px] text-gray-500 block">{c.email} • +{c.countryCode} {c.phone}</span>
                      </td>
                      <td className="py-2 px-4 border-r border-[#e2e8f0] font-medium text-gray-800">
                        {c.position}
                      </td>
                      <td className="py-2 px-3 border-r border-[#e2e8f0] text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.status === 'Interview Scheduled' ? 'bg-blue-100 text-blue-800' :
                          c.status === 'Selected' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-cyan-100 text-cyan-800'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 border-r border-[#e2e8f0] text-center font-extrabold text-emerald-700">
                        {c.matchScore}%
                      </td>
                      <td className="py-2 px-3 border-r border-[#e2e8f0] text-center">
                        {c.testScore ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Passed ({c.testScore}%)
                          </span>
                        ) : (
                          <span className="text-gray-500 text-[11px]">{c.testStatus || 'Standard'}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 border-r border-[#e2e8f0] text-center">
                        {c.interviewDate ? (
                          <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-medium inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-blue-600" />
                            {c.interviewDate} ({c.interviewTime || '09:30 AM'})
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Not set</span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              onAdvanceToInterview(c.id);
                              onNavigate('final-interview', c.requisitionId);
                            }}
                            className="px-2.5 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>Interview Board</span>
                          </button>
                          <button
                            onClick={() => onTransferToTalentPool(c)}
                            className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded text-xs font-semibold cursor-pointer"
                            title="Transfer to Talent Pool"
                          >
                            <Archive className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Candidate Detail Modal */}
      {viewCandidate && (
        <CandidateDetailModal
          candidate={viewCandidate}
          onClose={() => setViewCandidate(null)}
          onAdvanceToInterview={(id) => {
            onAdvanceToInterview(id);
            onNavigate('final-interview');
          }}
          onTransferToTalentPool={onTransferToTalentPool}
        />
      )}

      {/* Confirmation Modal for Disagree/Batch Inviting Shortlisted Candidates */}
      <ConfirmationModal
        isOpen={showConfirmInviteModal}
        title="Confirm Dispatch of Interview Invitations"
        subtitle="Selected candidates will receive digital scheduling invitations via email & Candidate Portal."
        variant="primary"
        confirmText={`Confirm & Invite (${shortlistRows.filter(r => r.inviteChecked).length}) Candidates`}
        summaryItems={[
          {
            label: 'Requisition / Role',
            value: <span className="text-[#0f4c81] font-bold">{activeReq.position} ({activeReq.reqNo})</span>
          },
          {
            label: 'Total Invited Candidates',
            value: <span className="font-bold text-emerald-700">{shortlistRows.filter(r => r.inviteChecked).length} candidate(s) selected</span>
          },
          {
            label: 'Default Venue',
            value: shortlistRows.find(r => r.inviteChecked)?.venue || 'Executive Boardroom / Teams Link'
          }
        ]}
        warningMessage="Invited candidates can view panel slot schedules, confirm attendance, or request rescheduling directly from their secure Candidate Portal."
        onConfirm={handleExecuteSendInterviewInvitations}
        onClose={() => setShowConfirmInviteModal(false)}
      />

      {/* Confirmation Modal for Executive Authority Shortlist Ratification */}
      <ConfirmationModal
        isOpen={showConfirmApprovalModal}
        title="Confirm Official Shortlist Ratification"
        subtitle="Formally authorize and sign off this candidate shortlist for panel interview proceedings."
        variant="success"
        confirmText="Confirm & Sign-Off Shortlist"
        summaryItems={[
          {
            label: 'Position & Req Ref',
            value: `${activeReq.position} · ${activeReq.reqNo}`
          },
          {
            label: 'Sign-Off Authority',
            value: <span className="text-emerald-800 font-bold">Director Human Capital & Governance (Executive)</span>
          },
          {
            label: 'Approved Candidates',
            value: `${activeReqCandidates.length} candidate(s) approved`
          }
        ]}
        warningMessage="This action will generate an official governance audit stamp endorsing the candidate shortlist for competence panel interviews."
        onConfirm={handleExecuteApproveShortlist}
        onClose={() => setShowConfirmApprovalModal(false)}
      />
    </ViewShell>
  );
};
