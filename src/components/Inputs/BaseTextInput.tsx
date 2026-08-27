import { useState, useId } from "react";
import type { ReactNode, ComponentType, ChangeEvent } from "react";
import { EyeIcon as Eye, EyeSlashIcon as EyeOff } from "@heroicons/react/24/outline";

interface BaseTextInputProps {
  name?: string;
  label?: ReactNode;
  placeholder?: string;
  type?: "text" | "email" | "password" | "textarea" | "number" | "url";
  value?: string | number | null;
  onInput?: (value: string) => void;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  required?: boolean;
  prependInputIcon?: ComponentType<any>;
  appendInputIcon?: ComponentType<any>;
  className?: string;
}

export function BaseTextInput({
  name,
  label,
  placeholder,
  type = "text",
  value = "",
  onInput,
  onChange,
  error,
  touched = false,
  disabled = false,
  required = false,
  prependInputIcon: PrependIcon,
  appendInputIcon: AppendIcon,
  className,
}: BaseTextInputProps) {
  const uid = useId();
  const id = name ? `${uid}-${name}` : uid;
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState(false);
  const hasError = touched && !!error;
  const inputType = type === "password" ? (showPass ? "text" : "password") : type;

  const displayValue = value === null || value === undefined ? "" : String(value);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onInput?.(e.target.value);
    onChange?.(e);
  };

  const inputCls = [
    "block w-full bg-transparent text-sm text-foreground outline-none transition-all duration-200",
    "disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground",
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
      ? "bg-card border-primary shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
      : "bg-card border-border hover:border-primary/40",
  ]
    .filter(Boolean)
    .join(" ");

  const labelCls = [
    "block mb-1.5 text-sm font-medium select-none",
    hasError ? "text-destructive" : "text-foreground",
  ].join(" ");

  return (
    <div className={`space-y-1 ${className || ""}`}>
      {label && (
        <label htmlFor={id} className={labelCls}>
          {label}
          {required && <span className="text-destructive ms-1">*</span>}
        </label>
      )}
      <div className={wrapperCls}>
        {PrependIcon && (
          <span className="pointer-events-none absolute inset-y-0 inset-s-0 flex w-11 items-center justify-center">
            <PrependIcon
              width={15}
              height={15}
              className={hasError ? "text-destructive" : focused ? "text-primary" : "text-muted-foreground"}
            />
          </span>
        )}

        {type === "textarea" ? (
          <textarea
            id={id}
            name={name}
            placeholder={placeholder}
            value={displayValue}
            onChange={handleChange}
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
            value={displayValue}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            autoComplete="off"
            className={inputCls}
          />
        )}

        {AppendIcon && type !== "password" && (
          <span className="pointer-events-none absolute inset-y-0 inset-e-0 flex w-11 items-center justify-center">
            <AppendIcon
              width={15}
              height={15}
              className={hasError ? "text-destructive" : "text-muted-foreground"}
            />
          </span>
        )}

        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute inset-y-0 inset-e-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle password visibility"
          >
            {showPass ? <EyeOff width={15} height={15} /> : <Eye width={15} height={15} />}
          </button>
        )}
      </div>

      {hasError && (
        <p className="flex items-center gap-1.5 px-1 text-xs text-destructive">
          <span className="inline-block h-1 w-1 rounded-full bg-destructive shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
