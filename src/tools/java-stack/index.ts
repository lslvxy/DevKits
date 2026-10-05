import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "java-stack",
  name: { zh: "Java 堆栈分析", en: "Java Stack Analyzer" },
  description: {
    zh: "异常链、根因与业务栈提取",
    en: "Extract exception chains, root causes and business frames",
  },
  category: "text",
  icon: "☕",
  keywords: ["java", "exception", "stack", "异常", "堆栈", "根因"],
  component: React.lazy(() =>
    import("./JavaStack.tsx").then((m) => ({ default: m.JavaStackTool }))
  ),
};
