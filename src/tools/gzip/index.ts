import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "gzip",
  name: { zh: "Gzip 压缩解压", en: "Gzip Codec" },
  description: {
    zh: "UTF-8 文本与 Gzip Base64 互转",
    en: "Convert UTF-8 text to and from Gzip Base64",
  },
  category: "codec",
  icon: "📦",
  keywords: ["gzip", "compress", "base64", "压缩", "解压"],
  component: React.lazy(() => import("./Gzip.tsx").then((m) => ({ default: m.GzipTool }))),
};
