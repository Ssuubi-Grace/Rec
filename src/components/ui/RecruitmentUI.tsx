import React from 'react';
import { Download, LucideIcon, ChevronRight } from 'lucide-react';

/* ─── Page Header ─── */
interface PageHeaderProps {
  badge?: string;
  badgeColor?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  badge,
  badgeColor = 'bg-blue-50 text-blue-700 border-blue-200',
  title,
  subtitle,
  actions,
}) => (
  <div className="page-card p-5">
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        {badge && (
          <span className={`status-pill ${badgeColor} mb-2 inline-flex`}>{badge}</span>
        )}
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  </div>
);

/* ─── Colored Metric Cards ─── */
const GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-sky-600',
  'from-fuchsia-500 to-purple-600',
  'from-lime-500 to-green-600',
] as const;

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  gradient?: string;
  sublabel?: string;
  active?: boolean;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon: Icon,
  gradient = GRADIENTS[0],
  sublabel,
  active,
  onClick,
}) => {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`metric-card text-left w-full transition-all ${
        active ? 'ring-2 ring-blue-500 border-blue-200 bg-blue-50/50' : ''
      } ${onClick ? 'cursor-pointer hover:border-blue-200 hover:shadow-md' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">{label}</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{value}</p>
          {sublabel && <p className="text-[11px] text-slate-500 mt-0.5">{sublabel}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
    </Tag>
  );
};

interface MetricGridProps {
  children: React.ReactNode;
  cols?: string;
}

export const MetricGrid: React.FC<MetricGridProps> = ({
  children,
  cols = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
}) => (
  <div className={`grid ${cols} gap-3`}>{children}</div>
);

/* ─── Filter Panel ─── */
interface FilterPanelProps {
  title?: string;
  children: React.ReactNode;
  onReset?: () => void;
  onApply?: () => void;
  defaultOpen?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  title = 'Filters',
  children,
  onReset,
  onApply,
  defaultOpen = true,
}) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="page-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <span>{title}</span>
        <span className="text-slate-400 font-normal">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div className="p-4 space-y-3 app-form">
          {children}
          {(onReset || onApply) && (
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              {onReset && (
                <button type="button" onClick={onReset} className="btn btn-secondary">
                  Reset
                </button>
              )}
              {onApply && (
                <button type="button" onClick={onApply} className="btn btn-primary">
                  Apply Filters
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const FilterField: React.FC<{
  label: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, children, className = '' }) => (
  <div className={`form-field ${className}`}>
    <label>{label}</label>
    {children}
  </div>
);

/* ─── Data Table Shell ─── */
interface DataTableShellProps {
  title: string;
  subtitle?: string;
  onExport?: () => void;
  exportLabel?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const DataTableShell: React.FC<DataTableShellProps> = ({
  title,
  subtitle,
  onExport,
  exportLabel = 'Export to Excel',
  actions,
  children,
  footer,
}) => (
  <div className="table-card">
    <div className="report-no-print px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/80">
      <div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {actions}
        {onExport && (
          <button type="button" onClick={onExport} className="btn btn-success">
            <Download className="w-4 h-4" />
            {exportLabel}
          </button>
        )}
      </div>
    </div>
    <div className="overflow-x-auto">{children}</div>
    {footer}
  </div>
);

/* ─── Tab Pills ─── */
interface TabPill {
  id: string;
  label: string;
  count?: number;
  icon?: LucideIcon;
  color?: string;
}

interface TabPillsProps {
  tabs: TabPill[];
  active: string;
  onChange: (id: string) => void;
}

export const TabPills: React.FC<TabPillsProps> = ({ tabs, active, onChange }) => (
  <div className="page-card p-1.5">
    <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
              isActive
                ? tab.color || 'bg-[var(--color-primary)] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

/* ─── Notification Banner ─── */
export const NotificationBanner: React.FC<{
  message: string;
  onDismiss?: () => void;
  variant?: 'success' | 'warning' | 'info';
}> = ({ message, onDismiss, variant = 'success' }) => {
  const colors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };
  return (
    <div className={`p-3 border rounded-xl text-sm font-semibold flex items-center justify-between ${colors[variant]}`}>
      <span>{message}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="font-bold opacity-70 hover:opacity-100 ml-2">
          ✕
        </button>
      )}
    </div>
  );
};

/* ─── Form Section Card ─── */
export const FormSection: React.FC<{
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ title, subtitle, icon: Icon, children, actions }) => (
  <div className="page-card p-5 space-y-4 app-form">
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
      <div className="flex items-start gap-2">
        {Icon && <Icon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions}
    </div>
    {children}
  </div>
);

/* ─── View Shell wrapper ─── */
export const ViewShell: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`space-y-5 max-w-7xl mx-auto app-form animate-in fade-in duration-200 ${className}`}>
    {children}
  </div>
);

/* ─── CSV Export Helper ─── */
export function exportCsv(filename: string, headers: string, rows: string[]) {
  const csv = 'data:text/csv;charset=utf-8,' + headers + '\n' + rows.join('\n');
  const link = document.createElement('a');
  link.href = encodeURI(csv);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ─── Pagination ─── */
export const TablePagination: React.FC<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => (
  <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
    <span className="text-slate-500">
      Showing{' '}
      <strong className="text-slate-800">
        {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)}–
        {Math.min(totalItems, currentPage * itemsPerPage)}
      </strong>{' '}
      of <strong className="text-slate-800">{totalItems}</strong>
    </span>
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="btn btn-secondary px-2.5 py-1 disabled:opacity-40"
      >
        «
      </button>
      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={`px-3 py-1 rounded-xl text-xs font-bold ${
            currentPage === p ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="btn btn-secondary px-2.5 py-1 disabled:opacity-40"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

export { GRADIENTS };
