import React from 'react';
import type { Task, TaskStatus, User } from '../types';
import { Clock, AlertTriangle, ArrowRight, CheckCircle2, User as UserIcon } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  users: User[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  currentUser: User;
}

const COLUMNS: { status: TaskStatus; title: string; color: string }[] = [
  { status: 'TODO', title: 'To Do', color: 'border-slate-700 text-slate-300' },
  { status: 'IN_PROGRESS', title: 'In Progress', color: 'border-blue-500/40 text-blue-400' },
  { status: 'IN_REVIEW', title: 'In PM Review', color: 'border-amber-500/40 text-amber-400' },
  { status: 'DONE', title: 'Completed', color: 'border-emerald-500/40 text-emerald-400' },
];

export function KanbanBoard({ tasks, users, onStatusChange, currentUser }: KanbanBoardProps) {
  function getAssigneeName(assigneeId: string | null) {
    if (!assigneeId) return 'Unassigned';
    return users.find((u) => u.id === assigneeId)?.name ?? 'Dev';
  }

  function getPriorityBadge(priority: string) {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);

        return (
          <div
            key={col.status}
            className="bg-dark-900/60 rounded-xl border border-dark-800 p-3 flex flex-col h-[650px]"
          >
            {/* COLUMN HEADER */}
            <div className={`flex items-center justify-between pb-3 mb-3 border-b ${col.color}`}>
              <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider">
                <span>{col.title}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-dark-800 text-slate-300 font-bold">
                {columnTasks.length}
              </span>
            </div>

            {/* TASK CARDS */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {columnTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">
                  No tasks in this stage
                </div>
              ) : (
                columnTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`bg-dark-850 hover:bg-dark-800 rounded-xl p-3.5 border transition-all shadow-md group ${
                      t.isOverdue && t.status !== 'DONE'
                        ? 'border-rose-500/50 shadow-rose-500/5'
                        : 'border-dark-700/80 hover:border-dark-600'
                    }`}
                  >
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${getPriorityBadge(
                          t.priority
                        )}`}
                      >
                        {t.priority}
                      </span>

                      {t.isOverdue && t.status !== 'DONE' && (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          OVERDUE
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xs font-bold text-slate-100 mb-1 group-hover:text-brand-400 transition-colors">
                      {t.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {t.description}
                    </p>

                    {/* Meta info & Actions */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-dark-700/50 text-[10px] font-mono">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <UserIcon className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[90px]">{getAssigneeName(t.assigneeId)}</span>
                      </div>

                      {t.dueDate && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                      )}
                    </div>

                    {/* STATUS ACTION BUTTONS */}
                    <div className="mt-3 pt-2 flex items-center justify-end gap-1.5">
                      {t.status === 'TODO' && (
                        <button
                          onClick={() => onStatusChange(t.id, 'IN_PROGRESS')}
                          className="w-full flex items-center justify-center gap-1 py-1 px-2 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-mono font-semibold border border-blue-500/30 transition-colors"
                        >
                          <span>Start Working</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {t.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => onStatusChange(t.id, 'IN_REVIEW')}
                          className="w-full flex items-center justify-center gap-1 py-1 px-2 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-mono font-semibold border border-amber-500/30 transition-colors"
                        >
                          <span>Submit for Review</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {t.status === 'IN_REVIEW' && (
                        <button
                          onClick={() => onStatusChange(t.id, 'DONE')}
                          className="w-full flex items-center justify-center gap-1 py-1 px-2 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-semibold border border-emerald-500/30 transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approve & Complete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
