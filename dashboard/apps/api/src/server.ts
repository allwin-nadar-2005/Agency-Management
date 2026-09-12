import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { Server as SocketIOServer } from 'socket.io';
import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const PORT = Number(process.env.PORT ?? 4000);
const JWT_SECRET = process.env.JWT_ACCESS_SECRET ?? 'dev-secret-key';

// --- Types ---
export type Role = 'ADMIN' | 'PM' | 'DEVELOPER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: string | null;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  taskId: string | null;
  actorId: string;
  actorName: string;
  action: string;
  fromValue: string | null;
  toValue: string | null;
  message: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  taskId: string | null;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// --- Seed Data in Memory Store ---
const USERS: User[] = [
  { id: 'usr-admin-1', email: 'amara@agency.dev', name: 'Amara (Admin)', role: 'ADMIN' },
  { id: 'usr-pm-1', email: 'ravi@agency.dev', name: 'Ravi (PM)', role: 'PM' },
  { id: 'usr-pm-2', email: 'sara@agency.dev', name: 'Sara (PM)', role: 'PM' },
  { id: 'usr-dev-1', email: 'divya@agency.dev', name: 'Divya (Dev)', role: 'DEVELOPER' },
  { id: 'usr-dev-2', email: 'karan@agency.dev', name: 'Karan (Dev)', role: 'DEVELOPER' },
  { id: 'usr-dev-3', email: 'leo@agency.dev', name: 'Leo (Dev)', role: 'DEVELOPER' },
  { id: 'usr-dev-4', email: 'maya@agency.dev', name: 'Maya (Dev)', role: 'DEVELOPER' },
];

const PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Acme Rebrand',
    clientName: 'Acme Co',
    description: 'Complete brand identity refresh & design system delivery',
    ownerId: 'usr-pm-1',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-2',
    name: 'Northwind Mobile App',
    clientName: 'Northwind Traders',
    description: 'Cross-platform mobile commerce application for Android/iOS',
    ownerId: 'usr-pm-1',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-3',
    name: 'Globex Portal Revamp',
    clientName: 'Globex Corp',
    description: 'Enterprise B2B client dashboard overhaul with real-time telemetry',
    ownerId: 'usr-pm-2',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const TASKS: Task[] = [
  {
    id: 'task-101',
    projectId: 'proj-1',
    title: 'Brand Palette & Typography Guidelines',
    description: 'Finalize core color tokens and font hierarchies in Figma.',
    status: 'DONE',
    priority: 'HIGH',
    assigneeId: 'usr-dev-1',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    isOverdue: false,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'task-102',
    projectId: 'proj-1',
    title: 'Component Library Scaffolding',
    description: 'Build reusable UI button, modal, and input components in React.',
    status: 'IN_REVIEW',
    priority: 'URGENT',
    assigneeId: 'usr-dev-2',
    dueDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    isOverdue: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'task-103',
    projectId: 'proj-1',
    title: 'Landing Page Hero Section Animation',
    description: 'Implement glassmorphism hero banner with interactive particle background.',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    assigneeId: 'usr-dev-1',
    dueDate: new Date(Date.now() + 4 * 86400000).toISOString(),
    isOverdue: false,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: 'task-201',
    projectId: 'proj-2',
    title: 'Biometric Auth Integration',
    description: 'Integrate FaceID / TouchID native mobile authentication hooks.',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    assigneeId: 'usr-dev-3',
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString(),
    isOverdue: false,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'task-202',
    projectId: 'proj-2',
    title: 'Push Notifications Worker',
    description: 'Configure FCM push notification topics for order updates.',
    status: 'TODO',
    priority: 'HIGH',
    assigneeId: 'usr-dev-4',
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    isOverdue: true,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'task-301',
    projectId: 'proj-3',
    title: 'WebSocket Live Telemetry Feed',
    description: 'Connect Socket.IO room-based event listeners for real-time task sync.',
    status: 'IN_REVIEW',
    priority: 'HIGH',
    assigneeId: 'usr-dev-2',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    isOverdue: false,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 'task-302',
    projectId: 'proj-3',
    title: 'RBAC Security Middleware',
    description: 'Enforce JWT role checking across Admin, PM, and Dev endpoints.',
    status: 'TODO',
    priority: 'URGENT',
    assigneeId: 'usr-dev-3',
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    isOverdue: false,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-1',
    projectId: 'proj-1',
    taskId: 'task-102',
    actorId: 'usr-dev-2',
    actorName: 'Karan (Dev)',
    action: 'TASK_MOVED_TO_REVIEW',
    fromValue: 'IN_PROGRESS',
    toValue: 'IN_REVIEW',
    message: 'Karan (Dev) moved "Component Library Scaffolding" to IN_REVIEW',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'act-2',
    projectId: 'proj-3',
    taskId: 'task-301',
    actorId: 'usr-dev-2',
    actorName: 'Karan (Dev)',
    action: 'TASK_MOVED_TO_REVIEW',
    fromValue: 'IN_PROGRESS',
    toValue: 'IN_REVIEW',
    message: 'Karan (Dev) submitted "WebSocket Live Telemetry Feed" for PM Review',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 'act-3',
    projectId: 'proj-1',
    taskId: 'task-101',
    actorId: 'usr-pm-1',
    actorName: 'Ravi (PM)',
    action: 'TASK_COMPLETED',
    fromValue: 'IN_REVIEW',
    toValue: 'DONE',
    message: 'Ravi (PM) marked "Brand Palette & Typography Guidelines" as DONE',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    recipientId: 'usr-dev-2',
    taskId: 'task-102',
    type: 'TASK_ASSIGNED',
    message: 'You were assigned to Component Library Scaffolding',
    read: false,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'notif-2',
    recipientId: 'usr-pm-1',
    taskId: 'task-102',
    type: 'TASK_MOVED_TO_REVIEW',
    message: 'Component Library Scaffolding is ready for PM review',
    read: false,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

// --- Fastify Server Setup ---
const app = Fastify({ logger: false });

await app.register(cors, {
  origin: true,
  credentials: true,
});

await app.register(cookie, {
  secret: 'cookie-secret-key',
});

// Create Socket.IO server bound to Fastify HTTP server
const io = new SocketIOServer(app.server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId as string | undefined;
  const role = socket.handshake.query.role as string | undefined;

  // Global admin room
  socket.join('admin-global');

  if (userId) {
    socket.join(`dev:${userId}`);
  }

  socket.on('join-project', (projectId: string) => {
    socket.join(`pm-project:${projectId}`);
  });

  socket.on('leave-project', (projectId: string) => {
    socket.leave(`pm-project:${projectId}`);
  });
});

// Helper for broadcasting activities
function logAndBroadcast(
  projectId: string,
  taskId: string | null,
  actor: User,
  action: string,
  fromValue: string | null,
  toValue: string | null,
  message: string
) {
  const activity: ActivityLog = {
    id: `act-${uuidv4().substring(0, 8)}`,
    projectId,
    taskId,
    actorId: actor.id,
    actorName: actor.name,
    action,
    fromValue,
    toValue,
    message,
    createdAt: new Date().toISOString(),
  };

  ACTIVITIES.unshift(activity);

  // Socket.IO Room Broadcasts
  io.to('admin-global').emit('activity', activity);
  io.to(`pm-project:${projectId}`).emit('activity', activity);
  if (taskId) {
    const task = TASKS.find((t) => t.id === taskId);
    if (task?.assigneeId) {
      io.to(`dev:${task.assigneeId}`).emit('activity', activity);
    }
  }

  return activity;
}

// --- Routes ---

// Health & Info
app.get('/health', async () => ({ status: 'online', timestamp: new Date().toISOString() }));
app.get('/', async () => ({
  name: 'Real-Time Client Project Dashboard API Engine',
  version: '1.0.0',
  status: 'running',
  socketIO: 'enabled',
  demoUsers: USERS,
}));

// Auth: Login / Quick Switch
app.post('/api/auth/login', async (req, reply) => {
  const { email, userId } = req.body as { email?: string; userId?: string };

  let user = USERS.find((u) => u.email === email || u.id === userId);
  if (!user && email) {
    user = USERS.find((u) => u.email.toLowerCase().includes(email.toLowerCase()));
  }
  if (!user) {
    user = USERS[0]; // fallback default to Admin
  }

  const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '24h',
  });

  return reply.send({
    user,
    token,
  });
});

