import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Loader2 } from 'lucide-react';
import { GET_COMPONENTS } from '../graphql/queries';
import { ComponentCard } from './ComponentCard';
import type { Component, BuildStatus } from '../types';

const STATUS_FILTERS: { label: string; value: BuildStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'PENDING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Testing', value: 'TESTING' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export function ComponentList() {
  const [statusFilter, setStatusFilter] = useState<BuildStatus | undefined>(undefined);

  const { data, loading, error } = useQuery<{ components: Component[] }>(GET_COMPONENTS, {
    variables: { status: statusFilter },
    fetchPolicy: 'cache-and-network',
  });

  return (
    <div className="flex flex-col gap-5 flex-1 min-w-0">
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-orange-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && !data && (
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading components…</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/20 p-4">
          <p className="text-sm text-red-400">Failed to load components: {error.message}</p>
        </div>
      )}

      {data && data.components.length === 0 && (
        <p className="text-sm text-slate-500">No components found.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data?.components.map((component) => (
          <ComponentCard key={component.id} component={component} />
        ))}
      </div>
    </div>
  );
}
