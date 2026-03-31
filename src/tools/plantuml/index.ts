import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "plantuml",
  name: "PlantUML 流程图",
  description: "使用 PlantUML 语法绘制 UML 图",
  category: "generate",
  icon: "🎯",
  keywords: ["plantuml", "uml", "diagram", "流程图", "sequence"],
  component: React.lazy(() => import("./PlantUML.tsx").then((m) => ({ default: m.PlantUMLTool }))),
};
