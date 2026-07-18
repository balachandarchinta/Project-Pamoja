export async function approveAction(id: string, action: 'approve' | 'reject', targetApprovers: string[]) {
  // For demo purposes, automatically simulate all required roles approving
  for (const role of targetApprovers) {
    await fetch(`/api/approvals/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, role })
    });
  }
}
