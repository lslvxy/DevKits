import { useState } from "react";
import { CopyButton } from "../../components/CopyButton.tsx";
import { getT } from "../../i18n/index.ts";
import { useStore } from "../../core/store.ts";
import { useToolDraft } from "../../core/useToolDraft.ts";

type Mode = "encodeComponent" | "decodeComponent" | "encodeURI" | "decodeURI";


function processURL(input: string, mode: Mode): { output: string; error: string | null } {
  if (!input.trim()) return { output: "", error: null };
  try {
    switch (mode) {
      case "encodeComponent":
        return { output: encodeURIComponent(input), error: null };
      case "decodeComponent":
        return { output: decodeURIComponent(input), error: null };
      case "encodeURI":
        return { output: encodeURI(input), error: null };
      case "decodeURI":
        return { output: decodeURI(input), error: null };
    }
  } catch (e) {
    return { output: "", error: e instanceof Error ? e.message : "Process failed" };
  }
}

export function UrlCodecTool() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
    const MODES: { id: Mode; label: string; desc: string }[] = [
      { id: "encodeComponent", label: t.tools.urlCodec.encodeComponent, desc: "encodeURIComponent" },
      { id: "decodeComponent", label: t.tools.urlCodec.decodeComponent, desc: "decodeURIComponent" },
      { id: "encodeURI", label: t.tools.urlCodec.encodeURI, desc: "encodeURI" },
      { id: "decodeURI", label: t.tools.urlCodec.decodeURI, desc: "decodeURI" },
    ];
  const [input, setInput] = useToolDraft("url-codec:input");
  const [mode, setMode] = useState<Mode>("encodeComponent");

  const { output, error } = processURL(input, mode);

  const handleModeChange = (m: Mode) => {
    setMode(m);
  };

  return (
    <div className="flex flex-col gap-4 p-6 h-full overflow-auto">
      {/* Mode selector */}
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <h3 className="text-sm font-medium text-[#d4d4d4] mb-3">{t.tools.urlCodec.modeSelectionInfo}</h3>
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleModeChange(m.id)}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                mode === m.id
                  ? "bg-[#0078d4] text-white"
                  : "bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4c4c4c]"
              }`}
            >
              <span className="font-medium">{m.label}</span>
              <span className="ml-1 opacity-60">({m.desc})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-[#d4d4d4]">{t.tools.urlCodec.input}</h3>
          {input && (
            <button
              type="button"
              onClick={() => setInput("")}
              className="text-xs text-[#858585] hover:text-[#d4d4d4]"
            >
              {t.tools.urlCodec.clear}
            </button>
          )}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.tools.urlCodec.inputEncodePlaceholder}
          className="w-full h-32 bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 text-sm text-[#d4d4d4] font-mono placeholder-[#858585] outline-none focus:border-[#0078d4] resize-none"
        />
      </div>

      {/* Output */}
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-[#d4d4d4]">{t.tools.urlCodec.output}</h3>
          {output && <CopyButton text={output} />}
        </div>
        {error ? (
          <div className="p-3 bg-[#1e1e1e] rounded border border-red-500/30 text-red-400 text-sm font-mono">
            {error}
          </div>
        ) : (
          <div className="min-h-[128px] bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 text-sm text-[#9cdcfe] font-mono break-all whitespace-pre-wrap">
            {output || <span className="text-[#858585]">{t.tools.urlCodec.emptyPrompt}</span>}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <h3 className="text-sm font-medium text-[#d4d4d4] mb-2">{t.tools.urlCodec.info}</h3>
        <div className="text-xs text-[#858585] space-y-1">
          <p>
            <span className="text-[#9cdcfe]">编码组件 (encodeURIComponent)</span>：{t.tools.urlCodec.encodeComponentDesc}
          </p>
          <p>
            <span className="text-[#9cdcfe]">解码组件 (decodeURIComponent)</span>：{t.tools.urlCodec.decodeComponentDesc}
          </p>
          <p>
            <span className="text-[#9cdcfe]">编码 URI (encodeURI)</span>：{t.tools.urlCodec.encodeURIDesc}
          </p>
          <p>
            <span className="text-[#9cdcfe]">解码 URI (decodeURI)</span>：{t.tools.urlCodec.decodeURIDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
