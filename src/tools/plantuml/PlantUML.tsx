import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import { DualPanel } from "../../components/DualPanel.tsx";
import { useStore } from "../../core/store.ts";
import { useDebouncedValue } from "../../core/useDebouncedValue.ts";
import { useToolDraft } from "../../core/useToolDraft.ts";
import { getT } from "../../i18n/index.ts";

const DEFAULT_CODE = `@startuml
Alice -> Bob: Hello
Bob --> Alice: Hi!
@enduml`;

function toHex(text: string): string {
  return Array.from(new TextEncoder().encode(text))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function PlantUMLTool() {
  const locale = useStore((s) => s.locale);
  const mode = useStore((s) => s.plantumlMode);
  const server = useStore((s) => s.plantumlServer);
  const t = getT(locale);
  const [code, setCode] = useToolDraft("plantuml:code", DEFAULT_CODE);
  const debouncedCode = useDebouncedValue(code, 500);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    const src = debouncedCode.trim();
    const reqId = ++reqIdRef.current;
    previewRef.current?.replaceChildren();
    setError("");
    setImgUrl("");
    if (!src) {
      setLoading(false);
      return;
    }

    if (mode === "remote") {
      setLoading(false);
      const base = server.replace(/\/+$/, "");
      setImgUrl(`${base}/svg/~h${toHex(debouncedCode)}`);
      return;
    }

    setLoading(true);
    invoke<string>("render_plantuml", { source: debouncedCode })
      .then((svg) => {
        if (reqId !== reqIdRef.current) return;
        const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
        for (const n of doc.querySelectorAll("script")) n.remove();
        previewRef.current?.replaceChildren(doc.documentElement);
      })
      .catch((e: unknown) => {
        if (reqId !== reqIdRef.current) return;
        setError(
          typeof e === "string" ? e : e instanceof Error ? e.message : t.tools.plantuml.renderError
        );
      })
      .finally(() => {
        if (reqId === reqIdRef.current) setLoading(false);
      });
  }, [debouncedCode, mode, server, t]);

  return (
    <div className="flex h-full flex-col gap-4 p-6 overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <DualPanel
          left={
            <div className="flex h-full flex-col gap-2 p-3">
              <h3 className="text-sm font-medium text-[#d4d4d4]">{t.tools.plantuml.editor}</h3>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 resize-none rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
              />
              <p className="text-xs text-[#858585]">
                {mode === "remote" ? t.tools.plantuml.remoteNote : t.tools.plantuml.localRenderNote}
              </p>
            </div>
          }
          right={
            <div className="flex h-full flex-col gap-2 p-3">
              <h3 className="text-sm font-medium text-[#d4d4d4]">{t.tools.plantuml.preview}</h3>
              <div className="flex flex-1 items-center justify-center overflow-auto rounded border border-[#3e3e42] bg-[#1e1e1e] p-4">
                {mode === "remote" ? (
                  imgUrl ? (
                    <img src={imgUrl} alt="PlantUML diagram" className="max-w-full" />
                  ) : (
                    <p className="text-sm text-[#858585]">{t.tools.plantuml.emptyPrompt}</p>
                  )
                ) : loading ? (
                  <p className="text-sm text-[#858585]">{t.tools.plantuml.loading}</p>
                ) : error ? (
                  <div className="max-w-md text-center">
                    <p className="text-sm text-red-400 break-all">{error}</p>
                    <p className="mt-2 text-xs text-[#858585]">{t.tools.plantuml.javaHint}</p>
                  </div>
                ) : (
                  <div
                    ref={previewRef}
                    className="flex min-h-full w-full items-center justify-center"
                  />
                )}
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
