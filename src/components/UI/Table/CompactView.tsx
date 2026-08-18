import { EyeIcon as Eye, PhoneIcon as Phone } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { EmptyState } from "../EmptyState";
import { dig } from "./utils";
import type { CompactViewProps } from "./types";

export function CompactView<T extends { id?: any }>({
  table,
  selectedColumns,
  loading,
  rows,
  renderCell,
  onQuickView,
}: CompactViewProps<T>) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="flex min-h-15 items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2">
            <div className="skeleton-item size-4 rounded" />
            <div className="skeleton-item h-5 w-8 rounded-md" />
            <div className="skeleton-item size-10 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2"><div className="skeleton-item h-3 w-24 rounded-full" /><div className="skeleton-item h-2.5 w-36 rounded-full" /></div>
            <div className="skeleton-item size-8 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (rows.length === 0) return <EmptyState />;

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
      {table.getRowModel().rows.map((row) => {
        const item = row.original;
        const record = item as Record<string, unknown>;
        const selected = row.getIsSelected();
        const contentColumns = selectedColumns.filter(
          (column) => !["quick_view", "actions", "select"].includes(column.field)
        );
        const mediaColumn = contentColumns.find((column) => /image|avatar|photo|flag|logo/i.test(column.field));
        const identityColumn =
          contentColumns.find((column) => /^(name|title|full_name)$/i.test(column.field)) ??
          contentColumns.find((column) => column.field !== mediaColumn?.field) ??
          contentColumns[0];
        const identityColumns = [mediaColumn, identityColumn].reduce((columns, column) => {
          if (column && !columns.some((candidate) => candidate.field === column.field)) columns.push(column);
          return columns;
        }, [] as typeof contentColumns);
        const detailColumns = contentColumns.filter(
          (column) => !identityColumns.some((identity) => identity.field === column.field)
        );
        const emailColumn = detailColumns.find((column) => /email/i.test(column.field));
        const summaryColumn = emailColumn ?? detailColumns.find((column) => column.field !== "status");
        const roleSource = record.role ?? record.user_role;
        const roleLabel =
          typeof roleSource === "string"
            ? roleSource
            : typeof roleSource === "object" && roleSource !== null && typeof (roleSource as { name?: unknown }).name === "string"
              ? (roleSource as { name: string }).name
              : null;
        const phone = typeof record.phone === "string" && record.phone ? `${record.phone_code ?? ""} ${record.phone}`.trim() : null;
        const hasActions = selectedColumns.some((column) => column.field === "actions");
        const canQuickView = selectedColumns.some((column) => column.field === "quick_view");

        return (
          <article
            key={row.id}
            className={`group flex min-h-15 items-center gap-2.5 rounded-lg border px-3 py-2 transition-all duration-200 hover:-translate-y-px hover:border-primary/40 hover:shadow-sm ${
              selected ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card"
            }`}
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={row.getToggleSelectedHandler()}
              className="size-4 shrink-0 cursor-pointer rounded border-border accent-primary"
              aria-label={`${t("ACTIONS.select")} #${item.id}`}
            />

            <span className="hidden shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground sm:inline">
              #{item.id}
            </span>

            <div className="flex min-w-0 max-w-45 flex-1 items-center gap-2 sm:max-w-55">
              {identityColumns.map((column) => (
                <div key={column.field} className={column.field === mediaColumn?.field ? "shrink-0" : "min-w-0"}>
                  {renderCell
                    ? renderCell(column.field, item, row.index)
                    : <span className="line-clamp-1 text-sm font-semibold text-foreground">{String(dig(item, column.field) ?? "—")}</span>}
                </div>
              ))}
            </div>

            <div className="hidden min-w-0 flex-1 items-center gap-2 text-xs text-muted-foreground md:flex [&_a]:text-muted-foreground [&_a:hover]:text-primary [&_svg]:size-3">
              {roleLabel && (
                <span className="shrink-0 rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  {roleLabel}
                </span>
              )}
              {summaryColumn && (
                <div className="min-w-0 truncate">
                  {renderCell
                    ? renderCell(summaryColumn.field, item, row.index)
                    : <span className="line-clamp-1">{String(dig(item, summaryColumn.field) ?? "—")}</span>}
                </div>
              )}
            </div>

            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="hidden size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex"
                aria-label={phone}
              >
                <Phone width={14} height={14} />
              </a>
            )}

            {canQuickView && (
              <button
                type="button"
                onClick={() => onQuickView(item)}
                className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={t("TITLES.quick_view")}
              >
                <Eye width={14} height={14} />
              </button>
            )}

            {hasActions && renderCell && (
              <div className="shrink-0 [&_button]:size-7 [&_button]:rounded-md [&_button]:border-transparent [&_button]:bg-transparent [&_button]:shadow-none [&_button]:hover:bg-muted [&_button]:hover:text-foreground">
                {renderCell("actions", item, row.index)}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
