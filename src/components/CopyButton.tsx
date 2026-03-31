import { useState } from "react";
import { getT } from "../i18n/index.ts";
import { useStore } from "../core/store.ts";

type Props = {
  text: string;
  className?: string;
};

export function CopyButton({ text, className = "" }: Props) {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`px-2 py-1 text-xs rounded bg-[#3c3c3c] hover:bg-[#4c4c4c] text-[#d4d4d4] transition-colors ${className}`}
    >
      {copied ? t.ui.copied : t.ui.copy}
    </button>
  );
}
