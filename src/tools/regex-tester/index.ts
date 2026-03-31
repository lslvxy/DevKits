import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "regex-tester",
  name: "正则表达式",
  description: "正则表达式测试与匹配",
  category: "text",
  icon: "🔍",
  keywords: ["regex", "regexp", "正则", "表达式", "匹配", "pattern", "test"],
  component: React.lazy(() =>
    import("./RegexTester.tsx").then((m) => ({ default: m.RegexTesterTool }))
  ),
};
