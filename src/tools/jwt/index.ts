import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "jwt",
  name: "JWT 解析",
  description: "解析 JWT Token 的 Header 和 Payload",
  category: "codec",
  icon: "🔑",
  keywords: ["jwt", "token", "decode", "bearer", "auth"],
  component: React.lazy(() => import("./JWT.tsx").then((m) => ({ default: m.JWTTool }))),
};
