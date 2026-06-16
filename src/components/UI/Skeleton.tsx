import { useMemo } from "react";

interface Field { labelWidth?: string; }
interface Section { fields: Field[]; }
interface SkeletonProps {
  showImageSection?: boolean;
  showSectionHeaders?: boolean;
  showActions?: boolean;
  sections?: Section[];
  gridCols?: string;
  actionButtons?: { width?: string }[];
}

export function Skeleton({ showImageSection = true, showSectionHeaders = true, showActions = true, sections, gridCols = "md:grid-cols-2", actionButtons }: SkeletonProps) {
  const secs = useMemo(() => sections || [
    { fields: [{ labelWidth: "25%" }, { labelWidth: "25%" }, { labelWidth: "25%" }] },
    { fields: [{ labelWidth: "25%" }, { labelWidth: "25%" }] },
    { fields: [{ labelWidth: "25%" }] },
  ], [sections]);
  const actions = actionButtons || [{ width: "100px" }, { width: "100px" }];

  return (
    <div className="border border-border rounded-lg">
      {showImageSection && (
        <div className="p-6 border-b border-border">
          <div className="max-w-xs">
            <div className="mb-1"><div className="skeleton-item h-4" style={{ width: "20%" }} /></div>
            <div className="skeleton-item h-32 w-full rounded-xl" />
          </div>
        </div>
      )}
      {secs.map((section, si) => (
        <div key={si} className={`p-6 ${si < secs.length - 1 ? "border-b border-border" : ""}`}>
          {showSectionHeaders && (
            <div className="flex items-center gap-3 mb-6">
              <div className="skeleton-item h-9 w-9 rounded-lg" />
              <div className="skeleton-item h-6" style={{ width: "40%" }} />
            </div>
          )}
          <div className={`grid gap-6 grid-cols-1 ${gridCols}`}>
            {section.fields.map((field, i) => (
              <div key={i}>
                <div className="mb-1"><div className="skeleton-item h-4" style={{ width: field.labelWidth || "30%" }} /></div>
                <div className="skeleton-item h-12 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      ))}
      {showActions && (
        <div className="px-6 py-4 border-t border-border">
          <div className="flex items-center justify-end gap-3">
            {actions.map((btn, i) => (
              <div key={i} className="skeleton-item h-12 rounded-md" style={{ width: btn.width || "100px" }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Skeleton;
