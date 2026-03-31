import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "json-formatter",
  name: { zh: "JSON 格式化", en: "JSON Formatter" },
  description: { zh: "格式化、压缩、校验、转义 JSON 数据", en: "Format, compact, validate and escape JSON" },
  category: "text",
  icon: "📄",
  keywords: ["json", "format", "格式化", "压缩", "校验", "validate", "转义", "escape", "unescape"],
  component: React.lazy(() =>
    import("./JsonFormatter.tsx").then((m) => ({ default: m.JsonFormatter }))
  ),
};
