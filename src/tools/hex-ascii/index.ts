import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "hex-ascii",
  name: "Hex/ASCII 转换",
  description: "Hex 与 ASCII 文本互转",
  category: "codec",
  icon: "🔢",
  keywords: ["hex", "ascii", "convert", "转换", "hexadecimal"],
  component: React.lazy(() => import("./HexAscii.tsx").then((m) => ({ default: m.HexAsciiTool }))),
};
