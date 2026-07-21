import { useState } from "react";
import type { ReactNode } from "react";
import type { ZodSchema } from "zod";
import { validateSchema } from "../../lib/validation";

export interface FormCtx {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  field: (name: string, errors: Record<string, string>) => { error: string; touched: boolean };
  touch: (name: string) => void;
}

interface FormProps {
  schema?: ZodSchema<any>;
  values: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  children: (ctx: FormCtx) => ReactNode;
  className?: string;
}

export function Form({ schema, values, onSubmit, children, className }: FormProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = schema ? validateSchema(values, schema) : {};

  const touch = (name: string) => setTouched((p) => ({ ...p, [name]: true }));

  const field = (name: string, errs: Record<string, string>) => ({
    error: errs[name] ?? "",
    touched: touched[name] ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schema) { onSubmit(values); return; }

    // Touch all fields to reveal errors
    const allErrors = validateSchema(values, schema);
    const allTouched = Object.keys(allErrors).reduce<Record<string, boolean>>(
      (acc, k) => ({ ...acc, [k]: true }),
      {}
    );
    setTouched(allTouched);

    if (Object.keys(allErrors).length > 0) return;
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={className}>
      {children({ errors, touched, field, touch })}
    </form>
  );
}
