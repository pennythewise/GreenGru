import { useCallback, useEffect, useMemo, useState } from "react";
import { docChecklists } from "@/lib/dashboard-data";
import type { RagChannel } from "@/lib/api";

export type ChecklistUpload = {
  done: boolean;
  fileName?: string;
  uploadedAt?: string;
  fileHash?: string;
  chunkCount?: number;
  ragStored?: boolean;
  statusNote?: string;
  /** PDF processed (MinerU→PyMuPDF→embed) or non-PDF attached */
  processed?: boolean;
};

export type QueuedAttachment = {
  file: File;
  fileName: string;
};

type Slug = keyof typeof docChecklists;

function storageKey(slug: Slug) {
  return `greengru-checklist-${slug}`;
}

function sessionKey(slug: Slug) {
  return `greengru-rag-session-${slug}`;
}

export function channelForSlug(slug: Slug): RagChannel {
  if (slug === "passport") return "cbam";
  if (slug === "grant") return "grant";
  return "loan";
}

function isPdfName(name: string): boolean {
  return name.toLowerCase().endsWith(".pdf");
}

/** Persist only processed uploads (filename required). */
function sanitizeUploads(raw: Record<string, ChecklistUpload>): Record<string, ChecklistUpload> {
  const out: Record<string, ChecklistUpload> = {};
  for (const [key, value] of Object.entries(raw)) {
    const name = (value?.fileName || "").trim();
    if (!name) continue;
    // Legacy rows: old UX processed on each upload, so treat as done.
    const processed = value.processed ?? true;
    if (!processed && isPdfName(name)) continue;
    out[key] = {
      ...value,
      done: true,
      processed: true,
      fileName: name,
    };
  }
  return out;
}

function loadUploads(slug: Slug): Record<string, ChecklistUpload> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(slug));
    if (raw) return sanitizeUploads(JSON.parse(raw) as Record<string, ChecklistUpload>);
  } catch {
    /* ignore */
  }
  return {};
}

function ensureSessionId(slug: Slug): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = sessionStorage.getItem(sessionKey(slug));
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(sessionKey(slug), id);
    return id;
  } catch {
    return `sess-${Date.now()}`;
  }
}

export function useRouteChecklist(slug: Slug) {
  const base = docChecklists[slug];
  const [uploads, setUploads] = useState<Record<string, ChecklistUpload>>({});
  const [queued, setQueued] = useState<Record<string, QueuedAttachment>>({});
  const [hydrated, setHydrated] = useState(false);
  const [uploadSessionId, setUploadSessionId] = useState("");

  useEffect(() => {
    setUploads(loadUploads(slug));
    setQueued({});
    setUploadSessionId(ensureSessionId(slug));
    setHydrated(true);
  }, [slug]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey(slug), JSON.stringify(uploads));
    } catch {
      /* ignore */
    }
  }, [slug, uploads, hydrated]);

  const items = useMemo(
    () =>
      base.items.map((it) => {
        const key = it.name;
        const up = uploads[key];
        const q = queued[key];
        const fileName = hydrated ? q?.fileName || up?.fileName : undefined;
        const hasFile = Boolean(fileName?.trim());
        const processed = hydrated ? Boolean(up?.processed && up?.fileName && !q) : false;
        const queuedOnly = Boolean(q);
        return {
          ...it,
          done: processed,
          attached: hasFile,
          queued: queuedOnly,
          isPdf: hasFile ? isPdfName(fileName!) : false,
          fileName: hasFile ? fileName : undefined,
          uploadedAt: hydrated && processed ? up?.uploadedAt : undefined,
          fileHash: hydrated && processed ? up?.fileHash : undefined,
          chunkCount: hydrated && processed ? up?.chunkCount : undefined,
          ragStored: hydrated && processed ? up?.ragStored : undefined,
          statusNote: hydrated
            ? queuedOnly
              ? undefined
              : up?.statusNote
            : undefined,
        };
      }),
    [base.items, uploads, queued, hydrated],
  );

  const doneCount = items.filter((i) => i.done).length;
  const attachedCount = items.filter((i) => i.attached).length;
  const queuedPdfCount = items.filter((i) => i.queued && i.isPdf).length;
  const queuedNonPdfCount = items.filter((i) => i.queued && !i.isPdf).length;
  const allDone = doneCount === items.length;
  const ragReadyCount = items.filter((i) => i.ragStored).length;

  const attachFile = useCallback((itemName: string, file: File) => {
    setQueued((prev) => ({
      ...prev,
      [itemName]: { file, fileName: file.name },
    }));
    // Drop prior processed state for this slot until Process runs again
    setUploads((prev) => {
      if (!(itemName in prev)) return prev;
      const next = { ...prev };
      delete next[itemName];
      return next;
    });
  }, []);

  const markProcessed = useCallback(
    (
      itemName: string,
      fileName: string,
      meta?: {
        fileHash?: string;
        chunkCount?: number;
        ragStored?: boolean;
        statusNote?: string;
      },
    ) => {
      setUploads((prev) => ({
        ...prev,
        [itemName]: {
          done: true,
          processed: true,
          fileName,
          uploadedAt: new Date().toISOString(),
          fileHash: meta?.fileHash,
          chunkCount: meta?.chunkCount,
          ragStored: meta?.ragStored,
          statusNote: meta?.statusNote,
        },
      }));
      setQueued((prev) => {
        if (!(itemName in prev)) return prev;
        const next = { ...prev };
        delete next[itemName];
        return next;
      });
    },
    [],
  );

  /** @deprecated prefer attachFile + markProcessed */
  const markUploaded = useCallback(
    (
      itemName: string,
      file: File,
      meta?: {
        fileHash?: string;
        chunkCount?: number;
        ragStored?: boolean;
        statusNote?: string;
      },
    ) => {
      markProcessed(itemName, file.name, meta);
    },
    [markProcessed],
  );

  const clearUpload = useCallback((itemName: string) => {
    setUploads((prev) => {
      const next = { ...prev };
      delete next[itemName];
      return next;
    });
    setQueued((prev) => {
      const next = { ...prev };
      delete next[itemName];
      return next;
    });
  }, []);

  const takeQueuedPdfs = useCallback(() => {
    const out: { itemName: string; file: File }[] = [];
    for (const [itemName, q] of Object.entries(queued)) {
      if (isPdfName(q.fileName)) out.push({ itemName, file: q.file });
    }
    return out;
  }, [queued]);

  const takeQueuedNonPdfs = useCallback(() => {
    const out: { itemName: string; file: File }[] = [];
    for (const [itemName, q] of Object.entries(queued)) {
      if (!isPdfName(q.fileName)) out.push({ itemName, file: q.file });
    }
    return out;
  }, [queued]);

  return {
    items,
    doneCount,
    attachedCount,
    queuedPdfCount,
    queuedNonPdfCount,
    allDone,
    markUploaded,
    markProcessed,
    attachFile,
    clearUpload,
    takeQueuedPdfs,
    takeQueuedNonPdfs,
    hydrated,
    uploadSessionId,
    ragChannel: channelForSlug(slug),
    ragReadyCount,
  };
}
