import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Clock, 
  FileText, 
  ArrowRight, 
  UserCheck,
  BrainCircuit,
  Play,
  MessageSquare,
  AlertCircle,
  Eye,
  Send,
  X,
  Sparkles,
  Building2,
  Calendar
} from 'lucide-react';
import { Candidate, ApprovalTask, PsychometricTest, Requisition, OfferLetter } from '../../types';
import { ActiveView } from '../layout/Navbar';
import { ApprovalActionModal, ApprovalActionType } from '../approval/ApprovalActionModal';
import { ApprovalItemDetailsModal } from '../approval/ApprovalItemDetailsModal';
import {
  ViewShell, PageHeader, MetricGrid, MetricCard, FilterPanel, FilterField,
  NotificationBanner, TabPills, GRADIENTS,
} from '../ui/RecruitmentUI';

interface NewStaffApprovalViewProps {
  candidates: Candidate[];
  approvalTasks: ApprovalTask[];
  psychometricTests?: PsychometricTest[];
  requisitions?: Requisition[];
  offers?: OfferLetter[];
  onApproveTask: (taskId: string, comments?: string) => void;
  onRejectTask: (taskId: string, reason: string) => void;
  onReturnTask?: (taskId: string, revisionNotes: string) => void;
  onApprovePsychometricTest?: (testId: string) => void;
  onRequestRevisionPsychometricTest?: (testId: string, notes: string) => void;
  onLaunchTestPlayer?: (test: PsychometricTest) => void;
  onNavigate: (view: ActiveView) => void;
}

