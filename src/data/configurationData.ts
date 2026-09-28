import { 
  SalaryGradeConfig, 
  EmploymentTypeConfig, 
  RecruitmentTypeConfig, 
  RecruitmentCategoryConfig, 
  EducationLevelConfig, 
  SupportingDocumentConfig, 
  ReferenceCheckQuestionConfig, 
  SystemRegionConfig 
} from '../types';

export const INITIAL_SALARY_GRADES: SalaryGradeConfig[] = [
  {
    id: 'sg-1',
    gradeCode: '1A',
    title: 'Executive Director / CEO Band',
    bandLevel: 'Executive',
    minSalary: '12,000,000',
    midSalary: '15,500,000',
    maxSalary: '20,000,000',
    currency: 'UGX',
    allowances: '2,500,000',
    status: 'Active',
    applicableDepartments: 'Executive Office, Board of Directors'
  },
  {
    id: 'sg-2',
    gradeCode: '1B',
    title: 'Director / Head of Division',
    bandLevel: 'Senior Executive',
    minSalary: '9,000,000',
    midSalary: '11,000,000',
    maxSalary: '14,000,000',
    currency: 'UGX',
    allowances: '1,800,000',
    status: 'Active',
    applicableDepartments: 'Human Resource, Finance, IT, Operations'
  },
  {
    id: 'sg-3',
    gradeCode: '2A',
    title: 'Principal Specialist / Systems Developer',
    bandLevel: 'Senior Technical',
    minSalary: '4,500,000',
    midSalary: '6,200,000',
    maxSalary: '8,000,000',
    currency: 'UGX',
    allowances: '750,000',
    status: 'Active',
    applicableDepartments: 'Information Technology, Engineering'
  },
  {
    id: 'sg-4',
    gradeCode: '3A',
    title: 'Senior Technical Lead / Senior Officer',
    bandLevel: 'Mid-Senior Level',
    minSalary: '3,800,000',
    midSalary: '5,000,000',
    maxSalary: '6,500,000',
    currency: 'UGX',
    allowances: '600,000',
    status: 'Active',
    applicableDepartments: 'Technical, Operations, Procurement'
  },
  {
    id: 'sg-5',
    gradeCode: '4A',
    title: 'Procurement Specialist / Senior Administrator',
    bandLevel: 'Mid Professional',
    minSalary: '3,000,000',
    midSalary: '4,000,000',
    maxSalary: '5,200,000',
    currency: 'UGX',
    allowances: '500,000',
    status: 'Active',
    applicableDepartments: 'Procurement, Administration, Accounts'
  },
  {
    id: 'sg-6',
    gradeCode: '5A',
    title: 'Monitoring & Evaluation Officer / HR Officer',
    bandLevel: 'Officer Band',
    minSalary: '2,400,000',
    midSalary: '3,200,000',
    maxSalary: '4,200,000',
    currency: 'UGX',
    allowances: '400,000',
    status: 'Active',
    applicableDepartments: 'Monitoring and Evaluation, Human Resource'
  },
  {
    id: 'sg-7',
    gradeCode: '6A',
    title: 'Field Coordinator / Associate Officer',
    bandLevel: 'Associate Level',
    minSalary: '1,600,000',
    midSalary: '2,200,000',
    maxSalary: '2,900,000',
    currency: 'UGX',
    allowances: '300,000',
    status: 'Active',
    applicableDepartments: 'Field Operations, Community Relations'
  },
  {
    id: 'sg-8',
    gradeCode: '7A',
    title: 'Bursar / Administrative Assistant / Trainee',
    bandLevel: 'Entry / Support Level',
    minSalary: '1,100,000',
    midSalary: '1,500,000',
    maxSalary: '1,900,000',
    currency: 'UGX',
    allowances: '200,000',
    status: 'Active',
    applicableDepartments: 'All Departments'
  }
];

