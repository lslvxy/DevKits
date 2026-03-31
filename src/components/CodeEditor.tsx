import MonacoEditor from "@monaco-editor/react";

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
  return (
    <MonacoEditor
      height={height}
      language={language}
      value={value}
      theme="vs-dark"
      options={{
        readOnly,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: "on",
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
