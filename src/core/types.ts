import type React from "react";

export type ToolCategory = "text" | "codec" | "crypto" | "convert" | "generate" | "other";

export type ToolDefinition = {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  keywords: string[];
  component: React.LazyExoticComponent<React.ComponentType>;
};

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  text: "📋 文本",
  codec: "🔄 编解码",
  convert: "🕐 转换",
  generate: "🔧 生成",
  crypto: "🔐 加密",
  other: "⚙️ 其他",
};

export const CATEGORY_ORDER: ToolCategory[] = [
  "text",
  "codec",
  "convert",
  "generate",
  "crypto",
  "other",
];
