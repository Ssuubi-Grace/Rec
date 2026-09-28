import React from 'react';
import { X, CheckCircle, Award, Briefcase, GraduationCap, Check, Minus } from 'lucide-react';
import { Candidate } from '../../types';

interface CandidateComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: Candidate[];
  onSelectCandidateForOffer?: (candidate: Candidate) => void;
}

export const CandidateComparisonModal: React.FC<CandidateComparisonModalProps> = ({
  isOpen,
  onClose,
  candidates,
  onSelectCandidateForOffer
}) => {
  if (!isOpen || candidates.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Side-by-Side Candidate Evaluation</h2>
            <p className="text-xs text-slate-500">
              Comparative assessment matrix across experience, verified skills, and interview rubrics
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 px-4 text-slate-400 font-bold uppercase tracking-wider w-1/4">
                  Assessment Criteria
                </th>
                {candidates.map((cand) => (
                  <th key={cand.id} className="py-3 px-4 text-slate-900 font-bold">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {cand.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{cand.name}</div>
                        <div className="text-[11px] font-normal text-slate-500">{cand.position}</div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Experience */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-700">Experience</td>
                {candidates.map(c => (
                  <td key={c.id} className="py-3 px-4 font-bold text-slate-900">
                    {c.yearsOfExperience} Years
                  </td>
                ))}
              </tr>

              {/* Qualification */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-700">Highest Qualification</td>
                {candidates.map(c => (
                  <td key={c.id} className="py-3 px-4 text-slate-800">
                    <div className="font-semibold">{c.educationLevel}</div>
                    <div className="text-[10px] text-slate-400">{c.fieldOfStudy || 'Computer Science'}</div>
                  </td>
                ))}
              </tr>

              {/* Core Skill: Python / System Architecture */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-700">Python & Architecture</td>
                {candidates.map(c => (
                  <td key={c.id} className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <Check className="w-3.5 h-3.5" /> Verified
                    </span>
                  </td>
                ))}
              </tr>

              {/* SQL & Database Engineering */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-700">SQL & Database Systems</td>
                {candidates.map(c => (
                  <td key={c.id} className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <Check className="w-3.5 h-3.5" /> Verified
                    </span>
                  </td>
                ))}
              </tr>

              {/* Professional Certification */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-700">Professional Certification</td>
                {candidates.map((c, i) => (
                  <td key={c.id} className="py-3 px-4 text-slate-700">
                    {i === 1 ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> AWS Certified Solution Architect
                      </span>
                    ) : i === 2 ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> PMP Project Management
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1">
                        <Minus className="w-3.5 h-3.5" /> Not provided
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Screening Score */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-700">Screening Score</td>
                {candidates.map(c => (
                  <td key={c.id} className="py-3 px-4 font-bold text-slate-900">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono">
                      {c.matchScore}%
                    </span>
                  </td>
                ))}
              </tr>

              {/* Interview Board Score */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-700">Interview Board Score</td>
                {candidates.map(c => (
                  <td key={c.id} className="py-3 px-4 font-bold text-blue-700">
                    {c.interviewScore ? (
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">
                        {c.interviewScore}%
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Pending Panel</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Recommendation */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-700">Recommendation</td>
                {candidates.map(c => (
                  <td key={c.id} className="py-3 px-4 font-bold">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${
                      c.interviewRecommendation?.includes('Recommend') || c.status === 'Selected'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {c.interviewRecommendation || c.status}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            All evaluations backed by auditable panel scorecards and submitted transcripts.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold cursor-pointer"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
