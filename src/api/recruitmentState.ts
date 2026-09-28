export type RecruitmentStatePayload = {
  requisitions: import('../types').Requisition[];
  candidates: import('../types').Candidate[];
  psychometricTests: import('../types').PsychometricTest[];
  offers: import('../types').OfferLetter[];
  onboardingTasks: import('../types').OnboardingTaskItem[];
  approvalTasks: import('../types').ApprovalTask[];
  documentTemplates: import('../types').OnboardingDocumentTemplate[];
};

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export async function fetchRecruitmentState(): Promise<RecruitmentStatePayload> {
  const res = await fetch(`${API_BASE}/api/recruitment/state`);
  if (!res.ok) throw new Error('Could not load recruitment data');
  return res.json();
}

export async function persistRecruitmentState(payload: RecruitmentStatePayload): Promise<void> {
  const res = await fetch(`${API_BASE}/api/recruitment/state`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Could not save recruitment data');
}

export async function resetRecruitmentStateApi(): Promise<RecruitmentStatePayload> {
  const res = await fetch(`${API_BASE}/api/recruitment/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Could not reset recruitment data');
  return res.json();
}