export const INITIAL_EMPLOYMENT_TYPES: EmploymentTypeConfig[] = [
  {
    id: 'et-1',
    code: 'PERM-01',
    title: 'Permanent & Pensionable',
    durationMonths: 'Indefinite',
    category: 'Permanent',
    isRenewable: false,
    probationMonths: 6,
    benefitsEligible: true,
    status: 'Active'
  },
  {
    id: 'et-2',
    code: 'FIX-2YR',
    title: '2-Year Fixed-Term Renewable Contract',
    durationMonths: 24,
    category: 'Fixed Term',
    isRenewable: true,
    probationMonths: 6,
    benefitsEligible: true,
    status: 'Active'
  },
  {
    id: 'et-3',
    code: 'PRJ-1YR',
    title: '1-Year Project-Based Specific Hire',
    durationMonths: 12,
    category: 'Fixed Term',
    isRenewable: true,
    probationMonths: 3,
    benefitsEligible: true,
    status: 'Active'
  },
  {
    id: 'et-4',
    code: 'TMP-6MO',
    title: '6-Month Temporary / Relief Cover',
    durationMonths: 6,
    category: 'Temporary',
    isRenewable: false,
    probationMonths: 1,
    benefitsEligible: false,
    status: 'Active'
  },
  {
    id: 'et-5',
    code: 'INT-3MO',
    title: 'Graduate Internship / Student Attachment',
    durationMonths: 3,
    category: 'Internship',
    isRenewable: true,
    probationMonths: 1,
    benefitsEligible: false,
    status: 'Active'
  },
  {
    id: 'et-6',
    code: 'CNS-TBD',
    title: 'Individual Retainer Consultant',
    durationMonths: 'Task-Based',
    category: 'Consultancy',
    isRenewable: true,
    probationMonths: 0,
    benefitsEligible: false,
    status: 'Active'
  }
];

export const INITIAL_RECRUITMENT_TYPES: RecruitmentTypeConfig[] = [
  {
    id: 'rt-1',
    code: 'BOTH',
    title: 'Both External and Internal Recruitment',
    description: 'Concurrent open vacancy advertisement across national media, digital job portals, and internal staff notice boards.',
    isExternal: true,
    isInternal: true,
    requiresApproval: true,
    status: 'Active'
  },
  {
    id: 'rt-2',
    code: 'EXT',
    title: 'External Recruitment',
    description: 'Public advertisement exclusively sourcing external talent from the job market.',
    isExternal: true,
    isInternal: false,
    requiresApproval: true,
    status: 'Active'
  },
  {
    id: 'rt-3',
    code: 'INT-PROMO',
    title: 'Internal Staff Transfer / Promotion',
    description: 'Ring-fenced vacancy open exclusively to confirmed existing staff members seeking career progression.',
    isExternal: false,
    isInternal: true,
    requiresApproval: true,
    status: 'Active'
  },
  {
    id: 'rt-4',
    code: 'PRJ-SPEC',
    title: 'Temporary Contract / Project Hire',
    description: 'Targeted short-term staffing dedicated to specific donor grant objectives or emergency relief work.',
    isExternal: true,
    isInternal: true,
    requiresApproval: true,
    status: 'Active'
  },
  {
    id: 'rt-5',
    code: 'GRAD-TRAIN',
    title: 'Internship / Graduate Trainee Track',
    description: 'Structured entry-level intake for recent university graduates and industrial trainees.',
    isExternal: true,
    isInternal: false,
    requiresApproval: false,
    status: 'Active'
  }
];

