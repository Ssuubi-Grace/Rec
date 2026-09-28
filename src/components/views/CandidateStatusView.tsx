import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  RotateCcw, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Award, 
  BrainCircuit, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone, 
  Send, 
  Eye, 
  Edit3, 
  ArrowRight, 
  Check, 
  X, 
  Download, 
  Printer, 
  Sparkles, 
  UserCheck, 
  Briefcase, 
  GraduationCap,
  ShieldCheck,
  Building2,
  ChevronDown
} from 'lucide-react';
import { Candidate, Requisition, OfferLetter, PsychometricTest } from '../../types';
import { ActiveView } from '../layout/Navbar';
import { PipelineStageCard, PIPELINE_STAGE_COLORS } from '../ui/PipelineStageCard';

interface CandidateStatusViewProps {
  candidates: Candidate[];
  requisitions: Requisition[];
  offers?: OfferLetter[];
  tests?: PsychometricTest[];
  onNavigate: (view: ActiveView, param?: string) => void;
  onUpdateCandidateStatus?: (candidateId: string, newStatus: Candidate['status'], notes?: string) => void;
  onSelectCandidateForOffer?: (candidate: Candidate) => void;
  onTriggerTest?: (candidateIds: string[]) => void;
  onTransferToTalentPool?: (candidate: Candidate) => void;
}

