import type React from "react";
import type { Locale, LocalizedString } from "../i18n/index.ts";

export const BUILTIN_CATEGORIES = [
  "text",
  "codec",
  "crypto",
  "convert",
  "generate",
  "other",
] as const;

export type BuiltinCategory = (typeof BUILTIN_CATEGORIES)[number];

/**
 * Tool category. Built-in categories get a stable sidebar position; plugins may
 * use arbitrary custom categories via `registerCategory`.
 */
export type ToolCategory = BuiltinCategory | (string & {});

export type ToolI18n = Partial<Record<Locale, Record<string, string>>>;

export type ToolComponent = React.ComponentType | React.LazyExoticComponent<React.ComponentType>;

export type ToolDefinition = {
  /** Globally unique identifier, kebab-case recommended. */
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  category: ToolCategory;
  icon: string;
  keywords: string[];
  /** Tool UI, eager or `React.lazy` (lazy is recommended for code-splitting). */
  component: ToolComponent;
  /** Semver, for display / compatibility checks. */
  version?: string;
  /** `"builtin"` for in-repo tools, `"plugin"` for third-party tools. */
  type?: "builtin" | "plugin";
  /** Tool-provided translations (see `getToolT`). */
  i18n?: ToolI18n;
  /** Optional settings panel rendered from the tool header. */
  settings?: ToolComponent;
  /** Optional lifecycle hook invoked once after registration. */
  activate?: () => void | Promise<void>;
};

/**
 * Ordered built-in categories. Custom categories (registered via
 * `registerCategory`) are appended after these in discovery order.
 */
export const CATEGORY_ORDER: string[] = [...BUILTIN_CATEGORIES];
