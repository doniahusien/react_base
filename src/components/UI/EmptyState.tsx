import { InboxIcon as Inbox } from "@heroicons/react/24/outline";
import { t } from "i18next";
interface EmptyStateProps { title?: string; description?: string; }

export function EmptyState({ title = t("LABELS.noData"), description = t("LABELS.noRecords") }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Inbox width={30} height={30} className="text-muted-foreground" />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}
