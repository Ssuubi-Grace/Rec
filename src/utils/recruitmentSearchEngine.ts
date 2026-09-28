import { Candidate, Requisition, ApprovalTask } from '../types';

export interface SearchInsight {
  id: string;
  title: string;
  answer: string;
  metric?: string;
  navigate?: { view: string; label: string };
}

export function answerRecruitmentQuery(
  query: string,
  ctx: {
    candidates: Candidate[];
    requisitions: Requisition[];
    approvalTasks: ApprovalTask[];
  }
): SearchInsight[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const { candidates, requisitions, approvalTasks } = ctx;
  const openVacancies = requisitions.reduce((s, r) => s + (r.vacancies || 0), 0);
  const pendingApprovals = approvalTasks.filter((t) => t.status === 'Pending').length;
  const activeCandidates = candidates.filter(
    (c) => !['Rejected', 'Withdrawn'].includes(c.status)
  ).length;
  const hired = candidates.filter((c) => ['Hired', 'Offer Accepted'].includes(c.status)).length;
  const interviewed = candidates.filter(
    (c) =>
      (c.interviewScore && c.interviewScore > 0) ||
      ['Interview Scheduled', 'Selected', 'Offer Issued', 'Offer Accepted', 'Hired'].includes(c.status)
  ).length;

  const insights: SearchInsight[] = [];

  const push = (title: string, answer: string, metric?: string, navigate?: SearchInsight['navigate']) => {
    insights.push({
      id: `insight-${insights.length}`,
      title,
      answer,
      metric,
      navigate,
    });
  };

  if (/vacanc|open role|open post|establishment/.test(q)) {
    push(
      'Open vacancies',
      `There are ${openVacancies} open posts across ${requisitions.filter((r) => r.vacancies > 0).length} active requisitions.`,
      String(openVacancies),
      { view: 'approved-requisitions', label: 'View approved vacancies' }
    );
  }

  if (/approval|pending|sla|governance/.test(q)) {
    push(
      'Pending approvals',
      pendingApprovals > 0
        ? `${pendingApprovals} approval task(s) are waiting in governance queues.`
        : 'No pending approval tasks — governance queue is clear.',
      String(pendingApprovals),
      { view: 'approval-tasks', label: 'Open approval tasks' }
    );
  }

  if (/candidate|applicant|pipeline|shortlist/.test(q)) {
    push(
      'Active candidates',
      `${activeCandidates} candidates are active in the pipeline; ${interviewed} have reached interview stage or beyond.`,
      String(activeCandidates),
      { view: 'candidate-pipeline', label: 'Open pipeline' }
    );
  }

  if (/hire|hired|offer|onboard/.test(q)) {
    push(
      'Hires & offers',
      `${hired} candidate(s) are hired or have accepted offers. Review offer management for in-flight letters.`,
      String(hired),
      { view: 'offer-management', label: 'Offer management' }
    );
  }

  if (/time.?to.?hire|velocity|speed|days/.test(q)) {
    push(
      'Time-to-hire (demo)',
      'Average time-to-hire is approximately 26 days based on current mock recruitment cycles.',
      '26d',
      { view: 'time-to-hire-report', label: 'Time-to-hire report' }
    );
  }

  if (/divers|gender|eeo|demographic/.test(q)) {
    const female = candidates.filter((c) => c.gender === 'Female').length;
    const male = candidates.filter((c) => c.gender === 'Male').length;
    push(
      'Workforce diversity snapshot',
      `Applicant pool: ${female} female and ${male} male records in scope (demo data).`,
      undefined,
      { view: 'eeo-diversity-report', label: 'Diversity report' }
    );
  }

  if (/analytics|report|funnel|budget/.test(q)) {
    push(
      'Analytics suite',
      'Use Analytics reports for funnel conversion, budget utilization, psychometrics, and SLA bottlenecks.',
      undefined,
      { view: 'vacancy-analysis-report', label: 'Vacancy analysis' }
    );
  }

  if (/department|it |finance|hr /.test(q)) {
    const deptMatch = requisitions.find((r) => q.includes(r.department.toLowerCase().slice(0, 4)));
    if (deptMatch) {
      const deptVac = requisitions
        .filter((r) => r.department === deptMatch.department)
        .reduce((s, r) => s + r.vacancies, 0);
      push(
        `${deptMatch.department} vacancies`,
        `${deptVac} open post(s) in ${deptMatch.department}.`,
        String(deptVac),
        { view: 'new-staff-requests', label: 'View requisitions' }
      );
    }
  }

  if (/how many|total|summary|overview|status/.test(q) && insights.length === 0) {
    push(
      'Recruitment overview',
      `${activeCandidates} active candidates · ${openVacancies} open vacancies · ${pendingApprovals} pending approvals · ${hired} hired.`,
      undefined,
      { view: 'recruitment-command-center', label: 'Dashboard' }
    );
  }

  if (/security|user account|users and roles|roles and permissions|audit trail/.test(q)) {
    push(
      'Security management',
      'Manage ProMISe user accounts, role definitions, and module permissions.',
      undefined,
      { view: 'user-profiles', label: 'Open security management' }
    );
  }

  if (/configure|document hub|template|system config/.test(q)) {
    push(
      'Configure module',
      'System configuration, salary grades, and onboarding document templates live under Configure.',
      undefined,
      { view: 'system-configuration', label: 'System configuration' }
    );
  }

  if (insights.length === 0 && q.length >= 3) {
    push(
      'Try a focused question',
      'Ask about open vacancies, pending approvals, active candidates, hires, time-to-hire, analytics, or security users. Matching names and job titles also appear below.',
      undefined,
      { view: 'recruitment-command-center', label: 'Go to dashboard' }
    );
  }

  return insights.slice(0, 4);
}
