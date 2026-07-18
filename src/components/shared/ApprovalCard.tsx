import React from 'react';
import { approveAction } from '../../utils/api';
import { ApprovalItem } from '../../types';

interface Props {
  item: ApprovalItem;
  onApprove?: () => void;
  onReject?: () => void;
}

export const ApprovalCard = React.memo(function ApprovalCard({ item, onApprove, onReject }: Props) {
  const handleApprove = async () => {
    await approveAction(item.id, 'approve', item.targetApprovers);
    if (onApprove) onApprove();
  };

  const handleReject = async () => {
    await approveAction(item.id, 'reject', item.targetApprovers);
    if (onReject) onReject();
  };

  const borderColor = item.priority === 'High' ? 'border-l-[#BC4749]' : item.priority === 'Medium' ? 'border-l-[#B08968]' : 'border-l-[#4361EE]';
  const textColor = item.priority === 'High' ? 'text-[#BC4749]' : item.priority === 'Medium' ? 'text-[#B08968]' : 'text-[#4361EE]';

  return (
    <div className={`p-5 bg-white border border-[#E5E5E0] border-l-4 ${borderColor}`}>
      <div className="flex justify-between mb-3">
        <span className={`text-[10px] font-medium uppercase tracking-widest ${textColor}`}>
          {item.priority} Priority • {item.targetApprovers[0] || 'System'}
        </span>
        <span className="text-[10px] text-[#70706B]">Agent: {item.sourceAgent}</span>
      </div>
      <p className="text-sm mb-4 leading-relaxed">{item.description}</p>
      <div className="flex gap-2">
        <button 
          onClick={handleApprove}
          className="flex-1 bg-[#1A1A1A] text-white text-[11px] font-medium uppercase py-3"
          aria-label={`Approve action: ${item.actionType}`}
        >
          Approve Action
        </button>
        <button 
          onClick={handleReject}
          className="px-6 border border-[#E5E5E0] text-[#1A1A1A] text-[11px] font-medium uppercase hover:bg-[#F9F9F7]"
          aria-label={`Reject action: ${item.actionType}`}
        >
          Reject
        </button>
      </div>
    </div>
  );
});
