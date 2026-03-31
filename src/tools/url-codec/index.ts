import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "url-codec",
  name: "URL 编解码",
  description: "URL 编码与解码",
  category: "codec",
  icon: "🔗",
  keywords: ["url", "encode", "decode", "编码", "解码", "urlencode", "percent"],
  component: React.lazy(() => import("./UrlCodec.tsx").then((m) => ({ default: m.UrlCodecTool }))),
};
