import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Inbox from "./pages/Inbox";
import MyRequests from "./pages/MyRequests";
import View from "./pages/View";
import CreateWorkspace from "./pages/CreateWorkspace";
import WorkspaceBoard from "./pages/WorkspaceBoard";
import ProjectBoard from "./pages/ProjectBoard";
import RequestDetail from "./pages/RequestDetail";
import Invite from "./pages/Invite";

export default function App() {
  const { token } = useAuth();

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="/views" element={<View />} />

        {/* Workspaces */}
        <Route path="/workspaces/new" element={<CreateWorkspace />} />
        <Route path="/workspaces/:workspaceId" element={<WorkspaceBoard />} />
        <Route path="/workspaces/:workspaceId/invite" element={<Invite />} />
        <Route
          path="/workspaces/:workspaceId/projects/:projectId"
          element={<ProjectBoard />}
        />

        {/* Requests */}
        <Route
          path="/projects/:projectId/requests/:requestId"
          element={<RequestDetail />}
        />

        <Route path="/invite" element={<Invite />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
