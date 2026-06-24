import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

export const searchRouter = Router();

searchRouter.get("/", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const q = req.query.q ? String(req.query.q).trim() : "";
  if (!q) return res.json({ requests: [], projects: [], workspaces: [] });
  const myWorkspace = {
    OR: [{ ownerId: userId }, { members: { some: { userId } } }],
  };
  const requests = await prisma.projectRequest.findMany({
    where: {
      title: { contains: q, mode: "insensitive" },
      project: { workspace: myWorkspace },
    },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      projectId: true,
      project: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  const projects = await prisma.project.findMany({
    where: {
      name: { contains: q, mode: "insensitive" },
      workspace: myWorkspace,
    },
    select: {
      id: true,
      name: true,
      status: true,
      workspaceId: true,
      workspace: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  const workspaces = await prisma.workspace.findMany({
    where: {
      AND: [myWorkspace, { name: { contains: q, mode: "insensitive" } }],
    },
    select: { id: true, name: true },
    take: 10,
  });

  res.json({ requests, projects, workspaces });
});
