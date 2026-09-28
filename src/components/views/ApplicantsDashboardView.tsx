import React, { useState } from 'react';
import { 
  Briefcase, 
  Mail, 
  FileText, 
  CheckCircle2, 
  Filter, 
  Search, 
  RotateCcw, 
  Download, 
  Printer, 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon,
  ArrowUpRight,
  MapPin,
  Activity,
  Clock3,
  UsersRound,
  Target,
  ChevronRight
} from 'lucide-react';
import { Requisition, Candidate } from '../../types';
import { REGIONS, COUNTIES_AND_DISTRICTS } from '../../data/mockData';
import { ActiveView } from '../layout/Navbar';

interface PositionStat {
  position: string;
  totalApplicants: number;
  shortlisted: number;
  selected: number;
}

interface ApplicantsDashboardViewProps {
  requisitions: Requisition[];
  candidates: Candidate[];
  onNavigate: (view: ActiveView, filterParam?: string) => void;
}

export const ApplicantsDashboardView: React.FC<ApplicantsDashboardViewProps> = ({
  requisitions,
  candidates,
  onNavigate,
}) => {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState('-select-');
  const [selectedStatus, setSelectedStatus] = useState('-All-');
  const [selectedGender, setSelectedGender] = useState('-All-');
  const [selectedCountry, setSelectedCountry] = useState('-All-');
  const [selectedRegion, setSelectedRegion] = useState('-All-');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Filter candidates based on all filters including Region/County
  const filteredCandidates = candidates.filter(c => {
    if (selectedPosition !== '-select-' && c.position !== selectedPosition) return false;
    if (selectedStatus !== '-All-' && c.status !== selectedStatus) return false;
    if (selectedGender !== '-All-' && c.gender !== selectedGender) return false;
    if (selectedCountry !== '-All-' && c.nationality !== selectedCountry) return false;
    if (selectedRegion !== '-All-') {
      const matchReg = 
        (c.region && c.region.toLowerCase().includes(selectedRegion.toLowerCase())) ||
        (c.fieldRegion && c.fieldRegion.toLowerCase().includes(selectedRegion.toLowerCase().split(' ')[0])) ||
        (c.county && c.county.toLowerCase().includes(selectedRegion.toLowerCase().split(' ')[0])) ||
        (c.districtOfOrigin && c.districtOfOrigin.toLowerCase().includes(selectedRegion.toLowerCase().split(' ')[0]));
      if (!matchReg) return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match = c.name.toLowerCase().includes(term) || c.position.toLowerCase().includes(term) || c.email.toLowerCase().includes(term);
      if (!match) return false;
    }
    return true;
  });

  // Dynamic Position aggregation
  const positionStatsMap: Record<string, PositionStat> = {};
  requisitions.forEach(req => {
    if (!positionStatsMap[req.position]) {
      positionStatsMap[req.position] = {
        position: req.position,
        totalApplicants: 0,
        shortlisted: 0,
        selected: 0,
      };
    }
  });

  filteredCandidates.forEach(c => {
    if (!positionStatsMap[c.position]) {
      positionStatsMap[c.position] = {
        position: c.position,
        totalApplicants: 0,
        shortlisted: 0,
        selected: 0,
      };
    }
    positionStatsMap[c.position].totalApplicants += 1;
    if (['Pre-Shortlisted', 'Assessment Sent', 'Test Completed', 'Shortlisted', 'Interview Scheduled'].includes(c.status) || c.testStatus === 'Passed') {
      positionStatsMap[c.position].shortlisted += 1;
    }
    if (['Selected', 'Offer Issued', 'Offer Accepted', 'Hired'].includes(c.status)) {
      positionStatsMap[c.position].selected += 1;
    }
  });

  // Default breakdown list enriched with filtered candidate state
  const breakdownRows: PositionStat[] = Object.keys(positionStatsMap).map(k => positionStatsMap[k]).filter(r => r.totalApplicants > 0 || selectedRegion === '-All-');
  const displayRows: PositionStat[] = breakdownRows.length > 0 ? breakdownRows : [
    { position: 'Monitoring and Evaluation Officer', totalApplicants: 1, shortlisted: 0, selected: 1 },
    { position: 'Procurement Manager', totalApplicants: 1, shortlisted: 0, selected: 1 },
    { position: 'HR assistant', totalApplicants: 1, shortlisted: 0, selected: 1 },
    { position: 'Systems Developer', totalApplicants: 1, shortlisted: 0, selected: 1 },
    { position: 'Direct Sales Agent', totalApplicants: 1, shortlisted: 1, selected: 0 },
  ];

  const publishedCount = requisitions.length || 20;
  const totalApplicantsCount = filteredCandidates.length > 0 ? filteredCandidates.length : (selectedRegion === '-All-' ? 23 : 0);
  const shortlistedCount = filteredCandidates.filter(c => ['Pre-Shortlisted', 'Assessment Sent', 'Test Completed', 'Shortlisted'].includes(c.status)).length;
  const selectedCount = filteredCandidates.filter(c => ['Selected', 'Offer Issued', 'Offer Accepted', 'Orientation', 'Hired'].includes(c.status)).length;
  const stageBreakdown = [
    { label: 'Applied', count: filteredCandidates.filter(c => ['Applied', 'New'].includes(c.status)).length, color: 'bg-sky-500' },
    { label: 'Screening', count: filteredCandidates.filter(c => ['Pre-Shortlisted', 'Screening'].includes(c.status)).length, color: 'bg-violet-500' },
    { label: 'Assessment', count: filteredCandidates.filter(c => ['Assessment Sent', 'Test Completed'].includes(c.status)).length, color: 'bg-amber-500' },
    { label: 'Interview', count: filteredCandidates.filter(c => ['Interview Scheduled', 'Interviewed'].includes(c.status)).length, color: 'bg-orange-500' },
    { label: 'Selected', count: filteredCandidates.filter(c => ['Selected', 'Offer Issued', 'Offer Accepted', 'Hired'].includes(c.status)).length, color: 'bg-emerald-500' },
  ];
  const maxStageCount = Math.max(...stageBreakdown.map(stage => stage.count), 1);
  const maleCount = filteredCandidates.filter(c => c.gender === 'Male').length;
  const femaleCount = filteredCandidates.filter(c => c.gender === 'Female').length;
  const genderTotal = Math.max(maleCount + femaleCount, 1);

  const handleExportExcel = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "No.,Position,Number of Applicants,Number of ShortListed Applicants,Number of Selected Applicants,Filter Region\n" +
      displayRows.map((r, i) => `${i + 1},"${r.position}",${r.totalApplicants},${r.shortlisted},${r.selected},"${selectedRegion}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Applicants_Dashboard_Summary_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-600">Recruitment intelligence</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Applicants dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">A clear view of volume, progress, and the next hiring decisions.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700">
            <Activity className="h-3.5 w-3.5" /> Live dataset
          </span>
          <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 sm:inline-flex">Updated just now</span>
        </div>
      </div>

      {/* Filter Accordion matching Screenshot 4 */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex w-full items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100"
        >
          <span className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-sky-600" />
            <span>Filters</span>
          </span>
          <span className="text-[11px] font-normal text-gray-500">
            {filtersOpen ? 'Hide' : 'Show'}
          </span>
        </button>

        {filtersOpen && (
          <div className="grid grid-cols-1 gap-3 p-4 text-xs sm:grid-cols-2 md:grid-cols-6">
            <div>
              <label className="block text-[#475569] font-medium mb-1">Position</label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none cursor-pointer"
              >
                <option value="-select-">-select-</option>
                {Array.from(new Set(requisitions.map(r => r.position))).map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#475569] font-medium mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none cursor-pointer"
              >
                <option value="-All-">-All-</option>
                <option value="Applied">Applied</option>
                <option value="Pre-Shortlisted">Pre-Shortlisted</option>
                <option value="Interview Scheduled">Interview Scheduled</option>
                <option value="Selected">Selected</option>
                <option value="Offer Accepted">Offer Accepted</option>
              </select>
            </div>

            <div>
              <label className="block text-[#475569] font-medium mb-1">Gender</label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none cursor-pointer"
              >
                <option value="-All-">-All-</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-[#475569] font-medium mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#0284c7]" />
                Region / County
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none cursor-pointer"
              >
                <option value="-All-">-All Regions & Counties-</option>
                <optgroup label="Geographical Regions">
                  {REGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </optgroup>
                <optgroup label="Counties / Operational Hubs">
                  {COUNTIES_AND_DISTRICTS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-[#475569] font-medium mb-1">Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none cursor-pointer"
              >
                <option value="-All-">-All-</option>
                <option value="Uganda">Uganda</option>
                <option value="Kenya">Kenya</option>
                <option value="Tanzania">Tanzania</option>
                <option value="Rwanda">Rwanda</option>
              </select>
            </div>

            <div>
              <label className="block text-[#475569] font-medium mb-1">Search Term</label>
              <input
                type="text"
                placeholder="search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-6 flex justify-end gap-2 pt-1 border-t border-[#e2e8f0]">
              <button
                onClick={() => {}}
                className="px-3.5 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
              <button
                onClick={() => {
                  setSelectedPosition('-select-');
                  setSelectedStatus('-All-');
                  setSelectedGender('-All-');
                  setSelectedCountry('-All-');
                  setSelectedRegion('-All-');
                  setSearchTerm('');
                }}
                className="px-3.5 py-1 bg-[#06b6d4] hover:bg-[#0891b2] text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Visual overview */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_1fr_0.85fr]">
        <section className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-300">Pipeline health</p>
              <h3 className="mt-1 text-base font-bold">Applicant funnel</h3>
            </div>
            <button onClick={() => onNavigate('candidate-pipeline')} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white" title="Open candidate pipeline">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-6 flex h-28 items-end gap-2 sm:gap-3">
            {stageBreakdown.map((stage, index) => (
              <button
                key={stage.label}
                onClick={() => onNavigate(index < 2 ? 'pre-shortlist' : index < 4 ? 'final-interview' : 'offer-management')}
                className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
                title={`${stage.label}: ${stage.count} applicants`}
              >
                <span className="text-xs font-bold text-slate-200">{stage.count}</span>
                <span className={`w-full min-w-5 rounded-t-md ${stage.color} opacity-90 transition-all group-hover:opacity-100 group-hover:brightness-110`} style={{ height: `${Math.max((stage.count / maxStageCount) * 76, 8)}px` }} />
                <span className="truncate text-[10px] font-medium text-slate-400">{stage.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
            <span className="text-slate-400">Total in active funnel</span>
            <span className="font-bold text-white">{totalApplicantsCount} applicants</span>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-600">Where attention is needed</p>
              <h3 className="mt-1 text-base font-bold text-slate-900">Stage distribution</h3>
            </div>
            <Target className="h-5 w-5 text-violet-500" />
          </div>
          <div className="mt-5 space-y-3">
            {stageBreakdown.slice(0, 4).map(stage => (
              <div key={stage.label}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">{stage.label}</span>
                  <span className="font-bold text-slate-900">{stage.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${stage.color}`} style={{ width: `${Math.max((stage.count / maxStageCount) * 100, stage.count ? 8 : 0)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">Applicant mix</p>
              <h3 className="mt-1 text-base font-bold text-slate-900">Representation</h3>
            </div>
            <UsersRound className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-5 flex items-center gap-5">
            <div className="relative h-24 w-24 shrink-0 rounded-full" style={{ background: `conic-gradient(#10b981 0 ${femaleCount / genderTotal * 100}%, #38bdf8 ${femaleCount / genderTotal * 100}% 100%)` }}>
              <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white text-center">
                <span className="text-lg font-black text-slate-900">{totalApplicantsCount}</span>
              </div>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /><span className="text-slate-500">Female</span><strong className="text-slate-900">{femaleCount}</strong></div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-sky-400" /><span className="text-slate-500">Male</span><strong className="text-slate-900">{maleCount}</strong></div>
              <div className="flex items-center gap-2 text-slate-400"><Clock3 className="h-3.5 w-3.5" /> Active review</div>
            </div>
          </div>
        </section>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Published Requests', value: publishedCount, icon: Briefcase, color: 'from-blue-500 to-indigo-600', nav: 'new-staff-requests' as ActiveView, cta: 'View Requisitions' },
          { label: 'Total Applicants', value: totalApplicantsCount, icon: Mail, color: 'from-rose-500 to-pink-600', nav: 'job-applicants-report' as ActiveView, cta: 'Applicant Report' },
          { label: 'Shortlisted', value: shortlistedCount, icon: FileText, color: 'from-emerald-500 to-teal-600', nav: 'pre-shortlist' as ActiveView, cta: 'View Shortlists' },
          { label: 'Selected', value: selectedCount, icon: CheckCircle2, color: 'from-amber-500 to-orange-600', nav: 'selected-candidates' as ActiveView, cta: 'Selection Matrix' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              type="button"
              onClick={() => onNavigate(card.nav)}
              className="metric-card text-left cursor-pointer group overflow-hidden relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              <div className="flex items-start justify-between relative">
                <div>
                  <p className="text-xs font-semibold text-slate-500">{card.label}</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">{card.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>{card.cta}</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Export Controls matching Screenshot 4 */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleExportExcel}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export to Excel</span>
        </button>
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 bg-[#06b6d4] hover:bg-[#0891b2] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print to Pdf</span>
        </button>
      </div>

      {/* Summary Table */}
      <div className="table-card">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80">
          <h3 className="text-sm font-bold text-slate-800">Position Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
        <table className="standard-table">
          <thead>
            <tr>
              <th className="w-12 text-center">No.</th>
              <th>Position</th>
              <th className="text-center">Applicants</th>
              <th className="text-center">Shortlisted</th>
              <th className="text-center">Selected</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0]">
            {displayRows.map((row, idx) => (
              <tr 
                key={idx} 
                onClick={() => onNavigate('pre-shortlist')}
                className="hover:bg-cyan-50/40 cursor-pointer transition-colors"
              >
                <td className="py-2 px-3 border-r border-[#e2e8f0] text-center text-gray-500 font-medium">
                  {idx + 1}
                </td>
                <td className="py-2 px-4 border-r border-[#e2e8f0] font-semibold text-[#0f4c81]">
                  {row.position}
                </td>
                <td className="py-2 px-4 border-r border-[#e2e8f0] text-center font-bold text-gray-800">
                  {row.totalApplicants}
                </td>
                <td className="py-2 px-4 border-r border-[#e2e8f0] text-center font-bold text-emerald-700">
                  {row.shortlisted}
                </td>
                <td className="py-2 px-4 text-center font-bold text-amber-700">
                  {row.selected}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <button className="btn btn-primary px-3 py-1">1</button>
            <button className="btn btn-secondary px-3 py-1">2</button>
            <button className="btn btn-secondary px-2.5 py-1">»</button>
          </div>
        </div>
        </div>
      </div>

      {/* Quick Reports Suite Hub */}
      <div className="bg-white border border-[#cbd5e1] rounded-sm p-3.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2.5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#0284c7]" />
            <h3 className="font-bold text-xs text-[#1e293b] uppercase tracking-wider">
              Standard Client Reporting Suite
            </h3>
          </div>
          <span className="text-[11px] text-gray-500 font-medium">
            14 Official Reports Ready
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
          <button
            onClick={() => onNavigate('vacancy-analysis-report')}
            className="p-2 bg-[#f8fafc] hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded text-left transition-all group cursor-pointer"
          >
            <span className="block font-bold text-gray-800 text-[11px] group-hover:text-[#0284c7]">Vacancy Analysis</span>
            <span className="text-[10px] text-gray-500">Ceiling vs Actual</span>
          </button>

          <button
            onClick={() => onNavigate('recruitment-funnel-report')}
            className="p-2 bg-[#f8fafc] hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded text-left transition-all group cursor-pointer"
          >
            <span className="block font-bold text-gray-800 text-[11px] group-hover:text-[#0284c7]">Recruitment Funnel</span>
            <span className="text-[10px] text-gray-500">Conversion Pipeline</span>
          </button>

          <button
            onClick={() => onNavigate('psychometric-analytics-report')}
            className="p-2 bg-[#f8fafc] hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded text-left transition-all group cursor-pointer"
          >
            <span className="block font-bold text-gray-800 text-[11px] group-hover:text-[#0284c7]">Aptitude & Tests</span>
            <span className="text-[10px] text-gray-500">Domain Scores</span>
          </button>

          <button
            onClick={() => onNavigate('budget-utilization-report')}
            className="p-2 bg-[#f8fafc] hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded text-left transition-all group cursor-pointer"
          >
            <span className="block font-bold text-gray-800 text-[11px] group-hover:text-[#0284c7]">Budget Spend</span>
            <span className="text-[10px] text-gray-500">MDA Utilization</span>
          </button>

          <button
            onClick={() => onNavigate('offer-onboarding-report')}
            className="p-2 bg-[#f8fafc] hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded text-left transition-all group cursor-pointer"
          >
            <span className="block font-bold text-gray-800 text-[11px] group-hover:text-[#0284c7]">Offer & Onboard</span>
            <span className="text-[10px] text-gray-500">Staff vs Interns</span>
          </button>

          <button
            onClick={() => onNavigate('time-to-hire-report')}
            className="p-2 bg-[#f8fafc] hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded text-left transition-all group cursor-pointer"
          >
            <span className="block font-bold text-gray-800 text-[11px] group-hover:text-[#0284c7]">Time-to-Hire</span>
            <span className="text-[10px] text-gray-500">Turnaround in Days</span>
          </button>
        </div>
      </div>

      {/* Visual Analytics Widgets from Azure User Stories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        
        {/* Recruitment Funnel Conversion Widget */}
        <div className="bg-white border border-[#cbd5e1] rounded-sm p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
            <h3 className="font-bold text-xs text-[#1e293b] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#0284c7]" />
              <span>Recruitment Funnel Conversion Analytics</span>
            </h3>
            <span className="text-[11px] text-gray-400">Click bars to drill-down</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-700">1. Total Applied</span>
                <span className="text-[#0284c7]">23 Candidates (100%)</span>
              </div>
              <div 
                onClick={() => onNavigate('job-applicants-report')}
                className="w-full bg-gray-100 h-6 rounded cursor-pointer overflow-hidden relative hover:opacity-90"
              >
                <div className="bg-[#0284c7] h-full rounded" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-700">2. Pre-Screened & Shortlisted</span>
                <span className="text-teal-600">8 Candidates (34.8%)</span>
              </div>
              <div 
                onClick={() => onNavigate('pre-shortlist')}
                className="w-full bg-gray-100 h-6 rounded cursor-pointer overflow-hidden relative hover:opacity-90"
              >
                <div className="bg-teal-500 h-full rounded" style={{ width: '35%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-700">3. Panel Evaluated</span>
                <span className="text-indigo-600">6 Candidates (26.1%)</span>
              </div>
              <div 
                onClick={() => onNavigate('final-interview')}
                className="w-full bg-gray-100 h-6 rounded cursor-pointer overflow-hidden relative hover:opacity-90"
              >
                <div className="bg-indigo-500 h-full rounded" style={{ width: '26%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-700">4. Selected & Hired</span>
                <span className="text-emerald-600">5 Candidates (21.7%)</span>
              </div>
              <div 
                onClick={() => onNavigate('offer-management')}
                className="w-full bg-gray-100 h-6 rounded cursor-pointer overflow-hidden relative hover:opacity-90"
              >
                <div className="bg-emerald-500 h-full rounded" style={{ width: '22%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding & Orientation Status Widget */}
        <div className="bg-white border border-[#cbd5e1] rounded-sm p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
            <h3 className="font-bold text-xs text-[#1e293b] flex items-center gap-1.5">
              <PieChartIcon className="w-4 h-4 text-emerald-600" />
              <span>Candidate Onboarding & Induction Pipeline</span>
            </h3>
            <button 
              onClick={() => onNavigate('new-staff-orientation')}
              className="text-[11px] text-[#0284c7] font-semibold hover:underline"
            >
              Open Orientation Checklist →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5 my-2">
            <div 
              onClick={() => onNavigate('offer-management')}
              className="p-3 bg-amber-50 border border-amber-200 rounded text-center cursor-pointer hover:bg-amber-100/70"
            >
              <span className="text-xs text-amber-800 font-semibold block">Offers Issued</span>
              <span className="text-2xl font-bold text-amber-900 mt-1 block">2</span>
              <span className="text-[10px] text-amber-700">Awaiting Signature</span>
            </div>
            <div 
              onClick={() => onNavigate('new-staff-orientation')}
              className="p-3 bg-cyan-50 border border-cyan-200 rounded text-center cursor-pointer hover:bg-cyan-100/70"
            >
              <span className="text-xs text-cyan-800 font-semibold block">In Orientation</span>
              <span className="text-2xl font-bold text-cyan-900 mt-1 block">2</span>
              <span className="text-[10px] text-cyan-700">IT / ID Verification</span>
            </div>
            <div 
              onClick={() => onNavigate('user-profiles')}
              className="p-3 bg-emerald-50 border border-emerald-200 rounded text-center cursor-pointer hover:bg-emerald-100/70"
            >
              <span className="text-xs text-emerald-800 font-semibold block">Active Profiles</span>
              <span className="text-2xl font-bold text-emerald-900 mt-1 block">1</span>
              <span className="text-[10px] text-emerald-700">On Payroll</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-600 flex items-center justify-between">
            <span>Average Recruitment Turnaround Time:</span>
            <strong className="text-gray-900">14.2 Days (Target: &lt; 21 Days)</strong>
          </div>
        </div>

      </div>
    </div>
  );
};
