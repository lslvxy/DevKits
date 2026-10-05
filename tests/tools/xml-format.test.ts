import { describe, expect, it } from "vitest";
import { processXml } from "../../src/tools/xml-format/parsers/xmlFormat.ts";

describe("XML tools", () => {
  it("formats element-only content and preserves declaration and comments", () => {
    const result = processXml(
      '<?xml version="1.0"?><root><!--note--><item id="1"/></root>',
      "format"
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toContain('<?xml version="1.0"?>');
      expect(result.data).toContain('\n  <item id="1"/>');
      expect(result.data).toContain("<!--note-->");
    }
  });
  it("preserves mixed text, CDATA and xml:space", () => {
    for (const source of [
      "<p>Hello <b>world</b> !</p>",
      "<root><![CDATA[a < b]]><item/></root>",
      '<root xml:space="preserve">  <item/>  </root>',
    ]) {
      expect(processXml(source, "minify")).toEqual({ success: true, data: source });
    }
  });
  it("rejects malformed XML and DTD", () => {
    expect(processXml("<root><x></root>", "validate").success).toBe(false);
    expect(
      processXml('<!DOCTYPE root SYSTEM "https://example.com/a"><root/>', "format").success
    ).toBe(false);
  });
});
