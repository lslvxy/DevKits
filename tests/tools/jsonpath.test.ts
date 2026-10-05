import { describe, expect, it } from "vitest";
import { queryJson } from "../../src/tools/jsonpath/parsers/jsonpath.ts";

const source = '{"users":[{"name":"Alice","age":25},{"name":"Bob","age":16}]}';
describe("JSONPath", () => {
  it("supports RFC filters", () => {
    expect(queryJson(source, "$.users[?@.age >= 18].name")).toEqual({
      success: true,
      data: '[\n  "Alice"\n]',
    });
  });
  it("returns normalized paths", () => {
    const result = queryJson(source, "$.users[0].name", true);
    expect(result.success && JSON.parse(result.data)).toEqual(["$['users'][0]['name']"]);
  });
  it("returns no matches as an empty array", () => {
    expect(queryJson(source, "$.missing")).toEqual({ success: true, data: "[]" });
  });
  it("reports invalid JSON and syntax without throwing", () => {
    expect(queryJson("{", "$").success).toBe(false);
    expect(queryJson(source, "$[").success).toBe(false);
  });
});
