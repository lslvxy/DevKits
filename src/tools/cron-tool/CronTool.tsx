import cronstrue from "cronstrue";
import { useMemo, useState } from "react";
import { getT } from "../../i18n/index.ts";
import { useStore } from "../../core/store.ts";
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
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
  const modes: { id: FieldMode; label: string }[] = [
    { id: "every", label: `${t.tools.cron.everyPrefix} ${label}` },
    { id: "specific", label: t.tools.cron.modeSpecific },
    { id: "range", label: t.tools.cron.modeRange },
    { id: "step", label: t.tools.cron.modeStep },
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
          <span>{t.tools.cron.rangeTo}</span>
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
          <span>{t.tools.cron.stepFrom}</span>
          <input
            type="number"
            min={min}
            max={max}
            value={field.stepStart}
            onChange={(e) => onChange({ ...field, stepStart: Number(e.target.value) })}
            className="w-14 bg-[#3c3c3c] border border-[#3e3e42] rounded px-2 py-1 text-sm text-[#d4d4d4] outline-none focus:border-[#0078d4]"
          />
          <span>{t.tools.cron.stepStartEvery}</span>
          <input
            type="number"
            min={1}
            max={max}
            value={field.stepEvery}
            onChange={(e) => onChange({ ...field, stepEvery: Number(e.target.value) })}
            className="w-14 bg-[#3c3c3c] border border-[#3e3e42] rounded px-2 py-1 text-sm text-[#d4d4d4] outline-none focus:border-[#0078d4]"
          />
          <span>{t.tools.cron.stepRunOnce}</span>
        </div>
      )}

      <div className="mt-2 text-xs text-[#4ec9b0] font-mono">
        {label}: <span className="text-[#9cdcfe]">{fieldToExpr(field)}</span>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function CronTool() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
  const MONTH_NAMES = [
    `1 ${t.tools.cron.fieldMonth}`,
    `2 ${t.tools.cron.fieldMonth}`,
    `3 ${t.tools.cron.fieldMonth}`,
    `4 ${t.tools.cron.fieldMonth}`,
    `5 ${t.tools.cron.fieldMonth}`,
    `6 ${t.tools.cron.fieldMonth}`,
    `7 ${t.tools.cron.fieldMonth}`,
    `8 ${t.tools.cron.fieldMonth}`,
    `9 ${t.tools.cron.fieldMonth}`,
    `10 ${t.tools.cron.fieldMonth}`,
    `11 ${t.tools.cron.fieldMonth}`,
    `12 ${t.tools.cron.fieldMonth}`,
  ];
  const DOW_NAMES = [
    t.tools.cron.fieldWeekday,
    `${t.tools.cron.fieldWeekday} 1`,
    `${t.tools.cron.fieldWeekday} 2`,
    `${t.tools.cron.fieldWeekday} 3`,
    `${t.tools.cron.fieldWeekday} 4`,
    `${t.tools.cron.fieldWeekday} 5`,
    `${t.tools.cron.fieldWeekday} 6`,
  ];

  const PRESETS = [
    { label: t.tools.cron.everyMinute, expr: "* * * * *" },
    { label: t.tools.cron.everyHour, expr: "0 * * * *" },
    { label: t.tools.cron.everyDay, expr: "0 0 * * *" },
    { label: t.tools.cron.everyMonday, expr: "0 0 * * 1" },
    { label: t.tools.cron.everyMonthStart, expr: "0 0 1 * *" },
    { label: t.tools.cron.everyQuarterStart, expr: "0 0 1 1,4,7,10 *" },
    { label: t.tools.cron.workdayNine, expr: "0 9 * * 1-5" },
    { label: t.tools.cron.every5Minutes, expr: "*/5 * * * *" },
  ];

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
        <h3 className="text-sm font-medium text-[#d4d4d4] mb-3">{t.tools.cron.presets}</h3>
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
        {(["builder", "manual"] as const).map((tabId) => (
          <button
            key={tabId}
            type="button"
            onClick={() => setTab(tabId)}
            className={`px-4 py-1.5 text-sm rounded transition-colors ${
              tab === tabId
                ? "bg-[#0078d4] text-white"
                : "bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4c4c4c]"
            }`}
          >
            {tabId === "builder" ? t.tools.cron.visual : t.tools.cron.expression}
          </button>
        ))}
      </div>

      {tab === "builder" ? (
        <div className="flex flex-col gap-3 bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
          <h3 className="text-sm font-medium text-[#d4d4d4] mb-1">{t.tools.cron.visual}</h3>
          <FieldEditor label={t.tools.cron.fieldMinute} field={minute} min={0} max={59} onChange={setMinute} />
          <FieldEditor label={t.tools.cron.fieldHour} field={hour} min={0} max={23} onChange={setHour} />
          <FieldEditor label={t.tools.cron.fieldDay} field={dom} min={1} max={31} onChange={setDom} />
          <FieldEditor
            label={t.tools.cron.fieldMonth}
            field={month}
            min={1}
            max={12}
            names={MONTH_NAMES}
            onChange={setMonth}
          />
          <FieldEditor label={t.tools.cron.fieldWeekday} field={dow} min={0} max={6} names={DOW_NAMES} onChange={setDow} />
        </div>
      ) : (
        <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
          <h3 className="text-sm font-medium text-[#d4d4d4] mb-2">{t.tools.cron.expression}</h3>
          <p className="text-xs text-[#858585] mb-2">{t.tools.cron.humanReadable}</p>
          <input
            type="text"
            value={manualExpr}
            onChange={(e) => setManualExpr(e.target.value)}
            placeholder={t.tools.cron.expressionPlaceholder}
            className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 text-sm text-[#9cdcfe] font-mono placeholder-[#858585] outline-none focus:border-[#0078d4]"
          />
        </div>
      )}

      {/* Result */}
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <h3 className="text-sm font-medium text-[#d4d4d4] mb-3">{t.tools.cron.humanReadable}</h3>
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-xs text-[#858585] block mb-1">{t.tools.cron.expression}</span>
            <code className="text-[#9cdcfe] font-mono text-sm bg-[#1e1e1e] px-3 py-1.5 rounded block">
              {cronExpr || "—"}
            </code>
          </div>
          <div>
            <span className="text-xs text-[#858585] block mb-1">{t.tools.cron.humanReadable}</span>
            <div className="text-sm text-[#d4d4d4] bg-[#1e1e1e] px-3 py-1.5 rounded">
              {description ?? <span className="text-red-400">{t.tools.cron.invalidExpression}</span>}
            </div>
          </div>
          {nextTimes && nextTimes.length > 0 && (
            <div>
              <span className="text-xs text-[#858585] block mb-1">{t.tools.cron.nextRuns}</span>
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
        <h3 className="text-sm font-medium text-[#d4d4d4] mb-2">{t.tools.cron.fields}</h3>
        <div className="grid grid-cols-5 gap-2 text-xs">
          {[
            { f: t.tools.cron.fieldMinute, r: "0-59" },
            { f: t.tools.cron.fieldHour, r: "0-23" },
            { f: t.tools.cron.fieldDay, r: "1-31" },
            { f: t.tools.cron.fieldMonth, r: "1-12" },
            { f: t.tools.cron.fieldWeekday, r: "0-6" },
          ].map(({ f, r }) => (
            <div key={f} className="bg-[#1e1e1e] rounded p-2">
              <div className="text-[#9cdcfe] font-medium">{f}</div>
              <div className="text-[#858585] mt-0.5">{r}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-[#858585] space-y-0.5">
          <p>
            <span className="text-[#9cdcfe]">*</span> {t.tools.cron.legendAnyValue} &nbsp;{" "}
            <span className="text-[#9cdcfe]">,</span> {t.tools.cron.legendList} &nbsp;{" "}
            <span className="text-[#9cdcfe]">-</span> {t.tools.cron.legendRange} &nbsp;{" "}
            <span className="text-[#9cdcfe]">/</span> {t.tools.cron.legendStep}
          </p>
        </div>
      </div>
    </div>
  );
}