export const INITIAL_RECRUITMENT_CATEGORIES: RecruitmentCategoryConfig[] = [
  {
    id: 'rc-1',
    code: 'DIR-MKT',
    title: 'DIRECT MARKETING',
    description: 'Direct corporate social channels, print newspaper advertisement, and careers board publishing.',
    status: 'Active'
  },
  {
    id: 'rc-2',
    code: 'HEAD-HUNT',
    title: 'Head Hunting',
    description: 'Targeted executive search reaching out directly to recognized senior industry leaders.',
    status: 'Active'
  },
  {
    id: 'rc-3',
    code: 'PUB-ADV',
    title: 'Public Advertisement',
    description: 'National gazette, radio announcements, and official government recruitment bulletins.',
    status: 'Active'
  },
  {
    id: 'rc-4',
    code: 'EXEC-SEARCH',
    title: 'Executive Placement',
    description: 'Retained executive recruitment consulting firm engagement.',
    status: 'Active'
  },
  {
    id: 'rc-5',
    code: 'CAMPUS-REC',
    title: 'Campus Recruitment',
    description: 'On-campus career fairs and university faculty partnerships.',
    status: 'Active'
  }
];

export const INITIAL_SUPPORTING_DOCUMENTS: SupportingDocumentConfig[] = [
  {
    id: 'sd-1',
    code: 'DOC-CV',
    title: 'Curriculum Vitae (CV) / Resume',
    category: 'Candidate Profile',
    isMandatory: true,
    allowedExtensions: '.pdf,.doc,.docx',
    maxSizeMb: 5,
    requiresVerification: false,
    status: 'Active'
  },
  {
    id: 'sd-2',
    code: 'DOC-NIN',
    title: 'National Identity Card (NIN / NIRA / Passport)',
    category: 'Identity & Legal',
    isMandatory: true,
    allowedExtensions: '.pdf,.jpg,.png',
    maxSizeMb: 4,
    requiresVerification: true,
    status: 'Active'
  },
  {
    id: 'sd-3',
    code: 'DOC-TRANSCRIPT',
    title: 'Certified Academic Transcripts & Degrees',
    category: 'Academic Credentials',
    isMandatory: true,
    allowedExtensions: '.pdf',
    maxSizeMb: 10,
    requiresVerification: true,
    status: 'Active'
  },
  {
    id: 'sd-4',
    code: 'DOC-GOOD-CONDUCT',
    title: 'INTERPOL / Police Certificate of Good Conduct',
    category: 'Security Clearance',
    isMandatory: false,
    allowedExtensions: '.pdf,.jpg',
    maxSizeMb: 5,
    requiresVerification: true,
    status: 'Active'
  },
  {
    id: 'sd-5',
    code: 'DOC-TIN-NSSF',
    title: 'URA TIN Certificate & NSSF Registration Card',
    category: 'Finance & Statutory',
    isMandatory: true,
    allowedExtensions: '.pdf,.jpg,.png',
    maxSizeMb: 3,
    requiresVerification: true,
    status: 'Active'
  },
  {
    id: 'sd-6',
    code: 'DOC-MED-FIT',
    title: 'Pre-Employment Medical Fitness Report',
    category: 'Health & Safety',
    isMandatory: false,
    allowedExtensions: '.pdf',
    maxSizeMb: 5,
    requiresVerification: true,
    status: 'Active'
  }
];

export const INITIAL_EDUCATION_LEVELS: EducationLevelConfig[] = [
  {
    id: 'el-1',
    code: 'PHD',
    title: 'Doctorate / PhD Degree',
    rankOrder: 1,
    minYearsStudy: 7,
    status: 'Active'
  },
  {
    id: 'el-2',
    code: 'MASTERS',
    title: 'Master’s Degree (MSc, MBA, MA, MEng)',
    rankOrder: 2,
    minYearsStudy: 5,
    status: 'Active'
  },
  {
    id: 'el-3',
    code: 'PGD',
    title: 'Postgraduate Diploma (PGD)',
    rankOrder: 3,
    minYearsStudy: 4.5,
    status: 'Active'
  },
  {
    id: 'el-4',
    code: 'BACHELOR',
    title: 'Bachelor’s Degree (BSc, BA, BCom, BEng, LLB)',
    rankOrder: 4,
    minYearsStudy: 3.5,
    status: 'Active'
  },
  {
    id: 'el-5',
    code: 'HND-DIP',
    title: 'Higher National Diploma / Ordinary Diploma',
    rankOrder: 5,
    minYearsStudy: 2,
    status: 'Active'
  },
  {
    id: 'el-6',
    code: 'CERT',
    title: 'Vocational Certificate / UACE (A-Level)',
    rankOrder: 6,
    minYearsStudy: 1,
    status: 'Active'
  }
];

