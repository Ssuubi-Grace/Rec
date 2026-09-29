import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Clock, 
  Search, 
  Filter, 
  FileCheck, 
  Layers, 
  AlertCircle,
  ArrowRight,
  Eye,
  Building2,
  User,
  Calendar,
  MessageSquare,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { ApprovalTask, Requisition, OfferLetter, PsychometricTest, Candidate } from '../../types';
import { ActiveView } from '../layout/Navbar';
import { ApprovalActionModal, ApprovalActionType } from '../approval/ApprovalActionModal';
import { ApprovalItemDetailsModal } from '../approval/ApprovalItemDetailsModal';
import {
  ViewShell, PageHeader, MetricGrid, MetricCard, FilterPanel, FilterField,
  DataTableShell, NotificationBanner, GRADIENTS,
} from '../ui/RecruitmentUI';

interface ApprovalTasksViewProps {
  approvalTasks: ApprovalTask[];
  requisitions?: Requisition[];
  offers?: OfferLetter[];
  psychometricTests?: PsychometricTest[];
  candidates?: Candidate[];
  onApproveTask: (taskId: string, comments?: string) => void;
  onRejectTask: (taskId: string, reason: string) => void;
  onReturnTask: (taskId: string, revisionNotes: string) => void;
  onNavigate: (view: ActiveView) => void;
}

