import type { ReactNode } from "react";
import { useStore } from "../core/store.ts";
import { CopyButton } from "./CopyButton.tsx";
import { DualPanel } from "./DualPanel.tsx";

export const toolInputClass =
  "rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]";

type Props = {
  input: string;
  onChange: (value: string) => void;
  output: string;
  error: string;
  onRun: () => void;
  controls?: ReactNode;
  hint?: string;
  busy?: boolean;
  preview?: ReactNode;
};

export function ToolWorkbench({
  input,
  onChange,
  output,
  error,
  onRun,
  controls,
  hint,
  busy = false,
  preview,
}: Props) {
  const zh = useStore((s) => s.locale) === "zh";
  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden p-6">
      <div className="flex flex-wrap items-center gap-2">
        {controls}
        <button
          type="button"
          onClick={onRun}
          disabled={busy}
          className="rounded bg-[#007acc] px-4 py-2 text-sm text-white hover:bg-[#005a9e]"
        >
          {busy ? (zh ? "处理中…" : "Processing…") : zh ? "处理" : "Run"}
        </button>
      </div>
      {hint && <p className="text-xs text-[#888]">{hint}</p>}
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <div className="min-h-0 flex-1 overflow-hidden">
        <DualPanel
          left={
            <div className="flex h-full flex-col gap-2 p-3">
              <label htmlFor="tool-source" className="text-sm text-[#d4d4d4]">
                {zh ? "输入" : "Input"}
              </label>
              <textarea
                id="tool-source"
                spellCheck={false}
                value={input}
                onChange={(e) => onChange(e.target.value)}
                className={`${toolInputClass} min-h-0 flex-1 resize-none font-mono`}
              />
            </div>
          }
          right={
            <div className="flex h-full flex-col gap-2 p-3">
              <div className="flex items-center justify-between text-sm text-[#d4d4d4]">
                <label htmlFor="tool-output">
                  {zh ? "结果（修改输入后请重新处理）" : "Result (run again after editing)"}
                </label>
                <CopyButton text={output} />
              </div>
              {preview ?? (
                <textarea
                  id="tool-output"
                  readOnly
                  spellCheck={false}
                  value={output}
                  className={`${toolInputClass} min-h-0 flex-1 resize-none font-mono`}
                />
              )}
            </div>
          }
        />
      </div>
    </div>
  );
}
