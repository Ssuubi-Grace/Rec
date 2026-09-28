import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  PenTool, 
  ShieldCheck, 
  BookOpen, 
  CreditCard, 
  GraduationCap, 
  Download, 
  Eye, 
  Edit3, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Search, 
  Filter, 
  FileCode, 
  Save, 
  Sparkles, 
  AlertCircle, 
  UserCheck, 
  Building, 
  Paperclip,
  Check,
  ChevronRight,
  Printer,
  Copy,
  FolderOpen,
  ArrowRight
} from 'lucide-react';
import { Candidate, OfferLetter, OnboardingDocumentTemplate, DocumentCategoryType } from '../../types';
import { DEFAULT_DOCUMENT_TEMPLATES, replaceTemplateTags } from '../../data/documentTemplatesData';
import { RichTextEditor, RichTextEditorHandle } from '../ui/RichTextEditor';
import { RichTextView } from '../ui/RichTextView';

interface DocumentManagementHubProps {
  hubMode?: 'templates' | 'candidate_tracker';
  candidates?: Candidate[];
  offers?: OfferLetter[];
  requisitions?: any[];
  documentTemplates?: OnboardingDocumentTemplate[];
  templates?: OnboardingDocumentTemplate[];
  onUpdateTemplates?: (templates: OnboardingDocumentTemplate[]) => void;
  onUpdateTemplate?: (template: OnboardingDocumentTemplate) => void;
  onPreviewCandidatePortal?: (candidate: Candidate) => void;
  onNavigateToOffers?: () => void;
  onNavigate?: (view: any) => void;
}

