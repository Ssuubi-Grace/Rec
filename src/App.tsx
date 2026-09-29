import React, { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { Header, PortalSessionUser } from './components/layout/Header';
import { SubNavTabs } from './components/layout/SubNavTabs';
import { getSubNavItems, getModuleForView, NAV_MODULES } from './config/navigation';
import { getRoleModules, AppRole, ModuleId } from './config/rolePermissions';
import { FormModal } from './components/ui/FormModal';
import { ActiveView } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { HrmisAuthLanding } from './components/layout/HrmisAuthLanding';

// Views
import { NewStaffRequestsView } from './components/views/NewStaffRequestsView';
import { CreateRequisitionView } from './components/views/CreateRequisitionView';
import { ApplicantsDashboardView } from './components/views/ApplicantsDashboardView';
import { JobApplicantsReportView } from './components/views/JobApplicantsReportView';
import { PreShortlistCandidatesView } from './components/views/PreShortlistCandidatesView';
import { ConfirmedShortlistsView } from './components/views/ConfirmedShortlistsView';
import { FinalInterviewSelectionView } from './components/views/FinalInterviewSelectionView';
import { InterviewBoardScoringView } from './components/views/InterviewBoardScoringView';
import { OfferManagementView } from './components/views/OfferManagementView';
import { DocumentManagementHub } from './components/views/DocumentManagementHub';
import { NewStaffApprovalView } from './components/views/NewStaffApprovalView';
import { NewStaffOrientationView } from './components/views/NewStaffOrientationView';
import { TalentPoolView } from './components/views/TalentPoolView';
import { ApprovalTasksView } from './components/views/ApprovalTasksView';
import { PsychometricSettingsView } from './components/views/PsychometricSettingsView';
import { SystemConfigurationView } from './components/views/SystemConfigurationView';
import { AccountCreationView } from './components/views/AccountCreationView';
import { CandidatePortalView } from './components/views/CandidatePortalView';
import { OtherReportsView } from './components/views/OtherReportsView';
import { RecruitmentCommandCenterView } from './components/views/RecruitmentCommandCenterView';
import { CandidatePipelineView } from './components/views/CandidatePipelineView';
import { CandidateStatusView } from './components/views/CandidateStatusView';

// Modals
import { TestTakerModal } from './components/modals/TestTakerModal';
import { TalentPoolTransferModal } from './components/modals/TalentPoolTransferModal';
import { CommandPaletteModal } from './components/modals/CommandPaletteModal';
import { AttentionCenterDrawer } from './components/modals/AttentionCenterDrawer';

// Initial Data
import { 
  INITIAL_REQUISITIONS, 
  INITIAL_CANDIDATES, 
  INITIAL_TESTS, 
  INITIAL_OFFERS, 
  INITIAL_ONBOARDING_TASKS, 
  INITIAL_APPROVAL_TASKS 
} from './data/mockData';
import { DEFAULT_DOCUMENT_TEMPLATES } from './data/documentTemplatesData';
import { fetchRecruitmentState, persistRecruitmentState } from './api/recruitmentState';
import { Requisition, Candidate, PsychometricTest, OfferLetter, OnboardingTaskItem, ApprovalTask, OnboardingDocumentTemplate } from './types';

const todayDisplay = () => new Date().toLocaleDateString('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric',
}).replace(/ /g, '-');
const defaultDeadlineDisplay = () => new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric',
}).replace(/ /g, '-');

