import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type Props = {
  left: ReactNode;
  right: ReactNode;
  defaultSplit?: number; // 0-100, percent for left panel
};

export function DualPanel({ left, right, defaultSplit = 50 }: Props) {
  const [split, setSplit] = useState(defaultSplit);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newSplit = Math.min(80, Math.max(20, ((e.clientX - rect.left) / rect.width) * 100));
      setSplit(newSplit);
    };
    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden">
      <div style={{ width: `${split}%` }} className="overflow-hidden flex flex-col">
        {left}
      </div>
      {/* Divider */}
      <div
        className="w-1 bg-[#3e3e42] hover:bg-[#007acc] cursor-col-resize transition-colors flex-shrink-0"
        onMouseDown={onMouseDown}
      />
      <div style={{ width: `${100 - split}%` }} className="overflow-hidden flex flex-col">
        {right}
      </div>
    </div>
  );
}
