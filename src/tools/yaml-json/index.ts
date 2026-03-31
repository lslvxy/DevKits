import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "yaml-json",
  name: { zh: "YAML/JSON 转换", en: "YAML/JSON Converter" },
  description: { zh: "YAML 与 JSON 格式互转", en: "Convert between YAML and JSON" },
  category: "convert",
  icon: "🔀",
  keywords: ["yaml", "json", "convert", "转换"],
  component: React.lazy(() => import("./YamlJson.tsx").then((m) => ({ default: m.YamlJsonTool }))),
};
