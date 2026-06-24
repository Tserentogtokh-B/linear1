import { Router } from "express";
import path from "path";
import fs from "fs";
import { prisma } from "../prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { UPLOAD_DIR } from "../upload";

export const attachmentsRouter = Router();

attachmentsRouter.get("/:id", requireAuth, async (req, res) => {
  const att = await prisma.attachment.findUnique({
    where: { id: req.params.id },
  });
  if (!att) return res.status(404).json({ error: "Файл олдсонгүй" });

  const filePath = path.join(UPLOAD_DIR, att.storedName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Файл диск дээр алга" });
  }
  res.download(filePath, att.filename);
});

attachmentsRouter.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const att = await prisma.attachment.findUnique({
    where: { id: req.params.id },
  });
  if (!att) return res.status(404).json({ error: "Файл олдсонгүй" });

  if (att.uploadedById !== req.user!.userId) {
    return res.status(403).json({ error: "Зөвхөн оруулсан хүн устгах эрхтэй" });
  }

  try {
    fs.unlinkSync(path.join(UPLOAD_DIR, att.storedName));
  } catch {}
  await prisma.attachment.delete({ where: { id: att.id } });
  res.status(204).send();
});
