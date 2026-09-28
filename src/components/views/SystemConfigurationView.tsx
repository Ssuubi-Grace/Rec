import React, { useState } from 'react';
import { 
  Settings, 
  Layers, 
  Coins, 
  Briefcase, 
  FileCheck2, 
  GraduationCap, 
  HelpCircle, 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Shield, 
  Check, 
  X, 
  Sliders, 
  ArrowRight,
  Sparkles,
  Building,
  DollarSign,
  FolderOpen
} from 'lucide-react';
import { 
  SalaryGradeConfig, 
  EmploymentTypeConfig, 
  RecruitmentTypeConfig, 
  RecruitmentCategoryConfig, 
  EducationLevelConfig, 
  SupportingDocumentConfig, 
  ReferenceCheckQuestionConfig, 
  SystemRegionConfig 
} from '../../types';
import { 
  INITIAL_SALARY_GRADES, 
  INITIAL_EMPLOYMENT_TYPES, 
  INITIAL_RECRUITMENT_TYPES, 
  INITIAL_RECRUITMENT_CATEGORIES, 
  INITIAL_SUPPORTING_DOCUMENTS, 
  INITIAL_EDUCATION_LEVELS, 
  INITIAL_REFERENCE_QUESTIONS, 
  INITIAL_SYSTEM_REGIONS 
} from '../../data/configurationData';

export type ConfigTab = 
  | 'salary_grades' 
  | 'employment_types' 
  | 'recruitment_types' 
  | 'supporting_docs' 
  | 'education_levels' 
  | 'reference_questions' 
  | 'regions';

interface SystemConfigurationViewProps {
  initialTab?: ConfigTab;
  onNavigate?: (view: string) => void;
}

const CONFIG_SECTION_LABELS: Record<
  ConfigTab | 'recruitment_category',
  { addButton: string; addTitle: string; editTitle: string; saveButton: string }
> = {
  salary_grades: {
    addButton: 'Add Salary Scale',
    addTitle: 'Add New Salary Scale',
    editTitle: 'Edit Salary Scale',
    saveButton: 'Save Salary Scale',
  },
  employment_types: {
    addButton: 'Add Contract Type',
    addTitle: 'Add New Contract Type',
    editTitle: 'Edit Contract Type',
    saveButton: 'Save Contract Type',
  },
  recruitment_types: {
    addButton: 'Add Recruitment Type',
    addTitle: 'Add New Recruitment Type',
    editTitle: 'Edit Recruitment Type',
    saveButton: 'Save Recruitment Type',
  },
  recruitment_category: {
    addButton: 'Add Recruitment Category',
    addTitle: 'Add New Recruitment Category',
    editTitle: 'Edit Recruitment Category',
    saveButton: 'Save Recruitment Category',
  },
  supporting_docs: {
    addButton: 'Add Supporting Document',
    addTitle: 'Add New Document Type',
    editTitle: 'Edit Document Type',
    saveButton: 'Save Document Type',
  },
  education_levels: {
    addButton: 'Add Education Level',
    addTitle: 'Add New Education Level',
    editTitle: 'Edit Education Level',
    saveButton: 'Save Education Level',
  },
  reference_questions: {
    addButton: 'Add Reference Check',
    addTitle: 'Add New Reference Question',
    editTitle: 'Edit Reference Question',
    saveButton: 'Save Reference Question',
  },
  regions: {
    addButton: 'Add Region / Zone',
    addTitle: 'Add New Region',
    editTitle: 'Edit Region',
    saveButton: 'Save Region',
  },
};