export const DocumentManagementHub: React.FC<DocumentManagementHubProps> = ({
  hubMode,
  candidates = [],
  offers = [],
  requisitions = [],
  documentTemplates,
  templates: templatesProp,
  onUpdateTemplates,
  onUpdateTemplate,
  onPreviewCandidatePortal,
  onNavigateToOffers,
  onNavigate
}) => {
  const initialTemplates = documentTemplates || templatesProp || DEFAULT_DOCUMENT_TEMPLATES;
  const [templates, setTemplates] = useState<OnboardingDocumentTemplate[]>(initialTemplates);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategoryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'templates' | 'candidate_tracker'>(
    hubMode === 'candidate_tracker' ? 'candidate_tracker' : 'templates'
  );
  const effectiveTab = hubMode ?? activeTab;
  const showInternalTabs = !hubMode;

  React.useEffect(() => {
    if (documentTemplates && documentTemplates.length > 0) {
      setTemplates(documentTemplates);
    } else if (templatesProp && templatesProp.length > 0) {
      setTemplates(templatesProp);
    }
  }, [documentTemplates, templatesProp]);
  
  // Active Editing Modal
  const [editingTemplate, setEditingTemplate] = useState<OnboardingDocumentTemplate | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDeliveryMode, setEditDeliveryMode] = useState<'template' | 'attachment'>('template');
  const [editTemplateBody, setEditTemplateBody] = useState('');
  const [editAttachedFileName, setEditAttachedFileName] = useState('');
  const [editAttachedFileSize, setEditAttachedFileSize] = useState('');
  const [editVersion, setEditVersion] = useState('');
  const [editApplicableRoles, setEditApplicableRoles] = useState('All Positions');

  // Fallback Candidate for Preview
  const fallbackCandidate: Candidate = {
    id: 'c-preview-1',
    name: 'Apollo Joshua Mukasa',
    email: 'apollo.mukasa@example.com',
    phone: '772123456',
    countryCode: '256',
    requisitionId: 'REQ-TECH-001',
    position: 'Senior Systems Architect',
    department: 'Technology & Digital Systems',
    age: 32,
    gender: 'Male',
    educationLevel: "Master's Degree",
    institution: 'Makerere University',
    fieldOfStudy: 'Computer Science',
    yearsOfExperience: 6,
    employmentHistory: 'Senior Systems Developer at Nile Infotech',
    appliedDate: '14-Aug-2026',
    status: 'Interview Evaluated',
    matchScore: 92,
    nationalId: 'CM96023412X98A'
  };

  // Candidate Preview Selector inside Editor
  const [previewCandidateId, setPreviewCandidateId] = useState<string>(candidates[0]?.id || 'c1');
  const previewCandidate = (candidates && candidates.length > 0)
    ? (candidates.find(c => c.id === previewCandidateId) || candidates[0])
    : fallbackCandidate;
  const previewOffer = (offers || []).find(o => o.candidateId === previewCandidate?.id);

  // Hidden File Input references for direct card uploads
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const templateBodyEditorRef = useRef<RichTextEditorHandle>(null);

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenEdit = (tpl: OnboardingDocumentTemplate) => {
    setEditingTemplate(tpl);
    setEditTitle(tpl.title);
    setEditDescription(tpl.description);
    setEditDeliveryMode(tpl.defaultDeliveryMode);
    setEditTemplateBody(tpl.templateBody ?? '');
    setEditAttachedFileName(tpl.attachedFileName || `${tpl.code}_Master.pdf`);
    setEditAttachedFileSize(tpl.attachedFileSize || '480 KB');
    setEditVersion(tpl.version);
    setEditApplicableRoles(tpl.applicableRoles || 'All Positions');
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;
    const updated: OnboardingDocumentTemplate = {
      ...editingTemplate,
      title: editTitle.trim(),
      description: editDescription.trim(),
      defaultDeliveryMode: editDeliveryMode,
      templateBody: editTemplateBody,
      attachedFileName: editAttachedFileName,
      attachedFileSize: editAttachedFileSize,
      version: editVersion,
      applicableRoles: editApplicableRoles,
      lastUpdated: '27-Aug-2026',
      updatedBy: 'HR Lead'
    };

    const newTemplates = templates.map(t => t.id === updated.id ? updated : t);
    setTemplates(newTemplates);
    if (onUpdateTemplates) {
      onUpdateTemplates(newTemplates);
    }
    if (onUpdateTemplate) {
      onUpdateTemplate(updated);
    }
    setEditingTemplate(null);
    setNotification(`Saved changes for "${updated.title}".`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Direct 1-Click Card File Upload Handler
  const handleDirectCardFileUpload = (tplId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const sizeFormatted = `${(file.size / 1024).toFixed(0)} KB`;
    let updatedTpl: OnboardingDocumentTemplate | null = null;
    const newTemplates = templates.map(t => {
      if (t.id === tplId) {
        updatedTpl = {
          ...t,
          defaultDeliveryMode: 'attachment' as const,
          attachedFileName: file.name,
          attachedFileSize: sizeFormatted,
          attachedFileDate: 'Today',
          lastUpdated: 'Today',
          updatedBy: 'HR Admin'
        };
        return updatedTpl;
      }
      return t;
    });

    setTemplates(newTemplates);
    if (onUpdateTemplates) {
      onUpdateTemplates(newTemplates);
    }
    if (onUpdateTemplate && updatedTpl) {
      onUpdateTemplate(updatedTpl);
    }
    setNotification(`Uploaded "${file.name}" for ${templates.find(t => t.id === tplId)?.title}.`);
    setTimeout(() => setNotification(null), 4000);

    // Reset input value so same file can be uploaded again if needed
    e.target.value = '';
  };

  // File Upload inside Edit Modal
  const handleModalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditAttachedFileName(file.name);
    setEditAttachedFileSize(`${(file.size / 1024).toFixed(0)} KB`);
    setEditDeliveryMode('attachment');
    setNotification(`Uploaded "${file.name}".`);
    setTimeout(() => setNotification(null), 4000);
    e.target.value = '';
  };

  const handleInsertMergeTag = (tag: string) => {
    if (templateBodyEditorRef.current) {
      templateBodyEditorRef.current.insertText(`${tag} `);
      return;
    }
    setEditTemplateBody((prev) => `${prev} ${tag} `);
  };

  const handleToggleDeliveryMode = (tpl: OnboardingDocumentTemplate) => {
    const newMode = tpl.defaultDeliveryMode === 'template' ? 'attachment' : 'template';
    let updatedTpl: OnboardingDocumentTemplate | null = null;
    const newTemplates = templates.map(t => {
      if (t.id === tpl.id) {
        updatedTpl = { ...t, defaultDeliveryMode: newMode };
        return updatedTpl;
      }
      return t;
    });
    setTemplates(newTemplates);
    if (onUpdateTemplates) {
      onUpdateTemplates(newTemplates);
    }
    if (onUpdateTemplate && updatedTpl) {
      onUpdateTemplate(updatedTpl);
    }
    setNotification(`Switched "${tpl.title}" to ${newMode === 'template' ? 'Template' : 'Uploaded File'} mode.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleBackToOffers = () => {
    if (onNavigateToOffers) {
      onNavigateToOffers();
    } else if (onNavigate) {
      onNavigate('offer-management');
    }
  };

  const handleViewPortal = (c: Candidate) => {
    if (onPreviewCandidatePortal) {
      onPreviewCandidatePortal(c);
    } else if (onNavigate) {
      onNavigate('candidate-portal');
    }
  };

  const getCategoryDetails = (category: DocumentCategoryType) => {
    switch (category) {
      case 'appointment_letter':
        return {
          topBorder: 'border-t-[3.5px] border-t-[#0284c7]',
          badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
          iconBg: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: <FileText className="w-4 h-4 text-sky-700" />,
          label: 'Appointment Offer'
        };
      case 'employment_contract':
        return {
          topBorder: 'border-t-[3.5px] border-t-indigo-600',
          badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: <PenTool className="w-4 h-4 text-indigo-700" />,
          label: 'Employment Contract'
        };
      case 'nda':
        return {
          topBorder: 'border-t-[3.5px] border-t-teal-600',
          badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
          iconBg: 'bg-teal-50 text-teal-700 border-teal-200',
          icon: <ShieldCheck className="w-4 h-4 text-teal-700" />,
          label: 'Confidentiality (NDA)'
        };
      case 'handbook':
        return {
          topBorder: 'border-t-[3.5px] border-t-purple-600',
          badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
          iconBg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: <BookOpen className="w-4 h-4 text-purple-700" />,
          label: 'Code of Conduct'
        };
      case 'payroll_form':
        return {
          topBorder: 'border-t-[3.5px] border-t-emerald-600',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CreditCard className="w-4 h-4 text-emerald-700" />,
          label: 'Payroll & Bank Form'
        };
      case 'academic_verification':
        return {
          topBorder: 'border-t-[3.5px] border-t-cyan-600',
          badgeBg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
          iconBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          icon: <GraduationCap className="w-4 h-4 text-cyan-700" />,
          label: 'Academic Verification'
        };
      default:
        return {
          topBorder: 'border-t-[3.5px] border-t-slate-500',
          badgeBg: 'bg-slate-50 text-slate-800 border-slate-200',
          iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <Paperclip className="w-4 h-4 text-slate-700" />,
          label: 'Document Template'
        };
    }
  };

  return (
    <div className="space-y-3.5 max-w-7xl mx-auto text-xs animate-in fade-in">
      
      {/* Toast Notification */}
      {notification && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {notification}
          </span>
          <button onClick={() => setNotification(null)} className="text-emerald-700 font-bold px-1.5 cursor-pointer">✕</button>
        </div>
      )}

      {/* Clean Control Bar */}
      {(showInternalTabs || (onNavigateToOffers || onNavigate)) && (
      <div className="bg-white border border-[#cbd5e1] rounded-sm p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {showInternalTabs && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`px-3.5 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              effectiveTab === 'templates'
                ? 'config-btn-primary shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Templates & Files ({templates.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('candidate_tracker')}
            className={`px-3.5 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              effectiveTab === 'candidate_tracker'
                ? 'config-btn-primary shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Candidate Status ({candidates.length})</span>
          </button>
        </div>
        )}

        {(onNavigateToOffers || onNavigate) && effectiveTab === 'candidate_tracker' && (
          <button
            type="button"
            onClick={handleBackToOffers}
            className="text-xs text-[#0f4c81] hover:text-[#0284c7] font-semibold flex items-center gap-1 cursor-pointer self-start md:self-auto"
          >
            <span>← Back to Offer Issuance</span>
          </button>
        )}
      </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 1: TEMPLATES & ATTACHED DOCUMENTS LIST                             */}
      {/* ===================================================================== */}
      {effectiveTab === 'templates' && (
        <div className="space-y-3">
          
          {/* Search & Filter Bar */}
          <div className="bg-white border border-[#cbd5e1] rounded-sm p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[240px]">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates, document titles, codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-[#cbd5e1] rounded text-xs focus:bg-white focus:ring-1 focus:ring-[#0f4c81] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 font-medium">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="bg-white border border-[#cbd5e1] rounded px-2.5 py-1 text-xs font-semibold focus:ring-1 focus:ring-[#0f4c81] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Documents</option>
                  <option value="appointment_letter">Appointment Letters</option>
                  <option value="employment_contract">Employment Contracts</option>
                  <option value="nda">Non-Disclosure Agreements</option>
                  <option value="handbook">Code of Conduct & Handbooks</option>
                  <option value="payroll_form">Bank & Payroll Forms</option>
                  <option value="academic_verification">Academic & Verification Records</option>
                </select>
              </div>
            </div>

            <div className="text-gray-500 font-medium text-[11px]">
              Showing <strong>{filteredTemplates.length}</strong> of {templates.length} documents
            </div>
          </div>

          {/* Simple, Crisp Document Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTemplates.map((tpl) => {
              const isTemplateMode = tpl.defaultDeliveryMode === 'template';
              const catDetails = getCategoryDetails(tpl.category);

              return (
                <div 
                  key={tpl.id}
                  className={`bg-white border border-[#cbd5e1] ${catDetails.topBorder} rounded-md shadow-2xs flex flex-col hover:border-slate-400 transition-all`}
                >
                  <div className="p-3 flex-1 space-y-2">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-8 h-8 rounded-md ${catDetails.iconBg} flex items-center justify-center shrink-0`}>
                        {catDetails.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm text-gray-900 leading-snug truncate" title={tpl.title}>
                          {tpl.title}
                        </h3>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {catDetails.label} · {tpl.code}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleDeliveryMode(tpl)}
                        title="Toggle template vs uploaded file"
                        className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold border cursor-pointer transition-all ${
                          isTemplateMode 
                            ? 'bg-blue-50 text-[var(--color-primary)] border-blue-200' 
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isTemplateMode ? 'Template' : 'File'}
                      </button>
                    </div>

                    <p className="text-[11px] text-gray-600 line-clamp-2">
                      {isTemplateMode
                        ? 'In-system rich text template'
                        : tpl.attachedFileName
                          ? tpl.attachedFileName
                          : 'No file attached yet'}
                    </p>
                  </div>

                  <div className="px-2.5 py-2 border-t border-[#e2e8f0] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(tpl)}
                      className="flex-1 px-2 py-1.5 config-btn-primary rounded font-bold text-[11px] flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>

                    <div className="flex-1">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        ref={el => fileInputRefs.current[tpl.id] = el}
                        onChange={(e) => handleDirectCardFileUpload(tpl.id, e)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[tpl.id]?.click()}
                        className="w-full px-2 py-1.5 bg-white border border-[#cbd5e1] hover:bg-slate-100 text-slate-700 rounded font-semibold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        title="Upload replacement document from your computer"
                      >
                        <Upload className="w-3 h-3 text-[var(--color-primary)]" />
                        Upload
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: CANDIDATE DOCUMENT STATUS                                      */}
      {/* ===================================================================== */}
      {effectiveTab === 'candidate_tracker' && (
        <div className="bg-white border border-[#cbd5e1] rounded-sm p-4 space-y-3 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e2e8f0] pb-2.5">
            <div>
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
                Candidate documents ({candidates.length})
              </h3>
              <p className="text-[11px] text-gray-500">
                Offer letters, contracts, NDAs, payroll forms, and verification status by candidate.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 font-bold text-[11px]">
                ✓ Full Audit Trail Active
              </span>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto border border-[#cbd5e1] rounded">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="config-table-head font-bold uppercase text-[10.5px] tracking-wider">
                  <th className="py-2 px-3">Candidate & Role</th>
                  <th className="py-2 px-2.5 text-center">1. Offer Letter</th>
                  <th className="py-2 px-2.5 text-center">2. 2-Yr Contract</th>
                  <th className="py-2 px-2.5 text-center">3. NDA Agreement</th>
                  <th className="py-2 px-2.5 text-center">4. Bank & NSSF</th>
                  <th className="py-2 px-2.5 text-center">5. Handbook</th>
                  <th className="py-2 px-2.5 text-center">6. Academic Records</th>
                  <th className="py-2 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500 font-medium">
                      No candidate onboarding records found.
                    </td>
                  </tr>
                ) : (
                  candidates.map((c, i) => {
                    const off = (offers || []).find(o => o.candidateId === c.id);
                    const isOfferSigned = off?.status === 'Accepted' || c.status === 'Offer Accepted' || c.status === 'Orientation' || c.status === 'Hired';
                    const isContractSigned = isOfferSigned;
                    const isNdaSigned = c.status === 'Orientation' || c.status === 'Hired';
                    const isBankSubmitted = isOfferSigned;
                    const isHandbookAck = isOfferSigned;

                    return (
                      <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-gray-900">{c.name}</div>
                          <div className="text-[11px] text-gray-500">{c.position} • {c.department}</div>
                          <div className="text-[10px] text-gray-400 font-mono">NIN: {c.nationalId || 'CM96023412X98A'}</div>
                        </td>

                        {/* 1. Offer */}
                        <td className="py-2.5 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                            isOfferSigned ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isOfferSigned ? 'Signed' : 'Pending'}
                          </span>
                        </td>

                        {/* 2. Contract */}
                        <td className="py-2.5 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                            isContractSigned ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isContractSigned ? 'Signed' : 'Pending'}
                          </span>
                        </td>

                        {/* 3. NDA */}
                        <td className="py-2.5 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                            isNdaSigned ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isNdaSigned ? 'Signed' : 'Pending'}
                          </span>
                        </td>

                        {/* 4. Bank */}
                        <td className="py-2.5 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                            isBankSubmitted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isBankSubmitted ? 'Submitted' : 'Pending'}
                          </span>
                        </td>

                        {/* 5. Handbook */}
                        <td className="py-2.5 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                            isHandbookAck ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isHandbookAck ? 'Acknowledged' : 'Pending'}
                          </span>
                        </td>

                        {/* 6. Academic */}
                        <td className="py-2.5 px-2 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold inline-block bg-emerald-100 text-emerald-800">
                            Verified
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleViewPortal(c)}
                            className="px-2.5 py-1 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white rounded text-[10.5px] font-bold flex items-center gap-1 shadow-2xs mx-auto cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Portal</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CLEAR & SIMPLE TEMPLATE EDITOR / UPLOAD MODAL                         */}
      {/* ===================================================================== */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-xs">
          <div className="bg-white rounded-md shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-[#94a3b8]">
            
            {/* Modal Header */}
            <div className="bg-[var(--color-primary)] text-white px-5 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-sm">
                  Edit Document: {editingTemplate.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="text-slate-300 hover:text-white text-base font-bold px-2 py-0.5 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              
              {/* Delivery Format Choice */}
              <div className="flex items-center gap-2 p-2 bg-slate-100 rounded border border-slate-200">
                <span className="font-bold text-gray-700 mr-2">Delivery Mode:</span>
                <button
                  type="button"
                  onClick={() => setEditDeliveryMode('template')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    editDeliveryMode === 'template'
                      ? 'bg-[var(--color-primary)] text-white shadow-2xs'
                      : 'bg-white text-gray-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Editable In-System Template</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditDeliveryMode('attachment')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    editDeliveryMode === 'attachment'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-white text-gray-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Uploaded Document (PDF/DOCX)</span>
                </button>
              </div>

              {/* Title and Version Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-bold mb-1">Document Title *</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs font-bold text-gray-900 focus:ring-1 focus:ring-[#0f4c81] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Version</label>
                  <input
                    type="text"
                    value={editVersion}
                    onChange={(e) => setEditVersion(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0f4c81] focus:outline-none"
                  />
                </div>
              </div>

              {/* If Uploaded Document Mode: Simple upload area */}
              {editDeliveryMode === 'attachment' ? (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-emerald-950">Uploaded Document File</h4>
                      <p className="text-[11px] text-emerald-800">Candidates will receive and sign this uploaded file.</p>
                    </div>
                    {editAttachedFileName && (
                      <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded font-bold text-[10px]">
                        ✓ File Active
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-white border border-emerald-300 rounded flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-5 h-5 text-emerald-700" />
                      <div>
                        <strong className="text-xs text-gray-900 block truncate max-w-[280px]">
                          {editAttachedFileName || 'No file selected'}
                        </strong>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {editAttachedFileSize ? `Size: ${editAttachedFileSize}` : 'Click below to select a file'}
                        </span>
                      </div>
                    </div>

                    <label className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{editAttachedFileName ? 'Choose Different File' : 'Upload File (PDF/DOCX)'}</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleModalFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                /* If In-System Template Mode: Clean Editor */
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="block text-gray-700 font-bold">
                      Template Text & Merge Tags
                    </label>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-gray-500">Preview with Candidate:</span>
                      <select
                        value={previewCandidateId}
                        onChange={(e) => setPreviewCandidateId(e.target.value)}
                        className="bg-white border border-[#cbd5e1] rounded px-2 py-0.5 text-xs font-semibold focus:ring-1 focus:ring-[#0f4c81] focus:outline-none cursor-pointer"
                      >
                        {candidates && candidates.length > 0 ? (
                          candidates.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.position})
                            </option>
                          ))
                        ) : (
                          <option value={fallbackCandidate.id}>
                            {fallbackCandidate.name} ({fallbackCandidate.position})
                          </option>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Merge Tag Insertion Chips */}
                  <div className="bg-slate-50 border border-slate-200 rounded p-2 flex flex-wrap items-center gap-1.5 text-[10.5px]">
                    <span className="text-gray-500 font-bold mr-1">Insert Tag:</span>
                    {[
                      { label: 'Candidate Name', tag: '{CANDIDATE_NAME}' },
                      { label: 'Position', tag: '{POSITION}' },
                      { label: 'Department', tag: '{DEPARTMENT}' },
                      { label: 'Salary', tag: '{SALARY}' },
                      { label: 'Allowances', tag: '{ALLOWANCES}' },
                      { label: 'Start Date', tag: '{START_DATE}' },
                      { label: 'Probation', tag: '{PROBATION_MONTHS}' },
                      { label: 'Supervisor', tag: '{SUPERVISOR}' },
                      { label: 'National ID', tag: '{NATIONAL_ID}' },
                      { label: 'Duration', tag: '{CONTRACT_DURATION}' }
                    ].map(item => (
                      <button
                        key={item.tag}
                        type="button"
                        onClick={() => handleInsertMergeTag(item.tag)}
                        className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 hover:border-slate-400 text-slate-800 rounded font-semibold cursor-pointer transition-colors shadow-2xs"
                        title={item.tag}
                      >
                        + {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Editor and Preview side-by-side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-gray-600 font-semibold mb-1">
                        Template Content
                      </label>
                      <RichTextEditor
                        key={editingTemplate.id}
                        ref={templateBodyEditorRef}
                        value={editTemplateBody}
                        onChange={setEditTemplateBody}
                        minHeight={235}
                        maxHeight={320}
                        aria-label="Template content"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-600 font-semibold mb-1 flex items-center justify-between">
                        <span>Live Preview for <strong>{previewCandidate.name}</strong></span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 rounded">
                          ✓ Dynamic Values
                        </span>
                      </label>
                      <div className="h-[235px] overflow-y-auto bg-slate-50 border border-[#cbd5e1] rounded p-3 text-xs shadow-inner">
                        <RichTextView html={replaceTemplateTags(editTemplateBody, previewCandidate, previewOffer)} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-[#cbd5e1] px-5 py-2.5 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="px-3.5 py-1.5 bg-white border border-[#cbd5e1] hover:bg-slate-100 text-gray-700 rounded text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveTemplate}
                className="px-4 py-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
