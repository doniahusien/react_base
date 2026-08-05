export function SkeletonRow({ cols }: { cols: number }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl px-5 py-4">
      <div className="skeleton-item h-4 w-4 shrink-0 rounded-md" />
      {Array.from({ length: cols }).map((_, i) => (
        <div
          key={i}
          className="skeleton-item h-3.5 rounded-full"
          style={{ width: `${40 + (i % 4) * 14}%`, flex: 1 }}
        />
      ))}
    </div>
  );
}
