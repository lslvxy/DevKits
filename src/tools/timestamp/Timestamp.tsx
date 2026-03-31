import { useState } from "react";
import { CopyButton } from "../../components/CopyButton.tsx";

export function TimestampTool() {
  const [tsInput, setTsInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [tsResult, setTsResult] = useState<string | null>(null);
  const [dateResult, setDateResult] = useState<string | null>(null);
  const [tsError, setTsError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const convertTimestamp = (v: string) => {
    setTsInput(v);
    if (!v.trim()) {
      setTsResult(null);
      setTsError(null);
      return;
    }
    const n = Number(v.trim());
    if (Number.isNaN(n)) {
      setTsError("无效的时间戳");
      setTsResult(null);
      return;
    }
    // Auto-detect seconds vs milliseconds
    const ms = n > 1e12 ? n : n * 1000;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) {
      setTsError("无效的时间戳");
      setTsResult(null);
      return;
    }
    setTsResult(d.toISOString());
    setTsError(null);
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
      setDateError("无效的日期格式");
      setDateResult(null);
      return;
    }
    setDateResult(String(d.getTime()));
    setDateError(null);
  };

  const nowTs = String(Date.now());

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-auto">
      {/* Now */}
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-[#d4d4d4]">当前时间</h3>
          <CopyButton text={nowTs} />
        </div>
        <p className="text-lg font-mono text-[#9cdcfe]">{nowTs}</p>
        <p className="text-sm text-[#858585] mt-1">{new Date().toISOString()}</p>
      </div>

      {/* Timestamp → Date */}
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <h3 className="text-sm font-medium text-[#d4d4d4] mb-3">时间戳 → 日期</h3>
        <input
          type="text"
          value={tsInput}
          onChange={(e) => convertTimestamp(e.target.value)}
          placeholder="输入时间戳 (秒或毫秒)..."
          className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 text-sm font-mono text-[#d4d4d4] outline-none focus:border-[#007acc]"
        />
        {tsError && <p className="text-red-400 text-xs mt-2">{tsError}</p>}
        {tsResult && (
          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono text-[#b5cea8]">{tsResult}</span>
            <CopyButton text={tsResult} />
          </div>
        )}
      </div>

      {/* Date → Timestamp */}
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <h3 className="text-sm font-medium text-[#d4d4d4] mb-3">日期 → 时间戳</h3>
        <input
          type="text"
          value={dateInput}
          onChange={(e) => convertDate(e.target.value)}
          placeholder="输入日期 (如 2024-01-01 12:00:00)..."
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
