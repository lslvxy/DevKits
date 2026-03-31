import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "sql-pojo",
  name: { zh: "SQL → POJO", en: "SQL → POJO" },
  description: {
    zh: "CREATE TABLE SQL 转换为 Java POJO 类",
    en: "Convert CREATE TABLE SQL to Java POJO class",
  },
  category: "convert",
  icon: "☕",
  keywords: ["sql", "pojo", "java", "bean", "class", "convert"],
  component: React.lazy(() => import("./SqlPojo.tsx").then((m) => ({ default: m.SqlPojoTool }))),
};
