import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "sql-format",
  name: { zh: "SQL 格式化", en: "SQL Formatter" },
  description: { zh: "格式化 SQL 语句", en: "Format SQL statements" },
  category: "text",
  icon: "🗄️",
  keywords: ["sql", "format", "格式化", "database"],
  component: React.lazy(() =>
    import("./SqlFormat.tsx").then((m) => ({ default: m.SqlFormatTool }))
  ),
};
