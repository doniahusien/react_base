import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { XMarkIcon as X, TicketIcon as Ticket } from "@heroicons/react/24/outline";
import { Form } from "../../components/Inputs/Form";
import { BaseTextInput } from "../../components/Inputs/BaseTextInput";
import { Button } from "../../components/UI/Button";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";

interface GenerateCodesModalProps {
  open: boolean;
  onClose: () => void;
  onGenerated: () => void;
}

export function GenerateCodesModal({
  open,
  onClose,
  onGenerated,
}: GenerateCodesModalProps) {
  const { t } = useTranslation();
  const [count, setCount] = useState("10");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setCount("10");
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    const n = Number(count);
    if (!Number.isInteger(n) || n < 1 || n > 40) {
      toast.error(
        t("MESSAGES.generateFailed"),
        t("LABELS.codeCountHint")
      );
      return;
    }
    try {
      setSaving(true);
      const res = await api.post("codes/generate", { count: n });
      toast.success(t("MESSAGES.generatedSuccess"), res.data?.message);
      onGenerated();
      onClose();
    } catch (e: any) {
      toast.error(t("MESSAGES.generateFailed"), e?.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Ticket width={16} height={16} />
            </span>
            <h3 className="text-base font-semibold text-foreground">
              {t("TITLES.generateCodes")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X width={16} height={16} />
          </button>
        </div>

        <Form values={{ count }} onSubmit={submit} className="space-y-4 p-5">
          {({ field, touch, errors }) => (
            <>
              <BaseTextInput
                name="count"
                type="number"
                label={`${t("TITLES.count")} *`}
                placeholder="1–40"
                value={count}
                onInput={(v) => {
                  setCount(v);
                  touch("count");
                }}
                {...field("count", errors)}
              />
              <p className="text-xs text-muted-foreground">
                {t("LABELS.codeCountHint")}
              </p>
              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="soft"
                  className="flex-1"
                  onClick={onClose}
                >
                  {t("BUTTONS.cancel")}
                </Button>
                <Button type="submit" className="flex-1" loading={saving}>
                  {t("ACTIONS.generate")}
                </Button>
              </div>
            </>
          )}
        </Form>
      </div>
    </div>
  );
}