export const SystemConfigurationView: React.FC<SystemConfigurationViewProps> = ({
  initialTab = 'salary_grades',
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<ConfigTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Configuration States
  const [salaryGrades, setSalaryGrades] = useState<SalaryGradeConfig[]>(INITIAL_SALARY_GRADES);
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentTypeConfig[]>(INITIAL_EMPLOYMENT_TYPES);
  const [recruitmentTypes, setRecruitmentTypes] = useState<RecruitmentTypeConfig[]>(INITIAL_RECRUITMENT_TYPES);
  const [recruitmentCategories, setRecruitmentCategories] = useState<RecruitmentCategoryConfig[]>(INITIAL_RECRUITMENT_CATEGORIES);
  const [supportingDocs, setSupportingDocs] = useState<SupportingDocumentConfig[]>(INITIAL_SUPPORTING_DOCUMENTS);
  const [educationLevels, setEducationLevels] = useState<EducationLevelConfig[]>(INITIAL_EDUCATION_LEVELS);
  const [referenceQuestions, setReferenceQuestions] = useState<ReferenceCheckQuestionConfig[]>(INITIAL_REFERENCE_QUESTIONS);
  const [regions, setRegions] = useState<SystemRegionConfig[]>(INITIAL_SYSTEM_REGIONS);

  // Generic Add/Edit Modal State
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form Fields State (polymorphic)
  const [formField1, setFormField1] = useState('');
  const [formField2, setFormField2] = useState('');
  const [formField3, setFormField3] = useState('');
  const [formField4, setFormField4] = useState('');
  const [formField5, setFormField5] = useState('');
  const [formFieldBool1, setFormFieldBool1] = useState(true);
  const [formFieldBool2, setFormFieldBool2] = useState(false);
  const [recruitmentAddKind, setRecruitmentAddKind] = useState<'type' | 'category'>('type');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Open Modal for Add
  const handleOpenAdd = (recruitmentKind: 'type' | 'category' = 'type') => {
    if (activeTab === 'recruitment_types') {
      setRecruitmentAddKind(recruitmentKind);
    }
    setModalMode('add');
    setEditingItem(null);
    setFormField1('');
    setFormField2('');
    setFormField3('');
    setFormField4('');
    setFormField5('');
    setFormFieldBool1(true);
    setFormFieldBool2(false);
  };

  // Open Modal for Edit
  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setModalMode('edit');
    if (activeTab === 'salary_grades') {
      const g = item as SalaryGradeConfig;
      setFormField1(g.gradeCode);
      setFormField2(g.title);
      setFormField3(g.minSalary);
      setFormField4(g.maxSalary);
      setFormField5(g.allowances);
      setFormFieldBool1(g.status === 'Active');
    } else if (activeTab === 'employment_types') {
      const e = item as EmploymentTypeConfig;
      setFormField1(e.code);
      setFormField2(e.title);
      setFormField3(String(e.durationMonths));
      setFormField4(String(e.probationMonths));
      setFormField5(e.category);
      setFormFieldBool1(e.isRenewable);
      setFormFieldBool2(e.benefitsEligible);
    } else if (activeTab === 'recruitment_types') {
      const r = item as RecruitmentTypeConfig;
      setFormField1(r.code);
      setFormField2(r.title);
      setFormField3(r.description);
      setFormFieldBool1(r.isExternal);
      setFormFieldBool2(r.requiresApproval);
    } else if (activeTab === 'supporting_docs') {
      const d = item as SupportingDocumentConfig;
      setFormField1(d.code);
      setFormField2(d.title);
      setFormField3(d.category);
      setFormField4(d.allowedExtensions);
      setFormField5(String(d.maxSizeMb));
      setFormFieldBool1(d.isMandatory);
      setFormFieldBool2(d.requiresVerification);
    } else if (activeTab === 'education_levels') {
      const el = item as EducationLevelConfig;
      setFormField1(el.code);
      setFormField2(el.title);
      setFormField3(String(el.rankOrder));
      setFormField4(String(el.minYearsStudy));
      setFormFieldBool1(el.status === 'Active');
    } else if (activeTab === 'reference_questions') {
      const rq = item as ReferenceCheckQuestionConfig;
      setFormField1(rq.code);
      setFormField2(rq.questionText);
      setFormField3(rq.category);
      setFormField4(rq.responseType);
      setFormFieldBool1(rq.isRequired);
    } else if (activeTab === 'regions') {
      const reg = item as SystemRegionConfig;
      setFormField1(reg.code);
      setFormField2(reg.name);
      setFormField3(reg.zoneType);
      setFormField4(reg.regionalLeader);
      setFormField5(reg.districtsCovered.join(', '));
      setFormFieldBool1(reg.status === 'Active');
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'salary_grades') {
      if (modalMode === 'add') {
        const newGrade: SalaryGradeConfig = {
          id: `sg-${Date.now()}`,
          gradeCode: formField1 || 'NEW-GRADE',
          title: formField2 || 'New Salary Grade Title',
          bandLevel: 'Officer Band',
          minSalary: formField3 || '2,000,000',
          midSalary: '3,000,000',
          maxSalary: formField4 || '4,000,000',
          currency: 'UGX',
          allowances: formField5 || '300,000',
          status: formFieldBool1 ? 'Active' : 'Inactive',
          applicableDepartments: 'General Administration'
        };
        setSalaryGrades([newGrade, ...salaryGrades]);
        showToast(`✓ Added new salary grade ${newGrade.gradeCode}.`);
      } else if (editingItem) {
        setSalaryGrades(salaryGrades.map(g => g.id === editingItem.id ? {
          ...g,
          gradeCode: formField1,
          title: formField2,
          minSalary: formField3,
          maxSalary: formField4,
          allowances: formField5,
          status: formFieldBool1 ? 'Active' : 'Inactive'
        } : g));
        showToast(`✓ Updated salary grade ${formField1}.`);
      }
    } else if (activeTab === 'employment_types') {
      if (modalMode === 'add') {
        const newType: EmploymentTypeConfig = {
          id: `et-${Date.now()}`,
          code: formField1 || 'EMP-NEW',
          title: formField2 || 'Custom Contract Type',
          durationMonths: formField3 || 12,
          category: (formField5 as any) || 'Fixed Term',
          isRenewable: formFieldBool1,
          probationMonths: Number(formField4) || 3,
          benefitsEligible: formFieldBool2,
          status: 'Active'
        };
        setEmploymentTypes([...employmentTypes, newType]);
        showToast(`✓ Added contract duration & type ${newType.title}.`);
      } else if (editingItem) {
        setEmploymentTypes(employmentTypes.map(e => e.id === editingItem.id ? {
          ...e,
          code: formField1,
          title: formField2,
          durationMonths: formField3,
          probationMonths: Number(formField4),
          category: (formField5 as any) || e.category,
          isRenewable: formFieldBool1,
          benefitsEligible: formFieldBool2
        } : e));
        showToast(`✓ Updated contract type ${formField2}.`);
      }
    } else if (activeTab === 'recruitment_types') {
      if (recruitmentAddKind === 'category') {
        if (modalMode === 'add') {
          const newCat: RecruitmentCategoryConfig = {
            id: `rc-${Date.now()}`,
            code: formField1 || 'CAT-NEW',
            title: formField2 || 'New Sourcing Category',
            description: formField3 || '',
            status: formFieldBool1 ? 'Active' : 'Inactive',
          };
          setRecruitmentCategories([newCat, ...recruitmentCategories]);
          showToast(`✓ Added recruitment category ${newCat.title}.`);
        }
      } else if (modalMode === 'add') {
        const newRt: RecruitmentTypeConfig = {
          id: `rt-${Date.now()}`,
          code: formField1 || 'REC-NEW',
          title: formField2 || 'New Recruitment Type',
          description: formField3 || '',
          isExternal: formFieldBool1,
          isInternal: !formFieldBool1,
          requiresApproval: formFieldBool2,
          status: 'Active',
        };
        setRecruitmentTypes([newRt, ...recruitmentTypes]);
        showToast(`✓ Added recruitment type ${newRt.title}.`);
      } else if (editingItem) {
        setRecruitmentTypes(recruitmentTypes.map(r => r.id === editingItem.id ? {
          ...r,
          code: formField1,
          title: formField2,
          description: formField3,
          isExternal: formFieldBool1,
          isInternal: !formFieldBool1,
          requiresApproval: formFieldBool2,
        } : r));
        showToast(`✓ Updated recruitment type ${formField2}.`);
      }
    } else if (activeTab === 'education_levels') {
      if (modalMode === 'add') {
        const newEl: EducationLevelConfig = {
          id: `el-${Date.now()}`,
          code: formField1 || 'EDU-NEW',
          title: formField2 || 'New Education Level',
          rankOrder: Number(formField3) || educationLevels.length + 1,
          minYearsStudy: Number(formField4) || 0,
          status: formFieldBool1 ? 'Active' : 'Inactive',
        };
        setEducationLevels([newEl, ...educationLevels]);
        showToast(`✓ Added education level ${newEl.title}.`);
      } else if (editingItem) {
        setEducationLevels(educationLevels.map(el => el.id === editingItem.id ? {
          ...el,
          code: formField1,
          title: formField2,
          rankOrder: Number(formField3) || el.rankOrder,
          minYearsStudy: Number(formField4) || el.minYearsStudy,
          status: formFieldBool1 ? 'Active' : 'Inactive',
        } : el));
        showToast(`✓ Updated education level ${formField2}.`);
      }
    } else if (activeTab === 'regions') {
      if (modalMode === 'add') {
        const newReg: SystemRegionConfig = {
          id: `reg-${Date.now()}`,
          code: formField1 || 'REG-NEW',
          name: formField2 || 'New Operational Zone',
          zoneType: (formField3 as SystemRegionConfig['zoneType']) || 'Regional Hub',
          regionalLeader: formField4 || 'TBD',
          districtsCovered: formField5 ? formField5.split(',').map(s => s.trim()).filter(Boolean) : [],
          status: formFieldBool1 ? 'Active' : 'Inactive',
        };
        setRegions([newReg, ...regions]);
        showToast(`✓ Added region ${newReg.name}.`);
      } else if (editingItem) {
        setRegions(regions.map(reg => reg.id === editingItem.id ? {
          ...reg,
          code: formField1,
          name: formField2,
          zoneType: formField3,
          regionalLeader: formField4,
          districtsCovered: formField5 ? formField5.split(',').map(s => s.trim()).filter(Boolean) : reg.districtsCovered,
          status: formFieldBool1 ? 'Active' : 'Inactive',
        } : reg));
        showToast(`✓ Updated region ${formField2}.`);
      }
    } else if (activeTab === 'supporting_docs') {
      if (modalMode === 'add') {
        const newDoc: SupportingDocumentConfig = {
          id: `sd-${Date.now()}`,
          code: formField1 || 'DOC-NEW',
          title: formField2 || 'Required Supporting Document',
          category: formField3 || 'General Clearance',
          isMandatory: formFieldBool1,
          allowedExtensions: formField4 || '.pdf,.jpg',
          maxSizeMb: Number(formField5) || 5,
          requiresVerification: formFieldBool2,
          status: 'Active'
        };
        setSupportingDocs([...supportingDocs, newDoc]);
        showToast(`✓ Added document requirement ${newDoc.title}.`);
      } else if (editingItem) {
        setSupportingDocs(supportingDocs.map(d => d.id === editingItem.id ? {
          ...d,
          code: formField1,
          title: formField2,
          category: formField3,
          allowedExtensions: formField4,
          maxSizeMb: Number(formField5) || 5,
          isMandatory: formFieldBool1,
          requiresVerification: formFieldBool2
        } : d));
        showToast(`✓ Updated document ${formField2}.`);
      }
    } else if (activeTab === 'reference_questions') {
      if (modalMode === 'add') {
        const newQ: ReferenceCheckQuestionConfig = {
          id: `rq-${Date.now()}`,
          code: formField1 || 'REF-NEW',
          questionText: formField2 || 'Enter reference verification inquiry...',
          category: (formField3 as any) || 'Technical Performance',
          responseType: (formField4 as any) || 'Rating Scale 1-5',
          isRequired: formFieldBool1,
          status: 'Active'
        };
        setReferenceQuestions([...referenceQuestions, newQ]);
        showToast(`✓ Added reference check question.`);
      } else if (editingItem) {
        setReferenceQuestions(referenceQuestions.map(q => q.id === editingItem.id ? {
          ...q,
          code: formField1,
          questionText: formField2,
          category: (formField3 as any) || q.category,
          responseType: (formField4 as any) || q.responseType,
          isRequired: formFieldBool1
        } : q));
        showToast(`✓ Updated reference check question.`);
      }
    }
    setModalMode(null);
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (activeTab === 'salary_grades') {
      setSalaryGrades(salaryGrades.filter(g => g.id !== id));
    } else if (activeTab === 'employment_types') {
      setEmploymentTypes(employmentTypes.filter(e => e.id !== id));
    } else if (activeTab === 'supporting_docs') {
      setSupportingDocs(supportingDocs.filter(d => d.id !== id));
    } else if (activeTab === 'reference_questions') {
      setReferenceQuestions(referenceQuestions.filter(q => q.id !== id));
    } else if (activeTab === 'regions') {
      setRegions(regions.filter(r => r.id !== id));
    }
    showToast(`Removed configuration entry: ${name}`);
  };

  const handleToggleStatus = (id: string) => {
    if (activeTab === 'salary_grades') {
      setSalaryGrades(salaryGrades.map(g => g.id === id ? { ...g, status: g.status === 'Active' ? 'Inactive' : 'Active' } : g));
    } else if (activeTab === 'employment_types') {
      setEmploymentTypes(employmentTypes.map(e => e.id === id ? { ...e, status: e.status === 'Active' ? 'Inactive' : 'Active' } : e));
    } else if (activeTab === 'supporting_docs') {
      setSupportingDocs(supportingDocs.map(d => d.id === id ? { ...d, status: d.status === 'Active' ? 'Inactive' : 'Active' } : d));
    } else if (activeTab === 'reference_questions') {
      setReferenceQuestions(referenceQuestions.map(q => q.id === id ? { ...q, status: q.status === 'Active' ? 'Inactive' : 'Active' } : q));
    }
    showToast(`✓ Status updated successfully.`);
  };

  const handleResetDefaults = () => {
    setSalaryGrades(INITIAL_SALARY_GRADES);
    setEmploymentTypes(INITIAL_EMPLOYMENT_TYPES);
    setRecruitmentTypes(INITIAL_RECRUITMENT_TYPES);
    setRecruitmentCategories(INITIAL_RECRUITMENT_CATEGORIES);
    setSupportingDocs(INITIAL_SUPPORTING_DOCUMENTS);
    setEducationLevels(INITIAL_EDUCATION_LEVELS);
    setReferenceQuestions(INITIAL_REFERENCE_QUESTIONS);
    setRegions(INITIAL_SYSTEM_REGIONS);
    showToast('✓ Restored all system configurations to official ProMISe standards.');
  };

  const sectionLabels =
    activeTab === 'recruitment_types' && recruitmentAddKind === 'category'
      ? CONFIG_SECTION_LABELS.recruitment_category
      : CONFIG_SECTION_LABELS[activeTab];

  return (
    <div className="space-y-4 max-w-7xl mx-auto text-xs animate-in fade-in pb-12">
      
      {/* Toast Notification */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {notification}
          </span>
          <button onClick={() => setNotification(null)} className="text-emerald-700 font-bold px-1.5 cursor-pointer">✕</button>
        </div>
      )}

      {/* Header Bar */}
      <div className="config-page-header">
        <div className="config-page-header__banner flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg text-white flex items-center justify-center shadow-xs shrink-0 config-btn-primary">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <span>System Configuration</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono border border-slate-300">
                  v2.6 Enterprise
                </span>
              </h1>
              <p className="text-[11px] text-gray-500">
                Configure salary scales, contract types, recruitment pipelines, document checklists, and grading criteria.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs flex items-center gap-1.5 border border-slate-300 cursor-pointer transition-colors"
              title="Reset to ProMISe system defaults"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            {activeTab === 'recruitment_types' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleOpenAdd('type')}
                  className="px-3.5 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors config-btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  <span>{CONFIG_SECTION_LABELS.recruitment_types.addButton}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAdd('category')}
                  className="px-3.5 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors config-btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  <span>{CONFIG_SECTION_LABELS.recruitment_category.addButton}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenAdd()}
                className="px-3.5 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors config-btn-primary"
              >
                <Plus className="w-4 h-4" />
                <span>{sectionLabels.addButton}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Configuration Tabs */}
      <div className="bg-white border border-[#cbd5e1] rounded-lg p-1.5 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-1 min-w-[760px]">
          <button
            type="button"
            onClick={() => setActiveTab('salary_grades')}
            className={`px-3 py-2 rounded font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'salary_grades'
                ? 'config-tab-active shadow-sm border border-[var(--color-primary)]'
                : 'text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>1. Salary Scales & Grades ({salaryGrades.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('employment_types')}
            className={`px-3 py-2 rounded font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'employment_types'
                ? 'config-tab-active shadow-sm border border-[var(--color-primary)]'
                : 'text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
            <span>2. Contract Durations & Types ({employmentTypes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recruitment_types')}
            className={`px-3 py-2 rounded font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'recruitment_types'
                ? 'config-tab-active shadow-sm border border-[var(--color-primary)]'
                : 'text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>3. Recruitment Types & Categories</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('supporting_docs')}
            className={`px-3 py-2 rounded font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'supporting_docs'
                ? 'config-tab-active shadow-sm border border-[var(--color-primary)]'
                : 'text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>4. Supporting Documents ({supportingDocs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('education_levels')}
            className={`px-3 py-2 rounded font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'education_levels'
                ? 'config-tab-active shadow-sm border border-[var(--color-primary)]'
                : 'text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span>5. Education Levels ({educationLevels.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reference_questions')}
            className={`px-3 py-2 rounded font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'reference_questions'
                ? 'config-tab-active shadow-sm border border-[var(--color-primary)]'
                : 'text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>6. Reference Checks ({referenceQuestions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('regions')}
            className={`px-3 py-2 rounded font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'regions'
                ? 'config-tab-active shadow-sm border border-[var(--color-primary)]'
                : 'text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>7. Regions & Zones ({regions.length})</span>
          </button>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* TAB 1: SALARY SCALES & GRADES                                           */}
      {/* ======================================================================= */}
      {activeTab === 'salary_grades' && (
        <div className="bg-white border border-[#cbd5e1] rounded-sm p-4 space-y-3.5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
            <div>
              <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>Salary Scales, Grade Brackets & Allowance Limits</span>
              </h3>
              <p className="text-[11px] text-gray-500">
                These scales automatically populate requisition forms, wage-bill approvals, and employment contract offer letters.
              </p>
            </div>
            
            <div className="text-gray-500 font-medium text-[11px]">
              Total Active Grades: <strong>{salaryGrades.filter(g => g.status === 'Active').length}</strong>
            </div>
          </div>

          <div className="overflow-x-auto border border-[#cbd5e1] rounded">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="config-table-head font-bold uppercase text-[10.5px] tracking-wider">
                  <th className="py-2.5 px-3">Grade Code</th>
                  <th className="py-2.5 px-3">Salary Band & Title</th>
                  <th className="py-2.5 px-3">Band Level</th>
                  <th className="py-2.5 px-3 text-right">Min Monthly (UGX)</th>
                  <th className="py-2.5 px-3 text-right">Max Monthly (UGX)</th>
                  <th className="py-2.5 px-3 text-right">Standard Allowances</th>
                  <th className="py-2.5 px-2.5 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {salaryGrades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#001b48]">
                      {grade.gradeCode}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-gray-900">{grade.title}</div>
                      <div className="text-[10px] text-gray-500">{grade.applicableDepartments}</div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10.5px]">
                        {grade.bandLevel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-right text-gray-800">
                      {grade.minSalary}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-right text-gray-800">
                      {grade.maxSalary}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-right text-emerald-700 font-semibold">
                      +{grade.allowances}
                    </td>
                    <td className="py-2.5 px-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(grade.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          grade.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-500 border border-slate-300'
                        }`}
                      >
                        {grade.status}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(grade)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-[#001b48] cursor-pointer"
                          title="Edit Grade"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(grade.id, grade.title)}
                          className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Delete Grade"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 2: CONTRACT DURATIONS & EMPLOYMENT TYPES                             */}
      {/* ======================================================================= */}
      {activeTab === 'employment_types' && (
        <div className="bg-white border border-[#cbd5e1] rounded-sm p-4 space-y-3.5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
            <div>
              <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-cyan-600" />
                <span>Employment Contract Types & Statutory Durations</span>
              </h3>
              <p className="text-[11px] text-gray-500">
                Configure standard engagement terms, mandatory probation periods, renewable clauses, and benefit packages.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {employmentTypes.map((type) => (
              <div 
                key={type.id}
                className="border border-[#cbd5e1] rounded-sm bg-white p-3.5 space-y-2.5 shadow-2xs flex flex-col justify-between hover:border-slate-400 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-bold">
                      {type.code}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      type.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {type.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-gray-900 mt-2">{type.title}</h4>
                  
                  <div className="mt-2.5 space-y-1.5 bg-slate-50 border border-slate-200 rounded p-2 text-[11px]">
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Category:</span>
                      <span className="font-semibold text-gray-800">{type.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Duration:</span>
                      <span className="font-semibold text-gray-800">{type.durationMonths} Months</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Probation Period:</span>
                      <span className="font-semibold text-gray-800">{type.probationMonths} Months</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Benefits Eligible:</span>
                      <span className={`font-semibold ${type.benefitsEligible ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {type.benefitsEligible ? 'Yes (Medical + NSSF)' : 'Exempt'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 pt-2.5 text-[11px]">
                  <span className="text-gray-500">
                    {type.isRenewable ? '✓ Auto-Renewable' : '✕ Fixed Term Only'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(type)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-[#001b48] cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(type.id, type.title)}
                      className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 3: RECRUITMENT TYPES & CATEGORIES                                   */}
      {/* ======================================================================= */}
      {activeTab === 'recruitment_types' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Box 1: Recruitment Types */}
          <div className="bg-white border border-[#cbd5e1] rounded-sm p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Recruitment Types ({recruitmentTypes.length})</span>
              </h3>
            </div>

            <div className="space-y-2">
              {recruitmentTypes.map((rt) => (
                <div key={rt.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-xs">{rt.title}</span>
                    <span className="font-mono text-[10px] bg-blue-100 text-blue-800 px-1.5 rounded font-bold">
                      {rt.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600">{rt.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-gray-500 pt-1">
                    <span>{rt.isExternal ? '✓ External Pipeline' : '—'}</span>
                    <span>{rt.isInternal ? '✓ Internal Sourcing' : '—'}</span>
                    <span>{rt.requiresApproval ? '✓ Executive Approval Mandated' : '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Box 2: Recruitment Categories */}
          <div className="bg-white border border-[#cbd5e1] rounded-sm p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-cyan-600" />
                <span>Recruitment Sourcing Categories ({recruitmentCategories.length})</span>
              </h3>
            </div>

            <div className="space-y-2">
              {recruitmentCategories.map((rc) => (
                <div key={rc.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-xs">{rc.title}</span>
                    <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-1.5 rounded font-bold">
                      {rc.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600">{rc.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 4: SUPPORTING DOCUMENTS SETUP                                       */}
      {/* ======================================================================= */}
      {activeTab === 'supporting_docs' && (
        <div className="bg-white border border-[#cbd5e1] rounded-sm p-4 space-y-3.5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
            <div>
              <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Mandatory Supporting Documents & Verification Rules</span>
              </h3>
              <p className="text-[11px] text-gray-500">
                Configure which documents applicants and inductees must provide, file extension limits, and statutory check rules.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-[#cbd5e1] rounded">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="config-table-head font-bold uppercase text-[10.5px] tracking-wider">
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Document Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-2.5 text-center">Mandatory</th>
                  <th className="py-2.5 px-3">Allowed Formats</th>
                  <th className="py-2.5 px-2.5 text-center">Max Size</th>
                  <th className="py-2.5 px-2.5 text-center">Verification</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {supportingDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#001b48]">
                      {doc.code}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-gray-900">
                      {doc.title}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">
                      {doc.category}
                    </td>
                    <td className="py-2.5 px-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.isMandatory ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {doc.isMandatory ? 'Required' : 'Optional'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10.5px] text-gray-700">
                      {doc.allowedExtensions}
                    </td>
                    <td className="py-2.5 px-2.5 text-center font-mono text-gray-700">
                      {doc.maxSizeMb} MB
                    </td>
                    <td className="py-2.5 px-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.requiresVerification ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {doc.requiresVerification ? 'Physical/NIRA' : 'Auto-Accept'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(doc)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-[#001b48] cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(doc.id, doc.title)}
                          className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 5: EDUCATION LEVELS                                                 */}
      {/* ======================================================================= */}
      {activeTab === 'education_levels' && (
        <div className="bg-white border border-[#cbd5e1] rounded-sm p-4 space-y-3.5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
            <div>
              <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Education Levels, Hierarchy & Scoring Weight</span>
              </h3>
              <p className="text-[11px] text-gray-500">
                Determines minimum educational cut-offs for automated pre-screening and qualification matrices.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {educationLevels.map((el) => (
              <div key={el.id} className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#001b48] text-white flex items-center justify-center text-[10px] font-bold">
                      {el.rankOrder}
                    </span>
                    <span className="font-bold text-gray-900 text-xs">{el.title}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    Code: <strong>{el.code}</strong> • Min Study: <strong>{el.minYearsStudy} Years</strong>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                  {el.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 6: REFERENCE CHECK QUESTIONS                                        */}
      {/* ======================================================================= */}
      {activeTab === 'reference_questions' && (
        <div className="bg-white border border-[#cbd5e1] rounded-sm p-4 space-y-3.5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
            <div>
              <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-rose-600" />
                <span>Standard Professional Reference Check Questionnaire Bank</span>
              </h3>
              <p className="text-[11px] text-gray-500">
                Inquiries dispatched to candidate referees for background clearance and character references.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {referenceQuestions.map((q, idx) => (
              <div key={q.id} className="p-3 bg-white border border-[#cbd5e1] rounded flex items-start justify-between gap-3 hover:border-slate-400 transition-colors">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold border border-slate-200">
                      {q.code}
                    </span>
                    <span className="text-[10px] bg-rose-50 text-rose-800 px-2 py-0.5 rounded font-bold border border-rose-200">
                      {q.category}
                    </span>
                    <span className="text-[10px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-medium border border-blue-200">
                      Format: {q.responseType}
                    </span>
                    {q.isRequired && (
                      <span className="text-[10px] text-red-600 font-bold">* Mandatory</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-900 pt-0.5">
                    {idx + 1}. {q.questionText}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(q)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-[#001b48] cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(q.id, q.code)}
                    className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 7: REGIONS & HUBS                                                   */}
      {/* ======================================================================= */}
      {activeTab === 'regions' && (
        <div className="bg-white border border-[#cbd5e1] rounded-sm p-4 space-y-3.5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
            <div>
              <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>Geographical Operational Zones & Duty Stations</span>
              </h3>
              <p className="text-[11px] text-gray-500">
                Regional hubs, field stations, and district coverage assigned to vacancies and personnel.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {regions.map((reg) => (
              <div key={reg.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-900">{reg.name}</span>
                  <span className="font-mono text-[10px] bg-teal-100 text-teal-800 px-1.5 rounded font-bold">
                    {reg.zoneType}
                  </span>
                </div>
                <div className="text-[11px] text-gray-600">
                  <span className="font-semibold text-gray-700">Covered Districts: </span>
                  {reg.districtsCovered.join(', ')}
                </div>
                <div className="text-[10.5px] text-gray-500 flex items-center justify-between pt-1 border-t border-slate-200">
                  <span>Leader: <strong>{reg.regionalLeader}</strong></span>
                  <span className="text-emerald-700 font-bold">✓ Active Operational Hub</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* GENERIC CONFIGURATION MODAL (Add / Edit)                                 */}
      {/* ======================================================================= */}
      {modalMode && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-md shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden">
            <div className="text-white p-3.5 flex items-center justify-between config-btn-primary rounded-t-md">
              <h3 className="font-bold text-xs flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-200" />
                <span>{modalMode === 'add' ? sectionLabels.addTitle : sectionLabels.editTitle}</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="text-slate-300 hover:text-white font-bold px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Code / Identifier</label>
                <input
                  type="text"
                  required
                  value={formField1}
                  onChange={(e) => setFormField1(e.target.value)}
                  placeholder="e.g. 2A, PERM-01, DOC-CV"
                  className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded font-mono text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Title / Name / Question Text</label>
                <input
                  type="text"
                  required
                  value={formField2}
                  onChange={(e) => setFormField2(e.target.value)}
                  placeholder="e.g. Senior Principal Developer / Permanent & Pensionable"
                  className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded text-xs focus:ring-1 focus:ring-[#001b48] focus:outline-none"
                />
              </div>

              {activeTab === 'salary_grades' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Min Salary (UGX)</label>
                    <input
                      type="text"
                      value={formField3}
                      onChange={(e) => setFormField3(e.target.value)}
                      placeholder="e.g. 4,500,000"
                      className="w-full px-2 py-1 border border-[#cbd5e1] rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Max Salary (UGX)</label>
                    <input
                      type="text"
                      value={formField4}
                      onChange={(e) => setFormField4(e.target.value)}
                      placeholder="e.g. 7,500,000"
                      className="w-full px-2 py-1 border border-[#cbd5e1] rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Allowances (UGX)</label>
                    <input
                      type="text"
                      value={formField5}
                      onChange={(e) => setFormField5(e.target.value)}
                      placeholder="e.g. 600,000"
                      className="w-full px-2 py-1 border border-[#cbd5e1] rounded text-xs"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'employment_types' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Duration (Months)</label>
                    <input
                      type="text"
                      value={formField3}
                      onChange={(e) => setFormField3(e.target.value)}
                      placeholder="e.g. 24 or Indefinite"
                      className="w-full px-2 py-1 border border-[#cbd5e1] rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Probation (Months)</label>
                    <input
                      type="number"
                      value={formField4}
                      onChange={(e) => setFormField4(e.target.value)}
                      placeholder="e.g. 6"
                      className="w-full px-2 py-1 border border-[#cbd5e1] rounded text-xs"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'supporting_docs' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Allowed File Extensions</label>
                    <input
                      type="text"
                      value={formField4}
                      onChange={(e) => setFormField4(e.target.value)}
                      placeholder="e.g. .pdf,.doc,.docx"
                      className="w-full px-2 py-1 border border-[#cbd5e1] rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Max File Size (MB)</label>
                    <input
                      type="number"
                      value={formField5}
                      onChange={(e) => setFormField5(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full px-2 py-1 border border-[#cbd5e1] rounded text-xs"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'recruitment_types' && recruitmentAddKind === 'type' && (
                <div>
                  <label className="block font-medium text-gray-600 mb-1">Description</label>
                  <input
                    type="text"
                    value={formField3}
                    onChange={(e) => setFormField3(e.target.value)}
                    placeholder="Pipeline description"
                    className="w-full px-2 py-1 border border-[#cbd5e1] rounded text-xs"
                  />
                </div>
              )}

              {activeTab === 'recruitment_types' && recruitmentAddKind === 'category' && (
                <div>
                  <label className="block font-medium text-gray-600 mb-1">Category Description</label>
                  <input
                    type="text"
                    value={formField3}
                    onChange={(e) => setFormField3(e.target.value)}
                    placeholder="Sourcing category details"
                    className="w-full px-2 py-1 border border-[#cbd5e1] rounded text-xs"
                  />
                </div>
              )}

              {(activeTab === 'education_levels') && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Hierarchy Rank</label>
                    <input
                      type="number"
                      value={formField3}
                      onChange={(e) => setFormField3(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full px-2 py-1 border border-[#cbd5e1] rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Min Years of Study</label>
                    <input
                      type="number"
                      value={formField4}
                      onChange={(e) => setFormField4(e.target.value)}
                      placeholder="e.g. 3"
                      className="w-full px-2 py-1 border border-[#cbd5e1] rounded text-xs"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'regions' && (
                <>
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Zone Type</label>
                    <input
                      type="text"
                      value={formField3}
                      onChange={(e) => setFormField3(e.target.value)}
                      placeholder="e.g. Regional Hub"
                      className="w-full px-2 py-1 border border-[#cbd5e1] rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Regional Leader</label>
                    <input
                      type="text"
                      value={formField4}
                      onChange={(e) => setFormField4(e.target.value)}
                      placeholder="Duty station lead"
                      className="w-full px-2 py-1 border border-[#cbd5e1] rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Districts (comma-separated)</label>
                    <input
                      type="text"
                      value={formField5}
                      onChange={(e) => setFormField5(e.target.value)}
                      placeholder="Kampala, Wakiso"
                      className="w-full px-2 py-1 border border-[#cbd5e1] rounded text-xs"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center gap-4 pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formFieldBool1}
                    onChange={(e) => setFormFieldBool1(e.target.checked)}
                    className="w-4 h-4 text-[#001b48] rounded cursor-pointer"
                  />
                  <span className="font-semibold text-gray-700">Active / Mandatory / Renewable</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded font-bold text-xs shadow-xs cursor-pointer config-btn-primary"
                >
                  {sectionLabels.saveButton}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
