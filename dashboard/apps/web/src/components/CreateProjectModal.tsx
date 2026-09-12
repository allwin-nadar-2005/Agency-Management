import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';

interface CreateProjectModalProps {
  onClose: () => void;
  onSubmit: (project: { name: string; clientName: string; description: string }) => void;
}

export function CreateProjectModal({ onClose, onSubmit }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !clientName.trim()) return;
    onSubmit({ name, clientName, description });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm p-4">
      <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-dark-800 pb-3">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-purple-400" />
            <h2 className="font-bold text-slate-100 text-base">Create New Client Project</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-dark-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-400 mb-1">Project Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Orion Cloud Platform"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-dark-800 text-slate-100 p-2.5 rounded-lg border border-dark-700 focus:border-purple-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Client Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Orion Financial Services"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-dark-800 text-slate-100 p-2.5 rounded-lg border border-dark-700 focus:border-purple-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Project overview & client requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-dark-800 text-slate-100 p-2.5 rounded-lg border border-dark-700 focus:border-purple-500 focus:outline-none placeholder:text-slate-500"
            />
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
              className="w-1/2 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-sans font-medium text-xs shadow-lg shadow-purple-600/30 transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
