import { useState } from "react";
import { ToolWorkbench } from "../../components/ToolWorkbench.tsx";
import { useStore } from "../../core/store.ts";
import { useToolDraft } from "../../core/useToolDraft.ts";
import { renderMarkdown } from "./parsers/markdown.ts";

const style =
  "body{background:#1e1e1e;color:#d4d4d4;font:14px/1.6 system-ui;padding:16px;overflow-wrap:anywhere}pre{background:#252526;padding:12px;overflow:auto}code{font-family:monospace}table{border-collapse:collapse}td,th{border:1px solid #555;padding:6px 10px}blockquote{border-left:3px solid #888;padding-left:12px;margin-left:0}a{color:#6cb6ff}";

export function MarkdownPreviewTool() {
  const zh = useStore((s) => s.locale) === "zh";
  const [input, setInput] = useToolDraft(
    "markdown:input",
    "# Markdown\n\n| Tool | Status |\n| --- | --- |\n| DevKits | Ready |\n\n```typescript\nconst message = 'Hello';\n```"
  );
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [showHtml, setShowHtml] = useState(false);
  const run = () => {
    const result = renderMarkdown(input);
    setOutput(result.success ? result.data : "");
    setError(result.success ? "" : result.error);
  };
  const document = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><style>${style}</style></head><body>${output}</body></html>`;
  return (
    <ToolWorkbench
      input={input}
      onChange={setInput}
      output={output}
      error={error}
      onRun={run}
      hint={
        zh
          ? "支持表格和代码块；点击处理更新预览。过滤脚本、交互控件和外部资源，链接仅显示文字；复制得到净化后的 HTML。"
          : "Supports tables and code blocks; run to update. Scripts, interactive controls and external resources are removed; links remain text. Copy returns sanitized HTML."
      }
      controls={
        <label className="flex items-center gap-2 text-sm text-[#d4d4d4]">
          <input
            type="checkbox"
            checked={showHtml}
            onChange={(e) => setShowHtml(e.target.checked)}
          />
          {zh ? "显示 HTML 源码" : "Show HTML source"}
        </label>
      }
      preview={
        showHtml ? undefined : (
          <iframe
            title={zh ? "Markdown 预览" : "Markdown preview"}
            sandbox=""
            srcDoc={document}
            className="min-h-0 w-full flex-1 rounded border border-[#3e3e42] bg-[#1e1e1e]"
          />
        )
      }
    />
  );
}
