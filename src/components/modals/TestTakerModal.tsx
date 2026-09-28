import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Play, 
  ArrowRight, 
  RotateCcw,
  Check,
  ChevronRight,
  Layers,
  Sparkles,
  BarChart2,
  FlaskConical,
  X
} from 'lucide-react';
import { PsychometricTest, Candidate, TestQuestion } from '../../types';

interface TestTakerModalProps {
  test: PsychometricTest;
  candidate?: Candidate | null;
  onClose: () => void;
  onCompleteTest: (scorePct: number, passStatus: 'Passed' | 'Failed', candidateId?: string) => void;
}

const SECTION_METADATA: Record<string, { name: string; icon: string; desc: string }> = {
  numerical: { name: 'Numerical Reasoning', icon: '', desc: 'Data interpretation, percentages & financial calculations' },
  logical: { name: 'Logical & Abstract Reasoning', icon: '', desc: 'Deductive reasoning, pattern recognition & sequences' },
  verbal: { name: 'English & Verbal Comprehension', icon: '', desc: 'Vocabulary, written fluency & comprehension' },
  situational: { name: 'Situational Judgment & Ethics', icon: '', desc: 'Workplace decision making & professional ethics' },
  technical: { name: 'Technical Competence', icon: '', desc: 'Core domain architecture, systems & methodologies' }
};

