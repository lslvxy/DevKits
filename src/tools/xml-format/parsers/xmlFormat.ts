import { toolResult } from "../../../core/toolResult.ts";

export type XmlMode = "format" | "minify" | "validate";

export function processXml(input: string, mode: XmlMode) {
  return toolResult(() => {
    if (!input.trim()) return "";
    if (/<!DOCTYPE\b/i.test(input))
      throw new Error("不支持 DTD，请先移除 DOCTYPE / DTD is not supported; remove DOCTYPE first");
    const document = new DOMParser().parseFromString(input, "application/xml");
    const error = document.getElementsByTagNameNS(
      "http://www.mozilla.org/newlayout/xml/parsererror.xml",
      "parsererror"
    )[0];
    if (error || document.documentElement?.localName === "parsererror") {
      throw new Error(
        (error ?? document.documentElement).textContent ?? "Invalid XML / XML 格式错误"
      );
    }
    if (!document.documentElement) throw new Error("Missing XML root / XML 缺少根节点");
    if (mode === "validate") return "XML 格式正确 / XML is well-formed";
    const visit = (element: Element, depth: number, preserve: boolean) => {
      if (depth > 100) throw new Error("XML 嵌套超过 100 层 / XML nesting exceeds 100 levels");
      const space = element.getAttributeNS("http://www.w3.org/XML/1998/namespace", "space");
      const keepSpace = space === "preserve" || (space !== "default" && preserve);
      const children = Array.from(element.childNodes);
      // Keep mixed content and CDATA verbatim; adding indentation changes text values.
      if (
        children.some(
          (child) => child.nodeType === 4 || (child.nodeType === 3 && child.textContent?.trim())
        )
      )
        return;
      for (const child of children) {
        if (child.nodeType === 1) visit(child as Element, depth + 1, keepSpace);
      }
      if (keepSpace || !children.some((child) => child.nodeType === 1)) return;
      for (const child of children) {
        if (child.nodeType === 3 && !child.textContent?.trim()) element.removeChild(child);
      }
      if (mode === "format") {
        for (const child of Array.from(element.childNodes)) {
          element.insertBefore(document.createTextNode(`\n${"  ".repeat(depth + 1)}`), child);
        }
        element.appendChild(document.createTextNode(`\n${"  ".repeat(depth)}`));
      }
    };
    visit(document.documentElement, 0, false);
    const declaration = /^\s*(<\?xml\b[^?]*\?>)/i.exec(input)?.[1];
    const serialized = new XMLSerializer().serializeToString(document);
    return declaration ? `${declaration}${mode === "format" ? "\n" : ""}${serialized}` : serialized;
  });
}
