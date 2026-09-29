import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  User, 
  CheckCircle2, 
  Clock, 
  BrainCircuit, 
  FileText, 
  Award, 
  ShieldCheck, 
  Play, 
  Send, 
  ChevronRight,
  ChevronDown,
  PenTool,
  Upload,
  Calendar,
  MapPin,
  Ban,
  AlertCircle,
  Mail,
  Download,
  Printer,
  X,
  Check,
  HelpCircle,
  Briefcase,
  Search,
  Filter,
  Globe,
  GraduationCap,
  Layers,
  FileCheck,
  CheckCircle,
  DollarSign,
  ArrowRight,
  UserPlus,
  Eye,
  FileCode,
  Share2,
  Bookmark,
  LogIn,
  LogOut,
  RotateCcw,
  Lock,
  Phone,
  Plus,
  Trash2,
  ArrowLeft,
  ChevronLeft,
  Info,
  Save
} from 'lucide-react';
import { Candidate, OfferLetter, PsychometricTest, Requisition, CandidateProfile, OnboardingTaskItem } from '../../types';
import { ActiveView } from '../layout/Navbar';
import { DEPARTMENTS, EDUCATION_LEVELS, CURRENCIES } from '../../data/mockData';
import { CandidateOnboardingHub } from '../candidate/CandidateOnboardingHub';
import { CandidateSignInCard } from '../candidate/CandidateSignInCard';
import { PortalSessionUser } from '../layout/Header';
import { FormModal } from '../ui/FormModal';
import { RequisitionStepper } from '../ui/RequisitionStepper';
import { WizardModalFooter } from '../ui/WizardModalFooter';

const PROFILE_TABS = ['personal', 'education', 'employment', 'competence', 'references', 'documents'] as const;
type ProfileTab = typeof PROFILE_TABS[number];

const PROFILE_WIZARD_STEPS = [
  { num: 1, label: "User's Profile Information", shortLabel: 'Profile' },
  { num: 2, label: 'Education Background', shortLabel: 'Education' },
  { num: 3, label: 'Employment History', shortLabel: 'Employment' },
  { num: 4, label: 'Competence Profile', shortLabel: 'Competence' },
  { num: 5, label: 'References & Availability', shortLabel: 'References' },
  { num: 6, label: 'Supporting Documents', shortLabel: 'Documents' },
];

interface CandidatePortalViewProps {
  candidates: Candidate[];
  offers: OfferLetter[];
  tests: PsychometricTest[];
  requisitions?: Requisition[];
  onboardingTasks?: OnboardingTaskItem[];
  onToggleTask?: (taskId: string) => void;
  onTakeTest: (candidate: Candidate) => void;
  onViewOffer: (candidate: Candidate) => void;
  onNavigate: (view: ActiveView) => void;
  onAcceptOffer?: (offerId: string, signatureName: string) => void;
  onDeclineOffer?: (offerId: string, reason: string) => void;
  onConfirmInterviewRSVP?: (candidateId: string) => void;
  onApplyJob?: (candidate: Omit<Candidate, 'id'>) => string;
  logOffSignal?: number;
  onAuthChange?: (user: PortalSessionUser | null) => void;
  bootScreen?: 'vacancies' | 'signin';
  onBootScreenApplied?: () => void;
  onExitToPublicLanding?: () => void;
}

