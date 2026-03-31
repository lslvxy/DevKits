import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "csv-json",
  name: "CSV/JSON 转换",
  description: "CSV 与 JSON 格式互转",
  category: "convert",
  icon: "📋",
  keywords: ["csv", "json", "convert", "转换", "table"],
  component: React.lazy(() => import("./CsvJson.tsx").then((m) => ({ default: m.CsvJsonTool }))),
};
