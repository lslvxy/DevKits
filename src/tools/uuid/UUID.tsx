import { useState } from "react";
import { CopyButton } from "../../components/CopyButton.tsx";

function generateUUID(): string {
  return crypto.randomUUID();
}

export function UUIDTool() {
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);
  const [uppercase, setUppercase] = useState(false);
  const [noDash, setNoDash] = useState(false);

  const generate = () => {
    const result = Array.from({ length: count }, () => {
      let id = generateUUID();
      if (noDash) id = id.replace(/-/g, "");
      if (uppercase) id = id.toUpperCase();
      return id;
    });
    setUuids(result);
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-auto">
      {/* Controls */}
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <h3 className="text-sm font-medium text-[#d4d4d4] mb-4">生成选项</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="uuid-count" className="text-xs text-[#858585]">
              数量:
            </label>
            <input
              id="uuid-count"
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
              className="w-16 bg-[#1e1e1e] border border-[#3e3e42] rounded px-2 py-1 text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-[#858585] cursor-pointer">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="accent-[#007acc]"
            />
            大写
          </label>
          <label className="flex items-center gap-2 text-xs text-[#858585] cursor-pointer">
            <input
              type="checkbox"
              checked={noDash}
              onChange={(e) => setNoDash(e.target.checked)}
              className="accent-[#007acc]"
            />
            无连字符
          </label>
          <button
            type="button"
            onClick={generate}
            className="px-4 py-1.5 bg-[#007acc] text-white text-sm rounded hover:bg-[#005a9e] transition-colors"
          >
            生成
          </button>
        </div>
      </div>

      {/* Results */}
      {uuids.length > 0 && (
        <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[#d4d4d4]">结果</h3>
            <CopyButton text={uuids.join("\n")} />
          </div>
          <div className="flex flex-col gap-1.5">
            {uuids.map((id) => (
              <div
                key={id}
                className="flex items-center justify-between gap-2 font-mono text-sm text-[#9cdcfe] bg-[#1e1e1e] rounded px-3 py-2"
              >
                <span>{id}</span>
                <CopyButton text={id} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
