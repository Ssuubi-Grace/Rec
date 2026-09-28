export interface Requisition {
  id: string;
  reqNo: string;
  department: string;
  position: string;
  type: string;
  category: string;
  salaryScale: string;
  reportsTo: string;
  dateOfReporting: string;
  vacancies: number;
  budget: string;
  currency?: string; // Multi-country currency: UGX, USD, EUR, GBP, KES, TZS, RWF, ZAR, etc.
  status: 'Approved' | 'Not Submitted' | 'Pending HR' | 'Pending Finance' | 'Pending Approval' | 'Rejected' | 'Returned for Revision';
  description?: string;
  minAge?: number;
  maxAge?: number;
  educationLevel?: string;
  minExperience?: number;
  gender?: 'Either' | 'Male' | 'Female';
  region?: string;
  county?: string;
  requirePsychometricTest?: boolean;
  assignedTestId?: string;
  assessmentSections?: string[];
  stage?: 'Requisition' | 'Shortlisting' | 'Assessment' | 'Interview' | 'Offer' | 'Orientation' | 'Filled';
  
  // Approval Workflow Fields
  assignedApprover?: string;
  approverRole?: string;
  submittedAt?: string;
  submittedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  approvalRemarks?: string;
  rejectionReason?: string;
  revisionNotes?: string;

  // Career Portal Publishing
  isPublished?: boolean;
  publishedDate?: string;
  
  // Job Advert & JD Format (Template vs Attachment)
  jdFormat?: 'template' | 'attachment';
  attachedJdFileName?: string;
  attachedJdFileSize?: string;
  attachedJdFileUrl?: string;
  attachedJdNotes?: string;

  // Rich Job Advert / JD In-System Details
  advertTemplate?: string;
  rolePurpose?: string;
  keyResponsibilities?: string[];
  requiredQualifications?: string[];
  requiredSkills?: string[];
  assessmentMethodology?: string;
  applicationDeadline?: string;
}

export interface CandidateProfile {
  // 1. Personal Information
  firstName: string;
  lastName: string;
  middleNameInitial?: string;
  email: string;
  phone: string;
  homePhone?: string;
  phoneCountryCode?: string;
  dateOfBirth?: string;
  countryOfOrigin?: string;
  nationality?: string;
  gender: 'Male' | 'Female' | 'Other';
  maritalStatus?: string;
  city?: string;
  hasDisability?: boolean;
  disabilityDetails?: string;
  nationalId?: string;

  // 2. Education Background
  educationHistory?: {
    institutionName: string;
    address: string;
    qualificationAttained: string;
    educationLevel: string;
    startDate: string;
    endDate: string;
  }[];

  // 3. Employment History
  employmentHistory?: {
    nameOfOrganisation: string;
    jobTitle: string;
    fromDate: string;
    toDate: string;
    reasonForLeaving?: string;
  }[];

  // 4. Competence Profile
  minSalaryExpectation?: string;
  maxSalaryExpectation?: string;
  salaryCurrency?: string;
  yearsOfExperience?: number;
  relevantExperience?: string;
  languages?: {
    language: string;
    readingProficiency: string;
    speakingProficiency: string;
  }[];
  skills?: string[];
  interestsAndHobbies?: string[];

