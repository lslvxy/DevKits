import { useEffect, useRef, useState } from "react";
import { CopyButton } from "../../components/CopyButton.tsx";
import { getT } from "../../i18n/index.ts";
import { useStore } from "../../core/store.ts";

type Tab = "encode" | "decode";

const ALLOWED_MIME = /^data:(image\/(?:png|jpe?g|gif|webp|bmp|ico));base64,/i;

/** Decode a base64 data URI into a Blob URL to sanitize user-provided data. */
function dataURIToBlobURL(dataURI: string, errorMsg: string): string {
  const m = ALLOWED_MIME.exec(dataURI);
  if (!m) throw new Error(errorMsg);
  const mime = m[1];
  const b64 = dataURI.slice(dataURI.indexOf(",") + 1);
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return URL.createObjectURL(new Blob([bytes], { type: mime }));
}

export function Base64ImageTool() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
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
  const decodeBlobRef = useRef<string>("");

  // Revoke blob URL on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (decodeBlobRef.current) URL.revokeObjectURL(decodeBlobRef.current);
    };
  }, []);

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
    reader.onerror = () => setEncodeError(t.tools.base64Image.readFileFailed);
    reader.readAsDataURL(file);
  };

  const handleDecodeChange = (value: string) => {
    setDecodeInput(value);
    setDecodeError("");
    // Revoke the previous blob URL
    if (decodeBlobRef.current) {
      URL.revokeObjectURL(decodeBlobRef.current);
      decodeBlobRef.current = "";
    }
    setDecodePreview("");
    if (!value.trim()) return;
    const trimmed = value.trim();
    const dataURI = trimmed.startsWith("data:") ? trimmed : `data:image/png;base64,${trimmed}`;
    try {
      const blobURL = dataURIToBlobURL(dataURI, t.tools.base64Image.unsupportedType);
      decodeBlobRef.current = blobURL;
      setDecodePreview(blobURL);
    } catch (e) {
      setDecodeError(e instanceof Error ? e.message : t.tools.base64Image.invalidBase64);
    }
  };

  const tabCls = (active: boolean) =>
    active
      ? "px-3 py-1 text-sm rounded bg-[#007acc] text-white"
      : "px-3 py-1 text-sm rounded bg-[#3c3c3c] text-[#cccccc] hover:bg-[#4a4a4a]";

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-auto">
      <div className="flex gap-2">
        <button type="button" onClick={() => setTab("encode")} className={tabCls(tab === "encode")}>
          {t.tools.base64Image.encodeTab}
        </button>
        <button type="button" onClick={() => setTab("decode")} className={tabCls(tab === "decode")}>
          {t.tools.base64Image.decodeTab}
        </button>
      </div>

      {tab === "encode" && (
        <>
          <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
            <h3 className="text-sm font-medium text-[#d4d4d4] mb-4">{t.tools.base64Image.selectFile}</h3>
            <input
              ref={encodeFileRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp,image/bmp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => encodeFileRef.current?.click()}
              className="px-4 py-1.5 bg-[#007acc] text-white text-sm rounded hover:bg-[#005a9e] transition-colors"
            >
              {t.tools.base64Image.chooseImage}
            </button>
            {encodeError && <p className="mt-2 text-sm text-red-400">{encodeError}</p>}
          </div>

          {encodePreview && (
            <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
              <h3 className="text-sm font-medium text-[#d4d4d4] mb-3">{t.tools.base64Image.imagePreview}</h3>
              <img src={encodePreview} alt="preview" className="max-h-48 rounded object-contain" />
            </div>
          )}

          {encodeResult && (
            <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#d4d4d4]">{t.tools.base64Image.base64Result}</h3>
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
            <h3 className="text-sm font-medium text-[#d4d4d4] mb-3">{t.tools.base64Image.inputBase64}</h3>
            <textarea
              value={decodeInput}
              onChange={(e) => handleDecodeChange(e.target.value)}
              placeholder={t.tools.base64Image.inputBase64Placeholder}
              className="h-40 w-full resize-none rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
            />
            {decodeError && <p className="mt-2 text-sm text-red-400">{decodeError}</p>}
          </div>

          {decodePreview && (
            <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
              <h3 className="text-sm font-medium text-[#d4d4d4] mb-3">{t.tools.base64Image.imagePreview}</h3>
              <img
                src={decodePreview}
                alt="decoded"
                onError={() => setDecodeError(t.tools.base64Image.renderFailed)}
                className="max-h-64 rounded object-contain"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
