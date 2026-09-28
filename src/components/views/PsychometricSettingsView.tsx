import React, { useState, useMemo } from 'react';
import { 
  BrainCircuit, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Edit3, 
  Play, 
  Clock, 
  HelpCircle, 
  Sliders, 
  FileQuestion,
  Layers,
  Building2,
  Briefcase,
  ShieldCheck,
  Tag,
  CheckSquare,
  Sparkles,
  Info,
  Check,
  X,
  ArrowLeft,
  Search,
  Copy,
  AlertCircle,
  BarChart3,
  ListOrdered,
  Send,
  UserCheck,
  MessageSquare,
  Archive,
  RotateCcw,
  CheckCircle,
  FolderPlus,
  Folder,
  LayoutGrid,
  ListFilter,
  MoveVertical,
  ChevronDown,
  ChevronUp,
  Settings2
} from 'lucide-react';
import { PsychometricTest, TestQuestion, QuestionOption, TestSectionDefinition, Requisition } from '../../types';
import { RECRUITMENT_CATEGORIES } from '../../data/mockData';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import {
  ViewShell, PageHeader, MetricGrid, FilterPanel, FilterField,
  DataTableShell, NotificationBanner,
} from '../ui/RecruitmentUI';
import { DashboardKpiCard } from '../ui/DashboardKpiCard';
import { SearchableSelect } from '../ui/SearchableSelect';
import { FormModal } from '../ui/FormModal';
import { RequisitionStepper } from '../ui/RequisitionStepper';
import { WizardModalFooter } from '../ui/WizardModalFooter';

const BATTERY_WIZARD_STEPS = [
  { num: 1, label: 'Battery Setup', shortLabel: 'Setup' },
  { num: 2, label: 'Sections & Weights', shortLabel: 'Sections' },
  { num: 3, label: 'Question Bank', shortLabel: 'Questions' },
  { num: 4, label: 'Review & Publish', shortLabel: 'Review' },
];

interface PsychometricSettingsViewProps {
  tests: PsychometricTest[];
  requisitions?: Requisition[];
  onSaveTest: (test: PsychometricTest) => void;
  onDeleteTest?: (testId: string) => void;
  onLaunchTestPlayer: (test: PsychometricTest) => void;
}

export const STANDARD_SECTION_TEMPLATES = [
  { id: 'numerical', name: 'Numerical Reasoning & Financial Logic', icon: '', defaultWeight: 25, defaultTime: 15, desc: 'Data interpretation, percentages, financial ratios, equations, and currency conversions' },
  { id: 'logical', name: 'Logical & Abstract Reasoning', icon: '', defaultWeight: 25, defaultTime: 15, desc: 'Pattern sequences, inductive logic, matrices, and deductive reasoning puzzles' },
  { id: 'verbal', name: 'English & Verbal Comprehension', icon: '', defaultWeight: 20, defaultTime: 15, desc: 'Written fluency, passage analysis, vocabulary, grammar, and inference' },
  { id: 'situational', name: 'Situational Judgment & Workplace Ethics', icon: '', defaultWeight: 15, defaultTime: 10, desc: 'Workplace dilemmas, professional integrity, conflict resolution, and compliance ethics' },
  { id: 'technical', name: 'Technical & Role-Specific Competency', icon: '', defaultWeight: 15, defaultTime: 20, desc: 'Domain-specific frameworks, software development, data models, or engineering principles' },
  { id: 'cognitive', name: 'Cognitive & Critical Thinking Ability', icon: '', defaultWeight: 20, defaultTime: 15, desc: 'Cognitive agility, problem formulation, spatial reasoning, and decision accuracy' },
  { id: 'procurement', name: 'Procurement & PPDA Regulations', icon: '', defaultWeight: 20, defaultTime: 15, desc: 'Statutory bidding guidelines, tender evaluations, contracts, and public procurement laws' },
  { id: 'governance', name: 'Public Sector Governance & Administration', icon: '', defaultWeight: 15, defaultTime: 15, desc: 'Administrative standing orders, public finance management (PFMA), and civil service rules' },
  { id: 'leadership', name: 'Leadership & Supervisory Fit', icon: '', defaultWeight: 20, defaultTime: 15, desc: 'Team delegation, performance coaching, strategic prioritization, and stakeholder leadership' },
  { id: 'customer', name: 'Customer Service & Emotional Intelligence (EQ)', icon: '', defaultWeight: 15, defaultTime: 10, desc: 'Client engagement, empathy, active listening, de-escalation, and brand representation' },
];

export const ASSESSMENT_SECTIONS = STANDARD_SECTION_TEMPLATES;

