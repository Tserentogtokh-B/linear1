// ---- Enums (schema.prisma-тай тааруулсан) ----
export type MemberRole = "ADMIN" | "CLIENT" | "ENGINEER";

export type ProjectStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELED";

export type RequestStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED"
  | "CANCELED";

export type RequestPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type ChangeType =
  | "NOTE"
  | "FILE"
  | "CODE"
  | "DESIGN"
  | "DEPLOYMENT"
  | "STATUS_UPDATE";

export type HistoryType =
  | "PROJECT_CREATED"
  | "MEMBER_ADDED"
  | "REQUEST_CREATED"
  | "REQUEST_UPDATED"
  | "REQUEST_RESOLVED"
  | "CHANGE_ADDED"
  | "FILE_UPLOADED"
  | "COMMENT_ADDED";

export type NotificationType =
  | "REQUEST_CREATED"
  | "REQUEST_UPDATED"
  | "REQUEST_RESOLVED"
  | "CHANGE_ADDED"
  | "MEMBER_ADDED"
  | "COMMENT_ADDED";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
  uploadedById: string;
  uploadedBy: { id: string; name: string };
}

// ---- Workspace ----
export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  _count?: { members: number; projects: number };
}

export interface WorkspaceMember {
  id: string;
  role: MemberRole;
  joinedAt: string;
  user: User;
}

export interface WorkspaceDetail extends Workspace {
  owner: User;
  members: WorkspaceMember[];
  projects: Project[];
}

// ---- Project ----
export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  workspaceId: string;
  createdAt: string;
  workspace?: { id: string; name: string } | null;
  _count?: { requests: number; changes: number };
}

export interface ProjectMember {
  id: string;
  joinedAt: string;
  user: User;
}

// Төслийн дэлгэрэнгүй — хүсэлт, өөрчлөлт, гишүүд, файлуудтай
export interface ProjectDetail extends Project {
  requests: ProjectRequest[];
  changes: ProjectChange[];
  members: ProjectMember[];
  attachments: Attachment[];
}

// ---- Request (хуучин Task/issue) ----
export interface ProjectRequest {
  id: string;
  title: string;
  description: string | null;
  status: RequestStatus;
  priority: RequestPriority;
  projectId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; name: string; workspaceId: string } | null;
  createdBy?: User;
  attachments?: Attachment[];
  changes?: ProjectChange[];
}

// ---- Change (хуучин Comment + инженерийн ажлын бичлэг) ----
export interface ProjectChange {
  id: string;
  title: string;
  description: string | null;
  type: ChangeType;
  projectId: string;
  requestId: string | null;
  engineerId: string;
  createdAt: string;
  updatedAt: string;
  engineer?: User;
  request?: { id: string; title: string } | null;
  attachments?: Attachment[];
}

// ---- History ----
export interface ProjectHistory {
  id: string;
  type: HistoryType;
  title: string;
  description: string | null;
  createdAt: string;
  projectId: string;
  actor: { id: string; name: string } | null;
  request: { id: string; title: string } | null;
  change: { id: string; title: string } | null;
}

// ---- Notification ----
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
  projectId: string | null;
  requestId: string | null;
  project: { id: string; name: string } | null;
  request: { id: string; title: string } | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ---- Глобал хайлтын үр дүн ----
export interface SearchResults {
  requests: {
    id: string;
    title: string;
    status: RequestStatus;
    priority: RequestPriority;
    projectId: string;
    project: { id: string; name: string };
  }[];
  projects: {
    id: string;
    name: string;
    status: ProjectStatus;
    workspaceId: string;
    workspace: { id: string; name: string } | null;
  }[];
  workspaces: { id: string; name: string }[];
}
