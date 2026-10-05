import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "html-entities",
  name: { zh: "HTML 实体编解码", en: "HTML Entities" },
  description: {
    zh: "HTML 命名实体和数字实体编解码",
    en: "Encode and decode HTML named and numeric entities",
  },
  category: "codec",
  icon: "🔤",
  keywords: ["html", "entity", "escape", "实体", "转义"],
  component: React.lazy(() =>
    import("./HtmlEntities.tsx").then((m) => ({ default: m.HtmlEntitiesTool }))
  ),
};
