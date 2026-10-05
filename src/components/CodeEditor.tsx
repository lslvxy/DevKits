import MonacoEditor from "@monaco-editor/react";
import "../core/monaco.ts";

type Props = {
  value: string;
  onChange?: (val: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
};

export function CodeEditor({
  value,
  onChange,
  language = "plaintext",
  readOnly = false,
  height = "100%",
}: Props) {
  // Wrapping and tokenizing large generated/log documents adds substantial state.
  const largeDocument = value.length > 1024 * 1024;
  return (
    <MonacoEditor
      height={height}
      language={largeDocument ? "plaintext" : language}
      value={value}
      theme="vs-dark"
      keepCurrentModel={false}
      saveViewState={false}
      options={{
        readOnly,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: largeDocument ? "off" : "on",
        fontSize: 13,
        lineNumbers: "on",
        renderLineHighlight: "line",
        automaticLayout: true,
        padding: { top: 8, bottom: 8 },
        dragAndDrop: true,
      }}
      onChange={(val) => onChange?.(val ?? "")}
    />
  );
}
