import React, { useEffect, useRef, useState } from 'react';
import { Search, Bell, PanelLeft, User, LogOut, ChevronDown } from 'lucide-react';
import { ActiveView } from './Navbar';
import { getModuleForView } from '../../config/navigation';

export interface PortalSessionUser {
  email: string;
  name: string;
}

interface HeaderProps {
  userRole?: 'Admin' | 'HR' | 'HOD' | 'Candidate' | 'Panelist';
  pendingTasksCount?: number;
  onOpenCommandPalette?: () => void;
  onOpenAttentionCenter?: () => void;
  onToggleSidebar?: () => void;
  activeView?: ActiveView;
  portalUser?: PortalSessionUser | null;
  onPortalLogOff?: () => void;
  staffUser?: PortalSessionUser | null;
  onStaffLogOut?: () => void;
}

const VIEW_TITLES: Partial<Record<ActiveView, string>> = {
  'recruitment-command-center': 'Dashboard',
  'candidate-pipeline': 'Candidate Pipeline',
  'candidate-status': 'Applicant Tracking',
  'job-applicants-report': 'Applicant Report',
  'new-staff-requests': 'Staff Requisitions',
  'approved-requisitions': 'Approved Vacancies',
  'pre-shortlist': 'Pre-Shortlist',
  'confirmed-shortlists': 'Confirmed Shortlists',
  'final-interview': 'Interview Board',
  'selected-candidates': 'Selection Matrix',
  'offer-management': 'Offer Management',
  'document-management': 'Document Hub',
  'candidate-document-status': 'Candidate Document Status',
  'new-staff-orientation': 'Orientation',
  'new-staff-approval': 'Approvals',
  'talent-pool': 'Talent Pool',
  'psychometric-settings': 'Test Bank',
  'system-configuration': 'System Configuration',
  'user-profiles': 'Security Management',
  'candidate-portal': 'Career Portal',
};

const ROLE_LABELS: Record<NonNullable<HeaderProps['userRole']>, string> = {
  Admin: 'System Administrator',
  HR: 'HR Officer',
  HOD: 'Head of Department',
  Panelist: 'Interview Panelist',
  Candidate: 'Candidate',
};

export const Header: React.FC<HeaderProps> = ({
  userRole = 'Admin',
  pendingTasksCount = 0,
  onOpenCommandPalette,
  onOpenAttentionCenter,
  onToggleSidebar,
  activeView = 'recruitment-command-center',
  portalUser = null,
  onPortalLogOff,
  staffUser = null,
  onStaffLogOut,
}) => {
  const module = getModuleForView(activeView);
  const pageTitle = VIEW_TITLES[activeView] || (activeView.includes('report') ? 'Analytics Report' : 'Recruitment');
  const isPortalView = activeView === 'candidate-portal';
  const displayName = isPortalView
    ? (portalUser?.name ?? 'Guest')
    : (staffUser?.name ?? 'Grace Ssuubi');
  const displayEmail = isPortalView ? portalUser?.email : staffUser?.email;
  const roleLabel =
    isPortalView && !portalUser
      ? 'Guest · Career Portal'
      : ROLE_LABELS[userRole];

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const handleLogOut = () => {
    setMenuOpen(false);
    if (isPortalView && portalUser && onPortalLogOff) {
      onPortalLogOff();
      return;
    }
    onStaffLogOut?.();
  };

  return (
    <header className="ohrm-header sticky top-0 z-20">
      <div className="ohrm-header-bar">
        <div className="flex items-center gap-3 min-w-0">
          {onToggleSidebar && (
            <button type="button" onClick={onToggleSidebar} className="lg:hidden p-1.5 rounded-lg text-white/80 hover:bg-white/10">
              <PanelLeft className="w-5 h-5" />
            </button>
          )}
          <div className="min-w-0">
            {module.label !== pageTitle && (
              <div className="text-[11px] text-white/80 font-medium truncate">
                {module.label} / {pageTitle}
              </div>
            )}
            <h1 className="text-base sm:text-lg font-bold text-white truncate">{pageTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenCommandPalette && (
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-xs text-white/90 cursor-pointer transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Search</span>
              <kbd className="hidden md:inline bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-mono">⌘K</kbd>
            </button>
          )}

          {onOpenAttentionCenter && (
            <button
              type="button"
              onClick={onOpenAttentionCenter}
              className="relative p-2 rounded-xl text-white/90 hover:bg-white/15 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {pendingTasksCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {pendingTasksCount}
                </span>
              )}
            </button>
          )}

          <div className="relative pl-2 border-l border-white/20" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 py-1 pr-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center shrink-0 overflow-hidden">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block text-left min-w-0 max-w-[160px]">
                <span className="block text-xs font-semibold text-white truncate">{displayName}</span>
                <span className="block text-[10px] text-white/75 truncate">{roleLabel}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-white/80 hidden sm:block transition-transform shrink-0 ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="header-user-menu header-user-menu-wide" role="menu">
                <div className="px-3 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                  {displayEmail ? (
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{displayEmail}</p>
                  ) : null}
                  <p className="text-[10px] font-semibold text-[var(--color-primary)] mt-1">{roleLabel}</p>
                </div>
                {(onStaffLogOut || onPortalLogOff) && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogOut}
                    className="header-user-menu-item header-user-menu-item-danger cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log out
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
