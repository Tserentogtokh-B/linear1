import { Navigate } from "react-router-dom";
import { useWorkspace } from "../components/Layout";
import "./style/Home.css";

// Эхлэл — workspace-тай бол эхнийх рүү, үгүй бол үүсгэх рүү
export default function Home() {
  const { workspaces } = useWorkspace();

  if (workspaces?.length > 0) {
    return <Navigate to={`/workspaces/${workspaces[0].id}`} replace />;
  }

  return <Navigate to="/workspaces/new" replace />;
}
