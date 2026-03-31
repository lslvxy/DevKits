import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "crypto-tools",
  name: { zh: "加解密工具", en: "Crypto Tools" },
  description: { zh: "哈希、AES 加解密等常用加密算法", en: "Hash, AES encryption and more" },
  category: "crypto",
  icon: "🔐",
  keywords: [
    "crypto",
    "hash",
    "md5",
    "sha",
    "sha256",
    "sha512",
    "aes",
    "encrypt",
    "decrypt",
    "hmac",
    "加密",
    "解密",
    "哈希",
  ],
  component: React.lazy(() =>
    import("./CryptoTools.tsx").then((m) => ({ default: m.CryptoTools }))
  ),
};
