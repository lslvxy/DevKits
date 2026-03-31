import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "mermaid",
  name: "Mermaid 流程图",
  description: "使用 Mermaid 语法绘制流程图",
  category: "generate",
  icon: "📈",
  keywords: ["mermaid", "flowchart", "diagram", "流程图", "图表"],
  component: React.lazy(() =>
    import("./MermaidDiagram.tsx").then((m) => ({ default: m.MermaidDiagramTool }))
  ),
};
