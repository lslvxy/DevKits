import { useState } from "react";
import { CopyButton } from "../../components/CopyButton.tsx";
import { getT } from "../../i18n/index.ts";
import { useStore } from "../../core/store.ts";

type KeySize = 1024 | 2048 | 4096;
type KeyAlgo = "RSA-OAEP" | "RSASSA-PKCS1-v1_5";

// Convert ArrayBuffer to Base64
function bufToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

// Wrap base64 key in PEM format
function toPem(b64: string, label: string): string {
  const header = `-----BEGIN ${label}-----`;
  const footer = `-----END ${label}-----`;
  const lines: string[] = [];
  for (let i = 0; i < b64.length; i += 64) {
    lines.push(b64.slice(i, i + 64));
  }
  return `${header}\n${lines.join("\n")}\n${footer}`;
}

async function generateRsaKeyPair(
  keySize: KeySize,
  algo: KeyAlgo
): Promise<{ publicKey: string; privateKey: string }> {
  const hashAlgo = "SHA-256";
  const keyUsages: KeyUsage[] = algo === "RSA-OAEP" ? ["encrypt", "decrypt"] : ["sign", "verify"];

  const keyPair = await crypto.subtle.generateKey(
    {
      name: algo,
      modulusLength: keySize,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: hashAlgo,
    },
    true,
    keyUsages
  );

  const [pubBuf, privBuf] = await Promise.all([
    crypto.subtle.exportKey("spki", keyPair.publicKey),
    crypto.subtle.exportKey("pkcs8", keyPair.privateKey),
  ]);

  return {
    publicKey: toPem(bufToBase64(pubBuf), "PUBLIC KEY"),
    privateKey: toPem(bufToBase64(privBuf), "PRIVATE KEY"),
  };
}

export function RsaKeygenTool() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
  const [keySize, setKeySize] = useState<KeySize>(2048);
  const [algo, setAlgo] = useState<KeyAlgo>("RSA-OAEP");
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setPublicKey("");
    setPrivateKey("");
    try {
      const { publicKey: pub, privateKey: priv } = await generateRsaKeyPair(keySize, algo);
      setPublicKey(pub);
      setPrivateKey(priv);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.tools.rsaKeygen.processFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 h-full overflow-auto">
      {/* Controls */}
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <h3 className="text-sm font-medium text-[#d4d4d4] mb-4">{t.tools.rsaKeygen.keySize}</h3>
        <div className="flex flex-wrap items-center gap-6">
          {/* Key size */}
          <div>
            <p className="text-xs text-[#858585] mb-2">{t.tools.rsaKeygen.keySize}</p>
            <div className="flex gap-2">
              {([1024, 2048, 4096] as KeySize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setKeySize(s)}
                  className={`px-3 py-1.5 text-xs rounded transition-colors ${
                    keySize === s
                      ? "bg-[#0078d4] text-white"
                      : "bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4c4c4c]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Algorithm */}
          <div>
            <p className="text-xs text-[#858585] mb-2">{t.tools.rsaKeygen.algorithm}</p>
            <div className="flex gap-2">
              {(["RSA-OAEP", "RSASSA-PKCS1-v1_5"] as KeyAlgo[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAlgo(a)}
                  className={`px-3 py-1.5 text-xs rounded transition-colors ${
                    algo === a
                      ? "bg-[#0078d4] text-white"
                      : "bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4c4c4c]"
                  }`}
                >
                  {a === "RSA-OAEP" ? t.tools.rsaKeygen.rsaOAEP : t.tools.rsaKeygen.rsaPKCS}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="px-6 py-2 bg-[#0078d4] text-white text-sm rounded hover:bg-[#106ebe] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t.tools.rsaKeygen.generating : t.tools.rsaKeygen.generate}
          </button>
        </div>
        {keySize === 4096 && (
          <p className="mt-2 text-xs text-yellow-400">{t.tools.rsaKeygen.warning4096}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Public Key */}
      {publicKey && (
        <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[#d4d4d4]">{t.tools.rsaKeygen.publicKey}</h3>
            <CopyButton text={publicKey} />
          </div>
          <pre className="font-mono text-xs text-[#9cdcfe] bg-[#1e1e1e] rounded px-3 py-2 overflow-x-auto whitespace-pre-wrap">
            {publicKey}
          </pre>
        </div>
      )}

      {/* Private Key */}
      {privateKey && (
        <div className="bg-[#252526] rounded-lg p-4 border border-red-900/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[#d4d4d4]">
              {t.tools.rsaKeygen.privateKey}
              <span className="ml-2 text-xs text-red-400 font-normal">{t.tools.rsaKeygen.keepPrivateKeySecret}</span>
            </h3>
            <CopyButton text={privateKey} />
          </div>
          <pre className="font-mono text-xs text-[#ce9178] bg-[#1e1e1e] rounded px-3 py-2 overflow-x-auto whitespace-pre-wrap">
            {privateKey}
          </pre>
        </div>
      )}

      {/* Info */}
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <h3 className="text-sm font-medium text-[#d4d4d4] mb-2">{t.tools.rsaKeygen.info}</h3>
        <div className="text-xs text-[#858585] space-y-1">
          <p>{t.tools.rsaKeygen.keysGeneratedWith}</p>
          <p>
            <span className="text-[#9cdcfe]">{t.tools.rsaKeygen.rsaOAEPDesc}</span>：{t.tools.rsaKeygen.rsaOAEPInfo}
          </p>
          <p>
            <span className="text-[#9cdcfe]">{t.tools.rsaKeygen.rsaPKCSDesc}</span>：{t.tools.rsaKeygen.rsaPKCSInfo}
          </p>
          <p>{t.tools.rsaKeygen.keyFormatInfo}</p>
        </div>
      </div>
    </div>
  );
}
