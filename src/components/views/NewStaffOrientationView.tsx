import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  UserPlus, 
  CheckCircle2, 
  Laptop, 
  Building, 
  ShieldCheck, 
  DollarSign, 
  FileCheck,
  ArrowRight,
  Users,
  Briefcase,
  Calendar,
  AlertCircle,
  Plus,
  Clock,
  Filter,
  Search,
  RotateCcw,
  Eye,
  FileText,
  BadgeCheck,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Save,
  Send,
  Check
} from 'lucide-react';
import { Candidate, OnboardingTaskItem } from '../../types';
import { ActiveView } from '../layout/Navbar';
import { ConfirmationModal } from '../modals/ConfirmationModal';

interface NewStaffOrientationViewProps {
  candidates: Candidate[];
  onboardingTasks: OnboardingTaskItem[];
  onToggleTask: (taskId: string) => void;
  onActivateStaffProfile: (candidate: Candidate) => void;
  onNavigate: (view: ActiveView, param?: string) => void;
}

const DEFAULT_ONBOARDING_CHECKLIST = [
  {
    code: 'DOC-1',
    taskName: 'National Identification & Academic Certificates Physical Verification',
    category: 'Documentation',
    assignedRole: 'Sarah Namubiru (HR Officer)',
    icon: FileCheck
  },
  {
    code: 'DOC-2',
    taskName: 'Signed Employment Contract & Non-Disclosure Agreement (NDA)',
    category: 'Documentation',
    assignedRole: 'Sarah Namubiru (HR Officer)',
    icon: FileCheck
  },
  {
    code: 'PAY-1',
    taskName: 'Bank Account & NSSF / TIN Number Submission for Payroll Setup',
    category: 'Finance & Payroll',
    assignedRole: 'Ronald Kafeero (Payroll Manager)',
    icon: DollarSign
  },
  {
    code: 'IT-1',
    taskName: 'Corporate Email & ERP System Role Provisioning',
    category: 'IT & Workspace',
    assignedRole: 'I.T Helpdesk (Paul Okello)',
    icon: Laptop
  },
  {
    code: 'IT-2',
    taskName: 'Laptop Asset Issuance & Security Key Installation',
    category: 'IT & Workspace',
    assignedRole: 'I.T Helpdesk (Paul Okello)',
    icon: Laptop
  },
  {
    code: 'HR-1',
    taskName: 'Company Culture, Code of Conduct & HR Policy Briefing',
    category: 'HR Induction',
    assignedRole: 'Sarah Namubiru (HR Lead)',
    icon: ShieldCheck
  },
  {
    code: 'DEPT-1',
    taskName: 'Departmental Head Introduction & 90-Day KPI Goal Setting',
    category: 'Departmental Orientation',
    assignedRole: 'Department Head / Supervisor',
    icon: Building
  }
];

