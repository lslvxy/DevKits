import cronstrue from "cronstrue";
import { useMemo, useState } from "react";
import "cronstrue/locales/zh_CN";

// ─── Next execution times ────────────────────────────────────────────────────
function parseField(field: string, min: number, max: number): number[] | null {
  const result: number[] = [];
  const parts = field.split(",");
  for (const part of parts) {
    if (part === "*") {
      for (let i = min; i <= max; i++) result.push(i);
    } else if (part.includes("/")) {
      const [range, step] = part.split("/");
      const stepNum = Number(step);
      if (Number.isNaN(stepNum)) return null;
      const start = range === "*" ? min : Number(range);
      if (Number.isNaN(start)) return null;
      for (let i = start; i <= max; i += stepNum) result.push(i);
    } else if (part.includes("-")) {
      const [from, to] = part.split("-").map(Number);
      if (Number.isNaN(from) || Number.isNaN(to)) return null;
      for (let i = from; i <= to; i++) result.push(i);
    } else {
      const n = Number(part);
      if (Number.isNaN(n)) return null;
      result.push(n);
    }
  }
  return [...new Set(result)].sort((a, b) => a - b);
}

function getNextTimes(cronExpr: string, count: number): Date[] | null {
  const parts = cronExpr.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const [minuteF, hourF, domF, monthF, dowF] = parts;
  const minutes = parseField(minuteF, 0, 59);
  const hours = parseField(hourF, 0, 23);
  const doms = parseField(domF, 1, 31);
  const months = parseField(monthF, 1, 12);
  const dows = parseField(dowF, 0, 6);
  if (!minutes || !hours || !doms || !months || !dows) return null;

  const results: Date[] = [];
  const start = new Date();
  start.setSeconds(0, 0);
  start.setMinutes(start.getMinutes() + 1);

  const d = new Date(start);
  let iterations = 0;
  while (results.length < count && iterations < 100000) {
    iterations++;
    if (!months.includes(d.getMonth() + 1)) {
      d.setMonth(d.getMonth() + 1);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      continue;
    }
    if (!doms.includes(d.getDate()) || !dows.includes(d.getDay())) {
      d.setDate(d.getDate() + 1);
      d.setHours(0, 0, 0, 0);
      continue;
    }
    if (!hours.includes(d.getHours())) {
      d.setHours(d.getHours() + 1);
      d.setMinutes(0, 0, 0);
      continue;
    }
    if (!minutes.includes(d.getMinutes())) {
      d.setMinutes(d.getMinutes() + 1, 0, 0);
      continue;
    }
    results.push(new Date(d));
    d.setMinutes(d.getMinutes() + 1, 0, 0);
  }
  return results;
}

// ─── Visual Builder State ────────────────────────────────────────────────────
type FieldMode = "every" | "specific" | "range" | "step";

interface CronField {
  mode: FieldMode;
  specific: number[];
  rangeFrom: number;
  rangeTo: number;
  stepStart: number;
  stepEvery: number;
}

function defaultField(min: number, max: number): CronField {
  return {
    mode: "every",
    specific: [min],
    rangeFrom: min,
    rangeTo: max,
    stepStart: min,
    stepEvery: 1,
  };
}

function fieldToExpr(f: CronField): string {
  switch (f.mode) {
    case "every":
      return "*";
    case "specific":
      return f.specific.length > 0 ? f.specific.sort((a, b) => a - b).join(",") : "*";
    case "range":
      return `${f.rangeFrom}-${f.rangeTo}`;
    case "step":
      return `${f.stepStart === 0 || f.stepStart === 1 ? "*" : f.stepStart}/${f.stepEvery}`;
  }
}

function toCronExpr(
  minute: CronField,
  hour: CronField,
  dom: CronField,
  month: CronField,
  dow: CronField
): string {
  return `${fieldToExpr(minute)} ${fieldToExpr(hour)} ${fieldToExpr(dom)} ${fieldToExpr(month)} ${fieldToExpr(dow)}`;
}

