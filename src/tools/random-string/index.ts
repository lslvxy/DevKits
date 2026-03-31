import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "random-string",
  name: "随机字符串",
  description: "生成随机字符串",
  category: "generate",
  icon: "🎲",
  keywords: ["random", "string", "generate", "随机", "字符串", "password"],
  component: React.lazy(() =>
    import("./RandomString.tsx").then((m) => ({ default: m.RandomStringTool }))
  ),
};
