import { useState } from "react";
import { ToolWorkbench, toolInputClass } from "../../components/ToolWorkbench.tsx";
import { useStore } from "../../core/store.ts";
import { useToolDraft } from "../../core/useToolDraft.ts";
import { analyzeStack } from "./parsers/javaStack.ts";

export function JavaStackTool() {
  const zh = useStore((s) => s.locale) === "zh";
  const [input, setInput] = useToolDraft("java-stack:input");
  const [prefix, setPrefix] = useToolDraft("java-stack:prefix");
  const [hideFramework, setHideFramework] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const run = () => {
    const result = analyzeStack(input, prefix, hideFramework);
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
          ? "提取异常链及最深主异常，保留 suppressed 标记和省略帧数量。业务包前缀用逗号分隔；源码位置保留在帧文本中。建议每次输入一个完整异常。"
          : "Extracts the deepest main cause, suppressed markers and omitted-frame counts. Separate business package prefixes with commas; source locations stay in frame text. Paste one complete exception at a time."
      }
      controls={
        <>
          <input
            aria-label={zh ? "业务包前缀" : "Business package prefixes"}
            placeholder="com.example.,org.myapp."
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className={`${toolInputClass} min-w-64 flex-1`}
          />
          <label className="flex items-center gap-2 text-sm text-[#d4d4d4]">
            <input
              type="checkbox"
              checked={hideFramework}
              onChange={(e) => setHideFramework(e.target.checked)}
            />
            {zh ? "隐藏常见框架栈" : "Hide common framework frames"}
          </label>
        </>
      }
    />
  );
}