// ─── Field Editor ────────────────────────────────────────────────────────────
function FieldEditor({
  label,
  field,
  min,
  max,
  names,
  onChange,
}: {
  label: string;
  field: CronField;
  min: number;
  max: number;
  names?: string[];
  onChange: (f: CronField) => void;
}) {
  const modes: { id: FieldMode; label: string }[] = [
    { id: "every", label: `每${label}` },
    { id: "specific", label: "指定" },
    { id: "range", label: "范围" },
    { id: "step", label: "间隔" },
  ];

  const toggleSpecific = (v: number) => {
    const s = new Set(field.specific);
    if (s.has(v)) {
      s.delete(v);
    } else {
      s.add(v);
    }
    onChange({ ...field, specific: [...s] });
  };

  return (
    <div className="bg-[#1e1e1e] rounded-lg p-3 border border-[#3e3e42]">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-[#d4d4d4] w-8">{label}</span>
        <div className="flex gap-1">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange({ ...field, mode: m.id })}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                field.mode === m.id
                  ? "bg-[#0078d4] text-white"
                  : "bg-[#3c3c3c] text-[#858585] hover:bg-[#4c4c4c]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {field.mode === "specific" && (
        <div className="flex flex-wrap gap-1 mt-2">
          {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => toggleSpecific(v)}
              className={`min-w-[28px] h-7 px-1 text-xs rounded transition-colors ${
                field.specific.includes(v)
                  ? "bg-[#0078d4] text-white"
                  : "bg-[#3c3c3c] text-[#858585] hover:bg-[#4c4c4c]"
              }`}
            >
              {names ? names[v - min] : v}
            </button>
          ))}
        </div>
      )}

      {field.mode === "range" && (
        <div className="flex items-center gap-2 mt-2 text-xs text-[#858585]">
          <input
            type="number"
            min={min}
            max={field.rangeTo}
            value={field.rangeFrom}
            onChange={(e) => onChange({ ...field, rangeFrom: Number(e.target.value) })}
            className="w-14 bg-[#3c3c3c] border border-[#3e3e42] rounded px-2 py-1 text-sm text-[#d4d4d4] outline-none focus:border-[#0078d4]"
          />
          <span>到</span>
          <input
            type="number"
            min={field.rangeFrom}
            max={max}
            value={field.rangeTo}
            onChange={(e) => onChange({ ...field, rangeTo: Number(e.target.value) })}
            className="w-14 bg-[#3c3c3c] border border-[#3e3e42] rounded px-2 py-1 text-sm text-[#d4d4d4] outline-none focus:border-[#0078d4]"
          />
        </div>
      )}

      {field.mode === "step" && (
        <div className="flex items-center gap-2 mt-2 text-xs text-[#858585]">
          <span>从</span>
          <input
            type="number"
            min={min}
            max={max}
            value={field.stepStart}
            onChange={(e) => onChange({ ...field, stepStart: Number(e.target.value) })}
            className="w-14 bg-[#3c3c3c] border border-[#3e3e42] rounded px-2 py-1 text-sm text-[#d4d4d4] outline-none focus:border-[#0078d4]"
          />
          <span>开始，每</span>
          <input
            type="number"
            min={1}
            max={max}
            value={field.stepEvery}
            onChange={(e) => onChange({ ...field, stepEvery: Number(e.target.value) })}
            className="w-14 bg-[#3c3c3c] border border-[#3e3e42] rounded px-2 py-1 text-sm text-[#d4d4d4] outline-none focus:border-[#0078d4]"
          />
          <span>执行一次</span>
        </div>
      )}

      <div className="mt-2 text-xs text-[#4ec9b0] font-mono">
        {label}: <span className="text-[#9cdcfe]">{fieldToExpr(field)}</span>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
const MONTH_NAMES = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];
const DOW_NAMES = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

const PRESETS: { label: string; expr: string }[] = [
  { label: "每分钟", expr: "* * * * *" },
  { label: "每小时", expr: "0 * * * *" },
  { label: "每天 0 点", expr: "0 0 * * *" },
  { label: "每周一 0 点", expr: "0 0 * * 1" },
  { label: "每月 1 日 0 点", expr: "0 0 1 * *" },
  { label: "每季度首日", expr: "0 0 1 1,4,7,10 *" },
  { label: "工作日 9 点", expr: "0 9 * * 1-5" },
  { label: "每 5 分钟", expr: "*/5 * * * *" },
];

