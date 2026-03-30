"use client";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function TableSkeleton({
  rows = 5,
  columns = 5,
}: TableSkeletonProps) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* Header row */}
      <div className="flex gap-4 border-b border-gray-200 bg-gray-50/80 px-4 py-3">
        {Array.from({ length: columns }).map((_, col) => (
          <div key={`header-${col}`} className="flex-1">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Body rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={`row-${row}`}
          className="flex gap-4 border-b border-gray-100 px-4 py-3.5 last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, col) => {
            // Vary widths for realism
            const widths = ["w-full", "w-5/6", "w-2/3", "w-4/5", "w-3/5"];
            const widthClass = widths[(row + col) % widths.length];
            return (
              <div key={`cell-${row}-${col}`} className="flex-1">
                <div
                  className={`h-3 animate-pulse rounded bg-gray-200/80 ${widthClass}`}
                  style={{ animationDelay: `${(row * columns + col) * 60}ms` }}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
