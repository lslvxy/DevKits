import { useState } from "react";
import { ToolWorkbench, toolInputClass } from "../../components/ToolWorkbench.tsx";
import { useStore } from "../../core/store.ts";
import { useToolDraft } from "../../core/useToolDraft.ts";
import { processEntities } from "./parsers/htmlEntities.ts";

export function HtmlEntitiesTool() {
  const zh = useStore((s) => s.locale) === "zh";
  const [input, setInput] = useToolDraft("html-entities:input");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const run = () => {
    const result = processEntities(input, mode);
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
          ? "支持 &amp;、&lt;、&#169;、&#x1F600; 等实体；解码结果仅作为文本展示。"
          : "Supports named, decimal and hexadecimal entities; decoded output is displayed as plain text."
      }
      controls={
        <select
          aria-label={zh ? "操作" : "Operation"}
          value={mode}
          onChange={(e) => setMode(e.target.value as "encode" | "decode")}
          className={toolInputClass}
        >
          <option value="encode">{zh ? "编码" : "Encode"}</option>
          <option value="decode">{zh ? "解码" : "Decode"}</option>
        </select>
      }
    />
  );
}