export function CronTool() {
  const [minute, setMinute] = useState(defaultField(0, 59));
  const [hour, setHour] = useState(defaultField(0, 23));
  const [dom, setDom] = useState(defaultField(1, 31));
  const [month, setMonth] = useState(defaultField(1, 12));
  const [dow, setDow] = useState(defaultField(0, 6));
  const [manualExpr, setManualExpr] = useState("");
  const [tab, setTab] = useState<"builder" | "manual">("builder");

  const cronExpr = tab === "builder" ? toCronExpr(minute, hour, dom, month, dow) : manualExpr;

  const description = useMemo(() => {
    try {
      return cronstrue.toString(cronExpr, { locale: "zh_CN", use24HourTimeFormat: true });
    } catch {
      return null;
    }
  }, [cronExpr]);

  const nextTimes = useMemo(() => {
    try {
      return getNextTimes(cronExpr, 5);
    } catch {
      return null;
    }
  }, [cronExpr]);

  const applyPreset = (expr: string) => {
    setManualExpr(expr);
    setTab("manual");
  };

  const formatDate = (d: Date) =>
    d.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  return (
    <div className="flex flex-col gap-4 p-6 h-full overflow-auto">
      {/* Presets */}
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <h3 className="text-sm font-medium text-[#d4d4d4] mb-3">常用预设</h3>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.expr}
              type="button"
              onClick={() => applyPreset(p.expr)}
              className="px-3 py-1.5 text-xs bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4c4c4c] rounded transition-colors"
            >
              {p.label}
              <span className="ml-1 font-mono text-[#858585]">({p.expr})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {(["builder", "manual"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm rounded transition-colors ${
              tab === t
                ? "bg-[#0078d4] text-white"
                : "bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4c4c4c]"
            }`}
          >
            {t === "builder" ? "可视化编辑" : "手动输入"}
          </button>
        ))}
      </div>

      {tab === "builder" ? (
        <div className="flex flex-col gap-3 bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
          <h3 className="text-sm font-medium text-[#d4d4d4] mb-1">可视化编辑器</h3>
          <FieldEditor label="分" field={minute} min={0} max={59} onChange={setMinute} />
          <FieldEditor label="时" field={hour} min={0} max={23} onChange={setHour} />
          <FieldEditor label="日" field={dom} min={1} max={31} onChange={setDom} />
          <FieldEditor
            label="月"
            field={month}
            min={1}
            max={12}
            names={MONTH_NAMES}
            onChange={setMonth}
          />
          <FieldEditor label="周" field={dow} min={0} max={6} names={DOW_NAMES} onChange={setDow} />
        </div>
      ) : (
        <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
          <h3 className="text-sm font-medium text-[#d4d4d4] mb-2">Cron 表达式</h3>
          <p className="text-xs text-[#858585] mb-2">格式: 分 时 日 月 周</p>
          <input
            type="text"
            value={manualExpr}
            onChange={(e) => setManualExpr(e.target.value)}
            placeholder="例如: 0 9 * * 1-5"
            className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 text-sm text-[#9cdcfe] font-mono placeholder-[#858585] outline-none focus:border-[#0078d4]"
          />
        </div>
      )}

      {/* Result */}
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <h3 className="text-sm font-medium text-[#d4d4d4] mb-3">解析结果</h3>
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-xs text-[#858585] block mb-1">表达式</span>
            <code className="text-[#9cdcfe] font-mono text-sm bg-[#1e1e1e] px-3 py-1.5 rounded block">
              {cronExpr || "—"}
            </code>
          </div>
          <div>
            <span className="text-xs text-[#858585] block mb-1">描述</span>
            <div className="text-sm text-[#d4d4d4] bg-[#1e1e1e] px-3 py-1.5 rounded">
              {description ?? <span className="text-red-400">无效的 Cron 表达式</span>}
            </div>
          </div>
          {nextTimes && nextTimes.length > 0 && (
            <div>
              <span className="text-xs text-[#858585] block mb-1">接下来 5 次执行时间</span>
              <div className="flex flex-col gap-1">
                {nextTimes.map((t, i) => (
                  <div
                    key={t.toISOString()}
                    className="text-xs font-mono text-[#4ec9b0] bg-[#1e1e1e] px-3 py-1.5 rounded"
                  >
                    <span className="text-[#858585] mr-3">#{i + 1}</span>
                    {formatDate(t)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reference */}
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <h3 className="text-sm font-medium text-[#d4d4d4] mb-2">字段说明</h3>
        <div className="grid grid-cols-5 gap-2 text-xs">
          {[
            { f: "分", r: "0-59" },
            { f: "时", r: "0-23" },
            { f: "日", r: "1-31" },
            { f: "月", r: "1-12" },
            { f: "周", r: "0-6 (0=周日)" },
          ].map(({ f, r }) => (
            <div key={f} className="bg-[#1e1e1e] rounded p-2">
              <div className="text-[#9cdcfe] font-medium">{f}</div>
              <div className="text-[#858585] mt-0.5">{r}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-[#858585] space-y-0.5">
          <p>
            <span className="text-[#9cdcfe]">*</span> 每个值 &nbsp;{" "}
            <span className="text-[#9cdcfe]">,</span> 列举 &nbsp;{" "}
            <span className="text-[#9cdcfe]">-</span> 范围 &nbsp;{" "}
            <span className="text-[#9cdcfe]">/</span> 间隔步长
          </p>
        </div>
      </div>
    </div>
  );
}
