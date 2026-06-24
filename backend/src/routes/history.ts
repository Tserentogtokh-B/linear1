import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { isWorkspaceMember } from "./workspaces";

export const historyRouter = Router();

historyRouter.get("/", requireAuth, async (req: AuthRequest, res) => {
  const projectId = req.query.project ? String(req.query.project) : null;
  if (!projectId) {
    return res.status(400).json({ error: "project параметр шаардлагатай" });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { workspaceId: true },
  });
  if (!project) return res.status(404).json({ error: "Төсөл олдсонгүй" });
  if (!(await isWorkspaceMember(project.workspaceId, req.user!.userId))) {
    return res.status(403).json({ error: "Энэ төсөлд хандах эрхгүй байна" });
  }

  const events = await prisma.projectHistory.findMany({
    where: { projectId },
    include: {
      actor: { select: { id: true, name: true } },
      request: { select: { id: true, title: true } },
      change: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  res.json(events);
});
