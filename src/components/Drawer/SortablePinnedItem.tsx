import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Bars3Icon as GripVertical } from "@heroicons/react/24/outline";

interface SortablePinnedItemProps {
  id: string;
  children: React.ReactNode;
  disabled: boolean;
}

export function SortablePinnedItem({ id, children, disabled }: SortablePinnedItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative group">
      {!disabled && (
        <div
          className="-left-4 absolute top-1/2 -translate-y-1/2 rounded-full bg-card/90 p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-all cursor-grab active:cursor-grabbing z-10"
          {...listeners}
        >
          <GripVertical className="size-3.5 text-foreground-30" />
        </div>
      )}
      {children}
    </div>
  );
}
