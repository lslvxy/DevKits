import { useState } from "react";
import { CopyButton } from "../../components/CopyButton.tsx";
import { getT } from "../../i18n/index.ts";
import { useStore } from "../../core/store.ts";

// ─── MD5 (pure JS, no dependency needed) ────────────────────────────────────
function md5(str: string): string {
  const rotateLeft = (n: number, s: number) => (n << s) | (n >>> (32 - s));
  const addUnsigned = (a: number, b: number) => {
    const a8 = a & 0x80000000;
    const b8 = b & 0x80000000;
    const a4 = a & 0x40000000;
    const b4 = b & 0x40000000;
    const result = (a & 0x3fffffff) + (b & 0x3fffffff);
    if (a4 & b4) return result ^ 0x80000000 ^ a8 ^ b8;
    if (a4 | b4) {
      if (result & 0x40000000) return result ^ 0xc0000000 ^ a8 ^ b8;
      return result ^ 0x40000000 ^ a8 ^ b8;
    }
    return result ^ a8 ^ b8;
  };
  const F = (x: number, y: number, z: number) => (x & y) | (~x & z);
  const G = (x: number, y: number, z: number) => (x & z) | (y & ~z);
  const H = (x: number, y: number, z: number) => x ^ y ^ z;
  const I = (x: number, y: number, z: number) => y ^ (x | ~z);
  const FF = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) =>
    addUnsigned(rotateLeft(addUnsigned(addUnsigned(addUnsigned(a, F(b, c, d)), x), ac), s), b);
  const GG = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) =>
    addUnsigned(rotateLeft(addUnsigned(addUnsigned(addUnsigned(a, G(b, c, d)), x), ac), s), b);
  const HH = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) =>
    addUnsigned(rotateLeft(addUnsigned(addUnsigned(addUnsigned(a, H(b, c, d)), x), ac), s), b);
  const II = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) =>
    addUnsigned(rotateLeft(addUnsigned(addUnsigned(addUnsigned(a, I(b, c, d)), x), ac), s), b);

  const convertToWordArray = (s: string) => {
    const enc = new TextEncoder().encode(s);
    const lMessageLength = enc.length;
    const lNumberOfWords = (((lMessageLength + 8) >>> 6) + 1) << 4;
    const lWordArray: number[] = Array(lNumberOfWords - 1).fill(0);
    for (let i = 0; i < lMessageLength; i++) {
      lWordArray[i >> 2] |= enc[i] << ((i % 4) * 8);
    }
    lWordArray[lMessageLength >> 2] |= 0x80 << ((lMessageLength % 4) * 8);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    return lWordArray;
  };

  const wordToHex = (lValue: number) => {
    let wordToHexValue = "";
    for (let lCount = 0; lCount <= 3; lCount++) {
      const lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValue += `0${lByte.toString(16)}`.slice(-2);
    }
    return wordToHexValue;
  };

  const x = convertToWordArray(str);
  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a;
    const BB = b;
    const CC = c;
    const DD = d;
    a = FF(a, b, c, d, x[k], 7, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], 12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], 17, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], 22, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], 7, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], 12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], 17, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], 22, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], 7, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], 12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], 17, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], 22, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], 7, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], 12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], 17, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], 22, 0x49b40821);
    a = GG(a, b, c, d, x[k + 1], 5, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], 9, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], 14, 0x265e5a51);
    b = GG(b, c, d, a, x[k], 20, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], 5, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], 9, 0x02441453);
    c = GG(c, d, a, b, x[k + 15], 14, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], 20, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], 5, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], 9, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], 14, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], 20, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], 5, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], 9, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], 14, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], 20, 0x8d2a4c8a);
    a = HH(a, b, c, d, x[k + 5], 4, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], 11, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], 16, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], 23, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], 4, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], 11, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], 16, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], 23, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], 4, 0x289b7ec6);
    d = HH(d, a, b, c, x[k], 11, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], 16, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], 23, 0x04881d05);
    a = HH(a, b, c, d, x[k + 9], 4, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], 11, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], 16, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], 23, 0xc4ac5665);
    a = II(a, b, c, d, x[k], 6, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], 10, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], 15, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], 21, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], 6, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], 10, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], 15, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], 21, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], 6, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], 10, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], 15, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], 21, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], 6, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], 10, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], 15, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], 21, 0xeb86d391);
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }
  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

// ─── Web Crypto helpers ──────────────────────────────────────────────────────
async function subtleHash(algorithm: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest(algorithm, encoder.encode(data));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function subtleHmac(algorithm: string, key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: algorithm },
    false,
    ["sign"]
  );
  const buffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// AES-GCM encrypt → base64(iv + ciphertext)
