import { useEffect, useState } from "react";
import { CopyButton } from "../../components/CopyButton.tsx";
import { getT } from "../../i18n/index.ts";
import { useStore } from "../../core/store.ts";
import { useToolDraft } from "../../core/useToolDraft.ts";

type Mode = "ascii2hex" | "hex2ascii";

export function HexAsciiTool() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
  const [mode, setMode] = useState<Mode>("ascii2hex");
  const [input, setInput] = useToolDraft("hex-ascii:input");
  const [uppercase, setUppercase] = useState(false);
  const [spaceSep, setSpaceSep] = useState(true);

  const [hexOut, setHexOut] = useState("");
  const [decOut, setDecOut] = useState("");
  const [binOut, setBinOut] = useState("");
  const [asciiOut, setAsciiOut] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    if (!input) {
      setHexOut("");
      setDecOut("");
      setBinOut("");
      setAsciiOut("");
      return;
    }
    try {
      if (mode === "ascii2hex") {
        const chars = Array.from(input);
        const sep = spaceSep ? " " : "";
        setHexOut(
          chars
            .map((c) => {
              const h = c.charCodeAt(0).toString(16).padStart(2, "0");
              return uppercase ? h.toUpperCase() : h;
            })
            .join(sep)
        );
        setDecOut(chars.map((c) => c.charCodeAt(0).toString()).join(" "));
        setBinOut(chars.map((c) => c.charCodeAt(0).toString(2).padStart(8, "0")).join(" "));
        setAsciiOut("");
      } else {
        const clean = input.replace(/\s+/g, "");
        if (clean.length % 2 !== 0) throw new Error(t.tools.hexAscii.invalidHex);
        const pairs = clean.match(/.{2}/g) ?? [];
        const ascii = pairs
          .map((b) => {
            const code = Number.parseInt(b, 16);
            if (Number.isNaN(code)) throw new Error(`${t.tools.hexAscii.invalidHex}: ${b}`);
            return String.fromCharCode(code);
          })
          .join("");
        setAsciiOut(ascii);
        setHexOut("");
        setDecOut("");
        setBinOut("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [input, mode, uppercase, spaceSep]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setInput("");
    setError("");
  };

  const tabCls = (active: boolean) =>
    active
      ? "px-3 py-1 text-sm rounded bg-[#007acc] text-white"
      : "px-3 py-1 text-sm rounded bg-[#3c3c3c] text-[#cccccc] hover:bg-[#4a4a4a]";

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-[#3e3e42] bg-[#252526] p-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => switchMode("ascii2hex")}
            className={tabCls(mode === "ascii2hex")}
          >
            ASCII → Hex
          </button>
          <button
            type="button"
            onClick={() => switchMode("hex2ascii")}
            className={tabCls(mode === "hex2ascii")}
          >
            Hex → ASCII
          </button>
        </div>
        {mode === "ascii2hex" && (
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-[#858585]">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="accent-[#007acc]"
              />
              {t.tools.hexAscii.uppercase}
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-[#858585]">
              <input
                type="checkbox"
                checked={spaceSep}
                onChange={(e) => setSpaceSep(e.target.checked)}
                className="accent-[#007acc]"
              />
              {t.tools.hexAscii.spaceSeparated}
            </label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {/* Input */}
        <div className="flex flex-col gap-2 rounded-lg border border-[#3e3e42] bg-[#252526] p-4">
          <h3 className="text-sm font-medium text-[#d4d4d4]">
            {mode === "ascii2hex" ? t.tools.hexAscii.input : t.tools.hexAscii.input}
          </h3>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError("");
            }}
            placeholder={
              mode === "ascii2hex"
                ? t.tools.hexAscii.asciiPlaceholder
                : t.tools.hexAscii.hexPlaceholder
            }
            className="min-h-32 flex-1 resize-none rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        {/* Output */}
        <div className="flex flex-col gap-3 rounded-lg border border-[#3e3e42] bg-[#252526] p-4">
          <h3 className="text-sm font-medium text-[#d4d4d4]">{t.tools.hexAscii.output}</h3>

          {mode === "ascii2hex" && input && (
            <>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#858585]">{t.tools.hexAscii.hexOutput}</span>
                  <CopyButton text={hexOut} />
                </div>
                <div className="break-all rounded bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-[#9cdcfe]">
                  {hexOut || "(空)"}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#858585]">{t.tools.hexAscii.decOutput}</span>
                  <CopyButton text={decOut} />
                </div>
                <div className="break-all rounded bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-[#4ec9b0]">
                  {decOut || "(空)"}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#858585]">{t.tools.hexAscii.binOutput}</span>
                  <CopyButton text={binOut} />
                </div>
                <div className="break-all rounded bg-[#1e1e1e] px-3 py-2 font-mono text-xs text-[#ce9178]">
                  {binOut || "(空)"}
                </div>
              </div>
            </>
          )}

          {mode === "hex2ascii" && input && !error && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#858585]">{t.tools.hexAscii.asciiOutput}</span>
                <CopyButton text={asciiOut} />
              </div>
              <div className="break-all rounded bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-[#d4d4d4]">
                {asciiOut || "(空)"}
              </div>
            </div>
          )}

                  {!input && <p className="text-sm text-[#858585]">{t.tools.hexAscii.emptyPrompt}</p>}
        </div>
      </div>
    </div>
  );
}
