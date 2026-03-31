import type React from "react";
import type { LocalizedString } from "../i18n/index.ts";

export type ToolCategory = "text" | "codec" | "crypto" | "convert" | "generate" | "other";

export type ToolDefinition = {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  category: ToolCategory;
  icon: string;
  keywords: string[];
  component: React.LazyExoticComponent<React.ComponentType>;
};

export const CATEGORY_ORDER: ToolCategory[] = [
  "text",
  "codec",
  "convert",
  "generate",
  "crypto",
  "other",
];
