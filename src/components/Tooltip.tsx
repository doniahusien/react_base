import { useState, useRef, useCallback, ReactElement, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  children: ReactElement;
  content: string;
  disabled?: boolean;
}

export function Tooltip({ children, content, disabled = false }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const updatePos = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 12,
      });
    }
  }, []);

  const show = useCallback(() => {
    updatePos();
    timerRef.current = setTimeout(() => {
      updatePos();
      setVisible(true);
    }, 300);
  }, [updatePos]);

  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  // Clean up timer on unmount
  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (disabled) return children;

  return (
    <>
      <div
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={hide}
        style={{ display: "block" }}
      >
        {children}
      </div>
      {visible &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              transform: "translateY(-50%)",
              zIndex: 9999,
              pointerEvents: "none",
              padding: "0.45rem 0.85rem",
              borderRadius: "0.75rem",
              color: "#fff",
              fontSize: "0.8125rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
              background: "linear-gradient(135deg, #8b7dd8 0%, #6a5acd 100%)",
              boxShadow:
                "0 8px 28px rgba(139, 125, 216, 0.35), 0 4px 12px rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(139, 125, 216, 0.4)",
              animation: "tooltipSlideIn 0.15s ease forwards",
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}
