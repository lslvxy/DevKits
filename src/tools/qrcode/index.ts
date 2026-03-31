import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "qrcode",
  name: "QR Code",
  description: "生成和解析 QR 二维码",
  category: "generate",
  icon: "📱",
  keywords: ["qrcode", "qr", "二维码", "generate", "decode", "scan"],
  component: React.lazy(() => import("./QRCode.tsx").then((m) => ({ default: m.QRCodeTool }))),
};
