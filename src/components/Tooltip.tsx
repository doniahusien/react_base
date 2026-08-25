import { useState, useRef, useCallback, ReactElement, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  children: ReactElement;
  content: string;
  disabled?: boolean;
  centered?: boolean;
}

export function Tooltip({ children, content, disabled = false, centered = false }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({
    top: 0,
    left: 0,
    transform: "translateY(-50%)",
    side: "right" as "left" | "right",
  });
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const updatePos = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const isRTL =
        document.documentElement.dir === "rtl" ||
        document.body.dir === "rtl" ||
        ref.current.closest('[dir="rtl"]') !== null;

      let left: number;
      let transform: string;
      let side: "left" | "right";

      if (isRTL) {
        left = rect.left - 10;
        transform = "translate(-100%, -50%)";
        side = "left";
      } else {
        left = rect.right + 10;
        transform = "translateY(-50%)";
        side = "right";
      }

      setPos({
        top: rect.top + rect.height / 2,
        left,
        transform,
        side,
      });
    }
  }, []);

  const show = useCallback(() => {
    updatePos();
    timerRef.current = setTimeout(() => {
      updatePos();
      setVisible(true);
    }, 220);
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
        className={centered ? "flex w-full justify-center" : "inline-flex max-w-full"}
      >
        {children}
      </div>
      {visible &&
        createPortal(
          <div
            role="tooltip"
            className="app-tooltip"
            data-side={pos.side}
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
