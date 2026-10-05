import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "markdown",
  name: { zh: "Markdown 预览", en: "Markdown Preview" },
  description: {
    zh: "Markdown 表格、代码块预览与 HTML 导出",
    en: "Preview Markdown tables and code blocks and copy HTML",
  },
  category: "text",
  icon: "📝",
  keywords: ["markdown", "preview", "html", "文档", "预览"],
  component: React.lazy(() =>
    import("./MarkdownPreview.tsx").then((m) => ({ default: m.MarkdownPreviewTool }))
  ),
};
