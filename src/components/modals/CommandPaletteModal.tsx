import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  User, 
  Briefcase, 
  FileText, 
  CheckCircle, 
  PlusCircle, 
  Calendar, 
  ArrowRight, 
  Sparkles,
  Command,
  X
} from 'lucide-react';
import { Candidate, Requisition, ApprovalTask } from '../../types';
import { ActiveView } from '../layout/Navbar';
import { answerRecruitmentQuery } from '../../utils/recruitmentSearchEngine';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: Candidate[];
  requisitions: Requisition[];
  approvalTasks?: ApprovalTask[];
  onNavigate: (view: ActiveView, param?: string) => void;
  onOpenNewRequisition: () => void;
  onSelectCandidate?: (candidate: Candidate) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  candidates,
  requisitions,
  approvalTasks = [],
  onNavigate,
  onOpenNewRequisition,
  onSelectCandidate
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard shortcut listener for Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Quick action options
  const quickActions = [
    {
      id: 'act-req',
      label: 'Create New Requisition',
      description: 'Start a 5-step guided requisition wizard with establishment check',
      icon: PlusCircle,
      action: () => {
        onClose();
        onOpenNewRequisition();
      }
    },
    {
      id: 'act-pipeline',
      label: 'Open Candidate Pipeline (Kanban)',
      description: 'View candidates across Kanban stages or list view',
      icon: Briefcase,
      action: () => {
        onClose();
        onNavigate('candidate-pipeline');
      }
    },
    {
      id: 'act-approvals',
      label: 'Review Pending Approvals',
      description: 'Check requisitions, offers, and tests awaiting governance sign-off',
      icon: CheckCircle,
      action: () => {
        onClose();
        onNavigate('approval-tasks');
      }
    },
    {
      id: 'act-interviews',
      label: 'Open Interview Center & Evaluation Board',
      description: 'View schedule, panel assignments, and scorecards',
      icon: Calendar,
      action: () => {
        onClose();
        onNavigate('final-interview');
      }
    },
    {
      id: 'act-offers',
      label: 'Offer Letter Management',
      description: 'Issue official digital offer letters & templates',
      icon: FileText,
      action: () => {
        onClose();
        onNavigate('offer-management');
      }
    }
  ];

  // Matched candidates
  const matchedCandidates = q ? candidates.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.position.toLowerCase().includes(q) || 
    c.department.toLowerCase().includes(q) ||
    c.email.toLowerCase().includes(q) ||
    c.status.toLowerCase().includes(q)
  ).slice(0, 5) : [];

  // Matched requisitions
  const matchedRequisitions = q ? requisitions.filter(r => 
    r.position.toLowerCase().includes(q) || 
    r.department.toLowerCase().includes(q) || 
    r.reqNo.toLowerCase().includes(q) ||
    r.status.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const filteredActions = q 
    ? quickActions.filter(a => a.label.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))
    : quickActions;

  const insights = q.length >= 2
    ? answerRecruitmentQuery(query, { candidates, requisitions, approvalTasks })
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input 
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Ask ProMISe: open vacancies, pending approvals, time to hire…"
            className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button 
              type="button"
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
            ESC
          </kbd>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-100">
          {insights.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[11px] font-bold tracking-wider text-[var(--color-primary)] uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> ProMISe answers
              </div>
              <div className="space-y-2 mt-1">
                {insights.map((ins) => (
                  <div key={ins.id} className="px-3 py-2.5 rounded-lg bg-[var(--color-primary-light)] border border-[#c5daf0]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-[#001b48]">{ins.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{ins.answer}</p>
                      </div>
                      {ins.metric && (
                        <span className="text-lg font-black text-[var(--color-primary)] shrink-0">{ins.metric}</span>
                      )}
                    </div>
                    {ins.navigate && (
                      <button
                        type="button"
                        className="mt-2 text-[11px] font-bold text-[var(--color-primary)] cursor-pointer"
                        onClick={() => {
                          onClose();
                          onNavigate(ins.navigate!.view as ActiveView);
                        }}
                      >
                        {ins.navigate.label} →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Quick Actions
              </div>
              <div className="space-y-1 mt-1">
                {filteredActions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      type="button"
                      onClick={act.action}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-sky-50 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-100/70 text-sky-700 flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800 group-hover:text-sky-900">
                            {act.label}
                          </div>
                          <div className="text-xs text-slate-500">
                            {act.description}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matched Candidates */}
          {matchedCandidates.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase flex items-center justify-between">
                <span>Candidates</span>
                <span className="text-[10px] text-slate-400">{matchedCandidates.length} matches</span>
              </div>
              <div className="space-y-1 mt-1">
                {matchedCandidates.map((cand) => (
                  <button
                    key={cand.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onSelectCandidate) {
                        onSelectCandidate(cand);
                      }
                      onNavigate('candidate-pipeline');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {cand.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <span>{cand.name}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                            {cand.matchScore}% Match
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {cand.position} • {cand.department}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {cand.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Requisitions */}
          {matchedRequisitions.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase flex items-center justify-between">
                <span>Requisitions & Vacancies</span>
                <span className="text-[10px] text-slate-400">{matchedRequisitions.length} matches</span>
              </div>
              <div className="space-y-1 mt-1">
                {matchedRequisitions.map((req) => (
                  <button
                    key={req.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigate('new-staff-requests', req.id);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {req.position}
                        </div>
                        <div className="text-xs text-slate-500">
                          {req.reqNo} • {req.department} • {req.vacancies} vacancies
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state if nothing matched */}
          {q && filteredActions.length === 0 && matchedCandidates.length === 0 && matchedRequisitions.length === 0 && insights.length === 0 && (
            <div className="py-8 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <div className="text-sm font-medium text-slate-600">No results found for &ldquo;{query}&rdquo;</div>
              <div className="text-xs text-slate-400 mt-1">Try searching by candidate name, job title, department, or action.</div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>Navigate with <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↑</kbd> <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↓</kbd></span>
            <span>Select with <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↵</kbd></span>
          </div>
          <div>ProMISe intelligent search</div>
        </div>
      </div>
    </div>
  );
};
