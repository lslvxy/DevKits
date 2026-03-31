import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "json-formatter",
  name: "JSON 格式化",
  description: "格式化、压缩、校验 JSON 数据",
  category: "text",
  icon: "📄",
  keywords: ["json", "format", "格式化", "压缩", "校验", "validate"],
  component: React.lazy(() =>
    import("./JsonFormatter.tsx").then((m) => ({ default: m.JsonFormatter }))
  ),
};
