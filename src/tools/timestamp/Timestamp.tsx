import { useEffect, useState } from "react";
import { getT } from "../../i18n/index.ts";
import { useStore } from "../../core/store.ts";
import { useToolDraft } from "../../core/useToolDraft.ts";
import { CopyButton } from "../../components/CopyButton.tsx";

function formatWithPattern(date: Date, pattern: string): string {
  const pad = (num: number, width = 2) => String(num).padStart(width, "0");
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absOffset = Math.abs(offsetMinutes);
  const tz = `${sign}${pad(Math.floor(absOffset / 60))}:${pad(absOffset % 60)}`;

  const replacements: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
    SSS: pad(date.getMilliseconds(), 3),
    Z: tz,
  };

  return pattern.replace(/YYYY|MM|DD|HH|mm|ss|SSS|Z/g, (token) => replacements[token] ?? token);
}

export function TimestampTool() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
  const [tsInput, setTsInput] = useToolDraft("timestamp:tsInput");
  const [sourceMode, setSourceMode] = useState<"current" | "specified">("current");
  const [specifiedInput, setSpecifiedInput] = useToolDraft("timestamp:specifiedInput");
  const [formatPattern, setFormatPattern] = useToolDraft("timestamp:formatPattern", "YYYY-MM-DD HH:mm:ss");
  const [dateInput, setDateInput] = useToolDraft("timestamp:dateInput");
  const [tsResult, setTsResult] = useState<string | null>(null);
  const [tsFormattedResult, setTsFormattedResult] = useState<string | null>(null);
  const [dateResult, setDateResult] = useState<string | null>(null);
  const [tsError, setTsError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only effect
  useEffect(() => {
    if (tsInput) convertTimestamp(tsInput);
    if (dateInput) convertDate(dateInput);
  }, []);

  const convertTimestamp = (v: string) => {
    setTsInput(v);
    if (!v.trim()) {
      setTsResult(null);
      setTsFormattedResult(null);
      setTsError(null);
      return;
    }
    const n = Number(v.trim());
    if (Number.isNaN(n)) {
      setTsError(t.tools.timestamp.invalidTimestamp);
      setTsResult(null);
      setTsFormattedResult(null);
      return;
    }
    // Auto-detect seconds vs milliseconds
    const ms = n > 1e12 ? n : n * 1000;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) {
      setTsError(t.tools.timestamp.invalidTimestamp);
      setTsResult(null);
      setTsFormattedResult(null);
      return;
    }
    setTsResult(d.toISOString());
    setTsFormattedResult(formatWithPattern(d, formatPattern));
    setTsError(null);
  };

  const handleFormatPattern = (v: string) => {
    setFormatPattern(v);
    if (!tsInput.trim()) return;
    const n = Number(tsInput.trim());
    if (Number.isNaN(n)) return;
    const ms = n > 1e12 ? n : n * 1000;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return;
    setTsFormattedResult(formatWithPattern(d, v || "YYYY-MM-DD HH:mm:ss"));
  };

  const convertDate = (v: string) => {
    setDateInput(v);
    if (!v.trim()) {
      setDateResult(null);
      setDateError(null);
      return;
    }
    const d = new Date(v.trim());
    if (Number.isNaN(d.getTime())) {
      setDateError(t.tools.timestamp.invalidDateFormat);
      setDateResult(null);
      return;
    }
    setDateResult(String(d.getTime()));
    setDateError(null);
  };

  const nowTs = String(Date.now());
  const activeDate = sourceMode === "current" ? new Date() : new Date(specifiedInput.trim());
  const activeDateValid = !Number.isNaN(activeDate.getTime());
  const formatRows = activeDateValid
    ? [
        { label: t.tools.timestamp.unixMs, value: String(activeDate.getTime()) },
        { label: t.tools.timestamp.unixSec, value: String(Math.floor(activeDate.getTime() / 1000)) },
        { label: t.tools.timestamp.isoOutput, value: activeDate.toISOString() },
        { label: t.tools.timestamp.localOutput, value: activeDate.toLocaleString() },
        { label: t.tools.timestamp.utcOutput, value: activeDate.toUTCString() },
        { label: t.tools.timestamp.formattedOutput, value: formatWithPattern(activeDate, formatPattern) },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-auto">
      {/* Now */}
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-[#d4d4d4]">{t.tools.timestamp.currentTime}</h3>
          <CopyButton text={nowTs} />
        </div>
        <p className="text-lg font-mono text-[#9cdcfe]">{nowTs}</p>
        <p className="text-sm text-[#858585] mt-1">{new Date().toISOString()}</p>
      </div>

      {/* Formatting Workbench */}
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <h3 className="mb-3 text-sm font-medium text-[#d4d4d4]">{t.tools.timestamp.formatWorkbench}</h3>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#858585]">{t.tools.timestamp.sourceType}</span>
          <button
            type="button"
            onClick={() => setSourceMode("current")}
            className={`rounded px-3 py-1 text-xs transition-colors ${
              sourceMode === "current"
                ? "bg-[#0078d4] text-white"
                : "bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4c4c4c]"
            }`}
          >
            {t.tools.timestamp.sourceCurrent}
          </button>
          <button
            type="button"
            onClick={() => setSourceMode("specified")}
            className={`rounded px-3 py-1 text-xs transition-colors ${
              sourceMode === "specified"
                ? "bg-[#0078d4] text-white"
                : "bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4c4c4c]"
            }`}
          >
            {t.tools.timestamp.sourceSpecified}
          </button>
        </div>

        {sourceMode === "specified" && (
          <div className="mb-3">
            <label htmlFor="specified-time" className="mb-1 block text-xs text-[#858585]">
              {t.tools.timestamp.specifiedTime}
            </label>
            <input
              id="specified-time"
              type="text"
              value={specifiedInput}
              onChange={(e) => setSpecifiedInput(e.target.value)}
              placeholder={t.tools.timestamp.datePlaceholder}
              className="w-full rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 text-sm font-mono text-[#d4d4d4] outline-none focus:border-[#007acc]"
            />
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="time-format-workbench" className="mb-1 block text-xs text-[#858585]">
            {t.tools.timestamp.formatPattern}
          </label>
          <input
            id="time-format-workbench"
            type="text"
            value={formatPattern}
            onChange={(e) => handleFormatPattern(e.target.value)}
            placeholder={t.tools.timestamp.formatPatternPlaceholder}
            className="w-full rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 text-sm font-mono text-[#d4d4d4] outline-none focus:border-[#007acc]"
          />
        </div>

        {!activeDateValid ? (
          <p className="text-xs text-red-400">{t.tools.timestamp.invalidSourceTime}</p>
        ) : (
          <div className="space-y-2">
            {formatRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 rounded bg-[#1e1e1e] px-3 py-2">
                <div className="min-w-0">
                  <p className="text-xs text-[#858585]">{row.label}</p>
                  <p className="truncate font-mono text-sm text-[#9cdcfe]">{row.value}</p>
                </div>
                <CopyButton text={row.value} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timestamp → Date */}
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <h3 className="text-sm font-medium text-[#d4d4d4] mb-3">{t.tools.timestamp.tsToDate}</h3>
        <input
          type="text"
          value={tsInput}
          onChange={(e) => convertTimestamp(e.target.value)}
          placeholder={t.tools.timestamp.tsPlaceholder}
          className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 text-sm font-mono text-[#d4d4d4] outline-none focus:border-[#007acc]"
        />
        <div className="mt-3">
          <label htmlFor="time-format" className="mb-1 block text-xs text-[#858585]">
            {t.tools.timestamp.formatPattern}
          </label>
          <input
            id="time-format"
            type="text"
            value={formatPattern}
            onChange={(e) => handleFormatPattern(e.target.value)}
            placeholder={t.tools.timestamp.formatPatternPlaceholder}
            className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 text-sm font-mono text-[#d4d4d4] outline-none focus:border-[#007acc]"
          />
        </div>
        {tsError && <p className="text-red-400 text-xs mt-2">{tsError}</p>}
        {tsResult && tsFormattedResult && (
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-[#858585]">{t.tools.timestamp.isoOutput}</p>
                <span className="font-mono text-[#b5cea8]">{tsResult}</span>
              </div>
              <CopyButton text={tsResult} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-[#858585]">{t.tools.timestamp.formattedOutput}</p>
                <span className="font-mono text-[#9cdcfe]">{tsFormattedResult}</span>
              </div>
              <CopyButton text={tsFormattedResult} />
            </div>
          </div>
        )}
      </div>

      {/* Date → Timestamp */}
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <h3 className="text-sm font-medium text-[#d4d4d4] mb-3">{t.tools.timestamp.dateToTs}</h3>
        <input
          type="text"
          value={dateInput}
          onChange={(e) => convertDate(e.target.value)}
          placeholder={t.tools.timestamp.datePlaceholder}
          className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 text-sm font-mono text-[#d4d4d4] outline-none focus:border-[#007acc]"
        />
        {dateError && <p className="text-red-400 text-xs mt-2">{dateError}</p>}
        {dateResult && (
          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono text-[#b5cea8]">{dateResult}</span>
            <CopyButton text={dateResult} />
          </div>
        )}
      </div>
    </div>
  );
}
