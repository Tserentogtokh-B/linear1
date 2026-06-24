import { api } from "../../api";
import { ProjectRequest, RequestPriority, RequestStatus } from "../../types";
import {
  PriorityIcon,
  StatusIcon,
  PRIORITY_META,
  STATUS_META,
  STATUS_ORDER,
} from "../Icons";

const PRIORITIES: RequestPriority[] = ["URGENT", "HIGH", "MEDIUM", "LOW"];

export default function RequestProperties({
  request,
  onPatch,
}: {
  request: ProjectRequest;
  onPatch: (data: Parameters<typeof api.updateRequest>[1]) => void;
}) {
  return (
    <aside className="props">
      <div className="props-group">
        <h4>Properties</h4>

        <div className="prop-row" style={{ padding: 0 }}>
          <span className="pico">
            <StatusIcon status={request.status} />
          </span>
          <select
            className="prop-select"
            value={request.status}
            onChange={(e) => onPatch({ status: e.target.value as RequestStatus })}
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>

        <div className="prop-row" style={{ padding: 0 }}>
          <span className="pico">
            <PriorityIcon priority={request.priority} />
          </span>
          <select
            className="prop-select"
            value={request.priority}
            onChange={(e) =>
              onPatch({ priority: e.target.value as RequestPriority })
            }
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_META[p].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="props-group">
        <h4>Project</h4>
        <span className="type-badge">{request.project?.name ?? "—"}</span>
      </div>

      {request.createdBy && (
        <div className="props-group">
          <h4>Үүсгэсэн</h4>
          <span className="type-badge">{request.createdBy.name}</span>
        </div>
      )}
    </aside>
  );
}
