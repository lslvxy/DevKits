import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "mermaid",
  name: { zh: "Mermaid 流程图", en: "Mermaid Diagram" },
  description: { zh: "使用 Mermaid 语法绘制流程图", en: "Draw diagrams with Mermaid syntax" },
  category: "generate",
  icon: "📈",
  keywords: ["mermaid", "flowchart", "diagram", "流程图", "图表"],
  component: React.lazy(() =>
    import("./MermaidDiagram.tsx").then((m) => ({ default: m.MermaidDiagramTool }))
  ),
};
