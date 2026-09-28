import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Users, 
  Calendar, 
  Clock, 
  UserMinus, 
  ChevronDown, 
  FileText, 
  CheckSquare, 
  Settings as SettingsIcon,
  BarChart3,
  UserCheck,
  BrainCircuit,
  Sparkles,
  Award,
  Sliders,
  Kanban
} from 'lucide-react';

export type ActiveView = 
  | 'recruitment-command-center'
  | 'candidate-pipeline'
  | 'new-staff-requests'
  | 'approved-requisitions'
  | 'candidate-status'
  | 'pre-shortlist'
  | 'confirmed-shortlists'
  | 'final-interview'
  | 'offer-management'
  | 'document-management'
  | 'candidate-document-status'
  | 'new-staff-approval'
  | 'new-staff-orientation'
  | 'talent-pool'
  | 'selected-candidates'
  | 'job-applicants-report'
  | 'applicant-dashboards'
  | 'vacancy-analysis-report'
  | 'recruitment-funnel-report'
  | 'positions-advertised-report'
  | 'interview-board-report'
  | 'psychometric-analytics-report'
  | 'budget-utilization-report'
  | 'intern-allocation-report'
  | 'offer-onboarding-report'
  | 'time-to-hire-report'
  | 'recruitment-velocity-report'
  | 'recruited-by-vote-report'
  | 'approval-bottlenecks-report'
  | 'grade-readiness-report'
  | 'eeo-diversity-report'
  | 'talent-pool-analytics-report'
  | 'requisition-pipeline-report'
  | 'approval-tasks'
  | 'psychometric-settings'
  | 'system-configuration'
  | 'create-requisition'
  | 'user-profiles'
  | 'candidate-portal';

