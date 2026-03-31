import { getT } from "../../i18n/index.ts";
import { useStore } from "../store.ts";

export function WelcomePage() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#1c1c1c] text-[#666]">
      <div className="text-6xl mb-4">🛠️</div>
      <h2 className="text-2xl font-semibold text-[#e0e0e0] mb-2">DevKits</h2>
      <p className="text-sm mb-6">{t.ui.welcomeSubtitle}</p>
      <p className="text-xs">{t.ui.welcomeHint}</p>
    </div>
  );
}
