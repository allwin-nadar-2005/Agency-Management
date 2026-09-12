import React, { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { KanbanBoard } from './components/KanbanBoard';
import { ActivityFeed } from './components/ActivityFeed';
import { CreateTaskModal } from './components/CreateTaskModal';
import { CreateProjectModal } from './components/CreateProjectModal';
import { getSocket } from './lib/socket';
import type { Project, Task, ActivityLog, Notification, TaskStatus, TaskPriority } from './types';
import { FolderGit2, CheckCircle2, AlertTriangle, Layers, Clock, Filter } from 'lucide-react';

const API_BASE = 'http://localhost:4000';

export function DashboardContent() {
  const { currentUser, allUsers } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Fetch initial data
  useEffect(() => {
    if (!currentUser) return;

    async function loadData() {
      try {
        const [projRes, taskRes, actRes, notifRes] = await Promise.all([
          fetch(`${API_BASE}/api/projects?userId=${currentUser.id}&role=${currentUser.role}`),
          fetch(`${API_BASE}/api/tasks`),
          fetch(`${API_BASE}/api/activity`),
          fetch(`${API_BASE}/api/notifications?userId=${currentUser.id}`),
        ]);

        if (projRes.ok) setProjects(await projRes.json());
        if (taskRes.ok) setTasks(await taskRes.json());
        if (actRes.ok) setActivities(await actRes.json());
        if (notifRes.ok) setNotifications(await notifRes.json());
      } catch (err) {
        console.error('Failed loading dashboard data:', err);
      }
    }

    loadData();

    // Socket.IO event listeners
    const socket = getSocket(currentUser.id, currentUser.role);

    socket.on('activity', (newAct: ActivityLog) => {
      setActivities((prev) => [newAct, ...prev]);
    });

    socket.on('task_updated', (updatedTask: Task) => {
      setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    });

    socket.on('notification', (newNotif: Notification) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => {
      socket.off('activity');
      socket.off('task_updated');
      socket.off('notification');
    };
  }, [currentUser]);

  // Handle task status update
  async function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, actorId: currentUser.id }),
      });
      if (res.ok) {
        const updated = (await res.json()) as Task;
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  }

  // Handle Create Task
  async function handleCreateTask(taskData: {
    projectId: string;
    title: string;
    description: string;
    priority: TaskPriority;
    assigneeId: string;
  }) {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...taskData, actorId: currentUser.id }),
      });
      if (res.ok) {
        const newTask = (await res.json()) as Task;
        setTasks((prev) => [newTask, ...prev]);
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  }

  // Handle Create Project
  async function handleCreateProject(projData: { name: string; clientName: string; description: string }) {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...projData, ownerId: currentUser.id }),
      });
      if (res.ok) {
        const newProj = (await res.json()) as Project;
        setProjects((prev) => [newProj, ...prev]);
      }
    } catch (err) {
      console.error('Error creating project:', err);
    }
  }

  // Filter tasks by selected project & role
  const filteredTasks = tasks.filter((t) => {
    if (selectedProjectId !== 'ALL' && t.projectId !== selectedProjectId) return false;
    if (currentUser?.role === 'DEVELOPER') {
      return t.assigneeId === currentUser.id;
    }
    return true;
  });

  // Calculate Metrics
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter((t) => t.status === 'DONE').length;
  const inReviewTasks = filteredTasks.filter((t) => t.status === 'IN_REVIEW').length;
  const overdueTasks = filteredTasks.filter((t) => t.isOverdue && t.status !== 'DONE').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (!currentUser) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        onOpenNewTask={() => setShowTaskModal(true)}
        onOpenNewProject={() => setShowProjectModal(true)}
        unreadCount={notifications.filter((n) => !n.read).length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 space-y-6">
        {/* ROLE SCOPE HERO HEADER */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-100">
                {currentUser.role === 'ADMIN'
                  ? 'Admin Master Operations Center'
                  : currentUser.role === 'PM'
                  ? 'Project Manager Workspace'
                  : 'Developer Assigned Workstation'}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-brand-500/10 text-brand-400 border border-brand-500/20 font-bold">
                RBAC SCOPE ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Showing active deliverables, task statuses, and real-time Socket.IO activity.
            </p>
          </div>

          {/* PROJECT SELECTOR DROPDOWN */}
          <div className="flex items-center gap-2 bg-dark-850 px-3 py-2 rounded-xl border border-dark-700">
            <Filter className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-mono text-slate-400">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-dark-900 text-slate-100 text-xs font-mono px-3 py-1.5 rounded-lg border border-dark-700 focus:border-brand-500 focus:outline-none"
            >
              <option value="ALL">All Projects ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TELEMETRY STAT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-dark-900 border border-dark-800 p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Active Projects</span>
              <FolderGit2 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100 font-mono">{projects.length}</div>
            <div className="text-[10px] text-slate-500 font-mono">Role-scoped list</div>
          </div>

          <div className="bg-dark-900 border border-dark-800 p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Tasks</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100 font-mono">{totalTasks}</div>
            <div className="text-[10px] text-slate-500 font-mono">{completionRate}% finished</div>
          </div>

          <div className="bg-dark-900 border border-dark-800 p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>In PM Review</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400 font-mono">{inReviewTasks}</div>
            <div className="text-[10px] text-slate-500 font-mono">Awaiting approval</div>
          </div>

          <div className="bg-dark-900 border border-dark-800 p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Overdue Tasks</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-400 font-mono">{overdueTasks}</div>
            <div className="text-[10px] text-slate-500 font-mono">Cron checked</div>
          </div>

          <div className="bg-dark-900 border border-dark-800 p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">{completedTasks}</div>
            <div className="text-[10px] text-slate-500 font-mono">Done status</div>
          </div>
        </div>

        {/* MAIN BOARD & FEED GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* KANBAN BOARD */}
          <KanbanBoard
            tasks={filteredTasks}
            users={allUsers}
            onStatusChange={handleStatusChange}
            currentUser={currentUser}
          />

          {/* REALTIME ACTIVITY FEED */}
          <ActivityFeed activities={activities} />
        </div>
      </main>

      {/* MODALS */}
      {showTaskModal && (
        <CreateTaskModal
          projects={projects}
          users={allUsers}
          onClose={() => setShowTaskModal(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {showProjectModal && (
        <CreateProjectModal
          onClose={() => setShowProjectModal(false)}
          onSubmit={handleCreateProject}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <DashboardContent />
  );
}
