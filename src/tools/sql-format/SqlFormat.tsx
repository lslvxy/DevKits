import { useEffect, useState } from "react";
import { format } from "sql-formatter";
import { CopyButton } from "../../components/CopyButton.tsx";
import { DualPanel } from "../../components/DualPanel.tsx";
import { getT } from "../../i18n/index.ts";
import { useStore } from "../../core/store.ts";
import { useToolDraft } from "../../core/useToolDraft.ts";

type Dialect = "sql" | "mysql" | "postgresql" | "transactsql";
type PositionDirection = "fromStart" | "fromEnd";
type OutputMode = "formatted" | "inline";

const DIALECTS: { value: Dialect; label: string }[] = [
  { value: "sql", label: "标准 SQL" },
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "transactsql", label: "T-SQL" },
];

const FROM_PATTERN = /\bFROM\s+([`"\w.]+)/i;
const WHERE_PATTERN = /\bWHERE\b([\s\S]*?)(?=\bGROUP\s+BY\b|\bORDER\s+BY\b|\bLIMIT\b|;|$)/i;
const CONDITION_PATTERN =
  /((?:[`"]?[A-Za-z_][\w$]*[`"]?\.)?[`"]?[A-Za-z_][\w$]*[`"]?)\s*(=|IN)\s*(?:'([^']+)'|\(([^)]*)\))/gi;
const IN_VALUE_PATTERN = /'([^']+)'/g;
const UNION_SPLIT_PATTERN = /\bUNION\s+ALL\b/i;
const SELECT_BLOCK_PATTERN = /SELECT[\s\S]*?(?=\bUNION\s+ALL\b|;|$)/gi;

type ParsedCondition = {
  fieldExpr: string;
  operator: "=" | "IN";
  rawExpression: string;
  values: string[];
};

type SelectedShardCondition =
  | {
      kind: "eq";
      condition: ParsedCondition;
      shard: number;
    }
  | {
      kind: "in";
      condition: ParsedCondition;
      grouped: Map<number, string[]>;
    };

function padNumeric(value: number, width: number): string {
  return String(value).padStart(width, "0");
}

