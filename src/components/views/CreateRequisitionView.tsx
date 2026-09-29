import React, { useState, useEffect } from 'react';
import { RichTextEditor } from '../ui/RichTextEditor';
import { richTextToLines } from '../../utils/richText';
import { 
  ArrowLeft,
  ArrowRight,
  Save, 
  Sparkles, 
  CheckSquare, 
  BrainCircuit, 
  Upload, 
  FileText, 
  DollarSign,
  Building2,
  Briefcase,
  ShieldCheck,
  Send,
  Paperclip,
  CheckCircle,
  CheckCircle2,
  FileCheck,
  Calendar,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';
import { RequisitionStepper, REQUISITION_WIZARD_STEPS } from '../ui/RequisitionStepper';
import { Requisition } from '../../types';
import { 
  DEPARTMENTS, 
  SALARY_SCALES, 
  RECRUITMENT_TYPES, 
  RECRUITMENT_CATEGORIES, 
  EDUCATION_LEVELS, 
  CURRENCIES,
  JOB_ADVERT_TEMPLATES,
  DESIGNATED_APPROVERS
} from '../../data/mockData';
import { ActiveView } from '../layout/Navbar';
import { ConfirmationModal, SummaryItem } from '../modals/ConfirmationModal';
import { useToast } from '../../context/ToastContext';

interface CreateRequisitionViewProps {
  onNavigate: (view: ActiveView) => void;
  onSaveRequisition: (req: Partial<Requisition>) => void;
  initialData?: Requisition | null;
  onClose?: () => void;
  embedded?: boolean;
}

export const CreateRequisitionView: React.FC<CreateRequisitionViewProps> = ({
  onNavigate,
  onSaveRequisition,
  initialData,
  onClose,
  embedded = false,
}) => {
  const { showSuccess, showWarning } = useToast();

  // Helper to convert date strings like '04 -Sep -2026' or '2026-09-04' to YYYY-MM-DD for <input type="date" />
  const formatDateToYMD = (dateStr?: string): string => {
    if (!dateStr) return '';
    // Already in YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
      return dateStr.trim();
    }
    // Parse formats like '04 -Sep -2026', '04-Sep-2026', '15 Sep 2026'
    const cleaned = dateStr.replace(/\s+/g, ' ').trim();
    const parsed = new Date(cleaned);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return '';
  };

  // Helper to format YYYY-MM-DD into human-readable display e.g. 04-Sep-2026
  const formatYMDToDisplay = (ymdStr: string): string => {
    if (!ymdStr) return '';
    const [y, m, d] = ymdStr.split('-');
    if (!y || !m || !d) return ymdStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[parseInt(m, 10) - 1] || m;
    return `${d}-${monthName}-${y}`;
  };

  const [department, setDepartment] = useState(initialData?.department || '-select-');
  const [position, setPosition] = useState(initialData?.position || '');
  const [salaryScale, setSalaryScale] = useState(initialData?.salaryScale || '5A - Administration');
  const [recruitmentType, setRecruitmentType] = useState(initialData?.type || '-select-');
  const [recruitmentCategory, setRecruitmentCategory] = useState(initialData?.category || '-select-');
  const [reportsTo, setReportsTo] = useState(initialData?.reportsTo || '-select-');
  const [dateOfReporting, setDateOfReporting] = useState(
    initialData?.dateOfReporting ? (formatDateToYMD(initialData.dateOfReporting) || initialData.dateOfReporting) : '2026-09-04'
  );
  const [budget, setBudget] = useState(initialData?.budget || '5,000,000');
  const [currency, setCurrency] = useState(initialData?.currency || 'UGX');
  const [vacancies, setVacancies] = useState<number>(initialData?.vacancies || 2);
  const [description, setDescription] = useState(initialData?.description || '');
  
  // Pre-shortlist conditions
  const [minAge, setMinAge] = useState<string>(initialData?.minAge ? String(initialData.minAge) : '22');
  const [maxAge, setMaxAge] = useState<string>(initialData?.maxAge ? String(initialData.maxAge) : '45');
  const [educationLevel, setEducationLevel] = useState(initialData?.educationLevel || 'Bachelor Degree');
  const [minExperience, setMinExperience] = useState<string>(initialData?.minExperience ? String(initialData.minExperience) : '2');
  const [gender, setGender] = useState<'Either' | 'Male' | 'Female'>(initialData?.gender || 'Either');
  const [requirePsychometricTest, setRequirePsychometricTest] = useState<boolean>(initialData?.requirePsychometricTest ?? false);
  const [assignedTestId, setAssignedTestId] = useState<string>(initialData?.assignedTestId || 'test-tech-1');
  const [assessmentSections, setAssessmentSections] = useState<string[]>(
    initialData?.assessmentSections || ['numerical', 'logical', 'verbal', 'situational', 'technical']
  );

  // JD / Job Advert Format Selection: Template vs External Attachment
  const [jdFormat, setJdFormat] = useState<'template' | 'attachment'>(initialData?.jdFormat || 'template');
  const [attachedJdFileName, setAttachedJdFileName] = useState<string>(
    initialData?.attachedJdFileName || ''
  );
  const [attachedJdFileSize, setAttachedJdFileSize] = useState<string>(
    initialData?.attachedJdFileSize || ''
  );
  const [attachedJdNotes, setAttachedJdNotes] = useState<string>(
    initialData?.attachedJdNotes || ''
  );

  // In-System Job Advert / JD Builder & Templates
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialData?.advertTemplate || 'tpl-dev');
  const [rolePurpose, setRolePurpose] = useState<string>(initialData?.rolePurpose || '');
  const [keyResponsibilitiesText, setKeyResponsibilitiesText] = useState<string>(
    initialData?.keyResponsibilities?.join('\n') || ''
  );
  const [requiredQualificationsText, setRequiredQualificationsText] = useState<string>(
    initialData?.requiredQualifications?.join('\n') || ''
  );
  const [requiredSkillsText, setRequiredSkillsText] = useState<string>(
    initialData?.requiredSkills?.join('\n') || ''
  );
  const [assessmentMethodology, setAssessmentMethodology] = useState<string>(
    initialData?.assessmentMethodology || 'Stage 1: Automated pre-screening; Stage 2: Logical & Technical Psychometrics; Stage 3: Competence Panel Interview.'
  );
  const [applicationDeadline, setApplicationDeadline] = useState<string>(
    initialData?.applicationDeadline ? (formatDateToYMD(initialData.applicationDeadline) || initialData.applicationDeadline) : '2026-09-15'
  );

  // Approval Routing & Governance
  const [assignedApprover, setAssignedApprover] = useState<string>(
    initialData?.assignedApprover || DESIGNATED_APPROVERS[1]?.name || 'Sarah Namubiru (HR Director)'
  );
  const [approvalPriority, setApprovalPriority] = useState<'Normal' | 'High' | 'Urgent'>('High');
  const [submissionRemarks, setSubmissionRemarks] = useState<string>(initialData?.approvalRemarks || '');

  const [step, setStep] = useState(1);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Quick-wizard fields merged into unified flow
  const [employmentType, setEmploymentType] = useState('Permanent');
  const [workLocation, setWorkLocation] = useState('Headquarters (Kampala)');

  const [recruitmentReason, setRecruitmentReason] = useState<'fill_vacancy' | 'replace_employee' | 'new_position' | 'expansion'>('fill_vacancy');
  const [replacedEmployee, setReplacedEmployee] = useState('');
  const [replacementReason, setReplacementReason] = useState('Resignation');

  const [fieldOfStudy, setFieldOfStudy] = useState('Computer Science / IT');
  const [skills, setSkills] = useState<{ name: string; level: 'Required' | 'Preferred' | 'Advantage' }[]>([
    { name: 'Python', level: 'Required' },
    { name: 'Systems Analysis', level: 'Required' },
    { name: 'SQL & Database Design', level: 'Required' },
    { name: 'Project Management', level: 'Preferred' },
  ]);
  const [newSkillName, setNewSkillName] = useState('');

  const [recruitmentRoute, setRecruitmentRoute] = useState<'Internal' | 'External' | 'Internal + External'>('Internal + External');
  const todayYMD = new Date().toISOString().slice(0, 10);
  const defaultClosingYMD = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const [publishDate, setPublishDate] = useState(
    formatDateToYMD(initialData?.plannedPublishDate || initialData?.publishedDate) || todayYMD
  );
  const [closingDate, setClosingDate] = useState(
    formatDateToYMD(initialData?.applicationDeadline) || defaultClosingYMD
  );
  const [channels, setChannels] = useState({
    careerPortal: true,
    staffPortal: true,
    linkedIn: false,
    externalBoard: false,
  });
  const [recruitmentLead, setRecruitmentLead] = useState('Grace Ssuubi (Senior Talent Officer)');
  const [hiringManager, setHiringManager] = useState('Head of ICT');

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([...skills, { name: newSkillName.trim(), level: 'Required' }]);
    setNewSkillName('');
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const validateStep = (targetStep: number): boolean => {
    if (targetStep >= 2 && (department === '-select-' || !position || !dateOfReporting)) {
      showWarning('Please complete all mandatory position fields marked with (*).', 'Position Details Required');
      setStep(1);
      return false;
    }
    if (targetStep >= 4 && jdFormat === 'attachment' && !attachedJdFileName && !attachedJdNotes) {
      showWarning('Please upload a JD document or provide summary notes before continuing.', 'Job Description Required');
      setStep(4);
      return false;
    }
    return true;
  };

  const goToStep = (next: number) => {
    if (next > step && !validateStep(next)) return;
    setStep(next);
  };

  // When template is changed, load into the in-system fields
  const applyTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    if (tplId === 'custom') {
      return;
    }
    const tpl = JOB_ADVERT_TEMPLATES.find(t => t.id === tplId);
    if (tpl) {
      if (!position) setPosition(tpl.position);
      if (department === '-select-') setDepartment(tpl.department);
      setRolePurpose(tpl.rolePurpose);
      setKeyResponsibilitiesText(tpl.keyResponsibilities.join('\n'));
      setRequiredQualificationsText(tpl.requiredQualifications.join('\n'));
      setRequiredSkillsText(tpl.requiredSkills.join('\n'));
      setAssessmentMethodology(tpl.assessmentMethodology);
      setDescription(tpl.rolePurpose);
    }
  };

  // Initialize with default template if not editing
  useEffect(() => {
    if (!initialData && selectedTemplateId === 'tpl-dev' && !rolePurpose && jdFormat === 'template') {
      applyTemplate('tpl-dev');
    }
  }, [initialData]);

  // Handle Mock File Upload for Attached JD
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedJdFileName(file.name);
      setAttachedJdFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    }
  };

  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingTargetStatus, setPendingTargetStatus] = useState<'Not Submitted' | 'Pending HR'>('Pending HR');
  const [modalRemarks, setModalRemarks] = useState(submissionRemarks);

  const initiateSave = (targetStatus: 'Not Submitted' | 'Pending HR') => {
    if (!validateStep(6)) return;

    setPendingTargetStatus(targetStatus);
    setModalRemarks(submissionRemarks);
    setShowConfirmModal(true);
  };

  const handleConfirmSubmission = () => {
    setShowConfirmModal(false);
    handleExecuteSave(pendingTargetStatus, modalRemarks);
  };

  const handleExecuteSave = (targetStatus: 'Not Submitted' | 'Pending HR', finalRemarks?: string) => {
    const keyResponsibilities = richTextToLines(keyResponsibilitiesText);
    const requiredQualifications = richTextToLines(requiredQualificationsText);
    const parsedSkillsText = richTextToLines(requiredSkillsText);
    const requiredSkills = parsedSkillsText.length > 0
      ? parsedSkillsText
      : skills.map(s => s.name);

    const effectiveRemarks = finalRemarks !== undefined ? finalRemarks : submissionRemarks;

    const newReq: Partial<Requisition> = {
      ...(initialData ? { id: initialData.id, reqNo: initialData.reqNo } : {}),
      department,
      position,
      salaryScale,
      type: recruitmentType === '-select-' ? 'Both External and Internal Recruitment' : recruitmentType,
      category: recruitmentCategory === '-select-' ? 'DIRECT MARKETING' : recruitmentCategory,
      reportsTo: reportsTo === '-select-' ? 'General Manager' : reportsTo,
      dateOfReporting: dateOfReporting ? formatYMDToDisplay(dateOfReporting) : '04 -Sep -2026',
      budget: budget || '5,000,000',
      currency: currency || 'UGX',
      vacancies: Number(vacancies) || 1,
      description: description || rolePurpose || (attachedJdFileName ? `External JD Document: ${attachedJdFileName}` : ''),
      minAge: minAge ? Number(minAge) : 21,
      maxAge: maxAge ? Number(maxAge) : 45,
      educationLevel: educationLevel === '-select-' ? 'Bachelor Degree' : educationLevel,
      minExperience: minExperience ? Number(minExperience) : 2,
      gender,
      requirePsychometricTest,
      assignedTestId: requirePsychometricTest ? assignedTestId : undefined,
      assessmentSections: requirePsychometricTest ? assessmentSections : undefined,
      status: targetStatus,
      isPublished: false,
      stage: 'Requisition',
      
      // Approval fields
      createdDate: initialData?.createdDate || formatYMDToDisplay(todayYMD),
      submittedDate: targetStatus === 'Pending HR'
        ? (initialData?.submittedDate || formatYMDToDisplay(todayYMD))
        : initialData?.submittedDate,
      assignedApprover,
      submittedAt: targetStatus === 'Pending HR' ? 'Just now' : undefined,
      submittedBy: 'Department Head / Requisition Author',
      approvalRemarks: effectiveRemarks || (targetStatus === 'Pending HR' ? 'Requisition and Job Advert submitted for executive review.' : undefined),
      
      // Job Advert / JD Format
      jdFormat,
      attachedJdFileName: jdFormat === 'attachment' ? (attachedJdFileName || 'Approved_Job_Description_Spec.pdf') : undefined,
      attachedJdFileSize: jdFormat === 'attachment' ? (attachedJdFileSize || '1.8 MB') : undefined,
      attachedJdNotes: jdFormat === 'attachment' ? attachedJdNotes : undefined,

      // In-System Authored Job Advert
      advertTemplate: jdFormat === 'template' ? selectedTemplateId : undefined,
      rolePurpose: jdFormat === 'template' ? (rolePurpose || description) : attachedJdNotes,
      keyResponsibilities: jdFormat === 'template' && keyResponsibilities.length > 0 ? keyResponsibilities : [
        'Lead core functional duties and project deliverables aligned to departmental key performance targets.',
        'Collaborate with multi-disciplinary stakeholders to deliver measurable results on schedule.'
      ],
      requiredQualifications: jdFormat === 'template' && requiredQualifications.length > 0 ? requiredQualifications : [
        `${educationLevel} in a relevant field of study from a recognized university.`,
        `Minimum ${minExperience || 2} years of relevant professional experience.`
      ],
      requiredSkills: jdFormat === 'template' && requiredSkills.length > 0 ? requiredSkills : [
        'Professional ethics, problem solving, and effective communication'
      ],
      assessmentMethodology,
      plannedPublishDate: publishDate ? formatYMDToDisplay(publishDate) : undefined,
      applicationDeadline: closingDate ? formatYMDToDisplay(closingDate) : (applicationDeadline ? formatYMDToDisplay(applicationDeadline) : undefined)
    };

    onSaveRequisition(newReq);
    
    if (targetStatus === 'Not Submitted') {
      const msg = 'Requisition saved as Draft (Not Submitted). You can review or edit anytime before submitting for approval.';
      setSavedSuccessMsg(`✓ ${msg}`);
      showSuccess(msg, 'Draft Requisition Saved');
    } else {
      const msg = `Requisition & Job Advert submitted for approval to ${assignedApprover}! Once approved, it can be published to the Careers Portal.`;
      setSavedSuccessMsg(`✓ ${msg}`);
      showSuccess(msg, 'Requisition Submitted for Sign-off');
    }

    setTimeout(() => {
      if (onClose) onClose();
      else onNavigate('new-staff-requests');
    }, 1200);
  };

  return (
    <div className={`space-y-4 ${embedded ? '' : 'max-w-6xl mx-auto'} app-form animate-in fade-in duration-200`}>
      {!embedded && (
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => (onClose ? onClose() : onNavigate('new-staff-requests'))}
          className="btn btn-secondary"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {savedSuccessMsg && (
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold">
            {savedSuccessMsg}
          </span>
        )}
      </div>
      )}

      {/* Main Card */}
      <div className="page-card overflow-hidden flex flex-col max-h-[min(68vh,640px)]">
        <RequisitionStepper
          steps={REQUISITION_WIZARD_STEPS}
          currentStep={step}
          onStepClick={goToStep}
        />

        {!embedded && (
        <div className="px-4 py-2 text-xs flex items-center border-b" style={{ background: 'var(--color-primary-light)', borderColor: 'rgb(0 92 185 / 0.2)', color: 'var(--color-primary-dark)' }}>
          <ShieldCheck className="w-4 h-4 shrink-0 mr-2" style={{ color: 'var(--color-primary)' }} />
          <span><strong>Staff Requisition Wizard:</strong> Position → Staffing → Requirements → JD → Plan → Submit</span>
        </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); if (step === 6) initiateSave('Pending HR'); }} className="app-form flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* STEP 1: POSITION & ESTABLISHMENT */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slate-900">Step 1 — Position &amp; Establishment</h3>
                <p className="text-xs text-slate-500">
                  Enter the role and how many positions you are requesting on this requisition. Final approval is at Step 6 when you submit to governance.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Department */}
                <div>
                  <label className="block text-[#334155] font-bold mb-1">
                    Department / Division <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                  >
                    <option value="-select-">-select-</option>
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Position */}
                <div>
                  <label className="block text-[#334155] font-bold mb-1">
                    Position Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="e.g. Senior Software Engineer, Operations Manager"
                    required
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none font-semibold text-gray-900"
                  />
                </div>

                {/* Recruitment Type */}
                <div>
                  <label className="block text-[#334155] font-bold mb-1">
                    Recruitment Type
                  </label>
                  <select
                    value={recruitmentType}
                    onChange={(e) => setRecruitmentType(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                  >
                    <option value="-select-">-select-</option>
                    {RECRUITMENT_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[#334155] font-bold mb-1">
                    Recruitment Category
                  </label>
                  <select
                    value={recruitmentCategory}
                    onChange={(e) => setRecruitmentCategory(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                  >
                    <option value="-select-">-select-</option>
                    {RECRUITMENT_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Salary Scale */}
                <div>
                  <label className="block text-[#334155] font-bold mb-1">
                    Salary Scale / Grade Band
                  </label>
                  <select
                    value={salaryScale}
                    onChange={(e) => setSalaryScale(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                  >
                    {SALARY_SCALES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Reports To */}
                <div>
                  <label className="block text-[#334155] font-bold mb-1">
                    Reports To (Supervisor Designation)
                  </label>
                  <select
                    value={reportsTo}
                    onChange={(e) => setReportsTo(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                  >
                    <option value="-select-">-select-</option>
                    <option value="I.T - IT MANAGER">I.T - IT MANAGER</option>
                    <option value="Admin - General Manager">Admin - General Manager</option>
                    <option value="HR - HR Manager">HR - HR Manager</option>
                    <option value="Finance - Head of Finance">Finance - Head of Finance</option>
                    <option value="Managing Director">Managing Director</option>
                  </select>
                </div>

                {/* Date of Reporting */}
                <div>
                  <label className="block text-[#334155] font-bold mb-1 flex items-center justify-between">
                    <span>Expected Date of Reporting <span className="text-red-500">*</span></span>
                    {dateOfReporting && (
                      <span className="text-[11px] font-semibold text-[#0284c7]">
                        {formatYMDToDisplay(dateOfReporting)}
                      </span>
                    )}
                  </label>
                  <input
                    type="date"
                    value={dateOfReporting}
                    onChange={(e) => setDateOfReporting(e.target.value)}
                    required
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none cursor-pointer font-medium text-gray-800"
                  />
                </div>

                {/* Vacancies */}
                <div>
                  <label className="block text-[#334155] font-bold mb-1">
                    Number of Positions Requested <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1.5 font-normal">
                    How many staff to recruit for this role on this requisition (pending approval—not yet authorised to hire).
                  </p>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={vacancies}
                    onChange={(e) => setVacancies(Number(e.target.value))}
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[#334155] font-bold mb-1">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                  >
                    <option value="Permanent">Permanent</option>
                    <option value="Fixed Term Contract (2 Years)">Fixed Term Contract (2 Years)</option>
                    <option value="Probationary">Probationary (6 Months)</option>
                    <option value="Temporary / Project Based">Temporary / Project Based</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#334155] font-bold mb-1">Work Location</label>
                  <input
                    type="text"
                    value={workLocation}
                    onChange={(e) => setWorkLocation(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: STAFFING & BUDGET */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slate-900">Step 2 — Staffing Details</h3>
                <p className="text-xs text-slate-500">Provide headcount rationale and remuneration details for this request.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recruitment Reason *</label>
                <div className="space-y-2">
                  {[
                    { key: 'fill_vacancy', label: 'Fill existing vacancy' },
                    { key: 'replace_employee', label: 'Replace employee' },
                    { key: 'new_position', label: 'New position (Strategic expansion)' },
                    { key: 'expansion', label: 'Temporary requirement (Project based)' },
                  ].map(r => (
                    <label
                      key={r.key}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer text-xs font-semibold ${
                        recruitmentReason === r.key
                          ? 'border-blue-500 bg-blue-50/50 text-blue-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="rec_reason"
                        checked={recruitmentReason === r.key}
                        onChange={() => setRecruitmentReason(r.key as typeof recruitmentReason)}
                        className="text-blue-600"
                      />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {recruitmentReason === 'replace_employee' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Employee Being Replaced</label>
                    <input
                      type="text"
                      placeholder="Search employee name or payroll number..."
                      value={replacedEmployee}
                      onChange={(e) => setReplacedEmployee(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Replacement</label>
                    <select
                      value={replacementReason}
                      onChange={(e) => setReplacementReason(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    >
                      <option value="Resignation">Resignation</option>
                      <option value="Retirement">Retirement</option>
                      <option value="Promotion / Lateral Transfer">Promotion / Lateral Transfer</option>
                      <option value="Termination">Termination</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#f8fafc] p-3 rounded border border-[#cbd5e1]">
                  <div>
                    <label className="block text-[#334155] font-bold mb-1 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Currency</span>
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                    >
                      {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.symbol}) - {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[#334155] font-bold mb-1">
                      Remuneration / Headcount Budget Amount
                    </label>
                    <input
                      type="text"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g. 5,000,000"
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs font-mono font-bold focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REQUIREMENTS & SCREENING */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slate-900">Step 3 — Requirements &amp; Screening</h3>
                <p className="text-xs text-slate-500">Define competencies, automated pre-shortlist rules, and assessment policy.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-[#334155] font-bold mb-1">Minimum Education</label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs"
                  >
                    {EDUCATION_LEVELS.map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#334155] font-bold mb-1">Field of Study</label>
                  <input
                    type="text"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#334155] font-bold mb-1">Min Experience (Years)</label>
                  <input
                    type="number"
                    value={minExperience}
                    onChange={(e) => setMinExperience(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Required Competencies &amp; Skills (with importance weighting)
                </label>
                <div className="space-y-2 mb-2">
                  {skills.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <span className="font-semibold text-slate-800">{s.name}</span>
                      <div className="flex items-center gap-2">
                        <select
                          value={s.level}
                          onChange={(e) => {
                            const updated = [...skills];
                            updated[idx].level = e.target.value as typeof s.level;
                            setSkills(updated);
                          }}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded border focus:outline-none ${
                            s.level === 'Required' ? 'bg-red-50 text-red-700 border-red-200' :
                            s.level === 'Preferred' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="Required">Required</option>
                          <option value="Preferred">Preferred</option>
                          <option value="Advantage">Advantage</option>
                        </select>
                        <button type="button" onClick={() => removeSkill(idx)} className="text-slate-400 hover:text-red-600 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add skill..."
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                  />
                  <button type="button" onClick={addSkill} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>

                {/* Pre-Shortlist / Automated Candidate Screening Criteria */}
                <div className="border border-[#cbd5e1] rounded p-3 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <h3 className="font-bold text-xs text-[#0f4c81] flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-[#0284c7]" />
                      <span>Automated Pre-Shortlisting Criteria (System Filter)</span>
                    </h3>
                    <span className="text-[11px] text-gray-500 font-normal">
                      Applicants below these thresholds are flagged during pre-screening
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Min Age (Years)</label>
                      <input
                        type="number"
                        value={minAge}
                        onChange={(e) => setMinAge(e.target.value)}
                        className="w-full bg-white border border-[#cbd5e1] rounded px-2 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Max Age (Years)</label>
                      <input
                        type="number"
                        value={maxAge}
                        onChange={(e) => setMaxAge(e.target.value)}
                        className="w-full bg-white border border-[#cbd5e1] rounded px-2 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Gender Preference</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as typeof gender)}
                        className="w-full bg-white border border-[#cbd5e1] rounded px-2 py-1 text-xs"
                      >
                        <option value="Either">Either</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>

                  {/* Psychometric Assessment Policy */}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="requirePsychometricTest"
                        checked={requirePsychometricTest}
                        onChange={(e) => setRequirePsychometricTest(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="requirePsychometricTest" className="text-xs font-bold text-gray-800 cursor-pointer flex items-center gap-1.5">
                        <BrainCircuit className="w-4 h-4 text-amber-600" />
                        <span>Enable mandatory Psychometric Assessment before shortlisting (Optional)</span>
                      </label>
                    </div>

                    {requirePsychometricTest ? (
                      <div className="p-3 bg-amber-50/70 border border-amber-300 rounded space-y-2 mt-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-950">Active Assessment Battery:</span>
                          <span className="text-[11px] text-amber-800 font-medium">Configured under Settings → Psychometric Setup</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {[
                            { id: 'numerical', name: 'Numerical' },
                            { id: 'logical', name: 'Logical Reasoning' },
                            { id: 'verbal', name: 'Verbal Aptitude' },
                            { id: 'situational', name: 'Situational Judgment' },
                            { id: 'technical', name: 'Technical / Domain' }
                          ].map(sec => {
                            const isChecked = assessmentSections.includes(sec.id);
                            return (
                              <label key={sec.id} className={`flex items-center justify-between p-1.5 rounded border text-[11px] cursor-pointer ${
                                isChecked ? 'bg-amber-100 border-amber-400 font-bold text-amber-950' : 'bg-white border-gray-200 text-gray-500'
                              }`}>
                                <span>{sec.name}</span>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      if (assessmentSections.length === 1) return;
                                      setAssessmentSections(assessmentSections.filter(id => id !== sec.id));
                                    } else {
                                      setAssessmentSections([...assessmentSections, sec.id]);
                                    }
                                  }}
                                  className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                                />
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-500 italic pl-6">
                        Psychometric assessment is optional. When disabled, candidates meeting age, education, and experience advance directly to Confirmed Shortlists.
                      </p>
                    )}
                  </div>
                </div>
            </div>
          )}

          {/* STEP 4: JOB ADVERT & JD */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slate-900">Step 4 — Job Advert &amp; Job Description</h3>
                <p className="text-xs text-slate-500">Author in-system JD templates or attach an approved specification document.</p>
              </div>
              {/* Option Selector: In-System Template vs Attached Document */}
              <div className="bg-slate-50 border border-[#cbd5e1] p-3 rounded text-xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <span className="font-bold text-sm text-[#0f4c81] flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#0284c7]" />
                      <span>Job Description (JD) & Advert Format</span>
                    </span>
                    <p className="text-[11px] text-gray-500">
                      Choose whether to author the Job Description in-system using structured templates, or attach an existing official approved specification document (PDF/Word).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label
                    onClick={() => setJdFormat('template')}
                    className={`p-3 rounded border cursor-pointer transition-all flex items-start gap-3 ${
                      jdFormat === 'template'
                        ? 'bg-blue-50/70 border-[#0284c7] shadow-2xs ring-1 ring-[#0284c7]'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="jdFormatChoice"
                      checked={jdFormat === 'template'}
                      onChange={() => setJdFormat('template')}
                      className="mt-0.5 text-[#0284c7] accent-[#0284c7]"
                    />
                    <div className="space-y-1">
                      <span className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Option A: In-System Structured JD Template</span>
                      </span>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        Author responsibilities, competencies, academic qualifications, and assessment criteria directly in standard form fields.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setJdFormat('attachment')}
                    className={`p-3 rounded border cursor-pointer transition-all flex items-start gap-3 ${
                      jdFormat === 'attachment'
                        ? 'bg-emerald-50/70 border-emerald-600 shadow-2xs ring-1 ring-emerald-500'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="jdFormatChoice"
                      checked={jdFormat === 'attachment'}
                      onChange={() => setJdFormat('attachment')}
                      className="mt-0.5 text-emerald-600 accent-emerald-600"
                    />
                    <div className="space-y-1">
                      <span className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Option B: Attach External Document (PDF / Word)</span>
                      </span>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        Upload or link an existing institutional Job Description document, terms of reference, or signed specification file.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* FORMAT A: IN-SYSTEM STRUCTURED JD */}
              {jdFormat === 'template' && (
                <div className="space-y-3 bg-white border border-[#cbd5e1] p-4 rounded text-xs">
                  {/* Template Picker */}
                  <div className="bg-amber-50/70 border border-amber-200 p-3 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="font-bold text-amber-950">Pre-built Standard Advert Templates:</span>
                        <p className="text-[11px] text-amber-800">
                          Select a template to auto-fill responsibilities, qualifications, and selection criteria.
                        </p>
                      </div>
                    </div>

                    <select
                      value={selectedTemplateId}
                      onChange={(e) => applyTemplate(e.target.value)}
                      className="bg-white border border-amber-300 rounded px-2.5 py-1 text-xs font-semibold text-amber-950 focus:outline-none cursor-pointer"
                    >
                      {JOB_ADVERT_TEMPLATES.map(tpl => (
                        <option key={tpl.id} value={tpl.id}>
                          Template: {tpl.position} ({tpl.department})
                        </option>
                      ))}
                      <option value="custom">Custom Advert (Blank)</option>
                    </select>
                  </div>

                  {/* Role Purpose */}
                  <div>
                    <label className="block text-[#334155] font-bold mb-1">
                      1. Role Purpose & Executive Summary
                    </label>
                    <RichTextEditor
                      value={rolePurpose}
                      onChange={setRolePurpose}
                      minHeight={100}
                      aria-label="Role purpose and executive summary"
                    />
                  </div>

                  {/* Key Duties & Core Responsibilities */}
                  <div>
                    <label className="block text-[#334155] font-bold mb-1">
                      2. Key Duties & Core Responsibilities <span className="text-gray-400 font-normal">(One bullet per line)</span>
                    </label>
                    <RichTextEditor
                      value={keyResponsibilitiesText}
                      onChange={setKeyResponsibilitiesText}
                      minHeight={120}
                      aria-label="Key duties and core responsibilities"
                    />
                  </div>

                  {/* Academic Qualifications */}
                  <div>
                    <label className="block text-[#334155] font-bold mb-1">
                      3. Academic Qualifications & Experience <span className="text-gray-400 font-normal">(One requirement per line)</span>
                    </label>
                    <RichTextEditor
                      value={requiredQualificationsText}
                      onChange={setRequiredQualificationsText}
                      minHeight={100}
                      aria-label="Academic qualifications and experience"
                    />
                  </div>

                  {/* Essential Competencies */}
                  <div>
                    <label className="block text-[#334155] font-bold mb-1">
                      4. Essential Competencies & Skills <span className="text-gray-400 font-normal">(One per line)</span>
                    </label>
                    <RichTextEditor
                      value={requiredSkillsText}
                      onChange={setRequiredSkillsText}
                      minHeight={100}
                      aria-label="Essential competencies and skills"
                    />
                  </div>

                  {/* Selection Methodology & Deadline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#334155] font-bold mb-1">
                        5. Assessment & Selection Methodology
                      </label>
                      <input
                        type="text"
                        value={assessmentMethodology}
                        onChange={(e) => setAssessmentMethodology(e.target.value)}
                        placeholder="e.g. Stage 1: Pre-screening; Stage 2: Psychometrics; Stage 3: Panel Interview"
                        className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[#334155] font-bold mb-1 flex items-center justify-between">
                        <span>Application Deadline Date</span>
                        {applicationDeadline && (
                          <span className="text-[11px] font-semibold text-[#0284c7]">
                            {formatYMDToDisplay(applicationDeadline)}
                          </span>
                        )}
                      </label>
                      <input
                        type="date"
                        value={applicationDeadline}
                        onChange={(e) => setApplicationDeadline(e.target.value)}
                        className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0284c7] focus:outline-none cursor-pointer font-medium text-gray-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* FORMAT B: ATTACH EXTERNAL DOCUMENT */}
              {jdFormat === 'attachment' && (
                <div className="space-y-4 bg-white border border-[#cbd5e1] p-4 rounded text-xs">
                  <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded p-5 text-center space-y-2">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">Upload Job Advert / Job Description File</h4>
                      <p className="text-[11px] text-gray-500">Supports PDF, DOCX, DOC files up to 25MB</p>
                    </div>

                    <div className="pt-1">
                      <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold cursor-pointer shadow-xs transition-colors">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>Select Document</span>
                        <input
                          type="file"
                          accept=".pdf,.docx,.doc"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Attached File Preview Card */}
                  {attachedJdFileName && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-bold text-xs text-emerald-950 block">{attachedJdFileName}</span>
                          <span className="text-[10px] text-emerald-700 font-medium">
                            {attachedJdFileSize || '2.1 MB'} • Ready for Approver Review & Candidate Attachment
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAttachedJdFileName('');
                          setAttachedJdFileSize('');
                        }}
                        className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Attached Document Summary Notes */}
                  <div>
                    <label className="block text-[#334155] font-bold mb-1">
                      Document Highlights & Summary Notes for Approver / Applicants <span className="text-red-500">*</span>
                    </label>
                    <RichTextEditor
                      value={attachedJdNotes}
                      onChange={setAttachedJdNotes}
                      minHeight={100}
                      aria-label="Document highlights and summary notes"
                    />
                  </div>

                  {/* Deadline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#334155] font-bold mb-1">
                        Application Deadline Date
                      </label>
                      <input
                        type="text"
                        value={applicationDeadline}
                        onChange={(e) => setApplicationDeadline(e.target.value)}
                        placeholder="e.g. 15 Sep 2026"
                        className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[#334155] font-bold mb-1">
                        Assessment & Selection Methodology
                      </label>
                      <input
                        type="text"
                        value={assessmentMethodology}
                        onChange={(e) => setAssessmentMethodology(e.target.value)}
                        placeholder="e.g. As defined in attached JD terms of reference"
                        className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* STEP 5: RECRUITMENT PLAN */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slate-900">Step 5 — Recruitment Plan &amp; Approval Routing</h3>
                <p className="text-xs text-slate-500">Configure publication timeline, channels, hiring team, and approver assignment.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recruitment Route</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Internal', 'External', 'Internal + External'] as const).map(rt => (
                    <button
                      key={rt}
                      type="button"
                      onClick={() => setRecruitmentRoute(rt)}
                      className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        recruitmentRoute === rt
                          ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-100'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                      }`}
                    >
                      {rt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Proposed Publication Date</label>
                  <input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Application Closing Date</label>
                  <input type="date" value={closingDate} min={publishDate || todayYMD} onChange={(e) => { setClosingDate(e.target.value); setApplicationDeadline(e.target.value); }} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Distribution Channels</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'careerPortal' as const, label: 'Public Career Portal' },
                    { key: 'staffPortal' as const, label: 'Internal Staff Portal' },
                    { key: 'linkedIn' as const, label: 'Corporate LinkedIn' },
                    { key: 'externalBoard' as const, label: 'External Job Boards' },
                  ].map(ch => (
                    <label key={ch.key} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={channels[ch.key]}
                        onChange={(e) => setChannels({ ...channels, [ch.key]: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span>{ch.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recruitment Lead</label>
                  <input type="text" value={recruitmentLead} onChange={(e) => setRecruitmentLead(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hiring Manager</label>
                  <input type="text" value={hiringManager} onChange={(e) => setHiringManager(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs" />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded text-xs space-y-3">
                <h3 className="font-bold text-sm text-[#1e293b] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0284c7]" />
                  <span>Assigned Approver &amp; Priority</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#334155] font-bold mb-1">Assigned Approver Authority *</label>
                    <select value={assignedApprover} onChange={(e) => setAssignedApprover(e.target.value)} className="w-full bg-white border border-[#cbd5e1] rounded px-3 py-2 text-xs font-semibold">
                      {DESIGNATED_APPROVERS.map(appr => (
                        <option key={appr.id} value={appr.name}>{appr.name} - ({appr.role})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#334155] font-bold mb-1">Approval Priority Level</label>
                    <select value={approvalPriority} onChange={(e) => setApprovalPriority(e.target.value as typeof approvalPriority)} className="w-full bg-white border border-[#cbd5e1] rounded px-3 py-2 text-xs">
                      <option value="Normal">Normal Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Urgent">Executive Escalation</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[#334155] font-bold mb-1">Headcount Justification &amp; Submission Remarks</label>
                    <RichTextEditor value={submissionRemarks} onChange={setSubmissionRemarks} minHeight={90} aria-label="Submission remarks" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW & SUBMIT */}
          {step === 6 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slate-900">Step 6 — Requisition Summary &amp; Approval Route</h3>
                <p className="text-xs text-slate-500">Review all details before initiating the governance approval sequence.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{position || 'Untitled Position'}</h4>
                    <p className="text-xs text-slate-500">{department} • {salaryScale} • {workLocation}</p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                    {vacancies} Position{vacancies === 1 ? '' : 's'} Requested
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div><span className="text-slate-400 block text-[11px]">Reports To</span><strong className="text-slate-800">{reportsTo}</strong></div>
                  <div><span className="text-slate-400 block text-[11px]">Route</span><strong className="text-slate-800">{recruitmentRoute}</strong></div>
                  <div><span className="text-slate-400 block text-[11px]">Remuneration</span><strong className="text-slate-800">{currency} {budget}</strong></div>
                </div>
                <div className="text-xs pt-1">
                  <span className="text-slate-400 block text-[11px] mb-1">Key Requirements</span>
                  <div className="flex flex-wrap gap-1">
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10.5px] font-medium">{educationLevel}</span>
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10.5px] font-medium">{minExperience} Years Experience</span>
                    {skills.map((s, i) => (
                      <span key={i} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10.5px] font-medium">{s.name} ({s.level})</span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-2 border-t border-slate-200">
                  <div><span className="text-gray-500 block">JD Format</span><strong>{jdFormat === 'template' ? 'In-System Template' : `Attached (${attachedJdFileName || 'Document'})`}</strong></div>
                  <div><span className="text-gray-500 block">Psychometrics</span><strong>{requirePsychometricTest ? 'Required' : 'Optional'}</strong></div>
                  <div><span className="text-gray-500 block">Assigned Approver</span><strong className="text-amber-800">{assignedApprover}</strong></div>
                  <div><span className="text-gray-500 block">Budget</span><strong>{currency} {budget}</strong></div>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Sequential Approval Route</span>
                  <span className="text-[11px] font-semibold text-slate-500">Estimated turnaround: <strong>4 working days</strong></span>
                </div>
                <div className="flex items-center justify-between text-center relative py-2 overflow-x-auto">
                  <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-0.5 bg-slate-200 -z-0 min-w-[400px]" />
                  {[
                    { role: 'Requisition Owner', name: 'Grace Ssuubi' },
                    { role: 'Head of Department', name: 'David Byamukama' },
                    { role: 'Director HR', name: assignedApprover.split(' ')[0] + ' ' + (assignedApprover.split(' ')[1] || '') },
                    { role: 'Finance Controller', name: 'Michael Byaruhanga' },
                    { role: 'Accounting Officer', name: 'Dr. Arthur K.' },
                  ].map((node, i) => (
                    <div key={i} className="relative z-10 flex flex-col items-center bg-white px-2 shrink-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-300'}`}>{i + 1}</div>
                      <span className="text-[11px] font-bold text-slate-800 mt-1 max-w-[80px] truncate">{node.name}</span>
                      <span className="text-[10px] text-slate-400">{node.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          </div>

          {/* Wizard footer */}
          <div className="px-4 sm:px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => goToStep(step - 1)}
                  className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => initiateSave('Not Submitted')}
                className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
              >
                Save Draft
              </button>
              {step < 6 ? (
                <button
                  type="button"
                  onClick={() => goToStep(step + 1)}
                  className="px-4 py-2 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  style={{ background: 'var(--color-primary)' }}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => initiateSave('Pending HR')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  Submit for Approval
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Modal before Submit for Approval / Save Draft */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title={
          pendingTargetStatus === 'Pending HR'
            ? 'Confirm Requisition Submission for Approval'
            : 'Confirm Save Requisition as Draft'
        }
        subtitle={
          pendingTargetStatus === 'Pending HR'
            ? 'This job requisition and job specification will be dispatched to the designated approver for authorization.'
            : 'Save this requisition in draft status to refine and submit later.'
        }
        variant={pendingTargetStatus === 'Pending HR' ? 'primary' : 'warning'}
        confirmText={
          pendingTargetStatus === 'Pending HR'
            ? 'Confirm & Submit for Approval'
            : 'Confirm & Save Draft'
        }
        summaryItems={[
          {
            label: 'Position Title',
            value: <span className="text-[#0f4c81] font-bold">{position || 'Untitled Position'}</span>,
            icon: <Briefcase className="w-3.5 h-3.5 text-gray-400" />
          },
          {
            label: 'Department',
            value: department,
            icon: <Building2 className="w-3.5 h-3.5 text-gray-400" />
          },
          {
            label: 'Assigned Approver',
            value: <span className="text-emerald-700 font-bold">{assignedApprover}</span>,
            icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          },
          {
            label: 'Vacancies & Budget',
            value: `${vacancies} vacancy(ies) · ${currency} ${budget}`,
            icon: <DollarSign className="w-3.5 h-3.5 text-gray-400" />
          },
          {
            label: 'Expected Reporting Date',
            value: dateOfReporting ? formatYMDToDisplay(dateOfReporting) : 'Not specified',
            icon: <Calendar className="w-3.5 h-3.5 text-gray-400" />
          },
          {
            label: 'Job Spec Format',
            value: jdFormat === 'attachment' 
              ? `Attached File (${attachedJdFileName || 'Document'})`
              : 'Authored In-System Advert Template',
            icon: <FileText className="w-3.5 h-3.5 text-gray-400" />
          },
          {
            label: 'Psychometric Assessment',
            value: requirePsychometricTest ? 'Required (Cognitive & Technical Battery)' : 'Standard Pre-Screening Only',
            icon: <BrainCircuit className="w-3.5 h-3.5 text-amber-600" />
          }
        ]}
        warningMessage={
          pendingTargetStatus === 'Pending HR'
            ? `Upon confirmation, this requisition will lock against edits and appear immediately in ${assignedApprover}'s Executive Approval queue.`
            : 'Draft requisitions remain private to your department and are not visible to executive approvers until submitted.'
        }
        notesLabel={pendingTargetStatus === 'Pending HR' ? 'Routing Remarks / Instructions for Approver (Optional):' : undefined}
        notesValue={modalRemarks}
        onNotesChange={setModalRemarks}
        notesPlaceholder="Add any comments, urgency context, or special justification for the approver..."
        onConfirm={handleConfirmSubmission}
        onClose={() => setShowConfirmModal(false)}
      />
    </div>
  );
};
