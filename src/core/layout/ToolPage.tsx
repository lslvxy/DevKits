import { Suspense, useState } from "react";
import { getT } from "../../i18n/index.ts";
import { getToolById } from "../registry.ts";
import { useStore } from "../store.ts";

export function ToolPage() {
  const activeToolId = useStore((s) => s.activeToolId);
  const locale = useStore((s) => s.locale);
  const [showSettings, setShowSettings] = useState(false);
  const tool = activeToolId ? getToolById(activeToolId) : null;
  const t = getT(locale);

  if (!tool) return null;

  const Component = tool.component;
  const Settings = tool.settings;

  return (
    <div className="flex h-screen flex-col bg-[#1c1c1c]">
      <div className="px-6 py-3 border-b border-[#333333] bg-[#1e1e1e]">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{tool.icon}</span>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-white">{tool.name[locale]}</h2>
            <p className="text-xs text-[#888]">{tool.description[locale]}</p>
          </div>
          {Settings && (
            <button
              type="button"
              title={t.ui.settings}
              onClick={() => setShowSettings((v) => !v)}
              className={`p-1.5 rounded transition-colors ${
                showSettings
                  ? "bg-[#0078d4] text-white"
                  : "text-[#888] hover:bg-[#2a2a2a] hover:text-[#e0e0e0]"
              }`}
            >
              ⚙️
            </button>
          )}
        </div>
      </div>
      {showSettings && Settings && (
        <div className="border-b border-[#333333] bg-[#1e1e1e]">
          <Suspense fallback={<div className="p-4 text-[#666]">{t.ui.loadingTool}</div>}>
            <Settings />
          </Suspense>
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <Suspense
          key={tool.id}
          fallback={
            <div className="flex items-center justify-center h-full text-[#666]">
              {t.ui.loadingTool}
            </div>
          }
        >
          <Component />
        </Suspense>
      </div>
    </div>
  );
}
