import { describe, expect, it } from "vitest";
import { convertBase } from "../../src/tools/number-base/parsers/numberBase.ts";

describe("number bases", () => {
  it("preserves precision above Number.MAX_SAFE_INTEGER", () => {
    expect(convertBase("9007199254740993", 10, 16)).toEqual({
      success: true,
      data: "20000000000001",
    });
    expect(convertBase("20000000000001", 16, 10)).toEqual({
      success: true,
      data: "9007199254740993",
    });
  });
  it("accepts signs and matching prefixes", () => {
    expect(convertBase("-0xFF", 16, 2)).toEqual({ success: true, data: "-11111111" });
    expect(convertBase("0o17", 8, 10)).toEqual({ success: true, data: "15" });
    expect(convertBase("Z", 36, 10)).toEqual({ success: true, data: "35" });
  });
  it("rejects invalid digits, fractions and unsupported bases", () => {
    expect(convertBase("102", 2, 10).success).toBe(false);
    expect(convertBase("1.5", 10, 2).success).toBe(false);
    expect(convertBase("1", 1, 10).success).toBe(false);
    expect(convertBase("1".repeat(4097), 10, 2).success).toBe(false);
  });
});
