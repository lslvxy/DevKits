import { Suspense } from "react";
import { getToolById } from "../registry.ts";
import { useStore } from "../store.ts";

export function ToolPage() {
  const activeToolId = useStore((s) => s.activeToolId);
  const tool = activeToolId ? getToolById(activeToolId) : null;

  if (!tool) return null;

  const Component = tool.component;

  return (
    <div className="flex h-screen flex-col bg-[#1e1e1e]">
      <div className="px-6 py-3 border-b border-[#3e3e42]">
        <div className="flex items-center gap-2">
          <span className="text-xl">{tool.icon}</span>
          <div>
            <h2 className="text-base font-semibold text-white">{tool.name}</h2>
            <p className="text-xs text-[#858585]">{tool.description}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full text-[#858585]">加载中...</div>
          }
        >
          <Component />
        </Suspense>
      </div>
    </div>
  );
}
