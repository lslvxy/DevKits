import { useEffect, useState } from "react";
import { DualPanel } from "../../components/DualPanel.tsx";
import { getT } from "../../i18n/index.ts";
import { useStore } from "../../core/store.ts";

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
  const t = getT(locale);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [imgUrl, setImgUrl] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      if (code.trim()) {
        setImgUrl(`https://www.plantuml.com/plantuml/png/~h${toHex(code)}`);
      } else {
        setImgUrl("");
      }
    }, 800);
    return () => clearTimeout(t);
  }, [code]);

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
              <p className="text-xs text-[#858585]">⚠️ {t.tools.plantuml.emptyPrompt}</p>
            </div>
          }
          right={
            <div className="flex h-full flex-col gap-2 p-3">
              <h3 className="text-sm font-medium text-[#d4d4d4]">{t.tools.plantuml.preview}</h3>
              <div className="flex flex-1 items-center justify-center overflow-auto rounded border border-[#3e3e42] bg-[#1e1e1e] p-4">
                {imgUrl ? (
                  <img src={imgUrl} alt="PlantUML diagram" className="max-w-full" />
                ) : (
                  <p className="text-sm text-[#858585]">{t.tools.plantuml.emptyPrompt}</p>
                )}
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
