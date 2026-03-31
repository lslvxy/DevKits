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

import { tool as base64Tool } from "../tools/base64/index.ts";
import { tool as jsonFormatterTool } from "../tools/json-formatter/index.ts";
// Auto-register all tools
import { tool as logParserTool } from "../tools/log-parser/index.ts";
import { tool as timestampTool } from "../tools/timestamp/index.ts";
import { tool as uuidTool } from "../tools/uuid/index.ts";

registerTool(logParserTool);
registerTool(jsonFormatterTool);
registerTool(base64Tool);
registerTool(timestampTool);
registerTool(uuidTool);
