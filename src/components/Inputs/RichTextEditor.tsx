import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo2,
  Redo2,
} from "lucide-react";

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  dir?: "rtl" | "ltr" | "auto";
}

function ToolbarButton({
  active,
  onClick,
  disabled,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`flex size-8 items-center justify-center rounded-lg transition-colors disabled:opacity-40 ${
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function toEditorHtml(value: string | undefined) {
  const raw = value ?? "";
  if (!raw.trim()) return "";
  if (/<[a-z][\s\S]*>/i.test(raw)) return raw;
  return raw
    .split(/\n+/)
    .map((line) => `<p>${line}</p>`)
    .join("");
}

export function RichTextEditor({
  value = "",
  onChange,
  label,
  placeholder,
  disabled = false,
  dir = "auto",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: toEditorHtml(value),
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[180px] px-4 py-3 focus:outline-none text-foreground [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2",
        dir,
        "data-placeholder": placeholder ?? "",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onChange?.(html === "<p></p>" ? "" : html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next = toEditorHtml(value);
    const current = editor.getHTML();
    const normalizedCurrent = current === "<p></p>" ? "" : current;
    if (next !== normalizedCurrent) {
      editor.commands.setContent(next || "", { emitUpdate: false });
    }
  }, [value, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) return null;

  return (
    <div className="space-y-1.5">
      {label ? (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <div className="overflow-hidden rounded-xl border border-border bg-card focus-within:border-primary focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_12%,transparent)]">
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 px-2 py-1.5">
          <ToolbarButton
            title="Bold"
            active={editor.isActive("bold")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="Italic"
            active={editor.isActive("italic")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic size={15} />
          </ToolbarButton>
          <span className="mx-1 h-4 w-px bg-border" />
          <ToolbarButton
            title="Bullet list"
            active={editor.isActive("bulletList")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="Ordered list"
            active={editor.isActive("orderedList")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered size={15} />
          </ToolbarButton>
          <span className="mx-1 h-4 w-px bg-border" />
          <ToolbarButton
            title="Undo"
            disabled={disabled || !editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="Redo"
            disabled={disabled || !editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 size={15} />
          </ToolbarButton>
        </div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
