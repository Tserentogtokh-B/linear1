import {
  Attachment,
  AuthResponse,
  Notification,
  Project,
  ProjectChange,
  ProjectDetail,
  ProjectHistory,
  ProjectRequest,
  ProjectStatus,
  RequestPriority,
  RequestStatus,
  SearchResults,
  User,
  Workspace,
  WorkspaceDetail,
  WorkspaceMember,
  MemberRole,
  ChangeType,
} from "./types";

const BASE = import.meta.env.VITE_API_URL || "/api";

export function getToken(): string | null {
  return localStorage.getItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = typeof body.error === "string" ? body.error : "Алдаа гарлаа";
    throw new Error(msg);
  }
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

// FormData-аар файл байршуулах ерөнхий туслах (Content-Type-ийг гар аар тавихгүй)
async function uploadTo(path: string, file: File): Promise<Attachment> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: fd,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      typeof body.error === "string" ? body.error : "Файл оруулж чадсангүй",
    );
  }
  return res.json() as Promise<Attachment>;
}

// Файл татах — token-той fetch хийгээд browser-ийн татах үйлдлийг өдөөнө
async function downloadAttachment(att: Attachment): Promise<void> {
  const res = await fetch(`${BASE}/attachments/${att.id}`, {
    headers: {
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Файл татаж чадсангүй");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = att.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

interface CreateRequestInput {
  projectId: string;
  title: string;
  description?: string;
  priority?: RequestPriority;
}

interface UpdateRequestInput {
  title?: string;
  description?: string | null;
  status?: RequestStatus;
  priority?: RequestPriority;
}

interface CreateChangeInput {
  projectId: string;
  requestId?: string;
  title: string;
  description?: string;
  type?: ChangeType;
}

interface UpdateChangeInput {
  title?: string;
  description?: string | null;
  type?: ChangeType;
}

export const api = {
  // ---------- Auth ----------
  register: (data: { email: string; name: string; password: string }) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  users: () => request<User[]>("/users"),

  search: (q: string) =>
    request<SearchResults>("/search?q=" + encodeURIComponent(q)),

  // ---------- Workspaces ----------
  workspaces: () => request<Workspace[]>("/workspaces"),
  workspace: (id: string) => request<WorkspaceDetail>(`/workspaces/${id}`),
  createWorkspace: (data: { name: string }) =>
    request<Workspace>("/workspaces", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  addWorkspaceMember: (workspaceId: string, email: string, role?: MemberRole) =>
    request<WorkspaceMember>(`/workspaces/${workspaceId}/members`, {
      method: "POST",
      body: JSON.stringify({ email, role }),
    }),
  activateWorkspace: (id: string) =>
    request<null>(`/workspaces/${id}/activate`, { method: "PATCH" }),

  // ---------- Projects ----------
  projects: (workspaceId: string) =>
    request<Project[]>(`/projects?workspace=${encodeURIComponent(workspaceId)}`),
  project: (id: string) => request<ProjectDetail>(`/projects/${id}`),
  createProject: (data: {
    workspaceId: string;
    name: string;
    description?: string | null;
    status?: ProjectStatus;
  }) =>
    request<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProject: (
    id: string,
    data: {
      name?: string;
      description?: string | null;
      status?: ProjectStatus;
    },
  ) =>
    request<Project>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteProject: (id: string) =>
    request<null>(`/projects/${id}`, { method: "DELETE" }),
  addProjectMember: (projectId: string, email: string) =>
    request<ProjectMemberResult>(`/projects/${projectId}/members`, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  uploadProjectAttachment: (projectId: string, file: File) =>
    uploadTo(`/projects/${projectId}/attachments`, file),

  // ---------- Requests (хуучин tasks) ----------
  requests: (query: {
    projectId?: string;
    mine?: boolean;
    status?: RequestStatus;
    q?: string;
  }) => {
    const params = new URLSearchParams();
    if (query.projectId) params.set("project", query.projectId);
    if (query.mine) params.set("mine", "true");
    if (query.status) params.set("status", query.status);
    if (query.q) params.set("q", query.q);
    const qs = params.toString();
    return request<ProjectRequest[]>(`/requests${qs ? `?${qs}` : ""}`);
  },
  request: (id: string) => request<ProjectRequest>(`/requests/${id}`),
  createRequest: (data: CreateRequestInput) =>
    request<ProjectRequest>("/requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateRequest: (id: string, data: UpdateRequestInput) =>
    request<ProjectRequest>(`/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteRequest: (id: string) =>
    request<null>(`/requests/${id}`, { method: "DELETE" }),
  uploadRequestAttachment: (requestId: string, file: File) =>
    uploadTo(`/requests/${requestId}/attachments`, file),

  // ---------- Changes (хуучин comments) ----------
  changes: (query: { projectId?: string; requestId?: string }) => {
    const params = new URLSearchParams();
    if (query.projectId) params.set("project", query.projectId);
    if (query.requestId) params.set("request", query.requestId);
    return request<ProjectChange[]>(`/changes?${params.toString()}`);
  },
  createChange: (data: CreateChangeInput) =>
    request<ProjectChange>("/changes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateChange: (id: string, data: UpdateChangeInput) =>
    request<ProjectChange>(`/changes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteChange: (id: string) =>
    request<null>(`/changes/${id}`, { method: "DELETE" }),
  uploadChangeAttachment: (changeId: string, file: File) =>
    uploadTo(`/changes/${changeId}/attachments`, file),

  // ---------- History ----------
  history: (projectId: string) =>
    request<ProjectHistory[]>(
      `/history?project=${encodeURIComponent(projectId)}`,
    ),

  // ---------- Attachments ----------
  downloadAttachment,
  deleteAttachment: (id: string) =>
    request<null>(`/attachments/${id}`, { method: "DELETE" }),

  // ---------- Notifications ----------
  notifications: () => request<Notification[]>("/notifications"),
  unreadCount: () => request<{ count: number }>("/notifications/unread-count"),
  markRead: (id: string) =>
    request<null>(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () =>
    request<null>("/notifications/read-all", { method: "POST" }),
};

// projects/:id/members хариу — гишүүний бичлэг
interface ProjectMemberResult {
  id: string;
  joinedAt: string;
  user: User;
}
