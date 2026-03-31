import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "uuid",
  name: "UUID 生成器",
  description: "生成 UUID v4 / v7 / NanoID",
  category: "generate",
  icon: "🔧",
  keywords: ["uuid", "guid", "generate", "生成", "随机", "v4", "v7", "nanoid"],
  component: React.lazy(() => import("./UUID.tsx").then((m) => ({ default: m.UUIDTool }))),
};
