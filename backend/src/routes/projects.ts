import { Router } from "express";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { ProjectStatus } from "@prisma/client";
import { prisma } from "../prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { isWorkspaceMember } from "./workspaces";
import { upload, UPLOAD_DIR, decodeFilename } from "../upload";

export const projectsRouter = Router();

const createSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
});

const projectInclude = {
  workspace: { select: { id: true, name: true } },
  _count: { select: { requests: true, changes: true } },
};

async function canAccessProject(
  project: { workspaceId: string },
  userId: string,
): Promise<boolean> {
  return isWorkspaceMember(project.workspaceId, userId);
}

projectsRouter.get("/", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const workspaceId = req.query.workspace ? String(req.query.workspace) : null;
  if (!workspaceId) {
    return res.status(400).json({ error: "workspace параметр шаардлагатай" });
  }
  if (!(await isWorkspaceMember(workspaceId, userId))) {
    return res
      .status(403)
      .json({ error: "Энэ workspace-ийн гишүүн биш байна" });
  }

  const projects = await prisma.project.findMany({
    where: { workspaceId },
    include: projectInclude,
    orderBy: { createdAt: "asc" },
  });
  res.json(projects);
});

projectsRouter.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }
  const userId = req.user!.userId;
  const { workspaceId, name, description, status } = parsed.data;

  if (!(await isWorkspaceMember(workspaceId, userId))) {
    return res
      .status(403)
      .json({ error: "Энэ workspace-ийн гишүүн биш байна" });
  }

  const existing = await prisma.project.findUnique({
    where: { workspaceId_name: { workspaceId, name } },
  });
  if (existing) {
    return res
      .status(409)
      .json({ error: "Энэ workspace дотор ийм нэртэй төсөл байна" });
  }

  const project = await prisma.project.create({
    data: {
      name,
      description: description ?? null,
      status: status ?? ProjectStatus.ACTIVE,
      workspaceId,
      members: { create: { userId } },
      history: {
        create: {
          type: "PROJECT_CREATED",
          title: `"${name}" төсөл үүсгэгдлээ`,
          actorId: userId,
        },
      },
    },
    include: projectInclude,
  });
  res.status(201).json(project);
});

projectsRouter.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: {
      workspace: { select: { id: true, name: true } },
      requests: {
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      changes: {
        include: {
          engineer: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { joinedAt: "asc" },
      },
      attachments: {
        include: { uploadedBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { requests: true, changes: true } },
    },
  });
  if (!project) return res.status(404).json({ error: "Төсөл олдсонгүй" });
  if (!(await canAccessProject(project, req.user!.userId))) {
    return res.status(403).json({ error: "Энэ төсөлд хандах эрхгүй байна" });
  }
  res.json(project);
});

const projectMemberSchema = z.object({ email: z.string().email() });

projectsRouter.post(
  "/:id/members",
  requireAuth,
  async (req: AuthRequest, res) => {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });
    if (!project) return res.status(404).json({ error: "Төсөл олдсонгүй" });
    if (!(await canAccessProject(project, req.user!.userId))) {
      return res.status(403).json({ error: "Энэ төсөлд хандах эрхгүй байна" });
    }

    const parsed = projectMemberSchema.safeParse(req.body);
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

    const already = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: project.id, userId: user.id } },
    });
    if (already)
      return res.status(409).json({ error: "Аль хэдийн гишүүн байна" });

    const member = await prisma.projectMember.create({
      data: { projectId: project.id, userId: user.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    await prisma.projectHistory.create({
      data: {
        type: "MEMBER_ADDED",
        title: `${user.name} төсөлд нэмэгдлээ`,
        projectId: project.id,
        actorId: req.user!.userId,
      },
    });
    res.status(201).json(member);
  },
);

projectsRouter.post(
  "/:id/attachments",
  requireAuth,
  upload.single("file"),
  async (req: AuthRequest, res) => {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });
    if (!project || !(await canAccessProject(project, req.user!.userId))) {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {}
      }
      if (!project) return res.status(404).json({ error: "Төсөл олдсонгүй" });
      return res.status(403).json({ error: "Энэ төсөлд хандах эрхгүй байна" });
    }
    if (!req.file) return res.status(400).json({ error: "Файл алга" });

    const att = await prisma.attachment.create({
      data: {
        filename: decodeFilename(req.file.originalname),
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        projectId: project.id,
        uploadedById: req.user!.userId,
      },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });
    await prisma.projectHistory.create({
      data: {
        type: "FILE_UPLOADED",
        title: `"${att.filename}" файл нэмэгдлээ`,
        projectId: project.id,
        actorId: req.user!.userId,
      },
    });
    res.status(201).json(att);
  },
);

projectsRouter.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const existing = await prisma.project.findUnique({
    where: { id: req.params.id },
  });
  if (!existing) return res.status(404).json({ error: "Төсөл олдсонгүй" });
  if (!(await canAccessProject(existing, req.user!.userId))) {
    return res.status(403).json({ error: "Энэ төсөлд хандах эрхгүй байна" });
  }

  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: parsed.data,
    include: projectInclude,
  });
  res.json(project);
});

projectsRouter.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: { attachments: { select: { storedName: true } } },
  });
  if (!project) return res.status(404).json({ error: "Төсөл олдсонгүй" });
  if (!(await canAccessProject(project, req.user!.userId))) {
    return res.status(403).json({ error: "Энэ төсөлд хандах эрхгүй байна" });
  }

  for (const att of project.attachments) {
    try {
      fs.unlinkSync(path.join(UPLOAD_DIR, att.storedName));
    } catch {}
  }

  await prisma.project.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
