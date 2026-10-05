import { useSyncExternalStore } from "react";
import type { Locale, LocalizedString } from "../i18n/index.ts";
import { CATEGORY_ORDER, type ToolDefinition } from "./types.ts";

export type PluginIssue = {
  source: string;
  error: string;
};

export type RegistrySnapshot = {
  tools: ToolDefinition[];
  customCategories: Record<string, LocalizedString>;
  issues: PluginIssue[];
};

const initialSnapshot: RegistrySnapshot = {
  tools: [],
  customCategories: {},
  issues: [],
};

let snapshot: RegistrySnapshot = initialSnapshot;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): RegistrySnapshot {
  return snapshot;
}

/** Reactively subscribe to the tool registry. */
export function useRegistry(): RegistrySnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getAllTools(): ToolDefinition[] {
  return snapshot.tools;
}

export function getToolById(id: string): ToolDefinition | undefined {
  return snapshot.tools.find((t) => t.id === id);
}

/** Tool-provided translations for a given tool and locale (falls back en → zh → {}). */
export function getToolT(id: string, locale: Locale): Record<string, string> {
  const i18n = getToolById(id)?.i18n;
  return i18n?.[locale] ?? i18n?.en ?? i18n?.zh ?? {};
}

function validateTool(tool: ToolDefinition): string | null {
  if (!tool || typeof tool !== "object") return "tool is not an object";
  if (!tool.id || typeof tool.id !== "string") return "missing or invalid 'id'";
  if (!tool.name?.zh || !tool.name?.en) return "missing 'name' (zh/en)";
  if (!tool.description?.zh || !tool.description?.en) return "missing 'description' (zh/en)";
  if (!tool.category || typeof tool.category !== "string") return "missing 'category'";
  if (!tool.icon || typeof tool.icon !== "string") return "missing 'icon'";
  if (!Array.isArray(tool.keywords)) return "'keywords' must be an array";
  if (!tool.component) return "missing 'component'";
  return null;
}

export function registerTool(tool: ToolDefinition, source = "unknown"): void {
  const error = validateTool(tool);
  if (error) {
    const id = tool && typeof tool.id === "string" ? tool.id : "?";
    console.warn(`[DevKits] failed to register tool "${id}" (${source}): ${error}`);
    snapshot = {
      ...snapshot,
      issues: [...snapshot.issues, { source: `${source} → ${id}`, error }],
    };
    emit();
    return;
  }
  if (snapshot.tools.some((t) => t.id === tool.id)) {
    return;
  }
  snapshot = { ...snapshot, tools: [...snapshot.tools, tool] };
  emit();
  try {
    void tool.activate?.();
  } catch (e) {
    console.warn(`[DevKits] activate() failed for tool "${tool.id}":`, e);
  }
}

export function registerCategory(category: string, label: LocalizedString): void {
  if (!category || snapshot.customCategories[category]) return;
  snapshot = {
    ...snapshot,
    customCategories: { ...snapshot.customCategories, [category]: label },
  };
  emit();
}

/** Built-in categories first, then any custom category present in the registry. */
export function getCategoryOrder(): string[] {
  const order = [...CATEGORY_ORDER];
  for (const tool of snapshot.tools) {
    if (!order.includes(tool.category)) order.push(tool.category);
  }
  return order;
}

// ── Auto-discovery ───────────────────────────────────────────────────────────
// Both built-in tools (src/tools/) and private tools (src/tools-private/) are
// discovered and registered through the same `import.meta.glob` path. Adding a
// tool is just dropping a `<name>/index.ts` exporting a `tool: ToolDefinition`.
const _toolModules = import.meta.glob<{ tool?: ToolDefinition }>(
  ["../tools/*/index.ts", "../tools-private/*/index.ts"],
  { eager: true }
);

for (const [path, mod] of Object.entries(_toolModules)) {
  if (mod?.tool) {
    registerTool(mod.tool, path);
  } else {
    console.warn(`[DevKits] module "${path}" does not export a 'tool'`);
    snapshot = {
      ...snapshot,
      issues: [...snapshot.issues, { source: path, error: "missing 'tool' export" }],
    };
  }
}
