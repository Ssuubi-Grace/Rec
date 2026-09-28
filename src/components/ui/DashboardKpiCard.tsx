import React from 'react';
import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';

export type KpiTheme = 'blue' | 'green' | 'purple' | 'cyan' | 'amber' | 'rose';

const THEME: Record<KpiTheme, { iconBg: string; square: string; up: string; down: string }> = {
  blue: { iconBg: 'bg-blue-500', square: 'bg-blue-400/25', up: 'bg-emerald-50 text-emerald-700', down: 'bg-rose-50 text-rose-700' },
  green: { iconBg: 'bg-emerald-500', square: 'bg-emerald-400/25', up: 'bg-emerald-50 text-emerald-700', down: 'bg-rose-50 text-rose-700' },
  purple: { iconBg: 'bg-violet-500', square: 'bg-violet-400/25', up: 'bg-emerald-50 text-emerald-700', down: 'bg-rose-50 text-rose-700' },
  cyan: { iconBg: 'bg-cyan-500', square: 'bg-cyan-400/25', up: 'bg-emerald-50 text-emerald-700', down: 'bg-rose-50 text-rose-700' },
  amber: { iconBg: 'bg-amber-500', square: 'bg-amber-400/25', up: 'bg-emerald-50 text-emerald-700', down: 'bg-rose-50 text-rose-700' },
  rose: { iconBg: 'bg-rose-500', square: 'bg-rose-400/25', up: 'bg-emerald-50 text-emerald-700', down: 'bg-rose-50 text-rose-700' },
};

interface DashboardKpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  theme?: KpiTheme;
  trend?: { value: number; label: string };
  footer?: React.ReactNode;
  onClick?: () => void;
}

export const DashboardKpiCard: React.FC<DashboardKpiCardProps> = ({
  title, value, icon: Icon, theme = 'blue', trend, footer, onClick,
}) => {
  const s = THEME[theme];
  const Tag = onClick ? 'button' : 'div';
  const up = trend ? trend.value >= 0 : true;

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 text-left w-full ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300 transition-all' : ''
      }`}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.iconBg} text-white shadow-sm`}>
          <Icon className="w-4 h-4" />
        </div>
        <p className="text-sm font-semibold text-slate-600 truncate">{title}</p>
      </div>
      <div className="flex items-end gap-2 flex-wrap">
        <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">{value}</p>
        {trend && (
          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold mb-0.5 ${up ? s.up : s.down}`}>
            {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend.value)}% {trend.label}
          </span>
        )}
      </div>
      {footer && <div className="mt-3 text-[11px] text-slate-400 leading-snug">{footer}</div>}
    </Tag>
  );
};
