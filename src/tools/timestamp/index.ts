import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "timestamp",
  name: "时间戳转换",
  description: "时间戳与可读日期互转",
  category: "convert",
  icon: "🕐",
  keywords: ["timestamp", "时间戳", "date", "日期", "时间", "unix"],
  component: React.lazy(() =>
    import("./Timestamp.tsx").then((m) => ({ default: m.TimestampTool }))
  ),
};
