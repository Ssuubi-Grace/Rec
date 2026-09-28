import React, { useState } from 'react';
import {
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  Calendar,
  TrendingUp,
  ArrowRight,
  Plus,
  Kanban,
  BarChart3,
  Target,
  Award,
  Globe,
  GitBranch,
  UserCheck,
  BrainCircuit,
  AlertTriangle,
  MapPin,
  UserPlus,
  Activity,
  ShieldCheck,
  Inbox,
} from 'lucide-react';
import { Candidate, Requisition, ApprovalTask } from '../../types';
import { ActiveView } from '../layout/Navbar';
import { DonutChart, FunnelBar, PipeFunnelChart, ProgressRing, VacancyStatsBarChart, VacancyStatsPoint } from '../ui/DashboardCharts';
import { TypewriterGreeting } from '../ui/TypewriterGreeting';

const parseMockDate = (value?: string): Date => {
  if (!value) return new Date(0);
  const normalized = value.replace(/\s+/g, ' ').trim();
  const parsed = Date.parse(normalized);
  if (!Number.isNaN(parsed)) return new Date(parsed);
  const match = normalized.match(/^(\d{1,2})[-/](\w{3})[-/](\d{4})/i);
  if (match) return new Date(`${match[2]} ${match[1]}, ${match[3]}`);
  return new Date(0);
};

const formatRelativeTime = (date: Date): string => {
  const now = new Date('2026-09-17T12:00:00');
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
};

