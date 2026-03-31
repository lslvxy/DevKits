import Papa from "papaparse";
import { useEffect, useState } from "react";
import { CopyButton } from "../../components/CopyButton.tsx";
import { DualPanel } from "../../components/DualPanel.tsx";
import { getT } from "../../i18n/index.ts";
import { useStore } from "../../core/store.ts";

type Mode = "csv2json" | "json2csv";

export function CsvJsonTool() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
  const [mode, setMode] = useState<Mode>("csv2json");
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
      if (mode === "csv2json") {
        const result = Papa.parse(input, { header: true, skipEmptyLines: true });
        if (result.errors.length > 0) {
          setError(result.errors[0].message);
          setOutput("");
        } else {
          setOutput(JSON.stringify(result.data, null, 2));
          setError("");
        }
      } else {
        const data = JSON.parse(input) as unknown;
        setOutput(Papa.unparse(data as Parameters<typeof Papa.unparse>[0]));
        setError("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
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
          onClick={() => switchMode("csv2json")}
          className={tabCls(mode === "csv2json")}
        >
          CSV → JSON
        </button>
        <button
          type="button"
          onClick={() => switchMode("json2csv")}
          className={tabCls(mode === "json2csv")}
        >
          JSON → CSV
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <DualPanel
          left={
            <div className="flex h-full flex-col gap-2 p-3">
              <h3 className="text-sm font-medium text-[#d4d4d4]">
                {mode === "csv2json" ? t.tools.csvJson.csvInput : t.tools.csvJson.jsonInput}
              </h3>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`${t.tools.csvJson.inputPlaceholder} ${mode === "csv2json" ? "CSV" : "JSON"}...`}
                className="flex-1 resize-none rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
          }
          right={
            <div className="flex h-full flex-col gap-2 p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#d4d4d4]">
                  {mode === "csv2json" ? t.tools.csvJson.jsonOutput : t.tools.csvJson.csvOutput}
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