export default function App() {
  // Navigation & Role State
  const [activeView, setActiveView] = useState<ActiveView>('recruitment-command-center');
  const [activeViewParam, setActiveViewParam] = useState<string | undefined>(undefined);
  const [userRole, setUserRole] = useState<'Admin' | 'HR' | 'HOD' | 'Candidate' | 'Panelist'>('Admin');
  const [portalUser, setPortalUser] = useState<PortalSessionUser | null>(null);
  const [portalLogOffSignal, setPortalLogOffSignal] = useState(0);
  const [portalBootScreen, setPortalBootScreen] = useState<'vacancies' | 'signin' | undefined>(undefined);
  const [hrmisSession, setHrmisSession] = useState<PortalSessionUser | null>(null);

  // Modern Drawer / Modal States
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAttentionDrawerOpen, setIsAttentionDrawerOpen] = useState(false);
  const [isFullRequisitionModalOpen, setIsFullRequisitionModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    const allowed = getRoleModules(userRole as AppRole);
    const mod = getModuleForView(activeView);
    if (!allowed.includes(mod.id as ModuleId)) {
      const fallback = NAV_MODULES.find(m => allowed.includes(m.id as ModuleId));
      if (fallback && fallback.views[0]?.id !== activeView) {
        setActiveView(fallback.views[0].id);
      }
    }
  }, [userRole, activeView]);

  const openNewRequisition = () => {
    setSelectedRequisitionForEdit(null);
    setIsFullRequisitionModalOpen(true);
  };

  const handleNavigate = (view: ActiveView, param?: string) => {
    if (view === 'create-requisition') {
      openNewRequisition();
      return;
    }
    if (view === 'candidate-portal') {
      setPortalBootScreen('vacancies');
    }
    setActiveView(view);
    setActiveViewParam(param);
  };

  const enterCareerPortalAsGuest = (boot: 'vacancies' | 'signin' = 'vacancies') => {
    setUserRole('Candidate');
    setHrmisSession({ name: 'Guest', email: '' });
    setPortalUser(null);
    setPortalBootScreen(boot);
    setActiveView('candidate-portal');
  };

  const exitToPublicRecruitLanding = () => {
    setHrmisSession(null);
    setPortalUser(null);
    setPortalBootScreen(undefined);
    setActiveView('recruitment-command-center');
  };

  const isCareerPortalView = activeView === 'candidate-portal';

  // Application Data States
  const [requisitions, setRequisitions] = useState<Requisition[]>(INITIAL_REQUISITIONS);
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [psychometricTests, setPsychometricTests] = useState<PsychometricTest[]>(INITIAL_TESTS);
  const [offers, setOffers] = useState<OfferLetter[]>(INITIAL_OFFERS);
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTaskItem[]>(INITIAL_ONBOARDING_TASKS);
  const [approvalTasks, setApprovalTasks] = useState<ApprovalTask[]>(INITIAL_APPROVAL_TASKS);
  const [documentTemplates, setDocumentTemplates] = useState<OnboardingDocumentTemplate[]>(DEFAULT_DOCUMENT_TEMPLATES);

  const [recruitmentHydrated, setRecruitmentHydrated] = useState(false);
  const [persistError, setPersistError] = useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetchRecruitmentState()
      .then((data) => {
        if (cancelled) return;
        setRequisitions(data.requisitions);
        setCandidates(data.candidates);
        setPsychometricTests(data.psychometricTests);
        setOffers(data.offers);
        setOnboardingTasks(data.onboardingTasks);
        setApprovalTasks(data.approvalTasks);
        setDocumentTemplates(data.documentTemplates);
        setRecruitmentHydrated(true);
      })
      .catch((err) => {
        console.warn('Recruitment data could not be loaded:', err);
        if (!cancelled) setPersistError('Unable to load saved records. Please retry when the server is available.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!recruitmentHydrated) return;
    const timer = window.setTimeout(() => {
      persistRecruitmentState({
        requisitions,
        candidates,
        psychometricTests,
        offers,
        onboardingTasks,
        approvalTasks,
        documentTemplates,
      }).then(() => setPersistError(null))
        .catch(() => setPersistError('Changes could not be saved to the server. Retrying on next edit.'));
    }, 900);
    return () => window.clearTimeout(timer);
  }, [
    recruitmentHydrated,
    requisitions,
    candidates,
    psychometricTests,
    offers,
    onboardingTasks,
    approvalTasks,
    documentTemplates,
  ]);

  // Interaction Modals & Selected Objects
  const [activeTestPlayer, setActiveTestPlayer] = useState<{ test: PsychometricTest; candidate?: Candidate | null } | null>(null);
  const [talentPoolTransferCandidate, setTalentPoolTransferCandidate] = useState<Candidate | null>(null);
  const [selectedCandidateForOffer, setSelectedCandidateForOffer] = useState<Candidate | null>(null);
  const [selectedRequisitionForEdit, setSelectedRequisitionForEdit] = useState<Requisition | null>(null);

  // Handlers: Requisition Management
  const handleSaveRequisition = (newReqData: Partial<Requisition>) => {
    if (newReqData.id) {
      // Update existing
      setRequisitions(prev => prev.map(r => {
        if (r.id === newReqData.id) {
          return {
            ...r,
            ...newReqData,
            status: newReqData.status || r.status,
          } as Requisition;
        }
        return r;
      }));

      // If submitted for approval, create/update an approval task
      if (newReqData.status === 'Pending HR' || newReqData.status === 'Pending Approval') {
        const existingTask = approvalTasks.find(t => t.referenceNo === newReqData.reqNo);
        if (existingTask) {
          setApprovalTasks(prev => prev.map(t => t.id === existingTask.id ? { ...t, status: 'Pending' } : t));
        } else {
          setApprovalTasks(prev => [
            {
              id: `task-req-${Date.now()}`,
              taskType: 'Requisition Approval',
              referenceNo: newReqData.reqNo || `REQ/2026/00${requisitions.length + 1}`,
              title: `Requisition Approval: ${newReqData.position} (${newReqData.department})`,
              submittedBy: newReqData.submittedBy || 'Department Head',
              submittedDate: newReqData.submittedDate || todayDisplay(),
              status: 'Pending',
              assignedTo: newReqData.assignedApprover || 'Sarah Namubiru (HR Director)',
              priority: 'High',
              department: newReqData.department,
              comments: newReqData.approvalRemarks || 'Requisition & JD submitted for governance sign-off.'
            },
            ...prev
          ]);
        }
      }
      return;
    }

    const newReq: Requisition = {
      id: `req-${Date.now()}`,
      reqNo: `REQ/2026/00${requisitions.length + 1}`,
      department: newReqData.department || 'Technology & Systems',
      position: newReqData.position || 'Staff',
      type: newReqData.type || 'Both External and Internal Recruitment',
      category: newReqData.category || 'DIRECT MARKETING',
      salaryScale: newReqData.salaryScale || '5A Administration',
      reportsTo: newReqData.reportsTo || 'General Manager',
      dateOfReporting: newReqData.dateOfReporting || '01 -Oct -2026',
      vacancies: newReqData.vacancies || 1,
      budget: newReqData.budget || '3,500,000',
      currency: newReqData.currency || 'UGX',
      status: newReqData.status || 'Not Submitted',
      stage: newReqData.status === 'Approved' ? 'Shortlisting' : 'Requisition',
      minAge: newReqData.minAge || 21,
      maxAge: newReqData.maxAge || 45,
      educationLevel: newReqData.educationLevel || 'Bachelor Degree',
      minExperience: newReqData.minExperience || 2,
      gender: newReqData.gender || 'Either',
      requirePsychometricTest: newReqData.requirePsychometricTest ?? true,
      description: newReqData.description || 'General duties.',
      advertTemplate: newReqData.advertTemplate,
      rolePurpose: newReqData.rolePurpose || newReqData.description,
      keyResponsibilities: newReqData.keyResponsibilities,
      requiredQualifications: newReqData.requiredQualifications,
      requiredSkills: newReqData.requiredSkills,
      assessmentMethodology: newReqData.assessmentMethodology,
      applicationDeadline: newReqData.applicationDeadline || defaultDeadlineDisplay(),
      createdDate: newReqData.createdDate || todayDisplay(),
      ...newReqData
    };
    setRequisitions(prev => [newReq, ...prev]);

    // If submitted for approval, push to Approval Tasks
    if (newReq.status === 'Pending HR' || newReq.status === 'Pending Approval') {
      setApprovalTasks(prev => [
        {
          id: `task-req-${Date.now()}`,
          taskType: 'Requisition Approval',
          referenceNo: newReq.reqNo,
          title: `Requisition Approval: ${newReq.position} (${newReq.department})`,
          submittedBy: newReq.submittedBy || 'Department Head',
          submittedDate: newReq.submittedDate || todayDisplay(),
          status: 'Pending',
          assignedTo: newReq.assignedApprover || 'Sarah Namubiru (HR Director)',
          priority: 'High',
          department: newReq.department,
          comments: newReq.approvalRemarks || 'Requisition & JD submitted for governance sign-off.'
        },
        ...prev
      ]);
    }
  };

  const handleDeleteRequisition = (id: string) => {
    if (confirm('Are you sure you want to delete this requisition draft?')) {
      setRequisitions(requisitions.filter(r => r.id !== id));
    }
  };

  const handleSubmitRequisitionForApproval = (id: string) => {
    const req = requisitions.find(r => r.id === id);
    setRequisitions(requisitions.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'Pending HR',
          submittedAt: new Date().toISOString(),
          submittedDate: todayDisplay(),
        };
      }
      return r;
    }));

    if (req) {
      setApprovalTasks(prev => [
        {
          id: `task-req-${Date.now()}`,
          taskType: 'Requisition Approval',
          referenceNo: req.reqNo,
          title: `Requisition Approval: ${req.position} (${req.department})`,
          submittedBy: 'Department Head',
          submittedDate: todayDisplay(),
          status: 'Pending',
          assignedTo: req.assignedApprover || 'Sarah Namubiru (HR Director)',
          priority: 'High',
          department: req.department,
          comments: 'Requisition & JD submitted for governance sign-off.'
        },
        ...prev
      ]);
    }
  };

  const handlePublishRequisition = (id: string) => {
    setRequisitions(requisitions.map(r => {
      if (r.id === id) {
        return {
          ...r,
          isPublished: true,
          publishedDate: todayDisplay(),
          status: 'Approved'
        };
      }
      return r;
    }));
  };

  const handleUnpublishRequisition = (id: string) => {
    setRequisitions(requisitions.map(r => {
      if (r.id === id) {
        return {
          ...r,
          isPublished: false
        };
      }
      return r;
    }));
  };

  const handleDuplicateRequisition = (req: Requisition) => {
    const cloned: Requisition = {
      ...req,
      id: `req-${Date.now()}`,
      reqNo: `REQ/2026/00${requisitions.length + 1}`,
      status: 'Not Submitted',
      isPublished: false,
      publishedDate: undefined,
      submittedAt: undefined,
      approvedAt: undefined,
      approvedBy: undefined,
      rejectionReason: undefined,
      revisionNotes: undefined,
    };
    setSelectedRequisitionForEdit(cloned);
    setIsFullRequisitionModalOpen(true);
  };

  const handleWithdrawRequisition = (id: string) => {
    setRequisitions(requisitions.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'Not Submitted'
        };
      }
      return r;
    }));
  };

  const handleApplyJob = (newCandidate: Omit<Candidate, 'id'>) => {
    const existing = candidates.find(c =>
      c.requisitionId === newCandidate.requisitionId &&
      c.email.trim().toLowerCase() === newCandidate.email.trim().toLowerCase()
    );
    if (existing) return existing.id;
    const newId = `c-${Date.now()}`;
    const fullCandidate: Candidate = {
      ...newCandidate,
      id: newId,
    };
    setCandidates(prev => [fullCandidate, ...prev]);
    return newId;
  };

  // Handlers: Candidate Assessment & Shortlisting
  const handleTriggerPsychometricTest = (candidateIds: string[]) => {
    setCandidates(candidates.map(c => {
      if (candidateIds.includes(c.id)) {
        return {
          ...c,
          status: 'Assessment Sent',
          testStatus: 'Pending',
        };
      }
      return c;
    }));
  };

  const handleCompleteTest = (scorePct: number, passStatus: 'Passed' | 'Failed', candidateId?: string) => {
    if (candidateId) {
      setCandidates(candidates.map(c => {
        if (c.id === candidateId) {
          return {
            ...c,
            testStatus: passStatus,
            testScore: scorePct,
            status: passStatus === 'Passed' ? 'Pre-Shortlisted' : 'Rejected',
            testCompletedAt: 'Just now',
          };
        }
        return c;
      }));
    }
  };

  const handleAdvanceToInterview = (candidateId: string) => {
    setCandidates(candidates.map(c => {
      if (c.id === candidateId) {
        return {
          ...c,
          status: 'Interview Scheduled',
          interviewDate: c.interviewDate || '2026-08-28',
          interviewTime: c.interviewTime || '09:30 AM',
          interviewVenue: c.interviewVenue || 'Main Boardroom - Level 4, Head Office, Kampala',
          interviewInvited: true,
          interviewScore: c.interviewScore || 85,
        };
      }
      return c;
    }));
  };

  const handleUpdateCandidateInterviewScore = (candidateId: string, interviewScore: number) => {
    setCandidates(candidates.map(c => {
      if (c.id === candidateId) {
        return {
          ...c,
          interviewScore,
          status: 'Selected',
        };
      }
      return c;
    }));
  };

  // Handlers: Talent Pool Transfer & Re-Engagement
  const handleConfirmTalentPoolTransfer = (candidateId: string, reason: string, notes: string) => {
    setCandidates(candidates.map(c => {
      if (c.id === candidateId) {
        return {
          ...c,
          status: 'Talent Pool',
          talentPoolTag: reason as any,
          talentPoolNotes: notes,
          talentPoolDate: '16-Aug-2026',
        };
      }
      return c;
    }));
  };

  const handleReengageCandidate = (candidateId: string, targetReqId: string) => {
    const targetReq = requisitions.find(r => r.id === targetReqId);
    setCandidates(candidates.map(c => {
      if (c.id === candidateId) {
        return {
          ...c,
          requisitionId: targetReqId,
          position: targetReq ? targetReq.position : c.position,
          status: 'Pre-Shortlisted',
          talentPoolTag: undefined,
        };
      }
      return c;
    }));
  };

  // Decline Candidate Handler
  const handleDeclineCandidate = (candidateId: string, reason: string, message: string, sendEmail: boolean) => {
    setCandidates(candidates.map(c => {
      if (c.id === candidateId) {
        return {
          ...c,
          status: 'Rejected',
          declineReason: reason,
          declineMessage: message,
          declinedDate: '16-Aug-2026',
          declinedStage: 'Pre-Shortlist',
          notifyCandidateByEmail: sendEmail,
        };
      }
      return c;
    }));
  };

  // Shortlist Candidate Handler
  const handleShortlistCandidate = (candidateId: string) => {
    setCandidates(candidates.map(c => {
      if (c.id === candidateId) {
        return {
          ...c,
          status: 'Pre-Shortlisted',
        };
      }
      return c;
    }));
  };

  // Schedule Interview Handler
  const handleScheduleInterview = (candidateId: string, date: string, time: string, venue: string, sendInvite: boolean = true) => {
    setCandidates(candidates.map(c => {
      if (c.id === candidateId) {
        return {
          ...c,
          status: 'Interview Scheduled',
          interviewDate: date,
          interviewTime: time,
          interviewVenue: venue,
          interviewInvited: sendInvite,
          interviewConfirmedByCandidate: false,
        };
      }
      return c;
    }));
  };

  // Batch Invite Interview Handler
  const handleBatchInviteInterview = (invitations: { candidateId: string; date: string; time: string; venue: string }[]) => {
    const ids = invitations.map(i => i.candidateId);
    const invMap = new Map(invitations.map(i => [i.candidateId, i]));
    setCandidates(candidates.map(c => {
      if (ids.includes(c.id)) {
        const inv = invMap.get(c.id);
        return {
          ...c,
          status: 'Interview Scheduled',
          interviewDate: inv?.date || '2026-08-28',
          interviewTime: inv?.time || '09:30 AM',
          interviewVenue: inv?.venue || 'Main Boardroom - Level 4, Head Office, Kampala',
          interviewInvited: true,
          interviewConfirmedByCandidate: false,
        };
      }
      return c;
    }));
  };

  // RSVP Confirmation Handler
  const handleConfirmInterviewRSVP = (candidateId: string) => {
    setCandidates(candidates.map(c => {
      if (c.id === candidateId) {
        return {
          ...c,
          interviewConfirmedByCandidate: true,
        };
      }
      return c;
    }));
  };

  // Save Interview Report Handler
  const handleSaveInterviewReport = (
    reqId: string,
    panelists: { name: string; title: string; remarks: string; fileName?: string }[],
    interviewees: { candidateId: string; interviewDate: string; recommendation: string; selected: boolean }[]
  ) => {
    const selMap = new Map(interviewees.map(i => [i.candidateId, i]));
    setCandidates(candidates.map(c => {
      if (selMap.has(c.id)) {
        const item = selMap.get(c.id)!;
        return {
          ...c,
          interviewDate: item.interviewDate,
          interviewRecommendation: item.recommendation as any,
          status: item.selected ? 'Selected' : item.recommendation === 'Hold For Future Considerations' ? 'Talent Pool' : c.status,
        };
      }
      return c;
    }));
  };

  // Decline Offer Handler
  const handleDeclineOffer = (offerId: string, reason: string) => {
    setOffers(offers.map(o => {
      if (o.id === offerId) {
        return {
          ...o,
          status: 'Declined',
          declineReason: reason,
        };
      }
      return o;
    }));

    const off = offers.find(o => o.id === offerId);
    if (off) {
      setCandidates(candidates.map(c => {
        if (c.id === off.candidateId) {
          return { ...c, status: 'Offer Declined' };
        }
        return c;
      }));
    }
  };

  // Handlers: Offer Letter Management
  const handleIssueOffer = (newOffer: OfferLetter) => {
    setOffers([newOffer, ...offers.filter(o => o.candidateId !== newOffer.candidateId)]);
    setCandidates(candidates.map(c => {
      if (c.id === newOffer.candidateId) {
        return { ...c, status: 'Offer Issued' };
      }
      return c;
    }));
  };

  const handleBatchIssueOffers = (newOffers: OfferLetter[]) => {
    const candidateIds = new Set(newOffers.map(o => o.candidateId));
    setOffers([...newOffers, ...offers.filter(o => !candidateIds.has(o.candidateId))]);
    setCandidates(candidates.map(c => {
      if (candidateIds.has(c.id)) {
        return { ...c, status: 'Offer Issued' };
      }
      return c;
    }));
  };

  const handleAcceptOffer = (offerId: string, signatureName: string) => {
    setOffers(offers.map(o => {
      if (o.id === offerId) {
        return {
          ...o,
          status: 'Accepted',
          signedBy: signatureName,
          signedDate: '16-Aug-2026',
        };
      }
      return o;
    }));

    const off = offers.find(o => o.id === offerId);
    if (off) {
      setCandidates(candidates.map(c => {
        if (c.id === off.candidateId) {
          return { ...c, status: 'Offer Accepted' };
        }
        return c;
      }));
    }
  };

  // Handlers: Orientation & Task Toggle
  const handleToggleOnboardingTask = (taskId: string) => {
    setOnboardingTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const completed = !t.completed;
        return {
          ...t,
          completed,
          status: completed ? 'Completed' : 'Pending',
          completedDate: completed ? new Date().toISOString().slice(0, 10) : undefined,
        };
      }
      return t;
    }));
  };

  const handleActivateStaffProfile = (candidate: Candidate) => {
    setCandidates(candidates.map(c => {
      if (c.id === candidate.id) {
        return { ...c, status: 'Hired' };
      }
      return c;
    }));
  };

  // Handlers: Approval Tasks
  const handleApproveTask = (taskId: string, comments?: string) => {
    const task = approvalTasks.find(t => t.id === taskId);
    setApprovalTasks(approvalTasks.map(t => {
      if (t.id === taskId) {
        return { 
          ...t, 
          status: 'Approved',
          comments: comments || t.comments,
          actionBy: 'Dr. Arthur K. (Managing Director)',
          actionDate: '20-Aug-2026 14:15'
        };
      }
      return t;
    }));

    // Cascade approval to underlying entity
    if (task) {
      if (task.taskType === 'Requisition Approval' || task.referenceNo?.startsWith('REQ')) {
        setRequisitions(requisitions.map(r => {
          if (r.reqNo === task.referenceNo || task.title.toLowerCase().includes(r.position.toLowerCase())) {
            return {
              ...r,
              status: 'Approved',
              approvedBy: 'Dr. Arthur K. (Managing Director)',
              approvedAt: '20-Aug-2026',
              approvalRemarks: comments || 'Approved after executive review.'
            };
          }
          return r;
        }));
      } else if (task.taskType === 'Candidate Offer Approval') {
        setOffers(offers.map(o => {
          if (task.title.toLowerCase().includes(o.candidateName.toLowerCase()) || o.id === task.referenceNo) {
            return {
              ...o,
              status: 'Issued',
              approvedBy: 'Dr. Arthur K. (Managing Director)',
              approvedDate: '20-Aug-2026',
              approvalComments: comments
            };
          }
          return o;
        }));
      }
    }
  };

  const handleRejectTask = (taskId: string, reason: string) => {
    const task = approvalTasks.find(t => t.id === taskId);
    setApprovalTasks(approvalTasks.map(t => {
      if (t.id === taskId) {
        return { 
          ...t, 
          status: 'Rejected',
          rejectionReason: reason,
          actionBy: 'Dr. Arthur K. (Managing Director)',
          actionDate: '20-Aug-2026 14:15'
        };
      }
      return t;
    }));

    // Cascade rejection to underlying entity
    if (task) {
      if (task.taskType === 'Requisition Approval' || task.referenceNo?.startsWith('REQ')) {
        setRequisitions(requisitions.map(r => {
          if (r.reqNo === task.referenceNo || task.title.toLowerCase().includes(r.position.toLowerCase())) {
            return {
              ...r,
              status: 'Rejected',
              rejectionReason: reason
            };
          }
          return r;
        }));
      } else if (task.taskType === 'Candidate Offer Approval') {
        setOffers(offers.map(o => {
          if (task.title.toLowerCase().includes(o.candidateName.toLowerCase()) || o.id === task.referenceNo) {
            return {
              ...o,
              status: 'Rejected',
              rejectionReason: reason
            };
          }
          return o;
        }));
      }
    }
  };

  const handleReturnTask = (taskId: string, revisionNotes: string) => {
    const task = approvalTasks.find(t => t.id === taskId);
    setApprovalTasks(approvalTasks.map(t => {
      if (t.id === taskId) {
        return { 
          ...t, 
          status: 'Returned',
          revisionNotes: revisionNotes,
          actionBy: 'Dr. Arthur K. (Managing Director)',
          actionDate: '20-Aug-2026 14:15'
        };
      }
      return t;
    }));

    // Cascade return to draft/revision queue
    if (task) {
      if (task.taskType === 'Requisition Approval' || task.referenceNo?.startsWith('REQ')) {
        setRequisitions(requisitions.map(r => {
          if (r.reqNo === task.referenceNo || task.title.toLowerCase().includes(r.position.toLowerCase())) {
            return {
              ...r,
              status: 'Returned for Revision',
              revisionNotes: revisionNotes
            };
          }
          return r;
        }));
      } else if (task.taskType === 'Candidate Offer Approval') {
        setOffers(offers.map(o => {
          if (task.title.toLowerCase().includes(o.candidateName.toLowerCase()) || o.id === task.referenceNo) {
            return {
              ...o,
              status: 'Returned for Revision',
              revisionNotes: revisionNotes
            };
          }
          return o;
        }));
      } else if (task.taskType === 'Psychometric Test Approval') {
        setPsychometricTests(psychometricTests.map(t => {
          if (task.title.toLowerCase().includes(t.title.toLowerCase()) || t.id === task.id) {
            return {
              ...t,
              status: 'Needs Revision',
              approvalComments: revisionNotes
            };
          }
          return t;
        }));
      }
    }
  };

  // Handlers: Psychometric Test Bank Save & Delete
  const handleSavePsychometricTest = (updatedTest: PsychometricTest) => {
    const exists = psychometricTests.some(t => t.id === updatedTest.id);
    if (exists) {
      setPsychometricTests(psychometricTests.map(t => t.id === updatedTest.id ? updatedTest : t));
    } else {
      setPsychometricTests([...psychometricTests, updatedTest]);
    }
  };

  const handleApprovePsychometricTest = (testId: string) => {
    setPsychometricTests(psychometricTests.map(t => {
      if (t.id === testId) {
        return {
          ...t,
          status: 'Active',
          approvedBy: 'Dr. Arthur K. (Head of HR / Quality Board)',
          approvedDate: '19-Aug-2026'
        };
      }
      return t;
    }));
  };

  const handleRequestRevisionPsychometricTest = (testId: string, notes: string) => {
    setPsychometricTests(psychometricTests.map(t => {
      if (t.id === testId) {
        return {
          ...t,
          status: 'Needs Revision',
          approvalComments: notes
        };
      }
      return t;
    }));
  };

  const handleDeletePsychometricTest = (testId: string) => {
    setPsychometricTests(psychometricTests.filter(t => t.id !== testId));
  };

  if (!recruitmentHydrated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#f8fafc] text-slate-600">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        <p className="text-sm font-semibold">{persistError || 'Loading ProMISe recruitment data…'}</p>
        {persistError && <button onClick={() => window.location.reload()} className="px-4 py-2 rounded bg-white border">Retry loading records</button>}
      </div>
    );
  }

  if (!hrmisSession) {
    const openRoles = requisitions.filter((r) => r.vacancies > 0);
    const vacancyTotal = openRoles.reduce((s, r) => s + r.vacancies, 0);
    return (
      <HrmisAuthLanding
        featuredVacancies={openRoles.slice(0, 6)}
        openVacancyCount={vacancyTotal}
        onSignIn={(user) => {
          setHrmisSession(user);
          setUserRole('Admin');
          setActiveView('recruitment-command-center');
        }}
        onSignInAsCandidate={() => enterCareerPortalAsGuest('vacancies')}
        onViewAllVacancies={() => enterCareerPortalAsGuest('vacancies')}
        onSignInToTrackApplication={() => enterCareerPortalAsGuest('signin')}
        allVacanciesLabel={`Current Vacancies (${vacancyTotal})`}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#334155] font-sans antialiased flex">
      {!isCareerPortalView && (
      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        pendingApprovalsCount={approvalTasks.filter(t => t.status === 'Pending').length}
        totalCandidatesCount={candidates.length}
        totalRequisitionsCount={requisitions.length}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        userRole={userRole}
        onSwitchRole={(role) => {
          setUserRole(role);
          if (role === 'Candidate') {
            setPortalBootScreen('vacancies');
            setActiveView('candidate-portal');
          }
          if (role === 'Panelist') setActiveView('final-interview');
        }}
        onLogOut={() => {
          exitToPublicRecruitLanding();
        }}
      />
      )}
      <div className="min-w-0 flex-1 flex flex-col">
      {persistError && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs px-4 py-2 text-center">
          {persistError}
        </div>
      )}
      {/* Top Main ProMISe Brand Header with Role Switcher */}
      <Header 
        userRole={userRole} 
        activeView={activeView}
        onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
        pendingTasksCount={approvalTasks.filter(t => t.status === 'Pending').length + 2}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenAttentionCenter={() => setIsAttentionDrawerOpen(true)}
        portalUser={activeView === 'candidate-portal' ? portalUser : null}
        onPortalLogOff={() => setPortalLogOffSignal((n) => n + 1)}
        staffUser={hrmisSession}
        onStaffLogOut={() => {
          if (isCareerPortalView) {
            exitToPublicRecruitLanding();
          } else {
            setHrmisSession(null);
            setPortalUser(null);
          }
        }}
      />

      {!isCareerPortalView && (
      <SubNavTabs
        items={getSubNavItems(activeView, userRole)}
        activeView={activeView}
        onNavigate={handleNavigate}
      />
      )}

      {/* Main Viewport Content Area */}
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 select-text view-shell">
        
        {/* Dashboard */}
        {activeView === 'recruitment-command-center' && (
          <RecruitmentCommandCenterView
            requisitions={requisitions}
            candidates={candidates}
            approvalTasks={approvalTasks}
            userFirstName={
              userRole === 'Candidate' ? 'Robert' :
              userRole === 'Panelist' ? 'Arthur' :
              'Grace'
            }
            onNavigate={(view, param) => handleNavigate(view, param)}
            onOpenNewRequisition={openNewRequisition}
            onOpenFullRequisition={openNewRequisition}
          />
        )}

        {/* 0.5 Modern ATS Candidate Pipeline (Kanban & Table) */}
        {activeView === 'candidate-pipeline' && (
          <CandidatePipelineView
            candidates={candidates}
            requisitions={requisitions}
            onNavigate={(view, param) => handleNavigate(view, param)}
            onUpdateCandidateStatus={(candidateId, newStatus) => {
              setCandidates(candidates.map(c => c.id === candidateId ? { ...c, status: newStatus } : c));
            }}
            onScheduleInterview={(c) => {
              handleScheduleInterview(c.id, '22-Aug-2026', '10:00 AM', 'Boardroom A / Zoom', true);
              handleNavigate('final-interview', c.requisitionId);
            }}
            onSelectCandidateForOffer={(c) => {
              setSelectedCandidateForOffer(c);
              handleNavigate('offer-management');
            }}
            onTransferToTalentPool={(c) => setTalentPoolTransferCandidate(c)}
          />
        )}

        {activeView === 'candidate-status' && (
          <CandidateStatusView
            candidates={candidates}
            requisitions={requisitions}
            offers={offers}
            tests={psychometricTests}
            onNavigate={handleNavigate}
            onUpdateCandidateStatus={(candidateId, newStatus) => {
              setCandidates(candidates.map(c => c.id === candidateId ? { ...c, status: newStatus } : c));
            }}
            onSelectCandidateForOffer={(candidate) => {
              setSelectedCandidateForOffer(candidate);
              handleNavigate('offer-management');
            }}
            onTransferToTalentPool={(candidate) => setTalentPoolTransferCandidate(candidate)}
          />
        )}

        {activeView === 'new-staff-requests' && (
          <NewStaffRequestsView
            requisitions={requisitions}
            onNavigate={setActiveView}
            onOpenFullRequisition={() => {
              setSelectedRequisitionForEdit(null);
              setIsFullRequisitionModalOpen(true);
            }}
            onSelectRequisitionForEdit={(req) => {
              setSelectedRequisitionForEdit(req);
              setIsFullRequisitionModalOpen(true);
            }}
            onDeleteRequisition={handleDeleteRequisition}
            onSubmitRequisitionForApproval={handleSubmitRequisitionForApproval}
            onPublishRequisition={handlePublishRequisition}
            onUnpublishRequisition={handleUnpublishRequisition}
            onDuplicateRequisition={handleDuplicateRequisition}
            onWithdrawRequisition={handleWithdrawRequisition}
          />
        )}

        {activeView === 'approved-requisitions' && (
          <NewStaffRequestsView
            requisitions={requisitions.filter(r => r.status === 'Approved')}
            initialApprovalState="Approved"
            onNavigate={setActiveView}
            onOpenFullRequisition={() => {
              setSelectedRequisitionForEdit(null);
              setIsFullRequisitionModalOpen(true);
            }}
            onSelectRequisitionForEdit={(req) => {
              setSelectedRequisitionForEdit(req);
              setIsFullRequisitionModalOpen(true);
            }}
            onDeleteRequisition={handleDeleteRequisition}
            onSubmitRequisitionForApproval={handleSubmitRequisitionForApproval}
            onPublishRequisition={handlePublishRequisition}
            onUnpublishRequisition={handleUnpublishRequisition}
            onDuplicateRequisition={handleDuplicateRequisition}
            onWithdrawRequisition={handleWithdrawRequisition}
          />
        )}

        {activeView === 'applicant-dashboards' && (
          <ApplicantsDashboardView
            requisitions={requisitions}
            candidates={candidates}
            onNavigate={setActiveView}
          />
        )}

        {activeView === 'job-applicants-report' && (
          <JobApplicantsReportView
            candidates={candidates}
            requisitions={requisitions}
            onNavigate={handleNavigate}
            onSelectCandidate={(c) => {
              setSelectedCandidateForOffer(c);
              handleNavigate('final-interview', c.requisitionId);
            }}
          />
        )}

        {activeView === 'pre-shortlist' && (
          <PreShortlistCandidatesView
            candidates={candidates}
            requisitions={requisitions}
            psychometricTests={psychometricTests}
            onNavigate={handleNavigate}
            onTriggerTest={handleTriggerPsychometricTest}
            onAdvanceToInterview={handleAdvanceToInterview}
            onTransferToTalentPool={(c) => setTalentPoolTransferCandidate(c)}
            onTakeTestAsCandidate={(c) => setActiveTestPlayer({ test: psychometricTests[0], candidate: c })}
            onDeclineCandidate={handleDeclineCandidate}
            onShortlistCandidate={handleShortlistCandidate}
          />
        )}

        {activeView === 'confirmed-shortlists' && (
          <ConfirmedShortlistsView
            candidates={candidates}
            requisitions={requisitions}
            targetRequisitionId={activeViewParam}
            onNavigate={handleNavigate}
            onAdvanceToInterview={handleAdvanceToInterview}
            onTransferToTalentPool={(c) => setTalentPoolTransferCandidate(c)}
            onScheduleInterview={handleScheduleInterview}
            onBatchInviteInterview={handleBatchInviteInterview}
          />
        )}

        {activeView === 'final-interview' && (
          <InterviewBoardScoringView
            candidates={candidates}
            requisitions={requisitions}
            targetRequisitionId={activeViewParam}
            onNavigate={handleNavigate}
            onUpdateCandidateScore={handleUpdateCandidateInterviewScore}
          />
        )}

        {activeView === 'selected-candidates' && (
          <FinalInterviewSelectionView
            candidates={candidates}
            requisitions={requisitions}
            targetRequisitionId={activeViewParam}
            onNavigate={handleNavigate}
            onSelectCandidateForOffer={(c) => {
              setSelectedCandidateForOffer(c);
              handleNavigate('offer-management');
            }}
            onTransferToTalentPool={(c) => setTalentPoolTransferCandidate(c)}
            onUpdateCandidateScore={handleUpdateCandidateInterviewScore}
            onSaveInterviewReport={handleSaveInterviewReport}
          />
        )}

        {activeView === 'offer-management' && (
          <OfferManagementView
            candidates={candidates}
            offers={offers}
            selectedCandidateForOffer={selectedCandidateForOffer}
            documentTemplates={documentTemplates}
            onUpdateTemplates={(newT) => setDocumentTemplates(newT)}
            onNavigate={setActiveView}
            onIssueOffer={handleIssueOffer}
            onBatchIssueOffers={handleBatchIssueOffers}
            onAcceptOffer={handleAcceptOffer}
          />
        )}

        {activeView === 'document-management' && (
          <DocumentManagementHub
            hubMode="templates"
            documentTemplates={documentTemplates}
            templates={documentTemplates}
            candidates={candidates}
            offers={offers}
            requisitions={requisitions}
            onUpdateTemplates={(updatedList) => setDocumentTemplates(updatedList)}
            onUpdateTemplate={(updated) => {
              setDocumentTemplates(documentTemplates.map(t => t.id === updated.id ? updated : t));
            }}
            onNavigate={setActiveView}
          />
        )}

        {activeView === 'candidate-document-status' && (
          <DocumentManagementHub
            hubMode="candidate_tracker"
            documentTemplates={documentTemplates}
            templates={documentTemplates}
            candidates={candidates}
            offers={offers}
            requisitions={requisitions}
            onUpdateTemplates={(updatedList) => setDocumentTemplates(updatedList)}
            onNavigate={setActiveView}
            onNavigateToOffers={() => setActiveView('offer-management')}
            onPreviewCandidatePortal={(cand) => {
              setSelectedCandidateForOffer(cand);
              setActiveView('candidate-portal');
            }}
          />
        )}

        {activeView === 'system-configuration' && (
          <SystemConfigurationView
            initialTab={(activeViewParam as any) || 'salary_grades'}
            onNavigate={setActiveView}
          />
        )}

        {activeView === 'new-staff-approval' && (
          <NewStaffApprovalView
            candidates={candidates}
            approvalTasks={approvalTasks}
            psychometricTests={psychometricTests}
            requisitions={requisitions}
            offers={offers}
            onApproveTask={handleApproveTask}
            onRejectTask={handleRejectTask}
            onReturnTask={handleReturnTask}
            onApprovePsychometricTest={handleApprovePsychometricTest}
            onRequestRevisionPsychometricTest={handleRequestRevisionPsychometricTest}
            onLaunchTestPlayer={(test) => setActiveTestPlayer({ test })}
            onNavigate={setActiveView}
          />
        )}

        {activeView === 'new-staff-orientation' && (
          <NewStaffOrientationView
            candidates={candidates}
            onboardingTasks={onboardingTasks}
            onToggleTask={handleToggleOnboardingTask}
            onSaveTasks={(tasks) => setOnboardingTasks(prev => [...prev.filter(t => !tasks.some(updated => updated.id === t.id)), ...tasks])}
            onActivateStaffProfile={handleActivateStaffProfile}
            onNavigate={setActiveView}
          />
        )}

        {activeView === 'talent-pool' && (
          <TalentPoolView
            candidates={candidates}
            requisitions={requisitions}
            onReengageCandidate={handleReengageCandidate}
            onNavigate={setActiveView}
          />
        )}

        {activeView === 'approval-tasks' && (
          <ApprovalTasksView
            approvalTasks={approvalTasks}
            requisitions={requisitions}
            offers={offers}
            psychometricTests={psychometricTests}
            candidates={candidates}
            onApproveTask={handleApproveTask}
            onRejectTask={handleRejectTask}
            onReturnTask={handleReturnTask}
            onNavigate={setActiveView}
          />
        )}

        {activeView === 'psychometric-settings' && (
          <PsychometricSettingsView
            tests={psychometricTests}
            requisitions={requisitions}
            onSaveTest={handleSavePsychometricTest}
            onDeleteTest={handleDeletePsychometricTest}
            onLaunchTestPlayer={(test) => setActiveTestPlayer({ test })}
          />
        )}

        {activeView === 'user-profiles' && (
          <AccountCreationView
            onNavigate={setActiveView}
          />
        )}

        {activeView === 'candidate-portal' && (
          <CandidatePortalView
            candidates={candidates}
            offers={offers}
            tests={psychometricTests}
            requisitions={requisitions}
            onboardingTasks={onboardingTasks}
            onToggleTask={handleToggleOnboardingTask}
            onTakeTest={(c) => setActiveTestPlayer({ test: psychometricTests[0], candidate: c })}
            onViewOffer={(c) => {
              setSelectedCandidateForOffer(c);
              setActiveView('offer-management');
            }}
            onNavigate={setActiveView}
            onAcceptOffer={handleAcceptOffer}
            onDeclineOffer={handleDeclineOffer}
            onConfirmInterviewRSVP={handleConfirmInterviewRSVP}
            onApplyJob={handleApplyJob}
            logOffSignal={portalLogOffSignal}
            onAuthChange={setPortalUser}
            bootScreen={portalBootScreen}
            onBootScreenApplied={() => setPortalBootScreen(undefined)}
            onExitToPublicLanding={exitToPublicRecruitLanding}
          />
        )}

        {[
          'vacancy-analysis-report',
          'recruitment-funnel-report',
          'positions-advertised-report',
          'positions-advertised',
          'interview-board-report',
          'interview-board',
          'psychometric-analytics-report',
          'psychometric-analytics',
          'budget-utilization-report',
          'offer-onboarding-report',
          'offer-onboarding',
          'time-to-hire-report',
          'recruitment-velocity-report',
          'recruited-by-vote-report',
          'approval-bottlenecks-report',
          'grade-readiness-report',
          'eeo-diversity-report',
          'eeo-diversity',
          'talent-pool-analytics-report',
          'talent-pool-analytics',
          'requisition-pipeline-report',
          'requisition-pipeline'
        ].includes(activeView) && (
          <OtherReportsView
            reportType={
              activeView.includes('vacancy') ? 'vacancy-analysis' :
              activeView.includes('funnel') ? 'recruitment-funnel' :
              activeView.includes('advertised') ? 'positions-advertised' :
              activeView.includes('interview') ? 'interview-board' :
              activeView.includes('psychometric') ? 'psychometric-analytics' :
              activeView.includes('budget') ? 'budget-utilization' :
              activeView.includes('offer') || activeView.includes('onboarding') ? 'offer-onboarding' :
              activeView.includes('time') || activeView.includes('hire') || activeView.includes('velocity') ? 'time-to-hire' :
              activeView.includes('vote') ? 'recruited-by-vote' :
              activeView.includes('bottleneck') ? 'approval-bottlenecks' :
              activeView.includes('grade') ? 'grade-readiness' :
              activeView.includes('eeo') || activeView.includes('diversity') ? 'eeo-diversity' :
              activeView.includes('pool') ? 'talent-pool-analytics' :
              'vacancy-analysis'
            }
            requisitions={requisitions}
            candidates={candidates}
            tests={psychometricTests}
            onNavigateToCandidate={(cId) => setActiveView('confirmed-shortlists')}
            onNavigateToRequisition={(rId) => setActiveView('new-staff-requests')}
          />
        )}

      </main>

      {/* Global Interactive Modals */}
      {/* 1. Global Fast Command Palette (Ctrl+K / ⌘K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        candidates={candidates}
        requisitions={requisitions}
        approvalTasks={approvalTasks}
        onNavigate={(view, param) => handleNavigate(view, param)}
        onOpenNewRequisition={() => {
          setIsCommandPaletteOpen(false);
          openNewRequisition();
        }}
        onSelectCandidate={(c) => {
          setIsCommandPaletteOpen(false);
          setSelectedCandidateForOffer(c);
          handleNavigate('candidate-pipeline');
        }}
      />

      {/* 2. Global Attention Center (Drawer) */}
      <AttentionCenterDrawer
        isOpen={isAttentionDrawerOpen}
        onClose={() => setIsAttentionDrawerOpen(false)}
        approvalTasks={approvalTasks}
        candidates={candidates}
        requisitions={requisitions}
        onNavigate={(view, param) => handleNavigate(view, param)}
      />

      {/* Full Requisition Form Modal */}
      <FormModal
        isOpen={isFullRequisitionModalOpen}
        onClose={() => {
          setIsFullRequisitionModalOpen(false);
          setSelectedRequisitionForEdit(null);
        }}
        title="Staff Requisition Wizard"
        subtitle="ProMISe ERP · Promise Recruitment · Unified 6-Step Flow"
        maxWidth="3xl"
      >
        <CreateRequisitionView
          key={selectedRequisitionForEdit?.id ?? (isFullRequisitionModalOpen ? 'new' : 'closed')}
          embedded
          onClose={() => {
            setIsFullRequisitionModalOpen(false);
            setSelectedRequisitionForEdit(null);
          }}
          onNavigate={handleNavigate}
          onSaveRequisition={(data) => {
            handleSaveRequisition(data);
            setIsFullRequisitionModalOpen(false);
            setSelectedRequisitionForEdit(null);
          }}
          initialData={selectedRequisitionForEdit}
        />
      </FormModal>

      {activeTestPlayer && (
        <TestTakerModal
          test={activeTestPlayer.test}
          candidate={activeTestPlayer.candidate}
          onClose={() => setActiveTestPlayer(null)}
          onCompleteTest={(score, status, cId) => handleCompleteTest(score, status, cId)}
        />
      )}

      {talentPoolTransferCandidate && (
        <TalentPoolTransferModal
          candidate={talentPoolTransferCandidate}
          onClose={() => setTalentPoolTransferCandidate(null)}
          onConfirmTransfer={handleConfirmTalentPoolTransfer}
        />
      )}

      {/* Professional System Footer */}
      <footer className="bg-white border-t border-[#cbd5e1] py-3 px-6 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            ProMISe ERP · Promise Recruitment · HRMIS Staff Requisition Module • <strong className="text-gray-700">DataCare Uganda Limited</strong>
          </div>
          <div className="flex items-center gap-3">
            <span>Enterprise Release v4.8.2</span>
            <span>•</span>
            <span>Secure Role-Based Session</span>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
