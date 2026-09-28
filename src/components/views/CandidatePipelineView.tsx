import React, { useMemo, useRef, useState } from 'react';
import {
  Kanban,
  List,
  Users,
  ArrowRight,
  ChevronRight,
  Calendar,
  Sparkles,
  GripVertical,
  UserCheck,
  BrainCircuit,
  CheckCircle2,
  Mail,
  Award,
  Briefcase,
  Archive,
} from 'lucide-react';
import { Candidate, Requisition } from '../../types';
import { ActiveView } from '../layout/Navbar';
import { PageHeader, ViewShell } from '../ui/RecruitmentUI';
import { CandidateQuickViewDrawer } from '../modals/CandidateQuickViewDrawer';
import { PipelineStageCard, PIPELINE_STAGE_COLORS } from '../ui/PipelineStageCard';

interface CandidatePipelineViewProps {
  candidates: Candidate[];
  requisitions: Requisition[];
  onNavigate: (view: ActiveView, param?: string) => void;
  onUpdateCandidateStatus?: (candidateId: string, newStatus: Candidate['status']) => void;
  onScheduleInterview?: (candidate: Candidate) => void;
  onSelectCandidateForOffer?: (candidate: Candidate) => void;
  onTransferToTalentPool?: (candidate: Candidate) => void;
}

const STAGES: Candidate['status'][] = [
  'Pre-Shortlisted',
  'Assessment Sent',
  'Interview Scheduled',
  'Selected',
  'Offer Issued',
  'Offer Accepted',
  'Hired',
  'Talent Pool',
];

const STAGE_META: Record<
  Candidate['status'],
  { accent: string; light: string; label: string }
> = {
  Applied: { accent: '#64748b', light: '#f8fafc', label: 'Applied' },
  'Pre-Shortlisted': { accent: '#005cb9', light: '#eff6ff', label: 'Pre-Shortlisted' },
  'Assessment Sent': { accent: '#7c3aed', light: '#f5f3ff', label: 'Assessment' },
  'Test Completed': { accent: '#6366f1', light: '#eef2ff', label: 'Test Done' },
  'Interview Scheduled': { accent: '#d97706', light: '#fffbeb', label: 'Interview' },
  'Interview Evaluated': { accent: '#c026d3', light: '#fdf4ff', label: 'Evaluated' },
  Selected: { accent: '#059669', light: '#ecfdf5', label: 'Selected' },
  'Offer Issued': { accent: '#0891b2', light: '#ecfeff', label: 'Offer Issued' },
  'Offer Accepted': { accent: '#db2777', light: '#fdf2f8', label: 'Offer Accepted' },
  'Offer Declined': { accent: '#e11d48', light: '#fff1f2', label: 'Declined' },
  Orientation: { accent: '#0d9488', light: '#f0fdfa', label: 'Orientation' },
  Hired: { accent: '#16a34a', light: '#f0fdf4', label: 'Hired' },
  'Talent Pool': { accent: '#475569', light: '#f8fafc', label: 'Talent Pool' },
  Rejected: { accent: '#dc2626', light: '#fef2f2', label: 'Rejected' },
};

