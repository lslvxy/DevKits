import { Sidebar } from "./core/layout/Sidebar.tsx";
import { ToolPage } from "./core/layout/ToolPage.tsx";
import { WelcomePage } from "./core/layout/WelcomePage.tsx";
import { useStore } from "./core/store.ts";

export default function App() {
  const activeToolId = useStore((s) => s.activeToolId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1e1e1e] text-[#d4d4d4]">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        {activeToolId ? <ToolPage /> : <WelcomePage />}
      </main>
    </div>
  );
}