function buildShardedTableRef(originalRef: string, tableShardValue: number): string {
  const ref = originalRef.trim();
  const [schemaPartRaw, tablePartRaw] = ref.includes(".")
    ? (ref.split(".", 2) as [string, string])
    : ["", ref];

  const schemaPart = schemaPartRaw.replace(/^[`"]|[`"]$/g, "");
  const tablePart = tablePartRaw.replace(/^[`"]|[`"]$/g, "");

  const schemaMatch = schemaPart.match(/^([A-Za-z_]+)(\d+)?$/);
  const tableMatch = tablePart.match(/^([A-Za-z_]+_)(\d+)$/);

  const schemaPrefix = schemaMatch?.[1] ?? "aqc";
  const schemaWidth = schemaMatch?.[2]?.length ?? 2;
  const tablePrefix = tableMatch?.[1] ?? "aqc_base_";
  const tableWidth = tableMatch?.[2]?.length ?? 3;

  const dbShardValue = Math.floor(tableShardValue / 10);
  const schemaName = `${schemaPrefix}${padNumeric(dbShardValue, schemaWidth)}`;
  const tableName = `${tablePrefix}${padNumeric(tableShardValue, tableWidth)}`;

  return `${schemaName}.${tableName}`;
}

function extractShardByPosition(
  source: string,
  direction: PositionDirection,
  start: number,
  end: number,
): number | null {
  const normalized = source.trim();
  if (!normalized || start < 1 || end < start) {
    return null;
  }

  const length = normalized.length;
  let startIndex = 0;
  let endIndex = 0;

  if (direction === "fromEnd") {
    startIndex = length - end;
    endIndex = length - start + 1;
  } else {
    startIndex = start - 1;
    endIndex = end;
  }

  if (startIndex < 0 || endIndex > length || startIndex >= endIndex) {
    return null;
  }

  const slice = normalized.slice(startIndex, endIndex);
  if (!/^\d+$/.test(slice)) {
    return null;
  }

  return Number.parseInt(slice, 10);
}

function parseWhereConditions(selectSql: string): ParsedCondition[] {
  const whereMatch = selectSql.match(WHERE_PATTERN);
  if (!whereMatch?.[1]) {
    return [];
  }

  const whereClause = whereMatch[1];
  const conditions: ParsedCondition[] = [];
  for (const match of whereClause.matchAll(CONDITION_PATTERN)) {
    const fieldExpr = match[1];
    const operator = (match[2] ?? "").toUpperCase() as "=" | "IN";
    const rawExpression = match[0];

    if (!fieldExpr || !rawExpression || (operator !== "=" && operator !== "IN")) {
      continue;
    }

    if (operator === "=") {
      const value = match[3];
      if (!value) {
        continue;
      }
      conditions.push({
        fieldExpr,
        operator,
        rawExpression,
        values: [value],
      });
      continue;
    }

    const inBody = match[4] ?? "";
    const values = Array.from(inBody.matchAll(IN_VALUE_PATTERN)).map((m) => m[1]);
    if (values.length === 0) {
      continue;
    }

    conditions.push({
      fieldExpr,
      operator,
      rawExpression,
      values,
    });
  }

  return conditions;
}

function selectShardCondition(
  selectSql: string,
  direction: PositionDirection,
  start: number,
  end: number,
): SelectedShardCondition | null {
  const conditions = parseWhereConditions(selectSql);
  for (const condition of conditions) {
    if (condition.operator === "=") {
      const shard = extractShardByPosition(condition.values[0], direction, start, end);
      if (shard !== null) {
        return {
          kind: "eq",
          condition,
          shard,
        };
      }
      continue;
    }

    const grouped = new Map<number, string[]>();
    let allValuesValid = true;
    for (const value of condition.values) {
      const shard = extractShardByPosition(value, direction, start, end);
      if (shard === null) {
        allValuesValid = false;
        break;
      }
      const group = grouped.get(shard) ?? [];
      group.push(value);
      grouped.set(shard, group);
    }

    if (allValuesValid && grouped.size > 0) {
      return {
        kind: "in",
        condition,
        grouped,
      };
    }
  }

  return null;
}

function rewriteSelectBlockByShard(
  selectSql: string,
  direction: PositionDirection,
  start: number,
  end: number,
): string {
  const fromMatch = selectSql.match(FROM_PATTERN);
  if (!fromMatch?.[1]) {
    return selectSql;
  }

  const selected = selectShardCondition(selectSql, direction, start, end);
  if (!selected) {
    return selectSql;
  }

  const tableRef = fromMatch[1];

  if (selected.kind === "eq") {
    const targetTable = buildShardedTableRef(tableRef, selected.shard);
    return selectSql.replace(FROM_PATTERN, `FROM ${targetTable}`);
  }

  const rewrittenBlocks = Array.from(selected.grouped.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([shard, groupValues]) => {
      const targetTable = buildShardedTableRef(tableRef, shard);
      const rewrittenIn = `${selected.condition.fieldExpr} IN (${groupValues
        .map((value) => `'${value}'`)
        .join(", ")})`;

      return selectSql
        .replace(FROM_PATTERN, `FROM ${targetTable}`)
        .replace(selected.condition.rawExpression, rewrittenIn);
    });

  return rewrittenBlocks.join("\nUNION ALL\n");
}

function rewriteSqlWithSharding(
  sql: string,
  direction: PositionDirection,
  start: number,
  end: number,
): string {
  const trimmed = sql.trim();
  if (!trimmed) {
    return sql;
  }

  const hasUnion = UNION_SPLIT_PATTERN.test(trimmed);
  if (hasUnion) {
    const blocks = trimmed.match(SELECT_BLOCK_PATTERN);
    if (!blocks || blocks.length === 0) {
      return sql;
    }
    const rewritten = blocks.map((block) => rewriteSelectBlockByShard(block.trim(), direction, start, end));
    return rewritten.join("\nUNION ALL\n");
  }

  return rewriteSelectBlockByShard(trimmed, direction, start, end);
}

function toInline(sql: string): string {
  const blocks = sql.split(/\bUNION\s+ALL\b/gi);
  const inlined = blocks.map((block) => block.replace(/\s+/g, " ").trim());
  return inlined.length > 1 ? inlined.join("\nUNION ALL\n") : (inlined[0] ?? sql);
}

export function SqlFormatTool() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
  const [input, setInput] = useToolDraft("sql-format:input");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [dialect, setDialect] = useState<Dialect>("sql");
  const [indent, setIndent] = useState(2);
  const [enableShardRewrite, setEnableShardRewrite] = useState(false);
  const [positionDirection, setPositionDirection] = useState<PositionDirection>("fromEnd");
  const [positionStart, setPositionStart] = useState(11);
  const [positionEnd, setPositionEnd] = useState(12);
  const [outputMode, setOutputMode] = useState<OutputMode>("formatted");

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }
    try {
      const formatted = format(input, {
        language: dialect,
        tabWidth: indent,
        keywordCase: "upper",
      });
      const rewritten = enableShardRewrite
        ? rewriteSqlWithSharding(formatted, positionDirection, positionStart, positionEnd)
        : formatted;
      const result = outputMode === "inline" ? toInline(rewritten) : rewritten;
      setOutput(result);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [input, dialect, indent, enableShardRewrite, positionDirection, positionStart, positionEnd, outputMode]);

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
            {t.tools.sqlFormat.indent}
          </label>
          <select
            id="sql-indent"
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="rounded border border-[#3e3e42] bg-[#1e1e1e] px-2 py-1 text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
          >
            <option value={2}>{t.tools.sqlFormat.indent2}</option>
            <option value={4}>{t.tools.sqlFormat.indent4}</option>
          </select>
        </div>
        <div className="flex items-center overflow-hidden rounded border border-[#3e3e42]">
          <button
            type="button"
            onClick={() => setOutputMode("formatted")}
            className={`px-2 py-1 text-xs ${
              outputMode === "formatted"
                ? "bg-[#007acc] text-white"
                : "bg-[#1e1e1e] text-[#858585] hover:text-[#d4d4d4]"
            }`}
          >
            {t.tools.sqlFormat.outputModeFormatted}
          </button>
          <button
            type="button"
            onClick={() => setOutputMode("inline")}
            className={`px-2 py-1 text-xs ${
              outputMode === "inline"
                ? "bg-[#007acc] text-white"
                : "bg-[#1e1e1e] text-[#858585] hover:text-[#d4d4d4]"
            }`}
          >
            {t.tools.sqlFormat.outputModeInline}
          </button>
        </div>
        <label className="flex items-center gap-2 text-xs text-[#d4d4d4]">
          <input
            type="checkbox"
            checked={enableShardRewrite}
            onChange={(e) => setEnableShardRewrite(e.target.checked)}
            className="h-4 w-4 rounded border border-[#3e3e42] bg-[#1e1e1e]"
          />
          {t.tools.sqlFormat.shardRewrite}
        </label>
        {enableShardRewrite && (
          <>
            <div className="flex items-center gap-2">
              <label htmlFor="sql-pos-direction" className="text-xs text-[#858585]">
                {t.tools.sqlFormat.positionDirection}
              </label>
              <select
                id="sql-pos-direction"
                value={positionDirection}
                onChange={(e) => setPositionDirection(e.target.value as PositionDirection)}
                className="w-20 rounded border border-[#3e3e42] bg-[#1e1e1e] px-2 py-1 text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
              >
                <option value="fromStart">{t.tools.sqlFormat.fromStart}</option>
                <option value="fromEnd">{t.tools.sqlFormat.fromEnd}</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sql-pos-start" className="text-xs text-[#858585]">
                {t.tools.sqlFormat.positionStart}
              </label>
              <input
                id="sql-pos-start"
                type="number"
                min={1}
                value={positionStart}
                onChange={(e) => setPositionStart(Math.max(1, Number(e.target.value) || 1))}
                className="w-20 rounded border border-[#3e3e42] bg-[#1e1e1e] px-2 py-1 text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sql-pos-end" className="text-xs text-[#858585]">
                {t.tools.sqlFormat.positionEnd}
              </label>
              <input
                id="sql-pos-end"
                type="number"
                min={positionStart}
                value={positionEnd}
                onChange={(e) => setPositionEnd(Math.max(positionStart, Number(e.target.value) || positionStart))}
                className="w-20 rounded border border-[#3e3e42] bg-[#1e1e1e] px-2 py-1 text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
              />
            </div>
          </>
        )}
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
