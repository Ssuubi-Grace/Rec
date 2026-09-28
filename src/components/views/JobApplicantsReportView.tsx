import React, { useState } from 'react';
import { Filter, Search, RotateCcw, Download, Printer, User, Eye } from 'lucide-react';
import { Candidate, Requisition } from '../../types';
import { EDUCATION_LEVELS, REGIONS, COUNTIES_AND_DISTRICTS } from '../../data/mockData';
import { ActiveView } from '../layout/Navbar';
import {
  ViewShell, PageHeader, MetricGrid, MetricCard, FilterPanel, FilterField,
  DataTableShell, TablePagination, GRADIENTS,
} from '../ui/RecruitmentUI';

interface JobApplicantsReportViewProps {
  candidates: Candidate[];
  requisitions: Requisition[];
  onNavigate: (view: ActiveView) => void;
  onSelectCandidate?: (candidate: Candidate) => void;
}

export const JobApplicantsReportView: React.FC<JobApplicantsReportViewProps> = ({
  candidates,
  requisitions,
  onNavigate,
  onSelectCandidate,
}) => {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState('-select-');
  const [selectedRegion, setSelectedRegion] = useState('-All-');
  const [filterAge, setFilterAge] = useState('');
  const [filterExp, setFilterExp] = useState('');
  const [selectedEdu, setSelectedEdu] = useState('-select-');
  const [beginDate, setBeginDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('-All-');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter candidates
  const filteredCandidates = candidates.filter(c => {
    if (selectedPosition !== '-select-' && c.position !== selectedPosition) return false;
    if (selectedStatus !== '-All-' && c.status !== selectedStatus) return false;
    if (selectedEdu !== '-select-' && !c.educationLevel.toLowerCase().includes(selectedEdu.toLowerCase())) return false;
    if (filterAge && c.age > parseInt(filterAge)) return false;
    if (filterExp && c.yearsOfExperience < parseInt(filterExp)) return false;
    
    // Region / County filter
    if (selectedRegion !== '-All-') {
      const target = selectedRegion.toLowerCase();
      const matchRegion = 
        (c.region && c.region.toLowerCase().includes(target)) ||
        (c.fieldRegion && c.fieldRegion.toLowerCase().includes(target)) ||
        (c.county && c.county.toLowerCase().includes(target)) ||
        (c.districtOfOrigin && c.districtOfOrigin.toLowerCase().includes(target));
      if (!matchRegion) return false;
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match = 
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.position.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        (c.region && c.region.toLowerCase().includes(term)) ||
        (c.county && c.county.toLowerCase().includes(term)) ||
        (c.fieldRegion && c.fieldRegion.toLowerCase().includes(term)) ||
        (c.nationalId && c.nationalId.toLowerCase().includes(term));
      if (!match) return false;
    }
    return true;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage) || 1;
  const paginatedList = filteredCandidates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportExcel = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "No.,Applicants Name,Position,Region / County / District,Employment History,Email Address,Age,Education Level,Years of Experience,Mobile Phone Number,Status\n" +
      filteredCandidates.map((c, i) => 
        `${i + 1},"${c.name}","${c.position}","${c.region || 'Central'} (${c.fieldRegion || c.county || 'Main'})","${c.employmentHistory.replace(/"/g, '""')}","${c.email}",${c.age},"${c.educationLevel}",${c.yearsOfExperience},"+${c.countryCode} ${c.phone}","${c.status}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Job_Applicants_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const appliedCount = filteredCandidates.filter(c => c.status === 'Applied').length;
  const shortlistedCount = filteredCandidates.filter(c => ['Pre-Shortlisted', 'Assessment Sent', 'Interview Scheduled'].includes(c.status)).length;
  const offerPipelineCount = filteredCandidates.filter(c => ['Selected', 'Offer Issued', 'Offer Accepted', 'Hired'].includes(c.status)).length;
  const talentPoolCount = filteredCandidates.filter(c => c.status === 'Talent Pool').length;

  const handleClearFilters = () => {
    setSelectedPosition('-select-');
    setSelectedRegion('-All-');
    setFilterAge('');
    setFilterExp('');
    setSelectedEdu('-select-');
    setBeginDate('');
    setEndDate('');
    setSelectedStatus('-All-');
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <ViewShell>
      {/* 14 Reports Navigation Suite Header Banner */}
      <div className="bg-white border border-[#cbd5e1] rounded-sm p-2.5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-200 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-[#003366] uppercase tracking-wider flex items-center gap-1.5">
              📊 HRMIS Comprehensive Reporting Suite (13 Standard Reports)
            </span>
            <span className="bg-sky-100 text-[#001b48] text-[10px] font-bold px-2 py-0.5 rounded-full">
              Full Suite Available
            </span>
          </div>
          <button
            onClick={() => onNavigate('vacancy-analysis-report')}
            className="text-xs bg-[#001b48] text-white hover:bg-[#003366] font-semibold px-3 py-1 rounded transition-colors flex items-center justify-center gap-1"
          >
            <span>Open Interactive Reports Center</span>
            <span>→</span>
          </button>
        </div>

        {/* Quick Report Selector Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          <span className="text-gray-500 font-semibold whitespace-nowrap text-[10px] uppercase mr-1">Switch Report:</span>
          
          <button
            onClick={() => onNavigate('job-applicants-report')}
            className="px-2 py-1 bg-[#001b48] text-white font-bold rounded shadow-xs whitespace-nowrap"
          >
            Job Applicants (Active)
          </button>

          <button
            onClick={() => onNavigate('vacancy-analysis-report')}
            className="px-2 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 rounded whitespace-nowrap transition-colors"
          >
            Vacancy Analysis
          </button>

          <button
            onClick={() => onNavigate('recruitment-funnel-report')}
            className="px-2 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 rounded whitespace-nowrap transition-colors"
          >
            Recruitment Funnel
          </button>

          <button
            onClick={() => onNavigate('positions-advertised-report')}
            className="px-2 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 rounded whitespace-nowrap transition-colors"
          >
            Positions Advertised
          </button>

          <button
            onClick={() => onNavigate('interview-board-report')}
            className="px-2 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 rounded whitespace-nowrap transition-colors"
          >
            Interview Board (IBR)
          </button>

          <button
            onClick={() => onNavigate('psychometric-analytics-report')}
            className="px-2 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 rounded whitespace-nowrap transition-colors"
          >
            Aptitude & Proctoring
          </button>

          <button
            onClick={() => onNavigate('budget-utilization-report')}
            className="px-2 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 rounded whitespace-nowrap transition-colors"
          >
            Budget Utilization
          </button>

          <button
            onClick={() => onNavigate('offer-onboarding-report')}
            className="px-2 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 rounded whitespace-nowrap transition-colors"
          >
            Offer & Onboarding
          </button>

          <button
            onClick={() => onNavigate('time-to-hire-report')}
            className="px-2 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 rounded whitespace-nowrap transition-colors"
          >
            Time-to-Hire
          </button>

          <button
            onClick={() => onNavigate('recruited-by-vote-report')}
            className="px-2 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 rounded whitespace-nowrap transition-colors"
          >
            Recruited by Vote
          </button>

          <button
            onClick={() => onNavigate('approval-bottlenecks-report')}
            className="px-2 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 rounded whitespace-nowrap transition-colors"
          >
            Approval Bottlenecks
          </button>

          <button
            onClick={() => onNavigate('grade-readiness-report')}
            className="px-2 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 rounded whitespace-nowrap transition-colors"
          >
            Grade Readiness
          </button>

          <button
            onClick={() => onNavigate('eeo-diversity-report')}
            className="px-2 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 rounded whitespace-nowrap transition-colors"
          >
            Diversity & EEO
          </button>

          <button
            onClick={() => onNavigate('talent-pool-analytics-report')}
            className="px-2 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 rounded whitespace-nowrap transition-colors"
          >
            Talent Pool
          </button>
        </div>
      </div>

      <PageHeader
        badge="Report 1 • Applicant Roster"
        badgeColor="bg-sky-50 text-sky-700 border-sky-200"
        title="Job Applicants Report"
        subtitle="Comprehensive applicant master roster, qualification metrics, and verification records."
      />

      <MetricGrid cols="grid-cols-2 sm:grid-cols-4">
        <MetricCard label="Applicants in View" value={filteredCandidates.length} icon={User} gradient={GRADIENTS[0]} sublabel={`of ${candidates.length} total`} />
        <MetricCard label="New Applications" value={appliedCount} icon={Search} gradient={GRADIENTS[3]} />
        <MetricCard label="In Screening" value={shortlistedCount} icon={Filter} gradient={GRADIENTS[2]} />
        <MetricCard label="Offer Pipeline" value={offerPipelineCount} icon={Download} gradient={GRADIENTS[1]} sublabel={talentPoolCount > 0 ? `${talentPoolCount} in talent pool` : undefined} />
      </MetricGrid>

      <FilterPanel title="Applicant Filters" onReset={handleClearFilters} onApply={() => setCurrentPage(1)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <FilterField label="Position">
            <select value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)}>
              <option value="-select-">-select-</option>
              {Array.from(new Set(requisitions.map(r => r.position))).map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Region / County / Hub">
            <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
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
          </FilterField>
          <FilterField label="Age (max)">
            <input type="number" placeholder="Max age..." value={filterAge} onChange={(e) => setFilterAge(e.target.value)} />
          </FilterField>
          <FilterField label="Years of Experience (min)">
            <input type="number" placeholder="Min years..." value={filterExp} onChange={(e) => setFilterExp(e.target.value)} />
          </FilterField>
          <FilterField label="Education Level">
            <select value={selectedEdu} onChange={(e) => setSelectedEdu(e.target.value)}>
              <option value="-select-">-select-</option>
              {EDUCATION_LEVELS.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Begin Date">
            <input type="date" value={beginDate} onChange={(e) => setBeginDate(e.target.value)} />
          </FilterField>
          <FilterField label="End Date">
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </FilterField>
          <FilterField label="Status">
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="-All-">-All-</option>
              <option value="Applied">Applied</option>
              <option value="Pre-Shortlisted">Pre-Shortlisted</option>
              <option value="Assessment Sent">Assessment Sent</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Selected">Selected</option>
              <option value="Offer Issued">Offer Issued</option>
              <option value="Offer Accepted">Offer Accepted</option>
              <option value="Talent Pool">Talent Pool (Retained)</option>
            </select>
          </FilterField>
          <FilterField label="Search Term" className="md:col-span-2">
            <input type="text" placeholder="search by name, email, NIN, phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </FilterField>
        </div>
      </FilterPanel>

      <DataTableShell
        title="Applicant Master Roster"
        subtitle={`Showing page ${currentPage} of ${totalPages}`}
        onExport={handleExportExcel}
        actions={
          <button type="button" onClick={() => window.print()} className="btn btn-secondary">
            <Printer className="w-3.5 h-3.5" />
            Print to PDF
          </button>
        }
        footer={
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredCandidates.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        }
      >
        <table className="standard-table">
          <thead>
            <tr>
              <th className="w-8 text-center">No.</th>
              <th>Applicants Name</th>
              <th>Position</th>
              <th>Employment history</th>
              <th>Email Address</th>
              <th className="text-center">Age</th>
              <th>Education Level</th>
              <th className="text-center whitespace-nowrap">Years of Experience</th>
              <th className="whitespace-nowrap">Mobile Phone Number</th>
              <th className="text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0]">
            {paginatedList.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-gray-500 font-medium">
                  No applicants found matching active search criteria.
                </td>
              </tr>
            ) : (
              paginatedList.map((c, idx) => (
                <tr 
                  key={c.id} 
                  className={`hover:bg-[#f0fdf4]/50 transition-colors ${idx % 2 === 1 ? 'bg-[#fcfcfd]' : 'bg-white'}`}
                >
                  <td className="py-2 px-2 text-center text-gray-500 font-medium">
                    {(currentPage - 1) * itemsPerPage + idx + 1}.
                  </td>
                  <td className="py-2 px-3 font-bold text-[#001b48]">
                    {c.name}
                    {c.nationalId && (
                      <span className="block text-[10px] text-gray-400 font-normal">
                        NIN: {c.nationalId}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[10px] bg-sky-50 text-sky-800 border border-sky-200 font-normal">
                      <span>📍</span> {c.region || 'Central Region'} • {c.fieldRegion || c.county || 'Main Hub'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-800 font-medium">
                    {c.position}
                  </td>
                  <td className="py-2 px-3 text-gray-600 text-[11px] max-w-xs truncate" title={c.employmentHistory}>
                    {c.employmentHistory}
                  </td>
                  <td className="py-2 px-3 text-[#001b48]">
                    {c.email}
                  </td>
                  <td className="py-2 px-2 text-center font-semibold text-gray-700">
                    {c.age}
                  </td>
                  <td className="py-2 px-3 text-gray-700 text-[11px]">
                    {c.educationLevel}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-gray-800">
                    {c.yearsOfExperience} yrs
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap text-gray-700 font-mono text-[11px]">
                    +{c.countryCode} {c.phone}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                      c.status === 'Offer Accepted' || c.status === 'Hired'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.status === 'Offer Issued' || c.status === 'Selected'
                        ? 'bg-amber-100 text-amber-800'
                        : c.status === 'Talent Pool'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-50 text-blue-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </DataTableShell>
    </ViewShell>
  );
};
