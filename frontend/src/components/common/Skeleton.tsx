export function Skeleton({
  width,
  height,
  radius,
}: {
  width?: string;
  height?: string;
  radius?: string;
}) {
  return (
    <div className="skeleton" style={{ width, height, borderRadius: radius }} />
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <Skeleton width="40px" height="40px" radius="8px" />
      <div className="skeleton-lines">
        <Skeleton width="60%" height="10px" />
        <Skeleton width="40%" height="16px" />
        <Skeleton width="50%" height="9px" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <td>
                <div className="skeleton-row">
                  <Skeleton width="29px" height="29px" radius="8px" />
                  <div className="skeleton-lines">
                    <Skeleton width="120px" height="10px" />
                    <Skeleton width="80px" height="8px" />
                  </div>
                </div>
              </td>
              <td>
                <Skeleton width="80px" height="10px" />
              </td>
              <td>
                <Skeleton width="60px" height="12px" />
              </td>
              <td>
                <Skeleton width="70px" height="16px" radius="10px" />
              </td>
              <td />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Loader({ label }: { label?: string }) {
  return (
    <div className="loader-wrap">
      <div className="loader-spinner" />
      {label && <p>{label}</p>}
    </div>
  );
}

export function ButtonLoader() {
  return <span className="button-loader" />;
}

export function PageLoader() {
  return (
    <div className="page-loader">
      <div className="loader-spinner large" />
    </div>
  );
}
