import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Kanban,
  Briefcase,
  UserCheck,
  Mail,
  ShieldCheck,
  BarChart3,
  Settings,
  Globe,
  Shield,
} from 'lucide-react';
import { ActiveView } from '../components/layout/Navbar';
import { AppRole } from './rolePermissions';

export interface NavSubItem {
  id: ActiveView;
  label: string;
}

export interface NavModule {
  id: string;
  label: string;
  icon: LucideIcon;
  views: NavSubItem[];
}

export const NAV_MODULES: NavModule[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    views: [{ id: 'recruitment-command-center', label: 'Overview' }],
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: Kanban,
    views: [
      { id: 'candidate-pipeline', label: 'Kanban' },
      { id: 'candidate-status', label: 'Tracking List' },
      { id: 'job-applicants-report', label: 'Applicant Report' },
    ],
  },
  {
    id: 'requisitions',
    label: 'Requisitions',
    icon: Briefcase,
    views: [
      { id: 'new-staff-requests', label: 'All Requisitions' },
      { id: 'approved-requisitions', label: 'Approved Vacancies' },
    ],
  },
  {
    id: 'selection',
    label: 'Selection',
    icon: UserCheck,
    views: [
      { id: 'pre-shortlist', label: 'Pre-Shortlist' },
      { id: 'confirmed-shortlists', label: 'Shortlists' },
      { id: 'final-interview', label: 'Interview Board' },
      { id: 'selected-candidates', label: 'Selection Matrix' },
    ],
  },
  {
    id: 'offers',
    label: 'Offers',
    icon: Mail,
    views: [
      { id: 'offer-management', label: 'Offer Management' },
      { id: 'candidate-document-status', label: 'Candidate Document Status' },
      { id: 'new-staff-orientation', label: 'Orientation' },
    ],
  },
  {
    id: 'governance',
    label: 'Governance',
    icon: ShieldCheck,
    views: [
      { id: 'new-staff-approval', label: 'Approvals' },
      { id: 'talent-pool', label: 'Talent Pool' },
      { id: 'psychometric-settings', label: 'Test Bank' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    views: [
      { id: 'vacancy-analysis-report', label: 'Vacancy Analysis' },
      { id: 'recruitment-funnel-report', label: 'Funnel' },
      { id: 'psychometric-analytics-report', label: 'Psychometrics' },
      { id: 'budget-utilization-report', label: 'Budget' },
      { id: 'positions-advertised-report', label: 'Positions' },
      { id: 'interview-board-report', label: 'Interview Board' },
      { id: 'offer-onboarding-report', label: 'Offers' },
      { id: 'time-to-hire-report', label: 'Time-to-Hire' },
      { id: 'recruited-by-vote-report', label: 'Recruited by Dept' },
      { id: 'approval-bottlenecks-report', label: 'Approvals SLA' },
      { id: 'grade-readiness-report', label: 'Grade Readiness' },
      { id: 'eeo-diversity-report', label: 'Diversity' },
      { id: 'talent-pool-analytics-report', label: 'Talent Pool' },
    ],
  },
  {
    id: 'settings',
    label: 'Configure',
    icon: Settings,
    views: [
      { id: 'system-configuration', label: 'System Config' },
      { id: 'document-management', label: 'Document Hub' },
    ],
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    views: [{ id: 'user-profiles', label: 'Users & Roles' }],
  },
  {
    id: 'career-portal',
    label: 'Career Portal',
    icon: Globe,
    views: [{ id: 'candidate-portal', label: 'Career Portal' }],
  },
];

const REPORT_VIEWS: ActiveView[] = [
  'vacancy-analysis-report',
  'recruitment-funnel-report',
  'positions-advertised-report',
  'interview-board-report',
  'psychometric-analytics-report',
  'budget-utilization-report',
  'offer-onboarding-report',
  'time-to-hire-report',
  'recruitment-velocity-report',
  'recruited-by-vote-report',
  'approval-bottlenecks-report',
  'grade-readiness-report',
  'eeo-diversity-report',
  'talent-pool-analytics-report',
  'requisition-pipeline-report',
  'applicant-dashboards',
];

export function getModuleForView(view: ActiveView): NavModule {
  for (const mod of NAV_MODULES) {
    if (mod.views.some(v => v.id === view)) return mod;
  }
  if (REPORT_VIEWS.includes(view)) {
    return NAV_MODULES.find(m => m.id === 'analytics')!;
  }
  if (view === 'create-requisition' || view === 'approval-tasks') {
    return NAV_MODULES.find(m => m.id === 'requisitions')!;
  }
  return NAV_MODULES[0];
}

export function getSubNavItems(view: ActiveView, userRole?: AppRole): NavSubItem[] {
  const mod = getModuleForView(view);
  if (mod.id === 'settings' && userRole === 'Candidate') {
    return [];
  }
  if (mod.id === 'security' && userRole === 'Candidate') {
    return [];
  }
  if (mod.id === 'career-portal') {
    return mod.views;
  }
  if (mod.id === 'settings') {
    return mod.views.filter((v) => v.id !== 'candidate-portal');
  }
  if (mod.id === 'security') {
    return mod.views;
  }
  return mod.views;
}
