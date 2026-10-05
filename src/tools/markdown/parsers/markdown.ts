import DOMPurify from "dompurify";
import { marked } from "marked";
import { toolResult } from "../../../core/toolResult.ts";

export function renderMarkdown(input: string) {
  return toolResult(() => {
    if (input.length > 1024 * 1024)
      throw new Error("Markdown 超过 100 万字符 / Markdown exceeds 1 Mi characters");
    const html = marked.parse(input, { async: false, gfm: true });
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: [
        "img",
        "video",
        "audio",
        "iframe",
        "object",
        "embed",
        "form",
        "input",
        "button",
        "style",
        "link",
      ],
      FORBID_ATTR: [
        "style",
        "src",
        "srcset",
        "href",
        "action",
        "formaction",
        "target",
        "id",
        "name",
      ],
    });
  });
}
