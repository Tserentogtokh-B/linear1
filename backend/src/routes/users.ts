import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";

export const usersRouter = Router();
usersRouter.get("/", requireAuth, async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
  res.json(users);
});
