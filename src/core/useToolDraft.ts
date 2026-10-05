import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_PREFIX = "devkits-draft:";

type DraftOptions = {
  /** When true, the value is kept in-memory only and never persisted. */
  sensitive?: boolean;
};

/**
 * Drop-in replacement for useState("") that persists the value in localStorage.
 * The key should be unique per tool+field, e.g. "base64:input".
 *
 * Writes are throttled (trailing 300ms) to avoid blocking the main thread on
 * every keystroke; the pending value is flushed on unmount.
 */
export function useToolDraft(
  key: string,
  initial = "",
  options: DraftOptions = {}
): [string, (v: string) => void] {
  const { sensitive = false } = options;
  const storageKey = STORAGE_PREFIX + key;
  const [value, setValueState] = useState<string>(() => {
    if (sensitive) return initial;
    try {
      return localStorage.getItem(storageKey) ?? initial;
    } catch {
      return initial;
    }
  });

  const timerRef = useRef<number | null>(null);
  const latestRef = useRef(value);

  const setValue = useCallback(
    (v: string) => {
      latestRef.current = v;
      setValueState(v);
      if (sensitive) return;
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        try {
          localStorage.setItem(storageKey, v);
        } catch {
          // quota exceeded — silently ignore
        }
      }, 300);
    },
    [storageKey, sensitive]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
        if (!sensitive) {
          try {
            localStorage.setItem(storageKey, latestRef.current);
          } catch {
            // ignore
          }
        }
      }
    };
  }, [storageKey, sensitive]);

  return [value, setValue];
}

/** Remove all persisted draft values (e.g. a "clear sensitive data" action). */
export function clearDraftStorage(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(STORAGE_PREFIX)) keys.push(k);
    }
    for (const k of keys) localStorage.removeItem(k);
  } catch {
    // ignore
  }
}