export const TestTakerModal: React.FC<TestTakerModalProps> = ({
  test,
  candidate,
  onClose,
  onCompleteTest,
}) => {
  const isSimulationMode = !candidate;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>((test.durationMinutes || 15) * 60);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [activeSectionTab, setActiveSectionTab] = useState<string>('all');
  const [result, setResult] = useState<{ 
    scorePct: number; 
    passed: boolean; 
    earned: number; 
    total: number;
    sectionBreakdown: { sectionId: string; name: string; icon: string; earned: number; total: number; pct: number }[];
  } | null>(null);

  // Group questions by section
  const sectionsPresent: string[] = Array.from(new Set(test.questions.map(q => q.section || 'numerical')));

  // Reset simulation handler
  const handleResetSimulation = () => {
    setAnswers({});
    setTimeLeft((test.durationMinutes || 15) * 60);
    setSubmitted(false);
    setResult(null);
    setActiveSectionTab('all');
  };

  // Timer countdown
  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSelectOption = (questionId: string, optionKey: string) => {
    if (submitted) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleSubmitTest = () => {
    let earned = 0;
    let total = 0;

    const sectionScores: Record<string, { earned: number; total: number }> = {};

    test.questions.forEach(q => {
      const secKey = q.section || 'numerical';
      if (!sectionScores[secKey]) {
        sectionScores[secKey] = { earned: 0, total: 0 };
      }
      sectionScores[secKey].total += q.points;
      total += q.points;

      if (answers[q.id] === q.correctKey) {
        sectionScores[secKey].earned += q.points;
        earned += q.points;
      }
    });

    const scorePct = total > 0 ? Math.round((earned / total) * 100) : 0;
    const passed = scorePct >= test.passingScorePct;

    const sectionBreakdown = Object.entries(sectionScores).map(([secId, data]) => {
      const customDef = test.sectionDefinitions?.find(s => s.id === secId || s.categoryType === secId);
      const meta = SECTION_METADATA[secId] || { name: customDef?.title || secId.toUpperCase(), icon: '📋', desc: '' };
      return {
        sectionId: secId,
        name: customDef?.title || meta.name,
        icon: meta.icon,
        earned: data.earned,
        total: data.total,
        pct: data.total > 0 ? Math.round((data.earned / data.total) * 100) : 0
      };
    });

    setResult({
      scorePct,
      passed,
      earned,
      total,
      sectionBreakdown
    });
    setSubmitted(true);

    // Only update real candidate profile if a real candidate took the test!
    if (candidate) {
      onCompleteTest(scorePct, passed ? 'Passed' : 'Failed', candidate.id);
    }
  };

  const displayedQuestions = activeSectionTab === 'all'
    ? test.questions
    : test.questions.filter(q => (q.section || 'numerical') === activeSectionTab);

  return (
    <div className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full overflow-hidden border border-[#94a3b8] flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#1e293b] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-cyan-500/20 rounded text-cyan-400">
              {isSimulationMode ? <FlaskConical className="w-5 h-5" /> : <BrainCircuit className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm leading-tight">{test.title}</h3>
                {isSimulationMode && (
                  <span className="bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded">
                    Admin Test Drive Simulation
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-300">
                {candidate 
                  ? `Applicant Assessment: ${candidate.name} (${candidate.position})` 
                  : 'Question Setter Sandbox Preview Mode (No live candidate data affected)'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!submitted && (
              <div className="flex items-center gap-2 bg-[#334155] px-3 py-1 rounded text-xs font-mono font-bold text-amber-300 border border-slate-600">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Time Left: {formatTime(timeLeft)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Simulation Notice Banner */}
        {isSimulationMode && (
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 text-[11px] text-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <span className="text-[#0f4c81] font-bold">Admin Simulation:</span>
              <span>Previewing candidate navigation, sectional time limits, and test questions.</span>
            </div>
            <span className="font-mono text-[10px] text-slate-700 bg-slate-200 px-2 py-0.5 rounded font-bold">
              Preview Mode
            </span>
          </div>
        )}

        {/* Section Tabs (Shown when taking test) */}
        {!submitted && (
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="font-bold text-gray-600 text-[11px] mr-1 shrink-0">Sections:</span>
            <button
              onClick={() => setActiveSectionTab('all')}
              className={`px-3 py-1 rounded text-xs font-bold shrink-0 transition-colors ${
                activeSectionTab === 'all'
                  ? 'bg-[#1e293b] text-white shadow-2xs'
                  : 'bg-white text-gray-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              All Questions ({test.questions.length})
            </button>

            {sectionsPresent.map(secId => {
              const meta = SECTION_METADATA[secId] || { name: secId, icon: '' };
              const secQuestions = test.questions.filter(q => (q.section || 'numerical') === secId);
              const answeredCount = secQuestions.filter(q => !!answers[q.id]).length;
              const isAllAnswered = answeredCount === secQuestions.length && secQuestions.length > 0;

              return (
                <button
                  key={secId}
                  onClick={() => setActiveSectionTab(secId)}
                  className={`px-3 py-1 rounded text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors ${
                    activeSectionTab === secId
                      ? 'bg-[#0284c7] text-white shadow-2xs'
                      : 'bg-white text-gray-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <span>{meta.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isAllAnswered ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {answeredCount}/{secQuestions.length}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#334155] flex-1">
          {!submitted ? (
            <>
              <div className="bg-blue-50/80 border border-blue-200 p-3 rounded flex items-center justify-between text-xs text-[#0f4c81]">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Required Pass Mark: {test.passingScorePct}%</span>
                  <span>•</span>
                  <span>Total Sections: {sectionsPresent.length}</span>
                </div>
                <span className="font-bold text-gray-700">
                  Total Answered: {Object.keys(answers).length} of {test.questions.length}
                </span>
              </div>

              {/* Questions Rendered by Section */}
              <div className="space-y-6">
                {displayedQuestions.map((q, idx) => {
                  const secMeta = SECTION_METADATA[q.section || 'numerical'] || { name: 'General Aptitude', icon: '', desc: '' };
                  return (
                    <div key={q.id} className="space-y-3 bg-[#f8fafc] p-4 rounded border border-gray-200 hover:border-slate-300 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-200 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#0284c7] text-white font-bold text-[11px] inline-flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="bg-white border border-slate-300 text-slate-800 text-[10px] px-2 py-0.5 rounded font-bold inline-flex items-center gap-1">
                            <span>{secMeta.name}</span>
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 font-mono">
                          Question Weight: {q.points} pts
                        </span>
                      </div>

                      <p className="font-bold text-sm text-[#1e293b] leading-snug pl-1">
                        {q.text}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map(opt => {
                          const isSelected = answers[q.id] === opt.key;
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => handleSelectOption(q.id, opt.key)}
                              className={`flex items-center gap-2.5 p-2.5 rounded border text-left text-xs transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#0284c7] text-white border-[#0284c7] font-semibold shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-slate-50'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-white text-[#0284c7]' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {opt.key}
                              </span>
                              <span>{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Results Screen */
            <div className="py-4 space-y-6">
              <div className="text-center space-y-2">
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-md ${
                  result?.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                }`}>
                  {result?.passed ? (
                    <CheckCircle2 className="w-10 h-10" />
                  ) : (
                    <XCircle className="w-10 h-10" />
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-xl font-extrabold text-[#1e293b]">
                      {result?.passed ? 'Assessment Passing Benchmark Met!' : 'Assessment Passing Threshold Not Met'}
                    </h3>
                  </div>
                  {isSimulationMode && (
                    <span className="inline-block mt-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded">
                      🧪 Test Drive Simulation Results (Sandbox Preview)
                    </span>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    {isSimulationMode 
                      ? 'This is an authoring simulation preview. Candidates scoring at or above the threshold will automatically advance to Confirmed Shortlists.'
                      : (result?.passed 
                        ? 'Congratulations! You have satisfied the pre-screening criteria and your profile has been advanced to Confirmed Shortlists.' 
                        : 'Your cumulative score fell below the required benchmark for this position.')
                    }
                  </p>
                </div>
              </div>

              {/* Overall Summary Card */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded max-w-lg mx-auto space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-gray-200">
                  <span className="text-gray-600 font-semibold">Cumulative Score Achieved:</span>
                  <strong className={`text-xl font-extrabold ${result?.passed ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {result?.scorePct}%
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-600 font-semibold">Required Passing Threshold:</span>
                  <strong className="font-semibold text-gray-800">{test.passingScorePct}%</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-600 font-semibold">Total Points Earned:</span>
                  <span className="font-mono text-gray-800 font-bold">{result?.earned} / {result?.total} pts</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-600 font-semibold">Simulation / Shortlist Outcome:</span>
                  <span className={`font-bold uppercase ${result?.passed ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {result?.passed ? '✓ PRE-SHORTLIST ADVANCED' : 'RETAINED IN TALENT ARCHIVE'}
                  </span>
                </div>
              </div>

              {/* Itemized Section Breakdown */}
              <div className="max-w-lg mx-auto space-y-3">
                <h4 className="font-bold text-xs text-[#1e293b] uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200 pb-1">
                  <BarChart2 className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>Section-by-Section Performance Breakdown</span>
                </h4>

                <div className="space-y-2">
                  {result?.sectionBreakdown.map(sec => (
                    <div key={sec.sectionId} className="bg-white border border-slate-200 p-2.5 rounded text-xs space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          <span>{sec.icon}</span>
                          <span>{sec.name}</span>
                        </span>
                        <span className="font-mono text-emerald-800 font-bold">
                          {sec.pct}% ({sec.earned}/{sec.total} pts)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${sec.pct >= 70 ? 'bg-emerald-500' : sec.pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${sec.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#f1f5f9] px-5 py-3 border-t border-[#cbd5e1] flex items-center justify-between">
          {!submitted ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 bg-white border border-[#cbd5e1] text-gray-600 rounded text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitTest}
                disabled={Object.keys(answers).length === 0}
                className={`px-6 py-1.5 rounded text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  Object.keys(answers).length > 0
                    ? 'bg-[#16a34a] hover:bg-[#15803d] text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Submit All Sections ({Object.keys(answers).length}/{test.questions.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              {isSimulationMode ? (
                <button
                  type="button"
                  onClick={handleResetSimulation}
                  className="px-4 py-1.5 bg-white border border-gray-300 hover:bg-slate-100 text-gray-700 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retest / Try Another Simulation</span>
                </button>
              ) : <div></div>}

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded text-xs font-bold cursor-pointer"
              >
                {isSimulationMode ? 'Close Simulation & Return to Editor' : 'Return to Workflow'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
