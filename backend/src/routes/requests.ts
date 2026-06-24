import { Router } from "express";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { RequestStatus, RequestPriority } from "@prisma/client";
import { prisma } from "../prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { isWorkspaceMember } from "./workspaces";
import { upload, UPLOAD_DIR, decodeFilename } from "../upload";

export const requestsRouter = Router();

const createSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.nativeEnum(RequestPriority).optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.nativeEnum(RequestStatus).optional(),
  priority: z.nativeEnum(RequestPriority).optional(),
});

const requestInclude = {
  project: { select: { id: true, name: true, workspaceId: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  attachments: {
    include: { uploadedBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" as const },
  },
};

async function projectIfAllowed(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, workspaceId: true },
  });
  if (!project) return null;
  if (!(await isWorkspaceMember(project.workspaceId, userId))) return null;
  return project;
}

requestsRouter.get("/", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const projectId = req.query.project ? String(req.query.project) : null;

  const where: any = {};
  if (projectId) {
    if (!(await projectIfAllowed(projectId, userId))) {
      return res.status(403).json({ error: "Энэ төсөлд хандах эрхгүй байна" });
    }
    where.projectId = projectId;
  } else {
    where.project = {
      workspace: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
    };
  }
  if (req.query.mine === "true") where.createdById = userId;
  if (req.query.status)
    where.status = String(req.query.status) as RequestStatus;

  const q = req.query.q ? String(req.query.q).trim() : "";
  if (q) where.title = { contains: q, mode: "insensitive" };

  const requests = await prisma.projectRequest.findMany({
    where,
    include: requestInclude,
    orderBy: { createdAt: "desc" },
    take: q ? 25 : undefined,
  });
  res.json(requests);
});

requestsRouter.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  const request = await prisma.projectRequest.findUnique({
    where: { id: req.params.id },
    include: {
      ...requestInclude,
      changes: {
        include: {
          engineer: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!request) return res.status(404).json({ error: "Хүсэлт олдсонгүй" });
  if (
    !(await isWorkspaceMember(request.project.workspaceId, req.user!.userId))
  ) {
    return res.status(403).json({ error: "Энэ төсөлд хандах эрхгүй байна" });
  }
  res.json(request);
});

requestsRouter.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }
  const userId = req.user!.userId;
  const { projectId, title, description, priority } = parsed.data;

  if (!(await projectIfAllowed(projectId, userId))) {
    return res.status(403).json({ error: "Энэ төсөлд хандах эрхгүй байна" });
  }

  const request = await prisma.projectRequest.create({
    data: {
      title,
      description: description ?? null,
      priority: priority ?? RequestPriority.MEDIUM,
      projectId,
      createdById: userId,
    },
    include: requestInclude,
  });

  await prisma.projectHistory.create({
    data: {
      type: "REQUEST_CREATED",
      title: `"${request.title}" хүсэлт нэмэгдлээ`,
      projectId,
      actorId: userId,
      requestId: request.id,
    },
  });
  await notifyProjectMembers(projectId, userId, {
    type: "REQUEST_CREATED",
    message: `Шинэ хүсэлт: "${request.title}"`,
    projectId,
    requestId: request.id,
  });

  res.status(201).json(request);
});

requestsRouter.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const existing = await prisma.projectRequest.findUnique({
    where: { id: req.params.id },
    include: { project: { select: { workspaceId: true } } },
  });
  if (!existing) return res.status(404).json({ error: "Хүсэлт олдсонгүй" });
  if (
    !(await isWorkspaceMember(existing.project.workspaceId, req.user!.userId))
  ) {
    return res.status(403).json({ error: "Энэ төсөлд хандах эрхгүй байна" });
  }

  const request = await prisma.projectRequest.update({
    where: { id: req.params.id },
    data: parsed.data,
    include: requestInclude,
  });

  const resolved =
    parsed.data.status === RequestStatus.RESOLVED &&
    existing.status !== RequestStatus.RESOLVED;
  await prisma.projectHistory.create({
    data: {
      type: resolved ? "REQUEST_RESOLVED" : "REQUEST_UPDATED",
      title: resolved
        ? `"${request.title}" хүсэлт шийдэгдлээ`
        : `"${request.title}" хүсэлт шинэчлэгдлээ`,
      projectId: existing.projectId,
      actorId: req.user!.userId,
      requestId: request.id,
    },
  });
  if (existing.createdById !== req.user!.userId) {
    await prisma.notification.create({
      data: {
        type: resolved ? "REQUEST_RESOLVED" : "REQUEST_UPDATED",
        message: resolved
          ? `Таны "${request.title}" хүсэлт шийдэгдлээ`
          : `Таны "${request.title}" хүсэлт шинэчлэгдлээ`,
        userId: existing.createdById,
        projectId: existing.projectId,
        requestId: request.id,
      },
    });
  }

  res.json(request);
});

requestsRouter.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const existing = await prisma.projectRequest.findUnique({
    where: { id: req.params.id },
    include: {
      project: { select: { workspaceId: true } },
      attachments: { select: { storedName: true } },
    },
  });
  if (!existing) return res.status(404).json({ error: "Хүсэлт олдсонгүй" });
  if (
    !(await isWorkspaceMember(existing.project.workspaceId, req.user!.userId))
  ) {
    return res.status(403).json({ error: "Энэ төсөлд хандах эрхгүй байна" });
  }

  for (const att of existing.attachments) {
    try {
      fs.unlinkSync(path.join(UPLOAD_DIR, att.storedName));
    } catch {}
  }

  await prisma.projectRequest.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

requestsRouter.post(
  "/:id/attachments",
  requireAuth,
  upload.single("file"),
  async (req: AuthRequest, res) => {
    const request = await prisma.projectRequest.findUnique({
      where: { id: req.params.id },
      include: { project: { select: { workspaceId: true } } },
    });
    if (
      !request ||
      !(await isWorkspaceMember(request.project.workspaceId, req.user!.userId))
    ) {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {}
      }
      if (!request) return res.status(404).json({ error: "Хүсэлт олдсонгүй" });
      return res.status(403).json({ error: "Энэ төсөлд хандах эрхгүй байна" });
    }
    if (!req.file) return res.status(400).json({ error: "Файл алга" });

    const att = await prisma.attachment.create({
      data: {
        filename: decodeFilename(req.file.originalname),
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        requestId: request.id,
        uploadedById: req.user!.userId,
      },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });
    res.status(201).json(att);
  },
);

async function notifyProjectMembers(
  projectId: string,
  exceptUserId: string,
  payload: {
    type:
      | "REQUEST_CREATED"
      | "REQUEST_UPDATED"
      | "REQUEST_RESOLVED"
      | "CHANGE_ADDED";
    message: string;
    projectId?: string;
    requestId?: string;
  },
): Promise<void> {
  const members = await prisma.projectMember.findMany({
    where: { projectId, NOT: { userId: exceptUserId } },
    select: { userId: true },
  });
  if (members.length === 0) return;
  await prisma.notification.createMany({
    data: members.map((m) => ({
      type: payload.type,
      message: payload.message,
      userId: m.userId,
      projectId: payload.projectId ?? null,
      requestId: payload.requestId ?? null,
    })),
  });
}
