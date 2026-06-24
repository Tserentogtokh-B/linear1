import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import { getRecentViews, RecentItem } from "../utils/recentViews";
import "./style/View.css";

export default function View() {
  const navigate = useNavigate();
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    setItems(getRecentViews().slice(0, 5));
  }, []);

  return (
    <>
      <Topbar crumbs={[{ label: "Сүүлд харсан", icon: "▦" }]} />
      <div className="main-scroll">
        <div className="page recent-views-page">
          <div className="page-head">
            <div className="page-title">
              <h1>Сүүлд харсан</h1>
            </div>
          </div>
          <p className="muted" style={{ marginTop: -8 }}>
            Хамгийн сүүлд нээж харсан 5 хүсэлт эсвэл төсөл.
          </p>

          {items.length === 0 ? (
            <p className="empty" style={{ marginTop: 16 }}>
              Сүүлд харсан зүйл алга. Хүсэлт эсвэл төсөл нээгээрэй.
            </p>
          ) : (
            <ul className="issue-rows" style={{ marginTop: 12 }}>
              {items.map((item) => (
                <li
                  key={`${item.kind}-${item.id}`}
                  className="issue-row"
                  onClick={() => navigate(item.to)}
                >
                  <span className="ir-priority">
                    {item.kind === "request" ? "≡" : "⬡"}
                  </span>
                  {item.subtitle && (
                    <span className="ir-id">{item.subtitle}</span>
                  )}
                  <span className="ir-title">{item.title}</span>
                  <span className="ir-meta muted">
                    {item.kind === "request" ? "Хүсэлт" : "Төсөл"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
