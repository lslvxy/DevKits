import { useEffect, useState } from "react";
import { CopyButton } from "../../components/CopyButton.tsx";
import { DualPanel } from "../../components/DualPanel.tsx";
import { getT } from "../../i18n/index.ts";
import { useStore } from "../../core/store.ts";

const SKIP_PREFIXES = ["PRIMARY", "KEY", "INDEX", "UNIQUE", "FOREIGN", "CONSTRAINT"];

const SQL_TO_JAVA: Record<string, string> = {
  INT: "int",
  INTEGER: "int",
  TINYINT: "int",
  SMALLINT: "int",
  BIGINT: "long",
  FLOAT: "float",
  DOUBLE: "double",
  DECIMAL: "BigDecimal",
  NUMERIC: "BigDecimal",
  VARCHAR: "String",
  TEXT: "String",
  CHAR: "String",
  LONGTEXT: "String",
  MEDIUMTEXT: "String",
  TINYTEXT: "String",
  DATE: "LocalDate",
  DATETIME: "LocalDateTime",
  TIMESTAMP: "LocalDateTime",
  TIME: "LocalTime",
  BOOLEAN: "boolean",
  BOOL: "boolean",
  BIT: "boolean",
  BLOB: "byte[]",
  BINARY: "byte[]",
  VARBINARY: "byte[]",
};

function toPascal(s: string): string {
  return s
    .split(/[_\s]+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join("");
}

function toCamel(s: string): string {
  const p = toPascal(s);
  return p.charAt(0).toLowerCase() + p.slice(1);
}

function extractBody(sql: string): string {
  let depth = 0;
  let start = -1;
  for (let i = 0; i < sql.length; i++) {
    if (sql[i] === "(") {
      if (depth === 0) start = i;
      depth++;
    } else if (sql[i] === ")") {
      depth--;
      if (depth === 0 && start !== -1) {
        return sql.slice(start + 1, i);
      }
    }
  }
  throw new Error(t.tools.sqlPojo.parseError);
}

function convert(sql: string): string {
  const tableMatch = sql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"']?(\w+)[`"']?\s*\(/i);
  if (!tableMatch) throw new Error(t.tools.sqlPojo.noCreateTable);

  const className = toPascal(tableMatch[1]);
  const body = extractBody(sql);

  const fields: { javaType: string; name: string }[] = [];

  for (const rawLine of body.split("\n")) {
    const line = rawLine.replace(/,\s*$/, "").trim();
    if (!line || line === ")" || line === "(") continue;
    const upper = line.toUpperCase();
    if (SKIP_PREFIXES.some((k) => upper.startsWith(k))) continue;

    const m = line.match(/^[`"']?(\w+)[`"']?\s+(\w+)/);
    if (!m) continue;
    const colName = m[1];

    const sqlType = m[2].toUpperCase().replace(/\s*\(.*\)/, "");
    const javaType = SQL_TO_JAVA[sqlType] ?? "String";
    fields.push({ javaType, name: toCamel(colName) });
  }

  const imports: string[] = [];
  if (fields.some((f) => f.javaType === "BigDecimal")) imports.push("import java.math.BigDecimal;");
  if (fields.some((f) => f.javaType === "LocalDate")) imports.push("import java.time.LocalDate;");
  if (fields.some((f) => f.javaType === "LocalDateTime"))
    imports.push("import java.time.LocalDateTime;");
  if (fields.some((f) => f.javaType === "LocalTime")) imports.push("import java.time.LocalTime;");

  const out: string[] = [];
  if (imports.length) {
    out.push(...imports, "");
  }
  out.push(`public class ${className} {`);
  for (const f of fields) {
    out.push(`    private ${f.javaType} ${f.name};`);
  }
  if (fields.length) out.push("");
  for (const f of fields) {
    const cap = f.name.charAt(0).toUpperCase() + f.name.slice(1);
    out.push(`    public ${f.javaType} get${cap}() { return ${f.name}; }`);
    out.push(`    public void set${cap}(${f.javaType} ${f.name}) { this.${f.name} = ${f.name}; }`);
  }
  out.push("}");

  return out.join("\n");
}

export function SqlPojoTool() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
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
      setOutput(convert(input));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setOutput("");
    }
  }, [input]);

  return (
    <div className="flex h-full flex-col gap-4 p-6 overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <DualPanel
          left={
            <div className="flex h-full flex-col gap-2 p-3">
              <h3 className="text-sm font-medium text-[#d4d4d4]">{t.tools.sqlPojo.input}</h3>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  "CREATE TABLE user (\n  id INT NOT NULL,\n  user_name VARCHAR(64),\n  created_at DATETIME\n);"
                }
                className="flex-1 resize-none rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
          }
          right={
            <div className="flex h-full flex-col gap-2 p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#d4d4d4]">Java POJO</h3>
                <CopyButton text={output} />
              </div>
              <textarea
                readOnly
                value={output}
                className="flex-1 resize-none rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-[#4ec9b0] outline-none"
              />
            </div>
          }
        />
      </div>
    </div>
  );
}
