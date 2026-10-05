import yaml from "js-yaml";
import { describe, expect, it } from "vitest";
import { convertPropertiesYaml } from "../../src/tools/properties-yaml/parsers/propertiesYaml.ts";

describe("Properties / YAML", () => {
  it("preserves strings, parses escapes, continuation, arrays and duplicate keys", () => {
    const result = convertPropertiesYaml(
      "# comment\nserver.port: 8080\nname=old\nname=\\u4f60\\u597d\nitems[0]=a\\\n  b\nitems[1]=false",
      "properties2yaml"
    );
    expect(result.success).toBe(true);
    if (result.success)
      expect(yaml.load(result.data)).toEqual({
        server: { port: "8080" },
        name: "你好",
        items: ["ab", "false"],
      });
  });
  it("round trips escaped delimiters and leading spaces", () => {
    const properties = "a\\=b=\\ value\\nnext\nitems[0]=001";
    const result = convertPropertiesYaml(properties, "properties2yaml");
    if (!result.success) throw new Error(result.error);
    const back = convertPropertiesYaml(result.data, "yaml2properties");
    expect(back).toEqual({ success: true, data: properties });
  });
  it("rejects conflicting paths, malformed escapes and sparse arrays", () => {
    for (const source of [
      "a=x\na.b=y",
      "a.b=y\na=x",
      "x=\\uZZZZ",
      "items[1]=x",
      "a[0]=x\na.name=y",
    ]) {
      expect(convertPropertiesYaml(source, "properties2yaml").success).toBe(false);
    }
  });
  it("handles prototype-like keys without modifying prototypes", () => {
    const result = convertPropertiesYaml(
      "__proto__.safe=yes\nconstructor.name=test",
      "properties2yaml"
    );
    expect(result.success).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(Object.prototype, "safe")).toBe(false);
  });
  it("rejects cyclic aliases, empty containers, null and ambiguous YAML keys", () => {
    for (const source of ["a: &loop\n  b: *loop", "a: []", "a: null", "a.b: x"]) {
      expect(convertPropertiesYaml(source, "yaml2properties").success).toBe(false);
    }
  });
});
