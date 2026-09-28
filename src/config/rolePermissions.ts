export type AppRole = 'Admin' | 'HR' | 'HOD' | 'Candidate' | 'Panelist';

export const ALL_MODULE_IDS = [
  'dashboard',
  'pipeline',
  'requisitions',
  'selection',
  'offers',
  'governance',
  'analytics',
  'settings',
  'security',
  'career-portal',
] as const;

export type ModuleId = (typeof ALL_MODULE_IDS)[number];

export type PermissionAction = 'read' | 'write' | 'create';

export type ModulePermissionSet = Record<PermissionAction, boolean>;

export type RoleModulePermissions = Partial<Record<ModuleId, ModulePermissionSet>>;

export const MODULE_LABELS: Record<ModuleId, string> = {
  dashboard: 'Dashboard',
  pipeline: 'Pipeline',
  requisitions: 'Requisitions',
  selection: 'Selection',
  offers: 'Offers & Onboarding',
  governance: 'Governance',
  analytics: 'Analytics',
  settings: 'Configure',
  security: 'Security',
  'career-portal': 'Career Portal',
};

export const DEFAULT_ROLE_MODULES: Record<AppRole, ModuleId[]> = {
  Admin: [...ALL_MODULE_IDS],
  HR: [...ALL_MODULE_IDS],
  HOD: ['dashboard', 'pipeline', 'requisitions', 'selection', 'governance'],
  Panelist: ['selection'],
  Candidate: ['career-portal'],
};

const MODULES_STORAGE_KEY = 'promise_role_modules_v1';
const PERMS_STORAGE_KEY = 'promise_role_module_perms_v1';
const ROLE_META_STORAGE_KEY = 'promise_security_roles_meta_v1';

type StoredRoleMap = Partial<Record<AppRole, ModuleId[]>>;

export interface SecurityRoleMeta {
  active: boolean;
  locked: boolean;
}

type StoredRoleMeta = Partial<Record<string, SecurityRoleMeta>>;

function readModuleStore(): StoredRoleMap {
  try {
    const raw = localStorage.getItem(MODULES_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoredRoleMap;
  } catch {
    return {};
  }
}

function defaultPermSet(role: AppRole, full = false): ModulePermissionSet {
  const canWrite = role === 'Admin' || role === 'HR' || full;
  const canCreate = role === 'Admin' || role === 'HR';
  return { read: true, write: canWrite, create: canCreate };
}

function buildDefaultPermissions(role: AppRole): RoleModulePermissions {
  const modules = DEFAULT_ROLE_MODULES[role];
  const map: RoleModulePermissions = {};
  modules.forEach((id) => {
    map[id] = defaultPermSet(role, id === 'selection' && role === 'Panelist');
  });
  return map;
}

export function getRoleModules(role: AppRole): ModuleId[] {
  const stored = readModuleStore()[role];
  if (stored && stored.length > 0) {
    const defaults = DEFAULT_ROLE_MODULES[role];
    const merged = [...stored];
    defaults.forEach((id) => {
      if (!merged.includes(id)) merged.push(id);
    });
    return merged;
  }
  return DEFAULT_ROLE_MODULES[role];
}

export function saveRoleModules(role: AppRole, modules: ModuleId[]) {
  const map = readModuleStore();
  map[role] = modules;
  localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(map));
  window.dispatchEvent(new CustomEvent('promise-role-modules-updated', { detail: { role } }));
}

function readPermStore(): Partial<Record<AppRole, RoleModulePermissions>> {
  try {
    const raw = localStorage.getItem(PERMS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<Record<AppRole, RoleModulePermissions>>;
  } catch {
    return {};
  }
}

export function getRoleModulePermissions(role: AppRole): RoleModulePermissions {
  const stored = readPermStore()[role];
  if (stored && Object.keys(stored).length > 0) return stored;
  return buildDefaultPermissions(role);
}

export function getModulePermission(role: AppRole, moduleId: ModuleId): ModulePermissionSet {
  const all = getRoleModulePermissions(role);
  return all[moduleId] ?? { read: false, write: false, create: false };
}

export function saveModulePermission(
  role: AppRole,
  moduleId: ModuleId,
  perms: ModulePermissionSet
) {
  const store = readPermStore();
  const current = store[role] ?? buildDefaultPermissions(role);
  current[moduleId] = perms;
  store[role] = current;
  localStorage.setItem(PERMS_STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent('promise-role-perms-updated', { detail: { role, moduleId } }));
}

export function saveRoleModulePermissions(role: AppRole, perms: RoleModulePermissions) {
  const store = readPermStore();
  store[role] = perms;
  localStorage.setItem(PERMS_STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent('promise-role-perms-updated', { detail: { role } }));
}

function readRoleMetaStore(): StoredRoleMeta {
  try {
    const raw = localStorage.getItem(ROLE_META_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoredRoleMeta;
  } catch {
    return {};
  }
}

export function getSecurityRoleMeta(roleKey: string): SecurityRoleMeta {
  const stored = readRoleMetaStore()[roleKey];
  return stored ?? { active: true, locked: false };
}

export function saveSecurityRoleMeta(roleKey: string, meta: SecurityRoleMeta) {
  const store = readRoleMetaStore();
  store[roleKey] = meta;
  localStorage.setItem(ROLE_META_STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent('promise-role-meta-updated', { detail: { roleKey } }));
}
