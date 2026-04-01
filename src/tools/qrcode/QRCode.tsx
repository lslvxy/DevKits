import jsQR from "jsqr";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { CopyButton } from "../../components/CopyButton.tsx";
import { getT } from "../../i18n/index.ts";
import { useStore } from "../../core/store.ts";
import { useToolDraft } from "../../core/useToolDraft.ts";

type Tab = "generate" | "decode";

export function QRCodeTool() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
  const [tab, setTab] = useState<Tab>("generate");

  // Generate
  const [text, setText] = useToolDraft("qrcode:text");
  const [size, setSize] = useState(256);
  const [qrUrl, setQrUrl] = useState("");
  const [genError, setGenError] = useState("");

  // Decode
  const [decodeResult, setDecodeResult] = useState("");
  const [decodePreview, setDecodePreview] = useState("");
  const [decodeError, setDecodeError] = useState("");
  const decodeFileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!text.trim()) {
      setQrUrl("");
      setGenError("");
      return;
    }
    QRCode.toDataURL(text, { width: size, margin: 1 })
      .then((url) => {
        setQrUrl(url);
        setGenError("");
      })
      .catch((e: unknown) => {
        setGenError(e instanceof Error ? e.message : String(e));
        setQrUrl("");
      });
  }, [text, size]);

  const handleDownload = () => {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = "qrcode.png";
    a.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDecodeResult("");
    setDecodeError("");

    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setDecodePreview(src);

      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = jsQR(imageData.data, imageData.width, imageData.height);
        if (result) {
          setDecodeResult(result.data);
        } else {
          setDecodeError(t.tools.qrcode.decodeFailed);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const tabCls = (active: boolean) =>
    active
      ? "px-3 py-1 text-sm rounded bg-[#007acc] text-white"
      : "px-3 py-1 text-sm rounded bg-[#3c3c3c] text-[#cccccc] hover:bg-[#4a4a4a]";

  return (
    <div className="flex h-full flex-col gap-6 overflow-auto p-6">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("generate")}
          className={tabCls(tab === "generate")}
        >
          {t.tools.qrcode.generateTab}
        </button>
        <button type="button" onClick={() => setTab("decode")} className={tabCls(tab === "decode")}>
          {t.tools.qrcode.decodeTab}
        </button>
      </div>

      {tab === "generate" && (
        <>
          <div className="rounded-lg border border-[#3e3e42] bg-[#252526] p-4">
            <h3 className="mb-3 text-sm font-medium text-[#d4d4d4]">{t.tools.qrcode.inputPlaceholder}</h3>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.tools.qrcode.inputPlaceholder}
              className="h-24 w-full resize-none rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
            />
            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="qr-size" className="text-xs text-[#858585]">
                  {t.tools.qrcode.size}
                </label>
                <select
                  id="qr-size"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="rounded border border-[#3e3e42] bg-[#1e1e1e] px-2 py-1 text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
                >
                  <option value={128}>S</option>
                  <option value={256}>M</option>
                  <option value={512}>L</option>
                </select>
              </div>
            </div>
            {genError && <p className="mt-2 text-sm text-red-400">{genError}</p>}
          </div>

          {qrUrl && (
            <div className="rounded-lg border border-[#3e3e42] bg-[#252526] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#d4d4d4]">{t.tools.qrcode.download}</h3>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="rounded bg-[#007acc] px-4 py-1.5 text-sm text-white transition-colors hover:bg-[#005a9e]"
                >
                  {t.tools.qrcode.download}
                </button>
              </div>
              <img src={qrUrl} alt="Generated QR Code" className="rounded" />
            </div>
          )}
        </>
      )}

      {tab === "decode" && (
        <>
          <div className="rounded-lg border border-[#3e3e42] bg-[#252526] p-4">
            <h3 className="mb-3 text-sm font-medium text-[#d4d4d4]">{t.tools.qrcode.scanPrompt}</h3>
            <input
              ref={decodeFileRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <canvas ref={canvasRef} className="hidden" />
            <button
              type="button"
              onClick={() => decodeFileRef.current?.click()}
              className="rounded bg-[#007acc] px-4 py-1.5 text-sm text-white transition-colors hover:bg-[#005a9e]"
            >
              {t.tools.qrcode.chooseImage}
            </button>
            {decodeError && <p className="mt-2 text-sm text-red-400">{decodeError}</p>}
          </div>

          {decodePreview && (
            <div className="rounded-lg border border-[#3e3e42] bg-[#252526] p-4">
              <h3 className="mb-3 text-sm font-medium text-[#d4d4d4]">{t.tools.qrcode.imagePreview}</h3>
              <img
                src={decodePreview}
                alt="uploaded QR"
                className="max-h-48 rounded object-contain"
              />
            </div>
          )}

          {decodeResult && (
            <div className="rounded-lg border border-[#3e3e42] bg-[#252526] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#d4d4d4]">{t.tools.qrcode.decodeResult}</h3>
                <CopyButton text={decodeResult} />
              </div>
              <div className="break-all rounded bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-[#9cdcfe]">
                {decodeResult}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
