import Skeleton from "../Skeleton/Skeleton";
import "./DashboardSkeleton.css";

// Mirrors the dashboard layout (greeting, total, 3 accounts, 8 transactions)
// so nothing jumps when the data arrives (brief D1).
const accountCount = 3;
const transactionCount = 8;

export default function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton" role="status" aria-busy="true">
      <span className="visually-hidden">Loading your dashboard…</span>

      <Skeleton width="xl" height="2xl" />

      <div className="dashboard-skeleton__hero">
        <Skeleton width="md" height="sm" />
        <Skeleton width="xl" height="3xl" />
        <Skeleton width="lg" height="sm" />
      </div>

      <div className="dashboard-skeleton__accounts">
        {Array.from({ length: accountCount }, (_, i) => (
          <div key={i} className="dashboard-skeleton__card">
            <Skeleton width="sm" height="base" />
            <Skeleton width="xs" height="sm" />
            <Skeleton width="md" height="xl" />
          </div>
        ))}
      </div>

      <div className="dashboard-skeleton__card">
        <Skeleton width="lg" height="lg" />
        <ul className="dashboard-skeleton__list">
          {Array.from({ length: transactionCount }, (_, i) => (
            <li key={i} className="dashboard-skeleton__row">
              <div className="dashboard-skeleton__row-text">
                <Skeleton width="md" height="base" />
                <Skeleton width="sm" height="sm" />
              </div>
              <Skeleton width="sm" height="base" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
