import { useStore } from "../../core/store.ts";
import { getT } from "../../i18n/index.ts";

export function PlantUMLSettings() {
  const locale = useStore((s) => s.locale);
  const mode = useStore((s) => s.plantumlMode);
  const server = useStore((s) => s.plantumlServer);
  const setMode = useStore((s) => s.setPlantumlMode);
  const setServer = useStore((s) => s.setPlantumlServer);
  const t = getT(locale);

  return (
    <div className="flex flex-wrap items-end gap-6 px-6 py-3">
      <div>
        <p className="text-xs text-[#858585] mb-2">{t.tools.plantuml.renderMode}</p>
        <div className="flex gap-2">
          {(["local", "remote"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 text-xs rounded transition-colors ${
                mode === m
                  ? "bg-[#0078d4] text-white"
                  : "bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4c4c4c]"
              }`}
            >
              {m === "local" ? t.tools.plantuml.localMode : t.tools.plantuml.remoteMode}
            </button>
          ))}
        </div>
      </div>

      {mode === "remote" && (
        <div>
          <label htmlFor="plantuml-server" className="text-xs text-[#858585] mb-1 block">
            {t.tools.plantuml.server}
          </label>
          <input
            id="plantuml-server"
            type="text"
            value={server}
            onChange={(e) => setServer(e.target.value)}
            placeholder="https://www.plantuml.com/plantuml"
            className="w-80 rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 text-sm text-[#d4d4d4] font-mono outline-none focus:border-[#0078d4]"
          />
          <p className="text-xs text-[#858585] mt-1 max-w-md">{t.tools.plantuml.serverHint}</p>
        </div>
      )}

      {mode === "remote" && (
        <p className="w-full text-xs text-yellow-400 -mt-2">{t.tools.plantuml.remoteWarning}</p>
      )}
    </div>
  );
}
