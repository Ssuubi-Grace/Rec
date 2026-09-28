import React, { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  MapPin,
  Save,
  Star,
  UserCheck,
  Users,
  Video,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Candidate, Requisition } from '../../types';
import { ActiveView } from '../layout/Navbar';
import { ConfirmationModal } from '../modals/ConfirmationModal';

interface InterviewBoardScoringViewProps {
  candidates: Candidate[];
  requisitions: Requisition[];
  targetRequisitionId?: string;
  onNavigate: (view: ActiveView, param?: string) => void;
  onUpdateCandidateScore: (candidateId: string, interviewScore: number) => void;
}

interface RubricScores {
  technical: number;
  communication: number;
  problemSolving: number;
  experience: number;
  culture: number;
}

interface CandidateEvaluation {
  candidateId: string;
  interviewDate: string;
  interviewTime: string;
  venue: string;
  rubric: RubricScores;
  recommendation: 'Strongly Recommend' | 'Recommend' | 'Reserve' | 'Do Not Recommend';
  panelNotes: string;
  submitted: boolean;
}

const DEFAULT_RUBRIC: RubricScores = {
  technical: 7,
  communication: 7,
  problemSolving: 7,
  experience: 7,
  culture: 7,
};

const RUBRIC_LABELS: { key: keyof RubricScores; label: string; max: number }[] = [
  { key: 'technical', label: 'Technical Knowledge', max: 10 },
  { key: 'communication', label: 'Communication', max: 10 },
  { key: 'problemSolving', label: 'Problem Solving', max: 10 },
  { key: 'experience', label: 'Relevant Experience', max: 10 },
  { key: 'culture', label: 'Culture & Values', max: 10 },
];

const calcOverall = (rubric: RubricScores) =>
  Math.round(
    ((rubric.technical + rubric.communication + rubric.problemSolving + rubric.experience + rubric.culture) / 50) * 100
  );

