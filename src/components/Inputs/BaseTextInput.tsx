import { useState, useId } from "react";
import type { ReactNode, ComponentType } from "react";
import { Eye, EyeOff } from "lucide-react";

interface BaseTextInputProps {
  name: string;
  label?: ReactNode;
  placeholder?: string;
  type?: "text" | "email" | "password" | "textarea" | "number";
  value?: string | number;
  onInput?: (value: string) => void;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  prependInputIcon?: ComponentType<any>;
  appendInputIcon?: ComponentType<any>;
}

export function BaseTextInput({
  name,
  label,
  placeholder,
  type = "text",
  value = "",
  onInput,
  error,
  touched = false,
  disabled = false,
  prependInputIcon: PrependIcon,
  appendInputIcon: AppendIcon,
}: BaseTextInputProps) {
  const uid = useId();
  const id = `${uid}-${name}`;
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState(false);
  const hasError = touched && !!error;
  const inputType = type === "password" ? (showPass ? "text" : "password") : type;

  const inputCls = [
    "block w-full bg-transparent text-sm text-text outline-none transition-all duration-200",
    "disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted",
    type === "textarea" ? "resize-none min-h-[80px] py-2.5 px-4" : "h-11 py-0 px-4",
    PrependIcon ? "ps-11" : "",
    AppendIcon || type === "password" ? "pe-11" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const wrapperCls = [
    "relative rounded-xl border overflow-hidden transition-all duration-200",
    disabled ? "opacity-50 cursor-not-allowed" : "",
    hasError
      ? "bg-destructive/10 dark:bg-destructive/20 border-destructive"
      : focused
      ? "bg-panel border-primary shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
      : "bg-panel border-border hover:border-primary/40",
  ]
    .filter(Boolean)
    .join(" ");

  const labelCls = [
    "block mb-1.5 text-sm font-medium select-none",
    hasError ? "text-red-500" : "text-text",
  ].join(" ");

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className={labelCls}>
          {label}
        </label>
      )}
      <div className={wrapperCls}>
        {PrependIcon && (
          <span className="pointer-events-none absolute inset-y-0 inset-s-0 flex w-11 items-center justify-center">
            <PrependIcon
              size={15}
              className={hasError ? "text-red-400" : focused ? "text-primary" : "text-muted"}
            />
          </span>
        )}

        {type === "textarea" ? (
          <textarea
            id={id}
            name={name}
            placeholder={placeholder}
            value={String(value)}
            onChange={(e) => onInput?.(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            autoComplete="off"
            className={inputCls}
          />
        ) : (
          <input
            id={id}
            name={name}
            type={inputType as any}
            placeholder={placeholder}
            value={String(value)}
            onChange={(e) => onInput?.(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            autoComplete="off"
            className={inputCls}
          />
        )}

        {AppendIcon && type !== "password" && (
          <span className="pointer-events-none absolute inset-y-0 inset-e-0 flex w-11 items-center justify-center">
            <AppendIcon size={15} className={hasError ? "text-red-400" : "text-muted"} />
          </span>
        )}

        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute inset-y-0 inset-e-0 flex w-11 items-center justify-center text-muted hover:text-text transition-colors"
            aria-label="Toggle password visibility"
          >
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>

      {hasError && (
        <p className="flex items-center gap-1.5 px-1 text-xs text-red-500">
          <span className="inline-block h-1 w-1 rounded-full bg-red-500 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