app.get('/api/users', async () => USERS);

// Projects
app.get('/api/projects', async (req) => {
  const userId = (req.query as { userId?: string }).userId;
  const role = (req.query as { role?: Role }).role;

  if (role === 'PM' && userId) {
    return PROJECTS.filter((p) => p.ownerId === userId);
  }
  if (role === 'DEVELOPER' && userId) {
    const devTaskProjIds = new Set(TASKS.filter((t) => t.assigneeId === userId).map((t) => t.projectId));
    return PROJECTS.filter((p) => devTaskProjIds.has(p.id));
  }

  return PROJECTS;
});

app.post('/api/projects', async (req, reply) => {
  const { name, clientName, description, ownerId } = req.body as {
    name: string;
    clientName: string;
    description: string;
    ownerId?: string;
  };

  const project: Project = {
    id: `proj-${uuidv4().substring(0, 6)}`,
    name,
    clientName,
    description: description || `${name} delivery project`,
    ownerId: ownerId || 'usr-pm-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  PROJECTS.unshift(project);

  const pmUser = USERS.find((u) => u.id === project.ownerId) || USERS[1];
  logAndBroadcast(
    project.id,
    null,
    pmUser,
    'PROJECT_CREATED',
    null,
    project.name,
    `${pmUser.name} created new project "${project.name}" for client ${project.clientName}`
  );

  return reply.status(201).send(project);
});

// Tasks
app.get('/api/tasks', async (req) => {
  const { projectId, assigneeId, status } = req.query as {
    projectId?: string;
    assigneeId?: string;
    status?: TaskStatus;
  };

  let list = TASKS;
  if (projectId) list = list.filter((t) => t.projectId === projectId);
  if (assigneeId) list = list.filter((t) => t.assigneeId === assigneeId);
  if (status) list = list.filter((t) => t.status === status);

  return list;
});

app.post('/api/tasks', async (req, reply) => {
  const { projectId, title, description, priority, assigneeId, dueDate, actorId } = req.body as {
    projectId: string;
    title: string;
    description?: string;
    priority?: TaskPriority;
    assigneeId?: string;
    dueDate?: string;
    actorId?: string;
  };

  const actor = USERS.find((u) => u.id === actorId) || USERS[1];
  const assignee = USERS.find((u) => u.id === assigneeId);

  const newTask: Task = {
    id: `task-${uuidv4().substring(0, 6)}`,
    projectId,
    title,
    description: description || 'New project task.',
    status: 'TODO',
    priority: priority || 'MEDIUM',
    assigneeId: assigneeId || null,
    dueDate: dueDate || new Date(Date.now() + 3 * 86400000).toISOString(),
    isOverdue: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  TASKS.unshift(newTask);

  logAndBroadcast(
    projectId,
    newTask.id,
    actor,
    'TASK_CREATED',
    null,
    'TODO',
    `${actor.name} created task "${title}"${assignee ? ` assigned to ${assignee.name}` : ''}`
  );

  if (assignee) {
    NOTIFICATIONS.unshift({
      id: `notif-${uuidv4().substring(0, 6)}`,
      recipientId: assignee.id,
      taskId: newTask.id,
      type: 'TASK_ASSIGNED',
      message: `You were assigned to task "${title}"`,
      read: false,
      createdAt: new Date().toISOString(),
    });
    io.to(`dev:${assignee.id}`).emit('notification', NOTIFICATIONS[0]);
  }

  return reply.status(201).send(newTask);
});

// Task Status Update (RBAC / Live Feed trigger)
app.patch('/api/tasks/:id/status', async (req, reply) => {
  const { id } = req.params as { id: string };
  const { status, actorId } = req.body as { status: TaskStatus; actorId?: string };

  const task = TASKS.find((t) => t.id === id);
  if (!task) {
    return reply.status(404).send({ error: 'Task not found' });
  }

  const oldStatus = task.status;
  task.status = status;
  task.updatedAt = new Date().toISOString();

  // Reset overdue if completed
  if (status === 'DONE') {
    task.isOverdue = false;
  }

  const actor = USERS.find((u) => u.id === actorId) || USERS[1];
  const project = PROJECTS.find((p) => p.id === task.projectId);

  let action = 'TASK_STATUS_CHANGED';
  if (status === 'IN_REVIEW') action = 'TASK_MOVED_TO_REVIEW';
  if (status === 'DONE') action = 'TASK_COMPLETED';

  logAndBroadcast(
    task.projectId,
    task.id,
    actor,
    action,
    oldStatus,
    status,
    `${actor.name} moved "${task.title}" from ${oldStatus} to ${status}`
  );

  // Notify PM if task moved to review
  if (status === 'IN_REVIEW' && project) {
    NOTIFICATIONS.unshift({
      id: `notif-${uuidv4().substring(0, 6)}`,
      recipientId: project.ownerId,
      taskId: task.id,
      type: 'TASK_MOVED_TO_REVIEW',
      message: `Task "${task.title}" was submitted for review`,
      read: false,
      createdAt: new Date().toISOString(),
    });
    io.to(`dev:${project.ownerId}`).emit('notification', NOTIFICATIONS[0]);
  }

  io.emit('task_updated', task);
  return reply.send(task);
});

// Activity Feed Endpoint
app.get('/api/activity', async (req) => {
  const { projectId } = req.query as { projectId?: string };
  if (projectId) {
    return ACTIVITIES.filter((a) => a.projectId === projectId);
  }
  return ACTIVITIES.slice(0, 50);
});

// Notifications Endpoint
app.get('/api/notifications', async (req) => {
  const { userId } = req.query as { userId?: string };
  if (userId) {
    return NOTIFICATIONS.filter((n) => n.recipientId === userId);
  }
  return NOTIFICATIONS;
});

// Background node-cron job for checking overdue tasks
cron.schedule('* * * * *', () => {
  const now = new Date().getTime();
  TASKS.forEach((t) => {
    if (t.status !== 'DONE' && t.dueDate && new Date(t.dueDate).getTime() < now) {
      if (!t.isOverdue) {
        t.isOverdue = true;
        t.updatedAt = new Date().toISOString();

        if (t.assigneeId) {
          NOTIFICATIONS.unshift({
            id: `notif-${uuidv4().substring(0, 6)}`,
            recipientId: t.assigneeId,
            taskId: t.id,
            type: 'TASK_OVERDUE',
            message: `Task "${t.title}" is past due date!`,
            read: false,
            createdAt: new Date().toISOString(),
          });
          io.to(`dev:${t.assigneeId}`).emit('notification', NOTIFICATIONS[0]);
        }
      }
    }
  });
});

// Start Server
try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`⚡ Real-Time Project Dashboard API listening on http://localhost:${PORT}`);
} catch (err) {
  console.error('Failed to start server:', err);
  process.exit(1);
}
