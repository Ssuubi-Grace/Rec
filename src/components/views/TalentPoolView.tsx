import React, { useState } from 'react';
import { 
  Archive, 
  Search, 
  Tag, 
  RotateCcw, 
  Download, 
  UserCheck, 
  Send, 
  Briefcase, 
  Star, 
  ArrowRight, 
  Filter, 
  MapPin,
  Globe,
  Eye,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { Candidate, Requisition } from '../../types';
import { REGIONS, COUNTIES_AND_DISTRICTS } from '../../data/mockData';
import { ActiveView } from '../layout/Navbar';
import { CandidateDetailModal } from '../modals/CandidateDetailModal';
import {
  ViewShell, PageHeader, MetricGrid, MetricCard, FilterPanel, FilterField,
  DataTableShell, GRADIENTS,
} from '../ui/RecruitmentUI';

interface TalentPoolViewProps {
  candidates: Candidate[];
  requisitions: Requisition[];
  onReengageCandidate: (candidateId: string, targetReqId: string) => void;
  onNavigate: (view: ActiveView) => void;
}

export const TalentPoolView: React.FC<TalentPoolViewProps> = ({
  candidates,
  requisitions,
  onReengageCandidate,
  onNavigate,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('-All-');
  const [selectedCountry, setSelectedCountry] = useState<string>('-All-');
  const [selectedRegion, setSelectedRegion] = useState<string>('-All-');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [targetReqModalCandidate, setTargetReqModalCandidate] = useState<Candidate | null>(null);
  const [selectedCandidateForView, setSelectedCandidateForView] = useState<Candidate | null>(null);
  const [selectedRequisitionForAssign, setSelectedRequisitionForAssign] = useState<string>(requisitions[0]?.id || 'req-1');

  const COUNTRIES = ['Uganda', 'Kenya', 'Tanzania', 'Rwanda', 'South Sudan'];

  // Filter talent pool
  const talentPoolList = candidates.filter(c => {
    const isPool = c.status === 'Talent Pool' || c.talentPoolTag !== undefined;
    if (!isPool) return false;
    if (selectedTag !== '-All-' && c.talentPoolTag !== selectedTag) return false;

    // Separate Country filter
    if (selectedCountry !== '-All-') {
      const candCountry = (c.country || 'Uganda').toLowerCase();
      if (!candCountry.includes(selectedCountry.toLowerCase())) return false;
    }

    // Separate Region / County filter
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
      const match = 
        c.name.toLowerCase().includes(term) ||
        c.position.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.skills && c.skills.some(s => s.toLowerCase().includes(term))) ||
        (c.talentPoolNotes && c.talentPoolNotes.toLowerCase().includes(term)) ||
        (c.nationalId && c.nationalId.toLowerCase().includes(term));
      if (!match) return false;
    }
    return true;
  });

  const handleConfirmReengage = () => {
    if (targetReqModalCandidate) {
      onReengageCandidate(targetReqModalCandidate.id, selectedRequisitionForAssign);
      setTargetReqModalCandidate(null);
      onNavigate('pre-shortlist');
    }
  };

  const allPoolCandidates = candidates.filter(c => c.status === 'Talent Pool' || c.talentPoolTag !== undefined);
  const highPotentialCount = talentPoolList.filter(c => c.talentPoolTag === 'High Potential').length;
  const runnerUpCount = talentPoolList.filter(c => c.talentPoolTag === 'Runner-up' || !c.talentPoolTag).length;
  const avgMatchScore = talentPoolList.length > 0
    ? Math.round(talentPoolList.reduce((sum, c) => sum + c.matchScore, 0) / talentPoolList.length)
    : 0;

  const handleResetFilters = () => {
    setSelectedTag('-All-');
    setSelectedCountry('-All-');
    setSelectedRegion('-All-');
    setSearchTerm('');
  };

  const handleExportCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "No.,Candidate Name,NIN,Position,Country,Region/District,Education,Experience,Match Score,Test Score,Category Tag,Archived Date,Notes\n" +
      talentPoolList.map((c, i) => 
        `${i + 1},"${c.name}","${c.nationalId || 'N/A'}","${c.position}","${c.country || 'Uganda'}","${c.region || c.county || c.districtOfOrigin || 'Central'}","${c.educationLevel}",${c.yearsOfExperience},"${c.matchScore}%","${c.testScore || 85}%","${c.talentPoolTag || 'Runner-up'}","${c.talentPoolDate || 'Aug 2026'}","${(c.talentPoolNotes || '').replace(/"/g, '""')}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Talent_Pool_Repository.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ViewShell>
      <PageHeader
        badge="Talent Retention"
        badgeColor="bg-purple-50 text-purple-700 border-purple-200"
        title="Hold for Future Consideration (Talent Pool Repository)"
        subtitle="Tabular database of pre-evaluated runners-up, high-potential profiles, and fast-track recruitment assets."
        actions={
          <button type="button" onClick={() => onNavigate('pre-shortlist')} className="btn btn-primary">
            Pre-Shortlist Candidates
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      />

      <MetricGrid cols="grid-cols-2 sm:grid-cols-4">
        <MetricCard label="Profiles in View" value={talentPoolList.length} icon={Archive} gradient={GRADIENTS[0]} sublabel={`of ${allPoolCandidates.length} total archived`} />
        <MetricCard label="High Potential" value={highPotentialCount} icon={Star} gradient={GRADIENTS[2]} />
        <MetricCard label="Runner-ups" value={runnerUpCount} icon={UserCheck} gradient={GRADIENTS[1]} />
        <MetricCard label="Avg Match Score" value={`${avgMatchScore}%`} icon={Briefcase} gradient={GRADIENTS[3]} />
      </MetricGrid>

      <FilterPanel title="Talent Pool Filters" onReset={handleResetFilters}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <FilterField label="Category Tag">
            <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}>
              <option value="-All-">-All Retention Tags-</option>
              <option value="Runner-up">Runner-up</option>
              <option value="High Potential">High Potential</option>
              <option value="Overqualified">Overqualified</option>
              <option value="Future Expansion">Future Expansion</option>
              <option value="Strong Interviewee">Strong Interviewee</option>
            </select>
          </FilterField>
          <FilterField label="Country">
            <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
              <option value="-All-">-All Countries-</option>
              {COUNTRIES.map(cntry => (
                <option key={cntry} value={cntry}>{cntry}</option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Region / District">
            <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
              <option value="-All-">-All Regions & Districts-</option>
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
          </FilterField>
          <FilterField label="Search">
            <input type="text" placeholder="Search name, position, skills, NIN..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </FilterField>
        </div>
      </FilterPanel>

      <DataTableShell
        title="Talent Pool Candidates"
        subtitle={`${talentPoolList.length} profile(s) matching current filters`}
        onExport={handleExportCsv}
        exportLabel="Export Talent Pool"
      >
        <table className="standard-table">
          <thead>
            <tr>
              <th className="w-9 text-center">No.</th>
              <th className="min-w-[150px]">Candidate Name & NIN</th>
              <th className="min-w-[140px]">Position & Specialty</th>
              <th className="min-w-[90px]">Country</th>
              <th className="min-w-[120px]">Region / District</th>
              <th className="min-w-[110px]">Education & Exp.</th>
              <th className="text-center min-w-[100px]">Scores (Match / Test)</th>
              <th className="text-center min-w-[110px]">Category Tag</th>
              <th className="min-w-[180px]">Retention Notes</th>
              <th className="text-center min-w-[140px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0]">
            {talentPoolList.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-gray-500 font-medium">
                  No talent pool candidates match the selected filters.
                </td>
              </tr>
            ) : (
              talentPoolList.map((c, idx) => (
                <tr 
                  key={c.id}
                  className={`hover:bg-[#f0f9ff]/40 transition-colors ${idx % 2 === 1 ? 'bg-[#fcfcfd]' : 'bg-white'}`}
                >
                  <td className="py-2.5 px-2 text-center text-gray-500 font-medium">
                    {idx + 1}.
                  </td>

                  {/* Candidate Name & NIN */}
                  <td className="py-2.5 px-3">
                    <button
                      onClick={() => setSelectedCandidateForView(c)}
                      className="font-bold text-[#0f4c81] hover:underline text-left cursor-pointer block"
                    >
                      {c.name}
                    </button>
                    <span className="text-[10px] text-gray-400 font-mono">
                      NIN: {c.nationalId || 'CM90023412X98A'}
                    </span>
                  </td>

                  {/* Position */}
                  <td className="py-2.5 px-3 text-gray-800">
                    <span className="font-semibold block">{c.position}</span>
                    <span className="text-[10px] text-gray-500">{c.email}</span>
                  </td>

                  {/* Country (Separated Column) */}
                  <td className="py-2.5 px-3 text-gray-700">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Globe className="w-3 h-3 text-slate-400" />
                      <span>{c.country || 'Uganda'}</span>
                    </span>
                  </td>

                  {/* Region / District (Separated Column) */}
                  <td className="py-2.5 px-3 text-gray-700">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#0284c7]" />
                      <span>{c.county || c.districtOfOrigin || c.fieldRegion || c.region || 'Central Region'}</span>
                    </span>
                  </td>

                  {/* Education & Experience */}
                  <td className="py-2.5 px-3 text-gray-700">
                    <span className="block font-medium">{c.educationLevel}</span>
                    <span className="text-[10px] text-gray-500">{c.yearsOfExperience} yrs experience</span>
                  </td>

                  {/* Scores */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-bold text-gray-800">
                        {c.matchScore}% Match
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 mt-0.5">
                        Test: {c.testScore || 85}%
                      </span>
                    </div>
                  </td>

                  {/* Category Tag */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-300 inline-block">
                      {c.talentPoolTag || 'Retained'}
                    </span>
                  </td>

                  {/* Retention Notes */}
                  <td className="py-2.5 px-3 text-gray-600 text-[11px]">
                    <p className="line-clamp-2 italic">
                      "{c.talentPoolNotes || 'High potential candidate kept in reserve for rapid appointment.'}"
                    </p>
                    <span className="text-[9px] text-gray-400 block mt-0.5 font-mono">
                      Archived: {c.talentPoolDate || 'Aug 2026'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedCandidateForView(c)}
                        className="px-2 py-1 bg-white border border-gray-300 hover:bg-slate-50 text-gray-700 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-3 h-3 text-gray-500" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => setTargetReqModalCandidate(c)}
                        className="px-2.5 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                        title="Re-Engage & Assign to active requisition vacancy"
                      >
                        <Send className="w-3 h-3" />
                        <span>Re-Engage</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </DataTableShell>

      {/* Re-Engage Modal */}
      {targetReqModalCandidate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-[#94a3b8]">
            <div className="bg-[#1e293b] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#0284c7]" />
                <h3 className="font-bold text-sm">Fast-Track Re-Engagement</h3>
              </div>
              <button onClick={() => setTargetReqModalCandidate(null)} className="text-gray-300 hover:text-white cursor-pointer">✕</button>
            </div>

            <div className="p-5 space-y-4 text-xs text-[#334155]">
              <p>
                Select target open requisition to fast-track <strong>{targetReqModalCandidate.name}</strong> into active interview or offer pipelines:
              </p>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Target Requisition Vacancy</label>
                <select
                  value={selectedRequisitionForAssign}
                  onChange={(e) => setSelectedRequisitionForAssign(e.target.value)}
                  className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none cursor-pointer font-medium"
                >
                  {requisitions.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.reqNo}: {r.position} ({r.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded text-[11px] text-emerald-800">
                ⚡ Candidate previous assessment scores ({targetReqModalCandidate.testScore || 85}%) will be automatically credited, accelerating hiring cycle time.
              </div>
            </div>

            <div className="bg-[#f1f5f9] px-4 py-2.5 border-t border-[#cbd5e1] flex justify-end gap-2">
              <button
                onClick={() => setTargetReqModalCandidate(null)}
                className="px-3 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReengage}
                className="px-4 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded text-xs font-bold shadow-2xs cursor-pointer"
              >
                Confirm Re-Engagement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Profile Inspector Modal */}
      {selectedCandidateForView && (
        <CandidateDetailModal
          candidate={selectedCandidateForView}
          onClose={() => setSelectedCandidateForView(null)}
        />
      )}
    </ViewShell>
  );
};
