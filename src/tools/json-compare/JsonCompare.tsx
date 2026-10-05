import { useState } from "react";
import { CopyButton } from "../../components/CopyButton.tsx";
import { DualPanel } from "../../components/DualPanel.tsx";
import { toolInputClass } from "../../components/ToolWorkbench.tsx";
import { useStore } from "../../core/store.ts";
import { useToolDraft } from "../../core/useToolDraft.ts";
import { compareJson } from "./parsers/jsonCompare.ts";

export function JsonCompareTool() {
  const zh = useStore((s) => s.locale) === "zh";
  const [left, setLeft] = useToolDraft("json-compare:left");
  const [right, setRight] = useToolDraft("json-compare:right");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const run = () => {
    const result = compareJson(left, right);
    setOutput(result.success ? result.data : "");
    setError(result.success ? "" : result.error);
  };
  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden p-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={run}
          className="rounded bg-[#007acc] px-4 py-2 text-sm text-white"
        >
          {zh ? "对比" : "Compare"}
        </button>
        <p className="text-xs text-[#888]">
          {zh
            ? "忽略对象键顺序；数组按下标比较。结果路径使用 JSON Pointer，空路径代表根节点。"
            : "Object key order is ignored; arrays are compared by index. Paths use JSON Pointer; an empty path denotes the root."}
        </p>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <div className="min-h-0 flex-1 overflow-hidden">
        <DualPanel
          left={
            <div className="flex h-full flex-col gap-2 p-3">
              <label htmlFor="json-before" className="text-sm text-[#d4d4d4]">
                {zh ? "原 JSON" : "Before JSON"}
              </label>
              <textarea
                id="json-before"
                spellCheck={false}
                value={left}
                onChange={(e) => setLeft(e.target.value)}
                className={`${toolInputClass} min-h-0 flex-1 resize-none font-mono`}
              />
            </div>
          }
          right={
            <div className="flex h-full flex-col gap-2 p-3">
              <label htmlFor="json-after" className="text-sm text-[#d4d4d4]">
                {zh ? "新 JSON" : "After JSON"}
              </label>
              <textarea
                id="json-after"
                spellCheck={false}
                value={right}
                onChange={(e) => setRight(e.target.value)}
                className={`${toolInputClass} min-h-0 flex-1 resize-none font-mono`}
              />
            </div>
          }
        />
      </div>
      <div className="flex items-center justify-between text-sm text-[#d4d4d4]">
        <label htmlFor="json-diff-output">
          {zh ? "差异（修改输入后请重新对比）" : "Differences (compare again after editing)"}
        </label>
        <CopyButton text={output} />
      </div>
      <textarea
        id="json-diff-output"
        readOnly
        value={output}
        className={`${toolInputClass} h-44 shrink-0 resize-none font-mono`}
      />
    </div>
  );
}
