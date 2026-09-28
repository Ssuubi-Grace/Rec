import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  AlertTriangle, 
  X, 
  Send, 
  ShieldCheck, 
  FileText, 
  Building2, 
  User, 
  Calendar,
  MessageSquare
} from 'lucide-react';
import { ApprovalTask } from '../../types';

export type ApprovalActionType = 'Approve' | 'Reject' | 'Return';

interface ApprovalActionModalProps {
  task: ApprovalTask;
  actionType: ApprovalActionType;
  approverName?: string;
  onConfirm: (taskId: string, action: ApprovalActionType, comments: string) => void;
  onClose: () => void;
}

export const ApprovalActionModal: React.FC<ApprovalActionModalProps> = ({
  task,
  actionType,
  approverName = 'Dr. Arthur K. (Managing Director / Approver)',
  onConfirm,
  onClose,
}) => {
  const [comments, setComments] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isMandatory = actionType === 'Reject' || actionType === 'Return';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMandatory && !comments.trim()) {
      setErrorMsg(
        actionType === 'Reject' 
          ? 'Please enter a clear reason for rejecting this item.' 
          : 'Please specify revision feedback instructions so the initiator knows what to modify.'
      );
      return;
    }

    onConfirm(task.id, actionType, comments.trim() || 'Approved with standard executive sign-off.');
  };

  const getHeaderDetails = () => {
    switch (actionType) {
      case 'Approve':
        return {
          title: 'Confirm Workflow Approval',
          subtitle: 'Authorize and advance this item to the active stage',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          btnText: 'Confirm & Approve'
        };
      case 'Return':
        return {
          title: 'Return to Initiator for Revision',
          subtitle: 'Send this item back to the draft/revision stage with feedback',
          icon: <RotateCcw className="w-5 h-5 text-amber-600" />,
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-300',
          btnBg: 'bg-amber-600 hover:bg-amber-700 text-white',
          btnText: 'Confirm & Return for Revision'
        };
      case 'Reject':
        return {
          title: 'Confirm Rejection of Workflow Item',
          subtitle: 'Formally reject and archive this request',
          icon: <XCircle className="w-5 h-5 text-rose-600" />,
          badgeBg: 'bg-rose-50 text-rose-800 border-rose-300',
          btnBg: 'bg-rose-600 hover:bg-rose-700 text-white',
          btnText: 'Confirm & Reject Item'
        };
    }
  };

  const header = getHeaderDetails();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-white shadow-2xs border border-gray-200">
              {header.icon}
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 leading-tight">
                {header.title}
              </h3>
              <p className="text-xs text-gray-500">
                {header.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Target Summary Card */}
          <div className="bg-[#f8fafc] border border-[#cbd5e1] rounded p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  {task.taskType || 'Governance Task'}
                </span>
                <strong className="text-gray-900 text-xs block mt-0.5">
                  {task.title}
                </strong>
              </div>
              {task.referenceNo && (
                <span className="px-2 py-0.5 bg-white border border-gray-300 rounded font-mono text-[10px] text-gray-700 shrink-0">
                  {task.referenceNo}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 text-[11px]">
              {task.department && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{task.department}</span>
                </div>
              )}
              {task.submittedBy && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">By: {task.submittedBy}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Warning Note */}
          <div className={`p-3 rounded border text-xs flex items-start gap-2.5 ${header.badgeBg}`}>
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              {actionType === 'Approve' && (
                <p>
                  <strong>Approval Confirmation:</strong> This action will mark the request as approved, notifying the initiator and moving the item to the operational stage.
                </p>
              )}
              {actionType === 'Return' && (
                <p>
                  <strong>Return for Revision:</strong> This request will be sent back to the initiator's draft queue. They will be notified to make the required adjustments.
                </p>
              )}
              {actionType === 'Reject' && (
                <p>
                  <strong>Rejection Notice:</strong> This workflow request will be marked as rejected and archived. Initiators will receive the formal rejection rationale below.
                </p>
              )}
            </div>
          </div>

          {/* Comments & Remarks Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-800 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
                <span>
                  {actionType === 'Approve' 
                    ? 'Executive Approval Comments / Remarks (Optional)' 
                    : actionType === 'Return' 
                    ? 'Revision Instructions for Initiator (Required)' 
                    : 'Formal Rejection Reason (Required)'}
                </span>
                {isMandatory && <span className="text-rose-500 font-bold">*</span>}
              </label>
              <span className="text-[10px] text-gray-500">
                Logged in audit trail
              </span>
            </div>

            <textarea
              rows={4}
              value={comments}
              onChange={(e) => {
                setComments(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder={
                actionType === 'Approve'
                  ? 'e.g. Approved after review of budget and statutory requirements...'
                  : actionType === 'Return'
                  ? 'e.g. Please adjust the salary scale to Grade 5 and attach updated JD...'
                  : 'e.g. Budget unavailable for this position during this fiscal quarter...'
              }
              className={`w-full p-2.5 rounded border text-xs focus:outline-none focus:ring-1 ${
                errorMsg 
                  ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/40' 
                  : 'border-[#cbd5e1] focus:ring-[#0284c7] bg-white'
              }`}
            />

            {errorMsg && (
              <span className="text-[11px] text-rose-600 font-semibold block">
                {errorMsg}
              </span>
            )}
          </div>

          {/* Approver Identity */}
          <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Signed by: <strong>{approverName}</strong></span>
            </span>
            <span>Date: <strong>20-Aug-2026</strong></span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-1.5 font-bold rounded text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer ${header.btnBg}`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{header.btnText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
