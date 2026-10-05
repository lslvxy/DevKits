import { useState } from "react";
import { ToolWorkbench, toolInputClass } from "../../components/ToolWorkbench.tsx";
import { useStore } from "../../core/store.ts";
import { useToolDraft } from "../../core/useToolDraft.ts";
import { queryJson } from "./parsers/jsonpath.ts";

export function JsonPathTool() {
  const zh = useStore((s) => s.locale) === "zh";
  const [input, setInput] = useToolDraft(
    "jsonpath:input",
    '{"users":[{"name":"Alice","age":25},{"name":"Bob","age":16}]}'
  );
  const [expression, setExpression] = useToolDraft("jsonpath:expression", "$.users[*].name");
  const [outputPaths, setOutputPaths] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const run = () => {
    const result = queryJson(input, expression, outputPaths);
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
          ? "RFC 9535：支持通配符、递归、切片和过滤，如 $.users[?@.age >= 18].name；无匹配返回 []。"
          : "RFC 9535: wildcards, recursive descent, slices and filters, e.g. $.users[?@.age >= 18].name; no matches returns []."
      }
      controls={
        <>
          <input
            aria-label="JSONPath"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            className={`${toolInputClass} min-w-64 flex-1 font-mono`}
          />
          <label className="flex items-center gap-2 text-sm text-[#d4d4d4]">
            <input
              type="checkbox"
              checked={outputPaths}
              onChange={(e) => setOutputPaths(e.target.checked)}
            />
            {zh ? "返回路径" : "Return paths"}
          </label>
        </>
      }
    />
  );
}
