import { useState } from "react";
import { ToolWorkbench, toolInputClass } from "../../components/ToolWorkbench.tsx";
import { useStore } from "../../core/store.ts";
import { useToolDraft } from "../../core/useToolDraft.ts";
import { type XmlMode, processXml } from "./parsers/xmlFormat.ts";

export function XmlFormatTool() {
  const zh = useStore((s) => s.locale) === "zh";
  const [input, setInput] = useToolDraft("xml-format:input");
  const [mode, setMode] = useState<XmlMode>("format");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const run = () => {
    const result = processXml(input, mode);
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
          ? "保留混合文本、CDATA 和 xml:space。校验 XML 语法，不校验 XSD/DTD；不支持 DOCTYPE。"
          : "Preserves mixed text, CDATA and xml:space. Validates XML syntax, not XSD/DTD; DOCTYPE is not supported."
      }
      controls={
        <select
          aria-label={zh ? "操作" : "Operation"}
          value={mode}
          onChange={(e) => setMode(e.target.value as XmlMode)}
          className={toolInputClass}
        >
          <option value="format">{zh ? "格式化" : "Format"}</option>
          <option value="minify">{zh ? "压缩" : "Minify"}</option>
          <option value="validate">{zh ? "校验" : "Validate"}</option>
        </select>
      }
    />
  );
}
