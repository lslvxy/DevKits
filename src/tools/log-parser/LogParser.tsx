import { useCallback, useRef, useState } from "react";
import { CodeEditor } from "../../components/CodeEditor.tsx";
import { CopyButton } from "../../components/CopyButton.tsx";
import { DualPanel } from "../../components/DualPanel.tsx";
import { JsonViewer } from "../../components/JsonViewer.tsx";
import { createChain } from "./parsers/chain.ts";
import { FallbackParser } from "./parsers/fallback.ts";
import { JsonDetectParser } from "./parsers/json-detect.ts";
import { KVParser } from "./parsers/kv.ts";
import { LogFrameworkParser } from "./parsers/log-framework.ts";
import { ToStringParser } from "./parsers/to-string.ts";
import type { ParseResult } from "./parsers/types.ts";

type Mode = "auto" | "logback" | "toString" | "kv" | "json";

const chains: Record<Mode, (input: string) => ParseResult> = {
  auto: createChain([
    JsonDetectParser,
    LogFrameworkParser,
    ToStringParser,
    KVParser,
    FallbackParser,
  ]),
  logback: createChain([LogFrameworkParser, FallbackParser]),
  toString: createChain([ToStringParser, FallbackParser]),
  kv: createChain([KVParser, FallbackParser]),
  json: createChain([JsonDetectParser, FallbackParser]),
};

const MODE_LABELS: Record<Mode, string> = {
  auto: "Auto",
  logback: "Logback",
  toString: "toString",
  kv: "KV",
  json: "JSON",
};

export function LogParser() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [mode, setMode] = useState<Mode>("auto");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const parse = useCallback((text: string, m: Mode) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (text.trim()) {
        setResult(chains[m](text));
      } else {
        setResult(null);
      }
    }, 300);
  }, []);

  const handleInputChange = (val: string) => {
    setInput(val);
    parse(val, mode);
  };

  const handleModeChange = (m: Mode) => {
    setMode(m);
    if (input.trim()) {
      parse(input, m);
    }
  };

  const outputJson = result?.data ? JSON.stringify(result.data, null, 2) : "";

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <DualPanel
          left={
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#2d2d2d] border-b border-[#3e3e42]">
                <span className="text-xs text-[#858585]">输入</span>
                <button
                  type="button"
                  className="text-xs text-[#858585] hover:text-[#d4d4d4]"
                  onClick={() => {
                    setInput("");
                    setResult(null);
                  }}
                >
                  清空
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <CodeEditor value={input} onChange={handleInputChange} language="plaintext" />
              </div>
            </div>
          }
          right={
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#2d2d2d] border-b border-[#3e3e42]">
                <span className="text-xs text-[#858585]">输出 (JSON)</span>
                {outputJson && <CopyButton text={outputJson} />}
              </div>
              <div className="flex-1 overflow-hidden bg-[#1e1e1e]">
                {result?.data ? (
                  <JsonViewer data={result.data as never} />
                ) : (
                  <div className="flex items-center justify-center h-full text-[#858585] text-sm">
                    {result?.error ? (
                      <span className="text-red-400">{result.error}</span>
                    ) : (
                      "在左侧粘贴日志内容"
                    )}
                  </div>
                )}
              </div>
            </div>
          }
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#007acc] text-white text-xs border-t border-[#005a9e]">
        <div className="flex items-center gap-1">
          {(Object.entries(MODE_LABELS) as [Mode, string][]).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => handleModeChange(m)}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                mode === m ? "bg-white text-[#007acc] font-medium" : "hover:bg-[#005a9e]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {result && (
          <div className="flex items-center gap-3">
            <span>解析器: {result.parserName}</span>
            <span>置信度: {(result.confidence * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
