import React from 'react';
import { ApprovalItem } from '../../../types';
import { ApprovalCard } from '../../shared/ApprovalCard';

interface Props {
  pendingApprovals: ApprovalItem[];
}

export const PendingApprovalsList = React.memo(function PendingApprovalsList({ pendingApprovals }: Props) {
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-[0.15em] pb-2 border-b border-[#E5E5E0] mb-6">Human-in-the-loop: Pending Approvals</h3>
      {pendingApprovals.length === 0 ? (
        <p className="text-sm text-[#70706B] py-4">No pending approvals.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {pendingApprovals.map(item => (
            <ApprovalCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
});
