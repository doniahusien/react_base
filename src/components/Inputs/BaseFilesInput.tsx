import { useState, useEffect, useRef } from "react";
import { PhotoIcon as Images, CloudArrowUpIcon as CloudUpload, XMarkIcon as X, VideoCameraIcon as Video, DocumentTextIcon as FileText } from "@heroicons/react/24/outline";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";
import { ImagePreviewTrigger } from "../UI/ImagePreview";
import { useTranslation } from "react-i18next";
import type { FileType, UploadedFile, FileOutputItem } from "../../types/file";

export type { UploadedFile, FileOutputItem };

interface BaseFilesInputProps {
  name: string; label?: string; multiple?: boolean; accept?: string;
  attachment?: boolean; model?: string; value?: any;
  onChange?: (value: FileOutputItem | FileOutputItem[] | null) => void;
  onLoadingChange?: (loading: boolean) => void;
  error?: string; touched?: boolean;
}

function uuid() { return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2); }
function getFileType(file: File): FileType { if (file.type.startsWith("image/")) return "image"; if (file.type.startsWith("video/")) return "video"; return "file"; }
function getTypeFromUrl(url: string): FileType { const l = url.toLowerCase(); if (/\.(jpe?g|png|gif|webp|svg|avif)/.test(l)) return "image"; if (/\.(mp4|webm|ogg|mov|avi)/.test(l)) return "video"; return "file"; }

