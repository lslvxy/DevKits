import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "plantuml",
  name: { zh: "PlantUML 流程图", en: "PlantUML Diagram" },
  description: { zh: "使用 PlantUML 语法绘制 UML 图", en: "Draw UML diagrams with PlantUML syntax" },
  category: "generate",
  icon: "🎯",
  keywords: ["plantuml", "uml", "diagram", "流程图", "sequence"],
  component: React.lazy(() => import("./PlantUML.tsx").then((m) => ({ default: m.PlantUMLTool }))),
};