const STAGE_ICONS: Partial<Record<Candidate['status'] | 'all', typeof Users>> = {
  all: Users,
  'Pre-Shortlisted': UserCheck,
  'Assessment Sent': BrainCircuit,
  'Interview Scheduled': Calendar,
  Selected: CheckCircle2,
  'Offer Issued': Mail,
  'Offer Accepted': Award,
  Hired: Briefcase,
  'Talent Pool': Archive,
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const matchScoreTone = (score: number) => {
  if (score >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (score >= 70) return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

export const CandidatePipelineView: React.FC<CandidatePipelineViewProps> = ({
  candidates,
  onNavigate,
  onUpdateCandidateStatus,
  onScheduleInterview,
  onSelectCandidateForOffer,
  onTransferToTalentPool,
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [focusedStage, setFocusedStage] = useState<Candidate['status'] | 'all'>('all');
  const columnRefs = useRef<Partial<Record<Candidate['status'], HTMLDivElement | null>>>({});

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    STAGES.forEach(stage => {
      counts[stage] = candidates.filter(c => c.status === stage).length;
    });
    return counts;
  }, [candidates]);

  const visibleStages =
    focusedStage === 'all' ? STAGES : STAGES.filter(s => s === focusedStage);

  const scrollToStage = (stage: Candidate['status'] | 'all') => {
    setFocusedStage(stage);
    if (stage !== 'all') {
      requestAnimationFrame(() => {
        columnRefs.current[stage]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      });
    }
  };

  const handleAdvance = (candidate: Candidate, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const idx = STAGES.indexOf(candidate.status);
    if (idx < 0 || idx >= STAGES.length - 1 || !onUpdateCandidateStatus) return;
    onUpdateCandidateStatus(candidate.id, STAGES[idx + 1]);
  };

  const handleDrawerAdvance = (candidate: Candidate, nextStage: Candidate['status']) => {
    onUpdateCandidateStatus?.(candidate.id, nextStage);
    setSelectedCandidate(prev => (prev?.id === candidate.id ? { ...prev, status: nextStage } : prev));
  };

  return (
    <ViewShell className="space-y-4">
      <PageHeader
        badge="Pipeline"
        badgeColor="bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[#c5daf0]"
        title={`${candidates.length} Active Applicants`}
        subtitle="Drag-free Kanban with clickable cards — open any candidate for screening, documents, and stage actions."
        actions={
          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-primary">
              <Kanban className="w-4 h-4" />
              Kanban
            </button>
            <button type="button" onClick={() => onNavigate('candidate-status')} className="btn btn-secondary">
              <List className="w-4 h-4" />
              Tracking List
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-2">
        {[
          { key: 'all' as const, label: 'All stages', value: candidates.length, ...PIPELINE_STAGE_COLORS.all, icon: Users },
          ...STAGES.map(stage => ({
            key: stage,
            label: STAGE_META[stage].label,
            value: stageCounts[stage] || 0,
            accent: STAGE_META[stage].accent,
            light: STAGE_META[stage].light,
            icon: STAGE_ICONS[stage] || Users,
          })),
        ].map(item => (
          <PipelineStageCard
            key={String(item.key)}
            label={item.label}
            value={item.value}
            accent={item.accent}
            lightBg={item.light}
            icon={item.icon}
            total={candidates.length}
            active={focusedStage === item.key}
            onClick={() => scrollToStage(item.key === 'all' ? 'all' : (item.key as Candidate['status']))}
            compact
          />
        ))}
      </div>

      <div className="page-card p-3 sm:p-4 overflow-hidden">
        <div className="flex items-center justify-between gap-3 mb-3 px-1">
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{visibleStages.length}</span> columns
            {focusedStage !== 'all' && (
              <>
                {' '}
                · filtered to{' '}
                <button
                  type="button"
                  onClick={() => setFocusedStage('all')}
                  className="font-bold text-[var(--color-primary)] hover:underline cursor-pointer"
                >
                  show all
                </button>
              </>
            )}
          </p>
          <p className="text-[10px] text-slate-400 hidden sm:block">Click a card to open candidate preview</p>
        </div>

        <div className="kanban-board-scroll -mx-1 px-1">
          <div className="flex gap-3 min-w-min pb-2">
            {visibleStages.map(stage => {
              const meta = STAGE_META[stage];
              const stageCandidates = candidates.filter(c => c.status === stage);
              const nextStageIdx = STAGES.indexOf(stage) + 1;
              const hasNextStage = nextStageIdx < STAGES.length;

              return (
                <div
                  key={stage}
                  ref={el => {
                    columnRefs.current[stage] = el;
                  }}
                  className="kanban-column w-[272px] shrink-0 flex flex-col max-h-[min(68vh,640px)]"
                  style={{ background: meta.light }}
                >
                  <div
                    className="kanban-column-header px-3 py-2.5 border-b border-slate-200/80"
                    style={{ borderTopColor: meta.accent, borderTopWidth: 3 }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-700 truncate">
                        {meta.label}
                      </h3>
                      <span
                        className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: `${meta.accent}18`, color: meta.accent }}
                      >
                        {stageCandidates.length}
                      </span>
                    </div>
                  </div>

                  <div className="kanban-column-body flex-1 overflow-y-auto p-2.5 space-y-2.5">
                    {stageCandidates.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-3 py-8 text-center">
                        <p className="text-[11px] font-semibold text-slate-400">No candidates</p>
                        <p className="text-[10px] text-slate-300 mt-0.5">Stage is empty</p>
                      </div>
                    ) : (
                      stageCandidates.map(candidate => (
                        <button
                          key={candidate.id}
                          type="button"
                          onClick={() => setSelectedCandidate(candidate)}
                          className="kanban-card group w-full text-left p-3 bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-[var(--color-primary)]/35 transition-all cursor-pointer relative overflow-hidden"
                        >
                          <div className="flex items-start gap-2.5">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-extrabold shrink-0 shadow-sm"
                              style={{ background: `${meta.accent}14`, color: meta.accent }}
                            >
                              {getInitials(candidate.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1">
                                <p className="text-sm font-bold text-slate-900 truncate leading-tight group-hover:text-[var(--color-primary)] transition-colors">
                                  {candidate.name}
                                </p>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[var(--color-primary)] shrink-0 mt-0.5 transition-colors" />
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">{candidate.position}</p>
                            </div>
                          </div>

                          <div className="flex items-center flex-wrap gap-1.5 mt-2.5">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${matchScoreTone(candidate.matchScore)}`}
                            >
                              <Sparkles className="w-2.5 h-2.5 inline -mt-px mr-0.5" />
                              {candidate.matchScore}%
                            </span>
                            <span className="text-[9px] font-semibold text-slate-400 truncate">
                              {candidate.department}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {candidate.appliedDate}
                            </span>
                            {hasNextStage && onUpdateCandidateStatus && (
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={e => handleAdvance(candidate, e)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleAdvance(candidate, e as unknown as React.MouseEvent);
                                  }
                                }}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 hover:bg-[var(--color-primary-light)]"
                                style={{ color: 'var(--color-primary)' }}
                              >
                                Advance
                                <ArrowRight className="w-3 h-3" />
                              </span>
                            )}
                            {stage === 'Selected' && onSelectCandidateForOffer && (
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={e => {
                                  e.stopPropagation();
                                  onSelectCandidateForOffer(candidate);
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onSelectCandidateForOffer(candidate);
                                  }
                                }}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Offer
                              </span>
                            )}
                          </div>

                          <GripVertical className="absolute top-2 right-1 w-3 h-3 text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <CandidateQuickViewDrawer
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onAdvanceStage={handleDrawerAdvance}
        onScheduleInterview={onScheduleInterview}
        onOpenOffer={onSelectCandidateForOffer}
        onTransferToTalentPool={c => {
          onTransferToTalentPool?.(c);
          setSelectedCandidate(null);
        }}
      />
    </ViewShell>
  );
};