  // 5. References and Availability
  noticePeriodMonths?: string;
  howDidYouLearnAboutJob?: string;
  availableIn?: string;
  referees?: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
    position: string;
  }[];

  // 6. Supporting Documents
  documents?: {
    type: 'Curriculum Vitae (CV)' | 'Cover Letter' | 'Academic Certificates' | 'National ID' | 'Other';
    description: string;
    fileName: string;
    fileUrl?: string;
  }[];

  isCompleted?: boolean;
  completionPercentage?: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  homePhone?: string;
  countryCode: string;
  requisitionId: string;
  position: string;
  department: string;
  age: number;
  gender: 'Male' | 'Female';
  educationLevel: string;
  institution?: string;
  fieldOfStudy?: string;
  yearsOfExperience: number;
  employmentHistory: string;
  previousEmployer?: string;
  coverLetter?: string;
  resumeUrl?: string;
  notes?: string;
  appliedDate: string;
  status: 'Applied' | 'Pre-Shortlisted' | 'Assessment Sent' | 'Test Completed' | 'Interview Scheduled' | 'Interview Evaluated' | 'Selected' | 'Offer Issued' | 'Offer Accepted' | 'Offer Declined' | 'Orientation' | 'Hired' | 'Talent Pool' | 'Rejected';
  matchScore: number;
  nationalId?: string;
  region?: string;
  fieldRegion?: string;
  county?: string;
  districtOfOrigin?: string;
  skills?: string[];
  talentPoolTag?: string;
  talentPoolNotes?: string;
  
  // Psychometric testing data
  testScore?: number;
  testStatus?: 'Not Required' | 'Pending' | 'Passed' | 'Failed';
  testCompletedAt?: string;
  
  // Interview scoring & Invitation
  interviewScore?: number;
  panelRemarks?: string;
  interviewRecommendation?: 'Highly Recommended' | 'Recommended' | 'Backup' | 'Not Recommended' | 'Hold For Future Considerations' | 'Recommend for Appointment';
  panelists?: string[];
  interviewDate?: string;
  interviewTime?: string;
  interviewVenue?: string;
  interviewInvited?: boolean;
  interviewConfirmedByCandidate?: boolean;

  // Rejection / Decline details
  declineReason?: string;
  declineMessage?: string;
  declinedDate?: string;
  declinedStage?: string;
  notifyCandidateByEmail?: boolean;
  
  // Offer data
  offerDetails?: OfferLetter;
  
  // Onboarding data
  onboardingProgress?: number;
  onboardingStage?: 'Documentation' | 'IT Provisioning' | 'Department Induction' | 'Completed';
  
  // Talent pool data
  talentTag?: 'Runner-up' | 'High Potential' | 'Overqualified' | 'Future Fit' | 'Wrong Timing';
  talentNotes?: string;
  retainedDate?: string;
}

export interface QuestionOption {
  key: string;
  text: string;
}

export interface TestSectionDefinition {
  id: string;
  title: string;
  categoryType?: string;
  description?: string;
  timeLimitMinutes?: number;
  weightPercentage?: number;
  passMarkPercentage?: number;
  instructions?: string;
  questionCount?: number;
}

export interface TestQuestion {
  id: string;
  section?: 'numerical' | 'logical' | 'verbal' | 'situational' | 'technical' | string;
  sectionId?: string;
  sectionTitle?: string;
  text: string;
  options: QuestionOption[];
  correctKey: string;
  points: number;
}

export interface PsychometricTest {
  id: string;
  title: string;
  category: 'Logical Reasoning' | 'Numerical Aptitude' | 'Situational Judgment & EQ' | 'Technical Aptitude' | 'Leadership Fit' | 'Comprehensive All-Sections';
  targetRole?: string;
  deliveryMode?: 'mixed' | 'sectional'; // 'mixed' for single pool, 'sectional' for separate sections
  durationMinutes: number;
  passingScorePct: number;
  mappedCategories: string[];
  sections?: string[]; // e.g. ['numerical', 'logical', 'verbal', 'situational', 'technical']
  sectionDefinitions?: TestSectionDefinition[]; // Detailed section metadata
  sectionWeights?: Record<string, number>; // e.g. { numerical: 25, logical: 25, ... }
  questions: TestQuestion[];
  status?: 'Active' | 'Pending Approval' | 'Draft' | 'Needs Revision' | 'Rejected' | 'Archived';
  createdBy?: string;
  createdDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  approvalComments?: string;
  rejectionReason?: string;
  revisionNotes?: string;
}

export interface OfferLetter {
  id: string;
  candidateId: string;
  candidateName: string;
  position: string;
  department: string;
  salaryScale?: string;
  basicSalary?: string;
  grossSalaryMonthly?: string;
  allowances?: string;
  contractDuration?: string;
  startDate: string;
  probationMonths: number;
  reportingSupervisor?: string;
  acceptanceDeadline?: string;
  specialTerms?: string;
  benefits?: string[];
  issuedDate: string;
  status: 'Draft' | 'Pending Approval' | 'Issued' | 'Accepted' | 'Declined' | 'Rejected' | 'Returned for Revision';
  signedBy?: string;
  signedDate?: string;
  signatureData?: string;
  declineReason?: string;
  approvedBy?: string;
  approvedDate?: string;
  approvalComments?: string;
  rejectionReason?: string;
  revisionNotes?: string;

  // Document Format: Template vs Attachment
  documentSource?: 'template' | 'attachment';
  attachedFileName?: string;
  attachedFileSize?: string;
  attachedFileUrl?: string;
  attachedFileNotes?: string;
  customTemplateTitle?: string;
  customTemplateBody?: string;
}

export type DocumentCategoryType = 
  | 'appointment_letter'
  | 'employment_contract'
  | 'nda'
  | 'handbook'
  | 'payroll_form'
  | 'academic_verification'
  | 'other';

