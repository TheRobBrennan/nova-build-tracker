import { useMutation } from '@apollo/client';
import { CheckCircle2, Circle } from 'lucide-react';
import type { Component, BuildStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { UPDATE_COMPONENT_STATUS } from '../graphql/mutations';
import { GET_COMPONENTS } from '../graphql/queries';

const TYPE_LABELS: Record<string, string> = {
  HEAT_SHIELD: 'Heat Shield',
  ENGINE_COMPONENT: 'Engine',
  AVIONICS: 'Avionics',
  STRUCTURAL: 'Structural',
  PROPULSION: 'Propulsion',
};

const STATUS_ORDER: BuildStatus[] = [
  'PENDING',
  'IN_PROGRESS',
  'TESTING',
  'ACCEPTED',
  'REJECTED',
];

interface ComponentCardProps {
  component: Component;
}

export function ComponentCard({ component }: ComponentCardProps) {
  const [updateStatus, { loading }] = useMutation(UPDATE_COMPONENT_STATUS, {
    refetchQueries: [{ query: GET_COMPONENTS }],
  });

  const completedStages = component.buildStages.filter((s) => s.completedAt).length;
  const totalStages = component.buildStages.length;
  const progress = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

  const nextStatus = STATUS_ORDER[STATUS_ORDER.indexOf(component.status) + 1];

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-5 flex flex-col gap-4 hover:border-slate-500 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-white leading-tight">{component.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {component.serialNumber} · {component.partNumber}
          </p>
        </div>
        <StatusBadge status={component.status} />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-orange-400 bg-orange-900/30 rounded px-2 py-0.5">
          {TYPE_LABELS[component.type] ?? component.type}
        </span>
        {component.testEvents.length > 0 && (
          <span className="text-xs text-slate-400">
            {component.testEvents.length} test event{component.testEvents.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {totalStages > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Build stages</span>
            <span>{completedStages}/{totalStages}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div
              className="bg-orange-400 h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <ul className="space-y-1">
            {component.buildStages.map((stage) => (
              <li key={stage.id} className="flex items-center gap-2 text-xs">
                {stage.completedAt ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                )}
                <span className={stage.completedAt ? 'text-slate-300' : 'text-slate-500'}>
                  {stage.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {nextStatus && component.status !== 'ACCEPTED' && component.status !== 'REJECTED' && (
        <button
          disabled={loading}
          onClick={() =>
            updateStatus({ variables: { id: component.id, status: nextStatus } })
          }
          className="mt-auto w-full rounded bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Updating…' : `Advance → ${nextStatus.replace('_', ' ')}`}
        </button>
      )}
    </div>
  );
}
