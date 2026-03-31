import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "log-parser",
  name: "日志解析器",
  description: "解析 Java 日志，支持 Logback/Log4j、toString、KV 等格式",
  category: "text",
  icon: "📋",
  keywords: ["log", "日志", "logback", "log4j", "toString", "kv", "java"],
  component: React.lazy(() => import("./LogParser.tsx").then((m) => ({ default: m.LogParser }))),
};
