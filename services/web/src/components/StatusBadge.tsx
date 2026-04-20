import type { BuildStatus } from '../types';

const STATUS_STYLES: Record<BuildStatus, string> = {
  PENDING: 'bg-slate-700 text-slate-300',
  IN_PROGRESS: 'bg-blue-900 text-blue-300',
  TESTING: 'bg-amber-900 text-amber-300',
  ACCEPTED: 'bg-emerald-900 text-emerald-300',
  REJECTED: 'bg-red-900 text-red-300',
};

const STATUS_LABELS: Record<BuildStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  TESTING: 'Testing',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
};

interface StatusBadgeProps {
  status: BuildStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