export const CandidatePortalView: React.FC<CandidatePortalViewProps> = ({
  candidates,
  offers,
  tests,
  requisitions = [],
  onboardingTasks = [],
  onToggleTask,
  onTakeTest,
  onViewOffer,
  onNavigate,
  onAcceptOffer,
  onDeclineOffer,
  onConfirmInterviewRSVP,
  onApplyJob,
  logOffSignal = 0,
  onAuthChange,
  bootScreen,
  onBootScreenApplied,
  onExitToPublicLanding,
}) => {
  // Navigation Phases:
  // 'vacancies' | 'register' | 'profile' | 'apply_review' | 'my_applications' | 'induction_docs'
  const [currentScreen, setCurrentScreen] = useState<
    'vacancies' | 'register' | 'profile' | 'apply_review' | 'my_applications' | 'induction_docs'
  >('vacancies');

  const [showCandidateSignInModal, setShowCandidateSignInModal] = useState(false);
  const [signInIntent, setSignInIntent] = useState<'default' | 'track'>('default');

  useEffect(() => {
    if (!bootScreen) return;
    if (bootScreen === 'vacancies') {
      setCurrentScreen('vacancies');
    }
    if (bootScreen === 'signin') {
      setCurrentScreen('vacancies');
      setSignInIntent('track');
      setShowCandidateSignInModal(true);
    }
    onBootScreenApplied?.();
  }, [bootScreen, onBootScreenApplied]);

  // Authenticated Candidate User State (guest until sign-in)
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Registration form state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);

  // Auth prompt when applying or viewing a job (uses Candidate sign-in card)
  const [jobToApplyAfterAuth, setJobToApplyAfterAuth] = useState<Requisition | null>(null);

  // Job Advert Full Modal (Terms of Reference)
  const [selectedJobForAdvertModal, setSelectedJobForAdvertModal] = useState<Requisition | null>(null);

  // Job being applied to during Apply Review
  const [activeApplyingJob, setActiveApplyingJob] = useState<Requisition | null>(null);

  // Vacancy board filtering state
  const [vacancySearch, setVacancySearch] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterEmploymentType, setFilterEmploymentType] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterClosing, setFilterClosing] = useState<'all' | '30d' | '90d'>('all');
  const [filterAccordionOpen, setFilterAccordionOpen] = useState(false);

  // Profile wizard step (1–6) — drives tab content inside modal
  const [profileStep, setProfileStep] = useState(1);
  const activeProfileTab: ProfileTab = PROFILE_TABS[profileStep - 1] ?? 'personal';

  // Comprehensive Profile Form Data matching Screen 6
  const [profileData, setProfileData] = useState<CandidateProfile>({
    firstName: 'Robert',
    lastName: 'Kintu',
    middleNameInitial: 'M.',
    email: 'robert.kintu@gmail.com',
    phone: '702112233',
    homePhone: '0414223344',
    phoneCountryCode: '256',
    dateOfBirth: '1996-05-14',
    countryOfOrigin: 'Uganda',
    nationality: 'Ugandan',
    gender: 'Male',
    maritalStatus: 'Single',
    city: 'Kampala',
    hasDisability: false,
    disabilityDetails: '',
    nationalId: 'CM96023412X98A',

    educationHistory: [
      {
        institutionName: 'Makerere University Kampala',
        address: 'P.O Box 7062, Kampala, Uganda',
        qualificationAttained: 'Bachelor of Science in Computer Science',
        educationLevel: 'Bachelor Degree',
        startDate: '2016-08-15',
        endDate: '2020-05-20'
      }
    ],

    employmentHistory: [
      {
        nameOfOrganisation: 'FinTech Innovations East Africa Ltd',
        jobTitle: 'Associate Software Developer',
        fromDate: '2021-02-01',
        toDate: '2024-06-30',
        reasonForLeaving: 'Career advancement and enterprise systems focus'
      }
    ],

    minSalaryExpectation: '4,000,000',
    maxSalaryExpectation: '6,000,000',
    salaryCurrency: 'UGX',
    yearsOfExperience: 3,
    relevantExperience: 'Experienced in developing scalable RESTful web APIs, relational database optimization (PostgreSQL), and modern frontends using React and TypeScript.',
    languages: [
      { language: 'English', readingProficiency: 'Fluent', speakingProficiency: 'Fluent' },
      { language: 'Luganda', readingProficiency: 'Fluent', speakingProficiency: 'Fluent' },
      { language: 'Swahili', readingProficiency: 'Basic', speakingProficiency: 'Good' }
    ],
    skills: ['TypeScript / React', 'Node.js & Express', 'PostgreSQL & SQL Tuning', 'RESTful API Architecture', 'Git & CI/CD Pipelines'],
    interestsAndHobbies: ['Open-source software contributing', 'Chess & Strategy Games', 'Data Analytics & AI Hackathons'],

    noticePeriodMonths: '1 Month',
    howDidYouLearnAboutJob: 'DataCare Careers Website / ProMISe Portal',
    availableIn: 'Immediately upon offer confirmation',
    referees: [
      {
        name: 'Dr. Michael Sserwadda',
        position: 'Dean, School of Computing - Makerere University',
        relationship: 'Academic Supervisor',
        phone: '+256 772 345678',
        email: 'msserwadda@cis.mak.ac.ug'
      },
      {
        name: 'Eng. Patrick Mukasa',
        position: 'Lead Architect - FinTech Innovations Ltd',
        relationship: 'Former Team Lead',
        phone: '+256 701 987654',
        email: 'pmukasa@fintech.co.ug'
      },
      {
        name: 'Grace Kyomugisha',
        position: 'Senior Operations Director - DataCare Alumni',
        relationship: 'Professional Mentor',
        phone: '+256 782 112233',
        email: 'gkyomugisha@datacare.co.ug'
      }
    ],

    documents: [
      { type: 'Curriculum Vitae (CV)', description: 'Updated Professional CV 2026', fileName: 'Robert_Kintu_Resume_2026.pdf' },
      { type: 'Cover Letter', description: 'Personalized Application Letter', fileName: 'Cover_Letter_DataCare.pdf' },
      { type: 'Academic Certificates', description: 'Certified Degree Transcript & Certificate', fileName: 'Makerere_BSc_Transcript.pdf' },
      { type: 'National ID', description: 'Uganda National ID Card Scan', fileName: 'National_ID_Scan.pdf' }
    ],

    isCompleted: true,
    completionPercentage: 100
  });

  // Offer letter & tracker state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedOfferForModal, setSelectedOfferForModal] = useState<OfferLetter | null>(null);
  const [signatureName, setSignatureName] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [portalNotification, setPortalNotification] = useState<string | null>(null);

  const liveVacancies = requisitions.filter(r => r.isPublished ?? r.status === 'Approved');
  const featuredVacancies = liveVacancies.slice(0, 3);

  const vacancyFilterOptions = useMemo(() => {
    const departments = [...new Set(liveVacancies.map((r) => r.department).filter(Boolean))].sort();
    const types = [...new Set(liveVacancies.map((r) => r.type).filter(Boolean))].sort();
    const regions = [
      ...new Set(
        liveVacancies.map((r) => r.region || r.county || '').filter(Boolean)
      ),
    ].sort();
    return { departments, types, regions };
  }, [liveVacancies]);

  const parseVacancyDeadline = (req: Requisition): Date | null => {
    const raw = req.applicationDeadline || req.dateOfReporting;
    if (!raw) return null;
    const iso = Date.parse(raw);
    if (!Number.isNaN(iso)) return new Date(iso);
    const cleaned = raw.replace(/\s+/g, ' ').trim();
    const d = new Date(cleaned);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const resetVacancyFilters = () => {
    setVacancySearch('');
    setFilterDepartment('');
    setFilterEmploymentType('');
    setFilterRegion('');
    setFilterClosing('all');
  };

  // Calculate published vacancies directly from props (only shows approved/published vacancies on public portal)
  const publishedVacancies = requisitions.filter(r => {
    const isLive = r.isPublished ?? (r.status === 'Approved');
    if (!isLive) return false;

    if (filterDepartment && r.department !== filterDepartment) return false;
    if (filterEmploymentType && r.type !== filterEmploymentType) return false;
    if (filterRegion) {
      const loc = r.region || r.county || '';
      if (loc !== filterRegion) return false;
    }

    if (filterClosing !== 'all') {
      const deadline = parseVacancyDeadline(r);
      if (!deadline) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const limit = new Date(today);
      limit.setDate(limit.getDate() + (filterClosing === '30d' ? 30 : 90));
      if (deadline < today || deadline > limit) return false;
    }

    if (vacancySearch.trim()) {
      const q = vacancySearch.toLowerCase();
      return (
        r.position.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.reqNo.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
      );
    }
    return true;
  });
  const logOffSignalRef = useRef(logOffSignal);

  useEffect(() => {
    onAuthChange?.(currentUser);
  }, [currentUser, onAuthChange]);

  // Calculate Candidate Applications matching current user
  const matchingUserApplications = candidates.filter(c => {
    if (!currentUser) return false;
    const identity = (value: string) => value.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const userTokens = [identity(currentUser.email), identity(currentUser.name)].filter(Boolean);
    const candidateTokens = [identity(c.email), identity(c.name)].filter(Boolean);
    return userTokens.some(token => candidateTokens.includes(token));
  });
  const userApplications = matchingUserApplications.filter((candidate, index, list) =>
    list.findIndex(item => item.requisitionId === candidate.requisitionId) === index
  );

  const openCandidateSignIn = (intent: 'default' | 'track' = 'default') => {
    setSignInIntent(intent);
    setShowCandidateSignInModal(true);
  };

  const promptAuthForJob = (job: Requisition) => {
    setJobToApplyAfterAuth(job);
    setSignInIntent('default');
    setShowCandidateSignInModal(true);
  };

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      alert('Please enter your email or username.');
      return;
    }
    const name = loginEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase());
    const user = { email: loginEmail.trim(), name };
    setCurrentUser(user);
    onAuthChange?.(user);
    setShowCandidateSignInModal(false);
    setPortalNotification(`✓ Welcome back, ${name}!`);
    setTimeout(() => setPortalNotification(null), 4000);

    if (jobToApplyAfterAuth) {
      setActiveApplyingJob(jobToApplyAfterAuth);
      setJobToApplyAfterAuth(null);
      if (!profileData.isCompleted) {
        setCurrentScreen('profile');
      } else {
        setCurrentScreen('apply_review');
      }
    } else if (signInIntent === 'track') {
      setSignInIntent('default');
      setCurrentScreen('my_applications');
    } else {
      setCurrentScreen('vacancies');
    }
  };

  // Handle Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail.trim() || !regPassword.trim()) {
      alert('Please fill out email and password.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      alert('Passwords do not match. Please re-enter.');
      return;
    }

    const name = regEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase());
    const user = { email: regEmail.trim(), name };
    setCurrentUser(user);
    onAuthChange?.(user);
    setProfileData(prev => ({ ...prev, email: regEmail.trim(), firstName: name.split(' ')[0] || 'Applicant' }));
    
    setRegSuccessMsg('Success: You have successfully registered. You can now create your profile and apply.');
    setTimeout(() => {
      setRegSuccessMsg(null);
      if (jobToApplyAfterAuth) {
        setActiveApplyingJob(jobToApplyAfterAuth);
        setJobToApplyAfterAuth(null);
        setCurrentScreen('profile');
      } else {
        setCurrentScreen('profile');
      }
    }, 1200);
  };

  // Handle Log off — return to ProMISe Recruit public landing
  const handleLogOff = () => {
    setCurrentUser(null);
    setLoginEmail('');
    setLoginPassword('');
    setRememberMe(false);
    setActiveApplyingJob(null);
    setJobToApplyAfterAuth(null);
    setShowCandidateSignInModal(false);
    setSignInIntent('default');
    onAuthChange?.(null);
    onExitToPublicLanding?.();
  };

  useEffect(() => {
    if (logOffSignal > logOffSignalRef.current) {
      logOffSignalRef.current = logOffSignal;
      handleLogOff();
    }
  }, [logOffSignal]);

  // Handle clicking "Apply" on a vacancy
  const handleApplyClick = (job: Requisition) => {
    if (!currentUser) {
      promptAuthForJob(job);
      return;
    }

    setActiveApplyingJob(job);
    if (!profileData.isCompleted) {
      setCurrentScreen('profile');
    } else {
      setCurrentScreen('apply_review');
    }
  };

  const handleViewJobPost = (job: Requisition) => {
    if (!currentUser) {
      promptAuthForJob(job);
      return;
    }
    setSelectedJobForAdvertModal(job);
  };

  // Handle Final Submission of Application (Screen 7)
  const handleFinalSubmitApplication = () => {
    if (!activeApplyingJob) return;

    const applicantEmail = currentUser?.email.includes('@') ? currentUser.email : profileData.email;
    const alreadySubmitted = candidates.some(c =>
      c.requisitionId === activeApplyingJob.id &&
      c.email.trim().toLowerCase() === applicantEmail.trim().toLowerCase()
    );

    const newCandidateData: Omit<Candidate, 'id'> = {
      name: `${profileData.firstName} ${profileData.lastName}`,
      email: applicantEmail,
      phone: profileData.phone,
      countryCode: profileData.phoneCountryCode || '256',
      nationalId: profileData.nationalId || 'CM96023412X98A',
      age: 28,
      gender: profileData.gender,
      region: 'Central Region',
      county: profileData.city || 'Kampala',
      department: activeApplyingJob.department,
      position: activeApplyingJob.position,
      requisitionId: activeApplyingJob.id,
      educationLevel: profileData.educationHistory?.[0]?.educationLevel || 'Bachelor Degree',
      institution: profileData.educationHistory?.[0]?.institutionName || 'Makerere University',
      fieldOfStudy: profileData.educationHistory?.[0]?.qualificationAttained || 'Computer Science',
      yearsOfExperience: profileData.yearsOfExperience || 3,
      previousEmployer: profileData.employmentHistory?.[0]?.nameOfOrganisation || 'FinTech Ltd',
      skills: profileData.skills || ['Full-Stack Development', 'PostgreSQL'],
      employmentHistory: `${profileData.employmentHistory?.[0]?.jobTitle} at ${profileData.employmentHistory?.[0]?.nameOfOrganisation}`,
      coverLetter: profileData.relevantExperience || 'Application for ' + activeApplyingJob.position,
      appliedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
      status: 'Applied',
      matchScore: 88,
      resumeUrl: profileData.documents?.[0]?.fileName || 'Resume_2026.pdf',
      testStatus: 'Pending',
      notes: 'Submitted via ProMISe Online Career Portal.'
    };

    if (onApplyJob && !alreadySubmitted) {
      onApplyJob(newCandidateData);
    }

    setPortalNotification(alreadySubmitted
      ? `Your application for "${activeApplyingJob.position}" was already submitted and is shown under My Applications.`
      : `✓ Congratulations! Your application for "${activeApplyingJob.position}" has been submitted successfully.`);
    setTimeout(() => setPortalNotification(null), 5000);
    setCurrentScreen('my_applications');
  };

  // Download Job Advert document
  const handleDownloadJobAdvertText = (req: Requisition) => {
    const advertText = `
================================================================================
                    DATACARE UGANDA LIMITED
          DIRECTORATE OF HUMAN CAPITAL & TALENT ACQUISITION
                 OFFICIAL JOB ADVERT & TERMS OF REFERENCE
================================================================================

1. POSITION IDENTIFICATION
--------------------------------------------------------------------------------
Position Title:          ${req.position}
Requisition Number:      ${req.reqNo}
Department:              ${req.department}
Category:                ${req.category || 'Direct Corporate Operations'}
Reports To:              ${req.reportsTo || 'Head of Department / Director'}
Salary Scale / Band:     ${req.salaryScale || 'Scale 5A'}
Available Openings:      ${req.vacancies} Position(s)
Position Budget:         ${req.currency || 'UGX'} ${req.budget}
Date of Commencement:    ${req.dateOfReporting || 'Immediate / Next Quarter'}
Application Deadline:    ${req.applicationDeadline || 'Not specified'}
Duty Station:            Plot 14, Lumumba Avenue, Kampala, Uganda (Head Office)

2. ROLE PURPOSE & STRATEGIC MISSION
--------------------------------------------------------------------------------
${req.rolePurpose || req.description || 'Drive operational excellence, formulate technical strategies, maintain enterprise architectures, and collaborate across multidisciplinary units to support corporate objectives.'}

3. KEY DUTIES & CORE RESPONSIBILITIES
--------------------------------------------------------------------------------
${req.keyResponsibilities ? req.keyResponsibilities.map(r => `• ${r}`).join('\n') : `• Lead design, implementation, and maintenance of strategic departmental deliverables.\n• Establish standard operating procedures (SOPs) ensuring full regulatory compliance.\n• Prepare periodic analytics, risk assessments, and executive performance briefing documents.\n• Coach and mentor associate staff, fostering a culture of innovation and high integrity.`}

4. MINIMUM ACADEMIC QUALIFICATIONS & EXPERIENCE
--------------------------------------------------------------------------------
${req.requiredQualifications ? req.requiredQualifications.map(q => `• ${q}`).join('\n') : `• Academic Level: ${req.educationLevel || 'Bachelor Degree'} in relevant discipline.\n• Work Experience: Minimum of ${req.minExperience || 2} years of relevant professional experience.\n• Age Requirements: ${req.minAge || 21} to ${req.maxAge || 45} years of age.`}

5. ESSENTIAL COMPETENCIES & TECHNICAL SKILLS
--------------------------------------------------------------------------------
${req.requiredSkills ? req.requiredSkills.map(s => `• ${s}`).join('\n') : `• Demonstrated competence in enterprise systems, analytical methods, and agile execution.\n• Problem-solving, stakeholder communication, and high professional integrity.`}

6. SELECTION PROCESS & TESTING NOTICE
--------------------------------------------------------------------------------
• Assessment Methodology: ${req.assessmentMethodology || 'Stage 1: Pre-screening; Stage 2: Psychometrics; Stage 3: Panel Interview'}
• Psychometric Assessment: ${req.requirePsychometricTest ? 'Mandatory standardized psychometric & cognitive test required.' : 'Not required for this category.'}
• Panel Interview Board: Structured competency interview and board evaluation.

================================================================================
Official Notice • Equal Opportunity Employer • careers@datacare.co.ug
Apply Online via ProMISe ERP: https://datacare.co.ug/careers
================================================================================
`.trim();

    const blob = new Blob([advertText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Job_Advert_${req.reqNo}_${req.position.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setPortalNotification(`✓ Job Advert for "${req.position}" downloaded.`);
    setTimeout(() => setPortalNotification(null), 3000);
  };

  // Active Offer logic for e-signing
  const activeOffer = offers.find(o => o.candidateId === 'c1') || offers[0];

  const handleDownloadFullOfferLetter = (offer: OfferLetter) => {
    const offerDoc = `
================================================================================
                           DATACARE UGANDA LIMITED
        Plot 14 Lumumba Avenue, Kampala • P.O. Box 7421, Kampala, Uganda
              ProMISe ERP Human Resource System — Ref: DC/HR/2026/OFR
================================================================================

DATE: 16th August, 2026

TO:
Candidate Name:    ${offer.candidateName}
Position Offered:  ${offer.position}
Department:        ${offer.department}
Reference Number:  DC/HR/${offer.candidateId}/OFR-2026

SUBJECT: FORMAL APPOINTMENT AND OFFER OF EMPLOYMENT

Dear ${offer.candidateName},

Following your successful performance throughout our recruitment and selection 
process, including technical competency assessments and the panel interview board,
we are pleased to offer you employment with DataCare Uganda Limited under the 
following terms and conditions:

1. POSITION & REPORTING
   Position Title:       ${offer.position}
   Department:           ${offer.department}
   Reporting Supervisor: ${offer.reportingSupervisor || 'Managing Director / Head of Department'}
   Contract Duration:    ${offer.contractDuration || '2 Years Renewable'}

2. REMUNERATION & BENEFITS
   Basic Monthly Salary: UGX ${offer.basicSalary || offer.grossSalaryMonthly || '4,800,000'} (Gross)
   Monthly Allowances:   UGX ${offer.allowances || '500,000 (Communication & Transport)'}
   Medical Insurance:    Comprehensive Corporate Scheme (Employee + 3 Dependents)
   Retirement Benefits:  10% Employer Contribution to National Social Security Fund (NSSF)

3. COMMENCEMENT & PROBATION
   Commencement Date:    ${offer.startDate}
   Probationary Period:  ${offer.probationMonths} Months from start date
   Performance Review:   Comprehensive appraisal prior to permanent confirmation

4. SPECIAL TERMS & CONDITIONS
   ${offer.specialTerms || 'Standard 21 working days annual leave, corporate workstation asset issuance, and adherence to company NDA and code of ethics.'}

5. CONFIDENTIALITY & CODE OF CONDUCT
   You will be required to execute our standard Non-Disclosure Agreement (NDA)
   and abide strictly by the Uganda Data Protection and Privacy Act.

6. ACCEPTANCE DEADLINE
   This offer is valid until ${offer.acceptanceDeadline || '25-Aug-2026'}. Please confirm your acceptance
   by appending your electronic signature via the ProMISe Candidate Portal.

--------------------------------------------------------------------------------
FOR: DATACARE UGANDA LIMITED

Dr. Arthur K.
Managing Director / Appointing Authority
DataCare Uganda Limited
[Official Corporate Digital Seal • Verified 2026]
--------------------------------------------------------------------------------

CANDIDATE ACCEPTANCE RECORD:
Signee:    ${offer.status === 'Accepted' ? offer.signedBy : (signatureName || 'Awaiting Signature')}
Status:    ${offer.status === 'Accepted' ? `ACCEPTED & SIGNED ON ${offer.signedDate || '16-Aug-2026'}` : 'PENDING ACCEPTANCE'}
Security:  Cryptographic SHA-256 Hash Verification • ProMISe e-Sign Framework
================================================================================
`.trim();

    const blob = new Blob([offerDoc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Offer_Letter_${offer.candidateName.replace(/[^a-zA-Z0-9]/g, '_')}_${offer.position.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setPortalNotification(`✓ Full Offer Letter for "${offer.candidateName}" downloaded successfully.`);
    setTimeout(() => setPortalNotification(null), 3000);
  };

  const handleSignOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureName.trim() || !termsAgreed) {
      alert('Please enter your legal name and accept the terms to sign.');
      return;
    }
    const targetOffer = selectedOfferForModal || activeOffer;
    if (targetOffer && onAcceptOffer) {
      onAcceptOffer(targetOffer.id, signatureName.trim());
    }
    setShowOfferModal(false);
    setPortalNotification('✓ Congratulations! Appointment Letter digitally signed and accepted! You are now moved to Orientation & Induction.');
    setTimeout(() => setPortalNotification(null), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 text-xs">
      
      {/* Portal chrome */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="h-24 sm:h-32 bg-gradient-to-r from-[#001b48] via-[#003366] to-[#001428] flex items-center px-6 text-white relative">
          <div className="space-y-1 z-10">
            <span className="text-[11px] uppercase tracking-widest text-sky-200 font-bold block">
              ProMISe HRMIS · Recruitment Portal
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Careers & Applicant Hub</span>
            </h1>
            <p className="text-xs text-sky-100 max-w-xl">
              Browse vacancies, manage your profile, and track your recruitment journey.
            </p>
          </div>
        </div>

        {/* Top Action Bar */}
        <div className="bg-[#f8fafc] border-t border-gray-200 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          {currentUser ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-600">
                Signed in as <strong className="text-[#001b48]">{currentUser.name}</strong>
              </span>
              <button
                type="button"
                onClick={handleLogOff}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 font-bold cursor-pointer transition-colors"
              >
                <LogOut className="w-3 h-3" />
                Log Off
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Welcome Guest Candidate.</span>
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  type="button"
                  onClick={() => openCandidateSignIn('default')}
                  className="px-2.5 py-1 bg-[#001b48] hover:bg-[#003366] text-white rounded text-[11px] font-bold cursor-pointer transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentScreen('register')}
                  className="px-2.5 py-1 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#001b48] rounded text-[11px] font-bold cursor-pointer transition-colors"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1 font-bold flex-wrap">
            {currentUser && (
            <button
              onClick={() => setCurrentScreen('profile')}
              className={`px-3 py-1 rounded transition-colors ${
                currentScreen === 'profile'
                  ? 'bg-[#001b48] text-white shadow-2xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              My Profile
            </button>
            )}

            <button
              onClick={() => setCurrentScreen('vacancies')}
              className={`px-3 py-1 rounded transition-colors ${
                currentScreen === 'vacancies'
                  ? 'bg-[#001b48] text-white shadow-2xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Current Vacancies ({publishedVacancies.length})
            </button>

            {currentUser && (
            <>
            <button
              onClick={() => setCurrentScreen('my_applications')}
              className={`px-3 py-1 rounded transition-colors ${
                currentScreen === 'my_applications'
                  ? 'bg-[#001b48] text-white shadow-2xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              My Applications ({userApplications.length})
            </button>

            <button
              onClick={() => setCurrentScreen('induction_docs')}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                currentScreen === 'induction_docs'
                  ? 'bg-[#001b48] text-white shadow-2xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Induction & Documents</span>
              {userApplications.some(a => ['Offer Issued', 'Offer Accepted', 'Orientation', 'Hired'].includes(a.status)) && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              )}
            </button>
            </>
            )}
          </div>
        </div>
      </div>

      {/* Global Notification Banner */}
      {portalNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {portalNotification}
          </span>
          <button onClick={() => setPortalNotification(null)} className="text-emerald-700 font-bold cursor-pointer">✕</button>
        </div>
      )}


      {/* ========================================================================= */}
      {/* SCREEN 2: CURRENT VACANCIES BOARD (Screenshot 2)                          */}
      {/* ========================================================================= */}
      {currentScreen === 'vacancies' && (
        <div className="space-y-4">
          
          {/* Welcome Alert Banner matching Screenshot 2 */}
          <div className="bg-emerald-50 border border-emerald-200 rounded p-4 text-emerald-900 shadow-2xs">
            <div className="space-y-0.5">
              <h3 className="font-bold text-xs">
                Welcome to the DataCare Job Application Portal!
              </h3>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Where your skills meet innovation and opportunity. Explore all active corporate requisitions below, download full terms of reference, and submit your application online.
              </p>
            </div>
          </div>

          {/* Filter Search Accordion matching Screenshot 2 */}
          <div className="bg-white border border-[#cbd5e1] rounded-sm shadow-xs">
            <button
              type="button"
              aria-expanded={filterAccordionOpen}
              onClick={() => setFilterAccordionOpen((open) => !open)}
              className={`w-full bg-[#f8fafc] px-4 py-2.5 flex items-center justify-between text-xs font-bold text-gray-700 hover:bg-gray-100 text-left cursor-pointer ${filterAccordionOpen ? 'border-b border-[#cbd5e1]' : ''}`}
            >
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#001b48]" />
                <span>Filter Vacancies</span>
                {(vacancySearch || filterDepartment || filterEmploymentType || filterRegion || filterClosing !== 'all') && (
                  <span className="text-[10px] font-semibold text-[#001b48] bg-sky-100 px-1.5 py-0.5 rounded">Active</span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${filterAccordionOpen ? 'rotate-180' : ''}`} />
            </button>

            {filterAccordionOpen && (
              <div className="p-4 bg-white space-y-3 border-t border-[#e2e8f0]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-wide">Department</label>
                    <select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                    >
                      <option value="">All departments</option>
                      {vacancyFilterOptions.departments.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-wide">Employment type</label>
                    <select
                      value={filterEmploymentType}
                      onChange={(e) => setFilterEmploymentType(e.target.value)}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                    >
                      <option value="">All types</option>
                      {vacancyFilterOptions.types.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-wide">Location / region</label>
                    <select
                      value={filterRegion}
                      onChange={(e) => setFilterRegion(e.target.value)}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                    >
                      <option value="">All locations</option>
                      {vacancyFilterOptions.regions.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-wide">Closing date</label>
                    <select
                      value={filterClosing}
                      onChange={(e) => setFilterClosing(e.target.value as 'all' | '30d' | '90d')}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                    >
                      <option value="all">Any closing date</option>
                      <option value="30d">Closing within 30 days</option>
                      <option value="90d">Closing within 90 days</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <div className="flex-1 w-full relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={vacancySearch}
                      onChange={(e) => setVacancySearch(e.target.value)}
                      placeholder="Search by vacancy name, department, or keywords..."
                      className="w-full bg-white border border-[#cbd5e1] rounded pl-9 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={resetVacancyFilters}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset filters</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Current Vacancies Table matching Screenshot 2 */}
          <div className="bg-white border border-[#cbd5e1] rounded-sm shadow-xs overflow-hidden">
            <div className="bg-[#f1f5f9] border-b border-[#cbd5e1] px-4 py-2.5 flex items-center justify-between">
              <h3 className="font-bold text-xs text-[#001b48] uppercase tracking-wider">
                Current Vacancies ({publishedVacancies.length})
              </h3>
              <span className="text-[11px] text-gray-500">
                Sorted by latest published positions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[#334155] font-bold">
                    <th className="py-2.5 px-3 border-r border-[#e2e8f0] w-10 text-center">#</th>
                    <th className="py-2.5 px-4 border-r border-[#e2e8f0] min-w-[200px]">Vacancy Name ▲</th>
                    <th className="py-2.5 px-3 border-r border-[#e2e8f0] text-center min-w-[150px]">Minimum Years of Experience</th>
                    <th className="py-2.5 px-3 border-r border-[#e2e8f0] text-center min-w-[130px]">Number of Vacancies</th>
                    <th className="py-2.5 px-3 border-r border-[#e2e8f0] text-center min-w-[110px]">Published</th>
                    <th className="py-2.5 px-3 border-r border-[#e2e8f0] text-center min-w-[110px]">Closing Date</th>
                    <th className="py-2.5 px-4 text-center min-w-[200px]">Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {publishedVacancies.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-gray-500">
                        No active vacancies currently open matching your search. Check back soon!
                      </td>
                    </tr>
                  ) : (
                    publishedVacancies.map((v, idx) => (
                      <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 border-r border-[#e2e8f0] text-center text-gray-500 font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 border-r border-[#e2e8f0]">
                          <button
                            type="button"
                            onClick={() => handleViewJobPost(v)}
                            className="text-left cursor-pointer group"
                          >
                            <span className="font-bold text-[#001b48] text-xs block group-hover:underline">
                              {v.position}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {v.department} • Ref: {v.reqNo}
                            </span>
                          </button>
                        </td>
                        <td className="py-3 px-3 border-r border-[#e2e8f0] text-center font-semibold text-gray-700">
                          {v.minExperience || 2} Years
                        </td>
                        <td className="py-3 px-3 border-r border-[#e2e8f0] text-center font-bold text-gray-800">
                          {v.vacancies}
                        </td>
                        <td className="py-3 px-3 border-r border-[#e2e8f0] text-center font-mono text-[11px] text-gray-700">
                          {v.publishedDate || v.plannedPublishDate || 'Pending'}
                        </td>
                        <td className="py-3 px-3 border-r border-[#e2e8f0] text-center font-mono text-[11px] text-gray-700">
                          {v.applicationDeadline || 'Not specified'}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            {/* Download Job Advert button matching Screenshot 2 */}
                            <button
                              type="button"
                              onClick={() => handleViewJobPost(v)}
                              className="px-2.5 py-1 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#001b48] rounded text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                              title="Download and view full Terms of Reference"
                            >
                              <Download className="w-3 h-3 text-[#001b48]" />
                              <span>Download Job Advert</span>
                            </button>

                            {/* Apply Button matching Screenshot 2 */}
                            <button
                              type="button"
                              onClick={() => handleApplyClick(v)}
                              className="px-3.5 py-1 bg-[#16a34a] hover:bg-[#15803d] text-white rounded text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                            >
                              <FileCheck className="w-3 h-3" />
                              <span>Apply</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 4 & 5: USER REGISTRATION (Screenshot 4 & 5)                         */}
      {/* ========================================================================= */}
      {currentScreen === 'register' && (
        <div className="bg-white border border-[#cbd5e1] rounded-sm p-6 shadow-xs max-w-2xl mx-auto space-y-5">
          {/* Back button matching Screenshot 4 */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <button
              onClick={() => setCurrentScreen('vacancies')}
              className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-semibold shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Current Vacancies Page</span>
            </button>

            <span className="text-xs text-gray-500 font-medium">
              DataCare Candidate Registration
            </span>
          </div>

          {/* Stepper matching Screenshot 4 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
              <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-[10px]">1</span>
              <span>User Information</span>
            </div>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#001b48]">
              <span className="w-5 h-5 rounded-full bg-[#001b48] text-white flex items-center justify-center text-[10px]">2</span>
              <span>New User Details</span>
            </div>
          </div>

          {/* Success Banner if just registered (Screenshot 5) */}
          {regSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded flex items-center gap-2 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{regSuccessMsg}</span>
            </div>
          )}

          {/* Registration Form Card matching Screenshot 4 */}
          <form onSubmit={handleRegisterSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Email Address <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="Enter valid email address"
                className="w-full bg-white border border-[#cbd5e1] rounded px-3 py-2 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Password <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-white border border-[#cbd5e1] rounded px-3 py-2 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Confirm Password <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  className="w-full bg-white border border-[#cbd5e1] rounded px-3 py-2 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCurrentScreen('vacancies')}
                className="px-4 py-1.5 border border-[#cbd5e1] bg-white hover:bg-slate-50 text-gray-700 rounded text-xs font-semibold shadow-2xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-[#001b48] hover:bg-[#003366] text-white rounded text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create User</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SCREEN 6: CANDIDATE PROFILE — stepped modal wizard */}
      <FormModal
        isOpen={currentScreen === 'profile'}
        onClose={() => setCurrentScreen('vacancies')}
        title="Candidate Profile"
        subtitle="Complete all steps to apply for vacancies on the Career Portal"
        maxWidth="5xl"
        badge={
          <span className="wizard-completion-pill">
            {profileData.completionPercentage || 100}% COMPLETE
          </span>
        }
      >
        <RequisitionStepper
          steps={PROFILE_WIZARD_STEPS}
          currentStep={profileStep}
          onStepClick={setProfileStep}
        />

        <div className="wizard-info-bar">
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary)' }} />
            <span><strong>NB:</strong> You must have a profile with us to apply for a job. Kindly complete all sections. Thank you.</span>
          </span>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[min(52vh,560px)] text-xs">
          <div className="space-y-4">
            {/* TAB 1: User's Profile Information matching Screenshot 6 */}
            {activeProfileTab === 'personal' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-[#001b48] flex items-center gap-2">
                  <span className="wizard-step-badge">1</span>
                  Personal Bio-Data & Contact
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Middle Name / Initial
                    </label>
                    <input
                      type="text"
                      value={profileData.middleNameInitial}
                      onChange={(e) => setProfileData({ ...profileData, middleNameInitial: e.target.value })}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Mobile Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-1">
                      <span className="bg-gray-100 border border-[#cbd5e1] px-2 py-1.5 rounded text-xs text-gray-600 font-mono">+256</span>
                      <input
                        type="text"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="flex-1 bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Home Phone Number
                    </label>
                    <input
                      type="text"
                      value={profileData.homePhone}
                      onChange={(e) => setProfileData({ ...profileData, homePhone: e.target.value })}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Date Of Birth</label>
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Country Of Origin</label>
                    <input
                      type="text"
                      value={profileData.countryOfOrigin}
                      onChange={(e) => setProfileData({ ...profileData, countryOfOrigin: e.target.value })}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Gender</label>
                    <select
                      value={profileData.gender}
                      onChange={(e) => setProfileData({ ...profileData, gender: e.target.value as any })}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Marital Status</label>
                    <select
                      value={profileData.maritalStatus}
                      onChange={(e) => setProfileData({ ...profileData, maritalStatus: e.target.value })}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none cursor-pointer"
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">City / District of Residence</label>
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">National ID (NIN)</label>
                    <input
                      type="text"
                      value={profileData.nationalId}
                      onChange={(e) => setProfileData({ ...profileData, nationalId: e.target.value })}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Do you have any disability?</label>
                    <select
                      value={profileData.hasDisability ? 'Yes' : 'No'}
                      onChange={(e) => setProfileData({ ...profileData, hasDisability: e.target.value === 'Yes' })}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none cursor-pointer"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Education Background */}
            {activeProfileTab === 'education' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h3 className="font-bold text-xs text-[#001b48] uppercase tracking-wider">
                    2. Academic & Higher Education Qualifications
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileData({
                        ...profileData,
                        educationHistory: [
                          ...(profileData.educationHistory || []),
                          {
                            institutionName: '',
                            address: '',
                            qualificationAttained: '',
                            educationLevel: 'Bachelor Degree',
                            startDate: '',
                            endDate: ''
                          }
                        ]
                      });
                    }}
                    className="text-xs text-[#001b48] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Another Institution</span>
                  </button>
                </div>

                {(profileData.educationHistory || []).map((edu, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Institution Name</label>
                        <input
                          type="text"
                          value={edu.institutionName}
                          onChange={(e) => {
                            const updated = [...(profileData.educationHistory || [])];
                            updated[idx].institutionName = e.target.value;
                            setProfileData({ ...profileData, educationHistory: updated });
                          }}
                          className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Qualification Attained</label>
                        <input
                          type="text"
                          value={edu.qualificationAttained}
                          onChange={(e) => {
                            const updated = [...(profileData.educationHistory || [])];
                            updated[idx].qualificationAttained = e.target.value;
                            setProfileData({ ...profileData, educationHistory: updated });
                          }}
                          className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Education Level</label>
                        <select
                          value={edu.educationLevel}
                          onChange={(e) => {
                            const updated = [...(profileData.educationHistory || [])];
                            updated[idx].educationLevel = e.target.value;
                            setProfileData({ ...profileData, educationHistory: updated });
                          }}
                          className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none cursor-pointer"
                        >
                          {EDUCATION_LEVELS.map(l => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Start Date</label>
                        <input
                          type="date"
                          value={edu.startDate}
                          onChange={(e) => {
                            const updated = [...(profileData.educationHistory || [])];
                            updated[idx].startDate = e.target.value;
                            setProfileData({ ...profileData, educationHistory: updated });
                          }}
                          className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">End Date</label>
                        <input
                          type="date"
                          value={edu.endDate}
                          onChange={(e) => {
                            const updated = [...(profileData.educationHistory || [])];
                            updated[idx].endDate = e.target.value;
                            setProfileData({ ...profileData, educationHistory: updated });
                          }}
                          className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: Employment History */}
            {activeProfileTab === 'employment' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h3 className="font-bold text-xs text-[#001b48] uppercase tracking-wider">
                    3. Employment & Work History
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileData({
                        ...profileData,
                        employmentHistory: [
                          ...(profileData.employmentHistory || []),
                          {
                            nameOfOrganisation: '',
                            jobTitle: '',
                            fromDate: '',
                            toDate: '',
                            reasonForLeaving: ''
                          }
                        ]
                      });
                    }}
                    className="text-xs text-[#001b48] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Previous Employer</span>
                  </button>
                </div>

                {(profileData.employmentHistory || []).map((emp, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Name of Organisation</label>
                        <input
                          type="text"
                          value={emp.nameOfOrganisation}
                          onChange={(e) => {
                            const updated = [...(profileData.employmentHistory || [])];
                            updated[idx].nameOfOrganisation = e.target.value;
                            setProfileData({ ...profileData, employmentHistory: updated });
                          }}
                          className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Job Title</label>
                        <input
                          type="text"
                          value={emp.jobTitle}
                          onChange={(e) => {
                            const updated = [...(profileData.employmentHistory || [])];
                            updated[idx].jobTitle = e.target.value;
                            setProfileData({ ...profileData, employmentHistory: updated });
                          }}
                          className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">From Date</label>
                        <input
                          type="date"
                          value={emp.fromDate}
                          onChange={(e) => {
                            const updated = [...(profileData.employmentHistory || [])];
                            updated[idx].fromDate = e.target.value;
                            setProfileData({ ...profileData, employmentHistory: updated });
                          }}
                          className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">To Date</label>
                        <input
                          type="date"
                          value={emp.toDate}
                          onChange={(e) => {
                            const updated = [...(profileData.employmentHistory || [])];
                            updated[idx].toDate = e.target.value;
                            setProfileData({ ...profileData, employmentHistory: updated });
                          }}
                          className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Reason for Leaving</label>
                        <input
                          type="text"
                          value={emp.reasonForLeaving}
                          onChange={(e) => {
                            const updated = [...(profileData.employmentHistory || [])];
                            updated[idx].reasonForLeaving = e.target.value;
                            setProfileData({ ...profileData, employmentHistory: updated });
                          }}
                          className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: Competence Profile */}
            {activeProfileTab === 'competence' && (
              <div className="space-y-4">
                <h3 className="font-bold text-xs text-[#001b48] uppercase tracking-wider border-b border-gray-200 pb-2">
                  4. Competence Profile & Salary Expectation
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Min Salary Expectation (Gross)</label>
                    <input
                      type="text"
                      value={profileData.minSalaryExpectation}
                      onChange={(e) => setProfileData({ ...profileData, minSalaryExpectation: e.target.value })}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Max Salary Expectation (Gross)</label>
                    <input
                      type="text"
                      value={profileData.maxSalaryExpectation}
                      onChange={(e) => setProfileData({ ...profileData, maxSalaryExpectation: e.target.value })}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Total Years of Experience</label>
                    <input
                      type="number"
                      value={profileData.yearsOfExperience}
                      onChange={(e) => setProfileData({ ...profileData, yearsOfExperience: Number(e.target.value) || 0 })}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Relevant Experience & Professional Highlights</label>
                  <textarea
                    rows={3}
                    value={profileData.relevantExperience}
                    onChange={(e) => setProfileData({ ...profileData, relevantExperience: e.target.value })}
                    className="w-full bg-white border border-[#cbd5e1] rounded p-2 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Key Technical & Professional Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={profileData.skills?.join(', ')}
                    onChange={(e) => setProfileData({ ...profileData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 5: References and Availability */}
            {activeProfileTab === 'references' && (
              <div className="space-y-4">
                <h3 className="font-bold text-xs text-[#001b48] uppercase tracking-wider border-b border-gray-200 pb-2">
                  5. Referees & Notice Period Availability
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Notice Period Required</label>
                    <input
                      type="text"
                      value={profileData.noticePeriodMonths}
                      onChange={(e) => setProfileData({ ...profileData, noticePeriodMonths: e.target.value })}
                      placeholder="e.g. 1 Month"
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">How did you learn about this opportunity?</label>
                    <input
                      type="text"
                      value={profileData.howDidYouLearnAboutJob}
                      onChange={(e) => setProfileData({ ...profileData, howDidYouLearnAboutJob: e.target.value })}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-gray-700 text-xs">Professional References (3 Referees)</h4>
                  {(profileData.referees || []).map((ref, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <label className="block text-gray-500 text-[10px]">Referee Name</label>
                        <input
                          type="text"
                          value={ref.name}
                          onChange={(e) => {
                            const updated = [...(profileData.referees || [])];
                            updated[idx].name = e.target.value;
                            setProfileData({ ...profileData, referees: updated });
                          }}
                          className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 text-[10px]">Position & Company</label>
                        <input
                          type="text"
                          value={ref.position}
                          onChange={(e) => {
                            const updated = [...(profileData.referees || [])];
                            updated[idx].position = e.target.value;
                            setProfileData({ ...profileData, referees: updated });
                          }}
                          className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 text-[10px]">Telephone</label>
                        <input
                          type="text"
                          value={ref.phone}
                          onChange={(e) => {
                            const updated = [...(profileData.referees || [])];
                            updated[idx].phone = e.target.value;
                            setProfileData({ ...profileData, referees: updated });
                          }}
                          className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 text-[10px]">Email Address</label>
                        <input
                          type="email"
                          value={ref.email}
                          onChange={(e) => {
                            const updated = [...(profileData.referees || [])];
                            updated[idx].email = e.target.value;
                            setProfileData({ ...profileData, referees: updated });
                          }}
                          className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: Supporting Documents */}
            {activeProfileTab === 'documents' && (
              <div className="space-y-4">
                <h3 className="font-bold text-xs text-[#001b48] uppercase tracking-wider border-b border-gray-200 pb-2">
                  6. Supporting Documents & Credentials
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(profileData.documents || []).map((doc, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-800">{doc.type}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Uploaded</span>
                      </div>
                      <p className="text-[11px] text-gray-500">{doc.description}</p>
                      <div className="flex items-center gap-2 text-[11px] text-[#001b48] font-mono bg-white p-1.5 rounded border border-gray-200">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate">{doc.fileName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions — replaced by wizard footer below */}
          </div>
        </div>

        <WizardModalFooter
          onClose={() => setCurrentScreen('vacancies')}
          showBack={profileStep > 1}
          onBack={() => setProfileStep(s => Math.max(1, s - 1))}
          showNext={false}
          leftNote="Your profile syncs automatically for all job applications."
          actions={
            profileStep === 6 ? (
              <button
                type="button"
                onClick={() => {
                  setProfileData({ ...profileData, isCompleted: true, completionPercentage: 100 });
                  setPortalNotification('✓ Profile saved successfully!');
                  setTimeout(() => setPortalNotification(null), 3000);
                  if (activeApplyingJob) setCurrentScreen('apply_review');
                  else setCurrentScreen('vacancies');
                }}
                className="wizard-btn-primary"
              >
                <Save className="w-4 h-4" />
                Save & Apply
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setProfileData({ ...profileData, completionPercentage: Math.max(profileData.completionPercentage || 0, Math.round((profileStep / 6) * 100)) });
                  setProfileStep(s => Math.min(6, s + 1));
                }}
                className="wizard-btn-primary"
              >
                <Save className="w-4 h-4" />
                Save & Continue
              </button>
            )
          }
        />
      </FormModal>

      {/* ========================================================================= */}
      {/* SCREEN 7: APPLICATION DETAILS REVIEW & SUBMISSION (Screenshot 7)          */}
      {/* ========================================================================= */}
      {currentScreen === 'apply_review' && activeApplyingJob && (
        <div className="bg-white border border-[#cbd5e1] rounded-sm p-6 shadow-xs max-w-4xl mx-auto space-y-6 text-xs">
          
          {/* Stepper matching Screenshot 7 */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">✓</span>
                <span>1. User Profile Information</span>
              </div>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#001b48]">
                <span className="w-5 h-5 rounded-full bg-[#001b48] text-white flex items-center justify-center text-[10px]">2</span>
                <span>Application Details Review</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentScreen('profile')}
              className="text-[#001b48] hover:underline font-semibold text-xs flex items-center gap-1 cursor-pointer"
            >
              <PenTool className="w-3 h-3" />
              <span>Edit Profile Data</span>
            </button>
          </div>

          {/* Target Vacancy Banner */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded text-[#001b48] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-700 block">Position Being Applied For:</span>
              <h2 className="text-base font-black">{activeApplyingJob.position}</h2>
              <span className="text-xs text-gray-600">{activeApplyingJob.department} • Ref: {activeApplyingJob.reqNo}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-500 block">Application Deadline:</span>
              <strong className="font-mono text-gray-800">{activeApplyingJob.applicationDeadline || 'Not specified'}</strong>
            </div>
          </div>

          {/* Categorized Document Review matching Screenshot 7 */}
          <div className="space-y-4">
            {/* 1. Personal Information */}
            <div className="border border-gray-200 rounded p-4 space-y-2 bg-gray-50/50">
              <h4 className="font-bold text-xs text-[#001b48] uppercase tracking-wide">1. Personal Information</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div><span className="text-gray-500 block">Full Name:</span><strong>{profileData.firstName} {profileData.middleNameInitial} {profileData.lastName}</strong></div>
                <div><span className="text-gray-500 block">Email Address:</span><strong className="font-mono">{profileData.email}</strong></div>
                <div><span className="text-gray-500 block">Phone:</span><strong className="font-mono">+{profileData.phoneCountryCode} {profileData.phone}</strong></div>
                <div><span className="text-gray-500 block">Gender / Marital:</span><strong>{profileData.gender} ({profileData.maritalStatus})</strong></div>
              </div>
            </div>

            {/* 2. Education & Experience */}
            <div className="border border-gray-200 rounded p-4 space-y-2 bg-gray-50/50">
              <h4 className="font-bold text-xs text-[#001b48] uppercase tracking-wide">2. Education & Experience Summary</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div><span className="text-gray-500 block">Qualification:</span><strong>{profileData.educationHistory?.[0]?.qualificationAttained}</strong></div>
                <div><span className="text-gray-500 block">Institution:</span><strong>{profileData.educationHistory?.[0]?.institutionName}</strong></div>
                <div><span className="text-gray-500 block">Years of Experience:</span><strong>{profileData.yearsOfExperience} Years</strong></div>
              </div>
            </div>

            {/* 3. Competence & Skills */}
            <div className="border border-gray-200 rounded p-4 space-y-2 bg-gray-50/50">
              <h4 className="font-bold text-xs text-[#001b48] uppercase tracking-wide">3. Skills & Salary Expectations</h4>
              <div className="text-[11px] space-y-1">
                <div><span className="text-gray-500">Skills: </span><strong className="text-gray-800">{profileData.skills?.join(', ')}</strong></div>
                <div><span className="text-gray-500">Salary Expectation: </span><strong className="font-mono text-emerald-700">{profileData.salaryCurrency || 'UGX'} {profileData.minSalaryExpectation} - {profileData.maxSalaryExpectation}</strong></div>
              </div>
            </div>
          </div>

          {/* Submission Action Buttons matching Screenshot 7 */}
          <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleDownloadJobAdvertText(activeApplyingJob)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-gray-600" />
              <span>Export To Pdf / Print</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentScreen('vacancies')}
                className="px-4 py-1.5 border border-[#cbd5e1] bg-white hover:bg-slate-50 text-gray-700 rounded text-xs font-semibold shadow-2xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalSubmitApplication}
                className="px-6 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white rounded text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Application</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 8: MY APPLICATIONS STATUS TRACKER (Screenshot 8)                   */}
      {/* ========================================================================= */}
      {currentScreen === 'my_applications' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#cbd5e1] rounded-sm p-4 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2">
              <div>
                <h3 className="font-bold text-xs text-[#001b48] uppercase tracking-wider">
                  My Submitted Applications ({userApplications.length})
                </h3>
                <p className="text-[11px] text-gray-500">
                  Real-time lifecycle tracking, psychometric assessment testing, and appointment offer signing.
                </p>
              </div>

              <button
                onClick={() => setCurrentScreen('vacancies')}
                className="px-3 py-1.5 bg-[#001b48] hover:bg-[#003366] text-white rounded text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <span>Browse More Vacancies</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Applications Table matching Screenshot 8 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[#334155] font-bold">
                    <th className="py-2.5 px-3 border-r border-[#e2e8f0] w-10 text-center">#</th>
                    <th className="py-2.5 px-4 border-r border-[#e2e8f0] min-w-[220px]">Vacancy Name ▲</th>
                    <th className="py-2.5 px-3 border-r border-[#e2e8f0] text-center min-w-[120px]">Submission Date</th>
                    <th className="py-2.5 px-3 border-r border-[#e2e8f0] text-center min-w-[140px]">Application Status</th>
                    <th className="py-2.5 px-4 text-center min-w-[220px]">Candidate Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {userApplications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-gray-500">
                        You have not submitted any applications yet. Click "Browse More Vacancies" to apply!
                      </td>
                    </tr>
                  ) : (
                    userApplications.map((app, idx) => {
                      const appOffer = offers.find(o => o.candidateId === app.id);
                      const isTestPending = app.status === 'Assessment Sent' || (app.testStatus === 'Pending' && !app.testScore);
                      const isInterview = app.status === 'Interview Scheduled' || app.interviewInvited;
                      const hasOffer = app.status === 'Offer Issued' || app.status === 'Offer Accepted' || (appOffer && appOffer.status !== 'Draft');

                      return (
                        <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3 border-r border-[#e2e8f0] text-center text-gray-500 font-medium">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4 border-r border-[#e2e8f0]">
                            <strong className="text-[#001b48] text-xs block">{app.position}</strong>
                            <span className="text-[11px] text-gray-500">{app.department} • App ID: {app.id}</span>
                          </td>
                          <td className="py-3 px-3 border-r border-[#e2e8f0] text-center text-gray-600 font-mono text-[11px]">
                            {app.appliedDate || '18-Aug-2026'}
                          </td>
                          <td className="py-3 px-3 border-r border-[#e2e8f0] text-center">
                            <span className={`px-2.5 py-1 rounded text-[11px] font-bold inline-flex items-center gap-1 ${
                              app.status === 'Offer Accepted' || app.status === 'Hired' ? 'bg-emerald-100 text-emerald-800' :
                              app.status === 'Offer Issued' ? 'bg-indigo-100 text-indigo-800 animate-pulse' :
                              app.status === 'Interview Scheduled' ? 'bg-blue-100 text-blue-800' :
                              app.status === 'Pre-Shortlisted' ? 'bg-cyan-100 text-cyan-800' :
                              app.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {app.status === 'Offer Accepted' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              <span>{app.status}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {/* 1. Take Psychometric Test if invited */}
                              {isTestPending && (
                                <button
                                  type="button"
                                  onClick={() => onTakeTest(app)}
                                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                                >
                                  <BrainCircuit className="w-3 h-3" />
                                  <span>Take Psychometrics</span>
                                </button>
                              )}

                              {/* 2. RSVP to Interview if Scheduled */}
                              {isInterview && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onConfirmInterviewRSVP) onConfirmInterviewRSVP(app.id);
                                    setPortalNotification(`✓ Interview attendance RSVP confirmed for ${app.interviewDate || 'scheduled slot'}!`);
                                    setTimeout(() => setPortalNotification(null), 4000);
                                  }}
                                  className="px-2.5 py-1 bg-[#001b48] hover:bg-[#003366] text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                                >
                                  <Calendar className="w-3 h-3" />
                                  <span>RSVP Interview</span>
                                </button>
                              )}

                              {/* 3. Review & Sign Offer Letter */}
                              {hasOffer && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedOfferForModal(appOffer || activeOffer);
                                    setShowOfferModal(true);
                                  }}
                                  className="px-2.5 py-1 bg-[#16a34a] hover:bg-[#15803d] text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                                >
                                  <PenTool className="w-3 h-3" />
                                  <span>{app.status === 'Offer Accepted' ? 'View Signed Contract' : 'Review & E-Sign Offer'}</span>
                                </button>
                              )}

                              {/* 4. Receipt Download */}
                              <button
                                type="button"
                                onClick={() => {
                                  setPortalNotification(`✓ Application receipt for "${app.position}" exported.`);
                                  setTimeout(() => setPortalNotification(null), 3000);
                                }}
                                className="p-1 text-gray-500 hover:text-gray-800 rounded hover:bg-gray-100 cursor-pointer"
                                title="Download submission receipt"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Application Progress Stepper and Detailed Status Records */}
            {userApplications.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-[#001b48] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#001b48]" />
                    <span>Real-Time Selection & Assessment Progress Tracker</span>
                  </h4>
                  <span className="text-[11px] text-gray-500 font-medium">
                    Tracking: <strong>{userApplications[0].position}</strong> (Ref: {userApplications[0].requisitionId})
                  </span>
                </div>

                {/* 6-Stage Progress Stepper */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 bg-slate-50 p-3.5 rounded border border-gray-200 text-xs">
                  {/* Stage 1 */}
                  <div className="p-2.5 rounded bg-white border border-emerald-300 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800 text-[10px] uppercase">1. Submission</span>
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                    </div>
                    <strong className="text-gray-800 text-[11px] block">Application Received</strong>
                    <span className="text-[10px] text-gray-500 block">Verified Bio-Data & CV</span>
                  </div>

                  {/* Stage 2 */}
                  <div className={`p-2.5 rounded border shadow-2xs space-y-1 ${
                    ['Pre-Shortlisted', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Offer Issued', 'Offer Accepted', 'Hired'].includes(userApplications[0].status)
                      ? 'bg-white border-emerald-300'
                      : 'bg-amber-50/70 border-amber-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700 text-[10px] uppercase">2. Pre-Screening</span>
                      {['Pre-Shortlisted', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Offer Issued', 'Offer Accepted', 'Hired'].includes(userApplications[0].status) ? (
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold">●</span>
                      )}
                    </div>
                    <strong className="text-gray-800 text-[11px] block">Pre-Shortlisted</strong>
                    <span className="text-[10px] text-gray-500 block">Match Score: {userApplications[0].matchScore || 94}%</span>
                  </div>

                  {/* Stage 3 */}
                  <div className={`p-2.5 rounded border shadow-2xs space-y-1 ${
                    userApplications[0].testStatus === 'Passed' || ['Shortlisted', 'Interview Scheduled', 'Selected', 'Offer Issued', 'Offer Accepted', 'Hired'].includes(userApplications[0].status)
                      ? 'bg-white border-emerald-300'
                      : userApplications[0].status === 'Assessment Sent'
                      ? 'bg-amber-100 border-amber-300 animate-pulse'
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700 text-[10px] uppercase">3. Psychometrics</span>
                      {userApplications[0].testStatus === 'Passed' ? (
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-gray-600 flex items-center justify-center text-[10px] font-bold">3</span>
                      )}
                    </div>
                    <strong className="text-gray-800 text-[11px] block">
                      {userApplications[0].testScore ? `Score: ${userApplications[0].testScore}% (Passed)` : 'Online Assessment'}
                    </strong>
                    <span className="text-[10px] text-gray-500 block">Aptitude & EQ battery</span>
                  </div>

                  {/* Stage 4 */}
                  <div className={`p-2.5 rounded border shadow-2xs space-y-1 ${
                    ['Selected', 'Offer Issued', 'Offer Accepted', 'Hired'].includes(userApplications[0].status) || userApplications[0].interviewScore
                      ? 'bg-white border-emerald-300'
                      : userApplications[0].status === 'Interview Scheduled'
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700 text-[10px] uppercase">4. Interview Board</span>
                      {userApplications[0].interviewScore ? (
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-gray-600 flex items-center justify-center text-[10px] font-bold">4</span>
                      )}
                    </div>
                    <strong className="text-gray-800 text-[11px] block">
                      {userApplications[0].interviewScore ? `Score: ${userApplications[0].interviewScore}% (Cleared)` : userApplications[0].status === 'Interview Scheduled' ? 'Invited & Confirmed' : 'Panel Board'}
                    </strong>
                    <span className="text-[10px] text-gray-500 block">Competency scoring</span>
                  </div>

                  {/* Stage 5 */}
                  <div className={`p-2.5 rounded border shadow-2xs space-y-1 ${
                    ['Offer Issued', 'Offer Accepted', 'Hired'].includes(userApplications[0].status)
                      ? 'bg-indigo-50 border-indigo-300'
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-900 text-[10px] uppercase">5. Job Offer</span>
                      {userApplications[0].status === 'Offer Accepted' || userApplications[0].status === 'Hired' ? (
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center text-[10px] font-bold">5</span>
                      )}
                    </div>
                    <strong className="text-indigo-900 text-[11px] block">
                      {userApplications[0].status === 'Offer Accepted' ? 'Contract Signed' : 'Offer Issued'}
                    </strong>
                    <span className="text-[10px] text-indigo-600 block">Official Appointment</span>
                  </div>

                  {/* Stage 6 */}
                  <div className={`p-2.5 rounded border shadow-2xs space-y-1 ${
                    userApplications[0].status === 'Hired' || userApplications[0].status === 'Offer Accepted'
                      ? 'bg-emerald-50 border-emerald-300'
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700 text-[10px] uppercase">6. Orientation</span>
                      {userApplications[0].status === 'Hired' ? (
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-gray-600 flex items-center justify-center text-[10px] font-bold">6</span>
                      )}
                    </div>
                    <strong className="text-gray-800 text-[11px] block">Induction & Onboarding</strong>
                    <span className="text-[10px] text-gray-500 block">Staff ERP Activation</span>
                  </div>
                </div>
              </div>
            )}

            {/* Induction & Document Center Shortcut Banner */}
            {userApplications.some(a => ['Offer Issued', 'Offer Accepted', 'Orientation', 'Hired'].includes(a.status)) && (
              <div className="bg-gradient-to-r from-[#001b48] to-[#003366] text-white p-4 rounded-sm shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center border border-white/20">
                    <FileCheck className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-sky-200 tracking-wider block">
                      New Staff Onboarding & Document Center
                    </span>
                    <h4 className="font-black text-sm text-white">
                      Complete Your Employment Contract, NDA & Payroll Setup
                    </h4>
                    <p className="text-[11px] text-sky-100">
                      Sign your 2-Year Employment Agreement, Non-Disclosure Agreement (NDA), and submit your Bank / NSSF / TIN details.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentScreen('induction_docs')}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                >
                  <span>Open Induction & Documents Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 9: CANDIDATE INDUCTION & DOCUMENT MANAGEMENT SYSTEM                */}
      {/* ========================================================================= */}
      {currentScreen === 'induction_docs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentScreen('my_applications')}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-slate-50 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to My Applications</span>
            </button>

            <span className="text-xs text-gray-500">
              ProMISe ERP • Candidate Induction & Document Verification Suite
            </span>
          </div>

          {(() => {
            const candidateForOnboarding = userApplications.find(c => ['Offer Issued', 'Offer Accepted', 'Orientation', 'Hired'].includes(c.status)) || userApplications[0] || candidates[0];
            const offerForOnboarding = offers.find(o => o.candidateId === candidateForOnboarding?.id || o.candidateName === candidateForOnboarding?.name) || offers[0] || null;

            if (!candidateForOnboarding) {
              return (
                <div className="bg-white border border-[#cbd5e1] p-8 text-center rounded space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <h3 className="text-sm font-bold text-gray-800">No Active Induction Record Found</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    Your profile is not currently assigned to an active staff induction or offer phase. Once an offer is issued, you will be able to review contracts, NDAs, and payroll setups here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCurrentScreen('vacancies')}
                    className="px-4 py-1.5 bg-[#001b48] text-white rounded text-xs font-bold cursor-pointer"
                  >
                    Browse Current Vacancies
                  </button>
                </div>
              );
            }

            return (
              <CandidateOnboardingHub
                candidate={candidateForOnboarding}
                offer={offerForOnboarding}
                onboardingTasks={onboardingTasks}
                onToggleTask={onToggleTask}
                onOpenOfferModal={() => {
                  setSelectedOfferForModal(offerForOnboarding);
                  setShowOfferModal(true);
                }}
                onAcceptOffer={onAcceptOffer}
                onNavigateToPortal={(screen) => setCurrentScreen(screen as any)}
              />
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: AUTH REQUIRED PROMPT (Screenshot 3)                               */}
      {/* ========================================================================= */}
      {showCandidateSignInModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => {
                setShowCandidateSignInModal(false);
                setJobToApplyAfterAuth(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            {jobToApplyAfterAuth && (
              <p className="text-[11px] text-slate-600 mb-3 pr-8">
                Sign in or register to view <strong className="text-[#001b48]">{jobToApplyAfterAuth.position}</strong> and continue your application.
              </p>
            )}
            <CandidateSignInCard
              loginEmail={loginEmail}
              setLoginEmail={setLoginEmail}
              loginPassword={loginPassword}
              setLoginPassword={setLoginPassword}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
              onLoginSubmit={handleLoginSubmit}
              onRegister={() => {
                setShowCandidateSignInModal(false);
                setCurrentScreen('register');
              }}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FULL JOB ADVERT & TERMS OF REFERENCE (In-System authored JD)     */}
      {/* ========================================================================= */}
      {selectedJobForAdvertModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-sm border border-[#cbd5e1] max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-5 text-xs animate-in fade-in zoom-in-95">
            
            {/* Document Header */}
            <div className="flex items-start justify-between border-b border-gray-300 pb-4">
              <div>
                <span className="text-[10px] tracking-widest uppercase font-bold text-gray-500 block">
                  DataCare Uganda Limited • Terms of Reference
                </span>
                <h2 className="text-xl font-black text-[#001b48] mt-0.5">
                  {selectedJobForAdvertModal.position}
                </h2>
                <span className="text-xs text-gray-600">
                  {selectedJobForAdvertModal.department} • Ref: {selectedJobForAdvertModal.reqNo}
                </span>
              </div>
              <button
                onClick={() => setSelectedJobForAdvertModal(null)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded border border-gray-200 text-[11px]">
              <div>
                <span className="text-gray-500 block">Budget / Remuneration:</span>
                <strong className="font-mono text-gray-900">{selectedJobForAdvertModal.currency || 'UGX'} {selectedJobForAdvertModal.budget}</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Open Headcount:</span>
                <strong className="text-gray-900">{selectedJobForAdvertModal.vacancies} Position(s)</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Min Experience:</span>
                <strong className="text-gray-900">{selectedJobForAdvertModal.minExperience || 2} Years</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Deadline Date:</span>
                <strong className="font-mono text-[#b91c1c]">{selectedJobForAdvertModal.applicationDeadline || 'Not specified'}</strong>
              </div>
            </div>

            {/* Full Formatted Sections */}
            <div className="space-y-4 text-gray-800 leading-relaxed text-xs">
              <div>
                <h4 className="font-bold text-xs text-[#001b48] uppercase tracking-wide border-b border-gray-100 pb-1">
                  1. Role Purpose & Strategic Mission
                </h4>
                <p className="text-gray-700 mt-1">
                  {selectedJobForAdvertModal.rolePurpose || selectedJobForAdvertModal.description || 'Drive operational excellence, formulate technical strategies, maintain enterprise architectures, and collaborate across multidisciplinary units to support corporate objectives.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-xs text-[#001b48] uppercase tracking-wide border-b border-gray-100 pb-1">
                  2. Key Duties & Core Responsibilities
                </h4>
                <ul className="list-disc pl-5 mt-1.5 space-y-1 text-gray-700">
                  {selectedJobForAdvertModal.keyResponsibilities ? (
                    selectedJobForAdvertModal.keyResponsibilities.map((r, i) => <li key={i}>{r}</li>)
                  ) : (
                    <>
                      <li>Architect, build, and maintain high-quality deliverables according to industry best practices.</li>
                      <li>Collaborate with cross-functional stakeholders to translate requirements into actionable outcomes.</li>
                      <li>Ensure strict adherence to corporate governance, information security, and audit compliance.</li>
                    </>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-xs text-[#001b48] uppercase tracking-wide border-b border-gray-100 pb-1">
                  3. Minimum Qualifications & Experience Requirements
                </h4>
                <ul className="list-disc pl-5 mt-1.5 space-y-1 text-gray-700">
                  {selectedJobForAdvertModal.requiredQualifications ? (
                    selectedJobForAdvertModal.requiredQualifications.map((q, i) => <li key={i}>{q}</li>)
                  ) : (
                    <>
                      <li>{selectedJobForAdvertModal.educationLevel || 'Bachelor Degree'} in relevant field.</li>
                      <li>Minimum {selectedJobForAdvertModal.minExperience || 2} years of progressive experience.</li>
                      <li>Candidate age between {selectedJobForAdvertModal.minAge || 21} and {selectedJobForAdvertModal.maxAge || 45} years.</li>
                    </>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-xs text-[#001b48] uppercase tracking-wide border-b border-gray-100 pb-1">
                  4. Essential Technical Competencies & Skills
                </h4>
                <ul className="list-disc pl-5 mt-1.5 space-y-1 text-gray-700">
                  {selectedJobForAdvertModal.requiredSkills ? (
                    selectedJobForAdvertModal.requiredSkills.map((s, i) => <li key={i}>{s}</li>)
                  ) : (
                    <li>Analytical problem solving, communication, and team leadership skills.</li>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-xs text-[#001b48] uppercase tracking-wide border-b border-gray-100 pb-1">
                  5. Selection Methodology
                </h4>
                <p className="text-gray-700 mt-1">
                  {selectedJobForAdvertModal.assessmentMethodology || 'Stage 1: Pre-screening; Stage 2: Psychometrics; Stage 3: Competence Panel Interview.'}
                </p>
              </div>
            </div>

            {/* Document Modal Actions */}
            <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDownloadJobAdvertText(selectedJobForAdvertModal)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save / Download Advert Text</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedJobForAdvertModal(null)}
                  className="px-4 py-2 border border-[#cbd5e1] bg-white hover:bg-slate-50 text-gray-700 rounded text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const job = selectedJobForAdvertModal;
                    setSelectedJobForAdvertModal(null);
                    handleApplyClick(job);
                  }}
                  className="px-5 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white rounded text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Proceed to Apply Online</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: FULL FORMAL OFFER LETTER & DIGITAL SIGNATURE (Candidate Portal)  */}
      {/* ========================================================================= */}
      {showOfferModal && selectedOfferForModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-sm border border-[#cbd5e1] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 my-auto">
            
            {/* Modal Control Bar */}
            <div className="bg-[#001b48] text-white px-5 py-3 flex items-center justify-between shrink-0 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">
                  Official Appointment Letter • DataCare Uganda Limited
                </h3>
                <span className="hidden sm:inline-block text-[10px] bg-slate-700 px-2 py-0.5 rounded font-mono text-slate-300">
                  Ref: DC/HR/{selectedOfferForModal.candidateId}/2026
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadFullOfferLetter(selectedOfferForModal)}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Download full offer text file"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Download Letter</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Print or Save as PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Print / PDF</span>
                </button>
                <button 
                  onClick={() => setShowOfferModal(false)} 
                  className="text-gray-400 hover:text-white p-1 rounded hover:bg-slate-700 transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Letterhead Paper Document */}
            <div className="p-6 sm:p-10 overflow-y-auto space-y-6 text-xs text-[#334155] bg-[#fafafa]">
              
              {/* Paper Canvas */}
              <div className="bg-white p-6 sm:p-10 border border-[#e2e8f0] shadow-sm rounded-sm space-y-6 max-w-3xl mx-auto">
                
                {/* 1. Official Letterhead Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-[#001b48] pb-5 gap-4">
                  <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-black text-[#001b48] tracking-wider uppercase">
                      DATACARE UGANDA LIMITED
                    </h1>
                    <p className="text-[11px] text-gray-600">
                      Plot 14 Lumumba Avenue, Kampala • P.O. Box 7421, Kampala, Uganda
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono">
                      ProMISe ERP Human Resource System • Tel: +256 (0) 414 345 678 • info@datacare.co.ug
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className={`px-3 py-1 rounded text-xs font-black uppercase tracking-wider inline-block border ${
                      selectedOfferForModal.status === 'Accepted'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {selectedOfferForModal.status === 'Accepted' ? '✓ FORMALLY ACCEPTED' : 'OFFICIAL APPOINTMENT'}
                    </span>
                    <span className="block text-[10px] text-gray-400 font-mono mt-1">
                      Ref: DC/HR/{selectedOfferForModal.candidateId}/OFR-2026
                    </span>
                  </div>
                </div>

                {/* 2. Candidate & Date Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[11px] text-gray-500 font-semibold block">Date of Issue:</span>
                    <strong className="text-gray-900 font-mono">{selectedOfferForModal.issuedDate || '16th August, 2026'}</strong>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[11px] text-gray-500 font-semibold block">Acceptance Validity:</span>
                    <strong className="text-[#b91c1c] font-mono">{selectedOfferForModal.acceptanceDeadline || '25th August, 2026'}</strong>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Addressed To:</span>
                  <div className="text-sm font-black text-[#001b48]">{selectedOfferForModal.candidateName}</div>
                  <div className="text-gray-600 text-xs">
                    Position: <strong>{selectedOfferForModal.position}</strong> • Department: <strong>{selectedOfferForModal.department || 'Information Technology'}</strong>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    ProMISe Candidate ID: <span className="font-mono">{selectedOfferForModal.candidateId}</span>
                  </div>
                </div>

                {/* 3. Formal Subject */}
                <div className="border-b border-gray-200 pb-2">
                  <h2 className="text-sm sm:text-base font-black text-[#001b48] uppercase tracking-tight">
                    RE: FORMAL OFFER OF APPOINTMENT AS {selectedOfferForModal.position?.toUpperCase()}
                  </h2>
                </div>

                {/* 4. Letter Body Paragraphs */}
                <div className="space-y-3 leading-relaxed text-xs text-gray-800">
                  <p>
                    Dear <strong>{selectedOfferForModal.candidateName}</strong>,
                  </p>
                  <p>
                    Following your successful participation throughout our rigorous recruitment and selection process, including the technical assessments, behavioral evaluations, and final panel interview board, the Management of <strong>DataCare Uganda Limited</strong> is pleased to formally offer you appointment as <strong>{selectedOfferForModal.position}</strong> under the following terms and conditions:
                  </p>
                </div>

                {/* 5. Formal Contractual Terms Table */}
                <div className="border border-[#cbd5e1] rounded overflow-hidden">
                  <div className="bg-[#f1f5f9] px-4 py-2 border-b border-[#cbd5e1] font-bold text-xs text-[#001b48] uppercase tracking-wider">
                    Summary of Remuneration & Contractual Provisions
                  </div>
                  <div className="divide-y divide-gray-200 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3 bg-white">
                      <span className="text-gray-500 font-semibold">1. Position Title:</span>
                      <strong className="sm:col-span-2 text-gray-900">{selectedOfferForModal.position}</strong>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3 bg-[#fafafa]">
                      <span className="text-gray-500 font-semibold">2. Department:</span>
                      <strong className="sm:col-span-2 text-gray-900">{selectedOfferForModal.department || 'Information Technology'}</strong>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3 bg-white">
                      <span className="text-gray-500 font-semibold">3. Basic Monthly Salary:</span>
                      <strong className="sm:col-span-2 text-emerald-800 font-mono text-sm font-black">
                        UGX {selectedOfferForModal.basicSalary || selectedOfferForModal.grossSalaryMonthly || '4,800,000'} (Gross)
                      </strong>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3 bg-[#fafafa]">
                      <span className="text-gray-500 font-semibold">4. Monthly Allowances:</span>
                      <span className="sm:col-span-2 text-gray-800 font-medium">
                        UGX {selectedOfferForModal.allowances || '500,000'} (Communication, Transport & Performance Stipend)
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3 bg-white">
                      <span className="text-gray-500 font-semibold">5. Commencement / Start Date:</span>
                      <strong className="sm:col-span-2 text-[#001b48] font-mono font-bold">
                        {selectedOfferForModal.startDate}
                      </strong>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3 bg-[#fafafa]">
                      <span className="text-gray-500 font-semibold">6. Probationary Period:</span>
                      <span className="sm:col-span-2 text-gray-800">
                        <strong>{selectedOfferForModal.probationMonths || 3} Months</strong> (subject to formal performance review)
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3 bg-white">
                      <span className="text-gray-500 font-semibold">7. Reporting Supervisor:</span>
                      <span className="sm:col-span-2 text-gray-800">
                        {selectedOfferForModal.reportingSupervisor || 'Managing Director / Designated Head of Department'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3 bg-[#fafafa]">
                      <span className="text-gray-500 font-semibold">8. Contract Duration:</span>
                      <span className="sm:col-span-2 text-gray-800">
                        {selectedOfferForModal.contractDuration || '2 Years Renewable Contract'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6. Special Terms & Benefits Clauses */}
                <div className="space-y-3 text-xs leading-relaxed text-gray-700">
                  <div>
                    <h4 className="font-bold text-[#001b48] uppercase tracking-wide border-b border-gray-100 pb-1">
                      Terms, Entitlements & Medical Cover
                    </h4>
                    <p className="mt-1 text-gray-700">
                      {selectedOfferForModal.specialTerms || 'Full corporate medical cover for self and up to three (3) recognized dependents, standard 21 working days paid annual leave, official laptop asset provisioning, and employer statutory NSSF 10% contribution.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#001b48] uppercase tracking-wide border-b border-gray-100 pb-1">
                      Confidentiality & Code of Conduct
                    </h4>
                    <p className="mt-1 text-gray-700">
                      You will be required to execute the corporate Non-Disclosure Agreement (NDA) and comply with all DataCare Uganda Limited information security protocols, intellectual property guidelines, and the Uganda Data Protection and Privacy Act.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#001b48] uppercase tracking-wide border-b border-gray-100 pb-1">
                      Termination & Notice Period
                    </h4>
                    <p className="mt-1 text-gray-700">
                      During probation, either party may terminate the contract with two (2) weeks written notice. Upon confirmation, the notice period shall be thirty (30) days or payment of salary in lieu of notice.
                    </p>
                  </div>
                </div>

                {/* 7. Dual Signature Blocks */}
                <div className="pt-6 border-t-2 border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Employer Authorizing Signature */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-2">
                    <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider block">
                      For DataCare Uganda Limited:
                    </span>
                    <div className="font-serif italic text-base text-[#001b48] font-black pt-1">
                      Dr. Arthur K.
                    </div>
                    <p className="text-xs font-bold text-gray-800">Managing Director / Appointing Authority</p>
                    <div className="pt-1 flex items-center gap-1.5 text-[10px] text-emerald-800 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Corporate Authorization Hash: 0x4B92...E7A1</span>
                    </div>
                  </div>

                  {/* Candidate Digital Signature Acceptance Block */}
                  <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded space-y-2">
                    <span className="text-[11px] text-emerald-900 font-bold uppercase tracking-wider block">
                      Candidate Digital Acceptance:
                    </span>

                    {selectedOfferForModal.status === 'Accepted' ? (
                      <div className="space-y-1">
                        <div className="font-serif italic text-base text-emerald-800 font-black pt-1">
                          {selectedOfferForModal.signedBy || selectedOfferForModal.candidateName}
                        </div>
                        <p className="text-[11px] text-emerald-700 font-bold">
                          ✓ Verified Electronic Signature ({selectedOfferForModal.signedDate || '16-Aug-2026'})
                        </p>
                        <span className="text-[10px] text-gray-500 font-mono block">
                          Cryptographic e-Sign Status: Formally Executed
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {signatureName ? (
                          <div className="font-serif italic text-base text-[#001b48] font-bold border-b border-gray-300 pb-1">
                            {signatureName}
                          </div>
                        ) : (
                          <div className="h-8 border-b border-dashed border-gray-400 flex items-center text-gray-400 text-xs italic">
                            Type your name below to sign digitally...
                          </div>
                        )}
                        <span className="text-[10px] text-amber-700 font-semibold block">
                          Pending your digital signature below
                        </span>
                      </div>
                    )}
                  </div>

                </div>

              </div>

              {/* 8. Candidate Digital E-Signature Form (if not yet signed) */}
              {selectedOfferForModal.status !== 'Accepted' ? (
                <div className="bg-white border-2 border-[#001b48] p-5 rounded-sm shadow-md space-y-4 max-w-3xl mx-auto">
                  <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                    <PenTool className="w-4 h-4 text-[#001b48]" />
                    <h3 className="font-black text-sm text-[#001b48]">
                      Candidate Digital Offer Acceptance & Electronic Signature
                    </h3>
                  </div>

                  <form onSubmit={handleSignOffer} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">
                        Type Your Full Legal Name as Electronic Signature <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        placeholder={`e.g. ${selectedOfferForModal.candidateName}`}
                        className="w-full bg-white border border-[#cbd5e1] rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#001b48] focus:outline-none font-bold text-[#001b48]"
                        required
                      />
                      {signatureName && (
                        <div className="mt-1 text-[11px] text-gray-500">
                          Digital Signature Calligraphy Preview: <span className="font-serif italic text-sm font-bold text-emerald-800 ml-1">{signatureName}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded space-y-2">
                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={termsAgreed}
                          onChange={(e) => setTermsAgreed(e.target.checked)}
                          className="mt-0.5 rounded text-[#001b48] focus:ring-0 cursor-pointer w-4 h-4"
                          required
                        />
                        <span className="text-[11px] text-gray-800 leading-tight">
                          I, <strong>{signatureName || selectedOfferForModal.candidateName}</strong>, hereby formally accept the offer of employment as <strong>{selectedOfferForModal.position}</strong> under the remuneration, benefits, and conditions stipulated in this appointment letter. I authorize commencement of my departmental induction, asset allocation, and payroll account setup.
                        </span>
                      </label>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadFullOfferLetter(selectedOfferForModal)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Save Copy Before Signing</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowOfferModal(false)}
                          className="px-4 py-2 border border-[#cbd5e1] bg-white hover:bg-slate-50 text-gray-700 rounded text-xs font-semibold cursor-pointer"
                        >
                          Review Later
                        </button>
                        <button
                          type="submit"
                          disabled={!signatureName.trim() || !termsAgreed}
                          className={`px-6 py-2 rounded text-xs font-black shadow-xs flex items-center gap-2 transition-all ${
                            signatureName.trim() && termsAgreed
                              ? 'bg-[#16a34a] hover:bg-[#15803d] text-white cursor-pointer hover:shadow-md'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Sign & Formally Accept Appointment</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-sm text-center space-y-2 max-w-3xl mx-auto">
                  <div className="flex items-center justify-center gap-2 text-emerald-800 font-black text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Appointment Letter Formally Signed & Accepted!</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Your digital acceptance has been confirmed in the ProMISe ERP database. You are now authorized to proceed to New Staff Orientation and Induction.
                  </p>
                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleDownloadFullOfferLetter(selectedOfferForModal)}
                      className="px-4 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Signed Contract</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowOfferModal(false);
                        onNavigate('new-staff-orientation');
                      }}
                      className="px-5 py-1.5 bg-[#001b48] hover:bg-[#003366] text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>Proceed to Staff Orientation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Bottom Footer */}
            <div className="bg-[#f1f5f9] px-6 py-3 border-t border-[#cbd5e1] flex items-center justify-between shrink-0 text-xs">
              <span className="text-[11px] text-gray-500">
                DataCare Uganda Limited • ProMISe ERP e-Recruitment System
              </span>
              <button
                type="button"
                onClick={() => setShowOfferModal(false)}
                className="px-4 py-1.5 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-slate-100 cursor-pointer"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
