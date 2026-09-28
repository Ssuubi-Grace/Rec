import React, { useEffect, useState } from 'react';
import {
  PanelLeftClose,
  PanelLeft,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { ActiveView } from './Navbar';
import { NAV_MODULES, getModuleForView } from '../../config/navigation';
import { getRoleModules, AppRole } from '../../config/rolePermissions';

interface SidebarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView, param?: string) => void;
  pendingApprovalsCount: number;
  totalCandidatesCount: number;
  totalRequisitionsCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  userRole: AppRole;
  onSwitchRole: (role: AppRole) => void;
  onLogOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  pendingApprovalsCount,
  totalCandidatesCount,
  isCollapsed,
  onToggleCollapse,
  userRole,
  onSwitchRole,
  onLogOut,
}) => {
  const activeModule = getModuleForView(activeView);
  const [modulesVersion, setModulesVersion] = useState(0);

  useEffect(() => {
    const onUpdate = () => setModulesVersion(v => v + 1);
    window.addEventListener('promise-role-modules-updated', onUpdate);
    return () => window.removeEventListener('promise-role-modules-updated', onUpdate);
  }, []);

  const allowedModuleIds = getRoleModules(userRole);
  const visibleModules = NAV_MODULES.filter(mod => allowedModuleIds.includes(mod.id as typeof allowedModuleIds[number]));
  void modulesVersion;

  const getBadge = (moduleId: string) => {
    if (moduleId === 'governance' && pendingApprovalsCount > 0) return pendingApprovalsCount;
    if (moduleId === 'pipeline') return totalCandidatesCount;
    return undefined;
  };

  return (
    <aside
      className={`ohrm-sidebar sticky top-0 h-screen max-h-screen overflow-y-auto flex flex-col shrink-0 z-30 select-none transition-all duration-300 ${
        isCollapsed ? 'w-[72px]' : 'w-64 sm:w-72'
      }`}
    >
      {/* Brand — DataCare + ProMISe ERP */}
      <div className={`border-b border-slate-100 relative ${isCollapsed ? 'px-2 py-3' : 'px-3 py-3 pr-10'}`}>
        {!isCollapsed ? (
          <div className="flex items-start gap-2.5 min-w-0">
            <img
              src="/images/datacare-logo.png"
              alt="DataCare Uganda"
              className="h-10 w-auto max-w-[92px] object-contain shrink-0 mt-0.5"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-slate-900 text-sm tracking-tight leading-none">
                  ProMISe ERP
                </span>
                <span className="brand-badge">HRMIS</span>
              </div>
              <p className="text-[10px] font-bold mt-1 leading-tight" style={{ color: 'var(--color-primary)' }}>
                Recruitment
              </p>
            </div>
          </div>
        ) : (
          <img
            src="/images/datacare-logo.png"
            alt="DataCare"
            className="mx-auto h-9 w-auto max-w-[56px] object-contain"
            title="ProMISe ERP · Recruitment"
          />
        )}
        {!isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="absolute top-3 right-2 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="p-2 flex justify-center border-b border-slate-100">
          <button type="button" onClick={onToggleCollapse} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Module nav — OrangeHRM style */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {visibleModules.map(mod => {
          const Icon = mod.icon;
          const isActive = activeModule.id === mod.id;
          const badge = getBadge(mod.id);

          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => onNavigate(mod.views[0].id)}
              title={isCollapsed ? mod.label : undefined}
              className={`ohrm-nav-item w-full ${isActive ? 'ohrm-nav-item-active' : ''}`}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left truncate">{mod.label}</span>
                  {badge !== undefined && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/25 text-white' : 'brand-badge-count'}`}>
                      {badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-slate-100">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
              <div className="w-8 h-8 rounded-full brand-badge-count flex items-center justify-center font-bold text-xs shrink-0">
                {userRole === 'Candidate' ? 'RK' : userRole === 'Panelist' ? 'AK' : 'GS'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-800 truncate">
                  {userRole === 'Candidate' ? 'Robert Kintu' : userRole === 'Panelist' ? 'Dr. Arthur K.' : 'Grace Ssuubi'}
                </div>
                <select
                  value={userRole}
                  onChange={e => onSwitchRole(e.target.value as typeof userRole)}
                  className="text-[10px] text-slate-500 bg-transparent border-none p-0 focus:outline-none cursor-pointer w-full"
                >
                  <option value="Admin">Admin</option>
                  <option value="HR">HR</option>
                  <option value="HOD">HOD</option>
                  <option value="Panelist">Panelist</option>
                  <option value="Candidate">Candidate</option>
                </select>
              </div>
            </div>
            {onLogOut && (
              <button
                type="button"
                onClick={onLogOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log out
              </button>
            )}
          </div>
        ) : (
          onLogOut ? (
          <button
            type="button"
            onClick={onLogOut}
            className="w-full flex justify-center p-2 text-slate-400 hover:text-rose-600 cursor-pointer"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
          ) : null
        )}
      </div>
    </aside>
  );
};
