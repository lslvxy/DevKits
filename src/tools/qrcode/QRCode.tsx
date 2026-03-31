import jsQR from "jsqr";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { CopyButton } from "../../components/CopyButton.tsx";

type Tab = "generate" | "decode";

export function QRCodeTool() {
  const [tab, setTab] = useState<Tab>("generate");

  // Generate
  const [text, setText] = useState("");
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
          setDecodeError("未识别到 QR 码，请确保图片清晰完整");
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
          生成
        </button>
        <button type="button" onClick={() => setTab("decode")} className={tabCls(tab === "decode")}>
          解析
        </button>
      </div>

      {tab === "generate" && (
        <>
          <div className="rounded-lg border border-[#3e3e42] bg-[#252526] p-4">
            <h3 className="mb-3 text-sm font-medium text-[#d4d4d4]">输入文本或链接</h3>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="输入要编码为 QR 码的内容..."
              className="h-24 w-full resize-none rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
            />
            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="qr-size" className="text-xs text-[#858585]">
                  尺寸:
                </label>
                <select
                  id="qr-size"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="rounded border border-[#3e3e42] bg-[#1e1e1e] px-2 py-1 text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
                >
                  <option value={128}>小 (128px)</option>
                  <option value={256}>中 (256px)</option>
                  <option value={512}>大 (512px)</option>
                </select>
              </div>
            </div>
            {genError && <p className="mt-2 text-sm text-red-400">{genError}</p>}
          </div>

          {qrUrl && (
            <div className="rounded-lg border border-[#3e3e42] bg-[#252526] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#d4d4d4]">二维码</h3>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="rounded bg-[#007acc] px-4 py-1.5 text-sm text-white transition-colors hover:bg-[#005a9e]"
                >
                  下载
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
            <h3 className="mb-3 text-sm font-medium text-[#d4d4d4]">上传 QR 码图片</h3>
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
              选择图片
            </button>
            {decodeError && <p className="mt-2 text-sm text-red-400">{decodeError}</p>}
          </div>

          {decodePreview && (
            <div className="rounded-lg border border-[#3e3e42] bg-[#252526] p-4">
              <h3 className="mb-3 text-sm font-medium text-[#d4d4d4]">图片预览</h3>
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
                <h3 className="text-sm font-medium text-[#d4d4d4]">解析结果</h3>
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
