import React, { useState } from 'react';
import { 
  Award, 
  FileText, 
  Send, 
  Archive, 
  CheckCircle2, 
  UserCheck, 
  Star, 
  Sliders, 
  Printer, 
  ChevronRight,
  Sparkles,
  ChevronLeft,
  Plus,
  Trash2,
  Save,
  Paperclip,
  Upload,
  ArrowRight
} from 'lucide-react';
import { Candidate, Requisition } from '../../types';
import { ActiveView } from '../layout/Navbar';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import {
  ViewShell, PageHeader, MetricGrid, DataTableShell, NotificationBanner,
} from '../ui/RecruitmentUI';
import { DashboardKpiCard } from '../ui/DashboardKpiCard';

interface FinalInterviewSelectionViewProps {
  candidates: Candidate[];
  requisitions: Requisition[];
  targetRequisitionId?: string;
  onNavigate: (view: ActiveView, param?: string) => void;
  onSelectCandidateForOffer: (candidate: Candidate) => void;
  onTransferToTalentPool: (candidate: Candidate) => void;
  onUpdateCandidateScore: (candidateId: string, interviewScore: number) => void;
  onSaveInterviewReport?: (
    reqId: string,
    panelists: { name: string; title: string; remarks: string; fileName?: string }[],
    interviewees: { candidateId: string; interviewDate: string; recommendation: string; selected: boolean }[]
  ) => void;
}

interface PanelistRow {
  name: string;
  title: string;
  remarks: string;
  fileName?: string;
}

interface IntervieweeRow {
  candidateId: string;
  interviewDate: string;
  recommendation: 'Recommend for Appointment' | 'Hold For Future Considerations' | 'Backup Candidate' | 'Not Recommended';
  selected: boolean;
}

