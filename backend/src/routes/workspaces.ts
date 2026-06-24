import { Router } from "express";
import { z } from "zod";
import { MemberRole } from "@prisma/client";
import { prisma } from "../prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

export const workspacesRouter = Router();

export async function isWorkspaceMember(
  workspaceId: string,
  userId: string,
): Promise<boolean> {
  const ws = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    select: { id: true },
  });
  return !!ws;
}

export async function getWorkspaceRole(
  workspaceId: string,
  userId: string,
): Promise<MemberRole | null> {
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { ownerId: true },
  });
  if (!ws) return null;
  if (ws.ownerId === userId) return MemberRole.ADMIN;
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
    select: { role: true },
  });
  return member?.role ?? null;
}

const createSchema = z.object({
  name: z.string().min(1),
});

workspacesRouter.get("/", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const workspaces = await prisma.workspace.findMany({
    where: {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    include: {
      _count: { select: { members: true, projects: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  res.json(workspaces);
});

workspacesRouter.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }
  const userId = req.user!.userId;
  const { name } = parsed.data;

  const existing = await prisma.workspace.findUnique({
    where: { name_ownerId: { name, ownerId: userId } },
  });
  if (existing) {
    return res
      .status(409)
      .json({ error: "Энэ нэртэй workspace аль хэдийн байна" });
  }

  const workspace = await prisma.workspace.create({
    data: {
      name,
      ownerId: userId,
      members: {
        create: { userId, role: MemberRole.ADMIN },
      },
    },
    include: { _count: { select: { members: true, projects: true } } },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { activeWorkspaceId: workspace.id },
  });

  res.status(201).json(workspace);
});

workspacesRouter.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  if (!(await isWorkspaceMember(req.params.id, req.user!.userId))) {
    return res
      .status(403)
      .json({ error: "Энэ workspace-ийн гишүүн биш байна" });
  }
  const workspace = await prisma.workspace.findUnique({
    where: { id: req.params.id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { joinedAt: "asc" },
      },
      projects: {
        orderBy: { createdAt: "asc" },
        include: { _count: { select: { requests: true, changes: true } } },
      },
    },
  });
  if (!workspace) return res.status(404).json({ error: "Workspace олдсонгүй" });
  res.json(workspace);
});

const memberSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(MemberRole).optional(),
});

workspacesRouter.post(
  "/:id/members",
  requireAuth,
  async (req: AuthRequest, res) => {
    const role = await getWorkspaceRole(req.params.id, req.user!.userId);
    if (!role) {
      return res
        .status(403)
        .json({ error: "Энэ workspace-ийн гишүүн биш байна" });
    }
    if (role !== MemberRole.ADMIN) {
      return res
        .status(403)
        .json({ error: "Зөвхөн ADMIN гишүүн нэмэх эрхтэй" });
    }

    const parsed = memberSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "И-мэйл буруу байна" });
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (!user) {
      return res
        .status(404)
        .json({ error: "Энэ и-мэйлтэй хэрэглэгч бүртгэлгүй байна" });
    }

    const already = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId: req.params.id, userId: user.id },
      },
    });
    if (already) {
      return res.status(409).json({ error: "Аль хэдийн гишүүн байна" });
    }

    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId: req.params.id,
        userId: user.id,
        role: parsed.data.role ?? MemberRole.CLIENT,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    await prisma.notification.create({
      data: {
        type: "MEMBER_ADDED",
        message: "Танийг шинэ workspace-д нэмлээ",
        userId: user.id,
      },
    });

    res.status(201).json(member);
  },
);

workspacesRouter.patch(
  "/:id/activate",
  requireAuth,
  async (req: AuthRequest, res) => {
    if (!(await isWorkspaceMember(req.params.id, req.user!.userId))) {
      return res
        .status(403)
        .json({ error: "Энэ workspace-ийн гишүүн биш байна" });
    }
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { activeWorkspaceId: req.params.id },
    });
    res.status(204).send();
  },
);