const formatInterviewDateLabel = (dateStr?: string): string => {
  if (!dateStr) return 'TBD';
  const date = parseMockDate(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  const today = new Date('2026-09-17T12:00:00');
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const getCandidateRegion = (candidate: Candidate): string =>
  candidate.region || candidate.fieldRegion || candidate.districtOfOrigin || candidate.county || 'Central Region';

const inferInterviewType = (candidate: Candidate): 'Video' | 'On-site' | 'Panel' => {
  const venue = (candidate.interviewVenue || '').toLowerCase();
  if (venue.includes('virtual') || venue.includes('video') || venue.includes('teams') || venue.includes('zoom')) return 'Video';
  if ((candidate.panelists?.length || 0) >= 3) return 'Panel';
  return 'On-site';
};

interface RecruitmentCommandCenterViewProps {
  requisitions: Requisition[];
  candidates: Candidate[];
  approvalTasks: ApprovalTask[];
  onNavigate: (view: ActiveView, param?: string) => void;
  onOpenNewRequisition: () => void;
  onOpenFullRequisition?: () => void;
  userFirstName?: string;
}

export const RecruitmentCommandCenterView: React.FC<RecruitmentCommandCenterViewProps> = ({
  requisitions,
  candidates,
  approvalTasks,
  onNavigate,
  onOpenNewRequisition,
  onOpenFullRequisition,
  userFirstName = 'Grace',
}) => {
  const [funnelView, setFunnelView] = useState<'bars' | 'pipe'>('pipe');
  const pendingApprovals = approvalTasks.filter(t => t.status === 'Pending');
  const hiredCount = candidates.filter(c => ['Offer Accepted', 'Hired'].includes(c.status)).length;
  const totalVacancies = requisitions.reduce((acc, r) => acc + (r.vacancies || 1), 0);
  const livePortal = requisitions.filter(r => r.isPublished).length;
  const approvedReqs = requisitions.filter(r => r.status === 'Approved').length;
  const draftReqs = requisitions.filter(r => r.status === 'Not Submitted').length;
  const pendingReqs = requisitions.filter(r => r.status.includes('Pending')).length;
  const interviewedToday = candidates.filter(c => c.status === 'Interview Scheduled').length;

  const stageCounts = {
    applied: candidates.length,
    screened: candidates.filter(c => ['Pre-Shortlisted', 'Shortlisted'].includes(c.status)).length,
    assessed: candidates.filter(c => ['Assessment Sent', 'Test Completed'].includes(c.status)).length,
    interviewed: candidates.filter(c => ['Interview Scheduled', 'Interview Evaluated'].includes(c.status)).length,
    offered: candidates.filter(c => ['Offer Issued', 'Offer Accepted'].includes(c.status)).length,
    hired: hiredCount,
  };

  const deptMap: Record<string, number> = {};
  requisitions.forEach(r => {
    deptMap[r.department] = (deptMap[r.department] || 0) + (r.vacancies || 1);
  });
  const deptColors = ['#005cb9', '#0070d9', '#10b981', '#8b5cf6', '#06b6d4', '#6366f1'];
  const deptSlices = Object.entries(deptMap).slice(0, 5).map(([label, value], i) => ({
    label,
    value,
    color: deptColors[i % deptColors.length],
  }));

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const quickActions = [
    { label: 'New Requisition', desc: '6-step wizard', icon: Plus, action: onOpenNewRequisition },
    { label: 'Pipeline', desc: 'Kanban board', icon: Kanban, action: () => onNavigate('candidate-pipeline') },
    { label: 'Approvals', desc: `${pendingApprovals.length} pending`, icon: CheckCircle2, action: () => onNavigate('new-staff-approval') },
    { label: 'Interviews', desc: `${interviewedToday} scheduled`, icon: Calendar, action: () => onNavigate('final-interview') },
  ];

  const stageRate = (numerator: number, denominator: number) =>
    denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;

  const conversionSteps = [
    { from: 'Applied', to: 'Screened', rate: stageRate(stageCounts.screened, stageCounts.applied) },
    { from: 'Screened', to: 'Assessed', rate: stageRate(stageCounts.assessed, stageCounts.screened) },
    { from: 'Assessed', to: 'Interview', rate: stageRate(stageCounts.interviewed, stageCounts.assessed) },
    { from: 'Interview', to: 'Offer', rate: stageRate(stageCounts.offered, stageCounts.interviewed) },
    { from: 'Offer', to: 'Hired', rate: stageRate(stageCounts.hired, stageCounts.offered) },
  ];

  const pipeFunnelStages = [
    { label: 'Applicants', value: stageCounts.applied, color: '#234e70' },
    { label: 'Screening', value: stageCounts.screened, color: '#2563eb' },
    { label: 'Interview', value: stageCounts.interviewed, color: '#8b5cf6' },
    { label: 'Offer', value: stageCounts.offered, color: '#7dd3fc' },
    { label: 'Hired', value: stageCounts.hired, color: '#10b981' },
  ];

  const offerAcceptedCount = candidates.filter(c => c.status === 'Offer Accepted').length;
  const offerOutcomeTotal = candidates.filter(c =>
    ['Offer Issued', 'Offer Accepted', 'Offer Declined'].includes(c.status)
  ).length;
  const offerAcceptRate = offerOutcomeTotal > 0
    ? Math.round((offerAcceptedCount / offerOutcomeTotal) * 100)
    : 91;

  const offerIssuedCount = candidates.filter(c => c.status === 'Offer Issued').length;

  const regionColors: Record<string, string> = {
    'Central Region': '#005cb9',
    'Western Region': '#10b981',
    'Eastern Region': '#f59e0b',
    'Northern Region': '#8b5cf6',
    'Diaspora / International': '#06b6d4',
  };
  const regionMap: Record<string, number> = {};
  candidates.forEach(c => {
    const region = getCandidateRegion(c);
    regionMap[region] = (regionMap[region] || 0) + 1;
  });
  const regionSlices = Object.entries(regionMap)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label,
      value,
      color: regionColors[label] || '#64748b',
    }));

  const maleCount = candidates.filter(c => c.gender === 'Male').length;
  const femaleCount = candidates.filter(c => c.gender === 'Female').length;

  const reqApprovalTask = pendingApprovals.find(t => t.taskType === 'Requisition Approval');
  const offerApprovalTask = pendingApprovals.find(t => t.taskType === 'Candidate Offer Approval');
  const preShortlistedByPosition = candidates
    .filter(c => c.status === 'Pre-Shortlisted')
    .reduce<Record<string, { count: number; requisitionId: string }>>((acc, c) => {
      if (!acc[c.position]) acc[c.position] = { count: 0, requisitionId: c.requisitionId };
      acc[c.position].count += 1;
      return acc;
    }, {});
  const topShortlistGroup = Object.entries(preShortlistedByPosition).sort((a, b) => b[1].count - a[1].count)[0];
  const missingScorecards = candidates.filter(c => c.status === 'Interview Scheduled' && !c.interviewScore);

  const priorityActions = [
    reqApprovalTask && {
      id: reqApprovalTask.id,
      code: 'REQ',
      codeBg: 'bg-red-100 text-red-700',
      border: 'border-red-200 bg-red-50/40 hover:bg-red-50/70',
      title: reqApprovalTask.title,
      subtitle: `${reqApprovalTask.submittedBy} • Waiting for ${reqApprovalTask.currentApprover || 'HR Director'} endorsement (SLA Warning)`,
      btnLabel: 'Approve',
      btnClass: 'bg-red-600 hover:bg-red-700 text-white',
      onClick: () => onNavigate('new-staff-approval', reqApprovalTask.referenceNo),
    },
    topShortlistGroup && {
      id: 'shortlist-review',
      code: 'APP',
      codeBg: 'bg-amber-100 text-amber-800',
      border: 'border-amber-200 bg-amber-50/40 hover:bg-amber-50/70',
      title: `Shortlist Review: ${topShortlistGroup[1].count} ${topShortlistGroup[0]} Applicants`,
      subtitle: 'Automated match scoring complete; ready for shortlist confirmation',
      btnLabel: 'Review',
      btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
      onClick: () => onNavigate('pre-shortlist', topShortlistGroup[1].requisitionId),
    },
    missingScorecards.length > 0 && {
      id: 'panel-eval',
      code: 'SCR',
      codeBg: 'bg-purple-100 text-purple-700',
      border: 'border-purple-200 bg-purple-50/40 hover:bg-purple-50/70',
      title: `Panel Evaluation Pending: ${missingScorecards.length} Scorecard${missingScorecards.length > 1 ? 's' : ''} Missing`,
      subtitle: `${missingScorecards[0].position} interview panelist rubrics awaiting final submission`,
      btnLabel: 'Remind',
      btnClass: 'bg-purple-600 hover:bg-purple-700 text-white',
      onClick: () => onNavigate('final-interview', missingScorecards[0].requisitionId),
    },
    offerApprovalTask && {
      id: offerApprovalTask.id,
      code: 'OFR',
      codeBg: 'bg-blue-100 text-blue-700',
      border: 'border-blue-200 bg-blue-50/40 hover:bg-blue-50/70',
      title: offerApprovalTask.title,
      subtitle: `${offerApprovalTask.submittedBy} • Awaiting ${offerApprovalTask.currentApprover || 'HR Director'} sign-off`,
      btnLabel: 'Review',
      btnClass: 'bg-[#005cb9] hover:bg-[#004a94] text-white',
      onClick: () => onNavigate('new-staff-approval', offerApprovalTask.referenceNo),
    },
  ].filter(Boolean) as {
    id: string;
    code: string;
    codeBg: string;
    border: string;
    title: string;
    subtitle: string;
    btnLabel: string;
    btnClass: string;
    onClick: () => void;
  }[];

  const upcomingInterviews = candidates
    .filter(c => c.status === 'Interview Scheduled')
    .map(c => ({
      id: c.id,
      name: c.name,
      role: c.position,
      venue: c.interviewVenue || 'Interview venue TBC',
      dateLabel: formatInterviewDateLabel(c.interviewDate),
      time: c.interviewTime || '09:30 AM',
      dateSort: parseMockDate(c.interviewDate).getTime(),
      type: inferInterviewType(c),
      requisitionId: c.requisitionId,
      isVirtual: inferInterviewType(c) === 'Video',
    }))
    .sort((a, b) => a.dateSort - b.dateSort);

  const recentActivity = [
    ...candidates
      .filter(c => ['Applied', 'Assessment Sent'].includes(c.status))
      .map(c => ({
        sortDate: parseMockDate(c.appliedDate),
        time: formatRelativeTime(parseMockDate(c.appliedDate)),
        text: `New application received — ${c.name} applied for ${c.position}`,
        category: 'Application',
        icon: UserPlus,
        color: '#005cb9',
        onClick: () => onNavigate('candidate-pipeline'),
      })),
    ...candidates
      .filter(c => c.status === 'Interview Scheduled')
      .map(c => ({
        sortDate: parseMockDate(c.interviewDate || c.appliedDate),
        time: formatRelativeTime(parseMockDate(c.interviewDate || c.appliedDate)),
        text: `Interview scheduled — ${c.name}, ${c.position} (${c.interviewVenue || 'Scheduled'})`,
        category: 'Interview',
        icon: Calendar,
        color: '#8b5cf6',
        onClick: () => onNavigate('final-interview', c.requisitionId),
      })),
    ...candidates
      .filter(c => c.status === 'Offer Issued' || c.offerDetails?.status === 'Issued')
      .map(c => {
        const req = requisitions.find(r => r.id === c.requisitionId);
        return {
          sortDate: parseMockDate(c.offerDetails?.issuedDate || c.appliedDate),
          time: formatRelativeTime(parseMockDate(c.offerDetails?.issuedDate || c.appliedDate)),
          text: `Offer issued — ${c.name}, ${c.position} (${req?.reqNo || 'Offer'})`,
          category: 'Offer',
          icon: Inbox,
          color: '#10b981',
          onClick: () => onNavigate('offer-management'),
        };
      }),
    ...candidates
      .filter(c => c.status === 'Pre-Shortlisted')
      .map(c => ({
        sortDate: parseMockDate(c.appliedDate),
        time: formatRelativeTime(parseMockDate(c.appliedDate)),
        text: `Candidate shortlisted — ${c.name} advanced to Pre-Shortlist`,
        category: 'Shortlist',
        icon: UserCheck,
        color: '#0070d9',
        onClick: () => onNavigate('pre-shortlist', c.requisitionId),
      })),
    ...requisitions
      .filter(r => r.status === 'Approved' && r.approvedAt)
      .map(r => ({
        sortDate: parseMockDate(r.approvedAt),
        time: formatRelativeTime(parseMockDate(r.approvedAt)),
        text: `Requisition approved — ${r.position} (${r.reqNo})`,
        category: 'Approval',
        icon: ShieldCheck,
        color: '#f59e0b',
        onClick: () => onNavigate('new-staff-requests', r.id),
      })),
  ]
    .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
    .slice(0, 5);

  const rejectedCount = candidates.filter(c => c.status === 'Rejected').length;
  const scale = Math.max(candidates.length / 13, 0.75);

  const vacancyStatsMonthly: VacancyStatsPoint[] = [
    { label: 'Mar', applications: Math.max(Math.round(18 * scale), 18), interviews: 15, rejected: 20 },
    { label: 'Apr', applications: Math.max(Math.round(22 * scale), 22), interviews: 24, rejected: 21 },
    { label: 'May', applications: Math.max(Math.round(28 * scale), 30), interviews: 15, rejected: 20 },
    { label: 'Jun', applications: Math.max(Math.round(42 * scale), 50), interviews: 25, rejected: 22 },
    { label: 'Jul', applications: Math.max(Math.round(30 * scale), 30), interviews: 24, rejected: 20 },
    { label: 'Aug', applications: Math.max(Math.round(38 * scale), 50), interviews: 16, rejected: 20 },
    { label: 'Sep', applications: Math.max(candidates.length, 35), interviews: Math.max(stageCounts.interviewed, 25), rejected: Math.max(rejectedCount, 21) },
  ];

  const vacancyStatsWeekly: VacancyStatsPoint[] = [
    { label: 'Wk 1', applications: Math.round(8 * scale), interviews: 4, rejected: 3 },
    { label: 'Wk 2', applications: Math.round(11 * scale), interviews: 6, rejected: 4 },
    { label: 'Wk 3', applications: Math.round(9 * scale), interviews: 5, rejected: 3 },
    { label: 'Wk 4', applications: Math.round(13 * scale), interviews: 7, rejected: 5 },
  ];

  const vacancyStatsDaily: VacancyStatsPoint[] = [
    { label: 'Mon', applications: 3, interviews: 1, rejected: 1 },
    { label: 'Tue', applications: 5, interviews: 2, rejected: 1 },
    { label: 'Wed', applications: 2, interviews: 1, rejected: 0 },
    { label: 'Thu', applications: 4, interviews: 2, rejected: 1 },
    { label: 'Fri', applications: 6, interviews: 3, rejected: 2 },
    { label: 'Sat', applications: 1, interviews: 0, rejected: 0 },
    { label: 'Sun', applications: 2, interviews: 1, rejected: 1 },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Welcome hero */}
      <div
        className="page-card p-6 sm:p-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #ffffff 0%, #e6f0fa 45%, #f0f7ff 100%)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: 'var(--color-primary)' }} />
        <div className="relative z-10">
          <p className="text-xs font-semibold text-slate-500">{today}</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            <TypewriterGreeting text={`Hello, ${userFirstName}`} />
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Your recruitment command centre — priorities, pipeline health, and what to do next.
          </p>

          <div className="mt-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Quick Actions</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {quickActions.map(qa => {
                if (!qa.action) return null;
                const Icon = qa.icon;
                return (
                  <button
                    key={qa.label}
                    type="button"
                    onClick={qa.action}
                    className="group bg-white/90 hover:bg-white border border-slate-200/80 hover:border-[var(--color-primary)]/30 rounded-2xl p-3.5 text-left transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 transition-colors"
                      style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-[var(--color-primary)]">{qa.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{qa.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Candidates', value: candidates.length, icon: Users, tint: 'blue', sub: '+24% this month', onClick: () => onNavigate('candidate-pipeline') },
          { label: 'Open Vacancies', value: totalVacancies, icon: Briefcase, tint: 'orange', sub: `${livePortal} live on portal`, onClick: () => onNavigate('new-staff-requests') },
          { label: 'Pending Approvals', value: pendingApprovals.length, icon: CheckCircle2, tint: 'amber', sub: 'Needs sign-off', onClick: () => onNavigate('new-staff-approval') },
          { label: 'Avg. Time-to-Hire', value: '26d', icon: Clock, tint: 'emerald', sub: '3.6d under SLA', onClick: () => onNavigate('time-to-hire-report') },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <button
              key={kpi.label}
              type="button"
              onClick={kpi.onClick}
              className={`dash-kpi dash-kpi-${kpi.tint} text-left w-full cursor-pointer`}
            >
              <div className="flex items-start justify-between">
                <div className={`dash-kpi-icon dash-kpi-icon-${kpi.tint}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">{kpi.value}</div>
              <div className="text-xs font-bold text-slate-600 mt-0.5">{kpi.label}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{kpi.sub}</div>
            </button>
          );
        })}
      </div>

      {/* Charts row 1 — funnel + department */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="page-card p-5">
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Target className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary)' }} />
              <h3 className="text-sm font-bold text-slate-900">Candidate funnel</h3>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-0.5 rounded-full bg-slate-100 p-0.5">
                {(['bars', 'pipe'] as const).map(view => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => setFunnelView(view)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize cursor-pointer transition-all ${
                      funnelView === view
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => onNavigate('recruitment-funnel-report')} className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                Details <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
          {funnelView === 'bars' ? (
            <div className="space-y-3">
              <FunnelBar label="Applied" value={stageCounts.applied} max={stageCounts.applied} color="#94a3b8" />
              <FunnelBar label="Screened" value={stageCounts.screened} max={stageCounts.applied} color="#005cb9" />
              <FunnelBar label="Assessed" value={stageCounts.assessed} max={stageCounts.applied} color="#0070d9" />
              <FunnelBar label="Interviewed" value={stageCounts.interviewed} max={stageCounts.applied} color="#8b5cf6" />
              <FunnelBar label="Offered" value={stageCounts.offered} max={stageCounts.applied} color="#f59e0b" />
              <FunnelBar label="Hired" value={stageCounts.hired} max={stageCounts.applied} color="#10b981" />
            </div>
          ) : (
            <PipeFunnelChart stages={pipeFunnelStages} />
          )}
        </div>

        <div className="page-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <h3 className="text-sm font-bold text-slate-900">Vacancies by Department</h3>
            </div>
            <button type="button" onClick={() => onNavigate('vacancy-analysis-report')} className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
              Report <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {deptSlices.length > 0 ? (
            <DonutChart slices={deptSlices} size={140} centerValue={String(totalVacancies)} centerLabel="Total" />
          ) : (
            <p className="text-sm text-slate-400 py-8 text-center">No vacancy data</p>
          )}
        </div>
      </div>

      {/* Vacancy activity — line / bar / pie (same series as reference dashboard) */}
      <div className="page-card p-5">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <GitBranch className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary)' }} />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Vacancy activity trends</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Applications sent, interviews, and rejections over time</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('vacancy-analysis-report')}
            className="text-xs font-bold flex items-center gap-1 shrink-0"
            style={{ color: 'var(--color-primary)' }}
          >
            Full report <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <VacancyStatsBarChart
          monthly={vacancyStatsMonthly}
          weekly={vacancyStatsWeekly}
          daily={vacancyStatsDaily}
        />
      </div>

      {/* Deep analytics — see Analytics module */}
      <div className="page-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-dashed border-[var(--color-primary)]/30 bg-[var(--color-primary-light)]/40">
        <div>
          <h3 className="text-sm font-bold text-[#001b48]">Need deeper analysis?</h3>
          <p className="text-xs text-slate-600 mt-1">Stage conversion, regional maps, gender representation, and vacancy trends live under Analytics reports.</p>
        </div>
        <button type="button" onClick={() => onNavigate('vacancy-analysis-report')} className="btn btn-primary shrink-0">
          Open Analytics <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Pipeline insight cards removed — metrics live in KPI row + funnel */}

      {/* Priorities & SLA alerts + Upcoming interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 page-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recruitment Priorities &amp; SLA Alerts
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              {priorityActions.length} Item{priorityActions.length === 1 ? '' : 's'} Requiring Action
            </span>
          </div>

          <div className="space-y-3">
            {priorityActions.map(item => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-colors flex items-start justify-between gap-3 ${item.border}`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-[10px] shrink-0 ${item.codeBg}`}>
                    {item.code}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.subtitle}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={item.onClick}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-sm transition-all flex items-center gap-1 ${item.btnClass}`}
                >
                  {item.btnLabel} <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 page-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Upcoming Interviews
              </h3>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              {upcomingInterviews.length} Slot{upcomingInterviews.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="space-y-3">
            {upcomingInterviews.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No interviews scheduled</p>
            ) : (
              upcomingInterviews.map(slot => (
                <div key={slot.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
                  <div className="text-center px-2 py-1 rounded-lg bg-white border border-slate-200 shrink-0 min-w-[56px]">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">{slot.dateLabel}</span>
                    <span className={`text-xs font-black ${slot.isVirtual ? 'text-purple-700' : 'text-blue-700'}`}>
                      {slot.time.replace(' AM', '').replace(' PM', '')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{slot.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{slot.role} • {slot.venue}</div>
                    <span className="inline-block mt-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {slot.type}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('final-interview', slot.requisitionId)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border shrink-0 cursor-pointer transition-colors ${
                      slot.isVirtual
                        ? 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'
                        : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    {slot.isVirtual ? 'Open Call' : 'Scorecard'}
                  </button>
                </div>
              ))
            )}
          </div>
          <button
            type="button"
            onClick={() => onNavigate('final-interview')}
            className="w-full text-xs font-bold py-2 rounded-xl transition-colors hover:bg-[var(--color-primary-light)]"
            style={{ color: 'var(--color-primary)' }}
          >
            View full calendar
          </button>
        </div>
      </div>

      {/* Recruitment snapshot + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 page-card p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            <h3 className="text-sm font-bold text-slate-900">Recruitment Snapshot</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => onNavigate('offer-management')}
              className="rounded-xl p-3 text-left bg-gradient-to-br from-white to-blue-50 border border-blue-100 hover:shadow-sm transition-all cursor-pointer sm:col-span-2"
            >
              <p className="text-[10px] font-semibold text-slate-500">Offer acceptance</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{offerAcceptRate}%</p>
              <p className="text-[9px] font-semibold text-blue-600 mt-1">{offerAcceptedCount} accepted · {offerIssuedCount} awaiting response</p>
            </button>
          </div>

          <div className="flex justify-center mb-4">
            <ProgressRing value={92} label="SLA On Track" color="#10b981" size={76} />
          </div>

          <div className="space-y-2 flex-1">
            {[
              { label: 'Draft requisitions', value: draftReqs, nav: 'new-staff-requests' as ActiveView },
              { label: 'Published on career portal', value: livePortal, nav: 'approved-requisitions' as ActiveView },
              { label: 'Shortlisted candidates', value: stageCounts.screened, nav: 'confirmed-shortlists' as ActiveView },
            ].map(row => (
              <button
                key={row.label}
                type="button"
                onClick={() => onNavigate(row.nav)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50/80 hover:bg-[var(--color-primary-light)]/60 border border-slate-100 hover:border-[var(--color-primary)]/20 transition-all cursor-pointer group"
              >
                <span className="text-[11px] font-semibold text-slate-600 group-hover:text-slate-900">{row.label}</span>
                <span className="text-xs font-black text-slate-900">{row.value}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 page-card overflow-hidden">
          <div
            className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100"
            style={{ background: 'linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
              >
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Latest updates across your pipeline</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('candidate-pipeline')}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ color: 'var(--color-primary)', background: 'var(--color-primary-light)' }}
            >
              View all
            </button>
          </div>

          <div className="p-4 relative">
            {recentActivity.map((item, i) => {
              const Icon = item.icon;
              const isLast = i === recentActivity.length - 1;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={item.onClick}
                  className="flex gap-3 w-full text-left py-2.5 relative group cursor-pointer rounded-xl hover:bg-slate-50/90 px-1 transition-colors"
                >
                  {!isLast && (
                    <div className="absolute left-[52px] top-9 bottom-0 w-px bg-slate-200" />
                  )}
                  <span className="text-[10px] font-semibold text-slate-400 w-11 shrink-0 pt-1.5 text-right leading-tight">
                    {item.time}
                  </span>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ring-2 ring-white"
                    style={{ background: `${item.color}18`, color: item.color }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-[11px] text-slate-700 leading-snug line-clamp-2 group-hover:text-slate-900">
                      {item.text}
                    </p>
                    <span
                      className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{ color: item.color, background: `${item.color}12` }}
                    >
                      {item.category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
