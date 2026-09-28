import React, { useState } from 'react';
import { Users, ChevronRight, X, GitBranch, Network, Award } from 'lucide-react';
import { ActiveView } from './Navbar';

interface BreadcrumbsProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ activeView, onNavigate }) => {
  const [showReportingModal, setShowReportingModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('-Select Employee-');

  // Breadcrumb path configuration
  const getBreadcrumbTrail = () => {
    switch (activeView) {
      case 'recruitment-command-center':
        return [
          { step: '1', name: 'SmartHR' },
          { step: '2', name: 'Recruitment' },
          { step: '3', name: 'Overview', active: true },
        ];
      case 'candidate-pipeline':
        return [
          { step: '1', name: 'SmartHR' },
          { step: '2', name: 'Recruitment' },
          { step: '3', name: 'Candidate Pipeline', active: true },
        ];
      case 'create-requisition':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Human Resource Management' },
          { step: '3', name: 'Staff Management' },
          { step: '4', name: 'Staff Requisitions' },
          { step: '5', name: 'Staff Requests', link: 'new-staff-requests' as ActiveView },
          { step: '6', name: 'New Staff Requisitions', active: true },
        ];
      case 'applicant-dashboards':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Human Resource Management' },
          { step: '3', name: 'Applicant Dashboards', active: true },
        ];
      case 'job-applicants-report':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Human Resource Management' },
          { step: '3', name: 'Staff Requisitions' },
          { step: '4', name: 'Job Applicants Report', active: true },
        ];
      case 'requisition-pipeline-report':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Reports & Analytics' },
          { step: '3', name: 'Requisition Pipeline & SLA Performance', active: true },
        ];
      case 'recruitment-funnel-report':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Reports & Analytics' },
          { step: '3', name: 'Recruitment Funnel & Candidate Conversion', active: true },
        ];
      case 'interview-board-report':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Reports & Analytics' },
          { step: '3', name: 'Interview Board Evaluation Report (IBR)', active: true },
        ];
      case 'offer-onboarding-report':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Reports & Analytics' },
          { step: '3', name: 'Offer Letter Distribution & Onboarding Report', active: true },
        ];
      case 'psychometric-analytics-report':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Reports & Analytics' },
          { step: '3', name: 'Psychometric Assessment & Competency Analytics', active: true },
        ];
      case 'eeo-diversity-report':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Reports & Analytics' },
          { step: '3', name: 'Equal Opportunity & Diversity Report (EEO)', active: true },
        ];
      case 'talent-pool-analytics-report':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Reports & Analytics' },
          { step: '3', name: 'Talent Pool & Succession Pipeline Analytics', active: true },
        ];
      case 'pre-shortlist':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Human Resource Management' },
          { step: '3', name: 'Staff Requisitions' },
          { step: '4', name: 'Pre-ShortList Candidates', active: true },
        ];
      case 'confirmed-shortlists':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Human Resource Management' },
          { step: '3', name: 'Staff Requisitions' },
          { step: '4', name: 'Confirmed Short-Lists', active: true },
        ];
      case 'final-interview':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Human Resource Management' },
          { step: '3', name: 'Staff Requisitions' },
          { step: '4', name: 'Final Interview and Selection', active: true },
        ];
      case 'offer-management':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Human Resource Management' },
          { step: '3', name: 'Staff Requisitions' },
          { step: '4', name: 'Offer Letter Issuance & Acceptance', active: true },
        ];
      case 'document-management':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Human Resource Management' },
          { step: '3', name: 'Configure' },
          { step: '4', name: 'Document & Template Hub', active: true },
        ];
      case 'candidate-document-status':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Human Resource Management' },
          { step: '3', name: 'Staff Requisitions' },
          { step: '4', name: 'Candidate Document Status', active: true },
        ];
      case 'new-staff-approval':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Human Resource Management' },
          { step: '3', name: 'Staff Requisitions' },
          { step: '4', name: 'New Staff Approval', active: true },
        ];
      case 'new-staff-orientation':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Human Resource Management' },
          { step: '3', name: 'Staff Requisitions' },
          { step: '4', name: 'New Staff Orientation & Onboarding', active: true },
        ];
      case 'talent-pool':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Human Resource Management' },
          { step: '3', name: 'Staff Requisitions' },
          { step: '4', name: 'Hold for Future Consideration (Talent Pool)', active: true },
        ];
      case 'approval-tasks':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Human Resource Management' },
          { step: '3', name: 'Workflow Tasks' },
          { step: '4', name: 'Staff Acquisition Approval Tasks', active: true },
        ];
      case 'psychometric-settings':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Settings' },
          { step: '3', name: 'Staff Requisitions' },
          { step: '4', name: 'Psychometric Assessment Setup & Question Bank', active: true },
        ];
      case 'user-profiles':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Human Resource Management' },
          { step: '3', name: 'Security' },
          { step: '4', name: 'Security Management', active: true },
        ];
      case 'candidate-portal':
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Candidate Self-Service' },
          { step: '3', name: 'Application Progress & Assessment Portal', active: true },
        ];
      default:
        return [
          { step: '1', name: 'ProMISe' },
          { step: '2', name: 'Human Resource Management' },
          { step: '3', name: 'Staff Management' },
          { step: '4', name: 'Staff Requisitions' },
          { step: '5', name: 'New Staff Requests', active: true },
        ];
    }
  };

  const breadcrumbs = getBreadcrumbTrail();

  return (
    <div className="w-full bg-[#f1f5f9] border-b border-[#cbd5e1] py-2 px-4 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs">
        
        {/* Styled Numbered Breadcrumb Chevrons */}
        <div className="flex flex-wrap items-center gap-1">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center">
              {crumb.active ? (
                <div className="flex items-center bg-[#0284c7] text-white px-2.5 py-1 rounded-sm shadow-xs font-semibold">
                  <span className="bg-white text-[#0284c7] rounded-full w-4 h-4 inline-flex items-center justify-center text-[10px] mr-1.5 font-bold">
                    {crumb.step}
                  </span>
                  <span>{crumb.name}</span>
                </div>
              ) : (
                <button
                  onClick={() => crumb.link && onNavigate(crumb.link)}
                  className={`flex items-center bg-white border border-[#cbd5e1] text-[#334155] px-2 py-0.5 rounded-sm hover:border-[#94a3b8] transition-colors ${crumb.link ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'}`}
                >
                  <span className="bg-[#e2e8f0] text-[#475569] rounded-full w-4 h-4 inline-flex items-center justify-center text-[10px] mr-1.5 font-bold">
                    {crumb.step}
                  </span>
                  <span>{crumb.name}</span>
                </button>
              )}
              {idx < breadcrumbs.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8] mx-0.5 shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Current Employee Bar & Reporting Lines Button */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-white border border-[#cbd5e1] rounded px-2 py-1 shadow-2xs">
            <span className="text-[#64748b] font-medium whitespace-nowrap">Current Employee:</span>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="bg-transparent text-[#1e293b] font-semibold focus:outline-none cursor-pointer pr-1 text-xs"
            >
              <option>-Select Employee-</option>
              <option>Admin (System Administrator)</option>
              <option>Sarah Namubiru (HR Officer)</option>
              <option>David Byamukama (IT Manager)</option>
              <option>Dr. Arthur K. (Managing Director)</option>
              <option>Juliet Atuhaire (HR Director)</option>
            </select>
          </div>

          <button
            onClick={() => setShowReportingModal(true)}
            className="bg-[#f8fafc] hover:bg-[#e2e8f0] border border-[#94a3b8] text-[#0284c7] font-semibold px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-2xs"
          >
            <Users className="w-3.5 h-3.5 text-[#0284c7]" />
            <span>View Your Immediate Reporting Lines</span>
          </button>
        </div>
      </div>

      {/* Immediate Reporting Lines Modal */}
      {showReportingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden border border-[#94a3b8]">
            <div className="bg-[#1e293b] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm">Immediate Reporting Hierarchy</h3>
              </div>
              <button 
                onClick={() => setShowReportingModal(false)}
                className="text-neutral-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 text-xs text-[#334155]">
              <div className="bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded">
                <span className="text-gray-500 font-medium">Supervisor (Line Manager):</span>
                <p className="font-bold text-sm text-[#0f4c81] mt-0.5">Dr. Arthur K. — Managing Director</p>
                <p className="text-[11px] text-gray-500">Executive Office • DataCare Uganda Limited</p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-[#1e293b] block">Direct Reporting Staff (Subordinates):</span>
                <div className="grid grid-cols-1 gap-2">
                  <div className="p-2.5 bg-cyan-50/60 border border-cyan-200 rounded flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#0e7490]">Sarah Namubiru</p>
                      <p className="text-[11px] text-gray-600">Senior Human Resource Officer</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Active</span>
                  </div>
                  <div className="p-2.5 bg-cyan-50/60 border border-cyan-200 rounded flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#0e7490]">Paul Okello</p>
                      <p className="text-[11px] text-gray-600">IT Systems & Infrastructure Lead</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#f1f5f9] px-4 py-2.5 border-t border-[#cbd5e1] flex justify-end">
              <button
                onClick={() => setShowReportingModal(false)}
                className="px-4 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
