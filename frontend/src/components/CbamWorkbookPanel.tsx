import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { ChevronDown, Download, FileSpreadsheet, Upload } from "lucide-react";
import { CodeListsBrowser } from "@/components/CodeListsBrowser";
import {
  CBAM_WORKBOOK_DOCS,
  countRequiredFields,
  countWorkbookFields,
  type CbamField,
  type CbamSection,
  type CbamSubSheet,
  type CbamWorkbookDoc,
} from "@/lib/cbam-workbook";
import { downloadBlankTemplate, exportFilledWorkbook, importWorkbookFile } from "@/lib/cbam-excel";
import { useCbamWorkbook } from "@/hooks/useCbamWorkbook";
import { useLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

function EditableField({
  field,
  value,
  onChange,
  onPickFromCodeList,
}: {
  field: CbamField;
  value: string;
  onChange: (v: string) => void;
  onPickFromCodeList?: () => void;
}) {
  const { isZh } = useLocale();
  const label = isZh ? field.labelZh : field.labelEn;
  const inputCls =
    "mt-0.5 w-full rounded-md border border-input bg-surface px-2.5 py-1.5 text-[12px] font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/25";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-1 sm:gap-3 py-2 border-b border-border/60 last:border-0">
      <div className="text-[12px] text-muted-foreground leading-snug">
        {label}
        {field.required && <span className="text-primary ml-1">*</span>}
        {field.unit && <span className="ml-1.5 text-[10px] font-mono text-muted-foreground/70">[{field.unit}]</span>}
        {field.type === "code" && onPickFromCodeList && (
          <button
            type="button"
            onClick={onPickFromCodeList}
            className="ml-2 text-[10px] font-mono text-primary hover:underline"
          >
            {isZh ? "从代码表选择" : "Pick from list"}
          </button>
        )}
      </div>
      <div>
        {field.type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className={cn(inputCls, "font-sans resize-y min-h-[72px]")}
          />
        ) : (
          <input
            type={field.type === "date" ? "date" : "text"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputCls}
          />
        )}
      </div>
    </div>
  );
}

