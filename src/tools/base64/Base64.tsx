import { useState } from "react";
import { CopyButton } from "../../components/CopyButton.tsx";

type Mode = "encode" | "decode";

export function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("encode");

  const process = (text: string, m: Mode) => {
    if (!text) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      if (m === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(text))));
        setError(null);
      } else {
        setOutput(decodeURIComponent(escape(atob(text))));
        setError(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "处理失败");
      setOutput("");
    }
  };

  const handleInput = (v: string) => {
    setInput(v);
    process(v, mode);
  };

  const handleMode = (m: Mode) => {
    setMode(m);
    process(input, m);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Mode selector */}
      <div className="flex gap-2">
        {(["encode", "decode"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => handleMode(m)}
            className={`px-4 py-1.5 text-sm rounded transition-colors ${
              mode === m
                ? "bg-[#007acc] text-white"
                : "bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4c4c4c]"
            }`}
          >
            {m === "encode" ? "编码" : "解码"}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex flex-col gap-1 flex-1">
        <label htmlFor="base64-input" className="text-xs text-[#858585]">
          输入
        </label>
        <textarea
          id="base64-input"
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          className="flex-1 bg-[#1e1e1e] border border-[#3e3e42] rounded p-3 text-sm font-mono text-[#d4d4d4] outline-none resize-none focus:border-[#007acc]"
          placeholder={mode === "encode" ? "输入要编码的文本..." : "输入 Base64 字符串..."}
        />
      </div>

      {/* Output */}
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center justify-between">
          <label htmlFor="base64-output" className="text-xs text-[#858585]">
            输出
          </label>
          {output && <CopyButton text={output} />}
        </div>
        {error ? (
          <div className="flex-1 bg-[#1e1e1e] border border-red-500/50 rounded p-3 text-sm text-red-400">
            {error}
          </div>
        ) : (
          <textarea
            id="base64-output"
            readOnly
            value={output}
            className="flex-1 bg-[#252526] border border-[#3e3e42] rounded p-3 text-sm font-mono text-[#d4d4d4] outline-none resize-none"
            placeholder="结果将显示在这里..."
          />
        )}
      </div>
    </div>
  );
}
