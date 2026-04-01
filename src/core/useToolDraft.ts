import { useCallback, useState } from "react";

/**
 * Drop-in replacement for useState("") that persists the value in localStorage.
 * The key should be unique per tool+field, e.g. "base64:input".
 */
export function useToolDraft(key: string, initial = ""): [string, (v: string) => void] {
  const storageKey = `devkits-draft:${key}`;
  const [value, setValueState] = useState<string>(
    () => localStorage.getItem(storageKey) ?? initial,
  );
  const setValue = useCallback(
    (v: string) => {
      setValueState(v);
      try {
        localStorage.setItem(storageKey, v);
      } catch {
        // quota exceeded — silently ignore
      }
    },
    [storageKey],
  );
  return [value, setValue];
}
