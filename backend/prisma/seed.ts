import {
  MemberRole,
  PrismaClient,
  ProjectStatus,
  RequestStatus,
  RequestPriority,
  ChangeType,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Data vvsgej baina...");

  await prisma.notification.deleteMany({});
  await prisma.attachment.deleteMany({});
  await prisma.projectHistory.deleteMany({});
  await prisma.projectChange.deleteMany({});
  await prisma.projectRequest.deleteMany({});
  await prisma.inviteRedemption.deleteMany({});
  await prisma.inviteLink.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.workspaceMember.deleteMany({});

  await prisma.user.updateMany({ data: { activeWorkspaceId: null } });
  await prisma.workspace.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Huuchin datag ustgasan.");

  const togtokh = await prisma.user.create({
    data: {
      email: "togtokh@example.com",
      name: "Togtokh",
      passwordHash: "hash_value123",
    },
  });

  const boldo = await prisma.user.create({
    data: {
      email: "boldoo@example.com",
      name: "boldoo",
      passwordHash: "dhash_value456",
    },
  });

  const temuujin = await prisma.user.create({
    data: {
      email: "temuujin@example.com",
      name: "temuujin",
      passwordHash: "temka_hashvalue789",
    },
  });

  const enerel = await prisma.user.create({
    data: {
      email: "enerel@example.com",
      name: "enerel",
      passwordHash: "enerel_hashvalue888",
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: "Aurora workspace",
      ownerId: togtokh.id,
    },
  });

  await prisma.user.update({
    where: { id: togtokh.id },
    data: { activeWorkspaceId: workspace.id },
  });

  await prisma.workspaceMember.create({
    data: {
      workspaceId: workspace.id,
      userId: togtokh.id,
      role: MemberRole.ADMIN,
    },
  });

  await prisma.workspaceMember.create({
    data: {
      workspaceId: workspace.id,
      userId: enerel.id,
      role: MemberRole.ENGINEER,
    },
  });

  await prisma.workspaceMember.create({
    data: {
      workspaceId: workspace.id,
      userId: boldo.id,
      role: MemberRole.CLIENT,
    },
  });

  const project = await prisma.project.create({
    data: {
      name: "System1",
      description: "First system project scope",
      status: ProjectStatus.ACTIVE,
      workspaceId: workspace.id,
    },
  });

  await prisma.projectMember.createMany({
    data: [
      { projectId: project.id, userId: togtokh.id },
      { projectId: project.id, userId: boldo.id },
      { projectId: project.id, userId: enerel.id },
    ],
  });

  const request1 = await prisma.projectRequest.create({
    data: {
      title: "PostgreSQL iig Docker deer asaah",
      description: "Docker compose ashiglan port 5432 deer asaana.",
      status: RequestStatus.RESOLVED,
      priority: RequestPriority.HIGH,
      projectId: project.id,
      createdById: togtokh.id,
    },
  });

  const request2 = await prisma.projectRequest.create({
    data: {
      title: "Prisma Seed тохируулах",
      description: "Шинэ схемийн дагуу seed дата үүсгэх.",
      status: RequestStatus.IN_PROGRESS,
      priority: RequestPriority.URGENT,
      projectId: project.id,
      createdById: togtokh.id,
    },
  });

  await prisma.projectChange.create({
    data: {
      title: "Анхны баазын скрипт бэлэн боллоо",
      description: "Docker compose file succesfull.",
      type: ChangeType.NOTE,
      projectId: project.id,
      requestId: request1.id,
      engineerId: enerel.id,
    },
  });

  await prisma.notification.create({
    data: {
      type: "REQUEST_CREATED",
      message: "request created",
      userId: boldo.id,
      projectId: project.id,
      requestId: request2.id,
    },
  });

  console.log("Data vvsgesen.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
