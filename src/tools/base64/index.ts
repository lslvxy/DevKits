import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "base64",
  name: "Base64 编解码",
  description: "Base64 编码与解码",
  category: "codec",
  icon: "🔄",
  keywords: ["base64", "encode", "decode", "编码", "解码"],
  component: React.lazy(() => import("./Base64.tsx").then((m) => ({ default: m.Base64Tool }))),
};
