import { customAlphabet, nanoid } from "nanoid";
import { useState } from "react";
import { v4 as uuidv4, v7 as uuidv7 } from "uuid";
import { CopyButton } from "../../components/CopyButton.tsx";

type Version = "v4" | "v7" | "nanoid";

const NANOID_DEFAULT_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-";

function generateId(
  version: Version,
  opts: { uppercase: boolean; noDash: boolean; nanoidLen: number; nanoidAlphabet: string }
): string {
  if (version === "v4") {
    let id = uuidv4();
    if (opts.noDash) id = id.replace(/-/g, "");
    if (opts.uppercase) id = id.toUpperCase();
    return id;
  }
  if (version === "v7") {
    let id = uuidv7();
    if (opts.noDash) id = id.replace(/-/g, "");
    if (opts.uppercase) id = id.toUpperCase();
    return id;
  }
  // nanoid
  const alphabet = opts.nanoidAlphabet.trim() || NANOID_DEFAULT_ALPHABET;
  const generate =
    alphabet === NANOID_DEFAULT_ALPHABET ? nanoid : customAlphabet(alphabet, opts.nanoidLen);
  return generate(opts.nanoidLen);
}

export function UUIDTool() {
  const [count, setCount] = useState(1);
  const [ids, setIds] = useState<string[]>([]);
  const [version, setVersion] = useState<Version>("v4");
  const [uppercase, setUppercase] = useState(false);
  const [noDash, setNoDash] = useState(false);
  const [nanoidLen, setNanoidLen] = useState(21);
  const [nanoidAlphabet, setNanoidAlphabet] = useState(NANOID_DEFAULT_ALPHABET);

  const generate = () => {
    const result = Array.from({ length: count }, () =>
      generateId(version, { uppercase, noDash, nanoidLen, nanoidAlphabet })
    );
    setIds(result);
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-auto">
      {/* Controls */}
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <h3 className="text-sm font-medium text-[#d4d4d4] mb-4">生成选项</h3>

        {/* Version selector */}
        <div className="mb-4">
          <p className="text-xs text-[#858585] mb-2">类型</p>
          <div className="flex gap-2">
            {(["v4", "v7", "nanoid"] as Version[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVersion(v)}
                className={`px-3 py-1.5 text-xs rounded transition-colors ${
                  version === v
                    ? "bg-[#0078d4] text-white"
                    : "bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4c4c4c]"
                }`}
              >
                {v === "v4" ? "UUID v4" : v === "v7" ? "UUID v7" : "NanoID"}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-[#858585]">
            {version === "v4" && "随机生成，符合 RFC 4122 标准"}
            {version === "v7" && "基于时间戳（毫秒），字典序可排序，符合 RFC 9562 标准"}
            {version === "nanoid" && "更短、URL 安全的唯一 ID，默认 21 字符"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Count */}
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
              className="w-16 bg-[#1e1e1e] border border-[#3e3e42] rounded px-2 py-1 text-sm text-[#d4d4d4] outline-none focus:border-[#0078d4]"
            />
          </div>

          {/* UUID-specific options */}
          {version !== "nanoid" && (
            <>
              <label className="flex items-center gap-2 text-xs text-[#858585] cursor-pointer">
                <input
                  type="checkbox"
                  checked={uppercase}
                  onChange={(e) => setUppercase(e.target.checked)}
                  className="accent-[#0078d4]"
                />
                大写
              </label>
              <label className="flex items-center gap-2 text-xs text-[#858585] cursor-pointer">
                <input
                  type="checkbox"
                  checked={noDash}
                  onChange={(e) => setNoDash(e.target.checked)}
                  className="accent-[#0078d4]"
                />
                无连字符
              </label>
            </>
          )}

          {/* NanoID-specific options */}
          {version === "nanoid" && (
            <>
              <div className="flex items-center gap-2">
                <label htmlFor="nanoid-len" className="text-xs text-[#858585]">
                  长度:
                </label>
                <input
                  id="nanoid-len"
                  type="number"
                  min={1}
                  max={256}
                  value={nanoidLen}
                  onChange={(e) => setNanoidLen(Math.max(1, Math.min(256, Number(e.target.value))))}
                  className="w-16 bg-[#1e1e1e] border border-[#3e3e42] rounded px-2 py-1 text-sm text-[#d4d4d4] outline-none focus:border-[#0078d4]"
                />
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <label htmlFor="nanoid-alphabet" className="text-xs text-[#858585] shrink-0">
                  字符集:
                </label>
                <input
                  id="nanoid-alphabet"
                  type="text"
                  value={nanoidAlphabet}
                  onChange={(e) => setNanoidAlphabet(e.target.value)}
                  className="flex-1 bg-[#1e1e1e] border border-[#3e3e42] rounded px-2 py-1 text-xs text-[#d4d4d4] font-mono outline-none focus:border-[#0078d4]"
                />
              </div>
            </>
          )}

          <button
            type="button"
            onClick={generate}
            className="px-4 py-1.5 bg-[#0078d4] text-white text-sm rounded hover:bg-[#106ebe] transition-colors"
          >
            生成
          </button>
        </div>
      </div>

      {/* Results */}
      {ids.length > 0 && (
        <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[#d4d4d4]">结果</h3>
            <CopyButton text={ids.join("\n")} />
          </div>
          <div className="flex flex-col gap-1.5">
            {ids.map((id, i) => (
              <div
                key={`${i}-${id}`}
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
