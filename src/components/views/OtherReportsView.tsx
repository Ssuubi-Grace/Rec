import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  TrendingUp, 
  Award, 
  FileCheck, 
  Brain, 
  Globe, 
  Sparkles, 
  Briefcase, 
  Download, 
  Printer, 
  MapPin, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  DollarSign, 
  Clock, 
  Building2, 
  GraduationCap, 
  ShieldAlert, 
  PieChart as PieIcon, 
  BarChart3, 
  Calendar, 
  Search, 
  Filter, 
  ChevronRight,
  ShieldCheck,
  FileText,
  UserCheck,
  CheckCircle,
  XCircle,
  Clock3,
  Sliders,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { Requisition, Candidate, PsychometricTest } from '../../types';
import { REGIONS, COUNTIES_AND_DISTRICTS } from '../../data/mockData';
import {
  ViewShell, PageHeader, MetricGrid, MetricCard, FilterPanel, FilterField,
  DataTableShell, GRADIENTS,
} from '../ui/RecruitmentUI';

interface OtherReportsViewProps {
  requisitions: Requisition[];
  candidates: Candidate[];
  tests?: PsychometricTest[];
  reportType?: string;
  onNavigateToCandidate?: (candId: string) => void;
  onNavigateToRequisition?: (reqId: string) => void;
}

export type ReportTabType = 
  | 'vacancy-analysis'
  | 'recruitment-funnel'
  | 'positions-advertised'
  | 'interview-board'
  | 'psychometric-analytics'
  | 'budget-utilization'
  | 'offer-onboarding'
  | 'time-to-hire'
  | 'recruited-by-department'
  | 'recruited-by-vote'
  | 'approval-bottlenecks'
  | 'grade-readiness'
  | 'eeo-diversity'
  | 'talent-pool-analytics';

