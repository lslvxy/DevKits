import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "cron-tool",
  name: { zh: "Cron 表达式", en: "Cron Expression" },
  description: { zh: "Cron 表达式可视化创建与解析", en: "Visual Cron expression builder and parser" },
  category: "other",
  icon: "⏰",
  keywords: ["cron", "schedule", "定时", "调度", "表达式", "corn", "crontab"],
  component: React.lazy(() => import("./CronTool.tsx").then((m) => ({ default: m.CronTool }))),
};
