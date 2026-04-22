import { useEffect, useRef, useState } from 'react';
import { useSubscription } from '@apollo/client';
import { Zap } from 'lucide-react';
import { COMPONENT_STATUS_CHANGED } from '../graphql/subscriptions';
import { StatusBadge } from './StatusBadge';
import type { BuildStatus } from '../types';

interface FeedEvent {
  id: string;
  name: string;
  status: BuildStatus;
  updatedAt: string;
  receivedAt: Date;
}

export function LiveFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, error } = useSubscription<{
    componentStatusChanged: { id: string; name: string; status: BuildStatus; updatedAt: string };
  }>(COMPONENT_STATUS_CHANGED);

  useEffect(() => {
    if (!data?.componentStatusChanged) return;
    const event: FeedEvent = {
      ...data.componentStatusChanged,
      receivedAt: new Date(),
    };
    setEvents((prev: FeedEvent[]) => [event, ...prev].slice(0, 20));
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [data]);

  return (
    <aside className="w-72 shrink-0 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-orange-400" />
        <h2 className="text-sm font-semibold text-slate-300">Live Updates</h2>
        <span
          className={`ml-auto h-2 w-2 rounded-full ${
            error ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'
          }`}
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 break-all">
          WS error: {error.message || error.networkError?.message || JSON.stringify(error)}
        </p>
      )}

      <div
        ref={containerRef}
        className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-12rem)]"
      >
        {events.length === 0 && (
          <p className="text-xs text-slate-500 italic">
            Waiting for status changes…
          </p>
        )}
        {events.map((event) => (
          <div
            key={`${event.id}-${event.receivedAt.getTime()}`}
            className="rounded-lg border border-slate-700 bg-slate-800/60 p-3 space-y-1.5"
          >
            <p className="text-xs font-medium text-white leading-tight">{event.name}</p>
            <div className="flex items-center justify-between">
              <StatusBadge status={event.status} />
              <span className="text-[10px] text-slate-500">
                {event.receivedAt.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
