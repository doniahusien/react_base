import { useState } from "react";
import type { ReactNode } from "react";
import { TrashIcon as Trash } from "@heroicons/react/24/outline";
import { Button } from "../UI/Button";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";
import { useTranslation } from "react-i18next";

interface DeleterProps {
  url?: string;
  method?: string;
  body?: any;
  disabled?: boolean;
  text?: ReactNode;
  onReload?: () => void;
  onRemove?: () => void;
}

export function Deleter({
  url,
  method = "DELETE",
  body,
  disabled,
  text,
  onReload,
  onRemove,
}: DeleterProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (url) {
      setLoading(true);
      try {
        const res = await api({ url, method, data: body ?? undefined });
        toast.success(t("MESSAGES.deletedSuccess"), res.data?.message);
        onReload?.();
      } catch (err: any) {
        toast.error(t("MESSAGES.deletedFailed"), err?.response?.data?.message);
      } finally {
        setLoading(false);
      }
    } else {
      onRemove?.();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setVisible(true)}
        disabled={loading || disabled}
        className="group relative flex w-full items-center gap-2.5 overflow-hidden rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="absolute inset-0 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-200 bg-linear-to-r from-destructive/10 to-transparent rounded-xl" />
        <span className="relative flex size-6 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-destructive/20 to-destructive/10 text-destructive shadow-sm shadow-destructive/10 group-hover:shadow-destructive/30 group-hover:from-destructive/30 transition-all">
          <Trash width={12} height={12} />
        </span>
        {text !== undefined ? (
          <span className="relative">{text}</span>
        ) : (
          <span className="relative">{t("BUTTONS.delete")}</span>
        )}
      </button>
      {visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setVisible(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-border bg-background p-6 shadow-2xl shadow-foreground/20">
            <h3 className="text-base font-semibold text-foreground mb-2">
              {t("TITLES.confirmDelete")}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {t("MESSAGES.confirmDelete")}
            </p>
            <div className="flex items-center gap-3">
              <Button
                reverse
                className="flex-1 max-w-full"
                onClick={() => setVisible(false)}
              >
                {t("BUTTONS.cancel")}
              </Button>
              <Button
                className="flex-1 max-w-full !bg-destructive hover:!bg-destructive/90 text-destructive-foreground"
                loading={loading}
                onClick={() => {
                  submit();
                  setVisible(false);
                }}
              >
                {t("BUTTONS.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Deleter;
