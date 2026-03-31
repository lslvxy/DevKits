import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "cron-tool",
  name: "Cron 表达式",
  description: "Cron 表达式可视化创建与解析",
  category: "other",
  icon: "⏰",
  keywords: ["cron", "schedule", "定时", "调度", "表达式", "corn", "crontab"],
  component: React.lazy(() => import("./CronTool.tsx").then((m) => ({ default: m.CronTool }))),
};
