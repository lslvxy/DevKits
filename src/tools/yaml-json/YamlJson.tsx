import yaml from "js-yaml";
import { useEffect, useState } from "react";
import { CopyButton } from "../../components/CopyButton.tsx";
import { DualPanel } from "../../components/DualPanel.tsx";
import { getT } from "../../i18n/index.ts";
import { useStore } from "../../core/store.ts";

type Mode = "yaml2json" | "json2yaml";

export function YamlJsonTool() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
  const [mode, setMode] = useState<Mode>("yaml2json");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }
    try {
      if (mode === "yaml2json") {
        const data = yaml.load(input);
        setOutput(JSON.stringify(data, null, 2));
      } else {
        const data = JSON.parse(input) as unknown;
        setOutput(yaml.dump(data, { indent: 2 }));
      }
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t.tools.yamlJson.parseFailed);
      setOutput("");
    }
  }, [input, mode]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setInput("");
    setOutput("");
    setError("");
  };

  const tabCls = (active: boolean) =>
    active
      ? "px-3 py-1 text-sm rounded bg-[#007acc] text-white"
      : "px-3 py-1 text-sm rounded bg-[#3c3c3c] text-[#cccccc] hover:bg-[#4a4a4a]";

  return (
    <div className="flex h-full flex-col gap-4 p-6 overflow-hidden">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => switchMode("yaml2json")}
          className={tabCls(mode === "yaml2json")}
        >
          {t.tools.yamlJson.yamlToJson}
        </button>
        <button
          type="button"
          onClick={() => switchMode("json2yaml")}
          className={tabCls(mode === "json2yaml")}
        >
          {t.tools.yamlJson.jsonToYaml}
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <DualPanel
          left={
            <div className="flex h-full flex-col gap-2 p-3">
              <h3 className="text-sm font-medium text-[#d4d4d4]">
                {mode === "yaml2json" ? "YAML" : "JSON"} {t.tools.yamlJson.input}
              </h3>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === "yaml2json" ? t.tools.yamlJson.input : t.tools.yamlJson.input}
                className="flex-1 resize-none rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
          }
          right={
            <div className="flex h-full flex-col gap-2 p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#d4d4d4]">
                  {mode === "yaml2json" ? "JSON" : "YAML"} {t.tools.yamlJson.output}
                </h3>
                <CopyButton text={output} />
              </div>
              <textarea
                readOnly
                value={output}
                className="flex-1 resize-none rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-[#d4d4d4] outline-none"
              />
            </div>
          }
        />
      </div>
    </div>
  );
}
