import { useCallback, useEffect, useState } from "react";
import { CBAM_WORKBOOK_DEMO } from "@/lib/cbam-workbook";

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
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const mergeValues = useCallback((next: Record<string, string>) => {
    setValues((prev) => ({ ...prev, ...next }));
  }, []);

  const resetToDemo = useCallback(() => {
    setValues({ ...CBAM_WORKBOOK_DEMO });
  }, []);

  return { values, setField, mergeValues, resetToDemo, setValues };
}
