import yaml from "js-yaml";
import { toolResult } from "../../../core/toolResult.ts";

type Node = string | Node[] | { [key: string]: Node };
const whitespace = /[ \t\f]/;

function unescapeProperty(value: string): string {
  let output = "";
  for (let i = 0; i < value.length; i++) {
    if (value[i] !== "\\") {
      output += value[i];
      continue;
    }
    const next = value[++i];
    if (next === undefined) break;
    if (next === "u") {
      const hex = value.slice(i + 1, i + 5);
      if (!/^[0-9a-fA-F]{4}$/.test(hex))
        throw new Error("Invalid Unicode escape / Unicode 转义错误");
      output += String.fromCharCode(Number.parseInt(hex, 16));
      i += 4;
    } else {
      output += ({ n: "\n", r: "\r", t: "\t", f: "\f" } as Record<string, string>)[next] ?? next;
    }
  }
  return output;
}

function parseProperties(source: string): Map<string, string> {
  const result = new Map<string, string>();
  const lines = source.split(/\r\n|\n|\r/);
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(/^[ \t\f]+/, "");
    if (!line || /^[#!]/.test(line)) continue;
    while ((line.match(/\\+$/)?.[0].length ?? 0) % 2 === 1) {
      line = line.slice(0, -1);
      if (++i >= lines.length) break;
      line += lines[i].replace(/^[ \t\f]+/, "");
    }
    let separator = line.length;
    for (let j = 0; j < line.length; j++) {
      if (line[j] === "\\") {
        j++;
        continue;
      }
      if (line[j] === "=" || line[j] === ":" || whitespace.test(line[j])) {
        separator = j;
        break;
      }
    }
    let start = separator;
    while (start < line.length && whitespace.test(line[start])) start++;
    if (line[start] === "=" || line[start] === ":") start++;
    while (start < line.length && whitespace.test(line[start])) start++;
    result.set(unescapeProperty(line.slice(0, separator)), unescapeProperty(line.slice(start)));
  }
  return result;
}

function pathSegments(key: string): (string | number)[] {
  const segments: (string | number)[] = [];
  let position = 0;
  while (position < key.length) {
    if (key[position] === "[") {
      const index = /^\[(\d+)\]/.exec(key.slice(position));
      if (!index) throw new Error(`Invalid array key: ${key}`);
      const number = Number(index[1]);
      if (number > 10000) throw new Error(`Array index too large: ${key}`);
      segments.push(number);
      position += index[0].length;
    } else {
      const name = /^[^.\[\]]+/.exec(key.slice(position));
      if (!name) throw new Error(`Invalid property key: ${key}`);
      segments.push(name[0]);
      position += name[0].length;
    }
    if (key[position] === ".") {
      position++;
      if (position === key.length || key[position] === "[")
        throw new Error(`Invalid property key: ${key}`);
    } else if (position < key.length && key[position] !== "[") {
      throw new Error(`Invalid property key: ${key}`);
    }
  }
  if (!segments.length || segments.length > 100) throw new Error(`Invalid property depth: ${key}`);
  return segments;
}

function insert(root: Node, segments: (string | number)[], value: string, key: string) {
  let current = root;
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (typeof current === "string" || Array.isArray(current) !== (typeof segment === "number")) {
      throw new Error(`Conflicting property path / 配置路径冲突: ${key}`);
    }
    const container = current as unknown as Record<string | number, Node>;
    const exists = Object.prototype.hasOwnProperty.call(container, segment);
    if (i === segments.length - 1) {
      if (exists) throw new Error(`Conflicting property path / 配置路径冲突: ${key}`);
      container[segment] = value;
    } else {
      if (!exists)
        container[segment] = typeof segments[i + 1] === "number" ? [] : Object.create(null);
      current = container[segment];
    }
  }
}

function checkArrays(node: Node) {
  if (typeof node === "string") return;
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      if (!Object.prototype.hasOwnProperty.call(node, i))
        throw new Error("Sparse array indices / 数组下标必须从 0 连续排列");
      checkArrays(node[i]);
    }
  } else {
    for (const child of Object.values(node)) checkArrays(child);
  }
}

function escapeProperty(value: string, key: boolean): string {
  return value.replace(/[\\\n\r\t\f =:#!]/g, (character, offset: number) => {
    const escaped = (
      { "\\": "\\\\", "\n": "\\n", "\r": "\\r", "\t": "\\t", "\f": "\\f" } as Record<string, string>
    )[character];
    if (escaped) return escaped;
    return key || (character === " " && offset === 0) ? `\\${character}` : character;
  });
}

function flatten(
  value: unknown,
  path: string,
  output: string[],
  ancestors: Set<object>,
  depth: number
) {
  if (depth > 100) throw new Error("Configuration nesting exceeds 100 / 配置嵌套过深");
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    if (!path)
      throw new Error("YAML root must be a mapping or array / YAML 根节点必须是对象或数组");
    output.push(`${escapeProperty(path, true)}=${escapeProperty(String(value), false)}`);
    return;
  }
  if (!value || typeof value !== "object")
    throw new Error(`Cannot represent null / 无法转换空值: ${path}`);
  if (ancestors.has(value)) throw new Error("Cyclic YAML alias / YAML 别名存在循环引用");
  ancestors.add(value);
  if (Array.isArray(value)) {
    if (!value.length) throw new Error(`Cannot represent empty array / 无法转换空数组: ${path}`);
    value.forEach((item, index) =>
      flatten(item, `${path}[${index}]`, output, ancestors, depth + 1)
    );
  } else {
    const entries = Object.entries(value);
    if (!entries.length && path)
      throw new Error(`Cannot represent empty mapping / 无法转换空对象: ${path}`);
    for (const [key, child] of entries) {
      if (!key || /[.\[\]]/.test(key))
        throw new Error(`Ambiguous YAML key / YAML 键含路径分隔符: ${key}`);
      flatten(child, path ? `${path}.${key}` : key, output, ancestors, depth + 1);
    }
  }
  ancestors.delete(value);
}

export function convertPropertiesYaml(input: string, mode: "properties2yaml" | "yaml2properties") {
  return toolResult(() => {
    if (!input.trim()) return "";
    if (mode === "properties2yaml") {
      const properties = parseProperties(input);
      let root: Node | undefined;
      for (const [key, value] of properties) {
        const segments = pathSegments(key);
        root ??= typeof segments[0] === "number" ? [] : Object.create(null);
        insert(root as Node, segments, value, key);
      }
      if (!root) return "";
      checkArrays(root);
      return yaml.dump(root, { indent: 2, noRefs: true, lineWidth: -1 });
    }
    const output: string[] = [];
    flatten(yaml.load(input, { schema: yaml.JSON_SCHEMA }), "", output, new Set(), 0);
    return output.join("\n");
  });
}
