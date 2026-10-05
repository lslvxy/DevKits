import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "jsonpath",
  name: { zh: "JSONPath 查询", en: "JSONPath Query" },
  description: {
    zh: "查询 JSON 字段、数组过滤与路径提取",
    en: "Query JSON fields, filter arrays and extract paths",
  },
  category: "text",
  icon: "🔎",
  keywords: ["json", "jsonpath", "query", "过滤", "查询"],
  component: React.lazy(() => import("./JsonPath.tsx").then((m) => ({ default: m.JsonPathTool }))),
};
