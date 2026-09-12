import React, { useState } from 'react';
import type { Project, TaskPriority, User } from '../types';
import { X, Plus } from 'lucide-react';

interface CreateTaskModalProps {
  projects: Project[];
  users: User[];
  onClose: () => void;
  onSubmit: (task: {
    projectId: string;
    title: string;
    description: string;
    priority: TaskPriority;
    assigneeId: string;
  }) => void;
}

export function CreateTaskModal({ projects, users, onClose, onSubmit }: CreateTaskModalProps) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assigneeId, setAssigneeId] = useState(users.find((u) => u.role === 'DEVELOPER')?.id ?? '');

  const developers = users.filter((u) => u.role === 'DEVELOPER');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !projectId) return;
    onSubmit({ projectId, title, description, priority, assigneeId });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm p-4">
      <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-dark-800 pb-3">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-400" />
            <h2 className="font-bold text-slate-100 text-base">Create New Task</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-dark-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-400 mb-1">Target Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-dark-800 text-slate-100 p-2.5 rounded-lg border border-dark-700 focus:border-brand-500 focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.clientName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Design System Dark Theme Tokens"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-dark-800 text-slate-100 p-2.5 rounded-lg border border-dark-700 focus:border-brand-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Task details and acceptance criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-dark-800 text-slate-100 p-2.5 rounded-lg border border-dark-700 focus:border-brand-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-dark-800 text-slate-100 p-2.5 rounded-lg border border-dark-700 focus:border-brand-500 focus:outline-none"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Assignee (Dev)</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full bg-dark-800 text-slate-100 p-2.5 rounded-lg border border-dark-700 focus:border-brand-500 focus:outline-none"
              >
                {developers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-300 font-sans font-medium text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-sans font-medium text-xs shadow-lg shadow-brand-600/30 transition-colors"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
