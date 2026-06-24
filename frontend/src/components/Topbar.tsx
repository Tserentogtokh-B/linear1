import { ReactNode } from "react";
import { Link } from "react-router-dom";

export interface Crumb {
  label: ReactNode;
  to?: string;
  icon?: ReactNode;
}
export default function Topbar({
  crumbs,
  actions,
}: {
  crumbs: Crumb[];
  actions?: ReactNode;
}) {
  return (
    <div className="topbar">
      <div className="crumb">
        {crumbs.map((c, i) => (
          <span key={i} className="crumb">
            {i > 0 && <span className="sep">›</span>}
            {c.icon && <span className="ico">{c.icon}</span>}
            {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
          </span>
        ))}
      </div>
      <div className="topbar-spacer" />
      {actions}
    </div>
  );
}
