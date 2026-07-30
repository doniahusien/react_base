import { Inbox } from "lucide-react";

interface EmptyStateProps { title?: string; description?: string; }

export function EmptyState({ title = "No data found", description = "There are no records to display." }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full  ">
        <Inbox size={30} className="text-muted" />
      </div>
      <div>
        <p className="text-base font-semibold text-text">{title}</p>
        <p className="text-sm text-muted mt-1">{description}</p>
      </div>
    </div>
  );
}
