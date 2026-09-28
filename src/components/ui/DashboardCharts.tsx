import React, { useState } from 'react';

interface FunnelBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

export const FunnelBar: React.FC<FunnelBarProps> = ({ label, value, max, color }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="font-bold text-slate-900">{value} <span className="text-slate-400 font-medium">({pct}%)</span></span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

interface PipeFunnelStage {
  label: string;
  value: number;
  color: string;
}

export const PipeFunnelChart: React.FC<{ stages: PipeFunnelStage[]; title?: string }> = ({ stages, title }) => {
  const maxValue = Math.max(stages[0]?.value ?? 1, 1);
  const hired = stages[stages.length - 1]?.value ?? 0;
  const conversion = maxValue > 0 ? ((hired / maxValue) * 100).toFixed(1) : '0.0';
  const svgW = 220;
  const segH = 44;
  const maxW = 180;
  const svgH = stages.length * segH;

  return (
    <div>
      {title && <h4 className="text-sm font-bold text-slate-900 mb-4">{title}</h4>}
      <div className="flex items-stretch gap-3 sm:gap-5">
        <div className="flex flex-col shrink-0 min-w-[72px]">
          {stages.map(stage => (
            <div
              key={stage.label}
              className="text-xs font-semibold text-slate-600 flex items-center"
              style={{ height: segH }}
            >
              {stage.label}
            </div>
          ))}
        </div>

        <div className="flex-1 flex justify-center min-w-0 py-1">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[200px] h-auto drop-shadow-sm">
            {stages.map((stage, i) => {
              const topW = Math.max((stage.value / maxValue) * maxW, stage.value > 0 ? 48 : 8);
              const nextVal = stages[i + 1]?.value ?? Math.max(stage.value * 0.65, 0);
              const bottomW = Math.max((nextVal / maxValue) * maxW, i === stages.length - 1 ? topW * 0.55 : 36);
              const y = i * segH;
              const topX = (svgW - topW) / 2;
              const bottomX = (svgW - bottomW) / 2;
              return (
                <path
                  key={stage.label}
                  d={`M ${topX} ${y} L ${topX + topW} ${y} L ${bottomX + bottomW} ${y + segH - 2} L ${bottomX} ${y + segH - 2} Z`}
                  fill={stage.color}
                />
              );
            })}
          </svg>
        </div>

        <div className="flex flex-col shrink-0 min-w-[2rem]">
          {stages.map(stage => (
            <div
              key={stage.label}
              className="text-xs font-bold text-slate-900 flex items-center justify-end"
              style={{ height: segH }}
            >
              {stage.value}
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-xs mt-5 pt-3 border-t border-slate-100">
        <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>
          Conversion rate {conversion}%
        </span>
      </p>
    </div>
  );
};

interface PieSlice {
  label: string;
  value: number;
  color: string;
}

export const DonutChart: React.FC<{ slices: PieSlice[]; size?: number; centerLabel?: string; centerValue?: string }> = ({
  slices,
  size = 120,
  centerLabel,
  centerValue,
}) => {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  let cumulative = 0;
  const r = 16;
  const cx = 18;
  const cy = 18;

  const paths = slices.map(slice => {
    const start = (cumulative / total) * 360;
    cumulative += slice.value;
    const end = (cumulative / total) * 360;
    const large = end - start > 180 ? 1 : 0;
    const startRad = ((start - 90) * Math.PI) / 180;
    const endRad = ((end - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    if (slice.value === 0) return null;
    if (slices.length === 1 || end - start >= 359.9) {
      return <circle key={slice.label} cx={cx} cy={cy} r={r} fill={slice.color} />;
    }
    return (
      <path
        key={slice.label}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
        fill={slice.color}
      />
    );
  });

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <svg viewBox="0 0 36 36" width={size} height={size} className="-rotate-90">
          {paths}
          <circle cx={cx} cy={cy} r={10} fill="white" />
        </svg>
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            {centerValue && <span className="text-sm font-black text-slate-900 leading-none">{centerValue}</span>}
            {centerLabel && <span className="text-[9px] font-semibold text-slate-500 mt-0.5">{centerLabel}</span>}
          </div>
        )}
      </div>
      <div className="space-y-1.5 min-w-0 flex-1">
        {slices.map(s => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-slate-600 truncate">{s.label}</span>
            <span className="font-bold text-slate-900 ml-auto">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Sparkline: React.FC<{ data: number[]; color?: string }> = ({ data, color = '#005cb9' }) => {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 120;
  const h = 36;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="opacity-80">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
};

export const ProgressRing: React.FC<{ value: number; label: string; sublabel?: string; color?: string; size?: number }> = ({
  value,
  label,
  sublabel,
  color = '#005cb9',
  size = 88,
}) => {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const half = size / 2;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={half} cy={half} r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <circle
            cx={half}
            cy={half}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-slate-900 leading-none">{value}%</span>
        </div>
      </div>
      <span className="text-[10px] font-bold text-slate-600 mt-1">{label}</span>
      {sublabel && <span className="text-[9px] text-slate-400">{sublabel}</span>}
    </div>
  );
};

export const StageConversionChart: React.FC<{ steps: { from: string; to: string; rate: number }[] }> = ({ steps }) => {
  const minRate = steps.length > 0 ? Math.min(...steps.map(s => s.rate)) : 0;
  const bottleneck = steps.find(s => s.rate === minRate);

  return (
    <div>
      <div className="space-y-2.5">
        {steps.map(step => {
          const isBottleneck = step.rate === minRate && steps.length > 1;
          return (
            <div key={`${step.from}-${step.to}`} className="space-y-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-semibold text-slate-600 truncate">
                  {step.from} → {step.to}
                </span>
                <span className={`text-[10px] font-bold shrink-0 ${isBottleneck ? 'text-amber-600' : 'text-slate-800'}`}>
                  {step.rate}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(step.rate, 4)}%`,
                    background: isBottleneck ? '#f59e0b' : '#005cb9',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {bottleneck && (
        <p className="text-[10px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100 leading-relaxed">
          Bottleneck:{' '}
          <span className="font-bold text-amber-700">
            {bottleneck.from} → {bottleneck.to}
          </span>{' '}
          at {bottleneck.rate}% pass-through
        </p>
      )}
    </div>
  );
};

export const MiniBarChart: React.FC<{ items: { label: string; value: number; color: string }[] }> = ({ items }) => {
  const max = Math.max(...items.map(i => i.value), 1);
  return (
    <div className="space-y-2.5">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-[11px] font-semibold text-slate-600 w-24 shrink-0 truncate">{item.label}</span>
          <div className="flex-1 h-7 bg-slate-50 rounded-lg overflow-hidden relative">
            <div
              className="h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-500"
              style={{ width: `${Math.max((item.value / max) * 100, 8)}%`, background: item.color }}
            >
              <span className="text-[10px] font-bold text-white drop-shadow-sm">{item.value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface RegionSlice {
  label: string;
  value: number;
  color: string;
}

export const RegionDistributionMap: React.FC<{
  regions: RegionSlice[];
  onRegionClick?: (label: string) => void;
}> = ({ regions, onRegionClick }) => {
  const total = regions.reduce((a, r) => a + r.value, 0) || 1;
  const max = Math.max(...regions.map(r => r.value), 1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {regions.map(region => (
        <button
          key={region.label}
          type="button"
          onClick={() => onRegionClick?.(region.label)}
          className="group text-left rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-[var(--color-primary)]/20 hover:shadow-sm transition-all p-3 cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: region.color }} />
              <span className="text-[11px] font-bold text-slate-700 truncate">{region.label}</span>
            </div>
            <span className="text-xs font-black text-slate-900">{region.value}</span>
          </div>
          <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-100">
            <div
              className="h-full rounded-full transition-all duration-500 group-hover:opacity-90"
              style={{ width: `${Math.max((region.value / max) * 100, region.value ? 10 : 0)}%`, background: region.color }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">{Math.round((region.value / total) * 100)}% of applications</p>
        </button>
      ))}
    </div>
  );
};

export const GenderBreakdownChart: React.FC<{
  male: number;
  female: number;
  onClick?: () => void;
}> = ({ male, female, onClick }) => {
  const total = Math.max(male + female, 1);
  const femalePct = (female / total) * 100;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-5 text-left cursor-pointer group"
    >
      <div
        className="relative h-28 w-28 shrink-0 rounded-full shadow-inner transition-transform group-hover:scale-105"
        style={{ background: `conic-gradient(#ec4899 0 ${femalePct}%, #005cb9 ${femalePct}% 100%)` }}
      >
        <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white text-center">
          <span className="text-xl font-black text-slate-900 leading-none">{total}</span>
          <span className="text-[9px] font-semibold text-slate-500 mt-0.5">Applicants</span>
        </div>
      </div>
      <div className="space-y-3 flex-1">
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
            <span className="text-slate-600 font-semibold">Female</span>
          </div>
          <span className="font-black text-slate-900">{female}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#005cb9]" />
            <span className="text-slate-600 font-semibold">Male</span>
          </div>
          <span className="font-black text-slate-900">{male}</span>
        </div>
        <div className="pt-2 border-t border-slate-100">
          <div className="flex h-2 rounded-full overflow-hidden">
            <div className="bg-pink-500 transition-all" style={{ width: `${femalePct}%` }} />
            <div className="bg-[#005cb9] flex-1" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">{Math.round(femalePct)}% female representation</p>
        </div>
      </div>
    </button>
  );
};

export type VacancyStatsPeriod = 'daily' | 'weekly' | 'monthly';
export type VacancyStatsChartType = 'line' | 'bar' | 'pie';

export interface VacancyStatsPoint {
  label: string;
  applications: number;
  interviews: number;
  rejected: number;
}

interface VacancyStatsChartProps {
  monthly: VacancyStatsPoint[];
  weekly?: VacancyStatsPoint[];
  daily?: VacancyStatsPoint[];
}

const buildSmoothLinePath = (points: { x: number; y: number }[]): string => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    path += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return path;
};

export const VacancyStatsBarChart: React.FC<VacancyStatsChartProps> = ({
  monthly,
  weekly,
  daily,
}) => {
  const [period, setPeriod] = useState<VacancyStatsPeriod>('monthly');
  const [chartType, setChartType] = useState<VacancyStatsChartType>('line');

  const data = period === 'daily' ? (daily || monthly.slice(-7)) : period === 'weekly' ? (weekly || monthly.slice(-4)) : monthly;

  const maxValue = Math.max(...data.flatMap(d => [d.applications, d.interviews, d.rejected]), 10);
  const yMax = Math.max(50, Math.ceil(maxValue / 5) * 5);
  const yMin = 15;
  const yTicks = [50, 45, 40, 35, 30, 25, 20, 15].filter(t => t <= yMax && t >= yMin);

  const chartW = 640;
  const chartH = 240;
  const padL = 36;
  const padR = 12;
  const padT = 16;
  const padB = 32;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const groupW = plotW / Math.max(data.length, 1);
  const barW = Math.min(14, groupW / 5);

  const scaleY = (v: number) => padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  const pointX = (i: number) => padL + i * groupW + groupW / 2;

  const periods: { id: VacancyStatsPeriod; label: string }[] = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
  ];

  const chartTypes: { id: VacancyStatsChartType; label: string }[] = [
    { id: 'line', label: 'Line' },
    { id: 'bar', label: 'Bar' },
    { id: 'pie', label: 'Pie' },
  ];

  const series = [
    { key: 'applications' as const, color: '#22c55e', label: 'Application Sent' },
    { key: 'interviews' as const, color: '#005cb9', label: 'Interviews' },
    { key: 'rejected' as const, color: '#ef4444', label: 'Rejected' },
  ];

  const pieTotals = series.map(s => ({
    label: s.label,
    color: s.color,
    value: data.reduce((sum, point) => sum + point[s.key], 0),
  }));

  const pieTotalAll = pieTotals.reduce((a, s) => a + s.value, 0) || 1;
  const pieR = 72;
  const pieCx = 90;
  const pieCy = 90;
  let pieCumulative = 0;
  const pieSlices = pieTotals.map(slice => {
    const start = (pieCumulative / pieTotalAll) * 360;
    pieCumulative += slice.value;
    const end = (pieCumulative / pieTotalAll) * 360;
    return { ...slice, start, end };
  });

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          {series.map(s => (
            <div key={s.key} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              {s.label}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-slate-100 p-0.5">
            {chartTypes.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setChartType(t.id)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                  chartType === t.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-full bg-slate-100 p-0.5">
            {periods.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  period === p.id
                    ? 'bg-[#f97316] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {chartType === 'pie' ? (
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-2 min-h-[240px]">
            <svg viewBox="0 0 180 180" className="w-[200px] h-[200px] shrink-0 drop-shadow-sm">
              {pieSlices.map(slice => {
                if (slice.value <= 0) return null;
                const large = slice.end - slice.start > 180 ? 1 : 0;
                const startRad = ((slice.start - 90) * Math.PI) / 180;
                const endRad = ((slice.end - 90) * Math.PI) / 180;
                const x1 = pieCx + pieR * Math.cos(startRad);
                const y1 = pieCy + pieR * Math.sin(startRad);
                const x2 = pieCx + pieR * Math.cos(endRad);
                const y2 = pieCy + pieR * Math.sin(endRad);
                if (slice.end - slice.start >= 359.9) {
                  return <circle key={slice.label} cx={pieCx} cy={pieCy} r={pieR} fill={slice.color} />;
                }
                return (
                  <path
                    key={slice.label}
                    d={`M ${pieCx} ${pieCy} L ${x1} ${y1} A ${pieR} ${pieR} 0 ${large} 1 ${x2} ${y2} Z`}
                    fill={slice.color}
                  />
                );
              })}
            </svg>
            <div className="space-y-2 min-w-[200px]">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Totals ({periods.find(p => p.id === period)?.label} view)
              </p>
              {pieTotals.map(s => (
                <div key={s.label} className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: s.color }} />
                  <span className="text-slate-600 flex-1">{s.label}</span>
                  <span className="font-black text-slate-900">{s.value}</span>
                  <span className="text-slate-400 w-10 text-right">{Math.round((s.value / pieTotalAll) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full min-w-[520px] h-auto">
          {yTicks.map(tick => {
            const y = scaleY(tick);
            return (
              <g key={tick}>
                <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#eef2f7" strokeWidth="1" />
                <text x={padL - 6} y={y + 4} textAnchor="end" className="fill-slate-400 text-[9px] font-semibold">
                  {tick}
                </text>
              </g>
            );
          })}

          {chartType === 'line' ? (
            <>
              {series.map(s => {
                const points = data.map((point, i) => ({
                  x: pointX(i),
                  y: scaleY(point[s.key]),
                }));
                return (
                  <path
                    key={s.key}
                    d={buildSmoothLinePath(points)}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-500"
                  />
                );
              })}
              {data.map((point, i) => (
                <text
                  key={`${point.label}-${i}`}
                  x={pointX(i)}
                  y={chartH - 10}
                  textAnchor="middle"
                  className="fill-slate-500 text-[10px] font-semibold"
                >
                  {point.label}
                </text>
              ))}
            </>
          ) : (
            data.map((point, i) => {
              const groupX = pointX(i);
              return (
                <g key={`${point.label}-${i}`}>
                  {series.map((s, si) => {
                    const value = point[s.key];
                    const x = groupX + (si - 1) * (barW + 3);
                    const y = scaleY(value);
                    const h = padT + plotH - y;
                    return (
                      <rect
                        key={s.key}
                        x={x - barW / 2}
                        y={y}
                        width={barW}
                        height={Math.max(h, 0)}
                        rx={3}
                        fill={s.color}
                        className="transition-all duration-500"
                      />
                    );
                  })}
                  <text
                    x={groupX}
                    y={chartH - 10}
                    textAnchor="middle"
                    className="fill-slate-500 text-[10px] font-semibold"
                  >
                    {point.label}
                  </text>
                </g>
              );
            })
          )}
        </svg>
        )}
      </div>
    </div>
  );
};
