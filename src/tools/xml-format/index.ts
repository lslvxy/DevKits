import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "xml-format",
  name: { zh: "XML 格式化", en: "XML Formatter" },
  description: { zh: "格式化、压缩与 XML 语法校验", en: "Format, minify and validate XML syntax" },
  category: "text",
  icon: "📄",
  keywords: ["xml", "format", "validate", "格式化", "校验"],
  component: React.lazy(() =>
    import("./XmlFormat.tsx").then((m) => ({ default: m.XmlFormatTool }))
  ),
};