export interface OnboardingDocumentTemplate {
  id: string;
  category: DocumentCategoryType;
  title: string;
  code: string;
  description: string;
  defaultDeliveryMode: 'template' | 'attachment';
  templateBody: string;
  attachedFileName?: string;
  attachedFileSize?: string;
  attachedFileDate?: string;
  attachedFileUrl?: string;
  version: string;
  lastUpdated: string;
  updatedBy: string;
  requiresSignature: boolean;
  applicableRoles?: string;
}

export interface CandidateDocumentRecord {
  id: string;
  candidateId: string;
  candidateName?: string;
  documentCategory: DocumentCategoryType;
  title: string;
  source: 'template' | 'attachment';
  templateBody?: string;
  attachedFileName?: string;
  attachedFileSize?: string;
  status: 'Pending Signature' | 'Pending Submission' | 'Action Required' | 'Signed' | 'Submitted' | 'Verified';
  signedDate?: string;
  signedBy?: string;
  signatureHash?: string;
  verifiedBy?: string;
  verifiedDate?: string;
}

export interface OnboardingTaskItem {
  id: string;
  candidateId?: string;
  taskName?: string;
  title?: string;
  category: string;
  isMandatory?: boolean;
  completed?: boolean;
  status?: 'Pending' | 'In Progress' | 'Completed';
  completedAt?: string;
  completedDate?: string;
  assignedOfficer?: string;
  assignedRole?: string;
}

export interface ApprovalTask {
  id: string;
  taskType?: 'Requisition Approval' | 'Candidate Offer Approval' | 'Staff Profile Activation' | 'Psychometric Test Approval' | string;
  module?: string;
  title: string;
  referenceNo?: string;
  department?: string;
  initiator?: string;
  submittedBy?: string;
  dateSubmitted?: string;
  submittedDate?: string;
  targetRole?: string;
  currentApprover?: string;
  priority?: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Returned';
  details?: string;
  comments?: string;
  rejectionReason?: string;
  revisionNotes?: string;
  actionBy?: string;
  actionDate?: string;
  relatedEntityId?: string;
  relatedEntityType?: 'requisition' | 'offer' | 'test' | 'candidate' | 'staff';
}

export interface CountryDialCode {
  iso: string;
  name: string;
  dialCode: string;
}

export interface SalaryGradeConfig {
  id: string;
  gradeCode: string;
  title: string;
  bandLevel: string;
  minSalary: string;
  midSalary: string;
  maxSalary: string;
  currency: string;
  allowances: string;
  status: 'Active' | 'Inactive';
  applicableDepartments?: string;
}

export interface EmploymentTypeConfig {
  id: string;
  code: string;
  title: string;
  durationMonths: number | string;
  category: 'Permanent' | 'Fixed Term' | 'Temporary' | 'Internship' | 'Consultancy';
  isRenewable: boolean;
  probationMonths: number;
  benefitsEligible: boolean;
  status: 'Active' | 'Inactive';
}

export interface RecruitmentTypeConfig {
  id: string;
  code: string;
  title: string;
  description: string;
  isExternal: boolean;
  isInternal: boolean;
  requiresApproval: boolean;
  status: 'Active' | 'Inactive';
}

export interface RecruitmentCategoryConfig {
  id: string;
  code: string;
  title: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface EducationLevelConfig {
  id: string;
  code: string;
  title: string;
  rankOrder: number;
  minYearsStudy: number;
  status: 'Active' | 'Inactive';
}

export interface SupportingDocumentConfig {
  id: string;
  code: string;
  title: string;
  category: string;
  isMandatory: boolean;
  allowedExtensions: string;
  maxSizeMb: number;
  requiresVerification: boolean;
  status: 'Active' | 'Inactive';
}

export interface ReferenceCheckQuestionConfig {
  id: string;
  code: string;
  questionText: string;
  category: 'Integrity & Ethics' | 'Technical Performance' | 'Leadership' | 'Reliability';
  responseType: 'Rating Scale 1-5' | 'Yes/No with Notes' | 'Free Text Commentary';
  isRequired: boolean;
  status: 'Active' | 'Inactive';
}

export interface SystemRegionConfig {
  id: string;
  code: string;
  name: string;
  zoneType: 'Metropolitan' | 'Regional Hub' | 'Field Sector' | 'International';
  districtsCovered: string[];
  regionalLeader: string;
  status: 'Active' | 'Inactive';
}

