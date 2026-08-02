import { useState, useRef, useCallback, ReactElement, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  children: ReactElement;
  content: string;
  disabled?: boolean;
}

export function Tooltip({ children, content, disabled = false }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, transform: "translateY(-50%)" });
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const updatePos = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const isRTL = document.documentElement.dir === "rtl" || document.body.dir === "rtl" || ref.current.closest('[dir="rtl"]') !== null;
      
      let left: number;
      let transform: string;
      
      if (isRTL) {
        // RTL: sidebar is on right side, tooltip should appear FULLY to the LEFT of icon
        // Use rect.left (left edge of icon) as anchor point
        // Transform moves tooltip 100% of its own width to the left, and centers vertically
        left = rect.left - 8;
        transform = "translate(-100%, -50%)";
      } else {
        // LTR: sidebar is on left side, tooltip should appear to the RIGHT of icon
        // Use rect.right (right edge of icon) as anchor point
        left = rect.right + 8;
        transform = "translateY(-50%)";
      }
      
      setPos({
        top: rect.top + rect.height / 2,
        left,
        transform,
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
            className="app-tooltip"
            style={{
              top: pos.top,
              left: pos.left,
              transform: pos.transform,
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}
