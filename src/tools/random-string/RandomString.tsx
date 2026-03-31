import { useState } from "react";
import { CopyButton } from "../../components/CopyButton.tsx";

const CHARSETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

type ResultItem = { id: string; value: string };

function secureRandom(charset: string, length: number, count: number): ResultItem[] {
  const buf = new Uint32Array(length * count);
  crypto.getRandomValues(buf);
  return Array.from({ length: count }, (_, i) => ({
    id: String(i),
    value: Array.from({ length }, (__, j) => charset[buf[i * length + j] % charset.length]).join(
      ""
    ),
  }));
}

export function RandomStringTool() {
  const [length, setLength] = useState(16);
  const [count, setCount] = useState(1);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [error, setError] = useState("");

  const generate = () => {
    let charset = "";
    if (useUpper) charset += CHARSETS.upper;
    if (useLower) charset += CHARSETS.lower;
    if (useDigits) charset += CHARSETS.digits;
    if (useSymbols) charset += CHARSETS.symbols;

    if (!charset) {
      setError("请至少选择一种字符类型");
      return;
    }
    setError("");
    setResults(secureRandom(charset, length, count));
  };

  return (
    <div className="flex h-full flex-col gap-6 overflow-auto p-6">
      <div className="rounded-lg border border-[#3e3e42] bg-[#252526] p-4">
        <h3 className="mb-4 text-sm font-medium text-[#d4d4d4]">生成选项</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="rand-length" className="text-xs text-[#858585]">
              长度:
            </label>
            <input
              id="rand-length"
              type="number"
              min={1}
              max={256}
              value={length}
              onChange={(e) => setLength(Math.max(1, Math.min(256, Number(e.target.value))))}
              className="w-16 rounded border border-[#3e3e42] bg-[#1e1e1e] px-2 py-1 text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="rand-count" className="text-xs text-[#858585]">
              数量:
            </label>
            <input
              id="rand-count"
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
              className="w-16 rounded border border-[#3e3e42] bg-[#1e1e1e] px-2 py-1 text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {(
              [
                { key: "upper", label: "大写 (A-Z)", state: useUpper, set: setUseUpper },
                { key: "lower", label: "小写 (a-z)", state: useLower, set: setUseLower },
                { key: "digits", label: "数字 (0-9)", state: useDigits, set: setUseDigits },
                { key: "symbols", label: "符号 (!@#…)", state: useSymbols, set: setUseSymbols },
              ] as const
            ).map(({ key, label, state, set }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-1.5 text-xs text-[#858585]"
              >
                <input
                  type="checkbox"
                  checked={state}
                  onChange={(e) => set(e.target.checked)}
                  className="accent-[#007acc]"
                />
                {label}
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={generate}
            className="rounded bg-[#007acc] px-4 py-1.5 text-sm text-white transition-colors hover:bg-[#005a9e]"
          >
            生成
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      {results.length > 0 && (
        <div className="rounded-lg border border-[#3e3e42] bg-[#252526] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#d4d4d4]">结果</h3>
            <CopyButton text={results.map((r) => r.value).join("\n")} />
          </div>
          <div className="flex flex-col gap-1.5">
            {results.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 rounded bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-[#9cdcfe]"
              >
                <span className="break-all">{item.value}</span>
                <CopyButton text={item.value} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
