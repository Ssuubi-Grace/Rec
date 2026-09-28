import React, { useState } from 'react';
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Users, 
  FileText, 
  Save, 
  CheckCircle2, 
  Plus, 
  Trash2,
  Settings,
  Search,
  Shield,
  X,
} from 'lucide-react';
import { COUNTRY_DIAL_CODES, REGIONS, FIELD_REGIONS, EDUCATION_LEVELS } from '../../data/mockData';
import { ActiveView } from '../layout/Navbar';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import {
  ViewShell, PageHeader, NotificationBanner, FormSection, TabPills, DataTableShell,
} from '../ui/RecruitmentUI';
import {
  ALL_MODULE_IDS,
  AppRole,
  MODULE_LABELS,
  getRoleModules,
  saveRoleModules,
  ModuleId,
  getRoleModulePermissions,
  saveModulePermission,
  saveRoleModulePermissions,
  ModulePermissionSet,
  PermissionAction,
  getSecurityRoleMeta,
  saveSecurityRoleMeta,
} from '../../config/rolePermissions';
import { appendAudit, getAuditTrail, AuditEntry } from '../../config/auditTrail';

interface AccountCreationViewProps {
  onNavigate: (view: ActiveView) => void;
}

export const AccountCreationView: React.FC<AccountCreationViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'education' | 'employment' | 'referees' | 'other'>('personal');
  
  // Personal Info Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryDial, setCountryDial] = useState('+256');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Male');
  const [maritalStatus, setMaritalStatus] = useState('Single');
  const [region, setRegion] = useState('Central Uganda');
  const [fieldRegion, setFieldRegion] = useState('Kampala Metro');
  const [residentialAddress, setResidentialAddress] = useState('');

  // Education items
  const [educationList, setEducationList] = useState([
    { id: '1', level: 'Bachelor Degree', institution: 'Makerere University', field: 'BSc Computer Science', gradYear: '2021', gpa: 'First Class' }
  ]);

  // Employment history items
  const [employmentList, setEmploymentList] = useState([
    { id: '1', company: 'DataCare Uganda Ltd', role: 'Associate Software Developer', startDate: 'Jan 2022', endDate: 'Present', duties: 'Full-stack web application development.' }
  ]);

  // Referees
  const [refereesList, setRefereesList] = useState([
    { id: '1', name: 'Dr. Arthur K.', org: 'DataCare Uganda Ltd', position: 'Managing Director', phone: '0772123456', email: 'arthur.k@datacare.ug' }
  ]);

  const [notification, setNotification] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [accessRole, setAccessRole] = useState<AppRole>('HR');
  const [roleModuleAccess, setRoleModuleAccess] = useState<ModuleId[]>(() => getRoleModules('HR'));
  const [securityTab, setSecurityTab] = useState<'users' | 'roles' | 'audit'>('users');
  const [userSearch, setUserSearch] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [showManageRolesModal, setShowManageRolesModal] = useState<number | null>(null);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [permEditModule, setPermEditModule] = useState<ModuleId | null>(null);
  const [modulePermDraft, setModulePermDraft] = useState<ModulePermissionSet>({ read: true, write: false, create: false });
  const [roleModulePerms, setRoleModulePerms] = useState(() => getRoleModulePermissions('HR'));
  const [roleSettingsOpen, setRoleSettingsOpen] = useState<string | null>(null);
  const [userSettingsOpen, setUserSettingsOpen] = useState<number | null>(null);
  const [auditRows, setAuditRows] = useState<AuditEntry[]>(() => getAuditTrail(30));
  const [assignedRolePick, setAssignedRolePick] = useState('HR Officer');

  const INITIAL_MOCK_USERS = [
    { id: 1, name: 'Grace Ssuubi', email: 'grace.s@datacare.ug', role: 'HR Officer', dept: 'Human Resources', status: 'Active' as const, empNo: 'EMP-1042', locked: false },
    { id: 2, name: 'Sarah Namubiru', email: 'sarah.n@datacare.ug', role: 'System Administrator', dept: 'Human Resources', status: 'Active' as const, empNo: 'EMP-1001', locked: false },
    { id: 3, name: 'Dr. Arthur K.', email: 'arthur.k@datacare.ug', role: 'Head of Department', dept: 'Executive', status: 'Active' as const, empNo: 'EMP-0088', locked: false },
    { id: 4, name: 'David Byamukama', email: 'david.b@datacare.ug', role: 'Interview Panelist', dept: 'Information Technology', status: 'Inactive' as const, empNo: 'EMP-2201', locked: true },
  ];
  const [usersState, setUsersState] = useState(INITIAL_MOCK_USERS);

  const SECURITY_ROLES = [
    { id: 'ROLE-HR', name: 'HR Officer', description: 'Recruitment pipeline, requisitions, and candidate management.', users: 4, status: 'Active' as const },
    { id: 'ROLE-ADMIN', name: 'System Administrator', description: 'Full ProMISe configuration and security administration.', users: 1, status: 'Active' as const },
    { id: 'ROLE-HOD', name: 'Head of Department', description: 'Department requisitions, approvals, and shortlist sign-off.', users: 6, status: 'Active' as const },
    { id: 'ROLE-PANEL', name: 'Interview Panelist', description: 'Interview board scoring and selection matrix access only.', users: 12, status: 'Active' as const },
    { id: 'ROLE-CAND', name: 'Candidate Portal User', description: 'Career portal vacancies, applications, and profile only.', users: 18, status: 'Active' as const, system: true },
  ];

  const ASSIGNABLE_ROLES = SECURITY_ROLES.map((r) => r.name);

  const refreshAudit = () => setAuditRows(getAuditTrail(30));

  const filteredUsers = usersState.filter((u) => {
    const q = userSearch.toLowerCase();
    if (!q) return true;
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.empNo.toLowerCase().includes(q);
  });

  const filteredSecurityRoles = SECURITY_ROLES.filter((r) => {
    const q = roleSearch.toLowerCase();
    if (!q) return true;
    return r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
  });

  const openEditRole = (roleName: string) => {
    const map: Record<string, AppRole> = {
      'HR Officer': 'HR',
      'System Administrator': 'Admin',
      'Head of Department': 'HOD',
      'Interview Panelist': 'Panelist',
      'Candidate Portal User': 'Candidate',
    };
    const appRole = map[roleName] ?? 'HR';
    setAccessRole(appRole);
    setRoleModuleAccess(getRoleModules(appRole));
    setRoleModulePerms(getRoleModulePermissions(appRole));
    setShowEditRoleModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleConfirmSaveAll = () => {
    setShowConfirmModal(false);
    setShowFormModal(false);
    setNotification('✓ User & Staff profile successfully saved into employee database.');
    setTimeout(() => setNotification(null), 4500);
  };

  return (
    <ViewShell className="max-w-6xl">
      <PageHeader
        badge="Security"
        badgeColor="bg-[#e8eef6] text-[#001b48] border-[#c5d4e8]"
        title="Security Management"
        subtitle="Manage system users, security roles, and module access for ProMISe Recruitment."
        actions={
          securityTab === 'users' ? (
            <button type="button" onClick={() => setShowFormModal(true)} className="btn btn-primary btn-lg">
              <Plus className="w-4 h-4" />
              Create User Account
            </button>
          ) : securityTab === 'roles' ? (
            <button type="button" onClick={() => openEditRole('HR Officer')} className="btn btn-primary btn-lg">
              <Plus className="w-4 h-4" />
              Create Security Role
            </button>
          ) : undefined
        }
      />

      {notification && (
        <NotificationBanner message={notification} onDismiss={() => setNotification(null)} variant="success" />
      )}

      <div className="security-mgmt-shell mb-6">
        <div className="security-mgmt-tabs">
          <button
            type="button"
            className={`security-mgmt-tab ${securityTab === 'users' ? 'security-mgmt-tab-active' : ''}`}
            onClick={() => setSecurityTab('users')}
          >
            Users
          </button>
          <button
            type="button"
            className={`security-mgmt-tab ${securityTab === 'roles' ? 'security-mgmt-tab-active' : ''}`}
            onClick={() => setSecurityTab('roles')}
          >
            Roles &amp; Permissions
          </button>
          <button
            type="button"
            className={`security-mgmt-tab ${securityTab === 'audit' ? 'security-mgmt-tab-active' : ''}`}
            onClick={() => { setSecurityTab('audit'); refreshAudit(); }}
          >
            Audit Trail
          </button>
        </div>

        <div className="p-4">
          {securityTab === 'users' && (
            <>
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users by name, email, or employee number…"
                    className="w-full pl-9 pr-3 py-2 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25"
                  />
                </div>
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="standard-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Status</th>
                      <th>Roles</th>
                      <th className="text-center w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center text-xs font-bold shrink-0">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                              <p className="text-[10px] text-slate-500">{u.empNo} · {u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill ${u.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td>
                          <span className="status-pill bg-[#e8eef6] text-[#001b48] border-[#c5d4e8]">{u.role}</span>
                        </td>
                        <td className="text-center relative">
                          <button
                            type="button"
                            title="User settings"
                            onClick={() => setUserSettingsOpen(userSettingsOpen === u.id ? null : u.id)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          {userSettingsOpen === u.id && (
                            <div className="absolute right-4 top-10 z-20 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[160px] text-left">
                              <button type="button" className="w-full px-3 py-2 text-xs font-semibold text-left hover:bg-slate-50 cursor-pointer" onClick={() => { setAssignedRolePick(u.role); setShowManageRolesModal(u.id); setUserSettingsOpen(null); }}>Manage roles</button>
                              <button type="button" className="w-full px-3 py-2 text-xs font-semibold text-left hover:bg-slate-50 cursor-pointer" onClick={() => {
                                setUsersState((prev) => prev.map((x) => x.id === u.id ? { ...x, status: x.status === 'Active' ? 'Inactive' : 'Active' } : x));
                                appendAudit({ actor: 'Grace Ssuubi', action: 'USER_STATUS', entityType: 'User', entityId: u.empNo, detail: `User ${u.name} ${u.status === 'Active' ? 'deactivated' : 'activated'}.` });
                                refreshAudit(); setUserSettingsOpen(null);
                                setNotification(`✓ User ${u.status === 'Active' ? 'deactivated' : 'activated'}.`); setTimeout(() => setNotification(null), 3000);
                              }}>{u.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                              <button type="button" className="w-full px-3 py-2 text-xs font-semibold text-left hover:bg-slate-50 cursor-pointer" onClick={() => {
                                setUsersState((prev) => prev.map((x) => x.id === u.id ? { ...x, locked: !x.locked } : x));
                                appendAudit({ actor: 'Grace Ssuubi', action: 'USER_LOCK', entityType: 'User', entityId: u.empNo, detail: `User ${u.name} ${u.locked ? 'unlocked' : 'locked'}.` });
                                refreshAudit(); setUserSettingsOpen(null);
                              }}>{u.locked ? 'Unlock' : 'Lock'}</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {securityTab === 'roles' && (
            <>
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    placeholder="Search roles by name or code…"
                    className="w-full pl-9 pr-3 py-2 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25"
                  />
                </div>
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="standard-table">
                  <thead>
                    <tr>
                      <th>Security Role</th>
                      <th>Description</th>
                      <th>Usage</th>
                      <th>Status</th>
                      <th className="text-center w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSecurityRoles.map((r) => {
                      const meta = getSecurityRoleMeta(r.id);
                      const statusLabel = !meta.active ? 'Inactive' : meta.locked ? 'Locked' : r.status;
                      return (
                      <tr key={r.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{r.name}</p>
                              <p className="text-[10px] font-mono text-slate-500">{r.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-xs text-slate-600 max-w-xs">{r.description}</td>
                        <td>
                          <span className="status-pill bg-sky-50 text-sky-800 border-sky-200">{r.users} Users</span>
                        </td>
                        <td>
                          <span className="status-pill bg-emerald-50 text-emerald-700 border-emerald-200">
                            {statusLabel}
                            {r.system ? ' · SYSTEM' : ''}
                          </span>
                        </td>
                        <td className="text-center relative">
                          <button
                            type="button"
                            onClick={() => setRoleSettingsOpen(roleSettingsOpen === r.id ? null : r.id)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          {roleSettingsOpen === r.id && (
                            <div className="absolute right-4 top-10 z-20 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[180px] text-left">
                              <button type="button" className="w-full px-3 py-2 text-xs font-semibold text-left hover:bg-slate-50 cursor-pointer" onClick={() => { openEditRole(r.name); setRoleSettingsOpen(null); }}>Configure role</button>
                              <button type="button" className="w-full px-3 py-2 text-xs font-semibold text-left hover:bg-slate-50 cursor-pointer" onClick={() => {
                                const m = getSecurityRoleMeta(r.id);
                                saveSecurityRoleMeta(r.id, { ...m, active: !m.active });
                                appendAudit({ actor: 'Grace Ssuubi', action: 'ROLE_STATUS', entityType: 'Role', entityId: r.id, detail: `Role ${r.name} ${m.active ? 'deactivated' : 'activated'}.` });
                                refreshAudit(); setRoleSettingsOpen(null); setNotification(`✓ Role ${m.active ? 'deactivated' : 'activated'}.`); setTimeout(() => setNotification(null), 3000);
                              }}>{meta.active ? 'Deactivate' : 'Activate'}</button>
                              <button type="button" className="w-full px-3 py-2 text-xs font-semibold text-left hover:bg-slate-50 cursor-pointer" onClick={() => {
                                const m = getSecurityRoleMeta(r.id);
                                saveSecurityRoleMeta(r.id, { ...m, locked: !m.locked });
                                appendAudit({ actor: 'Grace Ssuubi', action: 'ROLE_LOCK', entityType: 'Role', entityId: r.id, detail: `Role ${r.name} ${m.locked ? 'unlocked' : 'locked'}.` });
                                refreshAudit(); setRoleSettingsOpen(null);
                              }}>{meta.locked ? 'Unlock' : 'Lock'}</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {securityTab === 'audit' && (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="standard-table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {auditRows.map((row) => (
                    <tr key={row.id}>
                      <td className="text-[10px] text-slate-500 whitespace-nowrap">{new Date(row.timestamp).toLocaleString()}</td>
                      <td className="font-semibold text-xs">{row.actor}</td>
                      <td><span className="status-pill bg-slate-100 text-slate-700 border-slate-200">{row.action}</span></td>
                      <td className="text-xs">{row.entityType} · {row.entityId}</td>
                      <td className="text-xs text-slate-600">{row.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>


      {showManageRolesModal !== null && (
        <div className="requisition-modal-overlay" onClick={() => setShowManageRolesModal(null)}>
          <div className="requisition-modal-panel max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-2 p-4 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Manage Roles: {usersState.find((u) => u.id === showManageRolesModal)?.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Assign one security role. Role permissions control what appears after login.
                </p>
              </div>
              <button type="button" onClick={() => setShowManageRolesModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 px-1">
                <span>1 role selected</span>
                <button type="button" className="text-[var(--color-primary)] cursor-pointer" onClick={() => setAssignedRolePick('')}>
                  Clear selection
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ASSIGNABLE_ROLES.map((roleName) => {
                  const selected = assignedRolePick === roleName;
                  const meta = SECURITY_ROLES.find((r) => r.name === roleName);
                  return (
                    <label
                      key={roleName}
                      className={`security-role-card flex gap-2 cursor-pointer ${selected ? 'security-role-card-selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="userRolePick"
                        checked={selected}
                        onChange={() => setAssignedRolePick(roleName)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block font-bold text-xs text-slate-900">{roleName}</span>
                        <span className="block text-[10px] text-slate-500 mt-0.5 leading-snug">{meta?.description}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => setShowManageRolesModal(null)}>Cancel</button>
              <button
                type="button"
                className="btn btn-success"
                onClick={() => {
                  setShowManageRolesModal(null);
                  setNotification(`✓ Security role updated for user.`);
                  setTimeout(() => setNotification(null), 3500);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditRoleModal && (
        <div className="requisition-modal-overlay" onClick={() => setShowEditRoleModal(false)}>
          <div className="requisition-modal-panel max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-2 p-4 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Edit Role: {accessRole}</h3>
                <p className="text-[11px] text-slate-500 mt-1">Module permissions define sidebar visibility after login.</p>
              </div>
              <button type="button" onClick={() => setShowEditRoleModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <label className="block text-[11px] font-bold text-slate-600">ProMISe role mapping</label>
              <select
                value={accessRole}
                onChange={(e) => {
                  const role = e.target.value as AppRole;
                  setAccessRole(role);
                  setRoleModuleAccess(getRoleModules(role));
                  setRoleModulePerms(getRoleModulePermissions(role));
                }}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="Admin">Admin</option>
                <option value="HR">HR</option>
                <option value="HOD">HOD</option>
                <option value="Panelist">Panelist</option>
                <option value="Candidate">Candidate</option>
              </select>
              <p className="text-[11px] font-semibold text-slate-600 pt-2">Recruitment module permissions</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {ALL_MODULE_IDS.map((moduleId) => {
                  const checked = roleModuleAccess.includes(moduleId);
                  const perms = roleModulePerms[moduleId];
                  return (
                    <div
                      key={moduleId}
                      className={`px-2.5 py-2 rounded-lg border text-[11px] ${
                        checked ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setRoleModuleAccess((prev) =>
                              checked ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
                            )
                          }
                          className="mt-0.5"
                        />
                        <span className="flex-1">
                          <span className="font-bold block text-slate-800">{MODULE_LABELS[moduleId]}</span>
                          <span className="text-slate-500">
                            {checked && perms
                              ? `R${perms.read ? '✓' : '—'} W${perms.write ? '✓' : '—'} C${perms.create ? '✓' : '—'}`
                              : 'Hidden from navigation'}
                          </span>
                        </span>
                      </label>
                      {checked && (
                        <button
                          type="button"
                          className="mt-2 text-[10px] font-bold text-[var(--color-primary)] cursor-pointer"
                          onClick={() => {
                            setPermEditModule(moduleId);
                            setModulePermDraft(roleModulePerms[moduleId] ?? { read: true, write: false, create: false });
                          }}
                        >
                          Edit permissions →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex items-center justify-between gap-2">
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Valid configuration
              </span>
              <div className="flex gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditRoleModal(false)}>Cancel</button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    if (roleModuleAccess.length === 0) {
                      alert('Select at least one module.');
                      return;
                    }
                    saveRoleModules(accessRole, roleModuleAccess);
                    saveRoleModulePermissions(accessRole, roleModulePerms);
                    appendAudit({
                      actor: 'Grace Ssuubi',
                      action: 'ROLE_UPDATE',
                      entityType: 'Role',
                      entityId: accessRole,
                      detail: `Updated navigation and granular permissions for ${accessRole}.`,
                    });
                    refreshAudit();
                    setShowEditRoleModal(false);
                    setNotification(`✓ Role permissions saved for ${accessRole}.`);
                    setTimeout(() => setNotification(null), 3500);
                  }}
                >
                  Update Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {permEditModule && (
        <div className="requisition-modal-overlay" onClick={() => setPermEditModule(null)}>
          <div className="requisition-modal-panel max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm">Edit permissions: {MODULE_LABELS[permEditModule]}</h3>
                <p className="text-[11px] text-slate-500 mt-1">Read, write, and create actions for this module.</p>
              </div>
              <button type="button" onClick={() => setPermEditModule(null)} className="cursor-pointer"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-4 space-y-2">
              {(['read', 'write', 'create'] as PermissionAction[]).map((action) => (
                <label key={action} className="security-role-card flex items-center gap-3 cursor-pointer capitalize">
                  <input
                    type="checkbox"
                    checked={modulePermDraft[action]}
                    onChange={(e) => setModulePermDraft((p) => ({ ...p, [action]: e.target.checked }))}
                  />
                  <span>
                    <span className="font-bold text-sm block">{action}</span>
                    <span className="text-[10px] text-slate-500">
                      {action === 'read' && 'View records and reports'}
                      {action === 'write' && 'Update existing records'}
                      {action === 'create' && 'Create new records'}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => setPermEditModule(null)}>Cancel</button>
              <button
                type="button"
                className="btn btn-success"
                onClick={() => {
                  setRoleModulePerms((prev) => ({ ...prev, [permEditModule]: modulePermDraft }));
                  saveModulePermission(accessRole, permEditModule, modulePermDraft);
                  appendAudit({
                    actor: 'Grace Ssuubi',
                    action: 'PERM_UPDATE',
                    entityType: 'Permission',
                    entityId: `${accessRole}:${permEditModule}`,
                    detail: `Set ${permEditModule} permissions R=${modulePermDraft.read} W=${modulePermDraft.write} C=${modulePermDraft.create}.`,
                  });
                  refreshAudit();
                  setPermEditModule(null);
                }}
              >
                Save permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {showFormModal && (
        <div className="requisition-modal-overlay" onClick={() => setShowFormModal(false)}>
          <div className="requisition-modal-panel max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <TabPills
              tabs={[
                { id: 'personal', label: 'Personal Info', icon: User },
                { id: 'education', label: 'Education', icon: GraduationCap },
                { id: 'employment', label: 'Employment', icon: Briefcase },
                { id: 'referees', label: 'Referees', icon: Users },
                { id: 'other', label: 'Other Info', icon: FileText },
              ]}
              active={activeTab}
              onChange={(id) => setActiveTab(id as typeof activeTab)}
            />

            <FormSection title="Staff Profile Wizard" subtitle="Complete all sections before saving to the employee database">
        <form onSubmit={handleFormSubmit} className="text-xs text-[#334155] space-y-6">
          
          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold mb-1">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Last / Surname <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Namubiru"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    placeholder="sarah.n@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                  />
                </div>

                {/* Country Code & Mobile Phone (Single + Format) */}
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Country Dial Code <span className="text-red-500">*</span></label>
                    <select
                      value={countryDial}
                      onChange={(e) => setCountryDial(e.target.value)}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2 py-1.5 focus:ring-1 focus:ring-[#001b48] focus:outline-none cursor-pointer font-medium"
                    >
                      {COUNTRY_DIAL_CODES.map(c => (
                        <option key={c.iso} value={c.dialCode}>
                          {c.dialCode} ({c.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1">Mobile Phone Number <span className="text-red-500">*</span></label>
                    <div className="flex items-center">
                      <span className="bg-gray-100 border border-r-0 border-[#cbd5e1] px-2.5 py-1.5 rounded-l text-gray-600 font-mono">
                        {countryDial}
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="772 123456"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-white border border-[#cbd5e1] rounded-r px-2.5 py-1.5 focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* National ID (NIN) */}
                <div>
                  <label className="block font-semibold mb-1">
                    National Identification Number (NIN) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CM90023412X98A"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 focus:ring-1 focus:ring-[#001b48] focus:outline-none font-mono uppercase font-bold text-[#001b48]"
                  />
                </div>

                {/* Region & Field Region */}
                <div>
                  <label className="block font-semibold mb-1">Region <span className="text-red-500">*</span></label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 focus:ring-1 focus:ring-[#001b48] focus:outline-none cursor-pointer"
                  >
                    {REGIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Field Region / Sub-Station <span className="text-red-500">*</span></label>
                  <select
                    value={fieldRegion}
                    onChange={(e) => setFieldRegion(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 focus:ring-1 focus:ring-[#001b48] focus:outline-none cursor-pointer"
                  >
                    {FIELD_REGIONS.map(fr => (
                      <option key={fr} value={fr}>{fr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 focus:ring-1 focus:ring-[#001b48] focus:outline-none cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EDUCATIONAL HISTORY */}
          {activeTab === 'education' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">Academic Qualifications</h3>
                <button
                  type="button"
                  onClick={() => setEducationList([...educationList, { id: `${Date.now()}`, level: 'Diploma', institution: '', field: '', gradYear: '', gpa: '' }])}
                  className="px-2.5 py-1 bg-[#001b48] text-white rounded text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Degree / Diploma
                </button>
              </div>

              {educationList.map((edu, i) => (
                <div key={edu.id} className="p-3 bg-gray-50 border border-gray-200 rounded grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1">Education Level</label>
                    <select
                      value={edu.level}
                      onChange={(e) => {
                        const next = [...educationList];
                        next[i].level = e.target.value;
                        setEducationList(next);
                      }}
                      className="w-full bg-white border rounded p-1"
                    >
                      {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => {
                        const next = [...educationList];
                        next[i].institution = e.target.value;
                        setEducationList(next);
                      }}
                      className="w-full bg-white border rounded p-1"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Field of Study</label>
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) => {
                        const next = [...educationList];
                        next[i].field = e.target.value;
                        setEducationList(next);
                      }}
                      className="w-full bg-white border rounded p-1"
                    />
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <label className="block text-gray-600 mb-1">Year</label>
                      <input
                        type="text"
                        value={edu.gradYear}
                        onChange={(e) => {
                          const next = [...educationList];
                          next[i].gradYear = e.target.value;
                          setEducationList(next);
                        }}
                        className="w-20 bg-white border rounded p-1"
                      />
                    </div>
                    {educationList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setEducationList(educationList.filter((_, idx) => idx !== i))}
                        className="text-red-500 hover:text-red-700 p-1 mb-0.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: EMPLOYMENT HISTORY */}
          {activeTab === 'employment' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">Previous Employment</h3>
                <button
                  type="button"
                  onClick={() => setEmploymentList([...employmentList, { id: `${Date.now()}`, company: '', role: '', startDate: '', endDate: '', duties: '' }])}
                  className="px-2.5 py-1 bg-[#001b48] text-white rounded text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Experience
                </button>
              </div>

              {employmentList.map((emp, i) => (
                <div key={emp.id} className="p-3 bg-gray-50 border border-gray-200 rounded grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1">Employer / Organization</label>
                    <input
                      type="text"
                      value={emp.company}
                      onChange={(e) => {
                        const next = [...employmentList];
                        next[i].company = e.target.value;
                        setEmploymentList(next);
                      }}
                      className="w-full bg-white border rounded p-1"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Role / Position</label>
                    <input
                      type="text"
                      value={emp.role}
                      onChange={(e) => {
                        const next = [...employmentList];
                        next[i].role = e.target.value;
                        setEmploymentList(next);
                      }}
                      className="w-full bg-white border rounded p-1"
                    />
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <label className="block text-gray-600 mb-1">Period</label>
                      <input
                        type="text"
                        placeholder="2021 - 2024"
                        value={emp.startDate}
                        onChange={(e) => {
                          const next = [...employmentList];
                          next[i].startDate = e.target.value;
                          setEmploymentList(next);
                        }}
                        className="w-full bg-white border rounded p-1"
                      />
                    </div>
                    {employmentList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setEmploymentList(employmentList.filter((_, idx) => idx !== i))}
                        className="text-red-500 hover:text-red-700 p-1 mb-0.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: REFEREES */}
          {activeTab === 'referees' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">Professional Referees</h3>
                <button
                  type="button"
                  onClick={() => setRefereesList([...refereesList, { id: `${Date.now()}`, name: '', org: '', position: '', phone: '', email: '' }])}
                  className="px-2.5 py-1 bg-[#001b48] text-white rounded text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Referee
                </button>
              </div>

              {refereesList.map((ref, i) => (
                <div key={ref.id} className="p-3 bg-gray-50 border border-gray-200 rounded grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={ref.name}
                      onChange={(e) => {
                        const next = [...refereesList];
                        next[i].name = e.target.value;
                        setRefereesList(next);
                      }}
                      className="w-full bg-white border rounded p-1"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Organization & Title</label>
                    <input
                      type="text"
                      value={ref.org}
                      onChange={(e) => {
                        const next = [...refereesList];
                        next[i].org = e.target.value;
                        setRefereesList(next);
                      }}
                      className="w-full bg-white border rounded p-1"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={ref.phone}
                      onChange={(e) => {
                        const next = [...refereesList];
                        next[i].phone = e.target.value;
                        setRefereesList(next);
                      }}
                      className="w-full bg-white border rounded p-1"
                    />
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <label className="block text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={ref.email}
                        onChange={(e) => {
                          const next = [...refereesList];
                          next[i].email = e.target.value;
                          setRefereesList(next);
                        }}
                        className="w-full bg-white border rounded p-1"
                      />
                    </div>
                    {refereesList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setRefereesList(refereesList.filter((_, idx) => idx !== i))}
                        className="text-red-500 hover:text-red-700 p-1 mb-0.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: OTHER RELEVANT INFO */}
          {activeTab === 'other' && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Professional Certifications & Memberships</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Certified Information Systems Auditor (CISA), Project Management Professional (PMP)..."
                  className="w-full bg-white border border-[#cbd5e1] rounded p-2 focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Special Awards, Grants, or Honors</label>
                <textarea
                  rows={3}
                  placeholder="List any notable recognitions or publications..."
                  className="w-full bg-white border border-[#cbd5e1] rounded p-2 focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Bottom Submit Action */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'personal') setActiveTab('education');
                else if (activeTab === 'education') setActiveTab('employment');
                else if (activeTab === 'employment') setActiveTab('referees');
                else if (activeTab === 'referees') setActiveTab('other');
              }}
              className="px-4 py-1.5 bg-slate-100 text-slate-700 border border-slate-300 rounded font-semibold hover:bg-slate-200 cursor-pointer"
            >
              Next Tab →
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-[#001b48] hover:bg-[#003366] text-white rounded font-bold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Register Profile</span>
            </button>
          </div>
        </form>
            </FormSection>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Profile Registration */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Confirm Staff Profile Registration"
        subtitle="Review employee registration details before persisting to the central employee database."
        variant="primary"
        confirmText="Confirm & Save Profile"
        summaryItems={[
          {
            label: 'Full Name',
            value: <span className="text-[#001b48] font-bold">{firstName || 'John'} {lastName || 'Doe'}</span>
          },
          {
            label: 'Contact Info',
            value: `${email || 'email@datacare.ug'} · ${countryDial} ${phone || '770000000'}`
          },
          {
            label: 'National ID (NIN)',
            value: <span className="font-mono">{nationalId || 'CM90012345678A'}</span>
          },
          {
            label: 'Placement Region',
            value: `${region} (${fieldRegion})`
          },
          {
            label: 'Education & Experience',
            value: `${educationList.length} qualification(s) · ${employmentList.length} employment record(s)`
          }
        ]}
        warningMessage="This records the employee details into ProMISe ERP database for HR administration and payroll."
        onConfirm={handleConfirmSaveAll}
        onClose={() => setShowConfirmModal(false)}
      />
    </ViewShell>
  );
};
