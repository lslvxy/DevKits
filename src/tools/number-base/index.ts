import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "number-base",
  name: { zh: "进制转换", en: "Number Base Converter" },
  description: {
    zh: "2–36 进制整数转换，支持大整数",
    en: "Convert integers between bases 2–36 without precision loss",
  },
  category: "convert",
  icon: "🔢",
  keywords: ["binary", "hex", "decimal", "base", "进制", "二进制"],
  component: React.lazy(() =>
    import("./NumberBase.tsx").then((m) => ({ default: m.NumberBaseTool }))
  ),
};
