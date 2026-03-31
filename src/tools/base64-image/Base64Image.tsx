import { useRef, useState } from "react";
import { CopyButton } from "../../components/CopyButton.tsx";

type Tab = "encode" | "decode";

export function Base64ImageTool() {
  const [tab, setTab] = useState<Tab>("encode");

  // Encode tab
  const [encodeResult, setEncodeResult] = useState("");
  const [encodePreview, setEncodePreview] = useState("");
  const [encodeError, setEncodeError] = useState("");
  const encodeFileRef = useRef<HTMLInputElement>(null);

  // Decode tab
  const [decodeInput, setDecodeInput] = useState("");
  const [decodePreview, setDecodePreview] = useState("");
  const [decodeError, setDecodeError] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setEncodeResult(result);
      setEncodePreview(result);
      setEncodeError("");
    };
    reader.onerror = () => setEncodeError("读取文件失败");
    reader.readAsDataURL(file);
  };

  const handleDecodeChange = (value: string) => {
    setDecodeInput(value);
    setDecodeError("");
    if (!value.trim()) {
      setDecodePreview("");
      return;
    }
    const src = value.trim().startsWith("data:")
      ? value.trim()
      : `data:image/png;base64,${value.trim()}`;
    setDecodePreview(src);
  };

  const tabCls = (active: boolean) =>
    active
      ? "px-3 py-1 text-sm rounded bg-[#007acc] text-white"
      : "px-3 py-1 text-sm rounded bg-[#3c3c3c] text-[#cccccc] hover:bg-[#4a4a4a]";

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-auto">
      <div className="flex gap-2">
        <button type="button" onClick={() => setTab("encode")} className={tabCls(tab === "encode")}>
          图片 → Base64
        </button>
        <button type="button" onClick={() => setTab("decode")} className={tabCls(tab === "decode")}>
          Base64 → 图片
        </button>
      </div>

      {tab === "encode" && (
        <>
          <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
            <h3 className="text-sm font-medium text-[#d4d4d4] mb-4">选择图片文件</h3>
            <input
              ref={encodeFileRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => encodeFileRef.current?.click()}
              className="px-4 py-1.5 bg-[#007acc] text-white text-sm rounded hover:bg-[#005a9e] transition-colors"
            >
              选择图片
            </button>
            {encodeError && <p className="mt-2 text-sm text-red-400">{encodeError}</p>}
          </div>

          {encodePreview && (
            <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
              <h3 className="text-sm font-medium text-[#d4d4d4] mb-3">图片预览</h3>
              <img src={encodePreview} alt="preview" className="max-h-48 rounded object-contain" />
            </div>
          )}

          {encodeResult && (
            <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#d4d4d4]">Base64 结果</h3>
                <CopyButton text={encodeResult} />
              </div>
              <textarea
                readOnly
                value={encodeResult}
                className="h-40 w-full resize-none rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-[#9cdcfe] outline-none"
              />
            </div>
          )}
        </>
      )}

      {tab === "decode" && (
        <>
          <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
            <h3 className="text-sm font-medium text-[#d4d4d4] mb-3">输入 Base64 字符串</h3>
            <textarea
              value={decodeInput}
              onChange={(e) => handleDecodeChange(e.target.value)}
              placeholder="支持 data:image/...;base64,... 格式或纯 Base64 字符串"
              className="h-40 w-full resize-none rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
            />
            {decodeError && <p className="mt-2 text-sm text-red-400">{decodeError}</p>}
          </div>

          {decodePreview && (
            <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
              <h3 className="text-sm font-medium text-[#d4d4d4] mb-3">图片预览</h3>
              <img
                src={decodePreview}
                alt="decoded"
                onError={() => setDecodeError("无法渲染图片，请确认 Base64 字符串有效")}
                className="max-h-64 rounded object-contain"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
