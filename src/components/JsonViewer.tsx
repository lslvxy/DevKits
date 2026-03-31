import { useState } from "react";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type Props = {
  data: JsonValue;
  rootExpanded?: boolean;
};

export function JsonViewer({ data, rootExpanded = true }: Props) {
  return (
    <div className="font-mono text-sm overflow-auto h-full p-3">
      <JsonNode value={data} depth={0} defaultExpanded={rootExpanded} />
    </div>
  );
}

function JsonNode({
  value,
  depth,
  defaultExpanded,
}: {
  value: JsonValue;
  depth: number;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (value === null) return <span className="text-[#569cd6]">null</span>;
  if (typeof value === "boolean") return <span className="text-[#569cd6]">{String(value)}</span>;
  if (typeof value === "number") return <span className="text-[#b5cea8]">{value}</span>;
  if (typeof value === "string") return <span className="text-[#ce9178]">&quot;{value}&quot;</span>;

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-[#d4d4d4]">[]</span>;
    return (
      <span>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="text-[#d4d4d4] hover:text-white"
        >
          {expanded ? "▾" : "▸"}
        </button>{" "}
        <span className="text-[#d4d4d4]">[</span>
        {expanded ? (
          <div style={{ paddingLeft: "16px" }}>
            {value.map((item, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: JSON arrays have no better key
              <div key={i}>
                <JsonNode value={item} depth={depth + 1} defaultExpanded={depth < 2} />
                {i < value.length - 1 && <span className="text-[#d4d4d4]">,</span>}
                <CopyInline value={item} />
              </div>
            ))}
          </div>
        ) : (
          <span className="text-[#858585]"> ... </span>
        )}
        <span className="text-[#d4d4d4]">]</span>
      </span>
    );
  }

  // Object
  const keys = Object.keys(value as Record<string, JsonValue>);
  if (keys.length === 0) return <span className="text-[#d4d4d4]">{"{}"}</span>;
  return (
    <span>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="text-[#d4d4d4] hover:text-white"
      >
        {expanded ? "▾" : "▸"}
      </button>{" "}
      <span className="text-[#d4d4d4]">{"{"}</span>
      {expanded ? (
        <div style={{ paddingLeft: "16px" }}>
          {keys.map((k, i) => (
            <div key={k} className="flex items-start gap-1">
              <span className="text-[#9cdcfe]">&quot;{k}&quot;</span>
              <span className="text-[#d4d4d4]">: </span>
              <JsonNode
                value={(value as Record<string, JsonValue>)[k]}
                depth={depth + 1}
                defaultExpanded={depth < 2}
              />
              {i < keys.length - 1 && <span className="text-[#d4d4d4]">,</span>}
              <CopyInline value={(value as Record<string, JsonValue>)[k]} />
            </div>
          ))}
        </div>
      ) : (
        <span className="text-[#858585]"> ... </span>
      )}
      <span className="text-[#d4d4d4]">{"}"}</span>
    </span>
  );
}

function CopyInline({ value }: { value: JsonValue }) {
  const [copied, setCopied] = useState(false);
  const text = typeof value === "string" ? value : JSON.stringify(value);

  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="ml-1 text-[#858585] hover:text-[#d4d4d4] text-xs opacity-0 group-hover:opacity-100"
      title="复制"
    >
      {copied ? "✓" : "⎘"}
    </button>
  );
}
