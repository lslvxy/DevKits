import { useState } from "react";
import { ToolWorkbench, toolInputClass } from "../../components/ToolWorkbench.tsx";
import { useStore } from "../../core/store.ts";
import { useToolDraft } from "../../core/useToolDraft.ts";
import { convertBase } from "./parsers/numberBase.ts";

const bases = Array.from({ length: 35 }, (_, i) => i + 2);
export function NumberBaseTool() {
  const zh = useStore((s) => s.locale) === "zh";
  const [input, setInput] = useToolDraft("number-base:input");
  const [from, setFrom] = useState(10);
  const [to, setTo] = useState(16);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const run = () => {
    const result = convertBase(input, from, to);
    setOutput(result.success ? result.data : "");
    setError(result.success ? "" : result.error);
  };
  return (
    <ToolWorkbench
      input={input}
      onChange={setInput}
      output={output}
      error={error}
      onRun={run}
      hint={
        zh
          ? "整数转换保留精度，支持负数及对应的 0b/0o/0x 前缀；不支持小数或补码，最多 4096 位。"
          : "Exact integer conversion with signs and matching 0b/0o/0x prefixes; no fractions or two’s complement. Up to 4096 digits."
      }
      controls={
        <>
          <label className="flex items-center gap-2 text-sm text-[#d4d4d4]">
            {zh ? "输入进制" : "From"}
            <select
              aria-label={zh ? "输入进制" : "Input base"}
              value={from}
              onChange={(e) => setFrom(Number(e.target.value))}
              className={toolInputClass}
            >
              {bases.map((base) => (
                <option key={base} value={base}>
                  {base}
                </option>
              ))}
            </select>
          </label>
          <span className="text-[#888]">→</span>
          <label className="flex items-center gap-2 text-sm text-[#d4d4d4]">
            {zh ? "输出进制" : "To"}
            <select
              aria-label={zh ? "输出进制" : "Output base"}
              value={to}
              onChange={(e) => setTo(Number(e.target.value))}
              className={toolInputClass}
            >
              {bases.map((base) => (
                <option key={base} value={base}>
                  {base}
                </option>
              ))}
            </select>
          </label>
        </>
      }
    />
  );
}
