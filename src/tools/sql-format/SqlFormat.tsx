import { useEffect, useState } from "react";
import { format } from "sql-formatter";
import { CopyButton } from "../../components/CopyButton.tsx";
import { DualPanel } from "../../components/DualPanel.tsx";
import { getT } from "../../i18n/index.ts";
import { useStore } from "../../core/store.ts";

type Dialect = "sql" | "mysql" | "postgresql" | "transactsql";

const DIALECTS: { value: Dialect; label: string }[] = [
  { value: "sql", label: "标准 SQL" },
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "transactsql", label: "T-SQL" },
];

export function SqlFormatTool() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [dialect, setDialect] = useState<Dialect>("sql");
  const [indent, setIndent] = useState(2);

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }
    try {
      const result = format(input, {
        language: dialect,
        tabWidth: indent,
        keywordCase: "upper",
      });
      setOutput(result);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [input, dialect, indent]);

  return (
    <div className="flex h-full flex-col gap-4 p-6 overflow-hidden">
      {/* Options bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-[#3e3e42] bg-[#252526] p-3">
        <div className="flex items-center gap-2">
          <label htmlFor="sql-dialect" className="text-xs text-[#858585]">
            {t.tools.sqlFormat.dialect}
          </label>
          <select
            id="sql-dialect"
            value={dialect}
            onChange={(e) => setDialect(e.target.value as Dialect)}
            className="rounded border border-[#3e3e42] bg-[#1e1e1e] px-2 py-1 text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
          >
            {DIALECTS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sql-indent" className="text-xs text-[#858585]">
            Indent:
          </label>
          <select
            id="sql-indent"
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="rounded border border-[#3e3e42] bg-[#1e1e1e] px-2 py-1 text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
          >
            <option value={2}>2 空格</option>
            <option value={4}>4 空格</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <DualPanel
          left={
            <div className="flex h-full flex-col gap-2 p-3">
              <h3 className="text-sm font-medium text-[#d4d4d4]">{t.tools.sqlFormat.input}</h3>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.tools.sqlFormat.input}
                className="flex-1 resize-none rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
          }
          right={
            <div className="flex h-full flex-col gap-2 p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#d4d4d4]">{t.tools.sqlFormat.output}</h3>
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