export const ApprovalTasksView: React.FC<ApprovalTasksViewProps> = ({
  approvalTasks,
  requisitions = [],
  offers = [],
  psychometricTests = [],
  candidates = [],
  onApproveTask,
  onRejectTask,
  onReturnTask,
  onNavigate,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<ApprovalTask | null>(null);
  
  // Action Modal State (Confirmation with comments)
  const [activeActionTask, setActiveActionTask] = useState<ApprovalTask | null>(null);
  const [activeActionType, setActiveActionType] = useState<ApprovalActionType>('Approve');
  const [notification, setNotification] = useState<string | null>(null);

  const filteredTasks = approvalTasks.filter(t => {
    if (activeFilter === 'Pending' && t.status !== 'Pending') return false;
    if (activeFilter === 'Approved' && t.status !== 'Approved') return false;
    if (activeFilter === 'Returned' && t.status !== 'Returned') return false;
    if (activeFilter === 'Rejected' && t.status !== 'Rejected') return false;

    if (searchTerm) {
      const match = 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.submittedBy || t.initiator || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.referenceNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.taskType || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  // Helpers to resolve related entities for deep inspection
  const getRelatedEntities = (task: ApprovalTask) => {
    let req: Requisition | null = null;
    let off: OfferLetter | null = null;
    let tst: PsychometricTest | null = null;
    let cand: Candidate | null = null;

    if (task.referenceNo) {
      req = requisitions.find(r => r.reqNo === task.referenceNo || r.id === task.relatedEntityId) || null;
      off = offers.find(o => o.id === task.referenceNo || o.id === task.relatedEntityId) || null;
    }
    if (!req) {
      req = requisitions.find(r => task.title.toLowerCase().includes(r.position.toLowerCase())) || null;
    }
    if (!off) {
      off = offers.find(o => task.title.toLowerCase().includes(o.candidateName.toLowerCase())) || null;
    }
    tst = psychometricTests.find(t => task.title.toLowerCase().includes(t.title.toLowerCase()) || t.id === task.relatedEntityId) || null;
    cand = candidates.find(c => task.title.toLowerCase().includes(c.name.toLowerCase()) || c.id === task.relatedEntityId) || null;

    return { req, off, tst, cand };
  };

  const handleOpenActionModal = (task: ApprovalTask, actionType: ApprovalActionType) => {
    setActiveActionTask(task);
    setActiveActionType(actionType);
  };

  const handleConfirmAction = (taskId: string, action: ApprovalActionType, comments: string) => {
    const task = approvalTasks.find(t => t.id === taskId);
    if (action === 'Approve') {
      onApproveTask(taskId, comments);
      setNotification(`✓ Approved: "${task?.title}" has been authorized and moved to active status.`);
    } else if (action === 'Return') {
      onReturnTask(taskId, comments);
      setNotification(`↩ Returned for Revision: "${task?.title}" sent back to initiator with feedback instructions.`);
    } else if (action === 'Reject') {
      onRejectTask(taskId, comments);
      setNotification(`✕ Rejected: "${task?.title}" has been rejected and archived.`);
    }

    setActiveActionTask(null);
    setSelectedTaskForDetails(null);
    setTimeout(() => setNotification(null), 5000);
  };

  const pendingCount = approvalTasks.filter(t => t.status === 'Pending').length;
  const approvedCount = approvalTasks.filter(t => t.status === 'Approved').length;
  const returnedCount = approvalTasks.filter(t => t.status === 'Returned').length;
  const rejectedCount = approvalTasks.filter(t => t.status === 'Rejected').length;

  return (
    <ViewShell>
      {notification && (
        <NotificationBanner message={notification} onDismiss={() => setNotification(null)} variant="info" />
      )}

      <PageHeader
        badge="Governance Workflow"
        badgeColor="bg-indigo-50 text-indigo-700 border-indigo-200"
        title="Executive Workflow & Staff Acquisition Approval Center"
        subtitle="Governance sign-offs across staff requisitions, candidate employment offers, psychometric test banks, and staff onboarding activations."
        actions={
          <button type="button" onClick={() => onNavigate('new-staff-approval')} className="btn btn-primary">
            <ShieldCheck className="w-3.5 h-3.5" />
            New Staff Approval Hub
          </button>
        }
      />

      <MetricGrid cols="grid-cols-2 sm:grid-cols-5">
        <MetricCard label="All Tasks" value={approvalTasks.length} icon={Layers} gradient={GRADIENTS[0]} active={activeFilter === 'All'} onClick={() => setActiveFilter('All')} />
        <MetricCard label="Pending" value={pendingCount} icon={Clock} gradient={GRADIENTS[3]} active={activeFilter === 'Pending'} onClick={() => setActiveFilter('Pending')} />
        <MetricCard label="Approved" value={approvedCount} icon={CheckCircle2} gradient={GRADIENTS[1]} active={activeFilter === 'Approved'} onClick={() => setActiveFilter('Approved')} />
        <MetricCard label="Returned" value={returnedCount} icon={RotateCcw} gradient={GRADIENTS[4]} active={activeFilter === 'Returned'} onClick={() => setActiveFilter('Returned')} />
        <MetricCard label="Rejected" value={rejectedCount} icon={XCircle} gradient={GRADIENTS[5]} active={activeFilter === 'Rejected'} onClick={() => setActiveFilter('Rejected')} />
      </MetricGrid>

      <FilterPanel title="Search Tasks">
        <FilterField label="Search by title, ref no, initiator...">
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </FilterField>
      </FilterPanel>

      <DataTableShell
        title="Approval Workflow Tasks"
        subtitle={`${filteredTasks.length} task(s) matching "${activeFilter}" filter`}
      >
        <table className="standard-table">
          <thead>
            <tr>
              <th className="w-12 text-center">No.</th>
              <th>Workflow Item & Reference</th>
              <th>Department</th>
              <th>Initiator & Approver</th>
              <th>Submission &amp; Closing Dates</th>
              <th className="text-center">Status</th>
              <th className="text-center">Workflow Governance Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0]">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-14 text-center text-gray-500 font-medium">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileCheck className="w-8 h-8 text-gray-300" />
                    <span>No approval tasks found matching this criteria.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTasks.map((t, idx) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 text-center text-gray-500 font-medium align-top">
                    {idx + 1}
                  </td>
                  
                  {/* Title & Ref */}
                  <td className="py-4 px-5 align-top">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                          {t.taskType || 'Governance'}
                        </span>
                        {t.referenceNo && (
                          <span className="font-mono text-[10px] text-gray-600 bg-gray-50 px-1.5 py-0.5 border border-gray-200 rounded">
                            {t.referenceNo}
                          </span>
                        )}
                        {t.priority === 'High' && (
                          <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 text-[9px] font-bold rounded border border-rose-200">
                            HIGH
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-[#0f4c81] text-xs block leading-snug">{t.title}</span>
                      
                      {/* Initiator comments */}
                      {t.comments && (
                        <span className="text-[11px] text-gray-500 block leading-relaxed max-w-md">
                          Note: {t.comments}
                        </span>
                      )}

                      {/* Revision notes or rejection reason if available */}
                      {t.revisionNotes && (
                        <span className="text-[11px] text-amber-800 font-semibold block mt-1 leading-relaxed bg-amber-50/70 p-1.5 rounded border border-amber-200">
                          Revision Feedback: {t.revisionNotes}
                        </span>
                      )}
                      {t.rejectionReason && (
                        <span className="text-[11px] text-rose-800 font-semibold block mt-1 leading-relaxed bg-rose-50/70 p-1.5 rounded border border-rose-200">
                          Rejection Reason: {t.rejectionReason}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Department */}
                  <td className="py-4 px-4 text-gray-700 text-[11px] align-top">
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="font-medium">{t.department || 'Technology'}</span>
                    </div>
                  </td>

                  {/* Initiator & Approver */}
                  <td className="py-4 px-4 text-[11px] align-top">
                    <div className="space-y-1.5 pt-0.5">
                      <span className="text-gray-800 font-medium block">
                        From: {t.submittedBy || t.initiator || 'Staff Lead'}
                      </span>
                      <span className="text-gray-500 text-[10.5px] block">
                        To: {t.currentApprover || t.targetRole || 'Managing Director'}
                      </span>
                    </div>
                  </td>

                  {/* Date Submitted */}
                  <td className="py-4 px-4 text-gray-500 text-[11px] align-top">
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        Submitted: {t.submittedDate || t.dateSubmitted || 'Not recorded'}
                        {getRelatedEntities(t).req?.applicationDeadline && (
                          <small className="block mt-1 text-gray-500">Closes: {getRelatedEntities(t).req?.applicationDeadline}</small>
                        )}
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 text-center align-top">
                    <span className={`inline-block px-2.5 py-1 rounded text-[10.5px] font-bold ${
                      t.status === 'Approved' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : t.status === 'Rejected'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : t.status === 'Returned'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-sky-100 text-sky-800 border border-sky-300'
                    }`}>
                      {t.status === 'Returned' ? 'Returned for Revision' : t.status}
                    </span>
                  </td>

                  {/* Workflow Actions */}
                  <td className="py-4 px-5 text-center whitespace-nowrap align-top">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                      {/* View Full Details Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedTaskForDetails(t)}
                        className="px-2.5 py-1.5 bg-white border border-gray-300 hover:bg-slate-100 text-gray-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        title="View Full Item Details"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#0284c7]" />
                        <span>View Details</span>
                      </button>

                      {t.status === 'Pending' ? (
                        <div className="flex items-center gap-1.5">
                          {/* Approve Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenActionModal(t, 'Approve')}
                            className="px-3 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                            title="Approve Request"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          {/* Return for Revision Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenActionModal(t, 'Return')}
                            className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                            title="Return to Initiator for Revision"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Return</span>
                          </button>

                          {/* Reject Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenActionModal(t, 'Reject')}
                            className="px-2 py-1 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Reject Request with Comment"
                          >
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[11px] italic">
                          Action Completed
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </DataTableShell>

      {/* Item Details Inspector Modal */}
      {selectedTaskForDetails && (() => {
        const { req, off, tst, cand } = getRelatedEntities(selectedTaskForDetails);
        return (
          <ApprovalItemDetailsModal
            task={selectedTaskForDetails}
            requisition={req}
            offer={off}
            test={tst}
            candidate={cand}
            onInitiateAction={(actionType) => {
              handleOpenActionModal(selectedTaskForDetails, actionType);
            }}
            onClose={() => setSelectedTaskForDetails(null)}
          />
        );
      })()}

      {/* Formal Action Confirmation Modal with Required Comments */}
      {activeActionTask && (
        <ApprovalActionModal
          task={activeActionTask}
          actionType={activeActionType}
          onConfirm={handleConfirmAction}
          onClose={() => setActiveActionTask(null)}
        />
      )}
    </ViewShell>
  );
};
