import React, { useState } from 'react';
import { RichTextView } from '../ui/RichTextView';
import { 
  Plus, 
  Filter, 
  Search, 
  RotateCcw, 
  Edit, 
  Trash2, 
  Eye, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Send,
  Globe,
  Upload,
  Paperclip,
  Check,
  PauseCircle,
  Copy,
  Clock,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Undo2,
  Briefcase,
  Building2,
  DollarSign,
  Calendar,
  Download
} from 'lucide-react';
import { Requisition } from '../../types';
import { ActiveView } from '../layout/Navbar';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import { useToast } from '../../context/ToastContext';

interface NewStaffRequestsViewProps {
  requisitions: Requisition[];
  onNavigate: (view: ActiveView) => void;
  onSelectRequisitionForEdit?: (req: Requisition) => void;
  onDeleteRequisition?: (id: string) => void;
  onSubmitRequisitionForApproval?: (id: string) => void;
  onPublishRequisition?: (id: string) => void;
  onUnpublishRequisition?: (id: string) => void;
  onDuplicateRequisition?: (req: Requisition) => void;
  onWithdrawRequisition?: (id: string) => void;
  initialApprovalState?: string;
  onOpenFullRequisition?: () => void;
}

export const NewStaffRequestsView: React.FC<NewStaffRequestsViewProps> = ({
  requisitions,
  onNavigate,
  onSelectRequisitionForEdit,
  onDeleteRequisition,
  onSubmitRequisitionForApproval,
  onPublishRequisition,
  onUnpublishRequisition,
  onDuplicateRequisition,
  onWithdrawRequisition,
  initialApprovalState = '-All-',
  onOpenFullRequisition,
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [reportingDateFrom, setReportingDateFrom] = useState('');
  const [reportingDateTo, setReportingDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>(
    initialApprovalState === 'Approved' ? 'approved-pending-publish' : 'all'
  );
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modals
  const [selectedReqForModal, setSelectedReqForModal] = useState<Requisition | null>(null);
  const [viewingRejectionReq, setViewingRejectionReq] = useState<Requisition | null>(null);
  const [viewingRevisionReq, setViewingRevisionReq] = useState<Requisition | null>(null);
  const [reqToSubmitForApproval, setReqToSubmitForApproval] = useState<Requisition | null>(null);
  const [reqToDelete, setReqToDelete] = useState<Requisition | null>(null);
  
  const { showSuccess, showInfo, showWarning } = useToast();

  // Counts for tabs
  const counts = {
    all: requisitions.length,
    approvedPendingPublish: requisitions.filter(r => r.status === 'Approved' && !r.isPublished).length,
    published: requisitions.filter(r => r.isPublished).length,
    pendingApproval: requisitions.filter(r => r.status.includes('Pending')).length,
    needsRevision: requisitions.filter(r => r.status === 'Returned for Revision').length,
    drafts: requisitions.filter(r => r.status === 'Not Submitted').length,
    rejected: requisitions.filter(r => r.status === 'Rejected').length,
  };

  // Filtered dataset
  const filteredRequisitions = requisitions.filter(req => {
    // Quick Tab filter
    if (activeTab === 'approved-pending-publish') {
      if (!(req.status === 'Approved' && !req.isPublished)) return false;
    } else if (activeTab === 'published') {
      if (!req.isPublished) return false;
    } else if (activeTab === 'pending-approval') {
      if (!req.status.includes('Pending')) return false;
    } else if (activeTab === 'needs-revision') {
      if (req.status !== 'Returned for Revision') return false;
    } else if (activeTab === 'drafts') {
      if (req.status !== 'Not Submitted') return false;
    } else if (activeTab === 'rejected') {
      if (req.status !== 'Rejected') return false;
    }

    if (searchTerm) {
      const match = 
        req.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.salaryScale.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.reqNo.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredRequisitions.length / itemsPerPage) || 1;
  const paginatedList = filteredRequisitions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleClearFilters = () => {
    setReportingDateTo('');
    setSearchTerm('');
    setActiveTab('all');
    setCurrentPage(1);
  };

  const handlePublish = (reqId: string) => {
    if (onPublishRequisition) {
      onPublishRequisition(reqId);
    }
    showSuccess('Job Advert is now Published and live on the Careers Portal for candidates!', 'Vacancy Published');
  };

  const handleUnpublish = (reqId: string) => {
    if (onUnpublishRequisition) {
      onUnpublishRequisition(reqId);
    }
    showInfo('Job Advert paused / unpublished from the Careers Portal.', 'Listing Paused');
  };

  const handleDuplicate = (req: Requisition) => {
    if (onDuplicateRequisition) {
      onDuplicateRequisition(req);
    }
    showInfo(`Requisition ${req.reqNo} duplicated into a new Draft.`, 'Requisition Duplicated');
  };

  const handleWithdraw = (reqId: string) => {
    if (onWithdrawRequisition) {
      onWithdrawRequisition(reqId);
    }
    showInfo('Requisition withdrawn back to Draft status.', 'Requisition Withdrawn');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">

      {/* Header & Title */}
      <div className="page-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="status-pill bg-blue-50 text-blue-700 border-blue-200 mb-2 inline-flex">Staff Requisitions</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Staff Requisitions</h2>
          </div>
          <button
            onClick={() => (onOpenFullRequisition ? onOpenFullRequisition() : onNavigate('create-requisition'))}
            className="btn btn-primary btn-lg self-start"
          >
            <Plus className="w-4 h-4" />
            New Requisition
          </button>
        </div>
      </div>

      {/* LIFECYCLE GOVERNANCE STATUS TABS */}
      <div className="page-card p-1.5">
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold py-0.5">
          <button
            onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-[#0284c7] text-white shadow-xs'
                : 'text-gray-600 hover:bg-slate-100 hover:text-gray-900'
            }`}
          >
            <span>All Requisitions</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {counts.all}
            </span>
          </button>

          {/* Approved & Ready to Publish */}
          <button
            onClick={() => { setActiveTab('approved-pending-publish'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'approved-pending-publish'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved (Ready to Publish)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'approved-pending-publish' ? 'bg-white/30 text-white' : 'bg-emerald-200 text-emerald-900'}`}>
              {counts.approvedPendingPublish}
            </span>
          </button>

          {/* Published & Live on Portal */}
          <button
            onClick={() => { setActiveTab('published'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'published'
                ? 'bg-[#0f4c81] text-white shadow-xs'
                : 'text-gray-600 hover:bg-slate-100 hover:text-gray-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-500" />
            <span>Live on Portal</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'published' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {counts.published}
            </span>
          </button>

          {/* Pending Approval */}
          <button
            onClick={() => { setActiveTab('pending-approval'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pending-approval'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-slate-100 hover:text-gray-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Approval</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'pending-approval' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {counts.pendingApproval}
            </span>
          </button>

          {/* Needs Revision */}
          <button
            onClick={() => { setActiveTab('needs-revision'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'needs-revision'
                ? 'bg-amber-700 text-white shadow-xs'
                : counts.needsRevision > 0
                ? 'text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300'
                : 'text-gray-600 hover:bg-slate-100 hover:text-gray-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Needs Revision</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'needs-revision' ? 'bg-white/30 text-white' : 'bg-amber-200 text-amber-950'}`}>
              {counts.needsRevision}
            </span>
          </button>

          {/* Drafts */}
          <button
            onClick={() => { setActiveTab('drafts'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'drafts'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-gray-600 hover:bg-slate-100 hover:text-gray-900'
            }`}
          >
            <span>Drafts</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'drafts' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {counts.drafts}
            </span>
          </button>

          {/* Rejected */}
          <button
            onClick={() => { setActiveTab('rejected'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rejected'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-gray-600 hover:bg-slate-100 hover:text-gray-900'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected / Archived</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'rejected' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {counts.rejected}
            </span>
          </button>
        </div>
      </div>

      {/* Filter Accordion Box */}
      <div className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm shadow-2xs overflow-hidden">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="w-full bg-[#f1f5f9] border-b border-[#cbd5e1] px-3 py-1.5 flex items-center justify-between text-xs font-bold text-[#334155] hover:bg-[#e2e8f0] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#0284c7]" />
            <span>Search & Advanced Query Filters</span>
          </span>
          <span className="text-[11px] font-normal text-gray-500">
            {filtersOpen ? 'Hide Filters ▲' : 'Show Filters ▼'}
          </span>
        </button>

        {filtersOpen && (
          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[#475569] font-medium mb-1">Reporting Date From</label>
              <input
                type="date"
                value={reportingDateFrom}
                onChange={(e) => setReportingDateFrom(e.target.value)}
                className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#475569] font-medium mb-1">To</label>
              <input
                type="date"
                value={reportingDateTo}
                onChange={(e) => setReportingDateTo(e.target.value)}
                className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[#475569] font-medium mb-1">Search Keywords</label>
              <input
                type="text"
                placeholder="Search position, department, grade band, req number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-4 flex justify-end gap-2 pt-1 border-t border-[#e2e8f0]">
              <button
                onClick={() => setCurrentPage(1)}
                className="px-3.5 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Apply Filter</span>
              </button>
              <button
                onClick={handleClearFilters}
                className="px-3.5 py-1 bg-[#06b6d4] hover:bg-[#0891b2] text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid Table */}
      <div className="table-card">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <h3 className="text-sm font-bold text-slate-800">Requisition Portfolio</h3>
          <button
            onClick={() => {
              const csv = 'data:text/csv;charset=utf-8,' + filteredRequisitions.map((r, i) =>
                `${i + 1},"${r.reqNo}","${r.position}","${r.department}","${r.status}"`
              ).join('\n');
              const link = document.createElement('a');
              link.href = encodeURI(csv);
              link.download = 'Staff_Requisitions.csv';
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
              <th className="w-8 text-center">#</th>
              <th>Req Ref / Dept</th>
              <th>Position Title</th>
              <th>Category / Scale</th>
              <th className="text-center whitespace-nowrap">Vacancies</th>
              <th className="whitespace-nowrap">Key Dates &amp; Budget</th>
              <th className="text-center">Governance Status</th>
              <th className="text-center">Portal Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0]">
            {paginatedList.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-gray-500 font-medium">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <span>No requisitions match the selected view criteria.</span>
                </td>
              </tr>
            ) : (
              paginatedList.map((req, idx) => {
                const isApproved = req.status === 'Approved';
                const isLive = req.isPublished;
                const isRevision = req.status === 'Returned for Revision';
                const isRejected = req.status === 'Rejected';
                const isDraft = req.status === 'Not Submitted';
                const isPending = req.status.includes('Pending');

                return (
                  <tr 
                    key={req.id} 
                    className={`hover:bg-[#f0fdf4]/50 transition-colors ${
                      isLive ? 'bg-emerald-50/20' : idx % 2 === 1 ? 'bg-[#fcfcfd]' : 'bg-white'
                    }`}
                  >
                    <td className="py-2 px-2 border-r border-[#e2e8f0] text-center text-gray-500 font-medium">
                      {(currentPage - 1) * itemsPerPage + idx + 1}.
                    </td>

                    {/* Department & Req No */}
                    <td className="py-2 px-3 border-r border-[#e2e8f0]">
                      <span className="font-bold text-xs text-gray-900 block">{req.department}</span>
                      <span className="text-[10px] font-mono text-gray-500">{req.reqNo}</span>
                    </td>

                    {/* Position Title */}
                    <td className="py-2 px-3 border-r border-[#e2e8f0]">
                      <span className="font-bold text-xs text-[#0f4c81] block">{req.position}</span>
                    </td>

                    {/* Category / Scale */}
                    <td className="py-2 px-3 border-r border-[#e2e8f0] text-gray-700">
                      <span className="block font-medium">{req.salaryScale}</span>
                      <span className="text-[10px] text-gray-500">{req.category}</span>
                    </td>

                    {/* Vacancies */}
                    <td className="py-2 px-2 border-r border-[#e2e8f0] text-center font-bold text-gray-900">
                      {req.vacancies}
                    </td>

                    {/* Requisition dates & budget */}
                    <td className="py-2 px-3 border-r border-[#e2e8f0] whitespace-nowrap">
                      <span className="block text-[10px] text-gray-600">Created: <strong>{req.createdDate || 'Legacy record'}</strong></span>
                      <span className="block text-[10px] text-gray-600">Submitted: <strong>{req.submittedDate || (req.submittedAt && req.submittedAt !== 'Just now' ? req.submittedAt : 'Not submitted')}</strong></span>
                      <span className="block text-[10px] text-gray-600">Closes: <strong>{req.applicationDeadline || 'Not specified'}</strong></span>
                      <span className="block text-[10px] text-gray-600">Reports: <strong>{req.dateOfReporting}</strong></span>
                      <span className="text-[10px] font-mono font-semibold text-emerald-800">
                        {req.currency || 'UGX'} {req.budget}
                      </span>
                    </td>

                    {/* Governance Status */}
                    <td className="py-2 px-3 border-r border-[#e2e8f0] text-center whitespace-nowrap">
                      {isApproved ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Approved</span>
                        </span>
                      ) : isRevision ? (
                        <div className="space-y-0.5">
                          <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-300 inline-flex items-center gap-1 text-[11px]">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Needs Revision</span>
                          </span>
                          {req.revisionNotes && (
                            <button
                              onClick={() => setViewingRevisionReq(req)}
                              className="block text-[10px] text-amber-900 underline truncate max-w-[130px] mx-auto cursor-pointer"
                              title="Click to view reviewer feedback"
                            >
                              💬 "{req.revisionNotes}"
                            </button>
                          )}
                        </div>
                      ) : isRejected ? (
                        <div className="space-y-0.5">
                          <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-flex items-center gap-1 text-[11px]">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Rejected</span>
                          </span>
                          {req.rejectionReason && (
                            <button
                              onClick={() => setViewingRejectionReq(req)}
                              className="block text-[10px] text-rose-800 underline truncate max-w-[130px] mx-auto cursor-pointer"
                              title="Click to view rejection reason"
                            >
                              👁 View Reason
                            </button>
                          )}
                        </div>
                      ) : isDraft ? (
                        <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold inline-block text-[11px]">
                          Draft (Unsubmitted)
                        </span>
                      ) : (
                        <span className="text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-semibold inline-flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-sky-600" />
                          <span>{req.status}</span>
                        </span>
                      )}
                    </td>

                    {/* Portal Publishing Status */}
                    <td className="py-2 px-3 border-r border-[#e2e8f0] text-center whitespace-nowrap">
                      {isLive ? (
                        <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300 text-[10px] font-bold inline-flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Live on Portal</span>
                        </span>
                      ) : isApproved ? (
                        <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px] font-semibold inline-block">
                          Ready to Publish
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px] italic">
                          Not published
                        </span>
                      )}
                    </td>

                    {/* Contextual Action Buttons */}
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 text-xs">
                        
                        {/* CASE 1: APPROVED BUT NOT PUBLISHED -> PROMINENT PUBLISH BUTTON */}
                        {isApproved && !isLive && (
                          <button
                            onClick={() => handlePublish(req.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title="Publish role and Job Advert to Careers Portal so applicants can apply"
                          >
                            <Globe className="w-3 h-3" />
                            <span>Publish Advert</span>
                          </button>
                        )}

                        {/* CASE 2: LIVE ON PORTAL -> UNPUBLISH OR VIEW */}
                        {isLive && (
                          <button
                            onClick={() => handleUnpublish(req.id)}
                            className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded border border-amber-300 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Pause / Unpublish role from portal"
                          >
                            <PauseCircle className="w-3 h-3" />
                            <span>Pause Advert</span>
                          </button>
                        )}

                        {/* CASE 3: RETURNED FOR REVISION -> REVISE & RESUBMIT */}
                        {isRevision && (
                          <>
                            <button
                              onClick={() => {
                                if (onSelectRequisitionForEdit) onSelectRequisitionForEdit(req);
                                (onOpenFullRequisition ? onOpenFullRequisition() : onNavigate('create-requisition'));
                              }}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Edit fields, fix reviewer concerns, and resubmit"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Revise & Resubmit</span>
                            </button>
                            <button
                              onClick={() => setViewingRevisionReq(req)}
                              className="text-amber-800 hover:underline font-semibold text-[11px] cursor-pointer"
                              title="Read full reviewer comments"
                            >
                              Feedback
                            </button>
                          </>
                        )}

                        {/* CASE 4: REJECTED -> DUPLICATE AS DRAFT / VIEW REASON */}
                        {isRejected && (
                          <>
                            <button
                              onClick={() => handleDuplicate(req)}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Clone into a new draft without retyping"
                            >
                              <Copy className="w-3 h-3 text-slate-600" />
                              <span>Clone Draft</span>
                            </button>
                            <button
                              onClick={() => setViewingRejectionReq(req)}
                              className="text-rose-700 hover:underline font-semibold text-[11px] cursor-pointer"
                            >
                              Reason
                            </button>
                          </>
                        )}

                        {/* CASE 5: DRAFT (NOT SUBMITTED) -> SUBMIT, EDIT, DELETE */}
                        {isDraft && (
                          <>
                            <button
                              onClick={() => setReqToSubmitForApproval(req)}
                              className="px-2.5 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded text-[11px] font-bold shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Submit for Approver sign-off"
                            >
                              <Send className="w-3 h-3" />
                              <span>Submit</span>
                            </button>
                            <button
                              onClick={() => {
                                if (onSelectRequisitionForEdit) onSelectRequisitionForEdit(req);
                                (onOpenFullRequisition ? onOpenFullRequisition() : onNavigate('create-requisition'));
                              }}
                              className="text-[#0284c7] hover:underline font-medium cursor-pointer"
                            >
                              <Edit className="w-3 h-3 inline" />
                            </button>
                            <button
                              onClick={() => setReqToDelete(req)}
                              className="text-rose-600 hover:underline font-medium cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3 inline" />
                            </button>
                          </>
                        )}

                        {/* CASE 6: PENDING APPROVAL -> WITHDRAW OPTION */}
                        {isPending && (
                          <button
                            onClick={() => handleWithdraw(req.id)}
                            className="text-slate-600 hover:text-slate-900 hover:underline text-[11px] flex items-center gap-0.5 cursor-pointer"
                            title="Withdraw back to draft for adjustments"
                          >
                            <Undo2 className="w-3 h-3" />
                            <span>Withdraw</span>
                          </button>
                        )}

                        {/* Standard Details Modal Trigger */}
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => setSelectedReqForModal(req)}
                          className="text-[#0284c7] hover:underline font-medium inline-flex items-center gap-0.5 cursor-pointer"
                          title="View Requisition & JD Details"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="text-gray-500">
            Showing <strong className="text-gray-800">{Math.min(filteredRequisitions.length, (currentPage - 1) * itemsPerPage + 1)}</strong> to <strong className="text-gray-800">{Math.min(filteredRequisitions.length, currentPage * itemsPerPage)}</strong> of <strong className="text-gray-800">{filteredRequisitions.length}</strong> requisitions
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-2.5 py-1 rounded border text-xs font-semibold ${currentPage === 1 ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-[#0284c7] border-[#cbd5e1] hover:bg-slate-50'}`}
            >
              «
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`px-3 py-1 rounded border text-xs font-bold ${currentPage === p ? 'bg-[#0284c7] text-white border-[#0284c7]' : 'bg-white text-gray-700 border-[#cbd5e1] hover:bg-slate-50'}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-2.5 py-1 rounded border text-xs font-semibold ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-[#0284c7] border-[#cbd5e1] hover:bg-slate-50'}`}
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: REQUISITION DETAILS & JD SUMMARY */}
      {/* ========================================================================= */}
      {selectedReqForModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded shadow-2xl max-w-3xl w-full overflow-hidden border border-[#94a3b8]">
            <div className="bg-[#1e293b] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm">Requisition & Job Details: {selectedReqForModal.reqNo}</h3>
              </div>
              <button 
                onClick={() => setSelectedReqForModal(null)}
                className="text-neutral-300 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-[#334155] max-h-[78vh] overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#f8fafc] p-3 rounded border border-[#e2e8f0]">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Position Title</span>
                  <span className="font-bold text-sm text-[#0f4c81]">{selectedReqForModal.position}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Department</span>
                  <span className="font-bold text-sm text-[#1e293b]">{selectedReqForModal.department}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Grade Band / Scale</span>
                  <span className="font-semibold text-gray-800">{selectedReqForModal.salaryScale}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Remuneration Budget</span>
                  <span className="font-bold text-emerald-800">{selectedReqForModal.currency || 'UGX'} {selectedReqForModal.budget}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Vacancies</span>
                  <span className="font-bold text-gray-800">{selectedReqForModal.vacancies} Headcount</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Reporting Date</span>
                  <span className="font-semibold text-gray-800">{selectedReqForModal.dateOfReporting}</span>
                </div>
              </div>

              {/* JD Specification (Attached File or Structured) */}
              {selectedReqForModal.attachedJdFileName ? (
                <div className="bg-emerald-50 border border-emerald-300 rounded p-3 space-y-2">
                  <span className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Official Attached Specification Document</span>
                  </span>
                  <div className="bg-white p-2.5 rounded border border-emerald-200 flex items-center justify-between">
                    <div>
                      <strong className="text-xs text-gray-900 block">{selectedReqForModal.attachedJdFileName}</strong>
                      <span className="text-[10px] text-gray-500">{selectedReqForModal.attachedJdFileSize || '2.1 MB'} • PDF Terms of Reference</span>
                    </div>
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px] font-bold">
                      Attached File
                    </span>
                  </div>
                  {selectedReqForModal.attachedJdNotes && (
                    <p className="text-[11px] text-gray-700 bg-white/80 p-2 rounded">
                      <strong className="text-emerald-900 block">Notes:</strong> {selectedReqForModal.attachedJdNotes}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2 bg-slate-50 p-3 rounded border border-slate-200">
                  <span className="font-bold text-xs text-gray-800 block">In-System Job Advert / Description:</span>
                  {selectedReqForModal.rolePurpose && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-500">Role Purpose:</span>
                      <RichTextView html={selectedReqForModal.rolePurpose} className="bg-white p-2 rounded border border-gray-200 mt-0.5" />
                    </div>
                  )}
                  {selectedReqForModal.keyResponsibilities && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-500">Key Responsibilities:</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-gray-700 bg-white p-2 rounded border border-gray-200 mt-0.5">
                        {selectedReqForModal.keyResponsibilities.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Pre-Screening Criteria */}
              <div className="bg-amber-50/70 border border-amber-200 rounded p-3 space-y-1.5">
                <h4 className="font-bold text-amber-900 text-xs">Automated Pre-Shortlisting Screening Conditions:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-gray-700 text-[11px]">
                  <div>
                    <span className="text-gray-500 block">Age Bracket:</span>
                    <strong>{selectedReqForModal.minAge || 20} - {selectedReqForModal.maxAge || 45} yrs</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Min Experience:</span>
                    <strong>{selectedReqForModal.minExperience || 2} Years</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Education:</span>
                    <strong>{selectedReqForModal.educationLevel || 'Bachelor Degree'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Psychometric Test:</span>
                    <strong>{selectedReqForModal.requirePsychometricTest ? 'Required' : 'Optional'}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#f1f5f9] px-4 py-2.5 border-t border-[#cbd5e1] flex justify-between items-center">
              <span className="text-xs text-gray-600">
                Governance Status: <strong className="text-emerald-700">{selectedReqForModal.status}</strong>
                {selectedReqForModal.isPublished && <span className="ml-2 text-emerald-600 font-bold">• Live on Portal</span>}
              </span>
              <div className="flex items-center gap-2">
                {selectedReqForModal.status === 'Approved' && !selectedReqForModal.isPublished && (
                  <button
                    onClick={() => {
                      handlePublish(selectedReqForModal.id);
                      setSelectedReqForModal({ ...selectedReqForModal, isPublished: true });
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Publish to Portal</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedReqForModal(null)}
                  className="px-4 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REVISION FEEDBACK MODAL */}
      {/* ========================================================================= */}
      {viewingRevisionReq && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded shadow-2xl max-w-lg w-full overflow-hidden border border-amber-300">
            <div className="bg-amber-700 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-300" />
                <h3 className="font-bold text-sm">Reviewer Revision Notes</h3>
              </div>
              <button 
                onClick={() => setViewingRevisionReq(null)}
                className="text-amber-200 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                <span className="text-[10px] uppercase font-bold text-amber-900 block mb-1">
                  Feedback from Executive Approver ({viewingRevisionReq.assignedApprover || 'Managing Director'}):
                </span>
                <p className="text-gray-800 text-xs italic leading-relaxed bg-white p-2.5 rounded border border-amber-200">
                  "{viewingRevisionReq.revisionNotes || 'Please adjust the remuneration budget or clarify the key competencies required before final approval.'}"
                </p>
              </div>

              <div className="bg-slate-50 p-2.5 rounded text-[11px] text-gray-600">
                💡 <strong>Next Step:</strong> Click "Revise Requisition & JD" below to open the form with your existing inputs, apply the requested adjustments, and resubmit directly for sign-off.
              </div>
            </div>

            <div className="bg-[#f1f5f9] px-4 py-2.5 border-t border-[#cbd5e1] flex justify-end gap-2">
              <button
                onClick={() => setViewingRevisionReq(null)}
                className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const req = viewingRevisionReq;
                  setViewingRevisionReq(null);
                  if (onSelectRequisitionForEdit) onSelectRequisitionForEdit(req);
                  (onOpenFullRequisition ? onOpenFullRequisition() : onNavigate('create-requisition'));
                }}
                className="px-4 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Revise Requisition & JD</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REJECTION REASON MODAL */}
      {/* ========================================================================= */}
      {viewingRejectionReq && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded shadow-2xl max-w-lg w-full overflow-hidden border border-rose-300">
            <div className="bg-rose-800 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-300" />
                <h3 className="font-bold text-sm">Requisition Rejection Audit Trail</h3>
              </div>
              <button 
                onClick={() => setViewingRejectionReq(null)}
                className="text-rose-200 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded">
                <span className="text-[10px] uppercase font-bold text-rose-900 block mb-1">
                  Rejection Reason:
                </span>
                <p className="text-gray-800 text-xs italic leading-relaxed bg-white p-2.5 rounded border border-rose-200">
                  "{viewingRejectionReq.rejectionReason || 'Declined due to quarterly departmental headcount budget ceiling freeze.'}"
                </p>
              </div>

              <div className="bg-slate-50 p-2.5 rounded text-[11px] text-gray-600">
                💡 <strong>What you can do:</strong> You can clone this requisition into a new draft to modify the proposed terms or save it for next financial quarter without having to retype the full Job Description.
              </div>
            </div>

            <div className="bg-[#f1f5f9] px-4 py-2.5 border-t border-[#cbd5e1] flex justify-end gap-2">
              <button
                onClick={() => setViewingRejectionReq(null)}
                className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded text-xs font-semibold cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  const req = viewingRejectionReq;
                  setViewingRejectionReq(null);
                  handleDuplicate(req);
                }}
                className="px-4 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Clone as New Draft</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Submitting Draft Requisition for Approval */}
      {reqToSubmitForApproval && (
        <ConfirmationModal
          isOpen={true}
          title="Confirm Submission for Executive Approval"
          subtitle="This requisition will be dispatched to the designated approver for formal sign-off."
          variant="primary"
          confirmText="Confirm & Submit for Approval"
          summaryItems={[
            {
              label: 'Requisition Ref',
              value: <span className="font-mono text-gray-700 font-bold">{reqToSubmitForApproval.reqNo}</span>,
              icon: <FileText className="w-3.5 h-3.5 text-gray-400" />
            },
            {
              label: 'Position Title',
              value: <span className="text-[#0f4c81] font-bold">{reqToSubmitForApproval.position}</span>,
              icon: <Briefcase className="w-3.5 h-3.5 text-gray-400" />
            },
            {
              label: 'Department',
              value: reqToSubmitForApproval.department,
              icon: <Building2 className="w-3.5 h-3.5 text-gray-400" />
            },
            {
              label: 'Assigned Approver',
              value: <span className="text-emerald-700 font-bold">{reqToSubmitForApproval.assignedApprover || 'Sarah Namubiru (HR Director)'}</span>,
              icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            },
            {
              label: 'Vacancies & Scale',
              value: `${reqToSubmitForApproval.vacancies} vacancies · ${reqToSubmitForApproval.salaryScale}`
            }
          ]}
          warningMessage={`Upon submission, the requisition status will change to "Pending HR" and lock until review is completed.`}
          onConfirm={() => {
            if (onSubmitRequisitionForApproval) {
              onSubmitRequisitionForApproval(reqToSubmitForApproval.id);
              showSuccess(`Requisition ${reqToSubmitForApproval.reqNo} submitted for sign-off to ${reqToSubmitForApproval.assignedApprover || 'HR Director'}`, 'Submission Confirmed');
            }
            setReqToSubmitForApproval(null);
          }}
          onClose={() => setReqToSubmitForApproval(null)}
        />
      )}

      {/* Confirmation Modal for Deleting Draft */}
      {reqToDelete && (
        <ConfirmationModal
          isOpen={true}
          title="Confirm Deletion of Draft Requisition"
          subtitle="Are you sure you want to permanently delete this draft requisition?"
          variant="danger"
          confirmText="Delete Requisition"
          summaryItems={[
            {
              label: 'Requisition Ref',
              value: <span className="font-mono text-rose-700 font-bold">{reqToDelete.reqNo}</span>
            },
            {
              label: 'Position Title',
              value: reqToDelete.position
            },
            {
              label: 'Department',
              value: reqToDelete.department
            }
          ]}
          warningMessage="This action cannot be undone. All authored Job Advert details and settings in this draft will be removed."
          onConfirm={() => {
            if (onDeleteRequisition) {
              onDeleteRequisition(reqToDelete.id);
              showSuccess(`Draft Requisition ${reqToDelete.reqNo} was removed.`, 'Requisition Deleted');
            }
            setReqToDelete(null);
          }}
          onClose={() => setReqToDelete(null)}
        />
      )}
    </div>
  );
};