function SectionBlock({
  section,
  values,
  setField,
  activePickKey,
  setActivePickKey,
}: {
  section: CbamSection;
  values: Record<string, string>;
  setField: (key: string, v: string) => void;
  activePickKey: string | null;
  setActivePickKey: (key: string | null) => void;
}) {
  const { isZh } = useLocale();
  const [open, setOpen] = useState(section.fields.some((f) => f.required));
  const title = isZh ? section.titleZh : section.titleEn;
  const note = isZh ? section.noteZh : section.noteEn;
  const filled = section.fields.filter((f) => values[f.key]?.trim()).length;

  return (
    <div className="rounded-lg border border-border bg-surface/30 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left hover:bg-surface/50 transition"
      >
        <span className="text-[12.5px] font-medium">{title}</span>
        <span className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono text-muted-foreground">{filled}/{section.fields.length}</span>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition", open && "rotate-180")} />
        </span>
      </button>
      {open && (
        <div className="px-3.5 pb-3 border-t border-border/60">
          {note && <p className="mt-2 text-[11px] text-muted-foreground italic leading-relaxed">{note}</p>}
          <div className="mt-2">
            {section.fields.map((f) => (
              <EditableField
                key={f.key}
                field={f}
                value={values[f.key] ?? ""}
                onChange={(v) => setField(f.key, v)}
                onPickFromCodeList={
                  f.type === "code"
                    ? () => setActivePickKey(activePickKey === f.key ? null : f.key)
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SubSheetTabs({
  subSheets,
  active,
  onChange,
}: {
  subSheets: CbamSubSheet[];
  active: string;
  onChange: (id: string) => void;
}) {
  const { isZh } = useLocale();
  return (
    <div className="flex flex-wrap gap-1.5">
      {subSheets.map((sh) => (
        <button
          key={sh.id}
          type="button"
          onClick={() => onChange(sh.id)}
          className={cn(
            "px-2.5 py-1 rounded-md border text-[11px] font-mono transition",
            active === sh.id
              ? "border-primary/50 bg-primary/10 text-foreground"
              : "border-border bg-surface text-muted-foreground hover:text-foreground",
          )}
        >
          {isZh ? sh.titleZh : sh.titleEn}
        </button>
      ))}
    </div>
  );
}

function DocPanel({
  doc,
  values,
  setField,
  activePickKey,
  setActivePickKey,
  onSwitchToCodeLists,
}: {
  doc: CbamWorkbookDoc;
  values: Record<string, string>;
  setField: (key: string, v: string) => void;
  activePickKey: string | null;
  setActivePickKey: (key: string | null) => void;
  onSwitchToCodeLists?: () => void;
}) {
  const { isZh } = useLocale();
  const [subSheet, setSubSheet] = useState(doc.subSheets?.[0]?.id ?? "");
  const activeSub = doc.subSheets?.find((s) => s.id === subSheet) ?? doc.subSheets?.[0];
  const sections = activeSub?.sections ?? doc.sections ?? [];
  const isCodeLists = doc.id === "c_code_lists";

  if (isCodeLists) {
    return (
      <div className="space-y-4">
        <p className="text-[12.5px] text-muted-foreground leading-relaxed">
          {isZh ? doc.descriptionZh : doc.descriptionEn}
        </p>
        <CodeListsBrowser
          onSelect={(_kind, code) => {
            if (activePickKey) {
              setField(activePickKey, code);
              setActivePickKey(null);
            }
          }}
        />
        {activePickKey ? (
          <p className="text-[11px] font-mono text-primary">
            {isZh ? `选择代码以填入：${activePickKey}` : `Pick a code for: ${activePickKey}`}
          </p>
        ) : (
          <p className="text-[11px] font-mono text-muted-foreground">
            {isZh
              ? "在 Summary_Process / A_InstData 中点「从代码表选择」，再在此点击一行填入。"
              : 'Use "Pick from list" on a code field, then click a row here.'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[12.5px] text-muted-foreground leading-relaxed">
        {isZh ? doc.descriptionZh : doc.descriptionEn}
      </p>
      {doc.subSheets && doc.subSheets.length > 0 && (
        <SubSheetTabs subSheets={doc.subSheets} active={subSheet} onChange={setSubSheet} />
      )}
      {activePickKey && onSwitchToCodeLists && (
        <button
          type="button"
          onClick={onSwitchToCodeLists}
          className="text-[11px] font-mono text-primary hover:underline"
        >
          {isZh ? "→ 打开 c_CodeLists 选择" : "→ Open c_CodeLists to pick"}
        </button>
      )}
      <div className="space-y-2">
        {sections.map((sec) => (
          <SectionBlock
            key={sec.id}
            section={sec}
            values={values}
            setField={setField}
            activePickKey={activePickKey}
            setActivePickKey={(key) => {
              setActivePickKey(key);
              if (key) onSwitchToCodeLists?.();
            }}
          />
        ))}
      </div>
      <div className="text-[10.5px] font-mono text-muted-foreground">
        {countWorkbookFields(doc)} {isZh ? "项评估标准 ·" : "criteria ·"} {countRequiredFields(doc)}{" "}
        {isZh ? "项必填" : "required"}
      </div>
    </div>
  );
}

export function CbamWorkbookPanel() {
  const { isZh } = useLocale();
  const { values, setField, mergeValues } = useCbamWorkbook();
  const [activeDoc, setActiveDoc] = useState(CBAM_WORKBOOK_DOCS[0].id);
  const [activePickKey, setActivePickKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const doc = useMemo(() => CBAM_WORKBOOK_DOCS.find((d) => d.id === activeDoc)!, [activeDoc]);

  async function handleDownloadBlank() {
    setBusy(true);
    setMsg(null);
    try {
      await downloadBlankTemplate();
      setMsg(isZh ? "已下载空白模板" : "Blank template downloaded");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Download failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleExportFilled() {
    setBusy(true);
    setMsg(null);
    try {
      await exportFilledWorkbook(values);
      setMsg(isZh ? "已导出已填写工作簿" : "Filled workbook exported");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpload(file: File) {
    setBusy(true);
    setMsg(null);
    try {
      const imported = await importWorkbookFile(file);
      mergeValues(imported);
      setMsg(isZh ? `已导入 ${Object.keys(imported).length} 个字段` : `Imported ${Object.keys(imported).length} fields`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="panel p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
          <FileSpreadsheet className="h-3.5 w-3.5 text-teal" />
          {isZh ? "CBAM 沟通模板 · 评估标准" : "CBAM communication template · evaluation criteria"}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleDownloadBlank()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-surface text-[11px] font-mono hover:border-primary/40 transition disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            {isZh ? "下载模板" : "Download template"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleExportFilled()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-primary/40 bg-primary/10 text-[11px] font-mono text-primary hover:brightness-110 transition disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            {isZh ? "导出已填写" : "Export filled"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-surface text-[11px] font-mono hover:border-primary/40 transition disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            {isZh ? "上传 Excel" : "Upload Excel"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleUpload(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {msg && <p className="mt-2 text-[11px] font-mono text-carbon">{msg}</p>}

      <h3 className="mt-3 text-[16px] font-semibold tracking-tight">
        {isZh ? "须按序填写的工作簿文档" : "Workbook documents — fill in order"}
      </h3>
      <p className="mt-1 text-[11.5px] text-muted-foreground italic">
        {isZh
          ? "Summary_Process → A_InstData → c_CodeLists。所有字段可编辑；上传/导出与欧盟 Excel 模板单元格映射。"
          : "Summary_Process → A_InstData → c_CodeLists. All fields editable; upload/export maps to EU Excel template cells."}
      </p>

      <ol className="mt-4 flex flex-col sm:flex-row gap-2">
        {CBAM_WORKBOOK_DOCS.map((d) => {
          const active = d.id === activeDoc;
          return (
            <li key={d.id} className="flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setActiveDoc(d.id)}
                className={cn(
                  "w-full text-left rounded-lg border px-3 py-2.5 transition",
                  active ? "border-primary/50 bg-primary/[0.08] teal-glow" : "border-border bg-surface/40 hover:bg-surface/60",
                )}
              >
                <div className="text-[10px] font-mono text-muted-foreground">{d.order} · {d.sheetName}</div>
                <div className="text-[13px] font-medium truncate">{isZh ? d.titleZh : d.titleEn}</div>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-4">
        <DocPanel
          doc={doc}
          values={values}
          setField={setField}
          activePickKey={activePickKey}
          setActivePickKey={setActivePickKey}
          onSwitchToCodeLists={() => setActiveDoc("c_code_lists")}
        />
      </div>
    </motion.div>
  );
}
