import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { usersRouter } from "./routes/users";
import { workspacesRouter } from "./routes/workspaces";
import { projectsRouter } from "./routes/projects";
import { requestsRouter } from "./routes/requests";
import { changesRouter } from "./routes/changes";
import { historyRouter } from "./routes/history";
import { attachmentsRouter } from "./routes/attachments";
import { notificationsRouter } from "./routes/notifications";
import { searchRouter } from "./routes/search";

const app = express();

app.use(cors());
app.use(express.json());

app.set("json replacer", (_key: string, value: unknown) =>
  typeof value === "bigint" ? Number(value) : value,
);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/workspaces", workspacesRouter);
app.use("/projects", projectsRouter);
app.use("/requests", requestsRouter);
app.use("/changes", changesRouter);
app.use("/history", historyRouter);
app.use("/attachments", attachmentsRouter);
app.use("/notifications", notificationsRouter);
app.use("/search", searchRouter);

const PORT = Number(process.env.PORT) || 60000;
app.listen(PORT, () => {
  console.log(`Server ажиллаж байна: http://localhost:${PORT}`);
});
