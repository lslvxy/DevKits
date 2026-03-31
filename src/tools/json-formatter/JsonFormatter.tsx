import { useState } from "react";
import { CodeEditor } from "../../components/CodeEditor.tsx";
import { CopyButton } from "../../components/CopyButton.tsx";
import { DualPanel } from "../../components/DualPanel.tsx";

type Mode = "format" | "compact" | "validate";

export function JsonFormatter() {
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
      const parsed = JSON.parse(text);
      if (m === "format") {
        setOutput(JSON.stringify(parsed, null, ind));
        setError(null);
      } else if (m === "compact") {
        setOutput(JSON.stringify(parsed));
        setError(null);
      } else {
        // validate
        setOutput(`✓ 有效的 JSON\n\n类型: ${Array.isArray(parsed) ? "数组" : typeof parsed}`);
        setError(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "JSON 解析失败");
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

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-[#2d2d2d] border-b border-[#3e3e42]">
        <div className="flex gap-1">
          {(["format", "compact", "validate"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleMode(m)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                mode === m
                  ? "bg-[#007acc] text-white"
                  : "bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4c4c4c]"
              }`}
            >
              {m === "format" ? "格式化" : m === "compact" ? "压缩" : "校验"}
            </button>
          ))}
        </div>
        {mode === "format" && (
          <div className="flex items-center gap-2 text-xs text-[#858585]">
            <span>缩进:</span>
            {[2, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleIndent(n)}
                className={`px-2 py-0.5 rounded ${
                  indent === n ? "bg-[#007acc] text-white" : "bg-[#3c3c3c] text-[#d4d4d4]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
        {output && mode !== "validate" && <CopyButton text={output} />}
      </div>

      <div className="flex-1 overflow-hidden">
        <DualPanel
          left={
            <div className="flex flex-col h-full">
              <div className="px-3 py-1 bg-[#252526] border-b border-[#3e3e42] text-xs text-[#858585]">
                输入
              </div>
              <div className="flex-1 overflow-hidden">
                <CodeEditor value={input} onChange={handleInput} language="json" />
              </div>
            </div>
          }
          right={
            <div className="flex flex-col h-full">
              <div className="px-3 py-1 bg-[#252526] border-b border-[#3e3e42] text-xs text-[#858585]">
                输出
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
    </div>
  );
}
