// apps/api/prisma/seed.ts
// Run with: npm run seed (inside apps/api)

import { PrismaClient, Role, TaskStatus, TaskPriority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PASSWORD = "password123"; // demo-only, documented in README

async function hash(pw: string) {
  return bcrypt.hash(pw, 10);
}

async function main() {
  console.log("Seeding database...");

  // --- Users ---
  const passwordHash = await hash(PASSWORD);

  const admin = await prisma.user.create({
    data: {
      email: "amara@agency.dev",
      name: "Amara (Admin)",
      role: Role.ADMIN,
      passwordHash,
    },
  });

  const pm1 = await prisma.user.create({
    data: {
      email: "ravi@agency.dev",
      name: "Ravi (PM)",
      role: Role.PM,
      passwordHash,
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      email: "sara@agency.dev",
      name: "Sara (PM)",
      role: Role.PM,
      passwordHash,
    },
  });

  const dev1 = await prisma.user.create({
    data: { email: "divya@agency.dev", name: "Divya (Dev)", role: Role.DEVELOPER, passwordHash },
  });
  const dev2 = await prisma.user.create({
    data: { email: "karan@agency.dev", name: "Karan (Dev)", role: Role.DEVELOPER, passwordHash },
  });
  const dev3 = await prisma.user.create({
    data: { email: "leo@agency.dev", name: "Leo (Dev)", role: Role.DEVELOPER, passwordHash },
  });
  const dev4 = await prisma.user.create({
    data: { email: "maya@agency.dev", name: "Maya (Dev)", role: Role.DEVELOPER, passwordHash },
  });

  const devs = [dev1, dev2, dev3, dev4];

  // --- Projects (PM-owned) ---
  const projectDefs = [
    { name: "Acme Rebrand", clientName: "Acme Co", ownerId: pm1.id },
    { name: "Northwind Mobile App", clientName: "Northwind Traders", ownerId: pm1.id },
    { name: "Globex Portal Revamp", clientName: "Globex Corp", ownerId: pm2.id },
  ];

  const projects = [];
  for (const def of projectDefs) {
    const project = await prisma.project.create({
      data: {
        name: def.name,
        clientName: def.clientName,
        description: `${def.name} — internal delivery project`,
        ownerId: def.ownerId,
      },
    });
    projects.push(project);
  }

  const statuses = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW, TaskStatus.DONE];
  const priorities = [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.URGENT];

  let overdueCount = 0;

  for (const project of projects) {
    for (let i = 0; i < 6; i++) {
      const assignee = devs[(i + projects.indexOf(project)) % devs.length];
      const status = statuses[i % statuses.length];
      const priority = priorities[i % priorities.length];

      // Force at least 2 overdue tasks across the whole seed (past due date, not DONE)
      const forceOverdue = overdueCount < 2 && status !== TaskStatus.DONE && i % 3 === 0;
      const dueDate = forceOverdue
        ? new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
        : new Date(Date.now() + 1000 * 60 * 60 * 24 * (i + 1)); // upcoming

      if (forceOverdue) overdueCount++;

      const task = await prisma.task.create({
        data: {
          projectId: project.id,
          title: `${project.name} — Task ${i + 1}`,
          description: "Seeded demo task.",
          status,
          priority,
          assigneeId: assignee.id,
          dueDate,
          isOverdue: forceOverdue,
        },
      });

      // Pre-existing activity log entry for each seeded task
      await prisma.activityLog.create({
        data: {
          projectId: project.id,
          taskId: task.id,
          actorId: project.ownerId,
          action: "TASK_CREATED",
          toValue: status,
          message: `${assignee.name} was assigned Task "${task.title}"`,
        },
      });
    }
  }

  console.log("Seed complete:");
  console.log(`  Users: 1 admin, 2 PMs, 4 devs (password for all: "${PASSWORD}")`);
  console.log(`  Projects: ${projects.length}`);
  console.log(`  Overdue tasks forced: ${overdueCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
