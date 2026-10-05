import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "text-batch",
  name: { zh: "文本批处理", en: "Text Batch" },
  description: {
    zh: "去重、排序、空行清理、大小写和前后缀",
    en: "Deduplicate, sort, trim and transform text lines",
  },
  category: "text",
  icon: "📝",
  keywords: ["text", "sort", "unique", "去重", "排序", "批处理"],
  component: React.lazy(() =>
    import("./TextBatch.tsx").then((m) => ({ default: m.TextBatchTool }))
  ),
};
