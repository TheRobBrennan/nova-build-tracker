import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { X } from 'lucide-react';
import { CREATE_COMPONENT } from '../graphql/mutations';
import { GET_COMPONENTS } from '../graphql/queries';
import type { ComponentType } from '../types';

const COMPONENT_TYPES: { value: ComponentType; label: string }[] = [
  { value: 'HEAT_SHIELD', label: 'Heat Shield' },
  { value: 'ENGINE_COMPONENT', label: 'Engine Component' },
  { value: 'AVIONICS', label: 'Avionics' },
  { value: 'STRUCTURAL', label: 'Structural' },
  { value: 'PROPULSION', label: 'Propulsion' },
];

interface CreateComponentFormProps {
  onClose: () => void;
}

export function CreateComponentForm({ onClose }: CreateComponentFormProps) {
  const [form, setForm] = useState({
    name: '',
    serialNumber: '',
    partNumber: '',
    type: 'STRUCTURAL' as ComponentType,
    notes: '',
  });

  const [createComponent, { loading, error }] = useMutation(CREATE_COMPONENT, {
    refetchQueries: [{ query: GET_COMPONENTS }],
    onCompleted: onClose,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createComponent({
      variables: {
        input: {
          name: form.name,
          serialNumber: form.serialNumber,
          partNumber: form.partNumber,
          type: form.type,
          notes: form.notes || undefined,
        },
      },
    });
  };

  const inputClass =
    'w-full rounded bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-orange-400 focus:outline-none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">New Component</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Component Name</label>
            <input
              required
              className={inputClass}
              placeholder="TPS Panel — Windward Segment 2"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Serial Number</label>
              <input
                required
                className={inputClass}
                placeholder="TPS-W-002"
                value={form.serialNumber}
                onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Part Number</label>
              <input
                required
                className={inputClass}
                placeholder="NV-TPS-002"
                value={form.partNumber}
                onChange={(e) => setForm((f) => ({ ...f, partNumber: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Component Type</label>
            <select
              className={inputClass}
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ComponentType }))}
            >
              {COMPONENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Notes (optional)</label>
            <textarea
              rows={2}
              className={inputClass}
              placeholder="Additional context..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

          {error && (
            <p className="text-xs text-red-400">Error: {error.message}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-400 disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Create Component'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