export const PsychometricSettingsView: React.FC<PsychometricSettingsViewProps> = ({
  tests,
  requisitions = [],
  onSaveTest,
  onDeleteTest,
  onLaunchTestPlayer,
}) => {
  // View mode: 'list' (dashboard of running tests) | 'editor' (test battery & question bank editor)
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [editorStep, setEditorStep] = useState(1);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);

  // Search & filters in list view
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Test form state
  const [testTitle, setTestTitle] = useState('');
  const [targetRole, setTargetRole] = useState('All Positions');
  const [testCategory, setTestCategory] = useState('Comprehensive All-Sections');
  const [deliveryMode, setDeliveryMode] = useState<'mixed' | 'sectional'>('sectional');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [passingScorePct, setPassingScorePct] = useState(70);
  const [testStatus, setTestStatus] = useState<'Active' | 'Pending Approval' | 'Draft' | 'Needs Revision' | 'Archived'>('Active');
  const [createdBy, setCreatedBy] = useState('Sarah M. (Lead Question Setter)');
  const [createdDate, setCreatedDate] = useState('18-Aug-2026');
  const [approvedBy, setApprovedBy] = useState('Dr. Arthur (Head of HR / Quality Lead)');
  const [approvedDate, setApprovedDate] = useState('18-Aug-2026');
  const [approvalComments, setApprovalComments] = useState('');
  const [mappedCategories, setMappedCategories] = useState<string[]>(['DIRECT MARKETING', 'Head Hunting']);
  
  // Custom Sections Defined for this Test
  const [customSections, setCustomSections] = useState<TestSectionDefinition[]>([
    {
      id: 'sec-numerical',
      title: 'Numerical Reasoning & Financial Logic',
      categoryType: 'numerical',
      description: 'Data interpretation, percentages, financial ratios, equations, and currency conversions',
      timeLimitMinutes: 10,
      weightPercentage: 30,
      passMarkPercentage: 70
    },
    {
      id: 'sec-logical',
      title: 'Logical & Abstract Reasoning',
      categoryType: 'logical',
      description: 'Pattern sequences, inductive logic, matrices, and deductive reasoning puzzles',
      timeLimitMinutes: 10,
      weightPercentage: 35,
      passMarkPercentage: 70
    },
    {
      id: 'sec-verbal',
      title: 'English & Verbal Comprehension',
      categoryType: 'verbal',
      description: 'Written fluency, passage analysis, vocabulary, grammar, and inference',
      timeLimitMinutes: 8,
      weightPercentage: 20,
      passMarkPercentage: 65
    },
    {
      id: 'sec-situational',
      title: 'Situational Judgment & Workplace Ethics',
      categoryType: 'situational',
      description: 'Workplace dilemmas, professional integrity, conflict resolution, and compliance ethics',
      timeLimitMinutes: 7,
      weightPercentage: 15,
      passMarkPercentage: 60
    }
  ]);

  const [selectedSections, setSelectedSections] = useState<string[]>([
    'numerical', 'logical', 'verbal', 'situational'
  ]);
  const [sectionWeights, setSectionWeights] = useState<Record<string, number>>({
    numerical: 30,
    logical: 35,
    verbal: 20,
    situational: 15
  });
  const [questions, setQuestions] = useState<TestQuestion[]>([]);

  // Add Section Modal State
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showSubmitApprovalModal, setShowSubmitApprovalModal] = useState(false);
  const [showApproveBatteryModal, setShowApproveBatteryModal] = useState(false);
  const [sectionSelectMode, setSectionSelectMode] = useState<'template' | 'custom'>('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(STANDARD_SECTION_TEMPLATES[0].id);
  const [customSectionTitle, setCustomSectionTitle] = useState('');
  const [customSectionDesc, setCustomSectionDesc] = useState('');
  const [customSectionTime, setCustomSectionTime] = useState<number>(15);
  const [customSectionWeight, setCustomSectionWeight] = useState<number>(20);
  const [customSectionPassMark, setCustomSectionPassMark] = useState<number>(70);
  const [sectionModalError, setSectionModalError] = useState<string | null>(null);

  // Composer for adding a NEW question
  const [targetSectionForNewQ, setTargetSectionForNewQ] = useState<string>('sec-numerical');
  const [newQSection, setNewQSection] = useState<string>('numerical');
  const [newQText, setNewQText] = useState<string>('');
  const [newQOptions, setNewQOptions] = useState<QuestionOption[]>([
    { key: 'A', text: '' },
    { key: 'B', text: '' },
    { key: 'C', text: '' },
    { key: 'D', text: '' }
  ]);
  const [newQCorrectKey, setNewQCorrectKey] = useState<string>('A');
  const [newQPoints, setNewQPoints] = useState<number>(20);
  const [composerError, setComposerError] = useState<string | null>(null);

  // Inline Question Editing state for saved questions
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQSection, setEditQSection] = useState<string>('numerical');
  const [editQText, setEditQText] = useState<string>('');
  const [editQOptions, setEditQOptions] = useState<QuestionOption[]>([]);
  const [editQCorrectKey, setEditQCorrectKey] = useState<string>('A');
  const [editQPoints, setEditQPoints] = useState<number>(20);

  // Revision comment modal state
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionNotesInput, setRevisionNotesInput] = useState('');

  // Notification toast
  const [notification, setNotification] = useState<string | null>(null);

  // Derived Requisition roles and psychometric test alerts
  const availableRequisitionRoles = useMemo(() => {
    const roles = Array.from(new Set(requisitions.map(r => r.position).filter(Boolean)));
    return roles.sort();
  }, [requisitions]);

  const requisitionsNeedingTests = useMemo(() => {
    return requisitions.filter(r => r.requirePsychometricTest);
  }, [requisitions]);

  // Open editor for an existing test
  const handleEditTest = (test: PsychometricTest) => {
    setEditingTestId(test.id);
    setTestTitle(test.title);
    setTargetRole(test.targetRole || 'All Positions');
    setTestCategory(test.category || 'Comprehensive All-Sections');
    setDeliveryMode(test.deliveryMode || 'sectional');
    setDurationMinutes(test.durationMinutes || 25);
    setPassingScorePct(test.passingScorePct || 70);
    setTestStatus(test.status || 'Active');
    setCreatedBy(test.createdBy || 'Sarah M. (Lead Question Setter)');
    setCreatedDate(test.createdDate || '18-Aug-2026');
    setApprovedBy(test.approvedBy || 'Dr. Arthur (Head of HR)');
    setApprovedDate(test.approvedDate || '18-Aug-2026');
    setApprovalComments(test.approvalComments || '');
    setMappedCategories(test.mappedCategories || ['DIRECT MARKETING']);
    
    // Set custom sections or derive from test
    if (test.sectionDefinitions && test.sectionDefinitions.length > 0) {
      setCustomSections(test.sectionDefinitions);
    } else {
      const derived = (test.sections || ['numerical', 'logical', 'verbal', 'situational']).map(secId => {
        const found = STANDARD_SECTION_TEMPLATES.find(s => s.id === secId);
        return {
          id: `sec-${secId}`,
          title: found?.name || secId,
          categoryType: secId,
          description: found?.desc || '',
          timeLimitMinutes: found?.defaultTime || 10,
          weightPercentage: (test.sectionWeights && test.sectionWeights[secId]) || found?.defaultWeight || 25,
          passMarkPercentage: test.passingScorePct || 70
        };
      });
      setCustomSections(derived);
    }

    const testSections = test.sections && test.sections.length > 0 
      ? test.sections 
      : ['numerical', 'logical', 'verbal', 'situational'];
    setSelectedSections(testSections);
    setSectionWeights(test.sectionWeights || {
      numerical: 30,
      logical: 35,
      verbal: 20,
      situational: 15
    });

    setQuestions(test.questions || []);
    setNewQSection(testSections[0] || 'numerical');
    setTargetSectionForNewQ(`sec-${testSections[0] || 'numerical'}`);
    setNewQText('');
    setNewQOptions([
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' }
    ]);
    setNewQCorrectKey('A');
    setNewQPoints(20);
    setComposerError(null);
    setEditingQuestionId(null);
    setViewMode('editor');
    setEditorStep(1);
  };

  // Open editor for creating a brand new test
  const handleAddNewTest = (initialRole?: string) => {
    setEditingTestId(null);
    setTestTitle(initialRole ? `${initialRole} Aptitude & Competency Battery` : 'New Psychometric Assessment Battery');
    setTargetRole(initialRole || 'All Positions');
    setTestCategory('Comprehensive All-Sections');
    setDeliveryMode('sectional');
    setDurationMinutes(30);
    setPassingScorePct(70);
    setTestStatus('Draft');
    setCreatedBy('Sarah M. (Lead Question Setter)');
    setCreatedDate('18-Aug-2026');
    setApprovedBy('');
    setApprovedDate('');
    setApprovalComments('');
    setMappedCategories(['DIRECT MARKETING', 'Head Hunting', 'Public Advertisement']);
    
    const initialSecs: TestSectionDefinition[] = [
      {
        id: 'sec-numerical',
        title: 'Numerical Reasoning & Financial Logic',
        categoryType: 'numerical',
        description: 'Data interpretation, percentages, financial ratios, equations, and currency conversions',
        timeLimitMinutes: 10,
        weightPercentage: 30,
        passMarkPercentage: 70
      },
      {
        id: 'sec-logical',
        title: 'Logical & Abstract Reasoning',
        categoryType: 'logical',
        description: 'Pattern sequences, inductive logic, matrices, and deductive reasoning puzzles',
        timeLimitMinutes: 10,
        weightPercentage: 40,
        passMarkPercentage: 70
      },
      {
        id: 'sec-situational',
        title: 'Situational Judgment & Workplace Ethics',
        categoryType: 'situational',
        description: 'Workplace dilemmas, professional integrity, conflict resolution, and compliance ethics',
        timeLimitMinutes: 10,
        weightPercentage: 30,
        passMarkPercentage: 65
      }
    ];

    setCustomSections(initialSecs);
    setSelectedSections(['numerical', 'logical', 'situational']);
    setSectionWeights({
      numerical: 30,
      logical: 40,
      situational: 30
    });

    setQuestions([
      {
        id: `q-demo-1`,
        section: 'numerical',
        sectionId: 'sec-numerical',
        sectionTitle: 'Numerical Reasoning & Financial Logic',
        text: 'A company allocates UGX 40,000,000 for procurement. If 25% is spent on software and 15% on hardware, what is the remaining unspent budget?',
        options: [
          { key: 'A', text: 'UGX 24,000,000' },
          { key: 'B', text: 'UGX 28,000,000' },
          { key: 'C', text: 'UGX 20,000,000' },
          { key: 'D', text: 'UGX 16,000,000' }
        ],
        correctKey: 'A',
        points: 20
      },
      {
        id: `q-demo-2`,
        section: 'logical',
        sectionId: 'sec-logical',
        sectionTitle: 'Logical & Abstract Reasoning',
        text: 'Identify the next logical number in the sequence: 4, 9, 16, 25, 36, ___',
        options: [
          { key: 'A', text: '49' },
          { key: 'B', text: '45' },
          { key: 'C', text: '50' },
          { key: 'D', text: '64' }
        ],
        correctKey: 'A',
        points: 20
      }
    ]);

    setNewQSection('numerical');
    setTargetSectionForNewQ('sec-numerical');
    setNewQText('');
    setNewQOptions([
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' }
    ]);
    setNewQCorrectKey('A');
    setNewQPoints(20);
    setComposerError(null);
    setEditingQuestionId(null);
    setViewMode('editor');
    setEditorStep(1);
  };

  // Add Section Handler (supports dropdown selection or custom title)
  const handleConfirmAddSection = () => {
    let newSec: TestSectionDefinition;

    if (sectionSelectMode === 'template') {
      const tpl = STANDARD_SECTION_TEMPLATES.find(t => t.id === selectedTemplateId);
      if (!tpl) {
        setSectionModalError('Please select a valid section template.');
        return;
      }
      
      // Check if section with this id already exists
      const existingId = customSections.some(s => s.categoryType === tpl.id || s.title === tpl.name);
      const uniqueId = `sec-${tpl.id}-${Date.now()}`;
      
      newSec = {
        id: uniqueId,
        title: tpl.name,
        categoryType: tpl.id,
        description: tpl.desc,
        timeLimitMinutes: Number(customSectionTime) || tpl.defaultTime,
        weightPercentage: Number(customSectionWeight) || tpl.defaultWeight,
        passMarkPercentage: Number(customSectionPassMark) || 70
      };
    } else {
      if (!customSectionTitle.trim()) {
        setSectionModalError('Please enter a descriptive title for this custom section.');
        return;
      }
      newSec = {
        id: `sec-custom-${Date.now()}`,
        title: customSectionTitle.trim(),
        categoryType: 'custom',
        description: customSectionDesc.trim() || 'Custom organizational assessment section',
        timeLimitMinutes: Number(customSectionTime) || 15,
        weightPercentage: Number(customSectionWeight) || 20,
        passMarkPercentage: Number(customSectionPassMark) || 70
      };
    }

    setCustomSections([...customSections, newSec]);
    if (!selectedSections.includes(newSec.categoryType || newSec.id)) {
      setSelectedSections([...selectedSections, newSec.categoryType || newSec.id]);
    }
    setSectionWeights(prev => ({
      ...prev,
      [newSec.categoryType || newSec.id]: newSec.weightPercentage || 20
    }));

    // Reset modal
    setShowAddSectionModal(false);
    setCustomSectionTitle('');
    setCustomSectionDesc('');
    setSectionModalError(null);
    setTargetSectionForNewQ(newSec.id);
    setNewQSection(newSec.categoryType || 'custom');

    setNotification(`Section "${newSec.title}" successfully added to the test battery.`);
    setTimeout(() => setNotification(null), 3500);
  };

  // Remove Section Handler
  const handleDeleteSection = (secId: string, secTitle: string) => {
    if (customSections.length <= 1) {
      setNotification('A test battery must have at least one active section.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (confirm(`Are you sure you want to remove section "${secTitle}"? Any questions belonging to this section will remain in the pool or be reassigned.`)) {
      setCustomSections(customSections.filter(s => s.id !== secId));
      setQuestions(questions.map(q => {
        if (q.sectionId === secId) {
          const remainingSec = customSections.find(s => s.id !== secId);
          return {
            ...q,
            sectionId: remainingSec?.id,
            sectionTitle: remainingSec?.title,
            section: remainingSec?.categoryType || 'numerical'
          };
        }
        return q;
      }));
      setNotification(`Section "${secTitle}" removed.`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Add question from composer to question list
  const handleAddQuestionFromComposer = (targetSecId?: string) => {
    if (!newQText.trim()) {
      setComposerError('Please enter the question premise / problem statement.');
      return;
    }
    const hasEmptyOption = newQOptions.some(opt => !opt.text.trim());
    if (hasEmptyOption) {
      setComposerError('Please fill in text for all 4 answer options (A, B, C, D).');
      return;
    }

    const effectiveSecId = targetSecId || targetSectionForNewQ || customSections[0]?.id;
    const secObj = customSections.find(s => s.id === effectiveSecId);

    setComposerError(null);
    const newQ: TestQuestion = {
      id: `q-${Date.now()}`,
      section: secObj?.categoryType || newQSection || 'numerical',
      sectionId: effectiveSecId,
      sectionTitle: secObj?.title || 'General Section',
      text: newQText.trim(),
      options: newQOptions.map(opt => ({ ...opt, text: opt.text.trim() })),
      correctKey: newQCorrectKey,
      points: Number(newQPoints) || 20
    };

    setQuestions([...questions, newQ]);
    // Reset composer
    setNewQText('');
    setNewQOptions([
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' }
    ]);
    setNewQCorrectKey('A');

    const secName = secObj?.title || newQ.section;
    setNotification(`✓ Question added to [${secName}] with Correct Answer: Option ${newQ.correctKey}!`);
    setTimeout(() => setNotification(null), 3500);
  };

  // Start editing a saved question inline
  const handleStartEditQuestion = (q: TestQuestion) => {
    setEditingQuestionId(q.id);
    setEditQSection(q.section || 'numerical');
    setEditQText(q.text);
    setEditQOptions(q.options.map(opt => ({ ...opt })));
    setEditQCorrectKey(q.correctKey);
    setEditQPoints(q.points || 20);
  };

  // Save changes to an existing question
  const handleSaveQuestionChanges = (qId: string) => {
    if (!editQText.trim()) {
      alert('Question premise cannot be empty.');
      return;
    }
    const hasEmpty = editQOptions.some(opt => !opt.text.trim());
    if (hasEmpty) {
      alert('All 4 option choices must have text.');
      return;
    }

    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          section: editQSection,
          text: editQText.trim(),
          options: editQOptions.map(opt => ({ ...opt, text: opt.text.trim() })),
          correctKey: editQCorrectKey,
          points: Number(editQPoints) || 20
        };
      }
      return q;
    }));

    setEditingQuestionId(null);
    setNotification(`✓ Question updated successfully! Correct Answer: Option ${editQCorrectKey}`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Cancel question edit
  const handleCancelQuestionEdit = () => {
    setEditingQuestionId(null);
  };

  // Delete question from list
  const handleDeleteQuestion = (qId: string) => {
    setQuestions(questions.filter(q => q.id !== qId));
  };

  // Save Current Test
  const handleSaveCurrentTest = () => {
    if (!testTitle.trim()) {
      setNotification('Please enter a title for the test battery.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const testId = editingTestId || `test-${Date.now()}`;
    const testToSave: PsychometricTest = {
      id: testId,
      title: testTitle.trim(),
      targetRole: targetRole === 'All Positions' ? undefined : targetRole,
      category: testCategory as any,
      deliveryMode,
      durationMinutes: Number(durationMinutes) || 25,
      passingScorePct: Number(passingScorePct) || 70,
      mappedCategories,
      sections: customSections.map(s => s.categoryType || s.id),
      sectionDefinitions: customSections,
      sectionWeights,
      questions,
      status: testStatus,
      createdBy,
      createdDate,
      approvedBy,
      approvedDate,
      approvalComments
    };

    onSaveTest(testToSave);
    setNotification(`Test battery "${testToSave.title}" saved successfully.`);
    setTimeout(() => setNotification(null), 3500);
    setViewMode('list');
  };

  // Submit for Approval (Setter action)
  const handleInitiateSubmitForApproval = () => {
    if (!testTitle.trim() || questions.length === 0) {
      setNotification('Please provide a title and at least 1 question before submitting.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    setShowSubmitApprovalModal(true);
  };

  const handleConfirmSubmitForApproval = () => {
    setShowSubmitApprovalModal(false);
    const testId = editingTestId || `test-${Date.now()}`;
    const testToSave: PsychometricTest = {
      id: testId,
      title: testTitle.trim(),
      targetRole: targetRole === 'All Positions' ? undefined : targetRole,
      category: testCategory as any,
      deliveryMode,
      durationMinutes: Number(durationMinutes) || 25,
      passingScorePct: Number(passingScorePct) || 70,
      mappedCategories,
      sections: customSections.map(s => s.categoryType || s.id),
      sectionDefinitions: customSections,
      sectionWeights,
      questions,
      status: 'Pending Approval',
      createdBy,
      createdDate: '18-Aug-2026'
    };

    onSaveTest(testToSave);
    setNotification(`Test battery submitted for Governance Review & Approval.`);
    setTimeout(() => setNotification(null), 4000);
    setViewMode('list');
  };

  // Approve Test Battery
  const handleInitiateApproveBattery = () => {
    setShowApproveBatteryModal(true);
  };

  const handleConfirmApproveBattery = () => {
    setShowApproveBatteryModal(false);
    const testId = editingTestId || `test-${Date.now()}`;
    const testToSave: PsychometricTest = {
      id: testId,
      title: testTitle.trim(),
      targetRole: targetRole === 'All Positions' ? undefined : targetRole,
      category: testCategory as any,
      deliveryMode,
      durationMinutes: Number(durationMinutes) || 25,
      passingScorePct: Number(passingScorePct) || 70,
      mappedCategories,
      sections: customSections.map(s => s.categoryType || s.id),
      sectionDefinitions: customSections,
      sectionWeights,
      questions,
      status: 'Active',
      createdBy,
      createdDate,
      approvedBy: 'Dr. Arthur (Head of HR / Quality Lead)',
      approvedDate: '18-Aug-2026',
      approvalComments: 'Verified question accuracy, psychometric balance, and scoring rubric.'
    };

    onSaveTest(testToSave);
    setNotification(`Test Battery officially approved and set to Active.`);
    setTimeout(() => setNotification(null), 4000);
    setViewMode('list');
  };

  // Filter running tests in list view
  const filteredTests = tests.filter(t => {
    if (selectedStatusFilter !== 'all' && (t.status || 'Active') !== selectedStatusFilter) return false;
    if (selectedSectionFilter !== 'all') {
      const matchSection = (t.sections || []).includes(selectedSectionFilter) || (t.sectionDefinitions || []).some(s => s.categoryType === selectedSectionFilter);
      if (!matchSection) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchCategory = (t.category || '').toLowerCase().includes(q);
      const matchSetter = (t.createdBy || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCategory && !matchSetter) return false;
    }
    return true;
  });

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Active & Published</span>
          </span>
        );
      case 'Pending Approval':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending Governance Review</span>
          </span>
        );
      case 'Needs Revision':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <RotateCcw className="w-3 h-3 text-rose-600" />
            <span>Returned for Revision</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span>Draft</span>
          </span>
        );
    }
  };

  const activeTestsCount = tests.filter(t => t.status === 'Active').length;
  const pendingTestsCount = tests.filter(t => t.status === 'Pending Approval').length;
  const draftTestsCount = tests.filter(t => t.status === 'Draft').length;
  const totalQuestions = tests.reduce((sum, t) => sum + (t.questions?.length || 0), 0);

  return (
    <ViewShell className="select-text">
      {notification && (
        <NotificationBanner message={notification} onDismiss={() => setNotification(null)} variant="info" />
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: RUNNING TESTS DASHBOARD (LIST VIEW)                              */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          <PageHeader
            badge="Assessment Configuration"
            badgeColor="bg-cyan-50 text-cyan-700 border-cyan-200"
            title="Psychometric Assessment Batteries & Question Banks"
            subtitle="Configure standardized multi-section aptitude tests, question banks, passing thresholds, and scoring rubrics."
            actions={
              <button type="button" onClick={() => handleAddNewTest()} className="btn btn-primary">
                <Plus className="w-4 h-4" />
                Create New Test Battery
              </button>
            }
          />

          <MetricGrid cols="grid-cols-2 sm:grid-cols-4">
            <DashboardKpiCard title="Batteries in View" value={filteredTests.length} icon={BrainCircuit} theme="blue" footer={<><span className="text-blue-600 font-semibold">{tests.length}</span> total configured batteries</>} />
            <DashboardKpiCard title="Active & Live" value={activeTestsCount} icon={CheckCircle2} theme="green" footer={<span className="text-emerald-600 font-semibold">Ready for candidate dispatch</span>} />
            <DashboardKpiCard title="Pending Approval" value={pendingTestsCount} icon={Clock} theme="amber" footer={<span>Awaiting governance sign-off</span>} />
            <DashboardKpiCard title="Total Questions" value={totalQuestions} icon={FileQuestion} theme="purple" footer={draftTestsCount > 0 ? <><span className="text-violet-600 font-semibold">{draftTestsCount}</span> draft batteries</> : undefined} />
          </MetricGrid>

          {/* Requisition Alert: Jobs Requiring Psychometric Tests */}
          {requisitionsNeedingTests.length > 0 && (
            <div className="bg-blue-50/90 border border-blue-200 rounded p-3 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-[#0284c7]" />
                  <span>Requisitions Requiring Standardized Psychometric Tests ({requisitionsNeedingTests.length})</span>
                </span>
                <span className="text-[11px] text-blue-700 font-semibold">
                  Triggered during Job Requisition Creation
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {requisitionsNeedingTests.map(req => {
                  const hasAttachedTest = tests.some(t => t.targetRole === req.position);
                  return (
                    <div key={req.id} className="bg-white border border-blue-200 rounded px-2.5 py-1.5 flex items-center gap-2 shadow-2xs">
                      <div>
                        <strong className="text-gray-900 block text-xs">{req.position}</strong>
                        <span className="text-[10px] text-gray-500 font-mono">{req.reqNo} • {req.department}</span>
                      </div>
                      {hasAttachedTest ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          ✓ Test Attached
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddNewTest(req.position)}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0284c7] hover:bg-[#0369a1] text-white cursor-pointer shadow-2xs"
                        >
                          + Create for Role
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <FilterPanel title="Test Battery Filters">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FilterField label="Search test title, setter...">
                <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </FilterField>
              <FilterField label="Section">
                <SearchableSelect
                  value={selectedSectionFilter}
                  onChange={setSelectedSectionFilter}
                  options={[
                    { value: 'all', label: 'All Sections' },
                    ...STANDARD_SECTION_TEMPLATES.map(s => ({ value: s.id, label: s.name, searchText: `${s.name} ${s.desc || ''}` })),
                  ]}
                  placeholder="All Sections"
                  searchPlaceholder="Search section type…"
                />
              </FilterField>
              <FilterField label="Governance Status">
                <SearchableSelect
                  value={selectedStatusFilter}
                  onChange={setSelectedStatusFilter}
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'Active', label: 'Active & Live' },
                    { value: 'Pending Approval', label: 'Pending Approval' },
                    { value: 'Draft', label: 'Draft' },
                  ]}
                  placeholder="All Statuses"
                  searchPlaceholder="Search status…"
                />
              </FilterField>
            </div>
          </FilterPanel>

          <DataTableShell title="Running Test Batteries" subtitle={`${filteredTests.length} batter${filteredTests.length === 1 ? 'y' : 'ies'} matching filters`}>
              <table className="standard-table">
                <thead>
                  <tr>
                    <th>Test Battery Title</th>
                    <th>Target Role / Scope</th>
                    <th>Mode</th>
                    <th>Sections Included</th>
                    <th className="text-center">Questions</th>
                    <th className="text-center">Duration</th>
                    <th className="text-center">Pass Benchmark</th>
                    <th className="text-center">Governance Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {filteredTests.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-gray-500 italic">
                        No psychometric tests matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTests.map((t) => {
                      const secDefs = t.sectionDefinitions || [];
                      return (
                        <tr key={t.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-3 px-3">
                            <strong className="text-gray-900 font-bold block">{t.title}</strong>
                            <span className="text-[10px] text-gray-500">By {t.createdBy || 'Lead Setter'}</span>
                          </td>

                          <td className="py-3 px-3">
                            {t.targetRole ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-50 text-[#0f4c81] border border-blue-200">
                                {t.targetRole}
                              </span>
                            ) : (
                              <span className="text-gray-500 text-[10.5px]">All Positions (General)</span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.deliveryMode === 'sectional' ? 'bg-sky-50 text-sky-900 border border-sky-300' : 'bg-slate-100 text-slate-800'
                            }`}>
                              {t.deliveryMode === 'sectional' ? 'Section-by-Section' : 'Mixed Pool'}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1">
                              {secDefs.length > 0 ? (
                                secDefs.map(s => (
                                  <span key={s.id} className="bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                                    {s.title.split(' ')[0]}
                                  </span>
                                ))
                              ) : (
                                (t.sections || ['numerical', 'logical']).map(s => (
                                  <span key={s} className="bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                                    {s}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center font-bold text-blue-900">
                            {t.questions?.length || 0} Qns
                          </td>

                          <td className="py-3 px-3 text-center font-semibold text-gray-700">
                            {t.durationMinutes} min
                          </td>

                          <td className="py-3 px-3 text-center font-bold text-emerald-700">
                            {t.passingScorePct}%
                          </td>

                          <td className="py-3 px-3 text-center">
                            {renderStatusBadge(t.status)}
                          </td>

                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleEditTest(t)}
                                className="px-2.5 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Configure Sections & Qns</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => onLaunchTestPlayer(t)}
                                className="px-2.5 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                              >
                                <Play className="w-3 h-3" />
                                <span>Test Drive</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
          </DataTableShell>
        </div>
      )}

      {/* VIEW 2: TEST BATTERY EDITOR — stepped modal wizard */}
      <FormModal
        isOpen={viewMode === 'editor'}
        onClose={() => { setViewMode('list'); setEditorStep(1); }}
        title={editingTestId ? 'Edit Psychometric Test Battery' : 'Create New Psychometric Test Battery'}
        subtitle={`Author: ${createdBy} • 2-Tier Quality Assurance`}
        maxWidth="5xl"
        badge={renderStatusBadge(testStatus)}
      >
        <RequisitionStepper steps={BATTERY_WIZARD_STEPS} currentStep={editorStep} onStepClick={setEditorStep} />

        <div className="wizard-info-bar">
          <span><strong>Psychometric Battery Wizard</strong> — Setup → Sections → Questions → Review &amp; Publish</span>
          <span className="text-[11px] font-bold">{questions.length} questions · {customSections.length} sections</span>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[min(52vh,560px)] space-y-4 text-xs">
          {editorStep === 1 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2">
              <h3 className="font-bold text-xs text-[#0f4c81] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#0f4c81] text-white flex items-center justify-center text-[10px]">1</span>
                <span>Test Battery Setup & Delivery Structure</span>
              </h3>

              {/* Mode Switcher Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded border border-slate-300 text-xs">
                <span className="text-[11px] font-bold text-gray-600 px-2">Structure Mode:</span>
                <button
                  type="button"
                  onClick={() => setDeliveryMode('sectional')}
                  className={`px-3 py-1 rounded font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    deliveryMode === 'sectional'
                      ? 'bg-[#0f4c81] text-white shadow-xs'
                      : 'text-gray-700 hover:bg-slate-200'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span>Separate Sections</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMode('mixed')}
                  className={`px-3 py-1 rounded font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    deliveryMode === 'mixed'
                      ? 'bg-[#0f4c81] text-white shadow-xs'
                      : 'text-gray-700 hover:bg-slate-200'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Mixed Pool</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-gray-700 font-bold mb-1">Test Battery Title *</label>
                <input
                  type="text"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  placeholder="e.g. Comprehensive Aptitude & Technical Battery"
                  className="w-full bg-white border border-[#cbd5e1] rounded px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Target Role / Position</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-[#0284c7] focus:outline-none cursor-pointer"
                >
                  <option value="All Positions">All Positions (General Battery)</option>
                  {availableRequisitionRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Total Duration (Minutes) *</label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-white border border-[#cbd5e1] rounded px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Overall Pass Mark (%) *</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={passingScorePct}
                  onChange={(e) => setPassingScorePct(Number(e.target.value))}
                  className="w-full bg-white border border-[#cbd5e1] rounded px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                />
              </div>
            </div>
          </div>
          )}

          {editorStep === 2 && (
          <div className="bg-white border border-[#cbd5e1] rounded-sm p-4 shadow-xs space-y-4">
          {/* STEP 2: SECTIONS MANAGEMENT */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2">
              <div>
                <h3 className="font-bold text-xs text-[#0f4c81] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0f4c81] text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Test Sections & Weight Allocations ({customSections.length} Defined Sections)</span>
                </h3>
                <p className="text-[11px] text-gray-500">
                  {deliveryMode === 'sectional' 
                    ? 'Candidates will complete questions grouped per section with distinct timers, instructions, and scoring.' 
                    : 'Questions can be tagged with any of these sections in a unified pool.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(true)}
                  className="px-3 py-1.5 bg-[#0891b2] hover:bg-[#0e7490] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>+ Add Section</span>
                </button>
              </div>
            </div>

            {/* Sections Grid Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {customSections.map((sec, idx) => {
                const secQCount = questions.filter(q => q.sectionId === sec.id || (q.section && q.section === sec.categoryType)).length;

                return (
                  <div
                    key={sec.id}
                    className="p-3 bg-slate-50 border border-slate-300 rounded hover:border-[#0284c7] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-xs font-bold text-gray-900 line-clamp-1">{sec.title}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteSection(sec.id, sec.title)}
                          className="text-gray-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                          title="Remove Section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 line-clamp-2 leading-tight mb-2">
                        {sec.description || 'Section questions bank'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-200 text-[10px] space-y-1">
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Weighting:</span>
                        <strong className="text-gray-900">{sec.weightPercentage || 25}%</strong>
                      </div>
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Time Limit:</span>
                        <strong className="text-gray-900">{sec.timeLimitMinutes || 10} mins</strong>
                      </div>
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Questions:</span>
                        <span className={`font-bold px-1.5 py-0.2 rounded font-mono ${
                          secQCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {secQCount} added
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {editorStep === 3 && (
          <>
          {/* STEP 3: QUESTION COMPOSER & SECTION CONTAINERS */}
          {deliveryMode === 'sectional' ? (
            /* SECTION-BY-SECTION ORGANIZED VIEW */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-[#0f4c81] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0f4c81] text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Questions Grouped Per Section</span>
                </h3>

                <span className="text-xs text-gray-500">
                  Total Questions: <strong>{questions.length}</strong> • Total Points: <strong>{questions.reduce((sum, q) => sum + (q.points || 20), 0)} pts</strong>
                </span>
              </div>

              {/* Loop through each section */}
              {customSections.map((sec, secIdx) => {
                const secQuestions = questions.filter(q => q.sectionId === sec.id || (q.section && q.section === sec.categoryType));
                const isTargetForNewQ = targetSectionForNewQ === sec.id;

                return (
                  <div key={sec.id} className="bg-white border border-[#cbd5e1] rounded-sm p-4 shadow-xs space-y-3">
                    {/* Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-200 bg-slate-50/70 p-2.5 rounded">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-[#0f4c81] text-white flex items-center justify-center font-bold text-xs">
                          {secIdx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-xs text-gray-900">{sec.title}</h4>
                            <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-1.5 py-0.5 rounded">
                              {sec.weightPercentage || 25}% Weight
                            </span>
                            <span className="text-[10px] bg-slate-200 text-slate-800 font-medium px-1.5 py-0.5 rounded">
                              {sec.timeLimitMinutes || 10} min limit
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500">{sec.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setTargetSectionForNewQ(sec.id);
                            setNewQSection(sec.categoryType || 'numerical');
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                            isTargetForNewQ 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Question to this Section</span>
                        </button>
                      </div>
                    </div>

                    {/* Inline Composer if this section is selected */}
                    {isTargetForNewQ && (
                      <div className="p-3.5 bg-emerald-50/70 border border-emerald-300 rounded-sm space-y-3 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                            <span>New Question for [{sec.title}]</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-600 font-medium">Question Points:</span>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={newQPoints}
                              onChange={(e) => setNewQPoints(Number(e.target.value))}
                              className="w-16 bg-white border border-gray-300 rounded px-2 py-0.5 text-xs font-bold text-center"
                            />
                          </div>
                        </div>

                        {composerError && (
                          <div className="p-2 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded">
                            {composerError}
                          </div>
                        )}

                        <div>
                          <label className="block text-gray-700 font-bold text-xs mb-1">
                            Question Premise / Problem Statement *
                          </label>
                          <textarea
                            rows={2}
                            value={newQText}
                            onChange={(e) => setNewQText(e.target.value)}
                            placeholder={`Enter question problem for ${sec.title}...`}
                            className="w-full bg-white border border-gray-300 rounded p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        {/* Explicit Correct Answer Key Selector Bar */}
                        <div className="bg-white border border-emerald-300 rounded p-2.5 space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <label className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Select Correct Answer Key (Required for Auto-Scoring) *:</span>
                            </label>
                            <span className="text-[11px] text-emerald-700 font-medium">
                              Currently Selected: <strong className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">Option {newQCorrectKey}</strong>
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                            {(['A', 'B', 'C', 'D'] as const).map(key => (
                              <label
                                key={key}
                                onClick={() => setNewQCorrectKey(key)}
                                className={`flex items-center gap-2 p-1.5 rounded border cursor-pointer transition-all text-xs ${
                                  newQCorrectKey === key
                                    ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-2xs'
                                    : 'bg-slate-50 hover:bg-slate-100 text-gray-700 border-gray-200'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`correctKey-${sec.id}`}
                                  checked={newQCorrectKey === key}
                                  onChange={() => setNewQCorrectKey(key)}
                                  className="accent-emerald-700"
                                />
                                <span>Option {key} is Correct</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* 4 Options Grid */}
                        <div className="space-y-1.5">
                          <label className="block text-gray-700 font-bold text-[11px]">
                            Enter Option Choices (Click option letter or radio above to set as correct answer):
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {newQOptions.map((opt, optIdx) => {
                              const isCorrect = newQCorrectKey === opt.key;
                              return (
                                <div
                                  key={opt.key}
                                  className={`flex items-center gap-2 p-2 rounded border transition-all ${
                                    isCorrect 
                                      ? 'bg-emerald-100/80 border-emerald-500 shadow-2xs ring-1 ring-emerald-400' 
                                      : 'bg-white border-gray-300 hover:border-gray-400'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => setNewQCorrectKey(opt.key)}
                                    title={`Click to mark Option ${opt.key} as correct`}
                                    className={`w-7 h-7 rounded font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                                      isCorrect ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                    }`}
                                  >
                                    {opt.key}
                                  </button>
                                  <input
                                    type="text"
                                    value={opt.text}
                                    onChange={(e) => {
                                      const updated = [...newQOptions];
                                      updated[optIdx].text = e.target.value;
                                      setNewQOptions(updated);
                                    }}
                                    placeholder={`Option ${opt.key} text...`}
                                    className="w-full bg-transparent text-xs focus:outline-none font-medium text-gray-900"
                                  />
                                  {isCorrect && (
                                    <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold shrink-0">
                                      ✓ Correct
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setTargetSectionForNewQ('')}
                            className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddQuestionFromComposer(sec.id)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1.5"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Question (Key: {newQCorrectKey})</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Questions in this section */}
                    {secQuestions.length === 0 ? (
                      <div className="py-4 text-center text-gray-400 text-xs italic border border-dashed border-gray-200 rounded">
                        No questions in this section yet. Click "+ Add Question to this Section" above!
                      </div>
                    ) : (
                      <div className="space-y-4 pt-2">
                        {secQuestions.map((q, qIdx) => {
                          const isBeingEdited = editingQuestionId === q.id;

                          if (isBeingEdited) {
                            return (
                              <div key={q.id} className="p-4 sm:p-5 bg-amber-50/70 border border-amber-300 rounded-md space-y-4 shadow-xs">
                                <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
                                  <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                                    <Edit3 className="w-4 h-4 text-amber-700" />
                                    <span>Editing Question #{qIdx + 1}</span>
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-gray-600 font-semibold">Points:</span>
                                    <input
                                      type="number"
                                      min="1"
                                      max="100"
                                      value={editQPoints}
                                      onChange={(e) => setEditQPoints(Number(e.target.value))}
                                      className="w-16 bg-white border border-gray-300 rounded px-2 py-0.5 text-xs font-bold text-center"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-gray-700 font-bold text-xs mb-1">
                                    Question Premise *
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={editQText}
                                    onChange={(e) => setEditQText(e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                                  />
                                </div>

                                {/* Correct Answer Selector in Edit Mode */}
                                <div className="bg-white border border-amber-300 rounded p-3 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-amber-950 flex items-center gap-1">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                      <span>Configure Correct Answer Key *:</span>
                                    </label>
                                    <span className="text-[11px] text-emerald-800 font-bold">
                                      Selected Key: Option {editQCorrectKey}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                    {(['A', 'B', 'C', 'D'] as const).map(key => (
                                      <label
                                        key={key}
                                        onClick={() => setEditQCorrectKey(key)}
                                        className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all text-xs ${
                                          editQCorrectKey === key
                                            ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-2xs'
                                            : 'bg-slate-50 hover:bg-slate-100 text-gray-700 border-gray-200'
                                        }`}
                                      >
                                        <input
                                          type="radio"
                                          name={`editCorrectKey-${q.id}`}
                                          checked={editQCorrectKey === key}
                                          onChange={() => setEditQCorrectKey(key)}
                                          className="accent-emerald-700"
                                        />
                                        <span>Option {key} is Correct</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>

                                {/* Options Input Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {editQOptions.map((opt, optIdx) => {
                                    const isCorrect = editQCorrectKey === opt.key;
                                    return (
                                      <div
                                        key={opt.key}
                                        className={`flex items-center gap-2 p-2.5 rounded border transition-all ${
                                          isCorrect ? 'bg-emerald-100/80 border-emerald-500 ring-1 ring-emerald-400' : 'bg-white border-gray-300'
                                        }`}
                                      >
                                        <button
                                          type="button"
                                          onClick={() => setEditQCorrectKey(opt.key)}
                                          title={`Click to mark Option ${opt.key} as correct answer`}
                                          className={`w-7 h-7 rounded font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer ${
                                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                          }`}
                                        >
                                          {opt.key}
                                        </button>
                                        <input
                                          type="text"
                                          value={opt.text}
                                          onChange={(e) => {
                                            const updated = [...editQOptions];
                                            updated[optIdx].text = e.target.value;
                                            setEditQOptions(updated);
                                          }}
                                          className="w-full bg-transparent text-xs focus:outline-none font-medium"
                                        />
                                        {isCorrect && (
                                          <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold shrink-0">
                                            ✓ Correct
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t border-amber-200">
                                  <button
                                    type="button"
                                    onClick={handleCancelQuestionEdit}
                                    className="px-3.5 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-xs hover:bg-slate-50 cursor-pointer font-medium"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveQuestionChanges(q.id)}
                                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Save Question Changes</span>
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={q.id} className="p-4 sm:p-5 bg-white border border-slate-200 rounded-md hover:border-slate-300 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs">
                              <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                                    {qIdx + 1}
                                  </span>
                                  <span className="font-semibold text-gray-900 text-sm">{q.text}</span>
                                  <span className="text-[11px] bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold ml-auto sm:ml-0">
                                    {q.points || 20} pts
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                                  {q.options.map(opt => {
                                    const isCorrect = opt.key === q.correctKey;
                                    return (
                                      <div key={opt.key} className={`px-3 py-2 rounded text-[11px] border transition-all ${
                                        isCorrect 
                                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-1 ring-emerald-300' 
                                          : 'bg-slate-50 border-slate-200 text-slate-700'
                                      }`}>
                                        <div className="flex items-center justify-between gap-1.5">
                                          <span><strong className="text-gray-900">{opt.key}:</strong> {opt.text}</span>
                                          {isCorrect && (
                                            <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold shrink-0">
                                              ✓ Key
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-start pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditQuestion(q)}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0f4c81] rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors border border-slate-300"
                                  title="Edit Question & Answer Key"
                                >
                                  <Edit3 className="w-3 h-3 text-[#0284c7]" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteQuestion(q.id)}
                                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded cursor-pointer transition-colors hover:bg-rose-50"
                                  title="Delete Question"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* UNIFIED / MIXED POOL COMPOSER & LIST */
            <div className="bg-white border border-[#cbd5e1] rounded-sm p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h3 className="font-bold text-xs text-[#0f4c81] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0f4c81] text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Unified Question Bank Composer</span>
                </h3>
                <span className="text-xs text-gray-500">
                  Total Questions: <strong>{questions.length}</strong>
                </span>
              </div>

              {/* Composer */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-gray-700 font-bold text-xs mb-1">
                      Assign to Section Tag *
                    </label>
                    <select
                      value={targetSectionForNewQ}
                      onChange={(e) => setTargetSectionForNewQ(e.target.value)}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-3 py-1.5 text-xs font-semibold text-gray-800 focus:ring-1 focus:ring-[#0284c7] focus:outline-none cursor-pointer"
                    >
                      {customSections.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold text-xs mb-1">
                      Points / Marks *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newQPoints}
                      onChange={(e) => setNewQPoints(Number(e.target.value))}
                      className="w-full bg-white border border-[#cbd5e1] rounded px-3 py-1.5 text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold text-xs mb-1">
                    Question Premise / Statement *
                  </label>
                  <textarea
                    rows={2}
                    value={newQText}
                    onChange={(e) => setNewQText(e.target.value)}
                    placeholder="Type the problem premise..."
                    className="w-full bg-white border border-[#cbd5e1] rounded px-3 py-2 text-xs"
                  />
                </div>

                {/* Explicit Correct Answer Key Selector Bar */}
                <div className="bg-white border border-[#cbd5e1] rounded p-2.5 space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="text-xs font-bold text-gray-900 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Select Correct Answer Key (Required for Auto-Scoring) *:</span>
                    </label>
                    <span className="text-[11px] text-emerald-800 font-bold">
                      Currently Selected: <strong className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">Option {newQCorrectKey}</strong>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {(['A', 'B', 'C', 'D'] as const).map(key => (
                      <label
                        key={key}
                        onClick={() => setNewQCorrectKey(key)}
                        className={`flex items-center gap-2 p-1.5 rounded border cursor-pointer transition-all text-xs ${
                          newQCorrectKey === key
                            ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="correctKey-unified"
                          checked={newQCorrectKey === key}
                          onChange={() => setNewQCorrectKey(key)}
                          className="accent-emerald-700"
                        />
                        <span>Option {key} is Correct</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-gray-700 font-bold text-[11px]">
                    Enter Option Choices (Click option letter or radio above to set as correct answer):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {newQOptions.map((opt, idx) => {
                      const isCorrect = newQCorrectKey === opt.key;
                      return (
                        <div
                          key={opt.key}
                          className={`flex items-center gap-2 p-2 rounded border transition-all ${
                            isCorrect ? 'bg-emerald-100/80 border-emerald-500 shadow-2xs ring-1 ring-emerald-400' : 'bg-white border-gray-300'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setNewQCorrectKey(opt.key)}
                            title={`Click to mark Option ${opt.key} as correct answer`}
                            className={`w-7 h-7 rounded font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                              isCorrect ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            {opt.key}
                          </button>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => {
                              const updated = [...newQOptions];
                              updated[idx].text = e.target.value;
                              setNewQOptions(updated);
                            }}
                            placeholder={`Enter text for Option ${opt.key}...`}
                            className="w-full bg-transparent border-none text-xs focus:outline-none font-medium text-gray-900"
                          />
                          {isCorrect && (
                            <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold shrink-0">
                              ✓ Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleAddQuestionFromComposer()}
                    className="px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Question to Pool (Key: Option {newQCorrectKey})</span>
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4 pt-2">
                {questions.map((q, idx) => {
                  const isBeingEdited = editingQuestionId === q.id;

                  if (isBeingEdited) {
                    return (
                      <div key={q.id} className="p-4 sm:p-5 bg-amber-50/70 border border-amber-300 rounded-md space-y-4 shadow-xs">
                        <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
                          <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                            <Edit3 className="w-4 h-4 text-amber-700" />
                            <span>Editing Question #{idx + 1}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-600 font-semibold">Points:</span>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={editQPoints}
                              onChange={(e) => setEditQPoints(Number(e.target.value))}
                              className="w-16 bg-white border border-gray-300 rounded px-2 py-0.5 text-xs font-bold text-center"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 font-bold text-xs mb-1">
                            Question Premise *
                          </label>
                          <textarea
                            rows={2}
                            value={editQText}
                            onChange={(e) => setEditQText(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        {/* Correct Answer Selector in Edit Mode */}
                        <div className="bg-white border border-amber-300 rounded p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-amber-950 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Configure Correct Answer Key *:</span>
                            </label>
                            <span className="text-[11px] text-emerald-800 font-bold">
                              Selected Key: Option {editQCorrectKey}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                            {(['A', 'B', 'C', 'D'] as const).map(key => (
                              <label
                                key={key}
                                onClick={() => setEditQCorrectKey(key)}
                                className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all text-xs ${
                                  editQCorrectKey === key
                                    ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-2xs'
                                    : 'bg-slate-50 hover:bg-slate-100 text-gray-700 border-gray-200'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`editCorrectKey-pool-${q.id}`}
                                  checked={editQCorrectKey === key}
                                  onChange={() => setEditQCorrectKey(key)}
                                  className="accent-emerald-700"
                                />
                                <span>Option {key} is Correct</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Options Input Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {editQOptions.map((opt, optIdx) => {
                            const isCorrect = editQCorrectKey === opt.key;
                            return (
                              <div
                                key={opt.key}
                                className={`flex items-center gap-2 p-2.5 rounded border transition-all ${
                                  isCorrect ? 'bg-emerald-100/80 border-emerald-500 ring-1 ring-emerald-400' : 'bg-white border-gray-300'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => setEditQCorrectKey(opt.key)}
                                  title={`Click to mark Option ${opt.key} as correct answer`}
                                  className={`w-7 h-7 rounded font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer ${
                                    isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                  }`}
                                >
                                  {opt.key}
                                </button>
                                <input
                                  type="text"
                                  value={opt.text}
                                  onChange={(e) => {
                                    const updated = [...editQOptions];
                                    updated[optIdx].text = e.target.value;
                                    setEditQOptions(updated);
                                  }}
                                  className="w-full bg-transparent text-xs focus:outline-none font-medium"
                                />
                                {isCorrect && (
                                  <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold shrink-0">
                                    ✓ Correct
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-amber-200">
                          <button
                            type="button"
                            onClick={handleCancelQuestionEdit}
                            className="px-3.5 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-xs hover:bg-slate-50 cursor-pointer font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveQuestionChanges(q.id)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Save Question Changes</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={q.id} className="p-4 sm:p-5 bg-white border border-slate-200 rounded-md hover:border-slate-300 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-gray-900 text-sm">{q.text}</span>
                          <span className="text-[11px] bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
                            {q.sectionTitle || q.section}
                          </span>
                          <span className="text-[11px] bg-blue-50 text-blue-800 font-semibold px-2 py-0.5 rounded border border-blue-200">
                            {q.points || 20} pts
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 text-[11px]">
                          {q.options.map(opt => {
                            const isCorrect = opt.key === q.correctKey;
                            return (
                              <div key={opt.key} className={`px-3 py-2 rounded text-[11px] border transition-all ${
                                isCorrect ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-950 ring-1 ring-emerald-300' : 'bg-slate-50 border-gray-200 text-slate-700'
                              }`}>
                                <div className="flex items-center justify-between gap-1.5">
                                  <span><strong className="text-gray-900">{opt.key}:</strong> {opt.text}</span>
                                  {isCorrect && (
                                    <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold shrink-0">
                                      ✓ Key
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-start pt-1">
                        <button
                          type="button"
                          onClick={() => handleStartEditQuestion(q)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0f4c81] rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors border border-slate-300"
                          title="Edit Question & Answer Key"
                        >
                          <Edit3 className="w-3 h-3 text-[#0284c7]" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded cursor-pointer transition-colors hover:bg-rose-50"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          </>
          )}

          {editorStep === 4 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-[#001b48] flex items-center gap-2">
                <span className="wizard-step-badge">4</span>
                Review &amp; Publish Battery
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="page-card p-4">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Battery Title</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{testTitle || 'Untitled Battery'}</p>
                </div>
                <div className="page-card p-4">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Structure</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{customSections.length} sections · {questions.length} questions</p>
                </div>
                <div className="page-card p-4">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Pass Threshold</p>
                  <p className="text-sm font-bold text-emerald-700 mt-1">{passingScorePct}% · {durationMinutes} mins</p>
                </div>
              </div>
              <div className="page-card p-4 text-[11px] text-slate-600 space-y-1">
                <p><strong>Target role:</strong> {targetRole}</p>
                <p><strong>Delivery mode:</strong> {deliveryMode === 'sectional' ? 'Separate Sections' : 'Mixed Pool'}</p>
                <p><strong>Quality reviewer:</strong> {approvedBy}</p>
              </div>
            </div>
          )}
        </div>

        <WizardModalFooter
          onClose={() => { setViewMode('list'); setEditorStep(1); }}
          showBack={editorStep > 1}
          onBack={() => setEditorStep(s => s - 1)}
          showNext={editorStep < 4}
          onNext={() => setEditorStep(s => s + 1)}
          nextLabel="Continue"
          actions={
            <>
              <button
                type="button"
                onClick={() => {
                  const previewTest: PsychometricTest = {
                    id: editingTestId || 'preview-temp',
                    title: testTitle || 'Preview Battery',
                    category: testCategory as PsychometricTest['category'],
                    deliveryMode,
                    durationMinutes: Number(durationMinutes) || 25,
                    passingScorePct: Number(passingScorePct) || 70,
                    mappedCategories,
                    sections: customSections.map(s => s.categoryType || s.id),
                    sectionDefinitions: customSections,
                    sectionWeights,
                    questions,
                  };
                  onLaunchTestPlayer(previewTest);
                }}
                className="wizard-btn-secondary"
              >
                <Play className="w-4 h-4" />
                Test Drive
              </button>
              {(testStatus === 'Draft' || testStatus === 'Needs Revision') && editorStep === 4 && (
                <button type="button" onClick={handleInitiateSubmitForApproval} className="wizard-btn-secondary">
                  <Send className="w-4 h-4" />
                  Submit for Approval
                </button>
              )}
              {testStatus === 'Pending Approval' && editorStep === 4 && (
                <button type="button" onClick={handleInitiateApproveBattery} className="wizard-btn-primary">
                  <UserCheck className="w-4 h-4" />
                  Approve & Activate
                </button>
              )}
              {(editorStep === 4 || editorStep === 3) && (
                <button type="button" onClick={handleSaveCurrentTest} className="wizard-btn-primary">
                  <Save className="w-4 h-4" />
                  Save Battery
                </button>
              )}
            </>
          }
        />
      </FormModal>

      {/* ========================================================================= */}
      {/* MODAL: ADD SECTION DIALOG (TEMPLATE DROPDOWN OR CUSTOM TITLE)             */}
      {/* ========================================================================= */}
      {showAddSectionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#0891b2]" />
                <h3 className="font-bold text-sm text-gray-900">
                  Add Assessment Section to Battery
                </h3>
              </div>
              <button
                onClick={() => setShowAddSectionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {sectionModalError && (
                <div className="p-2 bg-rose-50 border border-rose-200 text-rose-800 font-semibold rounded">
                  {sectionModalError}
                </div>
              )}

              {/* Mode Switch: Select from Dropdown vs Custom Title */}
              <div className="space-y-1.5">
                <label className="block text-gray-700 font-bold">Section Type Source *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSectionSelectMode('template')}
                    className={`p-2.5 rounded border text-left flex items-center gap-2 cursor-pointer ${
                      sectionSelectMode === 'template'
                        ? 'bg-blue-50 border-[#0284c7] ring-1 ring-[#0284c7] font-bold text-[#0f4c81]'
                        : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    <Folder className="w-4 h-4 text-[#0284c7]" />
                    <span>Select Standard Section</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSectionSelectMode('custom')}
                    className={`p-2.5 rounded border text-left flex items-center gap-2 cursor-pointer ${
                      sectionSelectMode === 'custom'
                        ? 'bg-blue-50 border-[#0284c7] ring-1 ring-[#0284c7] font-bold text-[#0f4c81]'
                        : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    <Edit3 className="w-4 h-4 text-[#0284c7]" />
                    <span>Custom Section Title...</span>
                  </button>
                </div>
              </div>

              {/* Template Dropdown Selector */}
              {sectionSelectMode === 'template' ? (
                <div className="space-y-2">
                  <label className="block text-gray-700 font-bold">Choose Section from Standard Framework *</label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => {
                      setSelectedTemplateId(e.target.value);
                      const t = STANDARD_SECTION_TEMPLATES.find(item => item.id === e.target.value);
                      if (t) {
                        setCustomSectionTime(t.defaultTime);
                        setCustomSectionWeight(t.defaultWeight);
                      }
                    }}
                    className="w-full bg-white border border-gray-300 rounded p-2 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                  >
                    {STANDARD_SECTION_TEMPLATES.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.icon} {t.name} (Default: {t.defaultWeight}%, {t.defaultTime} mins)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-500 italic">
                    {STANDARD_SECTION_TEMPLATES.find(t => t.id === selectedTemplateId)?.desc}
                  </p>
                </div>
              ) : (
                /* Custom Section Name Input */
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Custom Section Title *</label>
                    <input
                      type="text"
                      value={customSectionTitle}
                      onChange={(e) => setCustomSectionTitle(e.target.value)}
                      placeholder="e.g. PPDA Compliance & Contract Audits"
                      className="w-full bg-white border border-gray-300 rounded p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Section Instructions / Description</label>
                    <textarea
                      rows={2}
                      value={customSectionDesc}
                      onChange={(e) => setCustomSectionDesc(e.target.value)}
                      placeholder="Explain what competency this section evaluates..."
                      className="w-full bg-white border border-gray-300 rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                    />
                  </div>
                </div>
              )}

              {/* Section Parameters */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Section Time Limit (mins)</label>
                  <input
                    type="number"
                    min="2"
                    max="60"
                    value={customSectionTime}
                    onChange={(e) => setCustomSectionTime(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Scoring Weight (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={customSectionWeight}
                    onChange={(e) => setCustomSectionWeight(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(false)}
                  className="px-3.5 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddSection}
                  className="px-4 py-1.5 bg-[#0891b2] hover:bg-[#0e7490] text-white rounded text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Section to Test</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Submitting Psychometric Battery for Approval */}
      <ConfirmationModal
        isOpen={showSubmitApprovalModal}
        title="Confirm Submission for Psychometric Governance Approval"
        subtitle="Submit this test battery structure, questions, and section weighting for Quality & HR review."
        variant="primary"
        confirmText="Confirm & Submit Battery for Approval"
        summaryItems={[
          {
            label: 'Battery Title',
            value: <span className="text-[#0f4c81] font-bold">{testTitle}</span>
          },
          {
            label: 'Category & Delivery',
            value: `${testCategory} · ${deliveryMode}`
          },
          {
            label: 'Test Structure',
            value: `${customSections.length} sections · ${questions.length} questions`
          },
          {
            label: 'Time Limit & Pass Mark',
            value: `${durationMinutes} mins · ${passingScorePct}% minimum score`
          },
          {
            label: 'Quality Reviewer',
            value: <span className="text-indigo-800 font-bold">{approvedBy}</span>
          }
        ]}
        warningMessage="Upon submission, the test battery status will become 'Pending Approval' and be locked for candidate testing until approved."
        onConfirm={handleConfirmSubmitForApproval}
        onClose={() => setShowSubmitApprovalModal(false)}
      />

      {/* Confirmation Modal for Approving & Activating Psychometric Battery */}
      <ConfirmationModal
        isOpen={showApproveBatteryModal}
        title="Confirm Psychometric Test Battery Approval"
        subtitle="Authorize and activate this test battery for candidate online assessments."
        variant="success"
        confirmText="Approve & Activate Battery"
        summaryItems={[
          {
            label: 'Battery Title',
            value: <span className="text-emerald-800 font-bold">{testTitle}</span>
          },
          {
            label: 'Pass Threshold',
            value: `${passingScorePct}% passing grade (${durationMinutes} mins limit)`
          },
          {
            label: 'Questions & Sections',
            value: `${questions.length} verified items across ${customSections.length} sections`
          },
          {
            label: 'Approving Officer',
            value: approvedBy
          }
        ]}
        warningMessage="Activating this battery allows candidate test links to be generated and scored automatically."
        onConfirm={handleConfirmApproveBattery}
        onClose={() => setShowApproveBatteryModal(false)}
      />
    </ViewShell>
  );
};
