import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

export const notificationsRouter = Router();

const notifInclude = {
  project: { select: { id: true, name: true } },
  request: { select: { id: true, title: true } },
};

notificationsRouter.get("/", requireAuth, async (req: AuthRequest, res) => {
  const items = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    include: notifInclude,
    orderBy: { createdAt: "desc" },
  });
  res.json(items);
});

notificationsRouter.get(
  "/unread-count",
  requireAuth,
  async (req: AuthRequest, res) => {
    const count = await prisma.notification.count({
      where: { userId: req.user!.userId, read: false },
    });
    res.json({ count });
  },
);

notificationsRouter.patch(
  "/:id/read",
  requireAuth,
  async (req: AuthRequest, res) => {
    const notif = await prisma.notification.findUnique({
      where: { id: req.params.id },
    });
    if (!notif || notif.userId !== req.user!.userId) {
      return res.status(404).json({ error: "Мэдэгдэл олдсонгүй" });
    }
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.status(204).send();
  },
);

notificationsRouter.post(
  "/read-all",
  requireAuth,
  async (req: AuthRequest, res) => {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, read: false },
      data: { read: true },
    });
    res.status(204).send();
  },
);
