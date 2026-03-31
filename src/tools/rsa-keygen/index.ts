import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "rsa-keygen",
  name: "RSA 密钥生成",
  description: "生成 RSA 公私钥对",
  category: "crypto",
  icon: "🗝️",
  keywords: ["rsa", "key", "keygen", "public", "private", "pem", "密钥", "公钥", "私钥", "证书"],
  component: React.lazy(() =>
    import("./RsaKeygen.tsx").then((m) => ({ default: m.RsaKeygenTool }))
  ),
};
