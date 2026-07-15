import { useCallback, useEffect, useMemo, useState } from "react";
import { docChecklists } from "@/lib/dashboard-data";

export type ChecklistUpload = {
  done: boolean;
  fileName?: string;
  uploadedAt?: string;
};

type Slug = keyof typeof docChecklists;

function storageKey(slug: Slug) {
  return `greengru-checklist-${slug}`;
}

function loadUploads(slug: Slug): Record<string, ChecklistUpload> {
  try {
    const raw = localStorage.getItem(storageKey(slug));
    if (raw) return JSON.parse(raw) as Record<string, ChecklistUpload>;
  } catch {
    /* ignore */
  }
  return {};
}

export function useRouteChecklist(slug: Slug) {
  const base = docChecklists[slug];
  const [uploads, setUploads] = useState<Record<string, ChecklistUpload>>(() => loadUploads(slug));

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(slug), JSON.stringify(uploads));
    } catch {
      /* ignore */
    }
  }, [slug, uploads]);

  const items = useMemo(
    () =>
      base.items.map((it) => {
        const key = it.name;
        const up = uploads[key];
        return {
          ...it,
          done: up?.done ?? it.done,
          fileName: up?.fileName,
          uploadedAt: up?.uploadedAt,
        };
      }),
    [base.items, uploads],
  );

  const doneCount = items.filter((i) => i.done).length;
  const allDone = doneCount === items.length;

  const markUploaded = useCallback((itemName: string, file: File) => {
    setUploads((prev) => ({
      ...prev,
      [itemName]: {
        done: true,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    }));
  }, []);

  const clearUpload = useCallback((itemName: string) => {
    setUploads((prev) => {
      const next = { ...prev };
      delete next[itemName];
      return next;
    });
  }, []);

  return { items, doneCount, allDone, markUploaded, clearUpload };
}