function StatusBadge({ color, label }: { color: "blue" | "green" | "red"; label: string }) {
  const cls = { blue: "bg-blue-soft text-blue", green: "bg-success-soft text-success-foreground", red: "bg-destructive text-destructive-foreground" }[color];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

export function BaseFilesInput({ name, label, multiple = false, accept = "image/*,video/*,.pdf,.doc,.docx,.xlsx,.xls", attachment = false, model, value, onChange, onLoadingChange, error, touched = false }: BaseFilesInputProps) {
  const { t } = useTranslation();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [activeDrag, setActiveDrag] = useState(false);
  const [confirmFile, setConfirmFile] = useState<UploadedFile | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [preview, setPreview] = useState<UploadedFile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasError = touched && !!error;

  useEffect(() => {
    if (!value) return;
    const toEntry = (v: any): UploadedFile | null => {
      if (!v?.media) return null;
      const hasRealId = v.id != null && !String(v.id).startsWith("new-") && !String(v.id).startsWith("saved-");
      return { id: hasRealId ? v.id : `saved-${uuid()}`, src: v.media, file: null, type: v.type ?? getTypeFromUrl(v.media), ext: v.ext ?? v.media.split(".").pop() ?? "", str: v.str ?? null, percentage: 100, isUploading: false, isUploaded: true, isFailed: false, isSaved: hasRealId, abortController: null };
    };
    if (multiple && Array.isArray(value)) setFiles(value.map(toEntry).filter(Boolean) as UploadedFile[]);
    else if (!multiple && !Array.isArray(value)) { const entry = toEntry(value); if (entry) setFiles([entry]); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { onLoadingChange?.(files.some((f) => f.isUploading)); }, [files, onLoadingChange]);

  const sendData = (updated: UploadedFile[]) => {
    const ready = updated.filter((f) => f.isUploaded || f.isSaved);
    if (ready.length === 0) { onChange?.(null); return; }
    const mapped: FileOutputItem[] = ready.map((f) => ({ id: f.id, file: f.file, type: f.type, str: f.str }));
    onChange?.(multiple ? mapped : mapped[0]);
  };

  const updateFile = (id: string | number, patch: Partial<UploadedFile>) => {
    setFiles((prev) => { const next = prev.map((f) => f.id === id ? { ...f, ...patch } : f); sendData(next); return next; });
  };

  const uploadLocal = (obj: UploadedFile) => {
    const reader = new FileReader();
    reader.onload = () => updateFile(obj.id, { str: reader.result as string, percentage: 100, isUploading: false, isUploaded: true });
    reader.onerror = () => updateFile(obj.id, { isFailed: true, isUploading: false });
    reader.readAsDataURL(obj.file!);
  };

  const uploadAttachment = async (obj: UploadedFile) => {
    const controller = new AbortController();
    updateFile(obj.id, { abortController: controller });
    try {
      const fd = new FormData();
      fd.append("file", obj.file!);
      if (model) fd.append("collection", model);
      const GENERAL_BASE = (import.meta.env.VITE_BASE_URL_GENERAL as string) ?? "";
      const res = await api.post("media/upload", fd, { baseURL: GENERAL_BASE, signal: controller.signal, onUploadProgress: (e: any) => { const pct = e.total ? Math.round((e.loaded * 100) / e.total) : 0; updateFile(obj.id, { percentage: pct }); } });
      updateFile(obj.id, { str: res.data?.data?.hash ?? null, percentage: 100, isUploading: false, isUploaded: true, isFailed: false });
    } catch (err: any) {
      if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") return;
      updateFile(obj.id, { isFailed: true, isUploading: false, isUploaded: false });
      toast.error(t("MESSAGES.uploadFailed"), err?.response?.data?.message);
    }
  };

  const handleFiles = (incoming: File[]) => {
    incoming.forEach((file) => {
      const obj: UploadedFile = { id: `new-${uuid()}`, src: URL.createObjectURL(file), file, type: getFileType(file), ext: file.name.split(".").pop() ?? "", str: null, percentage: 0, isUploading: true, isUploaded: false, isFailed: false, isSaved: false, abortController: null };
      setFiles((prev) => { const next = multiple ? [...prev, obj] : [obj]; if (attachment) uploadAttachment(obj); else uploadLocal(obj); return next; });
    });
  };

  const confirmDelete = async () => {
    if (!confirmFile) return;
    const target = confirmFile; setConfirmFile(null); setDeletingId(target.id);
    if (String(target.id).includes("new-") || String(target.id).includes("saved-")) {
      if (target.isUploading && target.abortController) { try { target.abortController.abort(); } catch (_) {} }
      setFiles((prev) => { const next = prev.filter((f) => f.id !== target.id); sendData(next); return next; });
      setDeletingId(null);
    } else {
      const GENERAL_BASE = (import.meta.env.VITE_BASE_URL_GENERAL as string) ?? "";
      await api.delete(`/attachments/${target.id}`, { baseURL: GENERAL_BASE })
        .then((res: any) => { setFiles((prev) => { const next = prev.filter((f) => f.id !== target.id); sendData(next); return next; }); toast.success(t("MESSAGES.fileDeleted"), res.data?.message); })
        .catch((err: any) => { toast.error(t("MESSAGES.fileDeleteFailed"), err?.response?.data?.message); })
        .finally(() => setDeletingId(null));
    }
  };

  const isEmpty = files.length === 0;

  return (
    <div className="space-y-2">
      {label && <div className="flex items-center gap-2"><div className={`flex size-7 items-center justify-center rounded-full ${hasError ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}><Images width={14} height={14} /></div><span className={`text-sm font-semibold ${hasError ? "text-destructive" : "text-foreground"}`}>{label}</span></div>}
      <div className={`overflow-hidden rounded-2xl border-2 transition-all duration-200 ${hasError ? "border-destructive bg-destructive/10 dark:bg-destructive/20" : "border-border bg-card"}`}>
        {isEmpty && (
          <label htmlFor={`${name}_input`} onDragOver={(e) => { e.preventDefault(); setActiveDrag(true); }} onDragLeave={() => setActiveDrag(false)} onDrop={(e) => { e.preventDefault(); setActiveDrag(false); const f = Array.from(e.dataTransfer?.files ?? []); if (f.length) handleFiles(f); }} className={`flex cursor-pointer flex-col items-center justify-center gap-4 py-12 transition-all duration-300 ${activeDrag ? "scale-95 opacity-50" : ""}`}>
            <div className={`flex size-20 items-center justify-center rounded-full border-2 border-dashed transition-colors ${hasError ? "border-destructive text-destructive" : "border-border text-muted-foreground"}`}><CloudUpload width={32} height={32} /></div>
            <p className="text-sm font-medium text-foreground">{t("BUTTONS.uploadFile")}</p>
          </label>
        )}
        {!isEmpty && (
          <div className={`${multiple ? "grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "p-0"}`}>
            {files.map((f) => (
              <div key={f.id} className={multiple ? "relative flex flex-col items-center gap-2 rounded-xl border border-border p-2" : "relative"}>
                {f.type === "image" ? <ImagePreviewTrigger src={f.src} alt={f.file?.name ?? "image"} className={multiple ? "h-[100px] w-[100px] rounded-lg object-cover" : "h-[200px] w-full rounded-t-2xl object-cover"} wrapperClassName={multiple ? "rounded-lg" : "rounded-t-2xl w-full"} />
                  : <div onClick={() => setPreview(f)} className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg bg-primary text-foreground uppercase text-xs ${multiple ? "h-[100px] w-[100px]" : "h-[200px] w-full rounded-t-2xl"}`}>{f.type === "video" ? <Video width={30} height={30} /> : <FileText width={30} height={30} />}<span>{f.ext || f.type}</span></div>}
                {multiple && f.file?.name && <p className="max-w-[120px] truncate text-xs text-muted-foreground" title={f.file.name}>{f.file.name}</p>}
                {f.isUploading && f.percentage > 0 && <div className={`${multiple ? "w-full" : "absolute bottom-0 left-0 right-0 px-3 pb-2"}`}><div className="h-2 w-full overflow-hidden rounded-full  "><div className="flex h-2 items-center justify-center rounded-full bg-primary transition-all" style={{ width: `${f.percentage}%` }} /></div><p className="mt-0.5 text-center text-[10px] text-muted-foreground">{f.percentage}%</p></div>}
                {!multiple && !f.isUploading && <div className="absolute bottom-3 inset-s-3">{f.isSaved && <StatusBadge color="blue" label={t("MESSAGES.fileSaved")} />}{f.isUploaded && !f.isSaved && <StatusBadge color="green" label={t("MESSAGES.fileUploaded")} />}{f.isFailed && <StatusBadge color="red" label={t("MESSAGES.fileFailed")} />}</div>}
                {multiple && !f.isUploading && <>{f.isSaved && <StatusBadge color="blue" label={t("MESSAGES.fileSaved")} />}{f.isUploaded && !f.isSaved && <StatusBadge color="green" label={t("MESSAGES.fileUploaded")} />}{f.isFailed && <StatusBadge color="red" label={t("MESSAGES.fileFailed")} />}</>}
                <button type="button" disabled={deletingId === f.id} onClick={() => setConfirmFile(f)} className={`flex items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md transition-all hover:bg-destructive/90 disabled:opacity-50 ${multiple ? "h-7 w-7" : "absolute -top-2 inset-e-2 size-7"}`}><X width={14} height={14} /></button>
              </div>
            ))}
            {multiple && (
              <label htmlFor={`${name}_input`} onDragOver={(e) => { e.preventDefault(); setActiveDrag(true); }} onDragLeave={() => setActiveDrag(false)} onDrop={(e) => { e.preventDefault(); setActiveDrag(false); const f = Array.from(e.dataTransfer?.files ?? []); if (f.length) handleFiles(f); }} className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-2 transition-all ${activeDrag ? "scale-95 opacity-50 border-primary" : "hover:border-primary"}`}>
                <div className="flex items-center justify-center rounded-full border-2 border-dashed border-border p-2 text-muted-foreground"><CloudUpload width={24} height={24} /></div>
                <p className="text-xs text-muted-foreground text-center">{t("BUTTONS.addMore")}</p>
              </label>
            )}
          </div>
        )}
      </div>
      <input ref={inputRef} id={`${name}_input`} type="file" multiple={multiple} accept={accept} className="hidden" onChange={(e) => { const f = Array.from(e.target.files ?? []); if (f.length) handleFiles(f); e.target.value = ""; }} />
      {hasError && <p className="flex items-center gap-1.5 text-xs text-destructive"><span className="inline-block h-1 w-1 rounded-full bg-destructive shrink-0" />{error}</p>}
      {confirmFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setConfirmFile(null)} /><div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-background border border-border shadow-2xl"><div className="p-6"><h3 className="text-base font-bold text-foreground">{t("MESSAGES.deleteFileTitle")}</h3><p className="mt-1 text-sm text-muted-foreground">{t("MESSAGES.deleteFileBody")}</p></div><div className="flex justify-end gap-3 border-t border-border px-6 py-4"><button type="button" onClick={() => setConfirmFile(null)} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all">{t("BUTTONS.cancel")}</button><button type="button" onClick={confirmDelete} className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 transition-all">{t("BUTTONS.delete")}</button></div></div></div>
      )}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setPreview(null)} /><div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl bg-background border border-border shadow-2xl"><div className="flex items-center justify-between px-5 py-4 border-b border-border"><h3 className="text-sm font-bold text-foreground">{t("MESSAGES.filePreview")}</h3><button type="button" onClick={() => setPreview(null)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-background transition-all"><X width={14} height={14} /></button></div><div className="p-4">{preview.type === "video" && <video src={preview.src} controls className="h-[500px] w-full rounded-xl object-contain bg-foreground/10" />}{preview.type === "file" && preview.ext === "pdf" && <iframe src={preview.src} className="h-[500px] w-full rounded-xl" />}{preview.type === "file" && ["docx","doc","xlsx","xls"].includes(preview.ext) && <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(preview.src)}`} className="h-[500px] w-full rounded-xl" allowFullScreen />}</div></div></div>
      )}
    </div>
  );
}
