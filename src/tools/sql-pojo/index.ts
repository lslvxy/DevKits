import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "sql-pojo",
  name: "SQL → POJO",
  description: "CREATE TABLE SQL 转换为 Java POJO 类",
  category: "convert",
  icon: "☕",
  keywords: ["sql", "pojo", "java", "bean", "class", "convert"],
  component: React.lazy(() => import("./SqlPojo.tsx").then((m) => ({ default: m.SqlPojoTool }))),
};
