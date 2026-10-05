import { useState } from "react";
import { ToolWorkbench, toolInputClass } from "../../components/ToolWorkbench.tsx";
import { useStore } from "../../core/store.ts";
import { useToolDraft } from "../../core/useToolDraft.ts";
import { type TextOperation, processText } from "./parsers/textBatch.ts";

const operations: [TextOperation, string, string][] = [
  ["unique", "按行去重", "Deduplicate lines"],
  ["sort", "升序排序", "Sort ascending"],
  ["reverse-sort", "降序排序", "Sort descending"],
  ["trim", "去除行首尾空白", "Trim lines"],
  ["remove-empty", "去除空行", "Remove empty lines"],
  ["upper", "转大写", "Uppercase"],
  ["lower", "转小写", "Lowercase"],
  ["affix", "添加前后缀", "Add prefix/suffix"],
];

export function TextBatchTool() {
  const zh = useStore((s) => s.locale) === "zh";
  const [input, setInput] = useToolDraft("text-batch:input");
  const [prefix, setPrefix] = useToolDraft("text-batch:prefix");
  const [suffix, setSuffix] = useToolDraft("text-batch:suffix");
  const [operation, setOperation] = useState<TextOperation>("unique");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const run = () => {
    const result = processText(input, operation, prefix, suffix);
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
          ? "去重保留首次出现顺序；按行操作统一使用 LF 换行。"
          : "Deduplication preserves first occurrences; line operations use LF separators."
      }
      controls={
        <>
          <select
            aria-label={zh ? "处理方式" : "Operation"}
            value={operation}
            onChange={(e) => setOperation(e.target.value as TextOperation)}
            className={toolInputClass}
          >
            {operations.map(([id, cn, en]) => (
              <option key={id} value={id}>
                {zh ? cn : en}
              </option>
            ))}
          </select>
          {operation === "affix" && (
            <>
              <input
                aria-label={zh ? "前缀" : "Prefix"}
                placeholder={zh ? "前缀" : "Prefix"}
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className={toolInputClass}
              />
              <input
                aria-label={zh ? "后缀" : "Suffix"}
                placeholder={zh ? "后缀" : "Suffix"}
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                className={toolInputClass}
              />
            </>
          )}
        </>
      }
    />
  );
}
