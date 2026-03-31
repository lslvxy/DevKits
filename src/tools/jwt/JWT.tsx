import { useState } from "react";
import { getT } from "../../i18n/index.ts";
import { useStore } from "../../core/store.ts";
import { CopyButton } from "../../components/CopyButton.tsx";

function base64urlDecode(str: string): string {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  const padded = pad ? b64 + "=".repeat(4 - pad) : b64;
  try {
    return decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );
  } catch {
    return atob(padded);
  }
}

function formatTs(ts: number): string {
  return new Date(ts * 1000).toLocaleString();
}

type JwtData = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
};

export function JWTTool() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
  const [input, setInput] = useState("");
  const [data, setData] = useState<JwtData | null>(null);
  const [error, setError] = useState("");

  const decode = (token: string) => {
    setInput(token);
    if (!token.trim()) {
      setData(null);
      setError("");
      return;
    }
    const parts = token.trim().split(".");
    if (parts.length !== 3) {
      setError(t.tools.jwt.invalidJwt);
      setData(null);
      return;
    }
    try {
      const header = JSON.parse(base64urlDecode(parts[0])) as Record<string, unknown>;
      const payload = JSON.parse(base64urlDecode(parts[1])) as Record<string, unknown>;
      setData({ header, payload, signature: parts[2] });
      setError("");
    } catch (e) {
      setError(`${t.tools.jwt.parseFailed}${e instanceof Error ? e.message : String(e)}`);
      setData(null);
    }
  };

  const fmt = (obj: Record<string, unknown>) => JSON.stringify(obj, null, 2);

  const exp = data?.payload.exp as number | undefined;
  const iat = data?.payload.iat as number | undefined;
  const isExpired = exp !== undefined && exp < Date.now() / 1000;

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-auto">
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <h3 className="text-sm font-medium text-[#d4d4d4] mb-3">{t.tools.jwt.jwtToken}</h3>
        <textarea
          value={input}
          onChange={(e) => decode(e.target.value)}
          placeholder={t.tools.jwt.jwtPlaceholder}
          className="h-24 w-full resize-none rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
        />
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      {data && (
        <>
          {/* Header */}
          <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#d4d4d4]">
                Header
                <span className="ml-2 text-xs text-[#858585]">{t.tools.jwt.headerSubtitle}</span>
              </h3>
              <CopyButton text={fmt(data.header)} />
            </div>
            <pre className="overflow-auto rounded bg-[#1e1e1e] p-3 font-mono text-sm text-[#4ec9b0]">
              {fmt(data.header)}
            </pre>
          </div>

          {/* Payload */}
          <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#d4d4d4]">
                Payload
                {exp !== undefined && (
                  <span
                    className={`ml-2 rounded px-2 py-0.5 text-xs ${
                      isExpired ? "bg-red-900/50 text-red-400" : "bg-green-900/50 text-green-400"
                    }`}
                  >
                    {isExpired ? t.tools.jwt.expired : t.tools.jwt.valid}
                  </span>
                )}
              </h3>
              <CopyButton text={fmt(data.payload)} />
            </div>
            <pre className="overflow-auto rounded bg-[#1e1e1e] p-3 font-mono text-sm text-[#4ec9b0]">
              {fmt(data.payload)}
            </pre>
            <div className="mt-2 flex flex-col gap-1">
              {exp !== undefined && (
                <p className="text-xs text-[#858585]">
                  {t.tools.jwt.expiresAt}：<span className="text-[#d4d4d4]">{formatTs(exp)}</span>
                </p>
              )}
              {iat !== undefined && (
                <p className="text-xs text-[#858585]">
                  {t.tools.jwt.issuedAt}：<span className="text-[#d4d4d4]">{formatTs(iat)}</span>
                </p>
              )}
            </div>
          </div>

          {/* Signature */}
          <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#d4d4d4]">Signature</h3>
              <CopyButton text={data.signature} />
            </div>
            <pre className="overflow-auto break-all whitespace-pre-wrap rounded bg-[#1e1e1e] p-3 font-mono text-sm text-[#ce9178]">
              {data.signature}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
