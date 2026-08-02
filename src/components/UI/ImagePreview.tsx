import { useRef } from "react";
import { ZoomIn } from "lucide-react";
import "photoswipe/dist/photoswipe.css";

interface ImagePreviewTriggerProps {
  src: string; alt?: string; className?: string; wrapperClassName?: string;
}

function getImageSize(src: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload  = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 1600, h: 900 });
    img.src = src;
  });
}

async function openPhotoSwipe(src: string, alt: string, thumbEl: HTMLElement | null) {
  const { default: PhotoSwipe } = await import("photoswipe");
  const { w, h } = await getImageSize(src);
  let thumbBounds: { x: number; y: number; w: number } | undefined;
  if (thumbEl) {
    const rect = thumbEl.getBoundingClientRect();
    thumbBounds = { x: rect.left + window.scrollX, y: rect.top + window.scrollY, w: rect.width };
  }
  const pswp = new PhotoSwipe({
    dataSource: [{ src, w, h, alt }],
    index: 0,
    ...(thumbBounds ? { getThumbBoundsFn: () => thumbBounds! } : {}),
    showHideAnimationType: thumbBounds ? "zoom" : "fade",
    zoom: true, close: true, counter: false, arrowPrev: false, arrowNext: false,
    bgOpacity: 0.85, padding: { top: 20, bottom: 20, left: 20, right: 20 },
  });
  pswp.init();
}

export function ImagePreviewTrigger({ src, alt = "", className = "", wrapperClassName = "" }: ImagePreviewTriggerProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const handleOpen = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    openPhotoSwipe(src, alt, wrapperRef.current);
  };
  return (
    <span ref={wrapperRef} className={`group relative inline-block cursor-zoom-in ${wrapperClassName}`} onClick={handleOpen} role="button" tabIndex={0} aria-label={`Preview image${alt ? `: ${alt}` : ""}`} onKeyDown={(e) => e.key === "Enter" && handleOpen(e)}>
      <img src={src} alt={alt} className={className} />
      <span className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-foreground/0 opacity-0 transition-all duration-200 group-hover:bg-foreground/20 group-hover:opacity-100" aria-hidden="true">
        <ZoomIn size={16} className="text-foreground drop-shadow" />
      </span>
    </span>
  );
}
