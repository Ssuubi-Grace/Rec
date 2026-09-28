import React, { useState } from 'react';
import {
  Users,
  BrainCircuit,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Archive,
  Eye,
  Ban,
  Check,
} from 'lucide-react';
import { Candidate, Requisition, PsychometricTest } from '../../types';
import { ActiveView } from '../layout/Navbar';
import { DeclineCandidateModal } from '../modals/DeclineCandidateModal';
import { CandidateDetailModal } from '../modals/CandidateDetailModal';
import { useToast } from '../../context/ToastContext';
import {
  ViewShell,
  PageHeader,
  MetricGrid,
  FilterPanel,
  FilterField,
  DataTableShell,
  NotificationBanner,
} from '../ui/RecruitmentUI';
import { DashboardKpiCard } from '../ui/DashboardKpiCard';
import { SearchableSelect } from '../ui/SearchableSelect';

interface PreShortlistCandidatesViewProps {
  candidates: Candidate[];
  requisitions: Requisition[];
  psychometricTests: PsychometricTest[];
  onNavigate: (view: ActiveView, param?: string) => void;
  onTriggerTest: (candidateIds: string[]) => void;
  onAdvanceToInterview: (candidateId: string) => void;
  onTransferToTalentPool: (candidate: Candidate) => void;
  onTakeTestAsCandidate: (candidate: Candidate) => void;
  onDeclineCandidate: (candidateId: string, reason: string, message: string, sendEmail: boolean) => void;
  onShortlistCandidate?: (candidateId: string) => void;
}

