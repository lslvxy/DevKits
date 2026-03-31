import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "base64-image",
  name: "Base64 图片",
  description: "图片与 Base64 互转",
  category: "codec",
  icon: "🖼️",
  keywords: ["base64", "image", "图片", "encode", "decode"],
  component: React.lazy(() =>
    import("./Base64Image.tsx").then((m) => ({ default: m.Base64ImageTool }))
  ),
};
