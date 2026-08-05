import { XMarkIcon as X } from "@heroicons/react/24/outline";
import type { QuickViewModalProps } from "./types";

export function QuickViewModal<T extends { id?: any }>({
  item,
  onClose,
  renderQuickView,
}: QuickViewModalProps<T>) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-background/70! backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-card border border-border shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">Quick View</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Record details</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-2xl text-muted-foreground hover:bg-muted border border-border transition-all"
            aria-label="Close"
          >
            <X width={14} height={14} />
          </button>
        </div>
        <div className="h-px bg-border mx-6" />
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {renderQuickView ? renderQuickView(item) : (
            <div className="space-y-3">
              {Object.entries(item as Record<string, any>).map(([k, v]) => (
                <div key={k} className="flex gap-4 text-sm">
                  <span className="w-28 shrink-0 font-semibold text-foreground">{k}</span>
                  <span className="text-muted-foreground break-all">
                    {typeof v === "object" && v !== null ? JSON.stringify(v) : String(v ?? "—")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
