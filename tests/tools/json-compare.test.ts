import { describe, expect, it } from "vitest";
import { compareJson } from "../../src/tools/json-compare/parsers/jsonCompare.ts";

function data(left: string, right: string) {
  const result = compareJson(left, right);
  if (!result.success) throw new Error(result.error);
  return JSON.parse(result.data);
}
describe("JSON structural comparison", () => {
  it("ignores object key order and formatting", () => {
    expect(data('{"a":1,"b":2}', '{ "b": 2, "a": 1 }').equal).toBe(true);
  });
  it("distinguishes missing properties, null and different types", () => {
    expect(data('{"a":null,"b":1}', '{"b":"1","c":null}').changes).toEqual([
      { path: "/a", type: "removed", before: null },
      { path: "/b", type: "changed", before: 1, after: "1" },
      { path: "/c", type: "added", after: null },
    ]);
  });
  it("compares arrays by index and escapes JSON Pointer segments", () => {
    expect(data('{"a/b~c":[1]}', '{"a/b~c":[2,3]}').changes).toEqual([
      { path: "/a~1b~0c/0", type: "changed", before: 1, after: 2 },
      { path: "/a~1b~0c/1", type: "added", after: 3 },
    ]);
    expect(data("null", "false").changes[0].path).toBe("");
  });
  it("reports invalid JSON", () => {
    expect(compareJson("{", "{}").success).toBe(false);
  });
  it("rejects unsafe integers instead of silently reporting rounded values as equal", () => {
    expect(compareJson("9007199254740992", "9007199254740993").success).toBe(false);
  });
});
