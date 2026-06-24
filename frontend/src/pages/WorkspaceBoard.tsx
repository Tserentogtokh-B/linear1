import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Topbar from "../components/Topbar";
import ProjectToolbar from "../components/projects/ProjectToolbar";
import ProjectCreateForm from "../components/projects/ProjectCreateForm";
import ProjectCard from "../components/projects/ProjectCard";
import { useProjects, ViewKey } from "../hooks/useProjects";
import { useWorkspace } from "../components/Layout";
import { Project, ProjectStatus } from "../types";
import { STATUS_META, VIEW_OPTIONS } from "../constants/ConstCreateProject";
import "./style/CreateProject.css";

export default function WorkspaceBoard() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { workspaces } = useWorkspace();
  const createFormRef = useRef<HTMLDivElement>(null);

  const {
    projects,
    loading,
    error,
    countRequests,
    createProject,
    deleteProject,
    setStatus,
    rememberProject,
  } = useProjects(workspaceId);

  const [view, setView] = useState<ViewKey>("all");

  const workspace = workspaces.find((w) => w.id === workspaceId);

  const filteredProjects = useMemo(
    () => projects.filter((p) => view === "all" || p.status === view),
    [projects, view],
  );

  function openProject(project: Project) {
    rememberProject(project);
    navigate(`/workspaces/${workspaceId}/projects/${project.id}`);
  }

  function confirmDelete(project: Project) {
    if (confirm(`"${project.name}" төслийг устгах уу?`)) deleteProject(project.id);
  }

  const currentView = VIEW_OPTIONS.find((o) => o.key === view);

  return (
    <>
      <Topbar
        crumbs={[
          { label: workspace?.name ?? "Workspace" },
          { label: "Төслүүд" },
        ]}
        actions={
          <ProjectToolbar
            projects={projects}
            filteredCount={filteredProjects.length}
            view={view}
            onViewChange={setView}
            onCreateClick={() =>
              createFormRef.current?.scrollIntoView({ behavior: "smooth" })
            }
          />
        }
      />

      <div className="main-scroll">
        <div className="page projects-page">
          <div className="page-head">
            <div className="page-title">
              <span className="page-kicker">{workspace?.name}</span>
              <h1>Төслүүд</h1>
            </div>
            <button
              className="link"
              onClick={() => navigate(`/workspaces/${workspaceId}/invite`)}
            >
              Гишүүд / Урих
            </button>
          </div>

          <div className="project-create-layout">
            <ProjectCreateForm ref={createFormRef} onCreate={createProject} />

            <div className="project-list-card">
              <div className="project-list-head">
                <div>
                  <h2>{currentView?.label}</h2>
                  <p className="muted">
                    {view === "all"
                      ? "Бүх төсөл"
                      : `${STATUS_META[view as ProjectStatus].label} төслүүд`}
                  </p>
                </div>
                <span className="project-total">{filteredProjects.length}</span>
              </div>

              {error && <div className="error">{error}</div>}

              {loading ? (
                <p className="muted">Ачааллаж байна…</p>
              ) : filteredProjects.length === 0 ? (
                <div className="empty-card">
                  <div className="empty-ico">⬡</div>
                  <h3>Төсөл алга</h3>
                  <p className="muted">Зүүн талын формоор шинэ төсөл үүсгэнэ үү.</p>
                </div>
              ) : (
                <div className="project-cards">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      requestCount={countRequests(project)}
                      onOpen={openProject}
                      onSetStatus={setStatus}
                      onDelete={confirmDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
