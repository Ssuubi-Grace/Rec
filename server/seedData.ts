import {
  INITIAL_REQUISITIONS,
  INITIAL_CANDIDATES,
  INITIAL_TESTS,
  INITIAL_OFFERS,
  INITIAL_ONBOARDING_TASKS,
  INITIAL_APPROVAL_TASKS,
} from '../src/data/mockData.ts';
import { DEFAULT_DOCUMENT_TEMPLATES } from '../src/data/documentTemplatesData.ts';

export type RecruitmentStatePayload = {
  requisitions: typeof INITIAL_REQUISITIONS;
  candidates: typeof INITIAL_CANDIDATES;
  psychometricTests: typeof INITIAL_TESTS;
  offers: typeof INITIAL_OFFERS;
  onboardingTasks: typeof INITIAL_ONBOARDING_TASKS;
  approvalTasks: typeof INITIAL_APPROVAL_TASKS;
  documentTemplates: typeof DEFAULT_DOCUMENT_TEMPLATES;
};

export function buildDefaultRecruitmentState(): RecruitmentStatePayload {
  return {
    requisitions: structuredClone(INITIAL_REQUISITIONS),
    candidates: structuredClone(INITIAL_CANDIDATES),
    psychometricTests: structuredClone(INITIAL_TESTS),
    offers: structuredClone(INITIAL_OFFERS),
    onboardingTasks: structuredClone(INITIAL_ONBOARDING_TASKS),
    approvalTasks: structuredClone(INITIAL_APPROVAL_TASKS),
    documentTemplates: structuredClone(DEFAULT_DOCUMENT_TEMPLATES),
  };
}