export const PreShortlistCandidatesView: React.FC<PreShortlistCandidatesViewProps> = ({
  candidates,
  requisitions,
  psychometricTests,
  onNavigate,
  onTriggerTest,
  onAdvanceToInterview,
  onTransferToTalentPool,
  onTakeTestAsCandidate,
  onDeclineCandidate,
  onShortlistCandidate,
}) => {
  const [selectedPosition, setSelectedPosition] = useState<string>('-select-');
  const [filterAge, setFilterAge] = useState<string>('');
  const [filterExperience, setFilterExperience] = useState<string>('');
  const [filterEducation, setFilterEducation] = useState<string>('-select-');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const { showSuccess, showWarning } = useToast();

  const [candidateToDecline, setCandidateToDecline] = useState<Candidate | null>(null);
  const [candidateToView, setCandidateToView] = useState<Candidate | null>(null);

  const filteredCandidates = candidates.filter(c => {
    if (selectedPosition !== '-select-' && c.position !== selectedPosition) return false;
    if (filterAge && c.age > Number(filterAge)) return false;
    if (filterExperience && c.yearsOfExperience < Number(filterExperience)) return false;
    if (filterEducation !== '-select-' && !c.educationLevel.toLowerCase().includes(filterEducation.toLowerCase())) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match =
        c.name.toLowerCase().includes(term) ||
        c.position.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.employmentHistory.toLowerCase().includes(term) ||
        (c.phone && c.phone.includes(term));
      if (!match) return false;
    }
    return true;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCandidateIds(filteredCandidates.map(c => c.id));
    } else {
      setSelectedCandidateIds([]);
    }
  };

  const handleToggleCandidate = (id: string) => {
    if (selectedCandidateIds.includes(id)) {
      setSelectedCandidateIds(selectedCandidateIds.filter(cId => cId !== id));
    } else {
      setSelectedCandidateIds([...selectedCandidateIds, id]);
    }
  };

  const handleBulkTriggerTest = () => {
    if (selectedCandidateIds.length === 0) {
      showWarning('Please check at least one applicant from the table.', 'No Candidates Selected');
      return;
    }
    onTriggerTest(selectedCandidateIds);
    const count = selectedCandidateIds.length;
    showSuccess(`Psychometric assessment dispatched to ${count} candidate(s) via email and candidate portal.`, 'Assessment Invitations Dispatched');
    setSelectedCandidateIds([]);
  };

  const handleTriggerAllForPosition = () => {
    const targetCandidates = selectedPosition === '-select-'
      ? filteredCandidates
      : filteredCandidates.filter(c => c.position === selectedPosition);

    if (targetCandidates.length === 0) {
      showWarning('No candidates found matching the selected position criteria.', 'No Candidates Found');
      return;
    }
    const ids = targetCandidates.map(c => c.id);
    onTriggerTest(ids);
    showSuccess(`Dispatched Psychometric Tests to all ${ids.length} applicant(s) for ${selectedPosition === '-select-' ? 'all roles' : selectedPosition}.`, 'Assessments Dispatched');
  };

  const handleClearFilters = () => {
    setSelectedPosition('-select-');
    setFilterAge('');
    setFilterExperience('');
    setFilterEducation('-select-');
    setSearchTerm('');
    setSelectedCandidateIds([]);
  };

  const handleExportExcel = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      'No.,Applicants Name,Position,Employment history,Email Address,Age,Education Level,Years of Experience,Mobile Phone Number,Status,Psychometric Score\n' +
      filteredCandidates.map((c, i) =>
        `${i + 1},"${c.name}","${c.position}","${c.employmentHistory.replace(/"/g, '""')}","${c.email}",${c.age},"${c.educationLevel}",${c.yearsOfExperience},"+${c.countryCode} ${c.phone}","${c.status}","${c.testScore || c.testStatus || 'Not Sent'}"`
      ).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PreShortList_Candidates_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPdf = () => {
    window.print();
  };

  const positionOptions = Array.from(new Set(requisitions.map(r => r.position)));

  const positionSelectOptions = [
    { value: '-select-', label: 'All positions' },
    ...positionOptions.map(pos => ({
      value: pos,
      label: pos,
      searchText: pos,
    })),
  ];

  const educationSelectOptions = [
    { value: '-select-', label: 'All levels' },
    { value: 'Certificate', label: 'Certificate' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'Degree', label: 'Degree' },
    { value: 'Bachelor', label: 'Bachelor Degree' },
    { value: 'Masters', label: 'Masters' },
    { value: 'PhD', label: 'Doctorate / PhD' },
  ];

  const passedCount = filteredCandidates.filter(c => c.testStatus === 'Passed').length;
  const pendingTestCount = filteredCandidates.filter(c => c.status === 'Assessment Sent' || c.testStatus === 'Pending').length;
  const failedCount = filteredCandidates.filter(c => c.testStatus === 'Failed').length;

  return (
    <ViewShell>
      <PageHeader
        badge="Step 2 • Screening & Assessments"
        badgeColor="bg-cyan-50 text-cyan-700 border-cyan-200"
        title="Pre-Shortlist & Psychometric Tests"
        subtitle="Comprehensive applicant intake. Trigger assessments, shortlist, archive to talent pool, or decline applicants."
        actions={
          <>
            <button type="button" onClick={handleTriggerAllForPosition} className="btn btn-primary btn-lg">
              <BrainCircuit className="w-4 h-4" />
              Trigger Test (All in View)
            </button>
            <button type="button" onClick={() => onNavigate('psychometric-settings')} className="btn btn-secondary">
              Test Bank Settings
            </button>
          </>
        }
      />

      {notificationMsg && (
        <NotificationBanner message={notificationMsg} onDismiss={() => setNotificationMsg(null)} />
      )}

      <MetricGrid cols="grid-cols-2 sm:grid-cols-4">
        <DashboardKpiCard
          title="In View"
          value={filteredCandidates.length}
          icon={Users}
          theme="blue"
          footer={<span>Applicants matching current filters</span>}
        />
        <DashboardKpiCard
          title="Tests Pending"
          value={pendingTestCount}
          icon={Clock}
          theme="amber"
          footer={<span>Awaiting psychometric completion</span>}
        />
        <DashboardKpiCard
          title="Passed Assessment"
          value={passedCount}
          icon={CheckCircle2}
          theme="green"
          footer={<span className="text-emerald-600 font-semibold">Cleared cut-off threshold</span>}
        />
        <DashboardKpiCard
          title="Failed / Declined"
          value={failedCount}
          icon={XCircle}
          theme="rose"
          footer={<span>Below cut-off or rejected</span>}
        />
      </MetricGrid>

      <FilterPanel onReset={handleClearFilters}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <FilterField label="Position">
            <SearchableSelect
              value={selectedPosition}
              onChange={setSelectedPosition}
              options={positionSelectOptions}
              placeholder="All positions"
              searchPlaceholder="Search position…"
            />
          </FilterField>
          <FilterField label="Max Age">
            <input
              type="number"
              placeholder="e.g. 35"
              value={filterAge}
              onChange={(e) => setFilterAge(e.target.value)}
            />
          </FilterField>
          <FilterField label="Min Experience (years)">
            <input
              type="number"
              placeholder="e.g. 3"
              value={filterExperience}
              onChange={(e) => setFilterExperience(e.target.value)}
            />
          </FilterField>
          <FilterField label="Education Level">
            <SearchableSelect
              value={filterEducation}
              onChange={setFilterEducation}
              options={educationSelectOptions}
              placeholder="All levels"
              searchPlaceholder="Search education level…"
            />
          </FilterField>
          <FilterField label="Search" className="md:col-span-2">
            <input
              type="text"
              placeholder="Name, email, employer, position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FilterField>
        </div>
      </FilterPanel>

      <DataTableShell
        title="Applicant Screening Directory"
        subtitle={`Showing ${filteredCandidates.length} of ${candidates.length} total applicants`}
        onExport={handleExportExcel}
        exportLabel="Export to Excel"
        actions={
          <>
            <button type="button" onClick={handleExportPdf} className="btn btn-secondary">
              Print / PDF
            </button>
            {selectedCandidateIds.length > 0 && (
              <button type="button" onClick={handleBulkTriggerTest} className="btn btn-primary">
                <BrainCircuit className="w-4 h-4" />
                Test Selected ({selectedCandidateIds.length})
              </button>
            )}
          </>
        }
      >
        <table className="standard-table">
          <thead>
            <tr>
              <th className="w-7 text-center">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedCandidateIds.length === filteredCandidates.length && filteredCandidates.length > 0}
                  className="rounded cursor-pointer"
                />
              </th>
              <th className="w-8 text-center">#</th>
              <th>Applicant</th>
              <th>Position</th>
              <th>Employment History</th>
              <th>Email</th>
              <th className="text-center">Age</th>
              <th>Education</th>
              <th className="text-center">Exp.</th>
              <th>Phone</th>
              <th className="text-center">Psychometrics</th>
              <th className="text-center">Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0]">
            {filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-8 text-center text-gray-500 font-medium">
                  No applicants matching current search and filter criteria.
                </td>
              </tr>
            ) : (
              filteredCandidates.map((c, idx) => {
                const isSelected = selectedCandidateIds.includes(c.id);
                const isFailed = c.testStatus === 'Failed';
                const isPassed = c.testStatus === 'Passed';
                const isPendingTest = c.status === 'Assessment Sent' || c.testStatus === 'Pending';

                const matchingReq = requisitions.find(r => r.id === c.requisitionId || r.position.toLowerCase() === c.position.toLowerCase());
                const isTestApplicable = matchingReq?.requirePsychometricTest !== false || !!c.testStatus || !!c.testScore;

                return (
                  <tr
                    key={c.id}
                    className={`hover:bg-[#f0f9ff]/40 transition-colors ${idx % 2 === 1 ? 'bg-[#fcfcfd]' : 'bg-white'} ${c.status === 'Rejected' ? 'opacity-70 bg-rose-50/20' : ''}`}
                  >
                    <td className="py-2.5 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleCandidate(c.id)}
                        className="rounded cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 px-2 text-center text-gray-500 font-medium">
                      {idx + 1}.
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => setCandidateToView(c)}
                        className="font-bold text-[#0f4c81] hover:underline text-left cursor-pointer block"
                      >
                        {c.name}
                      </button>
                      <span className="text-[10px] text-gray-400 font-mono">
                        NIN: {c.nationalId || 'CM90023412X98A'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-800 font-medium">
                      {c.position}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 text-[11px]">
                      {c.employmentHistory || 'No previous recorded history'}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 font-mono text-[11px]">
                      {c.email}
                    </td>
                    <td className="py-2.5 px-2 text-center text-gray-700 font-medium">
                      {c.age}
                    </td>
                    <td className="py-2.5 px-3 text-gray-700">
                      {c.educationLevel}
                    </td>
                    <td className="py-2.5 px-2 text-center text-gray-700 font-medium">
                      {c.yearsOfExperience}
                    </td>
                    <td className="py-2.5 px-3 text-gray-700 font-mono text-[11px]">
                      {c.countryCode ? `+${c.countryCode} ` : ''}{c.phone}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {!isTestApplicable ? (
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium text-[10px] border border-slate-200 inline-block">
                          N/A (Not Required)
                        </span>
                      ) : isPassed ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Passed ({c.testScore}%)
                          </span>
                          <span className="text-[9px] text-gray-400 mt-0.5">{c.testCompletedAt || 'Completed'}</span>
                        </div>
                      ) : isFailed ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold text-[10px] flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Failed ({c.testScore}%)
                          </span>
                          <span className="text-[9px] text-rose-500 font-medium">Below Cut-off</span>
                        </div>
                      ) : isPendingTest ? (
                        <div className="inline-flex flex-col items-center gap-1">
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium text-[10px] flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-amber-600" />
                            Sent / Pending
                          </span>
                          <button
                            type="button"
                            onClick={() => onTakeTestAsCandidate(c)}
                            className="text-[9px] text-[#0284c7] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                            title="Open candidate assessment simulator"
                          >
                            <Play className="w-2.5 h-2.5" /> Simulate Test
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onTriggerTest([c.id])}
                          className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-[10px] font-bold flex items-center gap-1 mx-auto cursor-pointer"
                          title="Trigger psychometric test invitation for this applicant"
                        >
                          <BrainCircuit className="w-2.5 h-2.5 text-amber-600" />
                          <span>Trigger Test</span>
                        </button>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'Selected' || c.status === 'Hired' ? 'bg-emerald-100 text-emerald-800' :
                        c.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                        c.status === 'Pre-Shortlisted' || c.status === 'ShortListed' ? 'bg-cyan-100 text-cyan-800' :
                        c.status === 'Interview Scheduled' ? 'bg-blue-100 text-blue-800' :
                        c.status === 'Talent Pool' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex flex-wrap items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCandidateToView(c)}
                          className="text-[#0284c7] hover:underline font-semibold text-xs flex items-center gap-0.5 cursor-pointer px-1 py-0.5"
                          title="View Full Candidate Profile"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Details</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (onShortlistCandidate) {
                              onShortlistCandidate(c.id);
                            } else {
                              onAdvanceToInterview(c.id);
                            }
                            onNavigate('confirmed-shortlists', c.requisitionId);
                          }}
                          disabled={c.status === 'Rejected' || c.status === 'Pre-Shortlisted'}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors ${
                            c.status === 'Rejected'
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : c.status === 'Pre-Shortlisted'
                              ? 'bg-cyan-50 text-cyan-700 border border-cyan-300'
                              : 'bg-[#16a34a] hover:bg-[#15803d] text-white cursor-pointer'
                          }`}
                          title="Shortlist applicant and move to Confirmed Shortlists"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{c.status === 'Pre-Shortlisted' ? 'Shortlisted ✓' : 'Shortlist'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onTransferToTalentPool(c)}
                          className="px-2 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded text-[11px] font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
                          title="Hold for future consideration in Talent Pool"
                        >
                          <Archive className="w-3 h-3 text-purple-600" />
                          <span>Talent Pool</span>
                        </button>

                        {c.status !== 'Rejected' && (
                          <button
                            type="button"
                            onClick={() => setCandidateToDecline(c)}
                            className="px-2 py-0.5 bg-[#b91c1c] hover:bg-[#991b1b] text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                            title="Decline applicant with optional message/email notification"
                          >
                            <Ban className="w-3 h-3" />
                            <span>Decline</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </DataTableShell>

      {candidateToDecline && (
        <DeclineCandidateModal
          candidate={candidateToDecline}
          onClose={() => setCandidateToDecline(null)}
          onConfirmDecline={(candidateId, reason, message, sendEmail) => {
            onDeclineCandidate(candidateId, reason, message, sendEmail);
            showSuccess(`Candidate ${candidateToDecline.name} declined. ${sendEmail ? 'Rejection notification recorded & emailed to applicant.' : ''}`, 'Candidate Declined');
          }}
        />
      )}

      {candidateToView && (
        <CandidateDetailModal
          candidate={candidateToView}
          onClose={() => setCandidateToView(null)}
          onShortlist={onShortlistCandidate}
          onAdvanceToInterview={(id) => {
            onAdvanceToInterview(id);
            onNavigate('confirmed-shortlists');
          }}
          onDecline={(c) => {
            setCandidateToDecline(c);
          }}
        />
      )}
    </ViewShell>
  );
};