interface NavbarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView, param?: string) => void;
  pendingTasksCount: number;
  currentRole: 'admin' | 'candidate' | 'panelist';
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  pendingTasksCount,
  currentRole,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState<boolean>(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const reportsDropdownRef = useRef<HTMLDivElement>(null);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (reportsDropdownRef.current && !reportsDropdownRef.current.contains(event.target as Node)) {
        setReportsDropdownOpen(false);
      }
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target as Node)) {
        setSettingsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (view: ActiveView, param?: string) => {
    onNavigate(view, param);
    setDropdownOpen(false);
    setReportsDropdownOpen(false);
    setSettingsDropdownOpen(false);
  };

  return (
    <nav className="w-full bg-[#1e293b] text-white select-none border-b border-[#0f172a] shadow relative z-50">
      <div className="max-w-7xl mx-auto px-2 flex items-center justify-between overflow-x-auto text-xs font-semibold">
        <div className="flex items-center space-x-0.5">
          {/* Modern Command Center */}
          <button 
            onClick={() => handleItemClick('recruitment-command-center')}
            className={`px-3 py-2.5 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeView === 'recruitment-command-center'
                ? 'bg-blue-600 text-white font-bold shadow-inner'
                : 'hover:bg-[#334155] text-cyan-300 font-bold hover:text-white'
            }`}
            title="Recruitment Command Center: KPIs, Action Needs, Conversion Funnels & Live Health"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Command Center</span>
          </button>

          {/* Candidate Pipeline Kanban */}
          <button 
            onClick={() => handleItemClick('candidate-pipeline')}
            className={`px-3 py-2.5 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeView === 'candidate-pipeline'
                ? 'bg-[#0891b2] text-white font-bold shadow-inner'
                : 'hover:bg-[#334155] text-neutral-200 hover:text-white'
            }`}
            title="Interactive ATS Candidate Pipeline with Kanban Board & Drawer Screening"
          >
            <Kanban className="w-3.5 h-3.5 text-cyan-300" />
            <span>Candidate Pipeline</span>
          </button>

          {/* HRMIS Home */}
          <button 
            onClick={() => handleItemClick('applicant-dashboards')}
            className="px-3 py-2.5 hover:bg-[#334155] transition-colors whitespace-nowrap text-neutral-200 hover:text-white"
          >
            HRMIS Home
          </button>

          {/* Staff Management Home */}
          <button 
            onClick={() => handleItemClick('applicant-dashboards')}
            className="px-3.5 py-2.5 hover:bg-[#334155] transition-colors whitespace-nowrap text-neutral-200 hover:text-white"
          >
            Staff Management Home
          </button>

          {/* Staff Requisitions (Active Dropdown) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`px-4 py-2.5 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                dropdownOpen || activeView.startsWith('req') || activeView.includes('shortlist') || activeView.includes('applicant') || activeView.includes('interview') || activeView.includes('approval') || activeView.includes('orientation') || activeView.includes('talent')
                  ? 'bg-[#0891b2] text-white font-bold shadow-inner'
                  : 'hover:bg-[#334155] text-neutral-200'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-cyan-200" />
              <span>Staff Requisitions</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              {pendingTasksCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse ml-0.5">
                  {pendingTasksCount}
                </span>
              )}
            </button>

            {/* Mega Dropdown Menu matching Screenshot 1 */}
            {dropdownOpen && (
              <div className="absolute left-0 top-full mt-0 w-[840px] bg-[#334155] text-neutral-100 shadow-2xl border-t-2 border-[#06b6d4] grid grid-cols-4 p-4 gap-4 text-xs font-normal z-50 rounded-b-md">
                {/* Column 1: Lists */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-neutral-300 border-b border-neutral-600 pb-1 mb-2 text-[11px] tracking-wider uppercase">
                    Lists
                  </h4>
                  <ul className="space-y-1">
                    <li>
                      <button 
                        onClick={() => handleItemClick('recruitment-command-center')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-between ${activeView === 'recruitment-command-center' ? 'bg-blue-600 text-white font-bold' : 'text-amber-300 font-semibold'}`}
                      >
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Command Center</span>
                        </span>
                        <span className="bg-amber-400 text-slate-950 text-[9px] px-1 rounded font-extrabold">NEW</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('candidate-pipeline')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors flex items-center justify-between ${activeView === 'candidate-pipeline' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-100'}`}
                      >
                        <span className="flex items-center gap-1">
                          <Kanban className="w-3 h-3 text-cyan-300" />
                          <span>Candidate Pipeline</span>
                        </span>
                        <span className="bg-[#0284c7] text-white text-[9px] px-1 rounded font-bold">Kanban</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('new-staff-requests')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'new-staff-requests' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        New Staff Requests
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('approved-requisitions')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'approved-requisitions' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        Approved Requisitions
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('candidate-status')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors flex items-center justify-between ${activeView === 'candidate-status' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        <span>Candidate Status View</span>
                        <span className="bg-[#0284c7] text-white text-[9px] px-1 rounded font-bold">Pipeline</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('pre-shortlist')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'pre-shortlist' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        Pre-ShortList Candidates
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('confirmed-shortlists')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'confirmed-shortlists' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        Confirmed Short-Lists
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('final-interview')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'final-interview' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        Final Interview and Selection
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('offer-management')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'offer-management' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        Offer Letter & Acceptance
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('candidate-document-status')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors flex items-center justify-between ${activeView === 'candidate-document-status' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-cyan-200 font-medium'}`}
                      >
                        <span>Candidate Document Status</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('new-staff-approval')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'new-staff-approval' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        New Staff Approval
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('new-staff-orientation')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'new-staff-orientation' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        New Staff Orientation
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('talent-pool')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'talent-pool' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        Hold for future (Talent Pool)
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('candidate-portal')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors flex items-center justify-between ${activeView === 'candidate-portal' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-emerald-300 font-medium'}`}
                      >
                        <span>Candidate Self-Service (Tracker)</span>
                        <span className="bg-emerald-600 text-white text-[9px] px-1 rounded">Portal</span>
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Column 2: Reports */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-neutral-300 border-b border-neutral-600 pb-1 mb-2 text-[11px] tracking-wider uppercase flex items-center justify-between">
                    <span>Reports & Analytics</span>
                    <span className="text-[9px] text-cyan-300 font-bold bg-cyan-950 px-1 rounded">14 Reports</span>
                  </h4>
                  <ul className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
                    <li>
                      <button 
                        onClick={() => handleItemClick('vacancy-analysis-report')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'vacancy-analysis-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        Vacancy Analysis Report
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('recruitment-funnel-report')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'recruitment-funnel-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        Recruitment Funnel Report
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('positions-advertised-report')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'positions-advertised-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        Positions Advertised Report
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('interview-board-report')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'interview-board-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        Interview Board Report (IBR)
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('psychometric-analytics-report')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'psychometric-analytics-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        Aptitude & Proctoring Report
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('budget-utilization-report')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'budget-utilization-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        Recruitment Budget Utilization
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('offer-onboarding-report')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'offer-onboarding-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        Offer & Onboarding Report
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('time-to-hire-report')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'time-to-hire-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        Time-to-Hire Tracking Report
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('recruited-by-vote-report')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'recruited-by-vote-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        Recruited by Vote / MDA
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('approval-bottlenecks-report')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'approval-bottlenecks-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        Approval Bottlenecks & SLA
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('grade-readiness-report')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'grade-readiness-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        Grade Readiness & Salary Bands
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('eeo-diversity-report')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'eeo-diversity-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        Diversity & EEO Report
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('talent-pool-analytics-report')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'talent-pool-analytics-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        Talent Pool & Reserves
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('job-applicants-report')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors ${activeView === 'job-applicants-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        Standard Job Applicants Report
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Column 3: Tasks */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-neutral-300 border-b border-neutral-600 pb-1 mb-2 text-[11px] tracking-wider uppercase flex items-center justify-between">
                    <span>Tasks</span>
                    {pendingTasksCount > 0 && (
                      <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                        {pendingTasksCount} PENDING
                      </span>
                    )}
                  </h4>
                  <ul className="space-y-1">
                    <li>
                      <button 
                        onClick={() => handleItemClick('approval-tasks')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors flex items-center justify-between ${activeView === 'approval-tasks' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        <span>Staff Acquisition Approval Tasks</span>
                        {pendingTasksCount > 0 && (
                          <span className="bg-amber-400 text-neutral-900 text-[10px] px-1.5 rounded font-bold">
                            {pendingTasksCount}
                          </span>
                        )}
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Column 4: Settings */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-neutral-300 border-b border-neutral-600 pb-1 mb-2 text-[11px] tracking-wider uppercase flex items-center justify-between">
                    <span>Settings & Config</span>
                    <button
                      onClick={() => handleItemClick('system-configuration')}
                      className="text-[9px] text-cyan-300 hover:text-white font-bold bg-slate-800 px-1 py-0.5 rounded cursor-pointer"
                    >
                      Open Hub →
                    </button>
                  </h4>
                  <ul className="space-y-1 text-[11px]">
                    <li>
                      <button 
                        onClick={() => handleItemClick('psychometric-settings')}
                        className={`w-full text-left py-1 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors font-medium flex items-center gap-1 ${activeView === 'psychometric-settings' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-amber-300'}`}
                      >
                        <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />
                        <span>Psychometric Assessment Setup</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('system-configuration', 'salary_grades')}
                        className={`w-full text-left py-0.5 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors flex items-center justify-between ${activeView === 'system-configuration' ? 'text-cyan-300' : 'text-neutral-300'}`}
                      >
                        <span>Salary Scale & Pay Grades</span>
                        <span className="text-[9px] bg-slate-800 px-1 rounded text-cyan-200">Scale</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('system-configuration', 'employment_types')}
                        className="w-full text-left py-0.5 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors text-neutral-300"
                      >
                        Employment / Contract Types
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('system-configuration', 'recruitment_types')}
                        className="w-full text-left py-0.5 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors text-neutral-300"
                      >
                        Recruitment Types
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('system-configuration', 'recruitment_types')}
                        className="w-full text-left py-0.5 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors text-neutral-300"
                      >
                        Recruitment Categories
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('system-configuration', 'supporting_docs')}
                        className="w-full text-left py-0.5 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors text-neutral-300"
                      >
                        Supporting Documents Checklist
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('system-configuration', 'education_levels')}
                        className="w-full text-left py-0.5 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors text-neutral-300"
                      >
                        Education Levels
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('system-configuration', 'reference_questions')}
                        className="w-full text-left py-0.5 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors text-neutral-300"
                      >
                        Reference Check Questions
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('system-configuration', 'regions')}
                        className="w-full text-left py-0.5 px-1.5 rounded hover:bg-[#0891b2] hover:text-white transition-colors text-neutral-300"
                      >
                        Nationality, Regions & Districts
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Dedicated Reports & Analytics Dropdown */}
          <div className="relative" ref={reportsDropdownRef}>
            <button
              onClick={() => setReportsDropdownOpen(!reportsDropdownOpen)}
              className={`px-3.5 py-2.5 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                reportsDropdownOpen || activeView.includes('report')
                  ? 'bg-[#0891b2] text-white font-bold shadow-inner'
                  : 'hover:bg-[#334155] text-neutral-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-cyan-200" />
              <span>Reports & Analytics (14)</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${reportsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {reportsDropdownOpen && (
              <div className="absolute left-0 top-full mt-0 w-[580px] bg-[#334155] text-neutral-100 shadow-2xl border-t-2 border-[#06b6d4] grid grid-cols-2 p-4 gap-4 text-xs font-normal z-50 rounded-b-md">
                <div className="space-y-1">
                  <h4 className="font-bold text-neutral-300 border-b border-neutral-600 pb-1 mb-2 text-[11px] tracking-wider uppercase flex items-center justify-between">
                    <span>Recruitment & Assessment</span>
                    <span className="text-[9px] bg-cyan-900 text-cyan-200 px-1 rounded">Part 1</span>
                  </h4>
                  <ul className="space-y-1">
                    <li>
                      <button 
                        onClick={() => handleItemClick('vacancy-analysis-report')}
                        className={`w-full text-left py-1.5 px-2 rounded hover:bg-[#0891b2] hover:text-white transition-colors flex items-center justify-between ${activeView === 'vacancy-analysis-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        <span>1. Vacancy Analysis Report</span>
                        <span className="text-[9px] text-gray-400">Ceilings</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('recruitment-funnel-report')}
                        className={`w-full text-left py-1.5 px-2 rounded hover:bg-[#0891b2] hover:text-white transition-colors flex items-center justify-between ${activeView === 'recruitment-funnel-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        <span>2. Recruitment Funnel Report</span>
                        <span className="text-[9px] text-gray-400">Pipeline</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('positions-advertised-report')}
                        className={`w-full text-left py-1.5 px-2 rounded hover:bg-[#0891b2] hover:text-white transition-colors flex items-center justify-between ${activeView === 'positions-advertised-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        <span>3. Positions Advertised Report</span>
                        <span className="text-[9px] text-gray-400">Requisitions</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('interview-board-report')}
                        className={`w-full text-left py-1.5 px-2 rounded hover:bg-[#0891b2] hover:text-white transition-colors flex items-center justify-between ${activeView === 'interview-board-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        <span>4. Interview Board Report (IBR)</span>
                        <span className="text-[9px] text-gray-400">Oral Marks</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('psychometric-analytics-report')}
                        className={`w-full text-left py-1.5 px-2 rounded hover:bg-[#0891b2] hover:text-white transition-colors flex items-center justify-between ${activeView === 'psychometric-analytics-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        <span>5. Aptitude & Proctoring Report</span>
                        <span className="text-[9px] text-gray-400">Tests</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('job-applicants-report')}
                        className={`w-full text-left py-1.5 px-2 rounded hover:bg-[#0891b2] hover:text-white transition-colors flex items-center justify-between ${activeView === 'job-applicants-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        <span>6. Job Applicants Master Report</span>
                        <span className="text-[9px] text-gray-400">Roster</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('talent-pool-analytics-report')}
                        className={`w-full text-left py-1.5 px-2 rounded hover:bg-[#0891b2] hover:text-white transition-colors flex items-center justify-between ${activeView === 'talent-pool-analytics-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        <span>7. Talent Pool & Reserves</span>
                        <span className="text-[9px] text-gray-400">Reserves</span>
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-neutral-300 border-b border-neutral-600 pb-1 mb-2 text-[11px] tracking-wider uppercase flex items-center justify-between">
                    <span>Operations & Compliance</span>
                    <span className="text-[9px] bg-cyan-900 text-cyan-200 px-1 rounded">Part 2</span>
                  </h4>
                  <ul className="space-y-1">
                    <li>
                      <button 
                        onClick={() => handleItemClick('budget-utilization-report')}
                        className={`w-full text-left py-1.5 px-2 rounded hover:bg-[#0891b2] hover:text-white transition-colors flex items-center justify-between ${activeView === 'budget-utilization-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        <span>8. Recruitment Budget Spend</span>
                        <span className="text-[9px] text-gray-400">Financials</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('offer-onboarding-report')}
                        className={`w-full text-left py-1.5 px-2 rounded hover:bg-[#0891b2] hover:text-white transition-colors flex items-center justify-between ${activeView === 'offer-onboarding-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        <span>9. Offer & Onboarding Report</span>
                        <span className="text-[9px] text-gray-400">Staff & Intern</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('time-to-hire-report')}
                        className={`w-full text-left py-1.5 px-2 rounded hover:bg-[#0891b2] hover:text-white transition-colors flex items-center justify-between ${activeView === 'time-to-hire-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        <span>11. Time-to-Hire Tracking Report</span>
                        <span className="text-[9px] text-gray-400">SLA Days</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('recruited-by-vote-report')}
                        className={`w-full text-left py-1.5 px-2 rounded hover:bg-[#0891b2] hover:text-white transition-colors flex items-center justify-between ${activeView === 'recruited-by-vote-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        <span>12. Recruited by Vote / MDA</span>
                        <span className="text-[9px] text-gray-400">Votes</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('approval-bottlenecks-report')}
                        className={`w-full text-left py-1.5 px-2 rounded hover:bg-[#0891b2] hover:text-white transition-colors flex items-center justify-between ${activeView === 'approval-bottlenecks-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        <span>13. Approval Bottlenecks & SLA</span>
                        <span className="text-[9px] text-gray-400">Queues</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleItemClick('grade-readiness-report')}
                        className={`w-full text-left py-1.5 px-2 rounded hover:bg-[#0891b2] hover:text-white transition-colors flex items-center justify-between ${activeView === 'grade-readiness-report' ? 'bg-[#0891b2]/40 font-semibold text-cyan-300' : 'text-neutral-200'}`}
                      >
                        <span>14. Grade Readiness & Scales</span>
                        <span className="text-[9px] text-gray-400">Criteria</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* System Configuration Button */}
          <button 
            onClick={() => handleItemClick('system-configuration')}
            className={`px-3.5 py-2.5 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeView === 'system-configuration' 
                ? 'bg-[#0891b2] text-white font-bold shadow-inner' 
                : 'hover:bg-[#334155] text-neutral-200 hover:text-white'
            }`}
            title="Configure Salary Grades, Employment Types, Document Checklists, Reference Questions and Regional Units"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-200" />
            <span>System Configuration</span>
          </button>

          <button className="px-3.5 py-2.5 hover:bg-[#334155] transition-colors whitespace-nowrap text-neutral-200 hover:text-white flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>Staff List</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          <button className="px-3.5 py-2.5 hover:bg-[#334155] transition-colors whitespace-nowrap text-neutral-200 hover:text-white flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Leave Management</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          <button className="px-3.5 py-2.5 hover:bg-[#334155] transition-colors whitespace-nowrap text-neutral-200 hover:text-white flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Time Sheets</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          <button className="px-3.5 py-2.5 hover:bg-[#334155] transition-colors whitespace-nowrap text-neutral-200 hover:text-white flex items-center gap-1">
            <UserMinus className="w-3.5 h-3.5" />
            <span>Staff Exit</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Right shortcut pill */}
        <div className="flex items-center gap-2 pl-2">
          <button
            onClick={() => handleItemClick('candidate-portal')}
            className="px-2.5 py-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all border border-cyan-400/30"
            title="Switch to Applicant View (Live Application Tracker, Assessment & Digital Sign Offer)"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Applicant Portal</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