export const CandidateStatusView: React.FC<CandidateStatusViewProps> = ({
  candidates,
  requisitions,
  offers = [],
  tests = [],
  onNavigate,
  onUpdateCandidateStatus,
  onSelectCandidateForOffer,
  onTriggerTest,
  onTransferToTalentPool,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReqId, setSelectedReqId] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTestStatus, setSelectedTestStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [selectedCandidateForModal, setSelectedCandidateForModal] = useState<Candidate | null>(null);
  const [statusUpdateCandidate, setStatusUpdateCandidate] = useState<{ candidate: Candidate; targetStatus: Candidate['status'] } | null>(null);
  const [statusNotes, setStatusNotes] = useState('');

  // Extract unique departments
  const departments = Array.from(new Set(requisitions.map(r => r.department).filter(Boolean)));

  // Status Metrics calculations
  const totalApplied = candidates.length;
  const preShortlistedCount = candidates.filter(c => c.status === 'Pre-Shortlisted').length;
  const assessmentCount = candidates.filter(c => ['Assessment Sent', 'Test Completed'].includes(c.status) || c.testStatus === 'Pending').length;
  const interviewCount = candidates.filter(c => ['Interview Scheduled', 'Interview Evaluated'].includes(c.status) || c.interviewInvited).length;
  const selectedCount = candidates.filter(c => c.status === 'Selected').length;
  const offerCount = candidates.filter(c => ['Offer Issued', 'Offer Accepted', 'Offer Declined'].includes(c.status)).length;
  const hiredCount = candidates.filter(c => ['Orientation', 'Hired'].includes(c.status)).length;
  const talentPoolCount = candidates.filter(c => c.status === 'Talent Pool').length;
  const rejectedCount = candidates.filter(c => c.status === 'Rejected').length;

  // Filter candidates
  const filteredCandidates = candidates.filter(c => {
    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match = 
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.position.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.nationalId && c.nationalId.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Requisition filter
    if (selectedReqId !== 'all' && c.requisitionId !== selectedReqId) {
      return false;
    }

    // Department filter
    if (selectedDepartment !== 'all' && c.department !== selectedDepartment) {
      return false;
    }

    // Status filter
    if (selectedStatus !== 'all' && c.status !== selectedStatus) {
      return false;
    }

    // Test status filter
    if (selectedTestStatus !== 'all') {
      if (selectedTestStatus === 'Passed' && c.testStatus !== 'Passed') return false;
      if (selectedTestStatus === 'Failed' && c.testStatus !== 'Failed') return false;
      if (selectedTestStatus === 'Pending' && c.testStatus !== 'Pending') return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage) || 1;
  const paginatedList = filteredCandidates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedReqId('all');
    setSelectedDepartment('all');
    setSelectedStatus('all');
    setSelectedTestStatus('all');
    setCurrentPage(1);
  };

  const handleConfirmStatusUpdate = () => {
    if (statusUpdateCandidate && onUpdateCandidateStatus) {
      onUpdateCandidateStatus(statusUpdateCandidate.candidate.id, statusUpdateCandidate.targetStatus, statusNotes);
      setStatusUpdateCandidate(null);
      setStatusNotes('');
    }
  };

  const getStatusBadge = (status: Candidate['status']) => {
    switch (status) {
      case 'Applied':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Applied</span>;
      case 'Pre-Shortlisted':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">Pre-Shortlisted</span>;
      case 'Assessment Sent':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">Assessment Sent</span>;
      case 'Test Completed':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Test Completed</span>;
      case 'Interview Scheduled':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Interview Scheduled</span>;
      case 'Interview Evaluated':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200">Interview Evaluated</span>;
      case 'Selected':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Selected</span>;
      case 'Offer Issued':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">Offer Issued</span>;
      case 'Offer Accepted':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-green-100 text-green-800 border border-green-300">Offer Accepted</span>;
      case 'Offer Declined':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Offer Declined</span>;
      case 'Orientation':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">Orientation</span>;
      case 'Hired':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white shadow-2xs">Hired / Active Staff</span>;
      case 'Talent Pool':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">Talent Pool</span>;
      case 'Rejected':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="page-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="status-pill bg-blue-50 text-blue-700 border-blue-200 mb-2 inline-flex">Applicant Tracking System</span>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Applicant Tracking List</h1>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {filteredCandidates.length} Candidates
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Monitor applicant progress, assessments, interview scores, offers, and onboarding readiness.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => onNavigate('candidate-pipeline')} className="btn btn-secondary">
              <Users className="w-4 h-4" />
              Kanban Pipeline
            </button>
            <button onClick={() => window.print()} className="btn btn-secondary">
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button onClick={() => onNavigate('job-applicants-report')} className="btn btn-primary btn-lg">
              <FileText className="w-4 h-4" />
              Detailed Applicant Report
            </button>
          </div>
        </div>
      </div>

      {/* Stage filter cards — compact pipeline design matching Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <PipelineStageCard
          label="All Candidates"
          value={totalApplied}
          accent={PIPELINE_STAGE_COLORS.all.accent}
          lightBg={PIPELINE_STAGE_COLORS.all.light}
          icon={Users}
          total={totalApplied}
          active={selectedStatus === 'all'}
          onClick={() => { setSelectedStatus('all'); setCurrentPage(1); }}
          compact
          showDecoration
        />
        <PipelineStageCard
          label="Pre-Shortlisted"
          value={preShortlistedCount}
          accent={PIPELINE_STAGE_COLORS.preShortlist.accent}
          lightBg={PIPELINE_STAGE_COLORS.preShortlist.light}
          icon={UserCheck}
          total={totalApplied}
          active={selectedStatus === 'Pre-Shortlisted'}
          onClick={() => { setSelectedStatus('Pre-Shortlisted'); setCurrentPage(1); }}
          compact
          showDecoration
        />
        <PipelineStageCard
          label="Assessments"
          value={assessmentCount}
          accent={PIPELINE_STAGE_COLORS.assessment.accent}
          lightBg={PIPELINE_STAGE_COLORS.assessment.light}
          icon={BrainCircuit}
          total={totalApplied}
          active={selectedStatus === 'Assessment Sent'}
          onClick={() => { setSelectedStatus('Assessment Sent'); setCurrentPage(1); }}
          compact
          showDecoration
        />
        <PipelineStageCard
          label="Interviews"
          value={interviewCount}
          accent={PIPELINE_STAGE_COLORS.interview.accent}
          lightBg={PIPELINE_STAGE_COLORS.interview.light}
          icon={Calendar}
          total={totalApplied}
          active={selectedStatus === 'Interview Scheduled'}
          onClick={() => { setSelectedStatus('Interview Scheduled'); setCurrentPage(1); }}
          compact
          showDecoration
        />
        <PipelineStageCard
          label="Selected"
          value={selectedCount}
          accent={PIPELINE_STAGE_COLORS.selected.accent}
          lightBg={PIPELINE_STAGE_COLORS.selected.light}
          icon={CheckCircle2}
          total={totalApplied}
          active={selectedStatus === 'Selected'}
          onClick={() => { setSelectedStatus('Selected'); setCurrentPage(1); }}
          compact
          showDecoration
        />
        <PipelineStageCard
          label="Offers"
          value={offerCount}
          accent={PIPELINE_STAGE_COLORS.offer.accent}
          lightBg={PIPELINE_STAGE_COLORS.offer.light}
          icon={Send}
          total={totalApplied}
          active={selectedStatus === 'Offer Issued' || selectedStatus === 'Offer Accepted'}
          onClick={() => { setSelectedStatus('Offer Issued'); setCurrentPage(1); }}
          compact
          showDecoration
        />
        <PipelineStageCard
          label="Hired"
          value={hiredCount}
          accent={PIPELINE_STAGE_COLORS.hired.accent}
          lightBg={PIPELINE_STAGE_COLORS.hired.light}
          icon={Award}
          total={totalApplied}
          active={selectedStatus === 'Hired'}
          onClick={() => { setSelectedStatus('Hired'); setCurrentPage(1); }}
          compact
          showDecoration
        />
        <PipelineStageCard
          label="Talent Pool"
          value={talentPoolCount}
          accent={PIPELINE_STAGE_COLORS.talentPool.accent}
          lightBg={PIPELINE_STAGE_COLORS.talentPool.light}
          icon={ShieldCheck}
          total={totalApplied}
          active={selectedStatus === 'Talent Pool'}
          onClick={() => { setSelectedStatus('Talent Pool'); setCurrentPage(1); }}
          compact
          showDecoration
        />
      </div>

      {/* Interactive Search and Filter Bar */}
      <div className="page-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Search Box */}
          <div className="md:col-span-2">
            <label className="block text-gray-600 font-semibold mb-1">Search Candidate</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, phone, position, ID..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-50 border border-[#cbd5e1] rounded pl-8 pr-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0284c7] focus:bg-white focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Position / Requisition Dropdown */}
          <div>
            <label className="block text-gray-600 font-semibold mb-1">Target Requisition</label>
            <select
              value={selectedReqId}
              onChange={(e) => { setSelectedReqId(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0284c7] focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">- All Positions ({requisitions.length}) -</option>
              {requisitions.map(r => (
                <option key={r.id} value={r.id}>
                  {r.reqNo}: {r.position} ({r.department})
                </option>
              ))}
            </select>
          </div>

          {/* Stage / Status Filter */}
          <div>
            <label className="block text-gray-600 font-semibold mb-1">Candidate Stage</label>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0284c7] focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">- All Lifecycle Statuses -</option>
              <option value="Applied">Applied</option>
              <option value="Pre-Shortlisted">Pre-Shortlisted</option>
              <option value="Assessment Sent">Assessment Sent</option>
              <option value="Test Completed">Test Completed</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Interview Evaluated">Interview Evaluated</option>
              <option value="Selected">Selected</option>
              <option value="Offer Issued">Offer Issued</option>
              <option value="Offer Accepted">Offer Accepted</option>
              <option value="Offer Declined">Offer Declined</option>
              <option value="Orientation">Orientation</option>
              <option value="Hired">Hired</option>
              <option value="Talent Pool">Talent Pool</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Psychometric Assessment Status */}
          <div>
            <label className="block text-gray-600 font-semibold mb-1">Psychometrics</label>
            <select
              value={selectedTestStatus}
              onChange={(e) => { setSelectedTestStatus(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0284c7] focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">- All Test Results -</option>
              <option value="Passed">Passed Assessment</option>
              <option value="Failed">Failed Assessment</option>
              <option value="Pending">Pending Completion</option>
            </select>
          </div>
        </div>

        {/* Filter tags & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="text-gray-500 text-[11px] flex items-center gap-1.5">
            <span>Filtered: <strong>{filteredCandidates.length}</strong> candidates</span>
            {selectedStatus !== 'all' && (
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                Status: {selectedStatus}
              </span>
            )}
            {selectedReqId !== 'all' && (
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                Req: {selectedReqId}
              </span>
            )}
          </div>

          <button
            onClick={handleResetFilters}
            className="px-2.5 py-1 text-gray-600 hover:text-gray-900 hover:bg-slate-100 rounded text-xs flex items-center gap-1 font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-gray-400" />
            <span>Reset All Filters</span>
          </button>
        </div>
      </div>

      {/* Main Candidate Status Grid Table */}
      <div className="table-card">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <h3 className="text-sm font-bold text-slate-800">Candidate Directory</h3>
          <button
            onClick={() => {
              const csv = 'data:text/csv;charset=utf-8,' + filteredCandidates.map((c, i) =>
                `${i + 1},"${c.name}","${c.position}","${c.status}",${c.matchScore},${c.interviewScore ?? 'N/A'}`
              ).join('\n');
              const link = document.createElement('a');
              link.href = encodeURI(csv);
              link.download = 'Applicant_Tracking_List.csv';
              link.click();
            }}
            className="btn btn-success"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="standard-table">
            <thead>
              <tr>
                <th className="w-9 text-center">#</th>
                <th>Candidate Profile</th>
                <th>Target Requisition</th>
                <th className="text-center whitespace-nowrap">Match Score</th>
                <th className="text-center whitespace-nowrap">Psychometrics</th>
                <th className="text-center whitespace-nowrap">Interview Board</th>
                <th className="text-center">Current Status</th>
                <th className="text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-500 font-medium">
                    No candidates match the specified filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedList.map((c, idx) => {
                  const req = requisitions.find(r => r.id === c.requisitionId);
                  return (
                    <tr 
                      key={c.id} 
                      className={`hover:bg-[#f0fdf4]/50 transition-colors ${idx % 2 === 1 ? 'bg-[#fcfcfd]' : 'bg-white'}`}
                    >
                      {/* #. */}
                      <td className="py-2.5 px-2 border-r border-[#e2e8f0] text-center text-gray-400 font-medium">
                        {(currentPage - 1) * itemsPerPage + idx + 1}.
                      </td>

                      {/* Candidate Name & Contact */}
                      <td className="py-2.5 px-3 border-r border-[#e2e8f0]">
                        <div className="flex items-start gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#0284c7]/15 text-[#0284c7] font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <button
                              onClick={() => setSelectedCandidateForModal(c)}
                              className="font-bold text-[#0f4c81] hover:underline text-left block"
                            >
                              {c.name}
                            </button>
                            <div className="text-[11px] text-gray-500 flex flex-wrap items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-0.5">
                                <Mail className="w-3 h-3 text-gray-400" />
                                {c.email}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <Phone className="w-3 h-3 text-gray-400" />
                                {c.phone}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              {c.educationLevel} • {c.yearsOfExperience} yrs exp • Applied: {c.appliedDate}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Target Requisition */}
                      <td className="py-2.5 px-3 border-r border-[#e2e8f0]">
                        <div className="font-semibold text-gray-800">{c.position}</div>
                        <div className="text-[11px] text-gray-500">{c.department}</div>
                        {req && (
                          <span className="inline-block mt-0.5 text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                            {req.reqNo}
                          </span>
                        )}
                      </td>

                      {/* Match Score */}
                      <td className="py-2.5 px-2.5 border-r border-[#e2e8f0] text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                            c.matchScore >= 85 ? 'bg-emerald-100 text-emerald-800' :
                            c.matchScore >= 70 ? 'bg-blue-100 text-blue-800' :
                            c.matchScore >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {c.matchScore}%
                          </span>
                        </div>
                      </td>

                      {/* Psychometrics */}
                      <td className="py-2.5 px-3 border-r border-[#e2e8f0] text-center">
                        {c.testStatus === 'Passed' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold">
                            <Check className="w-3 h-3" />
                            <span>{c.testScore ?? 85}% (Passed)</span>
                          </span>
                        ) : c.testStatus === 'Failed' ? (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                            <X className="w-3 h-3" />
                            <span>{c.testScore ?? 45}% (Failed)</span>
                          </span>
                        ) : c.testStatus === 'Pending' ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                            <Clock className="w-3 h-3" />
                            <span>Test Pending</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">- Not Assigned -</span>
                        )}
                      </td>

                      {/* Interview Board */}
                      <td className="py-2.5 px-3 border-r border-[#e2e8f0] text-center">
                        {c.interviewScore ? (
                          <div>
                            <div className="font-bold text-[#0284c7] text-xs">
                              {c.interviewScore}% Score
                            </div>
                            <span className="text-[10px] text-gray-500 font-medium">
                              {c.interviewRecommendation || 'Recommended'}
                            </span>
                          </div>
                        ) : c.interviewInvited ? (
                          <span className="text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-semibold inline-block">
                            📅 {c.interviewDate || 'Scheduled'}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">- Pending Stage -</span>
                        )}
                      </td>

                      {/* Current Status */}
                      <td className="py-2.5 px-3 border-r border-[#e2e8f0] text-center">
                        {getStatusBadge(c.status)}
                      </td>

                      {/* Stage Actions & History */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Details & Timeline button */}
                          <button
                            onClick={() => setSelectedCandidateForModal(c)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            title="View candidate full profile & journey audit log"
                          >
                            <Eye className="w-3 h-3 text-[#0284c7]" />
                            <span>Timeline</span>
                          </button>

                          {/* Stage Transition Quick Links */}
                          {c.status === 'Applied' && (
                            <button
                              onClick={() => setStatusUpdateCandidate({ candidate: c, targetStatus: 'Pre-Shortlisted' })}
                              className="px-2 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Pre-Shortlist</span>
                            </button>
                          )}

                          {c.status === 'Pre-Shortlisted' && (
                            <button
                              onClick={() => {
                                if (onTriggerTest) onTriggerTest([c.id]);
                              }}
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                              title="Send psychometric assessment invite"
                            >
                              <BrainCircuit className="w-3 h-3" />
                              <span>Send Test</span>
                            </button>
                          )}

                          {(c.status === 'Test Completed' || (c.status === 'Pre-Shortlisted' && c.testStatus === 'Passed')) && (
                            <button
                              onClick={() => onNavigate('confirmed-shortlists', c.requisitionId)}
                              className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Calendar className="w-3 h-3" />
                              <span>Invite Interview</span>
                            </button>
                          )}

                          {c.status === 'Selected' && (
                            <button
                              onClick={() => {
                                if (onSelectCandidateForOffer) onSelectCandidateForOffer(c);
                                onNavigate('offer-management');
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <Award className="w-3 h-3" />
                              <span>Issue Offer</span>
                            </button>
                          )}

                          {c.status === 'Offer Accepted' && (
                            <button
                              onClick={() => onNavigate('new-staff-orientation')}
                              className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Onboard</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-3 bg-[#f8fafc] border-t border-[#cbd5e1] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="text-gray-500">
            Showing <strong className="text-gray-800">{Math.min(filteredCandidates.length, (currentPage - 1) * itemsPerPage + 1)}</strong> to <strong className="text-gray-800">{Math.min(filteredCandidates.length, currentPage * itemsPerPage)}</strong> of <strong className="text-gray-800">{filteredCandidates.length}</strong> candidates
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-2.5 py-1 rounded border text-xs font-semibold ${currentPage === 1 ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-[#0284c7] border-[#cbd5e1] hover:bg-slate-50'}`}
            >
              « Previous
            </button>
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`px-3 py-1 rounded border text-xs font-bold ${currentPage === p ? 'bg-[#0284c7] text-white border-[#0284c7]' : 'bg-white text-[#334155] border-[#cbd5e1] hover:bg-slate-50'}`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-2.5 py-1 rounded border text-xs font-semibold ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-[#0284c7] border-[#cbd5e1] hover:bg-slate-50'}`}
            >
              Next »
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Journey & Audit Modal */}
      {selectedCandidateForModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-md shadow-2xl border border-slate-300 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-xs">
            {/* Modal Header */}
            <div className="bg-[#1e293b] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0284c7] text-white font-bold flex items-center justify-center text-sm">
                  {selectedCandidateForModal.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{selectedCandidateForModal.name}</h3>
                  <p className="text-gray-300 text-xs">
                    {selectedCandidateForModal.position} • {selectedCandidateForModal.department}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidateForModal(null)}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">Email Address</div>
                  <div className="font-medium text-gray-900">{selectedCandidateForModal.email}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">Phone Number</div>
                  <div className="font-medium text-gray-900">{selectedCandidateForModal.phone}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">Education Level</div>
                  <div className="font-medium text-gray-900">{selectedCandidateForModal.educationLevel}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">Experience</div>
                  <div className="font-medium text-gray-900">{selectedCandidateForModal.yearsOfExperience} Years</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">Match Score</div>
                  <div className="font-bold text-[#0284c7]">{selectedCandidateForModal.matchScore}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">Current Stage</div>
                  <div>{getStatusBadge(selectedCandidateForModal.status)}</div>
                </div>
              </div>

              {/* Recruitment Lifecycle Milestones */}
              <div>
                <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>Application Lifecycle Milestones</span>
                </h4>
                <div className="space-y-2 border-l-2 border-slate-200 pl-4 ml-2">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    <div className="font-bold text-gray-800">1. Applied to Career Portal</div>
                    <div className="text-gray-500 text-[11px]">Submitted online application on {selectedCandidateForModal.appliedDate}</div>
                  </div>

                  <div className="relative">
                    <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${['Pre-Shortlisted', 'Assessment Sent', 'Test Completed', 'Interview Scheduled', 'Selected', 'Offer Issued', 'Offer Accepted', 'Hired'].includes(selectedCandidateForModal.status) ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    <div className="font-bold text-gray-800">2. Pre-Screening & Criteria Match</div>
                    <div className="text-gray-500 text-[11px]">System matched {selectedCandidateForModal.matchScore}% qualifications criteria</div>
                  </div>

                  <div className="relative">
                    <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${selectedCandidateForModal.testStatus === 'Passed' ? 'bg-emerald-500' : selectedCandidateForModal.testStatus === 'Failed' ? 'bg-red-500' : selectedCandidateForModal.testStatus === 'Pending' ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                    <div className="font-bold text-gray-800">3. Psychometric Assessment</div>
                    <div className="text-gray-500 text-[11px]">
                      {selectedCandidateForModal.testStatus ? `Result: ${selectedCandidateForModal.testStatus} (${selectedCandidateForModal.testScore ?? 85}%)` : 'Not yet administered'}
                    </div>
                  </div>

                  <div className="relative">
                    <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${selectedCandidateForModal.interviewScore ? 'bg-emerald-500' : selectedCandidateForModal.interviewInvited ? 'bg-purple-500' : 'bg-slate-300'}`}></div>
                    <div className="font-bold text-gray-800">4. Interview Board Evaluation</div>
                    <div className="text-gray-500 text-[11px]">
                      {selectedCandidateForModal.interviewScore 
                        ? `Panel Score: ${selectedCandidateForModal.interviewScore}% • ${selectedCandidateForModal.interviewRecommendation || 'Recommended'}`
                        : selectedCandidateForModal.interviewInvited 
                        ? `Scheduled on ${selectedCandidateForModal.interviewDate || '28-Aug-2026'}`
                        : 'Awaiting shortlist confirmation'}
                    </div>
                  </div>

                  <div className="relative">
                    <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${['Offer Issued', 'Offer Accepted', 'Hired'].includes(selectedCandidateForModal.status) ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    <div className="font-bold text-gray-800">5. Offer Letter & Onboarding</div>
                    <div className="text-gray-500 text-[11px]">
                      {selectedCandidateForModal.status === 'Offer Accepted' 
                        ? 'Offer signed by candidate; profile ready for orientation'
                        : selectedCandidateForModal.status === 'Offer Issued'
                        ? 'Offer letter generated & awaiting candidate digital signature'
                        : selectedCandidateForModal.status === 'Hired'
                        ? 'Full staff profile active in payroll'
                        : 'Not yet reached offer stage'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedCandidateForModal(null)}
                className="px-4 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-gray-700 rounded text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Status Update Modal */}
      {statusUpdateCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md shadow-xl border border-slate-300 max-w-md w-full p-4 space-y-3 text-xs">
            <h3 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0284c7]" />
              <span>Update Candidate Status</span>
            </h3>
            <p className="text-gray-600">
              Update <strong>{statusUpdateCandidate.candidate.name}</strong> to status: <strong className="text-[#0284c7]">{statusUpdateCandidate.targetStatus}</strong>
            </p>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">Status Transition Notes / Remarks</label>
              <textarea
                rows={3}
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Enter internal HR notes or remarks regarding this transition..."
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-[#0284c7] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setStatusUpdateCandidate(null)}
                className="px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-gray-700 rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusUpdate}
                className="px-4 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded text-xs font-bold"
              >
                Confirm Status Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
