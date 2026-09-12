import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Bell, Shield, UserCheck, Code, Plus, Radio } from 'lucide-react';

interface NavbarProps {
  onOpenNewTask: () => void;
  onOpenNewProject: () => void;
  unreadCount: number;
}

export function Navbar({ onOpenNewTask, onOpenNewProject, unreadCount }: NavbarProps) {
  const { currentUser, allUsers, loginAs } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  if (!currentUser) return null;

  const roleColor =
    currentUser.role === 'ADMIN'
      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
      : currentUser.role === 'PM'
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  const RoleIcon =
    currentUser.role === 'ADMIN'
      ? Shield
      : currentUser.role === 'PM'
      ? UserCheck
      : Code;

  return (
    <nav className="bg-dark-900/90 backdrop-blur border-b border-dark-800 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* BRAND & SOCKET INDICATOR */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-dark-950 font-bold shadow-lg shadow-brand-500/20">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-slate-100 text-sm tracking-wide">Agency Client Dashboard</h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                SOCKET.IO LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Role-scoped RBAC & Real-Time Feed
            </p>
          </div>
        </div>

        {/* ACTIONS & ROLE SWITCHER */}
        <div className="flex items-center gap-3">
          {/* Quick Create Buttons */}
          {currentUser.role !== 'DEVELOPER' && (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenNewProject}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-200 border border-dark-700 text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New Project
              </button>
              <button
                onClick={onOpenNewTask}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-md shadow-brand-600/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New Task
              </button>
            </div>
          )}

          {/* Notification Bell Badge */}
          <div className="relative">
            <button className="p-2 rounded-lg bg-dark-800 text-slate-300 hover:text-white border border-dark-700 relative">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 border border-dark-700 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <RoleIcon className="w-4 h-4 text-slate-300" />
                <span className="text-xs font-medium text-slate-200">{currentUser.name}</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${roleColor}`}>
                {currentUser.role}
              </span>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                <div className="px-2 py-1.5 text-[10px] font-mono text-slate-400 border-b border-dark-800">
                  Switch Active Role (Demo Quick-Switch):
                </div>
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      loginAs(u);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      u.id === currentUser.id
                        ? 'bg-dark-800 text-brand-400 font-bold'
                        : 'hover:bg-dark-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{u.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{u.role}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