export const INITIAL_REFERENCE_QUESTIONS: ReferenceCheckQuestionConfig[] = [
  {
    id: 'rq-1',
    code: 'REF-INT-01',
    questionText: 'How would you rate the candidate’s honesty, fiduciary integrity, and professional ethical standards?',
    category: 'Integrity & Ethics',
    responseType: 'Rating Scale 1-5',
    isRequired: true,
    status: 'Active'
  },
  {
    id: 'rq-2',
    code: 'REF-PERF-02',
    questionText: 'Did the candidate consistently meet core KPIs, project milestones, and technical quality standards?',
    category: 'Technical Performance',
    responseType: 'Rating Scale 1-5',
    isRequired: true,
    status: 'Active'
  },
  {
    id: 'rq-3',
    code: 'REF-REHIRE-03',
    questionText: 'Given the opportunity, would your organization re-hire this candidate without reservation?',
    category: 'Reliability',
    responseType: 'Yes/No with Notes',
    isRequired: true,
    status: 'Active'
  },
  {
    id: 'rq-4',
    code: 'REF-LEAD-04',
    questionText: 'How effectively does the candidate manage team conflict, cross-functional collaboration, and pressure?',
    category: 'Leadership',
    responseType: 'Rating Scale 1-5',
    isRequired: false,
    status: 'Active'
  },
  {
    id: 'rq-5',
    code: 'REF-LEAVE-05',
    questionText: 'What were the candidate’s primary reasons for separation from your organization?',
    category: 'Reliability',
    responseType: 'Free Text Commentary',
    isRequired: true,
    status: 'Active'
  }
];

export const INITIAL_SYSTEM_REGIONS: SystemRegionConfig[] = [
  {
    id: 'reg-1',
    code: 'REG-CENTRAL',
    name: 'Central Region (Kampala Metropolitan & Surrounds)',
    zoneType: 'Metropolitan',
    districtsCovered: ['Kampala', 'Wakiso', 'Mukono', 'Mpigi', 'Entebbe'],
    regionalLeader: 'Arthur Tumusiime (Zonal Director)',
    status: 'Active'
  },
  {
    id: 'reg-2',
    code: 'REG-WESTERN',
    name: 'Western Regional Hub (Mbarara / Kabale / Fort Portal)',
    zoneType: 'Regional Hub',
    districtsCovered: ['Mbarara', 'Kabarole', 'Kabale', 'Bushenyi', 'Kasese'],
    regionalLeader: 'Grace Muhwezi (Regional Lead)',
    status: 'Active'
  },
  {
    id: 'reg-3',
    code: 'REG-EASTERN',
    name: 'Eastern Regional Hub (Jinja / Mbale / Tororo)',
    zoneType: 'Regional Hub',
    districtsCovered: ['Jinja', 'Mbale', 'Tororo', 'Iganga', 'Soroti'],
    regionalLeader: 'Moses Wanyama (Operations Officer)',
    status: 'Active'
  },
  {
    id: 'reg-4',
    code: 'REG-NORTHERN',
    name: 'Northern Regional Zone (Gulu / Lira / Arua)',
    zoneType: 'Regional Hub',
    districtsCovered: ['Gulu', 'Lira', 'Arua', 'Kitgum', 'Nebbi'],
    regionalLeader: 'Richard Okot (Field Supervisor)',
    status: 'Active'
  },
  {
    id: 'reg-5',
    code: 'REG-DIASPORA',
    name: 'Diaspora & International Hubs (Kenya, EAC & Global)',
    zoneType: 'International',
    districtsCovered: ['Nairobi Hub', 'Kigali Liaison', 'London Expatriate Desk'],
    regionalLeader: 'Juliet Atuhaire (International Coordinator)',
    status: 'Active'
  }
];
