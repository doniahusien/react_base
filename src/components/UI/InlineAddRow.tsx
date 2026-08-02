import { useState } from "react";
import { Plus, Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface InlineAddRowProps {
  fields: Array<{
    key: string;
    label: string;
    type: "text" | "number" | "file";
    placeholder?: string;
    required?: boolean;
  }>;
  onSave: (data: Record<string, any>) => Promise<void>;
  onCancel?: () => void;
}

export function InlineAddRow({ fields, onSave, onCancel }: InlineAddRowProps) {
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleStart = () => {
    setIsAdding(true);
    setFormData({});
    setErrors({});
  };

  const handleCancel = () => {
    setIsAdding(false);
    setFormData({});
    setErrors({});
    onCancel?.();
  };

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      if (field.required && !formData[field.key]) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      await onSave(formData);
      setIsAdding(false);
      setFormData({});
      setErrors({});
    } catch (error: any) {
      console.error("Save error:", error);
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        type="button"
        onClick={handleStart}
        className="group flex items-center gap-3 w-full px-5 py-4 rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all duration-300"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary group-hover:scale-110 group-hover:rotate-90 transition-all duration-300">
          <Plus size={20} />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {t("BUTTONS.add")} Quick Add
          </p>
          <p className="text-xs text-muted-foreground">
            Add a new row directly in the table
          </p>
        </div>
      </button>
    );
  }

  return (
    <div className="relative rounded-2xl border-2 border-primary bg-gradient-to-r from-primary/5 to-transparent p-5 space-y-4 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-foreground">
            <Plus size={16} />
          </div>
          <h3 className="text-sm font-bold text-foreground">Quick Add New Row</h3>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:  transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <X size={16} />
        </button>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {fields.map((field) => (
          <div key={field.key} className="space-y-1">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              {field.label}
              {field.required && <span className="text-destructive">*</span>}
            </label>
            {field.type === "file" ? (
              <div className="relative">
                <input
                  type="file"
                  onChange={(e) => handleChange(field.key, e.target.files?.[0])}
                  disabled={loading}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border   text-foreground file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-primary/10 file:text-primary file:text-xs file:font-semibold hover:file:bg-primary/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                />
                {errors[field.key] && (
                  <p className="text-xs text-destructive mt-1">{errors[field.key]}</p>
                )}
              </div>
            ) : (
              <div className="relative">
                <input
                  type={field.type}
                  value={formData[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={loading}
                  className={`w-full px-3 py-2 text-sm rounded-lg border   text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 ${
                    errors[field.key] ? "border-destructive" : "border-border"
                  }`}
                />
                {errors[field.key] && (
                  <p className="text-xs text-destructive mt-1">{errors[field.key]}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-3 border-t border-border">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-foreground text-sm font-semibold hover:bg-secondary hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
        >
          <Check size={16} />
          <span>{loading ? "Saving..." : "Save"}</span>
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg   text-foreground text-sm font-semibold hover:bg-muted hover:scale-105 active:scale-95 transition-all border border-border disabled:opacity-50 disabled:hover:scale-100"
        >
          <X size={16} />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
}
