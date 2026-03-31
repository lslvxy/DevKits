import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "text-diff",
  name: { zh: "文本对比", en: "Text Diff" },
  description: { zh: "对比两段文本的差异", en: "Compare differences between two texts" },
  category: "text",
  icon: "📊",
  keywords: ["diff", "compare", "文本对比", "差异"],
  component: React.lazy(() => import("./TextDiff.tsx").then((m) => ({ default: m.TextDiffTool }))),
};
