import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "jwt",
  name: { zh: "JWT 解析", en: "JWT Decoder" },
  description: { zh: "解析 JWT Token 的 Header 和 Payload", en: "Decode JWT Token header and payload" },
  category: "codec",
  icon: "🔑",
  keywords: ["jwt", "token", "decode", "bearer", "auth"],
  component: React.lazy(() => import("./JWT.tsx").then((m) => ({ default: m.JWTTool }))),
};
