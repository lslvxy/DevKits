import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "json-compare",
  name: { zh: "JSON 结构对比", en: "JSON Structural Diff" },
  description: {
    zh: "忽略对象键顺序，比较字段与数组变化",
    en: "Compare JSON fields and arrays ignoring object key order",
  },
  category: "text",
  icon: "🔍",
  keywords: ["json", "diff", "compare", "对比", "差异"],
  component: React.lazy(() =>
    import("./JsonCompare.tsx").then((m) => ({ default: m.JsonCompareTool }))
  ),
};
