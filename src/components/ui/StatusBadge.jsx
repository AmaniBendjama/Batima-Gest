export default function StatusBadge({ status }) {
  const colors = {
    open: 'bg-info/10 text-info',
    in_progress: 'bg-info/10 text-info',
    resolved: 'bg-success/10 text-success',
    paid: 'bg-success/10 text-success',
    approved: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    cancel: 'bg-danger/10 text-danger',
    high: 'bg-danger/10 text-danger',
    medium: 'bg-warning/10 text-warning',
    low: 'bg-info/10 text-info',
    resident: 'bg-primary/10 text-primary',
    admin: 'bg-secondary/10 text-secondary'
  }
  const displayStatus = status?.replace('_', ' ') || status
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {displayStatus}
    </span>
  )
}
