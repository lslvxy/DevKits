import { useEffect, useRef, useState } from "react";
import { ToolWorkbench, toolInputClass } from "../../components/ToolWorkbench.tsx";
import { useStore } from "../../core/store.ts";
import { useToolDraft } from "../../core/useToolDraft.ts";
import { processGzip } from "./parsers/gzip.ts";

export function GzipTool() {
  const zh = useStore((s) => s.locale) === "zh";
  const [input, setInput] = useToolDraft("gzip:input");
  const [mode, setMode] = useState<"compress" | "decompress">("compress");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      controller.current?.abort();
      controller.current = null;
    },
    []
  );
  const run = async () => {
    if (controller.current) return;
    const task = new AbortController();
    controller.current = task;
    setBusy(true);
    setOutput("");
    setError("");
    const result = await processGzip(input, mode, task.signal);
    if (controller.current !== task) return;
    controller.current = null;
    setBusy(false);
    setOutput(result.success ? result.data : "");
    setError(result.success ? "" : result.error);
  };
  const cancel = () => {
    controller.current?.abort();
  };
  return (
    <ToolWorkbench
      input={input}
      onChange={setInput}
      output={output}
      error={error}
      onRun={run}
      busy={busy}
      hint={
        zh
          ? "压缩 UTF-8 文本为 Gzip Base64，或反向解码。输入和输出各限 16 MiB；使用系统压缩流，切换工具会取消任务。"
          : "Compress UTF-8 text to Gzip Base64 or decode it. Input and output are each limited to 16 MiB; uses system compression streams and cancels on tool switch."
      }
      controls={
        <>
          <select
            aria-label={zh ? "操作" : "Operation"}
            value={mode}
            disabled={busy}
            onChange={(e) => setMode(e.target.value as "compress" | "decompress")}
            className={toolInputClass}
          >
            <option value="compress">{zh ? "文本 → Gzip Base64" : "Text → Gzip Base64"}</option>
            <option value="decompress">{zh ? "Gzip Base64 → 文本" : "Gzip Base64 → Text"}</option>
          </select>
          {busy && (
            <button type="button" onClick={cancel} className={toolInputClass}>
              {zh ? "取消" : "Cancel"}
            </button>
          )}
        </>
      }
    />
  );
}
