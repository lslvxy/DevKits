import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "csv-json",
  name: { zh: "CSV/JSON 转换", en: "CSV/JSON Converter" },
  description: { zh: "CSV 与 JSON 格式互转", en: "Convert between CSV and JSON" },
  category: "convert",
  icon: "📋",
  keywords: ["csv", "json", "convert", "转换", "table"],
  component: React.lazy(() => import("./CsvJson.tsx").then((m) => ({ default: m.CsvJsonTool }))),
};
