import { toolResult } from "../../../core/toolResult.ts";

type Change = {
  path: string;
  type: "added" | "removed" | "changed";
  before?: unknown;
  after?: unknown;
};
const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export function compareJson(left: string, right: string) {
  return toolResult(() => {
    const parse = (source: string): unknown =>
      JSON.parse(source, (_key, value: unknown) => {
        if (typeof value === "number" && Number.isInteger(value) && !Number.isSafeInteger(value)) {
          throw new Error(
            "JSON 整数超出安全范围，请改用字符串 / Unsafe JSON integer; represent it as a string"
          );
        }
        return value;
      });
    const before = parse(left);
    const after = parse(right);
    const changes: Change[] = [];
    const add = (change: Change) => {
      if (changes.length >= 10000)
        throw new Error(
          "差异超过 10000 项，请缩小输入 / More than 10000 differences; narrow the input"
        );
      changes.push(change);
    };
    const walk = (a: unknown, b: unknown, path: string, depth: number) => {
      if (depth > 100) throw new Error("JSON 嵌套超过 100 层 / JSON nesting exceeds 100 levels");
      if (Object.is(a, b)) return;
      if (Array.isArray(a) && Array.isArray(b)) {
        for (let i = 0; i < Math.max(a.length, b.length); i++) {
          const child = `${path}/${i}`;
          if (i >= a.length) add({ path: child, type: "added", after: b[i] });
          else if (i >= b.length) add({ path: child, type: "removed", before: a[i] });
          else walk(a[i], b[i], child, depth + 1);
        }
      } else if (isObject(a) && isObject(b)) {
        const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
        for (const key of keys) {
          const child = `${path}/${key.replace(/~/g, "~0").replace(/\//g, "~1")}`;
          if (!Object.prototype.hasOwnProperty.call(a, key))
            add({ path: child, type: "added", after: b[key] });
          else if (!Object.prototype.hasOwnProperty.call(b, key))
            add({ path: child, type: "removed", before: a[key] });
          else walk(a[key], b[key], child, depth + 1);
        }
      } else add({ path, type: "changed", before: a, after: b });
    };
    walk(before, after, "", 0);
    return JSON.stringify(
      { equal: changes.length === 0, differenceCount: changes.length, changes },
      null,
      2
    );
  });
}
