import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  FileText, 
  Users, 
  Calendar, 
  Bell, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { ApprovalTask, Candidate, Requisition } from '../../types';
import { ActiveView } from '../layout/Navbar';

interface AttentionCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  approvalTasks: ApprovalTask[];
  candidates: Candidate[];
  requisitions: Requisition[];
  onNavigate: (view: ActiveView, param?: string) => void;
}

export const AttentionCenterDrawer: React.FC<AttentionCenterDrawerProps> = ({
  isOpen,
  onClose,
  approvalTasks,
  candidates,
  requisitions,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'notifications'>('tasks');

  if (!isOpen) return null;

  const pendingApprovals = approvalTasks.filter(t => t.status === 'Pending');
  const unreviewedCandidates = candidates.filter(c => c.status === 'Applied');
  const interviewPendingEvaluations = candidates.filter(c => c.status === 'Interview Scheduled' && !c.interviewScore);
  const closingVacancies = requisitions.filter(r => r.status === 'Approved' && r.isPublished);

  // Operational items needing attention
  const urgentTasks = [
    {
      id: 'task-appr-1',
      type: 'approval',
      title: 'Senior Accountant Requisition Approval',
      subtitle: 'Awaiting Director HR approval for 4 days • Target: 2 days',
      badge: 'Overdue SLA',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      actionLabel: 'Review Requisition',
      action: () => {
        onClose();
        onNavigate('approval-tasks');
      }
    },
    {
      id: 'task-cand-unscreened',
      type: 'screening',
      title: '23 ICT Officer Applications Unreviewed',
      subtitle: 'Applications closed on 15 Sep • Screening backlog',
      badge: 'Action Needed',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      actionLabel: 'Review Applicants',
      action: () => {
        onClose();
        onNavigate('pre-shortlist');
      }
    },
    {
      id: 'task-eval-pending',
      type: 'evaluation',
      title: 'Interview Feedback: 3 Panel Evaluations Outstanding',
      subtitle: 'Systems Analyst panel evaluations pending submission',
      badge: 'Pending Panelists',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      actionLabel: 'Send Reminder',
      action: () => {
        onClose();
        onNavigate('final-interview');
      }
    },
    {
      id: 'task-vac-closing',
      type: 'vacancy',
      title: 'Accountant Recruitment Vacancy Closes Tomorrow',
      subtitle: 'Public career portal deadline: 17 Sep 2026 23:59',
      badge: 'Closing Soon',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      actionLabel: 'View Vacancy',
      action: () => {
        onClose();
        onNavigate('positions-advertised-report');
      }
    }
  ];

  // Informational notifications
  const notifications = [
    {
      id: 'notif-1',
      title: 'Sarah Namuli accepted interview invitation',
      time: '10 min ago',
      category: 'Interview RSVP',
      icon: Calendar,
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      id: 'notif-2',
      title: 'Senior Systems Analyst requisition approved by Head of ICT',
      time: '32 min ago',
      category: 'Governance Approval',
      icon: CheckCircle,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      id: 'notif-3',
      title: 'Dr. Arthur submitted interview evaluation for John Okello (88%)',
      time: '1 hr ago',
      category: 'Scorecard Submitted',
      icon: FileText,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      id: 'notif-4',
      title: 'Vacancy publication completed on Internal Staff Portal',
      time: 'Yesterday at 16:30',
      category: 'Job Publication',
      icon: ExternalLink,
      color: 'text-slate-600 bg-slate-50'
    },
    {
      id: 'notif-5',
      title: 'Apollo Mukasa completed Online Technical Assessment (Score: 92%)',
      time: 'Yesterday at 11:20',
      category: 'Psychometric Test',
      icon: CheckCircle,
      color: 'text-indigo-600 bg-indigo-50'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Attention Centre</h2>
              <p className="text-xs text-slate-500">Operational alerts & action items</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Tasks (Actions) vs Notifications (Info) */}
        <div className="flex border-b border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'tasks'
                ? 'border-red-600 text-red-700 bg-red-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>Tasks Requiring Action</span>
            <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
              {urgentTasks.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'notifications'
                ? 'border-blue-600 text-blue-700 bg-blue-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>Notifications</span>
            <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full">
              {notifications.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
          {activeTab === 'tasks' ? (
            <>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Requires Your Immediate Attention
              </div>
              <div className="space-y-3">
                {urgentTasks.map((t) => (
                  <div 
                    key={t.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">{t.title}</h4>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${t.badgeColor}`}>
                        {t.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3 pl-6">{t.subtitle}</p>
                    <div className="pl-6">
                      <button
                        type="button"
                        onClick={t.action}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 group cursor-pointer"
                      >
                        <span>{t.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Recent Hiring Activity
              </div>
              <div className="space-y-2.5">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div 
                      key={n.id}
                      className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-start gap-3"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 leading-snug">
                          {n.title}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                          <span>{n.category}</span>
                          <span>{n.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Enterprise SLA Guard</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigate('approval-tasks');
            }}
            className="text-blue-600 font-bold hover:underline cursor-pointer"
          >
            View All Tasks →
          </button>
        </div>
      </div>
    </div>
  );
};
