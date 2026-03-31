import mermaid from "mermaid";
import { useCallback, useEffect, useRef, useState } from "react";
import { DualPanel } from "../../components/DualPanel.tsx";

const DEFAULT_CODE = `graph TD
  A[Start] --> B{Is it?}
  B -->|Yes| C[OK]
  B -->|No| D[End]`;

export function MermaidDiagramTool() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [error, setError] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);
  const renderIdRef = useRef(0);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      mermaid.initialize({ startOnLoad: false, theme: "dark" });
      initializedRef.current = true;
    }
  }, []);

  const render = useCallback(async (src: string) => {
    if (!src.trim() || !previewRef.current) return;
    renderIdRef.current += 1;
    const id = `mermaid-render-${renderIdRef.current}`;
    try {
      const { svg } = await mermaid.render(id, src);
      if (previewRef.current) {
        previewRef.current.innerHTML = svg;
        setError("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "渲染失败");
      if (previewRef.current) {
        previewRef.current.innerHTML = "";
      }
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => render(code), 500);
    return () => clearTimeout(t);
  }, [code, render]);

  return (
    <div className="flex h-full flex-col gap-4 p-6 overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <DualPanel
          left={
            <div className="flex h-full flex-col gap-2 p-3">
              <h3 className="text-sm font-medium text-[#d4d4d4]">Mermaid 代码</h3>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 resize-none rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
          }
          right={
            <div className="flex h-full flex-col gap-2 p-3">
              <h3 className="text-sm font-medium text-[#d4d4d4]">预览</h3>
              <div className="flex-1 overflow-auto rounded border border-[#3e3e42] bg-[#1e1e1e] p-4">
                <div ref={previewRef} className="flex min-h-full items-center justify-center" />
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
