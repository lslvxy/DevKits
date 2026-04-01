import type { ToolDefinition } from "./types.ts";

const _registry: ToolDefinition[] = [];

export function registerTool(tool: ToolDefinition): void {
  if (_registry.find((t) => t.id === tool.id)) {
    return;
  }
  _registry.push(tool);
}

export function getAllTools(): ToolDefinition[] {
  return [..._registry];
}

export function getToolById(id: string): ToolDefinition | undefined {
  return _registry.find((t) => t.id === id);
}

import { tool as base64ImageTool } from "../tools/base64-image/index.ts";
import { tool as base64Tool } from "../tools/base64/index.ts";
import { tool as cronTool } from "../tools/cron-tool/index.ts";
import { tool as cryptoToolsTool } from "../tools/crypto-tools/index.ts";
import { tool as csvJsonTool } from "../tools/csv-json/index.ts";
import { tool as hexAsciiTool } from "../tools/hex-ascii/index.ts";
import { tool as jsonFormatterTool } from "../tools/json-formatter/index.ts";
import { tool as jwtTool } from "../tools/jwt/index.ts";
// Auto-register all tools
import { tool as logParserTool } from "../tools/log-parser/index.ts";
import { tool as mermaidTool } from "../tools/mermaid/index.ts";
import { tool as plantumlTool } from "../tools/plantuml/index.ts";
import { tool as qrcodeTool } from "../tools/qrcode/index.ts";
import { tool as randomStringTool } from "../tools/random-string/index.ts";
import { tool as regexTesterTool } from "../tools/regex-tester/index.ts";
import { tool as rsaKeygenTool } from "../tools/rsa-keygen/index.ts";
import { tool as sqlFormatTool } from "../tools/sql-format/index.ts";
import { tool as sqlPojoTool } from "../tools/sql-pojo/index.ts";
import { tool as textDiffTool } from "../tools/text-diff/index.ts";
import { tool as timestampTool } from "../tools/timestamp/index.ts";
import { tool as urlCodecTool } from "../tools/url-codec/index.ts";
import { tool as uuidTool } from "../tools/uuid/index.ts";
import { tool as yamlJsonTool } from "../tools/yaml-json/index.ts";

registerTool(logParserTool);
registerTool(jsonFormatterTool);
registerTool(base64Tool);
registerTool(timestampTool);
registerTool(uuidTool);
registerTool(base64ImageTool);
registerTool(jwtTool);
registerTool(textDiffTool);
registerTool(yamlJsonTool);
registerTool(sqlFormatTool);
registerTool(sqlPojoTool);
registerTool(qrcodeTool);
registerTool(csvJsonTool);
registerTool(mermaidTool);
registerTool(plantumlTool);
registerTool(randomStringTool);
registerTool(hexAsciiTool);
// New tools
registerTool(urlCodecTool);
registerTool(cryptoToolsTool);
registerTool(rsaKeygenTool);
registerTool(regexTesterTool);
registerTool(cronTool);

// Auto-discover private tools from src/tools-private/ (gitignored).
// To wire in your private tools repo:
//   git clone git@github.com:your-org/private-tools.git src/tools-private
//   # or: git submodule add git@github.com:your-org/private-tools.git src/tools-private
//
// Each subdirectory must export a named `tool: ToolDefinition` from its index.ts,
// following the same contract as tools in src/tools/.
const _privateModules = import.meta.glob<{ tool: ToolDefinition }>(
  "../tools-private/*/index.ts",
  { eager: true },
);
for (const mod of Object.values(_privateModules)) {
  if (mod?.tool) {
    registerTool(mod.tool);
  }
}
registerTool(cronTool);
