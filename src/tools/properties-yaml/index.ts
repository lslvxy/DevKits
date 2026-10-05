import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "properties-yaml",
  name: { zh: "Properties / YAML 转换", en: "Properties / YAML" },
  description: {
    zh: "Spring 配置转换，支持嵌套路径和数组",
    en: "Convert Spring configurations with nested paths and arrays",
  },
  category: "convert",
  icon: "⚙️",
  keywords: ["properties", "yaml", "spring", "配置", "转换"],
  component: React.lazy(() =>
    import("./PropertiesYaml.tsx").then((m) => ({ default: m.PropertiesYamlTool }))
  ),
};
