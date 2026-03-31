import { useState } from "react";
import { getT } from "../../i18n/index.ts";
import { useStore } from "../../core/store.ts";
import { CodeEditor } from "../../components/CodeEditor.tsx";
import { CopyButton } from "../../components/CopyButton.tsx";
import { DualPanel } from "../../components/DualPanel.tsx";

type Mode = "format" | "compact" | "validate" | "escape" | "unescape";

function escapeJsonString(str: string): string {
  return (
    str
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t")
      // biome-ignore lint/suspicious/noControlCharactersInRegex: intentionally matching control chars for JSON escaping
      .replace(/[\x00-\x1f\x7f]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`)
  );
}

// Unescape a JSON-escaped string (the content inside the quotes)
function unescapeJsonString(str: string): string {
  return JSON.parse(`"${str}"`);
}

export function JsonFormatter() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("format");
  const [indent, setIndent] = useState(2);

  const process = (text: string, m: Mode, ind: number) => {
    if (!text.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      if (m === "escape") {
        setOutput(escapeJsonString(text));
        setError(null);
        return;
      }
      if (m === "unescape") {
        try {
          setOutput(unescapeJsonString(text));
          setError(null);
        } catch {
          setError(t.tools.jsonFormatter.invalidEscape);
          setOutput("");
        }
        return;
      }
      const parsed = JSON.parse(text);
      if (m === "format") {
        setOutput(JSON.stringify(parsed, null, ind));
        setError(null);
      } else if (m === "compact") {
        setOutput(JSON.stringify(parsed));
        setError(null);
      } else {
        // validate
        setOutput(`✓ ${t.tools.jsonFormatter.validJson}\n\n${t.tools.jsonFormatter.typeArray}: ${Array.isArray(parsed) ? t.tools.jsonFormatter.typeArray : typeof parsed}`);
        setError(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t.tools.jsonFormatter.parseFailed);
      setOutput("");
    }
  };

  const handleInput = (v: string) => {
    setInput(v);
    process(v, mode, indent);
  };

  const handleMode = (m: Mode) => {
    setMode(m);
    process(input, m, indent);
  };

  const handleIndent = (n: number) => {
    setIndent(n);
    process(input, mode, n);
  };

  const isEscapeMode = mode === "escape" || mode === "unescape";

  const modeConfig: { id: Mode; label: () => string }[] = [
    { id: "format", label: () => t.tools.jsonFormatter.format },
    { id: "compact", label: () => t.tools.jsonFormatter.compact },
    { id: "validate", label: () => t.tools.jsonFormatter.validate },
    { id: "escape", label: () => t.tools.jsonFormatter.escape },
    { id: "unescape", label: () => t.tools.jsonFormatter.unescape },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-[#2d2d2d] border-b border-[#3e3e42]">
        <div className="flex gap-1">
          {modeConfig.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleMode(id)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                mode === id
                  ? "bg-[#0078d4] text-white"
                  : "bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4c4c4c]"
              }`}
            >
              {label()}
            </button>
          ))}
        </div>
        {mode === "format" && (
          <div className="flex items-center gap-2 text-xs text-[#858585]">
            <span>{t.tools.jsonFormatter.indent}</span>
            {[2, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleIndent(n)}
                className={`px-2 py-0.5 rounded ${
                  indent === n ? "bg-[#0078d4] text-white" : "bg-[#3c3c3c] text-[#d4d4d4]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
        {output && mode !== "validate" && <CopyButton text={output} />}
      </div>

      {isEscapeMode ? (
        // Simple textarea layout for escape/unescape
        <div className="flex-1 overflow-hidden">
          <DualPanel
            left={
              <div className="flex flex-col h-full">
                <div className="px-3 py-1 bg-[#252526] border-b border-[#3e3e42] text-xs text-[#858585]">
                  {mode === "escape" ? t.tools.jsonFormatter.rawString : t.tools.jsonFormatter.jsonEscapedString}
                </div>
                <div className="flex-1 overflow-hidden">
                  <CodeEditor value={input} onChange={handleInput} language="plaintext" />
                </div>
              </div>
            }
            right={
              <div className="flex flex-col h-full">
                <div className="px-3 py-1 bg-[#252526] border-b border-[#3e3e42] text-xs text-[#858585]">
                  {mode === "escape" ? "转义后字符串" : "反转义字符串"}
                </div>
                <div className="flex-1 overflow-hidden">
                  {error ? (
                    <div className="p-4 text-red-400 text-sm font-mono">{error}</div>
                  ) : (
                    <CodeEditor value={output} language="plaintext" readOnly />
                  )}
                </div>
              </div>
            }
          />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <DualPanel
            left={
              <div className="flex flex-col h-full">
                <div className="px-3 py-1 bg-[#252526] border-b border-[#3e3e42] text-xs text-[#858585]">
                    {t.tools.jsonFormatter.input}
                </div>
                <div className="flex-1 overflow-hidden">
                  <CodeEditor value={input} onChange={handleInput} language="json" />
                </div>
              </div>
            }
            right={
              <div className="flex flex-col h-full">
                <div className="px-3 py-1 bg-[#252526] border-b border-[#3e3e42] text-xs text-[#858585]">
                    {t.tools.jsonFormatter.output}
                </div>
                <div className="flex-1 overflow-hidden">
                  {error ? (
                    <div className="p-4 text-red-400 text-sm font-mono">{error}</div>
                  ) : (
                    <CodeEditor value={output} language="json" readOnly />
                  )}
                </div>
              </div>
            }
          />
        </div>
      )}
    </div>
  );
}
