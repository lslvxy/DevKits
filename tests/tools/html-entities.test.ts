import { describe, expect, it } from "vitest";
import { processEntities } from "../../src/tools/html-entities/parsers/htmlEntities.ts";

describe("HTML entities", () => {
  it("decodes named, decimal and supplementary Unicode entities", () => {
    expect(processEntities("&lt;tag&gt; &copy; &#169; &#x1F600;", "decode")).toEqual({
      success: true,
      data: "<tag> © © 😀",
    });
  });
  it("round trips text including quotes and markup", () => {
    const text = '<script>alert("你好 & 😀")</script>';
    const result = processEntities(text, "encode");
    if (!result.success) throw new Error(result.error);
    expect(result.data).not.toContain("<script>");
    expect(processEntities(result.data, "decode")).toEqual({ success: true, data: text });
  });
});
