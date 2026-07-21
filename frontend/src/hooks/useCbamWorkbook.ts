import { useCallback, useEffect, useMemo, useState } from "react";
import { CBAM_WORKBOOK_DEMO, cbamFormCompletionPct } from "@/lib/cbam-workbook";

const STORAGE_KEY = "greengru-cbam-workbook-values";

function loadStored(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...CBAM_WORKBOOK_DEMO, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { ...CBAM_WORKBOOK_DEMO };
}

/** Keep period_* and reporting_period_* in sync (both map to Excel I9/L9). */
function withPeriodSync(prev: Record<string, string>, key: string, value: string): Record<string, string> {
  const next = { ...prev, [key]: value };
  if (key === "period_start") next.reporting_period_start = value;
  if (key === "period_end") next.reporting_period_end = value;
  if (key === "reporting_period_start") next.period_start = value;
  if (key === "reporting_period_end") next.period_end = value;
  return next;
}

export function useCbamWorkbook() {
  const [values, setValues] = useState<Record<string, string>>(loadStored);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    } catch {
      /* ignore */
    }
  }, [values]);

  const setField = useCallback((key: string, value: string) => {
    setValues((prev) => withPeriodSync(prev, key, value));
  }, []);

  const mergeValues = useCallback((incoming: Record<string, string>) => {
    setValues((prev) => {
      let next = { ...prev, ...incoming };
      if (incoming.period_start) next = withPeriodSync(next, "period_start", incoming.period_start);
      if (incoming.period_end) next = withPeriodSync(next, "period_end", incoming.period_end);
      if (incoming.reporting_period_start) {
        next = withPeriodSync(next, "reporting_period_start", incoming.reporting_period_start);
      }
      if (incoming.reporting_period_end) {
        next = withPeriodSync(next, "reporting_period_end", incoming.reporting_period_end);
      }
      return next;
    });
  }, []);

  const resetToDemo = useCallback(() => {
    setValues({ ...CBAM_WORKBOOK_DEMO });
  }, []);

  const completionPct = useMemo(() => cbamFormCompletionPct(values), [values]);

  return { values, setField, mergeValues, resetToDemo, setValues, completionPct };
}
