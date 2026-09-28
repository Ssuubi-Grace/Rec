import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface PipelineStageCardProps {
  label: string;
  value: number;
  accent: string;
  lightBg?: string;
  icon: LucideIcon;
  total?: number;
  active?: boolean;
  onClick?: () => void;
  /** Smaller padding — used on Applicant Tracking List */
  compact?: boolean;
  showProgress?: boolean;
  /** @deprecated No longer rendered; kept for call-site compatibility */
  showDecoration?: boolean;
}

export const PipelineStageCard: React.FC<PipelineStageCardProps> = ({
  label,
  value,
  accent,
  lightBg = '#f8fafc',
  icon: Icon,
  total = 0,
  active = false,
  onClick,
  compact = false,
  showProgress = true,
}) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`rounded-xl border text-left w-full transition-all ${
        compact ? 'p-2.5' : 'p-3'
      } ${
        active
          ? 'shadow-sm'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
      } ${onClick ? 'cursor-pointer' : ''}`}
      style={
        active
          ? {
              background: lightBg,
              borderColor: `${accent}66`,
              boxShadow: `inset 3px 0 0 0 ${accent}`,
            }
          : undefined
      }
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`rounded-lg flex items-center justify-center shrink-0 text-white ${
            compact ? 'w-6 h-6' : 'w-7 h-7'
          }`}
          style={{ backgroundColor: accent }}
        >
          <Icon className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        </span>
        <p
          className={`flex-1 min-w-0 font-semibold text-slate-600 truncate ${
            compact ? 'text-[11px]' : 'text-xs'
          }`}
          style={active ? { color: accent } : undefined}
        >
          {label}
        </p>
        <p
          className={`font-bold tabular-nums leading-none shrink-0 ${
            compact ? 'text-lg' : 'text-xl'
          } ${active ? '' : 'text-slate-900'}`}
          style={active ? { color: accent } : undefined}
        >
          {value}
        </p>
      </div>

      {showProgress && total > 0 && (
        <div
          className={`bg-slate-100 rounded-full overflow-hidden ${compact ? 'h-0.5 mt-2' : 'h-1 mt-2.5'}`}
          title={`${pct}% of pipeline`}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.max(pct, value > 0 ? 4 : 0)}%`,
              backgroundColor: accent,
            }}
          />
        </div>
      )}
    </Tag>
  );
};

/** Shared stage colours aligned with Kanban pipeline */
export const PIPELINE_STAGE_COLORS = {
  all: { accent: '#475569', light: '#f8fafc' },
  preShortlist: { accent: '#005cb9', light: '#eff6ff' },
  assessment: { accent: '#7c3aed', light: '#f5f3ff' },
  interview: { accent: '#d97706', light: '#fffbeb' },
  selected: { accent: '#059669', light: '#ecfdf5' },
  offer: { accent: '#0891b2', light: '#ecfeff' },
  offerAccepted: { accent: '#db2777', light: '#fdf2f8' },
  hired: { accent: '#16a34a', light: '#f0fdf4' },
  talentPool: { accent: '#475569', light: '#f8fafc' },
} as const;