export const NewStaffOrientationView: React.FC<NewStaffOrientationViewProps> = ({
  candidates,
  onboardingTasks,
  onToggleTask,
  onActivateStaffProfile,
  onNavigate,
}) => {
  // View mode: 'list' (Table roster) vs 'detail' (Full roadmap view)
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Toast / Feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const [localCustomTasks, setLocalCustomTasks] = useState<OnboardingTaskItem[]>([]);
  const [newCustomTaskTitle, setNewCustomTaskTitle] = useState('');
  const [newCustomTaskOfficer, setNewCustomTaskOfficer] = useState('Sarah Namubiru (HR Officer)');
  const [newCustomTaskCategory, setNewCustomTaskCategory] = useState<string>('Departmental Orientation');
  const [newCustomTaskMandatory, setNewCustomTaskMandatory] = useState(true);
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Available Responsible Officers for selection
  const RESPONSIBLE_OFFICERS = [
    'Sarah Namubiru (HR Officer)',
    'Ronald Kafeero (Payroll & Finance Lead)',
    'Paul Okello (IT Systems & Workspace Lead)',
    'David Byamukama (HOD - Information Technology)',
    'Dr. Arthur K. (Managing Director / Appointing Authority)',
    'Agnes Nabirye (Administration & Logistics)',
    'Candidate Self-Sign Off (Candidate)',
    'Department Mentor / Supervisor'
  ];

  const TASK_CATEGORIES = [
    'Documentation',
    'Finance & Payroll',
    'IT & Workspace',
    'HR Induction',
    'Departmental Orientation',
    'Logistics & Assets',
    'Compliance & Legal'
  ];

  // Candidates in onboarding / offer pipeline
  const orientationPool = useMemo(() => {
    return candidates.filter(c => 
      ['Orientation', 'Offer Accepted', 'Hired', 'Selected', 'Offer Issued'].includes(c.status)
    );
  }, [candidates]);

  // Unique roles and departments for filter dropdowns
  const availableRoles = useMemo(() => {
    const roles = Array.from(new Set(candidates.map(c => c.position).filter(Boolean)));
    return roles.sort();
  }, [candidates]);

  const availableDepts = useMemo(() => {
    const depts = Array.from(new Set(candidates.map(c => c.department).filter(Boolean)));
    return depts.sort();
  }, [candidates]);

  // Filtered candidate list for the top table
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      // Status filter
      if (selectedStatusFilter !== 'all') {
        if (selectedStatusFilter === 'Orientation' && !['Orientation', 'Offer Accepted'].includes(c.status)) return false;
        if (selectedStatusFilter === 'Offer Accepted' && c.status !== 'Offer Accepted') return false;
        if (selectedStatusFilter === 'Offer Issued' && c.status !== 'Offer Issued') return false;
        if (selectedStatusFilter === 'Hired' && c.status !== 'Hired') return false;
      } else {
        // By default show all candidates in the orientation & offer pipeline
        if (!['Orientation', 'Offer Accepted', 'Hired', 'Selected', 'Offer Issued'].includes(c.status)) return false;
      }

      // Role filter
      if (selectedRoleFilter !== 'all' && c.position !== selectedRoleFilter) {
        return false;
      }

      // Dept filter
      if (selectedDeptFilter !== 'all' && c.department !== selectedDeptFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches = 
          c.name.toLowerCase().includes(q) ||
          c.position.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.department && c.department.toLowerCase().includes(q)) ||
          (c.nationalId && c.nationalId.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [candidates, selectedStatusFilter, selectedRoleFilter, selectedDeptFilter, searchTerm]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredCandidates.length);
  const paginatedCandidates = useMemo(() => {
    return filteredCandidates.slice(startIndex, endIndex);
  }, [filteredCandidates, startIndex, endIndex]);

  // Selected candidate state for detailed view
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(() => {
    const preferred = orientationPool.find(c => c.status === 'Offer Accepted' || c.status === 'Orientation');
    return preferred ? preferred.id : (orientationPool[0]?.id || candidates[0]?.id || 'cand-2');
  });

  const activeCandidate = candidates.find(c => c.id === selectedCandidateId) || filteredCandidates[0] || candidates[0];

  // Helper to compute onboarding progress for any candidate
  const getCandidateProgress = (candidateId: string, status: string) => {
    const cTasks = onboardingTasks.filter(t => t.candidateId === candidateId);
    const cDone = cTasks.filter(t => t.completed).length;
    if (cTasks.length > 0) {
      const pct = Math.round((cDone / cTasks.length) * 100);
      return { total: cTasks.length, done: cDone, pct };
    }
    // Synthetic fallback default
    if (status === 'Hired') return { total: 7, done: 7, pct: 100 };
    if (status === 'Offer Accepted' || status === 'Orientation') return { total: 7, done: 5, pct: 71 };
    if (status === 'Offer Issued') return { total: 7, done: 2, pct: 28 };
    return { total: 7, done: 1, pct: 14 };
  };

  // Resolve active candidate tasks: combine props tasks + local custom tasks
  const candidatePropsTasks = onboardingTasks.filter(t => t.candidateId === activeCandidate?.id);
  
  const syntheticTasks: OnboardingTaskItem[] = DEFAULT_ONBOARDING_CHECKLIST.map((step, idx) => ({
    id: `synth-${activeCandidate?.id || 'gen'}-${idx + 1}`,
    candidateId: activeCandidate?.id,
    taskName: step.taskName,
    title: step.taskName,
    category: step.category,
    isMandatory: true,
    completed: activeCandidate?.status === 'Hired' ? true : (activeCandidate?.status === 'Offer Accepted' ? idx < 5 : idx < 2),
    status: (activeCandidate?.status === 'Hired' || (activeCandidate?.status === 'Offer Accepted' && idx < 5)) ? 'Completed' : 'Pending',
    completedDate: (activeCandidate?.status === 'Hired' || (activeCandidate?.status === 'Offer Accepted' && idx < 5)) ? '16-Aug-2026' : undefined,
    assignedRole: step.assignedRole,
    assignedOfficer: step.assignedRole
  }));

  const activeTasks: OnboardingTaskItem[] = candidatePropsTasks.length > 0 
    ? [...candidatePropsTasks, ...localCustomTasks.filter(t => t.candidateId === activeCandidate?.id)]
    : [...syntheticTasks, ...localCustomTasks.filter(t => t.candidateId === activeCandidate?.id)];

  const completedCount = activeTasks.filter(t => t.completed).length;
  const progressPct = activeTasks.length > 0 
    ? Math.round((completedCount / activeTasks.length) * 100) 
    : 0;

  const handleTaskClick = (task: OnboardingTaskItem) => {
    if (candidatePropsTasks.some(t => t.id === task.id)) {
      onToggleTask(task.id);
    } else {
      setLocalCustomTasks(prev => {
        const existing = prev.find(t => t.id === task.id);
        if (existing) {
          return prev.map(t => t.id === task.id ? { ...t, completed: !t.completed, completedDate: !t.completed ? '16-Aug-2026' : undefined } : t);
        } else {
          return [...prev, { ...task, completed: !task.completed, completedDate: !task.completed ? '16-Aug-2026' : undefined }];
        }
      });
    }
  };

  const handleCompleteAllTasks = () => {
    activeTasks.forEach(task => {
      if (!task.completed) {
        handleTaskClick(task);
      }
    });
    showToast('All induction checklist steps marked as completed.');
  };

  const handleAddCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomTaskTitle.trim() || !activeCandidate) return;
    const newTask: OnboardingTaskItem = {
      id: `cust-${Date.now()}`,
      candidateId: activeCandidate.id,
      taskName: newCustomTaskTitle.trim(),
      title: newCustomTaskTitle.trim(),
      category: newCustomTaskCategory,
      isMandatory: newCustomTaskMandatory,
      completed: false,
      status: 'Pending',
      assignedRole: newCustomTaskOfficer,
      assignedOfficer: newCustomTaskOfficer
    };
    setLocalCustomTasks(prev => [...prev, newTask]);
    setNewCustomTaskTitle('');
    setShowAddCustom(false);
    showToast('New induction step added successfully.');
  };

  const [showConfirmActivateModal, setShowConfirmActivateModal] = useState(false);

  const handleInitiateActivate = () => {
    if (!activeCandidate) return;
    setShowConfirmActivateModal(true);
  };

  const handleConfirmActivate = () => {
    setShowConfirmActivateModal(false);
    if (!activeCandidate) return;
    onActivateStaffProfile(activeCandidate);
    showToast(`${activeCandidate.name} successfully activated to the staff directory.`);
    onNavigate('user-profiles');
  };

  const handleSaveDraft = () => {
    showToast('Induction checklist progress saved as draft.');
  };

  const handleSubmitSignOffs = () => {
    showToast('Departmental induction sign-offs submitted successfully.');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedRoleFilter('all');
    setSelectedDeptFilter('all');
    setSelectedStatusFilter('all');
    setCurrentPage(1);
  };

  const handleOpenCandidateDetail = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setViewMode('detail');
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto text-xs pb-12">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-[#0f4c81] text-white px-4 py-2.5 rounded shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-2 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-300 hover:text-white text-xs cursor-pointer ml-3 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#cbd5e1] p-4 rounded-sm shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded">
            <CheckCircle2 className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#1e293b] tracking-tight">
              New Staff Orientation & Profile Activation
            </h2>
            <p className="text-gray-500 text-[11px]">
              Manage departmental sign-offs, IT workspace assets, compliance onboarding, and activate staff ERP user accounts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'detail' && (
            <button
              onClick={() => setViewMode('list')}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0f4c81] border border-slate-300 rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Inductee Roster</span>
            </button>
          )}
          <button
            onClick={() => onNavigate('offer-management')}
            className="px-3 py-1.5 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#0f4c81] rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5 text-[#0f4c81]" />
            <span>Offer Management</span>
          </button>
          <button
            onClick={() => onNavigate('user-profiles')}
            className="px-3.5 py-1.5 bg-[#0f4c81] hover:bg-[#0c3c66] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <span>Active Staff Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: STAFF INDUCTEE ROSTER TABLE WITH PAGINATION (LIST VIEW)        */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="bg-white border border-[#cbd5e1] rounded-sm p-4 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e2e8f0] pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0f4c81]" />
              <h3 className="font-bold text-xs text-[#1e293b] uppercase tracking-wider">
                Staff Inductee Roster ({filteredCandidates.length} Selected)
              </h3>
            </div>
            <span className="text-[11px] text-gray-500">
              Click any record or "View Roadmap" to open the detailed onboarding roadmap & activation workflow
            </span>
          </div>

          {/* Filters Bar */}
          <div className="bg-[#f8fafc] border border-[#cbd5e1] rounded p-3 space-y-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {/* Search Input */}
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Search Inductee / NIN / Email
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Filter by name, position, email, NIN..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#0f4c81] focus:outline-none"
                  />
                </div>
              </div>

              {/* Filter by Role */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Filter by Role / Position
                </label>
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => {
                    setSelectedRoleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-[#0f4c81] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Roles ({availableRoles.length})</option>
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* Filter by Department */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Filter by Department
                </label>
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => {
                    setSelectedDeptFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-[#0f4c81] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Departments ({availableDepts.length})</option>
                  {availableDepts.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Filter by Induction / Offer Status */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Offer / Induction Status
                </label>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => {
                    setSelectedStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-[#0f4c81] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Pipeline Statuses</option>
                  <option value="Offer Accepted">✓ Offer Accepted & Signed</option>
                  <option value="Offer Issued">⏳ Offer Issued (Pending Signature)</option>
                  <option value="Orientation">In Departmental Orientation</option>
                  <option value="Hired">✓ Fully Activated / Hired</option>
                </select>
              </div>
            </div>

            {(searchTerm || selectedRoleFilter !== 'all' || selectedDeptFilter !== 'all' || selectedStatusFilter !== 'all') && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-[11px] text-gray-600">
                  Found <strong>{filteredCandidates.length}</strong> matching candidate(s)
                </span>
                <button
                  onClick={handleClearFilters}
                  className="text-[11px] text-[#0f4c81] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              </div>
            )}
          </div>

          {/* Staff Table */}
          <div className="overflow-x-auto border border-[#cbd5e1] rounded">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[#334155] font-bold">
                  <th className="py-2.5 px-3 w-12 text-center">No.</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Staff Name & NIN</th>
                  <th className="py-2.5 px-3 min-w-[170px]">Position / Role</th>
                  <th className="py-2.5 px-3 min-w-[140px]">Department</th>
                  <th className="py-2.5 px-3 min-w-[110px]">Start Date</th>
                  <th className="py-2.5 px-3 min-w-[160px] text-center">Offer Status</th>
                  <th className="py-2.5 px-3 min-w-[170px]">Orientation Sign-Off</th>
                  <th className="py-2.5 px-3 text-center min-w-[130px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {paginatedCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      <Users className="w-8 h-8 mx-auto text-gray-300 mb-1" />
                      <p className="font-bold text-gray-700">No staff found matching current criteria</p>
                      <p className="text-[11px]">Adjust your role, department, or search filters above.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedCandidates.map((c, idx) => {
                    const actualIdx = startIndex + idx;
                    const progress = getCandidateProgress(c.id, c.status);

                    return (
                      <tr
                        key={c.id}
                        onClick={() => handleOpenCandidateDetail(c.id)}
                        className={`cursor-pointer transition-colors ${
                          idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-[#fcfdfe] hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center text-gray-500 font-mono">
                          {actualIdx + 1}
                        </td>
                        
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-slate-200 text-[#0f4c81]">
                              {c.name.charAt(0)}
                            </div>
                            <div>
                              <strong className="block text-xs text-gray-900 hover:text-[#0f4c81]">
                                {c.name}
                              </strong>
                              <span className="text-[10.5px] text-gray-500 font-mono block">
                                NIN: {c.nationalId || 'CF980231008KKL'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-gray-800 font-medium">
                          {c.position}
                        </td>

                        <td className="py-2.5 px-3 text-gray-600">
                          {c.department || 'Technology'}
                        </td>

                        <td className="py-2.5 px-3 text-gray-700 font-medium">
                          {c.offerDetails?.startDate || '01-Sep-2026'}
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          {c.status === 'Hired' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <BadgeCheck className="w-3 h-3 text-emerald-600" />
                              Fully Hired / Active
                            </span>
                          ) : c.status === 'Offer Accepted' || c.status === 'Orientation' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                              <CheckCircle2 className="w-3 h-3 text-blue-600" />
                              Offer Accepted & Signed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Offer Issued (Pending E-Sign)
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[10.5px]">
                              <span className="font-semibold text-gray-700">
                                {progress.done}/{progress.total} Signed Off
                              </span>
                              <span className={`font-mono font-bold ${progress.pct === 100 ? 'text-emerald-700' : 'text-[#0f4c81]'}`}>
                                {progress.pct}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${progress.pct === 100 ? 'bg-emerald-600' : 'bg-[#0f4c81]'}`}
                                style={{ width: `${progress.pct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenCandidateDetail(c.id);
                            }}
                            className="px-2.5 py-1 rounded text-[11px] font-bold bg-white border border-[#0f4c81] text-[#0f4c81] hover:bg-[#0f4c81] hover:text-white transition-colors cursor-pointer shadow-2xs"
                          >
                            View Roadmap →
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredCandidates.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-200 text-xs">
              <div className="flex items-center gap-2 text-gray-600">
                <span>
                  Showing <strong>{startIndex + 1}</strong> to <strong>{endIndex}</strong> of <strong>{filteredCandidates.length}</strong> inductees
                </span>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1">
                  <span>Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-1.5 py-0.5 text-xs bg-white cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                  <span>per page</span>
                </div>
              </div>

              <div className="flex items-center gap-1 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={safeCurrentPage <= 1}
                  className={`px-2.5 py-1 rounded border text-xs font-semibold flex items-center gap-1 transition-colors ${
                    safeCurrentPage <= 1
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded text-xs font-bold transition-colors cursor-pointer ${
                        page === safeCurrentPage
                          ? 'bg-[#0f4c81] text-white shadow-2xs'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={safeCurrentPage >= totalPages}
                  className={`px-2.5 py-1 rounded border text-xs font-semibold flex items-center gap-1 transition-colors ${
                    safeCurrentPage >= totalPages
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: ONE-CANDIDATE VIEW & DETAILED INDUCTION ROADMAP (DETAIL VIEW)  */}
      {/* ========================================================================= */}
      {viewMode === 'detail' && activeCandidate && (
        <div className="bg-white border border-[#cbd5e1] rounded-sm p-5 space-y-5 shadow-xs animate-in fade-in duration-200">
          
          {/* Top Breadcrumb & Back Navigation */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#0f4c81] rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors border border-slate-300"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Roster List</span>
              </button>
              <span className="text-gray-300">/</span>
              <span className="text-gray-500 font-medium">Candidate Induction Roadmap</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-3 py-1 bg-white border border-gray-300 hover:bg-slate-50 text-gray-700 rounded text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-gray-500" />
                <span>Save Draft</span>
              </button>
            </div>
          </div>

          {/* Candidate Profile Header Card */}
          <div className="bg-gradient-to-r from-slate-50 via-blue-50/20 to-emerald-50/30 border border-slate-200 p-4 rounded text-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Active Inductee Roadmap:
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    activeCandidate.status === 'Hired'
                      ? 'bg-emerald-100 text-emerald-800'
                      : activeCandidate.status === 'Offer Accepted'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {activeCandidate.status}
                  </span>
                </div>
                <h3 className="text-base font-black text-[#0f4c81] mt-0.5">
                  {activeCandidate.name}
                </h3>
                <p className="text-gray-600 text-xs">
                  {activeCandidate.position} • {activeCandidate.department || 'Information Technology'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCompleteAllTasks}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Quick Complete All Steps</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCustom(!showAddCustom)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-gray-700 border border-gray-300 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Induction Step</span>
                </button>
              </div>
            </div>

            {/* Profile Details Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div className="bg-white/90 p-2.5 rounded border border-gray-200">
                <span className="text-gray-500 block">National ID / NIN:</span>
                <strong className="font-mono text-gray-900">{activeCandidate.nationalId || 'CM980231008KKL'}</strong>
              </div>
              <div className="bg-white/90 p-2.5 rounded border border-gray-200">
                <span className="text-gray-500 block">Email Address:</span>
                <strong className="text-gray-900 truncate block">{activeCandidate.email}</strong>
              </div>
              <div className="bg-white/90 p-2.5 rounded border border-gray-200">
                <span className="text-gray-500 block">Mobile Phone:</span>
                <strong className="text-gray-900">+{activeCandidate.countryCode} {activeCandidate.phone}</strong>
              </div>
              <div className="bg-white/90 p-2.5 rounded border border-gray-200">
                <span className="text-gray-500 block">Reporting Date:</span>
                <strong className="text-emerald-800">{activeCandidate.offerDetails?.startDate || '01-Oct-2026'}</strong>
              </div>
            </div>

            {/* Offer Acceptance Status Clarification Banner */}
            {activeCandidate.status === 'Offer Issued' ? (
              <div className="p-3 bg-amber-50/90 border border-amber-300 rounded text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="block font-bold">
                    Offer Letter Dispatched — Awaiting Candidate Acceptance & E-Signature
                  </strong>
                  <p className="text-[11px] text-amber-800">
                    The official offer letter has been issued to {activeCandidate.name}. You can preview or pre-configure their departmental induction checklist below. Formal laptop handover and ERP profile activation become effective upon the candidate's signed acceptance.
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => onNavigate('offer-management')}
                      className="text-[11px] text-[#0f4c81] hover:underline font-bold"
                    >
                      View & Manage Offer Letter in Offer Management →
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-50/80 border border-emerald-300 rounded text-emerald-900 text-xs flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Offer Letter signed and accepted by {activeCandidate.name}. All onboarding and provisioning workflows are active.</span>
                </span>
                <span className="font-mono font-bold text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  {progressPct}% Completed
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar Card */}
          <div className="bg-[#f8fafc] border border-gray-200 p-4 rounded space-y-2">
            <div className="flex justify-between items-center font-bold text-gray-700">
              <span className="text-xs">Orientation Sign-Off Progress Checklist</span>
              <span className="text-emerald-700 font-mono text-sm font-black">{progressPct}%</span>
            </div>
            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-300 shadow-xs"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="text-[11px] text-gray-500 flex justify-between pt-0.5">
              <span><strong>{completedCount}</strong> of <strong>{activeTasks.length}</strong> checklist steps completed</span>
              <span className={`font-bold ${progressPct === 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {progressPct === 100 ? '✓ Ready for Full System Activation' : 'In Progress'}
              </span>
            </div>
          </div>

          {/* Custom Task Input Form */}
          {showAddCustom && (
            <form onSubmit={handleAddCustomTask} className="p-4 bg-amber-50/80 border border-amber-300 rounded-sm space-y-3 animate-in fade-in shadow-xs">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-amber-700" />
                  <span>Add New Departmental Onboarding Action Step</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddCustom(false)}
                  className="text-gray-400 hover:text-gray-700 text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700">
                  Task / Action Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCustomTaskTitle}
                  onChange={(e) => setNewCustomTaskTitle(e.target.value)}
                  placeholder="e.g. Issue corporate fuel card, SIM card & security access badge..."
                  className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#0f4c81] focus:outline-none"
                  autoFocus
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">
                    Responsible Officer / Authority <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newCustomTaskOfficer}
                    onChange={(e) => setNewCustomTaskOfficer(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0f4c81] focus:outline-none font-medium"
                  >
                    {RESPONSIBLE_OFFICERS.map((officer) => (
                      <option key={officer} value={officer}>
                        {officer}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">
                    Department / Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newCustomTaskCategory}
                    onChange={(e) => setNewCustomTaskCategory(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0f4c81] focus:outline-none font-medium"
                  >
                    {TASK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-amber-200/60">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newCustomTaskMandatory}
                    onChange={(e) => setNewCustomTaskMandatory(e.target.checked)}
                    className="rounded text-[#0f4c81]"
                  />
                  <span className="text-[11px] text-gray-700 font-medium">
                    Mandatory prerequisite before profile activation
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCustom(false)}
                    className="px-3 py-1 bg-white border border-gray-300 hover:bg-slate-50 text-gray-700 rounded text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newCustomTaskTitle.trim()}
                    className={`px-4 py-1 rounded text-xs font-bold shadow-xs flex items-center gap-1.5 ${
                      newCustomTaskTitle.trim()
                        ? 'bg-[#0f4c81] hover:bg-[#0c3c66] text-white cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Onboarding Step</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Departmental Sign-Off Checklist Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h3 className="font-bold text-xs text-[#1e293b] uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span>Enterprise Departmental Sign-Off Checklist ({activeTasks.length} Steps)</span>
              </h3>
              <span className="text-[11px] text-gray-500">
                Click any row to sign-off and toggle step completion
              </span>
            </div>

            <div className="space-y-2.5">
              {activeTasks.map((task) => {
                const isDone = !!task.completed;
                return (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-all duration-150 select-none ${
                      isDone 
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs hover:bg-emerald-50' 
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-slate-50 shadow-xs'
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-emerald-600 focus:outline-none shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskClick(task);
                      }}
                    >
                      {isDone ? (
                        <div className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                          <CheckSquare className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded border-2 border-gray-300 bg-white hover:border-[#0f4c81] transition-colors flex items-center justify-center" />
                      )}
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-bold text-xs leading-snug ${
                          isDone ? 'line-through text-gray-500' : 'text-[#1e293b]'
                        }`}>
                          {task.taskName || task.title}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 border ${
                          task.category === 'Documentation' 
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : task.category === 'Finance & Payroll'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : task.category === 'IT & Workspace'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}>
                          {task.category}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-500 gap-1">
                        <span>
                          Responsible Officer: <strong className="text-gray-700">{task.assignedRole || task.assignedOfficer}</strong>
                        </span>
                        {isDone && (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1 font-mono text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Signed-off {task.completedDate || '16-Aug-2026'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer Bar with Cancel, Draft, Submit, Back to List, and Activate options */}
          <div className="pt-4 border-t border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-4 rounded border border-gray-200">
            <div className="space-y-0.5">
              <span className="font-bold text-xs text-gray-800 block">
                Staff Activation Readiness:
              </span>
              <span className={`text-xs font-semibold flex items-center gap-1 ${
                progressPct === 100 ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {progressPct === 100 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    All departmental sign-offs completed. Ready for ERP activation!
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    {activeTasks.length - completedCount} sign-off item(s) remaining before system activation.
                  </>
                )}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-3.5 py-2 bg-white border border-gray-300 hover:bg-slate-100 text-gray-700 rounded text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel / Back to List</span>
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-3.5 py-2 bg-white border border-[#0f4c81] text-[#0f4c81] hover:bg-blue-50 rounded text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitSignOffs}
                className="px-3.5 py-2 bg-[#0f4c81] hover:bg-[#0c3c66] text-white rounded text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Sign-Offs</span>
              </button>

              <button
                type="button"
                onClick={handleInitiateActivate}
                disabled={progressPct < 100}
                className={`px-4 py-2 rounded text-xs font-black flex items-center gap-2 shadow-xs transition-all ${
                  progressPct === 100
                    ? 'bg-[#16a34a] hover:bg-[#15803d] text-white cursor-pointer hover:shadow-md'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Activate Employee</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Confirmation Modal for Staff Activation */}
      {activeCandidate && (
        <ConfirmationModal
          isOpen={showConfirmActivateModal}
          title="Confirm Staff Profile Activation"
          subtitle="Formally complete induction and transition this employee to the Active Staff Directory."
          variant="success"
          confirmText="Confirm & Activate Employee"
          summaryItems={[
            {
              label: 'Employee Name',
              value: <span className="text-[#0f4c81] font-bold">{activeCandidate.name}</span>
            },
            {
              label: 'Position Title',
              value: activeCandidate.position
            },
            {
              label: 'Department',
              value: activeCandidate.department || 'Information Technology'
            },
            {
              label: 'Onboarding Sign-offs',
              value: <span className="text-emerald-700 font-bold">100% Completed ({activeTasks.length} checks)</span>
            }
          ]}
          warningMessage="This action provisions permanent employee credentials, integrates the profile into active payroll, and concludes the induction cycle."
          onConfirm={handleConfirmActivate}
          onClose={() => setShowConfirmActivateModal(false)}
        />
      )}
    </div>
  );
};

