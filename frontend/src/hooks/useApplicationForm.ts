import { useCallback, useEffect, useMemo, useState } from "react";

function storageKey(slug: string) {
  return `greengru-application-${slug}`;
}

function loadForm<T>(slug: string, factory: () => T): T {
  try {
    const raw = localStorage.getItem(storageKey(slug));
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore */
  }
  return factory();
}

function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return !Number.isNaN(value);
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(isFilled);
  if (typeof value === "object") return Object.values(value as object).some(isFilled);
  return false;
}

function completionPct(data: unknown): number {
  if (data === null || typeof data !== "object") return isFilled(data) ? 100 : 0;
  const vals = Object.values(data as Record<string, unknown>);
  if (vals.length === 0) return 0;
  const filled = vals.filter(isFilled).length;
  return Math.round((filled / vals.length) * 100);
}

export function useApplicationForm<T extends object>(slug: string, factory: () => T) {
  const [data, setData] = useState<T>(() => loadForm(slug, factory));

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(slug), JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [slug, data]);

  const set = useCallback((updater: (prev: T) => T) => {
    setData((prev) => updater(prev));
  }, []);

  const replace = useCallback((next: T) => {
    setData(next);
  }, []);

  const reset = useCallback(() => {
    setData(factory());
  }, [factory]);

  const pct = useMemo(() => completionPct(data), [data]);

  return { data, set, replace, reset, completionPct: pct };
}
