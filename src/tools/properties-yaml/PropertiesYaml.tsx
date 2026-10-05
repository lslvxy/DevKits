import { useState } from "react";
import { ToolWorkbench, toolInputClass } from "../../components/ToolWorkbench.tsx";
import { useStore } from "../../core/store.ts";
import { useToolDraft } from "../../core/useToolDraft.ts";
import { convertPropertiesYaml } from "./parsers/propertiesYaml.ts";

type Mode = "properties2yaml" | "yaml2properties";
export function PropertiesYamlTool() {
  const zh = useStore((s) => s.locale) === "zh";
  const [input, setInput] = useToolDraft("properties-yaml:input");
  const [mode, setMode] = useState<Mode>("properties2yaml");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const run = () => {
    const result = convertPropertiesYaml(input, mode);
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
          ? "支持 a.b 和 items[0] 路径、转义、续行。Properties 值保留为字符串；注释不保留，YAML 标量转为字符串。空值、空容器及歧义键会报错。"
          : "Supports a.b and items[0] paths, escapes and continuation lines. Properties values remain strings; comments are omitted and YAML scalars become strings. Null, empty containers and ambiguous keys are rejected."
      }
      controls={
        <select
          aria-label={zh ? "转换方向" : "Direction"}
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          className={toolInputClass}
        >
          <option value="properties2yaml">Properties → YAML</option>
          <option value="yaml2properties">YAML → Properties</option>
        </select>
      }
    />
  );
}