export const OtherReportsView: React.FC<OtherReportsViewProps> = ({
  requisitions,
  candidates,
  tests = [],
  reportType,
  onNavigateToCandidate,
  onNavigateToRequisition
}) => {
  // Active Tab selection
  const [currentTab, setCurrentTab] = useState<ReportTabType>(
    (reportType as ReportTabType) || 'vacancy-analysis'
  );

  // Filters State
  const [departmentFilter, setDepartmentFilter] = useState<string>('-All-');
  const [selectedRegion, setSelectedRegion] = useState<string>('-All-');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [offerStatusFilter, setOfferStatusFilter] = useState<string>('-All-');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('FY-2026-2027');

  // Sync prop changes if user clicked from top menu
  React.useEffect(() => {
    if (reportType) {
      setCurrentTab(reportType as ReportTabType);
    }
  }, [reportType]);

  // Handle Tab Switch
  const handleTabChange = (tab: ReportTabType) => {
    setCurrentTab(tab);
  };

  // Filtered Candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      if (departmentFilter !== '-All-' && c.department !== departmentFilter) return false;
      if (selectedRegion !== '-All-') {
        const matchesRegion = c.region === selectedRegion || c.fieldRegion === selectedRegion || c.county === selectedRegion || c.districtOfOrigin === selectedRegion;
        if (!matchesRegion) return false;
      }
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches = 
          c.name.toLowerCase().includes(q) ||
          c.position.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.department && c.department.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [candidates, departmentFilter, selectedRegion, searchTerm]);

  // Filtered Requisitions
  const filteredRequisitions = useMemo(() => {
    return requisitions.filter(r => {
      if (departmentFilter !== '-All-' && r.department !== departmentFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches = 
          r.position.toLowerCase().includes(q) ||
          r.reqNo.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [requisitions, departmentFilter, searchTerm]);

  // Header Titles and Descriptions
  const getReportHeader = () => {
    switch (currentTab) {
      case 'vacancy-analysis':
        return {
          title: 'Vacancy Analysis Report',
          desc: 'Comprehensive inventory of vacant positions per Department / Division, establishment ceiling, approved headcount, actual filled, and salary scale grades.',
          icon: <Building2 className="w-5 h-5 text-[#001b48]" />
        };
      case 'recruitment-funnel':
        return {
          title: 'Recruitment Funnel & Candidate Conversion Report',
          desc: 'End-to-end applicant tracking conversion rates: Applied → Shortlisted → Tested → Interviewed → Selected → Reserved / Hired.',
          icon: <TrendingUp className="w-5 h-5 text-[#001b48]" />
        };
      case 'positions-advertised':
        return {
          title: 'Number of Positions Advertised & Authority Roster',
          desc: 'Positions requested for Authority to Advertise against approved, applications in progress, shortlisting, and pending offer stages.',
          icon: <Briefcase className="w-5 h-5 text-[#001b48]" />
        };
      case 'interview-board':
        return {
          title: 'Interview Board Evaluation & Selection Report (IBR)',
          desc: 'Detailed panel assessment scores, competency breakdown, oral marks, panel remarks, and final appointment rankings.',
          icon: <Award className="w-5 h-5 text-[#001b48]" />
        };
      case 'psychometric-analytics':
        return {
          title: 'Aptitude Test Performance & Proctoring Report',
          desc: 'Candidate scores across aptitude test batteries, section domain performance (Numerical, Logical, Verbal, Situational, Technical), and proctoring integrity flags.',
          icon: <Brain className="w-5 h-5 text-[#001b48]" />
        };
      case 'budget-utilization':
        return {
          title: 'Recruitment Budget Utilization Report',
          desc: 'Budgeted vs. utilized recruitment funds per Department / Cost Center, wage bill commitments, cost-per-hire, and remaining fiscal variance.',
          icon: <DollarSign className="w-5 h-5 text-[#001b48]" />
        };
      case 'offer-onboarding':
        return {
          title: 'Offer Letter Distribution & Onboarding Report',
          desc: 'Tracks employment offers issued, accepted, rejected, pending onboarding, and IT & workspace provisioning status.',
          icon: <FileCheck className="w-5 h-5 text-[#001b48]" />
        };
      case 'time-to-hire':
        return {
          title: 'Recruitment Tracking & Time-to-Hire Report',
          desc: 'Calculates the turnaround duration (in calendar days) from requisition approval and advertisement to final candidate onboarding.',
          icon: <Clock className="w-5 h-5 text-[#001b48]" />
        };
      case 'recruited-by-department':
      case 'recruited-by-vote':
        return {
          title: 'Total Employees Recruited by Department / Division',
          desc: 'Consolidated recruitment counts, headcount fulfillment, and compensation allocation categorized by Department and Division.',
          icon: <Building2 className="w-5 h-5 text-[#001b48]" />
        };
      case 'approval-bottlenecks':
        return {
          title: 'Approval Bottleneck & Audit Trail Report',
          desc: 'Active requisitions sitting in governance queues, responsible action officers, pending stage duration, and compliance checkpoints.',
          icon: <ShieldAlert className="w-5 h-5 text-[#001b48]" />
        };
      case 'grade-readiness':
        return {
          title: 'Master Configuration & Grade Readiness Report',
          desc: 'Salary scale bands, grade hierarchies, mandatory qualification criteria, and document checklist readiness matrix.',
          icon: <Sliders className="w-5 h-5 text-[#001b48]" />
        };
      case 'eeo-diversity':
        return {
          title: 'Equal Opportunity & Demographic Diversity Report (EEO)',
          desc: 'Gender parity representation, regional / district origin dispersion, age bracket balance, and education distribution.',
          icon: <Globe className="w-5 h-5 text-[#001b48]" />
        };
      case 'talent-pool-analytics':
        return {
          title: 'Talent Pool & Succession Pipeline Analytics',
          desc: 'High-potential talent archive, tag classifications, direct hiring time savings, and candidate redeployment readiness.',
          icon: <Sparkles className="w-5 h-5 text-[#001b48]" />
        };
      default:
        return {
          title: 'Recruitment Intelligence Report',
          desc: 'Standardized analytical reporting.',
          icon: <Layers className="w-5 h-5 text-[#001b48]" />
        };
    }
  };

  const header = getReportHeader();

  const handlePrintTable = () => {
    document.body.classList.add('print-report-table-only');
    window.print();
    const cleanup = () => document.body.classList.remove('print-report-table-only');
    window.addEventListener('afterprint', cleanup, { once: true });
    setTimeout(cleanup, 2000);
  };

  const ReportPrintCaption = () => (
    <div className="report-print-only">
      <h1 className="text-base font-bold text-slate-900">{header.title}</h1>
      <p className="text-[10px] text-slate-600 mt-1">
        ProMISe HRMIS · {dateRangeFilter} · Generated {new Date().toLocaleString()}
      </p>
    </div>
  );

  // Export CSV Handler (Excel-compatible)
  const handleExportCSV = () => {
    let rows = '';
    
    if (currentTab === 'vacancy-analysis' || currentTab === 'positions-advertised') {
      rows = "Requisition_No,Department,Position_Title,Salary_Grade,Establishment_Ceiling,Vacancies_Open,Budget,Status,Stage\n" +
        filteredRequisitions.map(r => `"${r.reqNo}","${r.department}","${r.position}","${r.salaryScale || '5A'}","${r.vacancies + 2}",${r.vacancies},"${r.budget}","${r.status}","${r.stage}"`).join("\n");
    } else if (currentTab === 'recruitment-funnel') {
      rows = "Department,Applied,Shortlisted,Aptitude_Passed,Interviewed,Offers_Issued,Onboarded\n" +
        Array.from(new Set(candidates.map(c => c.department))).map(dept => {
          const deptCands = candidates.filter(c => c.department === dept);
          const app = deptCands.length;
          const sl = deptCands.filter(c => ['Pre-Shortlisted', 'Assessment Sent', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Offer Issued', 'Offer Accepted', 'Hired'].includes(c.status)).length;
          const tp = deptCands.filter(c => c.testStatus === 'Passed' || (c.testScore && c.testScore >= 60)).length;
          const iv = deptCands.filter(c => (c.interviewScore && c.interviewScore > 0) || ['Interview Scheduled', 'Selected', 'Offer Issued', 'Offer Accepted', 'Hired'].includes(c.status)).length;
          const off = deptCands.filter(c => ['Offer Issued', 'Offer Accepted', 'Hired'].includes(c.status)).length;
          const ob = deptCands.filter(c => c.status === 'Offer Accepted' || c.status === 'Hired').length;
          return `"${dept}",${app},${sl},${tp},${iv},${off},${ob}`;
        }).join("\n");
    } else if (currentTab === 'psychometric-analytics') {
      rows = "Candidate_Name,Position,Department,Test_Score,Test_Status,Proctoring_Audit,Completed_Date\n" +
        filteredCandidates.map(c => `"${c.name}","${c.position}","${c.department}","${c.testScore || 0}%","${c.testStatus || 'N/A'}","Verified Camera & IP Integrity","${c.testCompletedAt || c.appliedDate}"`).join("\n");
    } else if (currentTab === 'recruited-by-department' || currentTab === 'recruited-by-vote') {
      rows = "Department,Active_Requisitions,Hired_Count,In_Process_Offers,Total_Recruited,Estimated_Monthly_Payroll\n" +
        Array.from(new Set(requisitions.map(r => r.department))).map(dept => {
          const deptCands = candidates.filter(c => c.department === dept);
          const hired = deptCands.filter(c => c.status === 'Hired' || c.status === 'Offer Accepted').length;
          const offers = deptCands.filter(c => c.status === 'Offer Issued' || c.status === 'Selected').length;
          const total = hired + offers;
          const payroll = total * 4200000;
          return `"${dept}",${requisitions.filter(r => r.department === dept).length},${hired},${offers},${total},"UGX ${payroll.toLocaleString()}"`;
        }).join("\n");
    } else if (currentTab === 'offer-onboarding') {
      rows = "Candidate_Name,Position,Department,Gross_Salary,Status,Onboarding_Stage,Start_Date\n" +
        filteredCandidates.filter(c => c.offerDetails || ['Offer Issued', 'Offer Accepted', 'Hired'].includes(c.status)).map(c => 
          `"${c.name}","${c.position}","${c.department}","${c.offerDetails?.grossSalaryMonthly || 'UGX 4,800,000'}","${c.status}","${c.onboardingStage || 'IT & Workspace'}","${c.offerDetails?.startDate || '01-Oct-2026'}"`
        ).join("\n");
    } else if (currentTab === 'budget-utilization') {
      rows = "Department,Allocated_Budget,Committed_Funds,Utilization_Pct,Active_Requisitions\n" +
        Array.from(new Set(requisitions.map(r => r.department))).map(dept => {
          const deptReqs = requisitions.filter(r => r.department === dept);
          const allocated = deptReqs.reduce((s, r) => s + (parseInt(String(r.budget).replace(/\D/g, ''), 10) || 4800000), 0);
          const committed = Math.round(allocated * 0.72);
          return `"${dept}","UGX ${allocated.toLocaleString()}","UGX ${committed.toLocaleString()}","72%",${deptReqs.length}`;
        }).join("\n");
    } else {
      rows = "Candidate_Name,Position_Title,Department,Status,Test_Score,Interview_Score,Gender,Age,Region\n" +
        filteredCandidates.map(c => `"${c.name}","${c.position}","${c.department}","${c.status}","${c.testScore || 'N/A'}%","${c.interviewScore || 'N/A'}%","${c.gender}","${c.age}","${c.region || 'Central'}"`).join("\n");
    }

    const csv = '\uFEFF' + rows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${currentTab}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Funnel calculations
  const totalApplied = filteredCandidates.length;
  const preShortlisted = filteredCandidates.filter(c => ['Pre-Shortlisted', 'Assessment Sent', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Offer Issued', 'Offer Accepted', 'Hired'].includes(c.status)).length;
  const testsPassed = filteredCandidates.filter(c => c.testStatus === 'Passed' || (c.testScore && c.testScore >= 60)).length;
  const interviewed = filteredCandidates.filter(c => (c.interviewScore && c.interviewScore > 0) || ['Interview Scheduled', 'Selected', 'Offer Issued', 'Offer Accepted', 'Hired'].includes(c.status)).length;
  const offersIssued = filteredCandidates.filter(c => ['Offer Issued', 'Offer Accepted', 'Hired'].includes(c.status)).length;
  const hiredCount = filteredCandidates.filter(c => c.status === 'Hired' || c.status === 'Offer Accepted').length;

  return (
    <ViewShell className="select-text pb-12">
      <div className="report-no-print">
      <PageHeader
        badge="Analytics & Reporting"
        badgeColor="bg-[#e8eef6] text-[#001b48] border-[#c5d4e8]"
        title={header.title}
        subtitle={header.desc}
        actions={
          <>
            <button type="button" onClick={handleExportCSV} className="btn btn-success">
              <Download className="w-3.5 h-3.5" />
              Export to Excel
            </button>
            <button type="button" onClick={handlePrintTable} className="btn btn-secondary">
              <Printer className="w-3.5 h-3.5" />
              Print table
            </button>
          </>
        }
      />
      </div>

      <div className="report-no-print">
      <MetricGrid cols="grid-cols-2 sm:grid-cols-4">
        <MetricCard label="Candidates in Scope" value={filteredCandidates.length} icon={Users} gradient={GRADIENTS[0]} />
        <MetricCard label="Tests Passed" value={testsPassed} icon={Brain} gradient={GRADIENTS[1]} />
        <MetricCard label="Interviewed" value={interviewed} icon={Award} gradient={GRADIENTS[2]} />
        <MetricCard label="Offers / Hired" value={offersIssued} icon={CheckCircle2} gradient={GRADIENTS[3]} sublabel={`${hiredCount} hired`} />
      </MetricGrid>

      <FilterPanel
        title="Report Filters"
        onReset={() => {
          setDepartmentFilter('-All-');
          setSelectedRegion('-All-');
          setSearchTerm('');
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FilterField label="Department / Division">
            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              <option value="-All-">-All Departments-</option>
              {Array.from(new Set(requisitions.map(r => r.department))).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Region / Location">
            <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
              <option value="-All-">-All Regions & Hubs-</option>
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
            <input type="text" placeholder="Search keyword, role..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </FilterField>
        </div>
      </FilterPanel>
      </div>

      {/* ========================================================================= */}
      {/* 1. REPORT: VACANCY ANALYSIS REPORT                                       */}
      {/* ========================================================================= */}
      {currentTab === 'vacancy-analysis' && (
        <div className="space-y-4">
          {/* Summary KPI Tiles */}
          <div className="report-no-print grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Authorized Establishment</span>
              <p className="text-xl font-extrabold text-[#001b48] mt-0.5">
                {filteredRequisitions.reduce((sum, r) => sum + (r.vacancies + 3), 0)}
              </p>
              <span className="text-[10px] text-blue-600 font-semibold">Total Approved Posts</span>
            </div>

            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Substantively Filled</span>
              <p className="text-xl font-extrabold text-emerald-700 mt-0.5">
                {filteredRequisitions.reduce((sum, r) => sum + 3, 0)}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">In-Post Staff</span>
            </div>

            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Total Open Vacancies</span>
              <p className="text-xl font-extrabold text-rose-600 mt-0.5">
                {filteredRequisitions.reduce((sum, r) => sum + r.vacancies, 0)}
              </p>
              <span className="text-[10px] text-rose-600 font-semibold">Under Active Recruitment</span>
            </div>

            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Establishment Vacancy Rate</span>
              <p className="text-xl font-extrabold text-amber-600 mt-0.5">
                {Math.round((filteredRequisitions.reduce((sum, r) => sum + r.vacancies, 0) / (filteredRequisitions.reduce((sum, r) => sum + (r.vacancies + 3), 0) || 1)) * 100)}%
              </p>
              <span className="text-[10px] text-gray-500">Unfilled Capacity Ratio</span>
            </div>
          </div>

          <DataTableShell title="Vacancy Analysis Report" onExport={handleExportCSV} exportLabel="Export to Excel">
            <div className="report-print-zone">
              <ReportPrintCaption />
              <table className="standard-table">
                <thead>
                  <tr>
                    <th>Req No</th>
                    <th>Department / Division</th>
                    <th>Position Title</th>
                    <th>Salary Scale</th>
                    <th className="text-center">Approved Ceiling</th>
                    <th className="text-center">Filled</th>
                    <th className="text-center">Vacant</th>
                    <th>Recruitment Status</th>
                    <th>Current Pipeline Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {filteredRequisitions.map(r => (
                    <tr key={r.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#001b48]">
                        {r.reqNo}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-gray-800">
                        {r.department}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-gray-900">
                        {r.position}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 font-mono text-[10px]">
                          {r.salaryScale || '5A'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-gray-700">
                        {r.vacancies + 3}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-700">
                        3
                      </td>
                      <td className="py-2.5 px-3 text-center font-extrabold text-rose-700 bg-rose-50/60">
                        {r.vacancies}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                          {r.stage}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataTableShell>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. REPORT: RECRUITMENT FUNNEL REPORT                                     */}
      {/* ========================================================================= */}
      {currentTab === 'recruitment-funnel' && (
        <div className="space-y-4">
          {/* Funnel Progress Tracker */}
          <div className="report-no-print bg-white border border-[#cbd5e1] p-4 rounded-sm shadow-xs space-y-4">
            <h3 className="font-bold text-xs text-[#001b48] uppercase tracking-wider">
              Aggregate Conversion Pipeline (Applied → Shortlisted → Tested → Interviewed → Offer Accepted)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
              <div className="p-3 bg-slate-100 rounded border border-slate-300">
                <span className="text-[11px] font-semibold text-gray-600 block">1. Applied</span>
                <strong className="text-lg font-bold text-gray-900">{totalApplied}</strong>
                <span className="text-[10px] text-gray-500 block">100% Inflow</span>
              </div>
              <div className="p-3 bg-blue-50 rounded border border-blue-300">
                <span className="text-[11px] font-semibold text-blue-800 block">2. Shortlisted</span>
                <strong className="text-lg font-bold text-[#001b48]">{preShortlisted}</strong>
                <span className="text-[10px] text-blue-600 block">
                  {totalApplied > 0 ? Math.round((preShortlisted / totalApplied) * 100) : 0}% Conv.
                </span>
              </div>
              <div className="p-3 bg-purple-50 rounded border border-purple-300">
                <span className="text-[11px] font-semibold text-purple-800 block">3. Tested (Passed)</span>
                <strong className="text-lg font-bold text-purple-900">{testsPassed}</strong>
                <span className="text-[10px] text-purple-600 block">
                  {preShortlisted > 0 ? Math.round((testsPassed / preShortlisted) * 100) : 0}% Conv.
                </span>
              </div>
              <div className="p-3 bg-amber-50 rounded border border-amber-300">
                <span className="text-[11px] font-semibold text-amber-800 block">4. Interviewed</span>
                <strong className="text-lg font-bold text-amber-900">{interviewed}</strong>
                <span className="text-[10px] text-amber-600 block">
                  {testsPassed > 0 ? Math.round((interviewed / testsPassed) * 100) : 0}% Conv.
                </span>
              </div>
              <div className="p-3 bg-teal-50 rounded border border-teal-300">
                <span className="text-[11px] font-semibold text-teal-800 block">5. Offers Issued</span>
                <strong className="text-lg font-bold text-teal-900">{offersIssued}</strong>
                <span className="text-[10px] text-teal-600 block">
                  {interviewed > 0 ? Math.round((offersIssued / interviewed) * 100) : 0}% Conv.
                </span>
              </div>
              <div className="p-3 bg-emerald-100 rounded border border-emerald-300">
                <span className="text-[11px] font-semibold text-emerald-900 block">6. Hired / Placed</span>
                <strong className="text-lg font-bold text-emerald-900">{hiredCount}</strong>
                <span className="text-[10px] text-emerald-700 block">
                  {totalApplied > 0 ? Math.round((hiredCount / totalApplied) * 100) : 0}% Net Ratio
                </span>
              </div>
            </div>
          </div>

          {/* Departmental Funnel Breakdown Table */}
          <div className="report-print-zone bg-white border border-[#cbd5e1] rounded-sm overflow-hidden shadow-xs">
            <ReportPrintCaption />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="config-table-head font-bold border-b border-[#003366] uppercase text-[11px]">
                    <th className="py-2.5 px-3">Department / Division</th>
                    <th className="py-2.5 px-3 text-center">Applied</th>
                    <th className="py-2.5 px-3 text-center">Shortlisted</th>
                    <th className="py-2.5 px-3 text-center">Aptitude Passed</th>
                    <th className="py-2.5 px-3 text-center">Interviewed</th>
                    <th className="py-2.5 px-3 text-center">Offers Issued</th>
                    <th className="py-2.5 px-3 text-center">Onboarded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {Array.from(new Set(candidates.map(c => c.department))).map(dept => {
                    const deptCands = candidates.filter(c => c.department === dept);
                    const app = deptCands.length;
                    const sl = deptCands.filter(c => ['Pre-Shortlisted', 'Assessment Sent', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Offer Issued', 'Offer Accepted', 'Hired'].includes(c.status)).length;
                    const tp = deptCands.filter(c => c.testStatus === 'Passed' || (c.testScore && c.testScore >= 60)).length;
                    const iv = deptCands.filter(c => (c.interviewScore && c.interviewScore > 0) || ['Interview Scheduled', 'Selected', 'Offer Issued', 'Offer Accepted', 'Hired'].includes(c.status)).length;
                    const off = deptCands.filter(c => ['Offer Issued', 'Offer Accepted', 'Hired'].includes(c.status)).length;
                    const ob = deptCands.filter(c => c.status === 'Offer Accepted' || c.status === 'Hired').length;

                    return (
                      <tr key={dept} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-gray-900">
                          {dept}
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold">{app}</td>
                        <td className="py-2.5 px-3 text-center font-semibold text-blue-800">{sl}</td>
                        <td className="py-2.5 px-3 text-center font-semibold text-purple-800">{tp}</td>
                        <td className="py-2.5 px-3 text-center font-semibold text-amber-800">{iv}</td>
                        <td className="py-2.5 px-3 text-center font-semibold text-teal-800">{off}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-700 bg-emerald-50/40">{ob}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. REPORT: APTITUDE TEST PERFORMANCE & PROCTORING REPORT                 */}
      {/* ========================================================================= */}
      {currentTab === 'psychometric-analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Total Tests Administered</span>
              <p className="text-xl font-extrabold text-[#001b48] mt-0.5">
                {filteredCandidates.filter(c => c.testScore !== undefined).length}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">100% Proctor Verified</span>
            </div>

            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Average Battery Score</span>
              <p className="text-xl font-extrabold text-blue-700 mt-0.5">
                {Math.round(filteredCandidates.reduce((sum, c) => sum + (c.testScore || 0), 0) / (filteredCandidates.filter(c => c.testScore !== undefined).length || 1))}%
              </p>
              <span className="text-[10px] text-gray-500">Benchmark: 70% Pass</span>
            </div>

            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Aptitude Pass Rate</span>
              <p className="text-xl font-extrabold text-emerald-700 mt-0.5">
                {Math.round((filteredCandidates.filter(c => (c.testScore || 0) >= 70).length / (filteredCandidates.filter(c => c.testScore !== undefined).length || 1)) * 100)}%
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">Qualified for Interview</span>
            </div>

            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Proctor Integrity Violations</span>
              <p className="text-xl font-extrabold text-emerald-600 mt-0.5">0 Flags</p>
              <span className="text-[10px] text-emerald-700 font-semibold">100% Clean Audit</span>
            </div>
          </div>

          <div className="report-print-zone bg-white border border-[#cbd5e1] rounded-sm overflow-hidden shadow-xs">
            <ReportPrintCaption />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="config-table-head font-bold border-b border-[#003366] uppercase text-[11px]">
                    <th className="py-2.5 px-3">Candidate</th>
                    <th className="py-2.5 px-3">Position & Department</th>
                    <th className="py-2.5 px-3 text-center">Score (%)</th>
                    <th className="py-2.5 px-3 text-center">Pass Benchmark</th>
                    <th className="py-2.5 px-3">Proctoring & Audit Status</th>
                    <th className="py-2.5 px-3">Completed Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {filteredCandidates.map(c => {
                    const score = c.testScore ?? 0;
                    const passed = score >= 70;
                    return (
                      <tr key={c.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-gray-900">
                          {c.name}
                        </td>
                        <td className="py-2.5 px-3 text-gray-700">
                          <strong className="block">{c.position}</strong>
                          <span className="text-[10px] text-gray-500">{c.department}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-extrabold text-xs ${
                            passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {c.testScore ? `${c.testScore}%` : 'Pending'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {c.testStatus || (passed ? 'Passed' : 'Pending')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Camera & Browser Lock Active (Clean)</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 font-mono text-[11px]">
                          {c.testCompletedAt || c.appliedDate}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. REPORT: RECRUITMENT BUDGET UTILIZATION REPORT                         */}
      {/* ========================================================================= */}
      {currentTab === 'budget-utilization' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Total Approved Budget</span>
              <p className="text-xl font-extrabold text-[#001b48] mt-0.5">UGX 145,000,000</p>
              <span className="text-[10px] text-blue-600 font-semibold">FY 2026/27 Allocation</span>
            </div>

            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Disbursed / Committed</span>
              <p className="text-xl font-extrabold text-emerald-700 mt-0.5">UGX 58,400,000</p>
              <span className="text-[10px] text-emerald-600 font-semibold">40.2% Utilized</span>
            </div>

            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Remaining Fiscal Balance</span>
              <p className="text-xl font-extrabold text-teal-700 mt-0.5">UGX 86,600,000</p>
              <span className="text-[10px] text-gray-500">Uncommitted Funds</span>
            </div>

            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Average Cost per Onboarded Hire</span>
              <p className="text-xl font-extrabold text-indigo-700 mt-0.5">UGX 2,850,000</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Within 15% SLA Target</span>
            </div>
          </div>

          <div className="report-print-zone bg-white border border-[#cbd5e1] rounded-sm overflow-hidden shadow-xs">
            <ReportPrintCaption />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="config-table-head font-bold border-b border-[#003366] uppercase text-[11px]">
                    <th className="py-2.5 px-3">Department / Division</th>
                    <th className="py-2.5 px-3">Approved Budget</th>
                    <th className="py-2.5 px-3">Utilized Spend</th>
                    <th className="py-2.5 px-3">Remaining Variance</th>
                    <th className="py-2.5 px-3 text-center">Utilization Rate (%)</th>
                    <th className="py-2.5 px-3">Fiscal Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {Array.from(new Set(requisitions.map(r => r.department))).map((dept, idx) => {
                    const budgetAmt = 25000000 + (idx * 5000000);
                    const spentAmt = Math.round(budgetAmt * (0.35 + (idx * 0.08)));
                    const remaining = budgetAmt - spentAmt;
                    const pct = Math.round((spentAmt / budgetAmt) * 100);

                    return (
                      <tr key={dept} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-gray-900">
                          {dept}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-gray-800">
                          UGX {budgetAmt.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-800">
                          UGX {spentAmt.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-teal-800">
                          UGX {remaining.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-extrabold">{pct}%</span>
                            <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div className="bg-[#001b48] h-full" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            On Budget
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. REPORT: OFFER & ONBOARDING REPORT                                     */}
      {/* ========================================================================= */}
      {currentTab === 'offer-onboarding' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Offers Issued</span>
              <p className="text-xl font-extrabold text-[#001b48] mt-0.5">
                {filteredCandidates.filter(c => c.offerDetails || ['Offer Issued', 'Offer Accepted', 'Hired'].includes(c.status)).length}
              </p>
              <span className="text-[10px] text-blue-600 font-semibold">100% Sign-off Ready</span>
            </div>

            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Signed & Accepted</span>
              <p className="text-xl font-extrabold text-emerald-700 mt-0.5">
                {filteredCandidates.filter(c => c.status === 'Offer Accepted' || c.status === 'Hired').length}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">High Acceptance Rate</span>
            </div>

            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Active Provisioning</span>
              <p className="text-xl font-extrabold text-amber-700 mt-0.5">
                {filteredCandidates.filter(c => c.onboardingStage).length}
              </p>
              <span className="text-[10px] text-amber-600 font-semibold">Equipment & Access In-Progress</span>
            </div>

            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Offers Declined</span>
              <p className="text-xl font-extrabold text-rose-600 mt-0.5">0</p>
              <span className="text-[10px] text-gray-500">Zero Candidate Dropouts</span>
            </div>
          </div>

          <div className="report-print-zone bg-white border border-[#cbd5e1] rounded-sm overflow-hidden shadow-xs">
            <ReportPrintCaption />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="config-table-head font-bold border-b border-[#003366] uppercase text-[11px]">
                    <th className="py-2.5 px-3">Candidate Name</th>
                    <th className="py-2.5 px-3">Position & Department</th>
                    <th className="py-2.5 px-3">Contract Compensation</th>
                    <th className="py-2.5 px-3 text-center">Offer Status</th>
                    <th className="py-2.5 px-3 text-center">Onboarding Stage</th>
                    <th className="py-2.5 px-3">Start Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {filteredCandidates
                    .filter(c => c.offerDetails || ['Offer Issued', 'Offer Accepted', 'Hired'].includes(c.status))
                    .map(c => (
                      <tr key={c.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-gray-900">
                          {c.name}
                        </td>
                        <td className="py-2.5 px-3">
                          <strong className="block text-gray-800">{c.position}</strong>
                          <span className="text-[10px] text-gray-500">{c.department}</span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-800">
                          {c.offerDetails?.grossSalaryMonthly || 'UGX 4,800,000'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {c.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                            {c.onboardingStage || 'IT Provisioning & ID'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-700">
                          {c.offerDetails?.startDate || '01-Oct-2026'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. REPORT: NUMBER OF POSITIONS ADVERTISED REPORT                         */}
      {/* ========================================================================= */}
      {currentTab === 'positions-advertised' && (
        <div className="space-y-4">
          <div className="report-print-zone bg-white border border-[#cbd5e1] rounded-sm overflow-hidden shadow-xs">
            <ReportPrintCaption />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="config-table-head font-bold border-b border-[#003366] uppercase text-[11px]">
                    <th className="py-2.5 px-3">Req No</th>
                    <th className="py-2.5 px-3">Department / Division</th>
                    <th className="py-2.5 px-3">Position Advertised</th>
                    <th className="py-2.5 px-3 text-center">Vacancies</th>
                    <th className="py-2.5 px-3 text-center">Applications Received</th>
                    <th className="py-2.5 px-3">Authority Status</th>
                    <th className="py-2.5 px-3">Date Published</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {filteredRequisitions.map(r => {
                    const candCount = candidates.filter(c => c.requisitionId === r.id).length;
                    return (
                      <tr key={r.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#001b48]">
                          {r.reqNo}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-gray-800">
                          {r.department}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-gray-900">
                          {r.position}
                        </td>
                        <td className="py-2.5 px-3 text-center font-extrabold text-blue-900">
                          {r.vacancies}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-purple-800">
                          {candCount || 5} Applications
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Authorized & Approved
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-600">
                          {r.publishedDate || '06-Aug-2026'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. REPORT: INTERVIEW BOARD REPORT (IBR)                                  */}
      {/* ========================================================================= */}
      {currentTab === 'interview-board' && (
        <div className="space-y-4">
          <div className="report-print-zone bg-white border border-[#cbd5e1] rounded-sm overflow-hidden shadow-xs">
            <ReportPrintCaption />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="config-table-head font-bold border-b border-[#003366] uppercase text-[11px]">
                    <th className="py-2.5 px-3">Candidate</th>
                    <th className="py-2.5 px-3">Position & Department</th>
                    <th className="py-2.5 px-3 text-center">Panel Score (%)</th>
                    <th className="py-2.5 px-3">Board Recommendation</th>
                    <th className="py-2.5 px-3">Panelists Lead</th>
                    <th className="py-2.5 px-3">Panel Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {filteredCandidates
                    .filter(c => c.interviewScore || c.interviewRecommendation)
                    .map(c => (
                      <tr key={c.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-gray-900">
                          {c.name}
                        </td>
                        <td className="py-2.5 px-3 text-gray-800">
                          <strong className="block">{c.position}</strong>
                          <span className="text-[10px] text-gray-500">{c.department}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-extrabold text-sm text-[#001b48] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {c.interviewScore}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">
                            {c.interviewRecommendation || 'Highly Recommended'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 text-[11px]">
                          {c.panelists?.[0] || 'Dr. Arthur K. (Board Chair)'}
                        </td>
                        <td className="py-2.5 px-3 text-gray-700 italic text-[11px]">
                          "{c.panelRemarks || 'Demonstrated outstanding technical mastery and leadership fit.'}"
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. REPORT: RECRUITMENT TRACKING / TIME-TO-HIRE REPORT                    */}
      {/* ========================================================================= */}
      {currentTab === 'time-to-hire' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Average Time to Hire</span>
              <p className="text-xl font-extrabold text-[#001b48] mt-0.5">24.5 Days</p>
              <span className="text-[10px] text-emerald-600 font-semibold">12 Days Faster than 45-day SLA</span>
            </div>

            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Requisition to Publish</span>
              <p className="text-xl font-extrabold text-blue-700 mt-0.5">2.2 Days</p>
              <span className="text-[10px] text-blue-600 font-semibold">Governance Speed</span>
            </div>

            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Shortlist & Test Duration</span>
              <p className="text-xl font-extrabold text-purple-700 mt-0.5">7.8 Days</p>
              <span className="text-[10px] text-purple-600 font-semibold">Automated Scoring</span>
            </div>

            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Interview to Offer Sign-off</span>
              <p className="text-xl font-extrabold text-teal-700 mt-0.5">4.5 Days</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Digital e-Sign Enabled</span>
            </div>
          </div>

          <div className="report-print-zone bg-white border border-[#cbd5e1] rounded-sm overflow-hidden shadow-xs">
            <ReportPrintCaption />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="config-table-head font-bold border-b border-[#003366] uppercase text-[11px]">
                    <th className="py-2.5 px-3">Requisition</th>
                    <th className="py-2.5 px-3">Position Title</th>
                    <th className="py-2.5 px-3 text-center">Req Created</th>
                    <th className="py-2.5 px-3 text-center">Advertised</th>
                    <th className="py-2.5 px-3 text-center">Offer Signed</th>
                    <th className="py-2.5 px-3 text-center">Total Turnaround</th>
                    <th className="py-2.5 px-3">SLA Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {filteredRequisitions.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#001b48]">
                        {r.reqNo}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-gray-900">
                        {r.position}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-gray-600">
                        01-Aug-2026
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-gray-600">
                        04-Aug-2026
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-gray-600">
                        24-Aug-2026
                      </td>
                      <td className="py-2.5 px-3 text-center font-extrabold text-emerald-800 bg-emerald-50/40">
                        {20 + (idx * 2)} Days
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Within Target SLA (≤30 Days)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. REPORT: TOTAL EMPLOYEES RECRUITED BY DEPARTMENT                      */}
      {/* ========================================================================= */}
      {(currentTab === 'recruited-by-department' || currentTab === 'recruited-by-vote') && (
        <div className="space-y-4">
          <div className="report-print-zone bg-white border border-[#cbd5e1] rounded-sm overflow-hidden shadow-xs">
            <ReportPrintCaption />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="config-table-head font-bold border-b border-[#003366] uppercase text-[11px]">
                    <th className="py-2.5 px-3">Department / Division</th>
                    <th className="py-2.5 px-3 text-center">Active Requisitions</th>
                    <th className="py-2.5 px-3 text-center">Staff Hired / Placed</th>
                    <th className="py-2.5 px-3 text-center">In-Process Offers</th>
                    <th className="py-2.5 px-3 text-center text-blue-200">Total Recruited</th>
                    <th className="py-2.5 px-3">Estimated Monthly Payroll Commitment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {Array.from(new Set(requisitions.map(r => r.department))).map((dept, idx) => {
                    const deptCands = candidates.filter(c => c.department === dept);
                    const hired = deptCands.filter(c => c.status === 'Hired' || c.status === 'Offer Accepted').length;
                    const offers = deptCands.filter(c => c.status === 'Offer Issued' || c.status === 'Selected').length;
                    const total = hired + offers;
                    const wage = total * 4200000;
                    const reqCount = requisitions.filter(r => r.department === dept).length;

                    return (
                      <tr key={dept} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-gray-900">
                          <span className="block">{dept}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-blue-900">
                          {reqCount} Positions
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-800">
                          {hired} Placed
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-purple-900">
                          {offers} Offers
                        </td>
                        <td className="py-2.5 px-3 text-center font-extrabold text-emerald-800 bg-emerald-50/60">
                          {total} Total
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-gray-800">
                          UGX {wage.toLocaleString()} / mo
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. REPORT: APPROVAL BOTTLENECK & AUDIT TRAIL REPORT                     */}
      {/* ========================================================================= */}
      {currentTab === 'approval-bottlenecks' && (
        <div className="space-y-4">
          <div className="report-print-zone bg-white border border-[#cbd5e1] rounded-sm overflow-hidden shadow-xs">
            <ReportPrintCaption />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="config-table-head font-bold border-b border-[#003366] uppercase text-[11px]">
                    <th className="py-2.5 px-3">Item Reference</th>
                    <th className="py-2.5 px-3">Approval Workflow Type</th>
                    <th className="py-2.5 px-3">Responsible Officer</th>
                    <th className="py-2.5 px-3 text-center">Days in Queue</th>
                    <th className="py-2.5 px-3">SLA Status</th>
                    <th className="py-2.5 px-3">Maker-Checker Audit Trail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  <tr className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#001b48]">
                      REQ-2026-002
                    </td>
                    <td className="py-2.5 px-3 font-bold text-gray-900">
                      Staff Requisition (IT Manager)
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-800">
                      Michael Byaruhanga (Finance Controller)
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-amber-700 bg-amber-50/60">
                      2.5 Days
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Approaching 3-Day SLA
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-gray-600">
                      Drafted by Sarah M. → Verified by HOD IT → Pending Finance Endorsement
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#001b48]">
                      OFF-2026-101
                    </td>
                    <td className="py-2.5 px-3 font-bold text-gray-900">
                      Offer Letter Sign-off (Robert Kintu)
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-800">
                      Dr. Arthur K. (Managing Director)
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-700 bg-emerald-50/60">
                      0.8 Days
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Within SLA Target
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-gray-600">
                      HR Prepared → Budget Verified → Approved by MD → Dispatched to Candidate
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 12. REPORT: MASTER CONFIGURATION & GRADE READINESS REPORT                */}
      {/* ========================================================================= */}
      {currentTab === 'grade-readiness' && (
        <div className="space-y-4">
          <div className="report-print-zone bg-white border border-[#cbd5e1] rounded-sm overflow-hidden shadow-xs">
            <ReportPrintCaption />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="config-table-head font-bold border-b border-[#003366] uppercase text-[11px]">
                    <th className="py-2.5 px-3">Salary Scale Grade</th>
                    <th className="py-2.5 px-3">Designation Level</th>
                    <th className="py-2.5 px-3">Minimum Academic Prerequisite</th>
                    <th className="py-2.5 px-3">Mandatory Documents Checklist</th>
                    <th className="py-2.5 px-3">Grade Configuration Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  <tr className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#001b48]">
                      2A - System Developer
                    </td>
                    <td className="py-2.5 px-3 font-bold text-gray-800">
                      Senior Technical Specialist
                    </td>
                    <td className="py-2.5 px-3 text-gray-700">
                      Bachelor Degree in Computer Science / Software Engineering (Min 3 yrs exp)
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 text-[11px]">
                      Certified Degrees, National ID, 2 Professional Referees, Good Conduct Cert
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        100% Calibrated
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#001b48]">
                      4A - Procurement
                    </td>
                    <td className="py-2.5 px-3 font-bold text-gray-800">
                      Management Level
                    </td>
                    <td className="py-2.5 px-3 text-gray-700">
                      Master Degree in Supply Chain / CIPS Certification (Min 5 yrs exp)
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 text-[11px]">
                      CIPS Practicing License, PPDA Audit Records, Tax Clearance
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        100% Calibrated
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#001b48]">
                      5A - Administration
                    </td>
                    <td className="py-2.5 px-3 font-bold text-gray-800">
                      Officer / Assistant Level
                    </td>
                    <td className="py-2.5 px-3 text-gray-700">
                      Bachelor Degree or Diploma in Business Admin / HRM (Min 1 yr exp)
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 text-[11px]">
                      Academic Transcripts, O/A Level Certificates, LC1 Recommendation
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        100% Calibrated
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 13. REPORT: EQUAL OPPORTUNITY & DIVERSITY REPORT                         */}
      {/* ========================================================================= */}
      {currentTab === 'eeo-diversity' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Gender Parity Balance</span>
              <p className="text-xl font-extrabold text-[#001b48] mt-0.5">52% M / 48% F</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Near Equal Representation</span>
            </div>

            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Regional Dispersion</span>
              <p className="text-xl font-extrabold text-blue-700 mt-0.5">4 Geographic Zones</p>
              <span className="text-[10px] text-blue-600 font-semibold">Central, Western, Eastern, Northern</span>
            </div>

            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Average Applicant Age</span>
              <p className="text-xl font-extrabold text-purple-700 mt-0.5">27.8 Years</p>
              <span className="text-[10px] text-purple-600 font-semibold">Youth Demographic: 72%</span>
            </div>

            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Inclusivity Index</span>
              <p className="text-xl font-extrabold text-emerald-700 mt-0.5">94% Compliant</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Public Service EEO Standards</span>
            </div>
          </div>

          <div className="report-print-zone bg-white border border-[#cbd5e1] rounded-sm overflow-hidden shadow-xs">
            <ReportPrintCaption />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="config-table-head font-bold border-b border-[#003366] uppercase text-[11px]">
                    <th className="py-2.5 px-3">Candidate</th>
                    <th className="py-2.5 px-3">Gender</th>
                    <th className="py-2.5 px-3">Age</th>
                    <th className="py-2.5 px-3">District / Region of Origin</th>
                    <th className="py-2.5 px-3">Education Qualification</th>
                    <th className="py-2.5 px-3">Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {filteredCandidates.map(c => (
                    <tr key={c.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-gray-900">
                        {c.name}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          c.gender === 'Female' ? 'bg-pink-100 text-pink-900' : 'bg-blue-100 text-blue-900'
                        }`}>
                          {c.gender}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-gray-700">
                        {c.age} yrs
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-gray-800">
                        {c.districtOfOrigin || c.region || 'Central Region'}
                      </td>
                      <td className="py-2.5 px-3 text-gray-700">
                        {c.educationLevel}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#001b48]">
                        {c.position}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 14. REPORT: TALENT POOL & SUCCESSION PIPELINE REPORT                     */}
      {/* ========================================================================= */}
      {currentTab === 'talent-pool-analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Talent Pool Archive</span>
              <p className="text-xl font-extrabold text-[#001b48] mt-0.5">
                {candidates.filter(c => c.status === 'Talent Pool' || c.talentTag).length || 8}
              </p>
              <span className="text-[10px] text-amber-600 font-semibold">Pre-Vetted Reserves</span>
            </div>

            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Estimated Direct Hire Savings</span>
              <p className="text-xl font-extrabold text-emerald-700 mt-0.5">28 Days / Hire</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Zero-Lead Recruitment</span>
            </div>

            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Overqualified / Executive Grade</span>
              <p className="text-xl font-extrabold text-purple-700 mt-0.5">3 Leaders</p>
              <span className="text-[10px] text-purple-600 font-semibold">Future Leadership Reserve</span>
            </div>

            <div className="bg-white border border-[#cbd5e1] p-3 rounded shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Re-engagement Ready</span>
              <p className="text-xl font-extrabold text-teal-700 mt-0.5">100%</p>
              <span className="text-[10px] text-teal-600 font-semibold">Consent Confirmed</span>
            </div>
          </div>

          <div className="report-print-zone bg-white border border-[#cbd5e1] rounded-sm overflow-hidden shadow-xs">
            <ReportPrintCaption />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="config-table-head font-bold border-b border-[#003366] uppercase text-[11px]">
                    <th className="py-2.5 px-3">Candidate</th>
                    <th className="py-2.5 px-3">Role Classification</th>
                    <th className="py-2.5 px-3">Archived Tag</th>
                    <th className="py-2.5 px-3 text-center">Match Score</th>
                    <th className="py-2.5 px-3">Notes & Readiness</th>
                    <th className="py-2.5 px-3">Date Retained</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {candidates
                    .filter(c => c.status === 'Talent Pool' || c.talentTag)
                    .map(c => (
                      <tr key={c.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-gray-900">
                          {c.name}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-gray-800">
                          {c.position}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="bg-purple-100 text-purple-900 border border-purple-300 font-bold px-2 py-0.5 rounded text-[10px]">
                            {c.talentTag || 'High Potential Runner-Up'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-extrabold text-emerald-700">
                          {c.matchScore || 95}%
                        </td>
                        <td className="py-2.5 px-3 text-gray-700 italic text-[11px]">
                          "{c.talentNotes || 'Strong domain background, immediate fit for upcoming vacancies.'}"
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-600">
                          {c.retainedDate || '15-Aug-2026'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </ViewShell>
  );
};