export const NewStaffApprovalView: React.FC<NewStaffApprovalViewProps> = ({
  candidates,
  approvalTasks,
  psychometricTests = [],
  requisitions = [],
  offers = [],
  onApproveTask,
  onRejectTask,
  onReturnTask,
  onApprovePsychometricTest,
  onRequestRevisionPsychometricTest,
  onLaunchTestPlayer,
  onNavigate,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'requisitions' | 'tests'>('all');
  const [activeStatusTab, setActiveStatusTab] = useState<'pending' | 'completed'>('pending');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Inspector & Action Modal State
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<ApprovalTask | null>(null);
  const [activeActionTask, setActiveActionTask] = useState<ApprovalTask | null>(null);
  const [activeActionType, setActiveActionType] = useState<ApprovalActionType>('Approve');
  const [notification, setNotification] = useState<string | null>(null);

  const pendingTasks = approvalTasks.filter(t => t.status === 'Pending');
  const completedTasks = approvalTasks.filter(t => t.status !== 'Pending');

  const pendingTests = psychometricTests.filter(t => t.status === 'Pending Approval');
  const completedTests = psychometricTests.filter(t => t.status !== 'Pending Approval');

  // Search filtering
  const filterTaskBySearch = (t: ApprovalTask) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.title.toLowerCase().includes(term) ||
      (t.referenceNo || '').toLowerCase().includes(term) ||
      (t.department || '').toLowerCase().includes(term) ||
      (t.submittedBy || t.initiator || '').toLowerCase().includes(term) ||
      (t.taskType || '').toLowerCase().includes(term)
    );
  };

  const filterTestBySearch = (test: PsychometricTest) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      test.title.toLowerCase().includes(term) ||
      (test.targetRole || '').toLowerCase().includes(term) ||
      (test.category || '').toLowerCase().includes(term) ||
      (test.createdBy || '').toLowerCase().includes(term)
    );
  };

  const displayedTasks = (activeStatusTab === 'pending' ? pendingTasks : completedTasks).filter(filterTaskBySearch);
  const displayedTests = (activeStatusTab === 'pending' ? pendingTests : completedTests).filter(filterTestBySearch);

  const totalPendingCount = pendingTasks.length + pendingTests.length;

  const handleOpenActionModal = (task: ApprovalTask, actionType: ApprovalActionType) => {
    setActiveActionTask(task);
    setActiveActionType(actionType);
  };

  const handleConfirmAction = (taskId: string, action: ApprovalActionType, comments: string) => {
    const task = approvalTasks.find(t => t.id === taskId);
    if (action === 'Approve') {
      onApproveTask(taskId, comments);
      setNotification(`✓ Approved: "${task?.title}" has been authorized.`);
    } else if (action === 'Return') {
      if (onReturnTask) {
        onReturnTask(taskId, comments);
      } else {
        onRejectTask(taskId, comments);
      }
      setNotification(`↩ Returned for Revision: "${task?.title}" sent back to initiator with feedback.`);
    } else if (action === 'Reject') {
      onRejectTask(taskId, comments);
      setNotification(`✕ Rejected: "${task?.title}" has been rejected.`);
    }

    setActiveActionTask(null);
    setSelectedTaskForDetails(null);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleTestApprovalAction = (test: PsychometricTest, action: ApprovalActionType, comments: string) => {
    if (action === 'Approve') {
      if (onApprovePsychometricTest) {
        onApprovePsychometricTest(test.id);
      }
      setNotification(`✓ Psychometric Test Battery "${test.title}" activated for live recruitment.`);
    } else if (action === 'Return' || action === 'Reject') {
      if (onRequestRevisionPsychometricTest) {
        onRequestRevisionPsychometricTest(test.id, comments);
      }
      setNotification(`↩ Test Battery "${test.title}" returned with revision instructions.`);
    }

    setActiveActionTask(null);
    setSelectedTaskForDetails(null);
    setTimeout(() => setNotification(null), 5000);
  };

  // Resolves related entities for deep inspection
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

  return (
    <ViewShell>
      {notification && (
        <NotificationBanner message={notification} onDismiss={() => setNotification(null)} variant="success" />
      )}

      <PageHeader
        badge="Executive Governance"
        badgeColor="bg-blue-50 text-blue-700 border-blue-200"
        title="Executive & Governance Approvals Hub"
        subtitle="Multi-tier executive governance for staff requisitions, candidate offers, and psychometric assessment batteries."
        actions={
          <>
            <button type="button" onClick={() => onNavigate('approval-tasks')} className="btn btn-secondary">
              <FileText className="w-3.5 h-3.5" />
              All Workflow Tasks
            </button>
            <button type="button" onClick={() => onNavigate('psychometric-settings')} className="btn btn-primary">
              <BrainCircuit className="w-3.5 h-3.5" />
              Test Battery Bank
            </button>
          </>
        }
      />

      <MetricGrid cols="grid-cols-2 sm:grid-cols-4">
        <MetricCard label="Pending Review" value={totalPendingCount} icon={Clock} gradient={GRADIENTS[3]} />
        <MetricCard label="Req & Offers Pending" value={pendingTasks.length} icon={FileText} gradient={GRADIENTS[0]} />
        <MetricCard label="Tests Pending" value={pendingTests.length} icon={BrainCircuit} gradient={GRADIENTS[2]} />
        <MetricCard label="Completed" value={completedTasks.length + completedTests.length} icon={CheckCircle2} gradient={GRADIENTS[1]} />
      </MetricGrid>

      <TabPills
        tabs={[
          { id: 'all', label: 'All Approvals', count: activeStatusTab === 'pending' ? totalPendingCount : completedTasks.length + completedTests.length },
          { id: 'requisitions', label: 'Requisitions & Offers', count: activeStatusTab === 'pending' ? pendingTasks.length : completedTasks.length, icon: FileText },
          { id: 'tests', label: 'Psychometric Tests', count: activeStatusTab === 'pending' ? pendingTests.length : completedTests.length, icon: BrainCircuit },
        ]}
        active={activeCategory}
        onChange={(id) => setActiveCategory(id as 'all' | 'requisitions' | 'tests')}
      />

      <TabPills
        tabs={[
          { id: 'pending', label: 'Pending Review', count: totalPendingCount },
          { id: 'completed', label: 'Approval History', count: completedTasks.length + completedTests.length },
        ]}
        active={activeStatusTab}
        onChange={(id) => setActiveStatusTab(id as 'pending' | 'completed')}
      />

      <FilterPanel title="Search Approvals">
        <FilterField label="Search by Ref, Title, Dept, Initiator...">
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </FilterField>
      </FilterPanel>

      {/* SECTION: Psychometric Test Approvals */}
      {(activeCategory === 'all' || activeCategory === 'tests') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
            <h3 className="text-xs font-bold text-[#0f4c81] uppercase tracking-wider flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-[#0284c7]" />
              <span>Psychometric Assessment Battery Approvals ({displayedTests.length})</span>
            </h3>
            <span className="text-[11px] text-gray-500 font-medium">
              Maker: Question Setter • Checker: Head of HR / Quality Board
            </span>
          </div>

          {displayedTests.length === 0 ? (
            <div className="bg-white border border-[#cbd5e1] rounded-md p-6 text-center text-gray-500 text-xs">
              {activeStatusTab === 'pending'
                ? 'No psychometric test batteries currently pending approval.'
                : 'No approved test batteries match your search filter.'}
            </div>
          ) : (
            <div className="space-y-4">
              {displayedTests.map(test => {
                // Synthetic task for unified modal
                const testApprovalTask: ApprovalTask = {
                  id: test.id,
                  taskType: 'Psychometric Test Approval',
                  title: `Approve Test Battery: ${test.title}`,
                  referenceNo: test.id,
                  department: 'HR / Talent Assessment',
                  submittedBy: test.createdBy || 'Sarah M. (Lead Question Setter)',
                  submittedDate: test.createdDate || '18-Aug-2026',
                  currentApprover: 'Dr. Arthur K. (Head of HR / Quality Board)',
                  status: (test.status === 'Active' ? 'Approved' : test.status === 'Needs Revision' ? 'Returned' : 'Pending') as any,
                  comments: `Configured with ${test.questions.length} questions, ${test.durationMinutes} min timer, and ${test.passingScorePct}% pass benchmark.`,
                  revisionNotes: test.revisionNotes
                };

                return (
                  <div
                    key={test.id}
                    className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs hover:border-slate-300 text-xs space-y-4 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#0f4c81]">{test.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            test.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                            test.status === 'Needs Revision' ? 'bg-amber-100 text-amber-800' :
                            'bg-purple-100 text-purple-900 border border-purple-200'
                          }`}>
                            {test.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-600">
                          Author / Setter: <strong>{test.createdBy || 'Sarah M. (Lead Question Setter)'}</strong> • Date Submitted: <strong>{test.createdDate || '18-Aug-2026'}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded font-bold border border-blue-200">
                          {test.category}
                        </span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded font-bold border border-emerald-200">
                          Pass Mark: {test.passingScorePct}%
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded font-bold border border-slate-200">
                          {test.questions.length} Questions ({test.durationMinutes} min)
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-md border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-gray-800 block mb-1">Sections Configured:</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(test.sections || ['numerical', 'logical']).map(sec => (
                            <span key={sec} className="bg-white border border-slate-300 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              {sec.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Test Drive Button for Approver - styled in theme navy */}
                      <button
                        type="button"
                        onClick={() => onLaunchTestPlayer && onLaunchTestPlayer(test)}
                        className="px-3.5 py-1.5 bg-[#0f4c81] hover:bg-[#0a3358] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 text-sky-300" />
                        <span>Test Drive / Battery Sandbox</span>
                      </button>
                    </div>

                    {/* Approver Action Buttons */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedTaskForDetails(testApprovalTask)}
                        className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-slate-100 text-gray-700 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#0284c7]" />
                        <span>Inspect Full Question Bank</span>
                      </button>

                      {test.status === 'Pending Approval' ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenActionModal(testApprovalTask, 'Return')}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Return for Revision</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenActionModal(testApprovalTask, 'Approve')}
                            className="px-4 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve & Activate</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-[11px]">
                          Status: <strong>{test.status}</strong> {test.approvedBy && `(By ${test.approvedBy})`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION: Requisition & Offer Approvals */}
      {(activeCategory === 'all' || activeCategory === 'requisitions') && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
            <h3 className="text-xs font-bold text-[#0f4c81] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#0284c7]" />
              <span>Headcount Requisitions & Staff Offers ({displayedTasks.length})</span>
            </h3>
          </div>

          {displayedTasks.length === 0 ? (
            <div className="bg-white border border-[#cbd5e1] rounded-md p-6 text-center text-gray-500 text-xs">
              {activeStatusTab === 'pending'
                ? 'No staff requisitions or employment offers awaiting your authorization.'
                : 'No requisition or offer approval history matches your search filter.'}
            </div>
          ) : (
            <div className="space-y-4">
              {displayedTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs hover:border-slate-300 text-xs space-y-4 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <span className="font-bold text-sm text-[#0f4c81] block">{task.title}</span>
                      <span className="text-[11px] text-gray-500">
                        Initiator: <strong>{task.submittedBy || task.initiator}</strong> • Date Submitted: <strong>{task.submittedDate || task.dateSubmitted}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded font-bold border border-blue-200">
                        {task.department || 'Technology'}
                      </span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded font-bold ${
                        task.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        task.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                        task.status === 'Returned' ? 'bg-amber-100 text-amber-800' :
                        'bg-sky-100 text-sky-800'
                      }`}>
                        {task.status === 'Returned' ? 'Returned for Revision' : task.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 bg-slate-50 p-3 rounded-md border border-gray-200">
                    {task.comments || task.details}
                  </p>

                  {task.revisionNotes && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900">
                      <strong>↩ Revision Instructions Sent to Initiator:</strong> {task.revisionNotes}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedTaskForDetails(task)}
                      className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-slate-100 text-gray-700 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#0284c7]" />
                      <span>View Specifications</span>
                    </button>

                    {task.status === 'Pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(task, 'Reject')}
                          className="px-3 py-1.5 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Reject</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(task, 'Return')}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Return for Revision</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(task, 'Approve')}
                          className="px-4 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Request</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-[11px] italic">Completed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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

      {/* Action Confirmation Modal */}
      {activeActionTask && (
        <ApprovalActionModal
          task={activeActionTask}
          actionType={activeActionType}
          onConfirm={(taskId, action, comments) => {
            if (activeActionTask.taskType === 'Psychometric Test Approval') {
              const matchingTest = psychometricTests.find(t => t.id === taskId);
              if (matchingTest) {
                handleTestApprovalAction(matchingTest, action, comments);
                return;
              }
            }
            handleConfirmAction(taskId, action, comments);
          }}
          onClose={() => setActiveActionTask(null)}
        />
      )}
    </ViewShell>
  );
};
