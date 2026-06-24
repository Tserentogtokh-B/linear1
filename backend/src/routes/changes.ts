import { Router } from "express";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { ChangeType } from "@prisma/client";
import { prisma } from "../prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { isWorkspaceMember } from "./workspaces";
import { upload, UPLOAD_DIR, decodeFilename } from "../upload";

export const changesRouter = Router();

const createSchema = z.object({
  projectId: z.string().min(1),
  requestId: z.string().min(1).optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.nativeEnum(ChangeType).optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  type: z.nativeEnum(ChangeType).optional(),
});

const changeInclude = {
  engineer: { select: { id: true, name: true, email: true } },
  request: { select: { id: true, title: true } },
  attachments: {
    include: { uploadedBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" as const },
  },
};

changesRouter.get("/", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const projectId = req.query.project ? String(req.query.project) : null;
  const requestId = req.query.request ? String(req.query.request) : null;

  let where: any;
  if (requestId) {
    const request = await prisma.projectRequest.findUnique({
      where: { id: requestId },
      select: { projectId: true, project: { select: { workspaceId: true } } },
    });
    if (!request) return res.status(404).json({ error: "Хүсэлт олдсонгүй" });
    if (!(await isWorkspaceMember(request.project.workspaceId, userId))) {
      return res.status(403).json({ error: "Энэ төсөлд хандах эрхгүй байна" });
    }
    where = { requestId };
  } else if (projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { workspaceId: true },
    });
    if (!project) return res.status(404).json({ error: "Төсөл олдсонгүй" });
    if (!(await isWorkspaceMember(project.workspaceId, userId))) {
      return res.status(403).json({ error: "Энэ төсөлд хандах эрхгүй байна" });
    }
    where = { projectId };
  } else {
    return res
      .status(400)
      .json({ error: "project эсвэл request параметр шаардлагатай" });
  }

  const changes = await prisma.projectChange.findMany({
    where,
    include: changeInclude,
    orderBy: { createdAt: "asc" },
  });
  res.json(changes);
});

changesRouter.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }
  const userId = req.user!.userId;
  const { projectId, requestId, title, description, type } = parsed.data;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { workspaceId: true },
  });
  if (!project) return res.status(404).json({ error: "Төсөл олдсонгүй" });
  if (!(await isWorkspaceMember(project.workspaceId, userId))) {
    return res.status(403).json({ error: "Энэ төсөлд хандах эрхгүй байна" });
  }

  if (requestId) {
    const request = await prisma.projectRequest.findUnique({
      where: { id: requestId },
      select: { projectId: true },
    });
    if (!request || request.projectId !== projectId) {
      return res.status(400).json({ error: "Хүсэлт энэ төслийнх биш байна" });
    }
  }

  const change = await prisma.projectChange.create({
    data: {
      title,
      description: description ?? null,
      type: type ?? ChangeType.NOTE,
      projectId,
      requestId: requestId ?? null,
      engineerId: userId,
    },
    include: changeInclude,
  });

  await prisma.projectHistory.create({
    data: {
      type: "CHANGE_ADDED",
      title: `"${change.title}" өөрчлөлт нэмэгдлээ`,
      projectId,
      actorId: userId,
      requestId: requestId ?? null,
      changeId: change.id,
    },
  });

  if (requestId) {
    const request = await prisma.projectRequest.findUnique({
      where: { id: requestId },
      select: { createdById: true, title: true },
    });
    if (request && request.createdById !== userId) {
      await prisma.notification.create({
        data: {
          type: "CHANGE_ADDED",
          message: `"${request.title}" хүсэлтэд шинэ өөрчлөлт нэмэгдлээ`,
          userId: request.createdById,
          projectId,
          requestId,
        },
      });
    }
  }

  res.status(201).json(change);
});

changesRouter.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }
  const existing = await prisma.projectChange.findUnique({
    where: { id: req.params.id },
  });
  if (!existing) return res.status(404).json({ error: "Өөрчлөлт олдсонгүй" });
  if (existing.engineerId !== req.user!.userId) {
    return res.status(403).json({ error: "Зөвхөн зохиогч засах боломжтой" });
  }

  const change = await prisma.projectChange.update({
    where: { id: req.params.id },
    data: parsed.data,
    include: changeInclude,
  });
  res.json(change);
});

changesRouter.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const existing = await prisma.projectChange.findUnique({
    where: { id: req.params.id },
    include: { attachments: { select: { storedName: true } } },
  });
  if (!existing) return res.status(404).json({ error: "Өөрчлөлт олдсонгүй" });
  if (existing.engineerId !== req.user!.userId) {
    return res.status(403).json({ error: "Зөвхөн зохиогч устгах боломжтой" });
  }

  for (const att of existing.attachments) {
    try {
      fs.unlinkSync(path.join(UPLOAD_DIR, att.storedName));
    } catch {}
  }

  await prisma.projectChange.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

changesRouter.post(
  "/:id/attachments",
  requireAuth,
  upload.single("file"),
  async (req: AuthRequest, res) => {
    const change = await prisma.projectChange.findUnique({
      where: { id: req.params.id },
      select: { id: true, engineerId: true },
    });
    if (!change || change.engineerId !== req.user!.userId) {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {}
      }
      if (!change) return res.status(404).json({ error: "Өөрчлөлт олдсонгүй" });
      return res
        .status(403)
        .json({ error: "Зөвхөн зохиогч файл нэмэх эрхтэй" });
    }
    if (!req.file) return res.status(400).json({ error: "Файл алга" });

    const att = await prisma.attachment.create({
      data: {
        filename: decodeFilename(req.file.originalname),
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        changeId: change.id,
        uploadedById: req.user!.userId,
      },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });
    res.status(201).json(att);
  },
);