export const InterviewBoardScoringView: React.FC<InterviewBoardScoringViewProps> = ({
  candidates,
  requisitions,
  targetRequisitionId,
  onNavigate,
  onUpdateCandidateScore,
}) => {
  const [selectedReqId, setSelectedReqId] = useState<string>(
    () => targetRequisitionId || requisitions[0]?.id || 'req-1'
  );
  const [activeCandidateId, setActiveCandidateId] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  React.useEffect(() => {
    if (targetRequisitionId) setSelectedReqId(targetRequisitionId);
  }, [targetRequisitionId]);

  const activeReq = requisitions.find(r => r.id === selectedReqId) || requisitions[0];
  const reqCandidates = candidates.filter(
    c =>
      c.requisitionId === activeReq?.id &&
      ['Interview Scheduled', 'Interview Evaluated', 'Shortlisted', 'Pre-Shortlisted', 'Selected'].includes(c.status)
  );

  const [evaluations, setEvaluations] = useState<Record<string, CandidateEvaluation>>(() => {
    const init: Record<string, CandidateEvaluation> = {};
    reqCandidates.forEach(c => {
      init[c.id] = {
        candidateId: c.id,
        interviewDate: c.interviewDate || '2026-09-17',
        interviewTime: '10:30 AM – 11:15 AM',
        venue: 'Conference Room 2 / Teams',
        rubric: {
          technical: Math.round((c.interviewScore ?? 75) / 10) || 7,
          communication: 8,
          problemSolving: 7,
          experience: Math.round((c.yearsOfExperience ?? 3) * 1.5) || 7,
          culture: 8,
        },
        recommendation: (c.interviewScore ?? 0) >= 80 ? 'Strongly Recommend' : 'Recommend',
        panelNotes: '',
        submitted: Boolean(c.interviewScore),
      };
    });
    return init;
  });

  React.useEffect(() => {
    const cands = candidates.filter(
      c =>
        c.requisitionId === activeReq?.id &&
        ['Interview Scheduled', 'Interview Evaluated', 'Shortlisted', 'Pre-Shortlisted', 'Selected'].includes(c.status)
    );
    setEvaluations(prev => {
      const next = { ...prev };
      cands.forEach(c => {
        if (!next[c.id]) {
          next[c.id] = {
            candidateId: c.id,
            interviewDate: c.interviewDate || '2026-09-17',
            interviewTime: '10:30 AM – 11:15 AM',
            venue: 'Conference Room 2 / Teams',
            rubric: DEFAULT_RUBRIC,
            recommendation: 'Recommend',
            panelNotes: '',
            submitted: Boolean(c.interviewScore),
          };
        }
      });
      return next;
    });
    if (cands.length > 0 && !activeCandidateId) setActiveCandidateId(cands[0].id);
  }, [selectedReqId, candidates, activeReq?.id]);

  const activeCandidate = candidates.find(c => c.id === activeCandidateId);
  const activeEval = activeCandidateId ? evaluations[activeCandidateId] : null;

  const updateEval = (candidateId: string, updates: Partial<CandidateEvaluation>) => {
    setEvaluations(prev => ({
      ...prev,
      [candidateId]: { ...prev[candidateId], ...updates },
    }));
  };

  const updateRubric = (candidateId: string, key: keyof RubricScores, value: number) => {
    setEvaluations(prev => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        rubric: { ...prev[candidateId].rubric, [key]: value },
      },
    }));
  };

  const handleSubmitAllScores = () => {
    Object.entries(evaluations).forEach(([id, ev]) => {
      const score = calcOverall(ev.rubric);
      onUpdateCandidateScore(id, score);
    });
    setShowSubmitModal(false);
    setNotificationMsg('Oral panel scores compiled and submitted to Selection Matrix for holistic merit ranking.');
    setTimeout(() => setNotificationMsg(null), 4500);
  };

  const submittedCount = Object.values(evaluations).filter(e => e.submitted).length;

  return (
    <div className="space-y-5 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="page-card p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="status-pill bg-purple-50 text-purple-700 border-purple-200">
                Step 4 • Oral Panel Evaluation
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Interview Board &amp; Scoring
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Live panel assessment — score candidates on structured rubrics during the interview room session.
              Scores feed into the Selection Matrix for final appointment decisions.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button type="button" onClick={() => onNavigate('confirmed-shortlists')} className="btn btn-secondary">
              <ChevronLeft className="w-4 h-4" />
              Back to Shortlists
            </button>
            <button type="button" onClick={() => onNavigate('selected-candidates', selectedReqId)} className="btn btn-primary btn-lg">
              Proceed to Selection Matrix
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {notificationMsg}
        </div>
      )}

      {/* Requisition selector + panel info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 page-card p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
            <h3 className="text-sm font-bold text-slate-800">Active Vacancy</h3>
            <select
              value={selectedReqId}
              onChange={e => setSelectedReqId(e.target.value)}
              className="text-xs font-bold text-blue-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer max-w-sm"
            >
              {requisitions.map(r => (
                <option key={r.id} value={r.id}>
                  {r.reqNo} — {r.position}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div><span className="text-slate-400 block">Department</span><strong className="text-slate-800">{activeReq?.department}</strong></div>
            <div><span className="text-slate-400 block">Position</span><strong className="text-slate-800">{activeReq?.position}</strong></div>
            <div><span className="text-slate-400 block">Vacancies</span><strong className="text-slate-800">{activeReq?.vacancies}</strong></div>
            <div><span className="text-slate-400 block">Interview Type</span><strong className="text-slate-800">Technical + Competency</strong></div>
          </div>
        </div>

        <div className="page-card p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-purple-900">Panel Members</h3>
          </div>
          <ul className="space-y-1.5 text-xs text-purple-800">
            <li className="flex items-center gap-2"><UserCheck className="w-3 h-3" /> Dr. Arthur Sempala — HR Director</li>
            <li className="flex items-center gap-2"><UserCheck className="w-3 h-3" /> Grace Namukasa — Technical Lead</li>
            <li className="flex items-center gap-2"><UserCheck className="w-3 h-3" /> Patrick Ochola — Senior HR Specialist</li>
          </ul>
          <p className="text-[10px] text-purple-600 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Scores hidden from other panelists until submission
          </p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Scheduled Today', value: reqCandidates.length, color: 'text-purple-700 bg-purple-50 border-purple-100' },
          { label: 'Scores Submitted', value: submittedCount, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
          { label: 'Pending Evaluation', value: reqCandidates.length - submittedCount, color: 'text-amber-700 bg-amber-50 border-amber-100' },
          { label: 'Avg Panel Score', value: `${Math.round(reqCandidates.reduce((a, c) => a + (c.interviewScore ?? 0), 0) / Math.max(reqCandidates.length, 1))}%`, color: 'text-blue-700 bg-blue-50 border-blue-100' },
        ].map(stat => (
          <div key={stat.label} className={`metric-card border ${stat.color.split(' ').slice(1).join(' ')}`}>
            <div className={`text-2xl font-black ${stat.color.split(' ')[0]}`}>{stat.value}</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-4">
        {/* Candidate list sidebar */}
        <div className="table-card">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Interview Queue</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
            {reqCandidates.length === 0 ? (
              <p className="p-4 text-xs text-slate-400 text-center">No candidates scheduled for interview on this requisition.</p>
            ) : (
              reqCandidates.map(c => {
                const ev = evaluations[c.id];
                const score = ev ? calcOverall(ev.rubric) : c.interviewScore ?? 0;
                const isActive = c.id === activeCandidateId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveCandidateId(c.id)}
                    className={`w-full text-left px-4 py-3 transition-colors ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 truncate">{c.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{c.position}</div>
                      </div>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${score >= 80 ? 'bg-emerald-100 text-emerald-800' : score >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                        {score}%
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Scoring workspace */}
        {activeCandidate && activeEval ? (
          <div className="space-y-4">
            <div className="page-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-lg font-black">
                    {activeCandidate.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">{activeCandidate.name}</h2>
                    <p className="text-xs text-slate-500">{activeCandidate.position} • {activeCandidate.department}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="status-pill bg-slate-100 text-slate-600 border-slate-200 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {activeEval.interviewDate}
                  </span>
                  <span className="status-pill bg-slate-100 text-slate-600 border-slate-200 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {activeEval.interviewTime}
                  </span>
                  <span className="status-pill bg-slate-100 text-slate-600 border-slate-200 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {activeEval.venue}
                  </span>
                </div>
              </div>

              {/* Rubric scoring */}
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-purple-600" />
                Structured Evaluation Rubric
              </h3>
              <div className="space-y-4">
                {RUBRIC_LABELS.map(({ key, label, max }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-slate-700">{label}</span>
                      <span className="text-sm font-black text-purple-700">
                        {activeEval.rubric[key]}/{max}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={max}
                      value={activeEval.rubric[key]}
                      onChange={e => updateRubric(activeCandidate.id, key, Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none bg-slate-200 accent-purple-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>Poor</span><span>Excellent</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall score ring */}
              <div className="mt-5 p-4 bg-slate-950 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Panel Score</div>
                  <div className="text-3xl font-black text-white mt-1">{calcOverall(activeEval.rubric)}%</div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${star <= Math.round(calcOverall(activeEval.rubric) / 20) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="page-card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Panel Recommendation</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {(['Strongly Recommend', 'Recommend', 'Reserve', 'Do Not Recommend'] as const).map(rec => (
                  <button
                    key={rec}
                    type="button"
                    onClick={() => updateEval(activeCandidate.id, { recommendation: rec })}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      activeEval.recommendation === rec
                        ? rec === 'Do Not Recommend'
                          ? 'bg-red-600 text-white border-red-600'
                          : rec === 'Strongly Recommend'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {rec}
                  </button>
                ))}
              </div>
              <textarea
                value={activeEval.panelNotes}
                onChange={e => updateEval(activeCandidate.id, { panelNotes: e.target.value })}
                placeholder="Panel observations, oral answer highlights, technical test notes..."
                rows={3}
                className="w-full text-sm"
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    const score = calcOverall(activeEval.rubric);
                    onUpdateCandidateScore(activeCandidate.id, score);
                    updateEval(activeCandidate.id, { submitted: true });
                    setNotificationMsg(`Score saved for ${activeCandidate.name}: ${score}%`);
                    setTimeout(() => setNotificationMsg(null), 3000);
                  }}
                  className="btn btn-secondary"
                >
                  Save This Score
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="page-card p-10 text-center text-slate-400">
            <Video className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Select a candidate from the interview queue to begin scoring.</p>
          </div>
        )}
      </div>

      {/* Candidates scored table */}
      <div className="table-card">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Panel Score Summary</h3>
          <button type="button" onClick={() => setShowSubmitModal(true)} className="btn btn-primary btn-lg">
            <Save className="w-4 h-4" />
            Submit All Scores to Selection Matrix
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="standard-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th className="text-center">Technical</th>
                <th className="text-center">Communication</th>
                <th className="text-center">Problem Solving</th>
                <th className="text-center">Experience</th>
                <th className="text-center">Culture</th>
                <th className="text-center">Overall</th>
                <th className="text-center">Recommendation</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {reqCandidates.map(c => {
                const ev = evaluations[c.id];
                if (!ev) return null;
                const overall = calcOverall(ev.rubric);
                return (
                  <tr key={c.id} className="cursor-pointer" onClick={() => setActiveCandidateId(c.id)}>
                    <td>
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-400">{c.position}</div>
                    </td>
                    {(['technical', 'communication', 'problemSolving', 'experience', 'culture'] as const).map(k => (
                      <td key={k} className="text-center font-semibold text-slate-700">{ev.rubric[k]}/10</td>
                    ))}
                    <td className="text-center">
                      <span className="inline-flex px-2.5 py-1 rounded-full bg-slate-900 text-white text-xs font-black">{overall}%</span>
                    </td>
                    <td className="text-center">
                      <span className={`status-pill ${ev.recommendation === 'Do Not Recommend' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        {ev.recommendation}
                      </span>
                    </td>
                    <td className="text-center">
                      {ev.submitted ? (
                        <span className="status-pill bg-emerald-50 text-emerald-700 border-emerald-200">Submitted</span>
                      ) : (
                        <span className="status-pill bg-amber-50 text-amber-700 border-amber-200">Draft</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showSubmitModal}
        title="Submit Panel Scores"
        subtitle="All oral evaluation scores will be compiled and forwarded to the Selection Matrix for holistic merit ranking and appointment decisions."
        variant="primary"
        confirmText="Submit & Open Selection Matrix"
        summaryItems={[
          { label: 'Position', value: activeReq?.position || '—' },
          { label: 'Candidates Evaluated', value: `${reqCandidates.length}` },
          { label: 'Scores Ready', value: `${Object.values(evaluations).filter(e => calcOverall(e.rubric) > 0).length}` },
        ]}
        warningMessage="Once submitted, proceed to Selection Matrix to rank candidates holistically (CV + Assessment + Interview)."
        onConfirm={() => {
          handleSubmitAllScores();
          onNavigate('selected-candidates', selectedReqId);
        }}
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
};