export const FinalInterviewSelectionView: React.FC<FinalInterviewSelectionViewProps> = ({
  candidates,
  requisitions,
  targetRequisitionId,
  onNavigate,
  onSelectCandidateForOffer,
  onTransferToTalentPool,
  onUpdateCandidateScore,
  onSaveInterviewReport,
}) => {
  const [selectedReqId, setSelectedReqId] = useState<string>(() => {
    return targetRequisitionId || requisitions[0]?.id || 'req-1';
  });
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Sync when targetRequisitionId prop changes
  React.useEffect(() => {
    if (targetRequisitionId) {
      setSelectedReqId(targetRequisitionId);
    }
  }, [targetRequisitionId]);

  // Active requisition
  const activeReq = requisitions.find(r => r.id === selectedReqId) || requisitions[0];
  const reqCandidates = candidates.filter(c => c.requisitionId === activeReq.id);

  const getHolisticScore = (candidate: Candidate) => {
    const interviewScore = candidate.interviewScore ?? 0;
    const testScore = candidate.testScore ?? 0;
    const criteriaScore = candidate.matchScore ?? 0;
    return Math.round(criteriaScore * 0.35 + testScore * 0.25 + interviewScore * 0.4);
  };

  const rankedCandidates = [...reqCandidates].sort((a, b) => getHolisticScore(b) - getHolisticScore(a));

  // Panelists state matching Screenshot 3
  const [panelists, setPanelists] = useState<PanelistRow[]>([
    {
      name: 'Dr. Arthur Sempala',
      title: 'Director of Human Capital & Operations',
      remarks: 'Strong candidate evaluation rubric. High candidate competency demonstrated in systems architecture.',
      fileName: 'panel_rubric_arthur.pdf',
    },
    {
      name: 'Grace Namukasa',
      title: 'Lead Systems Architect / Technical Lead',
      remarks: 'Practical live-coding test passed with 88%. Good knowledge of microservices and security protocols.',
      fileName: 'technical_evaluation_notes.docx',
    },
    {
      name: 'Patrick Ochola',
      title: 'Senior HR Specialist',
      remarks: 'Candidate aligns well with organizational values and culture. Communication was articulated well.',
    }
  ]);

  // Interviewees state matching Screenshot 3
  const [interviewees, setInterviewees] = useState<IntervieweeRow[]>(() => {
    return reqCandidates.map((c, i) => ({
      candidateId: c.id,
      interviewDate: c.interviewDate || '2026-08-28',
      recommendation: (c.interviewRecommendation as any) || (i === 0 ? 'Recommend for Appointment' : 'Hold For Future Considerations'),
      selected: c.status === 'Selected' || i === 0,
    }));
  });

  // Re-sync interviewees when selectedReqId or candidates change
  React.useEffect(() => {
    const cands = candidates.filter(c => c.requisitionId === activeReq.id);
    setInterviewees(
      cands.map((c, i) => ({
        candidateId: c.id,
        interviewDate: c.interviewDate || '2026-08-28',
        recommendation: (c.interviewRecommendation as any) || (i === 0 ? 'Recommend for Appointment' : 'Hold For Future Considerations'),
        selected: c.status === 'Selected' || i === 0,
      }))
    );
  }, [selectedReqId, candidates, activeReq.id]);

  const handleReqChange = (reqId: string) => {
    setSelectedReqId(reqId);
    const newReq = requisitions.find(r => r.id === reqId);
    if (newReq) {
      const cands = candidates.filter(c => c.requisitionId === newReq.id);
      setInterviewees(
        cands.map((c, i) => ({
          candidateId: c.id,
          interviewDate: c.interviewDate || '2026-08-28',
          recommendation: (c.interviewRecommendation as any) || (i === 0 ? 'Recommend for Appointment' : 'Hold For Future Considerations'),
          selected: c.status === 'Selected' || i === 0,
        }))
      );
    }
  };

  // Add Panelist
  const handleAddPanelist = () => {
    setPanelists([
      ...panelists,
      {
        name: '',
        title: 'Department Panelist',
        remarks: '',
      }
    ]);
  };

  const handleRemovePanelist = (index: number) => {
    setPanelists(panelists.filter((_, i) => i !== index));
  };

  const handleUpdatePanelist = (index: number, updates: Partial<PanelistRow>) => {
    const updated = [...panelists];
    updated[index] = { ...updated[index], ...updates };
    setPanelists(updated);
  };

  // Add Interviewee Manually (empty by default as requested by user)
  const handleAddInterviewee = () => {
    setInterviewees([
      ...interviewees,
      {
        candidateId: '',
        interviewDate: new Date().toISOString().split('T')[0],
        recommendation: 'Recommend for Appointment',
        selected: false,
      }
    ]);
  };

  const handleRemoveInterviewee = (index: number) => {
    setInterviewees(interviewees.filter((_, i) => i !== index));
  };

  const handleUpdateInterviewee = (index: number, updates: Partial<IntervieweeRow>) => {
    const updated = [...interviewees];
    updated[index] = { ...updated[index], ...updates };
    setInterviewees(updated);
  };

  // Save Interview Report
  const [showConfirmSaveModal, setShowConfirmSaveModal] = useState(false);

  const handleInitiateSaveReport = () => {
    setShowConfirmSaveModal(true);
  };

  const handleConfirmSaveReport = () => {
    setShowConfirmSaveModal(false);
    if (onSaveInterviewReport) {
      onSaveInterviewReport(activeReq.id, panelists, interviewees);
    }

    // Update selected candidates
    interviewees.forEach(row => {
      const cand = candidates.find(c => c.id === row.candidateId);
      if (cand) {
        if (row.selected) {
          onSelectCandidateForOffer(cand);
        } else if (row.recommendation === 'Hold For Future Considerations') {
          onTransferToTalentPool(cand);
        }
      }
    });

    setNotificationMsg('✓ Interview Report & Selection Decisions saved successfully! Appointed candidate(s) are now ready for Offer Letter Issuance.');
    setTimeout(() => setNotificationMsg(null), 4500);
  };

  const selectedCount = interviewees.filter(i => i.selected).length;
  const topScore = rankedCandidates.length > 0 ? getHolisticScore(rankedCandidates[0]) : 0;

  return (
    <ViewShell>
      <PageHeader
        badge="Step 5 • Final Decision & Council Recommendation"
        badgeColor="bg-violet-50 text-violet-700 border-violet-200"
        title="Selection Matrix & Recommendations"
        subtitle="Holistic merit ranking combining test scores, interview board scores, CV match, and minimum criteria."
        actions={
          <>
            <button type="button" onClick={() => onNavigate('final-interview', selectedReqId)} className="btn btn-secondary">
              <ChevronLeft className="w-4 h-4" />
              Back to Interview Board
            </button>
            <button type="button" onClick={() => onNavigate('offer-management')} className="btn btn-primary btn-lg">
              Open Offer Management
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        }
      />

      {notificationMsg && (
        <NotificationBanner message={notificationMsg} onDismiss={() => setNotificationMsg(null)} variant="success" />
      )}

      <MetricGrid cols="grid-cols-2 sm:grid-cols-4">
        <DashboardKpiCard title="Candidates Ranked" value={rankedCandidates.length} icon={Award} theme="purple" footer={<span className="text-violet-600 font-semibold">Holistic merit ranking</span>} />
        <DashboardKpiCard title="Top Holistic Score" value={`${topScore}%`} icon={Star} theme="blue" footer={<span className="text-blue-600 font-semibold">Highest combined score</span>} />
        <DashboardKpiCard title="Selected to Appoint" value={selectedCount} icon={UserCheck} theme="green" footer={<span className="text-emerald-600 font-semibold">Recommended for offer</span>} />
        <DashboardKpiCard title="Panel Evidence Sources" value={panelists.filter(p => p.name.trim()).length} icon={FileText} theme="cyan" footer={<span>Active panelist records</span>} />
      </MetricGrid>

      <DataTableShell
        title="Holistic Merit Ranking"
        subtitle="Interview Board scores combined with assessment and qualification evidence"
      >
          <table className="standard-table">
            <thead>
              <tr>
                <th className="text-center">Rank</th>
                <th>Candidate</th>
                <th className="text-center">CV Match</th>
                <th className="text-center">Assessment</th>
                <th className="text-center">Interview</th>
                <th className="text-center">Holistic Score</th>
                <th className="text-center">Decision</th>
              </tr>
            </thead>
            <tbody>
              {rankedCandidates.map((candidate, index) => {
                const row = interviewees.find(item => item.candidateId === candidate.id);
                const score = getHolisticScore(candidate);
                return (
                  <tr key={candidate.id} className={row?.selected ? 'bg-emerald-50/60' : ''}>
                    <td className="px-3 py-3 text-center font-black text-slate-500">{index + 1}</td>
                    <td className="px-3 py-3"><div className="font-bold text-slate-900">{candidate.name}</div><div className="text-[11px] text-slate-500">{candidate.position}</div></td>
                    <td className="px-3 py-3 text-center font-bold text-sky-700">{candidate.matchScore}%</td>
                    <td className="px-3 py-3 text-center font-bold text-amber-700">{candidate.testScore ?? 'N/A'}</td>
                    <td className="px-3 py-3 text-center font-bold text-violet-700">{candidate.interviewScore ?? 'N/A'}</td>
                    <td className="px-3 py-3 text-center"><span className="rounded-full bg-slate-900 px-2.5 py-1 font-black text-white">{score}%</span></td>
                    <td className="px-3 py-3 text-center"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${row?.selected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{row?.selected ? 'Recommend' : row?.recommendation || 'Review'}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
      </DataTableShell>

      {/* Requisition Details Card matching Screenshot 3 */}
      <div className="page-card p-4 text-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e2e8f0] pb-2">
          <h3 className="font-bold text-xs text-[#0f4c81] uppercase tracking-wider">
            Requisition Details
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-semibold text-[11px]">Select Position:</span>
            <select
              value={selectedReqId}
              onChange={(e) => handleReqChange(e.target.value)}
              className="bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs font-bold text-[#0f4c81] focus:ring-1 focus:ring-[#0284c7] focus:outline-none cursor-pointer"
            >
              {requisitions.map(r => (
                <option key={r.id} value={r.id}>
                  {r.reqNo} - {r.position} ({r.department})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-[11px]">
          <div>
            <span className="text-gray-500 block">Department:</span>
            <strong className="text-gray-800">{activeReq.department}</strong>
          </div>
          <div>
            <span className="text-gray-500 block">Position:</span>
            <strong className="text-gray-800">{activeReq.position}</strong>
          </div>
          <div>
            <span className="text-gray-500 block">Salary Scale:</span>
            <strong className="text-gray-800">{activeReq.salaryScale}</strong>
          </div>
          <div>
            <span className="text-gray-500 block">Reports To:</span>
            <strong className="text-gray-800">{activeReq.reportsTo}</strong>
          </div>
          <div>
            <span className="text-gray-500 block">Date Of Reporting:</span>
            <strong className="text-gray-800">{activeReq.dateOfReporting}</strong>
          </div>
          <div>
            <span className="text-gray-500 block">Budget:</span>
            <strong className="text-gray-800 font-mono">UGX {activeReq.budget}</strong>
          </div>
          <div>
            <span className="text-gray-500 block">Vacancies:</span>
            <strong className="text-gray-800">{activeReq.vacancies}</strong>
          </div>
        </div>
      </div>

      <DataTableShell
        title="Selection Evidence Sources"
        actions={
          <button type="button" onClick={handleAddPanelist} className="btn btn-secondary">
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        }
      >
          <table className="standard-table">
            <thead>
              <tr>
                <th className="min-w-[180px]">Name</th>
                <th className="min-w-[180px]">Title Of The Person</th>
                <th className="min-w-[240px]">Remarks</th>
                <th className="min-w-[180px]">Attachment</th>
                <th className="text-center w-12">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {panelists.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    No panel members recorded yet. Click "+ Add" to add interviewers.
                  </td>
                </tr>
              ) : (
                panelists.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 border-r border-[#e2e8f0]">
                      <input
                        type="text"
                        value={p.name}
                        placeholder="e.g. Dr. Arthur Sempala"
                        onChange={(e) => handleUpdatePanelist(idx, { name: e.target.value })}
                        className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs font-medium focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3 border-r border-[#e2e8f0]">
                      <input
                        type="text"
                        value={p.title}
                        placeholder="e.g. Head of Operations"
                        onChange={(e) => handleUpdatePanelist(idx, { title: e.target.value })}
                        className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3 border-r border-[#e2e8f0]">
                      <input
                        type="text"
                        value={p.remarks}
                        placeholder="Panelist observations, technical ratings & remarks..."
                        onChange={(e) => handleUpdatePanelist(idx, { remarks: e.target.value })}
                        className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3 border-r border-[#e2e8f0]">
                      <div className="flex items-center gap-1.5">
                        <label className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-[11px] font-semibold text-gray-700 cursor-pointer inline-flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />
                          <span>Choose File</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleUpdatePanelist(idx, { fileName: e.target.files[0].name });
                              }
                            }}
                          />
                        </label>
                        <span className="text-[11px] text-gray-500 truncate max-w-[120px]">
                          {p.fileName || 'No file chosen'}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemovePanelist(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 cursor-pointer"
                        title="Delete Panelist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </DataTableShell>

      <DataTableShell
        title="Appointment Decision & Recommendation"
        actions={
          <button type="button" onClick={handleAddInterviewee} className="btn btn-secondary">
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        }
        footer={
          <div className="flex items-center justify-end gap-3 p-3 border-t border-slate-100">
            <button type="button" onClick={handleInitiateSaveReport} className="btn btn-primary">
              <Save className="w-4 h-4" />
              Save Recommendations
            </button>
          </div>
        }
      >
          <table className="standard-table">
            <thead>
              <tr>
                <th className="min-w-[200px]">Applicant Name</th>
                <th className="min-w-[130px]">Date Of Interview</th>
                <th className="min-w-[220px]">Recommendation</th>
                <th className="text-center min-w-[130px]">Has Been Selected</th>
                <th className="text-center w-12">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {interviewees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    No interviewees evaluated for this requisition yet.
                  </td>
                </tr>
              ) : (
                interviewees.map((row, idx) => {
                  const cand = candidates.find(c => c.id === row.candidateId);
                  return (
                    <tr key={idx} className={`hover:bg-slate-50 ${row.selected ? 'bg-emerald-50/40' : ''}`}>
                      <td className="py-2 px-3 border-r border-[#e2e8f0]">
                        <select
                          value={row.candidateId}
                          onChange={(e) => handleUpdateInterviewee(idx, { candidateId: e.target.value })}
                          className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs font-bold text-[#0f4c81] focus:ring-1 focus:ring-[#0284c7] focus:outline-none cursor-pointer"
                        >
                          <option value="">-- Select Candidate --</option>
                          {candidates.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.position})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3 border-r border-[#e2e8f0]">
                        <input
                          type="date"
                          value={row.interviewDate}
                          onChange={(e) => handleUpdateInterviewee(idx, { interviewDate: e.target.value })}
                          className="w-full bg-white border border-[#cbd5e1] rounded px-2 py-1 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3 border-r border-[#e2e8f0]">
                        <select
                          value={row.recommendation}
                          onChange={(e) => handleUpdateInterviewee(idx, { recommendation: e.target.value as any })}
                          className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs font-semibold focus:ring-1 focus:ring-[#0284c7] focus:outline-none cursor-pointer"
                        >
                          <option value="Recommend for Appointment">Recommend for Appointment</option>
                          <option value="Hold For Future Considerations">Hold For Future Considerations (Talent Pool)</option>
                          <option value="Backup Candidate">Backup Candidate</option>
                          <option value="Not Recommended">Not Recommended</option>
                        </select>
                      </td>
                      <td className="py-2 px-3 border-r border-[#e2e8f0] text-center">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={(e) => handleUpdateInterviewee(idx, { selected: e.target.checked })}
                            className="rounded text-[#0284c7] cursor-pointer"
                          />
                          <span className={`text-[11px] font-bold ${row.selected ? 'text-emerald-700' : 'text-gray-500'}`}>
                            {row.selected ? 'Selected (Appoint)' : 'No'}
                          </span>
                        </label>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveInterviewee(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 cursor-pointer"
                          title="Delete Interviewee"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
      </DataTableShell>

      {/* Confirmation Modal for Interview Report */}
      <ConfirmationModal
        isOpen={showConfirmSaveModal}
        title="Confirm Selection Recommendations"
        subtitle="You are about to finalize the merit ranking, recommendations, and appointment decisions for this approved vacancy."
        variant="primary"
        confirmText="Confirm & Save Decisions"
        summaryItems={[
          {
            label: 'Position Requisition',
            value: <span className="text-[#0f4c81] font-bold">{activeReq.position} ({activeReq.reqNumber})</span>
          },
          {
            label: 'Evidence Sources',
            value: `${panelists.filter(p => p.name.trim()).length} supporting evaluator record(s)`
          },
          {
            label: 'Interviewees Evaluated',
            value: `${interviewees.length} candidate(s)`
          },
          {
            label: 'Selected for Appointment',
            value: <span className="text-emerald-700 font-bold">{interviewees.filter(i => i.selected).length} candidate(s)</span>
          }
        ]}
        warningMessage="Selected candidates will immediately be available in Offer Management for official contract generation."
        onConfirm={handleConfirmSaveReport}
        onClose={() => setShowConfirmSaveModal(false)}
      />
    </ViewShell>
  );
};