async function aesEncrypt(plaintext: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password.padEnd(32, "\0").slice(0, 32)),
    "AES-GCM",
    false,
    ["encrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    keyMaterial,
    encoder.encode(plaintext)
  );
  const combined = new Uint8Array(12 + cipherBuf.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuf), 12);
  return btoa(String.fromCharCode(...combined));
}

// AES-GCM decrypt
async function aesDecrypt(ciphertext: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password.padEnd(32, "\0").slice(0, 32)),
    "AES-GCM",
    false,
    ["decrypt"]
  );
  const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, keyMaterial, data);
  return new TextDecoder().decode(plainBuf);
}

// ─── Hash Tab ────────────────────────────────────────────────────────────────
type HashAlgo = "MD5" | "SHA-1" | "SHA-256" | "SHA-512";
const HASH_ALGOS: HashAlgo[] = ["MD5", "SHA-1", "SHA-256", "SHA-512"];

function HashTab() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Record<HashAlgo, string>>({} as Record<HashAlgo, string>);
  const [loading, setLoading] = useState(false);

  const computeAll = async (text: string) => {
    if (!text) {
      setResults({} as Record<HashAlgo, string>);
      return;
    }
    setLoading(true);
    const [sha1, sha256, sha512] = await Promise.all([
      subtleHash("SHA-1", text),
      subtleHash("SHA-256", text),
      subtleHash("SHA-512", text),
    ]);
    setResults({ MD5: md5(text), "SHA-1": sha1, "SHA-256": sha256, "SHA-512": sha512 });
    setLoading(false);
  };

  const handleInput = (v: string) => {
    setInput(v);
    computeAll(v);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <h3 className="text-sm font-medium text-[#d4d4d4] mb-2">{t.tools.cryptoTools.inputText}</h3>
        <textarea
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          placeholder={t.tools.cryptoTools.inputHashPlaceholder}
          className="w-full h-24 bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 text-sm text-[#d4d4d4] font-mono placeholder-[#858585] outline-none focus:border-[#0078d4] resize-none"
        />
      </div>
      {loading && <div className="text-xs text-[#858585]">{t.tools.cryptoTools.computing}</div>}
      {HASH_ALGOS.map((algo) => (
        <div key={algo} className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#d4d4d4]">{algo}</span>
            {results[algo] && <CopyButton text={results[algo]} />}
          </div>
          <div className="font-mono text-sm text-[#9cdcfe] bg-[#1e1e1e] rounded px-3 py-2 break-all min-h-[36px]">
            {results[algo] || <span className="text-[#858585]">—</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── HMAC Tab ────────────────────────────────────────────────────────────────
type HmacAlgo = "SHA-1" | "SHA-256" | "SHA-512";
const HMAC_ALGOS: HmacAlgo[] = ["SHA-1", "SHA-256", "SHA-512"];

function HmacTab() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
  const [message, setMessage] = useState("");
  const [secret, setSecret] = useState("");
  const [algo, setAlgo] = useState<HmacAlgo>("SHA-256");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const compute = async (msg: string, sec: string, a: HmacAlgo) => {
    if (!msg || !sec) {
      setResult("");
      return;
    }
    setLoading(true);
    const r = await subtleHmac(a, sec, msg);
    setResult(r);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <div className="flex gap-2 mb-4">
          {HMAC_ALGOS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                setAlgo(a);
                compute(message, secret, a);
              }}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                algo === a
                  ? "bg-[#0078d4] text-white"
                  : "bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4c4c4c]"
              }`}
            >
              HMAC-{a}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="hmac-secret" className="text-xs text-[#858585] mb-1 block">
              {t.tools.cryptoTools.secret}
            </label>
            <input
              id="hmac-secret"
              type="text"
              value={secret}
              onChange={(e) => {
                setSecret(e.target.value);
                compute(message, e.target.value, algo);
              }}
              placeholder={t.tools.cryptoTools.secretPlaceholder}
              className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 text-sm text-[#d4d4d4] font-mono placeholder-[#858585] outline-none focus:border-[#0078d4]"
            />
          </div>
          <div>
            <label htmlFor="hmac-message" className="text-xs text-[#858585] mb-1 block">
              {t.tools.cryptoTools.message}
            </label>
            <textarea
              id="hmac-message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                compute(e.target.value, secret, algo);
              }}
              placeholder={t.tools.cryptoTools.messagePlaceholder}
              className="w-full h-24 bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 text-sm text-[#d4d4d4] font-mono placeholder-[#858585] outline-none focus:border-[#0078d4] resize-none"
            />
          </div>
        </div>
      </div>
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#d4d4d4]">HMAC-{algo} {t.tools.cryptoTools.hmacResult}</span>
          {result && <CopyButton text={result} />}
        </div>
        <div className="font-mono text-sm text-[#9cdcfe] bg-[#1e1e1e] rounded px-3 py-2 break-all min-h-[36px]">
          {loading ? t.tools.cryptoTools.computing : result || <span className="text-[#858585]">—</span>}
        </div>
      </div>
    </div>
  );
}

// ─── AES Tab ─────────────────────────────────────────────────────────────────
function AesTab() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
  const [input, setInput] = useState("");
  const [key, setKey] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");

  const process = async (inp: string, k: string, m: "encrypt" | "decrypt") => {
    setError(null);
    if (!inp.trim() || !k.trim()) {
      setOutput("");
      return;
    }
    try {
      if (m === "encrypt") {
        setOutput(await aesEncrypt(inp, k));
      } else {
        setOutput(await aesDecrypt(inp, k));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t.tools.cryptoTools.processFailed);
      setOutput("");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <p className="text-xs text-[#858585] mb-3">
          {t.tools.cryptoTools.aesNote}
        </p>
        <div className="flex gap-2 mb-4">
          {(["encrypt", "decrypt"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                process(input, key, m);
              }}
              className={`px-4 py-1.5 text-xs rounded transition-colors ${
                mode === m
                  ? "bg-[#0078d4] text-white"
                  : "bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4c4c4c]"
              }`}
            >
              {m === "encrypt" ? t.tools.cryptoTools.encrypt : t.tools.cryptoTools.decrypt}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="aes-key" className="text-xs text-[#858585] mb-1 block">
              {t.tools.cryptoTools.aesKey}
            </label>
            <input
              id="aes-key"
              type="text"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                process(input, e.target.value, mode);
              }}
              placeholder={t.tools.cryptoTools.aesKeyPlaceholder}
              className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 text-sm text-[#d4d4d4] font-mono placeholder-[#858585] outline-none focus:border-[#0078d4]"
            />
          </div>
          <div>
            <label htmlFor="aes-input" className="text-xs text-[#858585] mb-1 block">
              {mode === "encrypt" ? t.tools.cryptoTools.plaintext : t.tools.cryptoTools.ciphertext}
            </label>
            <textarea
              id="aes-input"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                process(e.target.value, key, mode);
              }}
              placeholder={mode === "encrypt" ? t.tools.cryptoTools.encryptPlaceholder : t.tools.cryptoTools.decryptPlaceholder}
              className="w-full h-24 bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 text-sm text-[#d4d4d4] font-mono placeholder-[#858585] outline-none focus:border-[#0078d4] resize-none"
            />
          </div>
        </div>
      </div>
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#d4d4d4]">
            {mode === "encrypt" ? t.tools.cryptoTools.ciphertext : t.tools.cryptoTools.plaintext}
          </span>
          {output && <CopyButton text={output} />}
        </div>
        {error ? (
          <div className="p-2 text-red-400 text-sm font-mono bg-[#1e1e1e] rounded">{error}</div>
        ) : (
          <div className="font-mono text-sm text-[#9cdcfe] bg-[#1e1e1e] rounded px-3 py-2 break-all min-h-[36px] whitespace-pre-wrap">
            {output || <span className="text-[#858585]">—</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
type Tab = "hash" | "hmac" | "aes";

export function CryptoTools() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
  const [tab, setTab] = useState<Tab>("hash");

  return (
    <div className="flex flex-col h-full overflow-auto p-6 gap-4">
      <div className="flex gap-2">
        <button
          key="hash"
          type="button"
          onClick={() => setTab("hash")}
          className={`px-4 py-1.5 text-sm rounded transition-colors ${
            tab === "hash"
              ? "bg-[#0078d4] text-white"
              : "bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4c4c4c]"
          }`}
        >
          {t.tools.cryptoTools.hashTab}
        </button>
        <button
          key="hmac"
          type="button"
          onClick={() => setTab("hmac")}
          className={`px-4 py-1.5 text-sm rounded transition-colors ${
            tab === "hmac"
              ? "bg-[#0078d4] text-white"
              : "bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4c4c4c]"
          }`}
        >
          {t.tools.cryptoTools.hmacTab}
        </button>
        <button
          key="aes"
          type="button"
          onClick={() => setTab("aes")}
          className={`px-4 py-1.5 text-sm rounded transition-colors ${
            tab === "aes"
              ? "bg-[#0078d4] text-white"
              : "bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4c4c4c]"
          }`}
        >
          {t.tools.cryptoTools.aesTab}
        </button>
      </div>
      {tab === "hash" && <HashTab />}
      {tab === "hmac" && <HmacTab />}
      {tab === "aes" && <AesTab />}
    </div>
  );
}
