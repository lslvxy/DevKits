import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../../src/tools/markdown/parsers/markdown.ts";

describe("Markdown preview", () => {
  it("renders GFM tables and code blocks", () => {
    const result = renderMarkdown(
      "| a | b |\n| --- | --- |\n| 1 | 2 |\n\n```js\nconst x = 1;\n```"
    );
    if (!result.success) throw new Error(result.error);
    expect(result.data).toContain("<table>");
    expect(result.data).toContain("<pre><code");
  });
  it("removes executable HTML and network resources", () => {
    const result = renderMarkdown(
      '<script>alert(1)</script><img src="https://example.com/x" onerror="alert(1)"><div style="background:url(https://example.com)">text</div>\n\n[x](javascript:alert(1))\n\n[remote](https://example.com)'
    );
    if (!result.success) throw new Error(result.error);
    expect(result.data).not.toMatch(/<script|<img|onerror=|style=|href=|javascript:/);
    expect(result.data).toContain("text");
    expect(result.data).toContain("remote");
  });
});
