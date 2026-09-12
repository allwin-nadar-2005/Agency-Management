import React from 'react';
import type { ActivityLog } from '../types';
import { Activity, Clock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface ActivityFeedProps {
  activities: ActivityLog[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  function getActionIcon(action: string) {
    switch (action) {
      case 'TASK_COMPLETED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'TASK_MOVED_TO_REVIEW':
        return <Clock className="w-3.5 h-3.5 text-amber-400" />;
      case 'PROJECT_CREATED':
        return <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-brand-400" />;
    }
  }

  return (
    <div className="bg-dark-900/60 rounded-xl border border-dark-800 p-4 h-[650px] flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-dark-800 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-400" />
          <h2 className="font-semibold text-xs uppercase tracking-wider text-slate-200">
            Live Activity Feed
          </h2>
        </div>
        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
          SOCKET.IO STREAM
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {activities.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs font-mono">
            No activities recorded yet
          </div>
        ) : (
          activities.map((a) => (
            <div
              key={a.id}
              className="bg-dark-850 p-3 rounded-xl border border-dark-800 text-xs space-y-1 shadow-sm hover:border-dark-700 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-200">
                  {getActionIcon(a.action)}
                  <span>{a.actorName}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{a.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
