import { useRef, useState } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";
import { CodeListsBrowser } from "@/components/CodeListsBrowser";
import {
  FieldGrid,
  FormShell,
  SectionBlock,
  TextArea,
  TextField,
  scrollToSection,
} from "@/components/application-form-ui";
import { downloadBlankTemplate, importWorkbookFile } from "@/lib/cbam-excel";
import { downloadCbamCommunicationXlsx } from "@/lib/api";
import { CBAM_FORM_SECTIONS, type CbamField } from "@/lib/cbam-workbook";
import { useCbamWorkbook } from "@/hooks/useCbamWorkbook";
import { useLocale } from "@/lib/locale";

const NAV_SECTIONS = CBAM_FORM_SECTIONS.map(({ id, label, labelZh }) => ({ id, label, labelZh }));

function fieldLabel(field: CbamField, isZh: boolean): string {
  let label = isZh ? field.labelZh : field.labelEn;
  if (field.unit) label = `${label} (${field.unit})`;
  if (field.required) label = `${label} *`;
  return label;
}

function CbamFieldInput({
  field,
  value,
  onChange,
  isZh,
  onPickFromCodeList,
}: {
  field: CbamField;
  value: string;
  onChange: (v: string) => void;
  isZh: boolean;
  onPickFromCodeList?: () => void;
}) {
  const labelZh = fieldLabel(field, true);
  const labelEn = fieldLabel(field, false);

  if (field.type === "textarea") {
    return (
      <TextArea
        label={labelEn}
        labelZh={labelZh}
        isZh={isZh}
        value={value}
        onChange={onChange}
      />
    );
  }

  const type =
    field.type === "date" ? "date" : field.type === "number" || field.type === "percent" ? "number" : "text";

  return (
    <div className="block">
      <TextField
        label={labelEn}
        labelZh={labelZh}
        isZh={isZh}
        value={value}
        onChange={onChange}
        type={type}
        mono={field.type === "code" || field.type === "number" || field.type === "percent"}
      />
      {field.type === "code" && onPickFromCodeList && (
        <button
          type="button"
          onClick={onPickFromCodeList}
          className="mt-1 text-[10.5px] font-mono text-primary hover:underline"
        >
          {isZh ? "从代码表选择" : "Pick from code list"}
        </button>
      )}
    </div>
  );
}

export function CbamWorkbookPanel() {
  const { isZh } = useLocale();
  const { values, setField, mergeValues, resetToDemo, completionPct } = useCbamWorkbook();
  const [activeId, setActiveId] = useState<string>(CBAM_FORM_SECTIONS[0].id);
  const [activePickKey, setActivePickKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function selectSection(id: string) {
    setActiveId(id);
    scrollToSection(id);
  }

  function pickCodeFor(key: string) {
    setActivePickKey(key);
    selectSection("code_lists");
  }

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
      await downloadCbamCommunicationXlsx(values);
      setMsg(isZh ? "已导出已填写 Excel" : "Filled Excel exported");
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
    <FormShell
      eyebrow="Evaluation form"
      eyebrowZh="评估表"
      title="EU CBAM evaluation form"
      titleZh="欧盟 CBAM 评估表"
      subtitle={
        isZh
          ? "按欧盟委员会沟通模板填写，自动保存至浏览器。"
          : "EU Commission communication template — auto-saved in your browser."
      }
      completionPct={completionPct}
      sections={NAV_SECTIONS}
      activeId={activeId}
      onSelect={selectSection}
      isZh={isZh}
    >
      <div className="flex flex-wrap gap-2 mb-1">
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleExportFilled()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-primary/40 bg-primary/10 text-[11.5px] font-mono text-primary hover:brightness-110 disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" />
          {isZh ? "导出 Excel" : "Export Excel"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleDownloadBlank()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-[11.5px] font-mono hover:bg-surface-2 disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" />
          {isZh ? "空白模板" : "Blank template"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-[11.5px] font-mono hover:bg-surface-2 disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" />
          {isZh ? "上传 Excel" : "Upload Excel"}
        </button>
        <button
          type="button"
          onClick={resetToDemo}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-[11.5px] font-mono text-muted-foreground hover:bg-surface-2"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {isZh ? "重置表单" : "Reset form"}
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

      {msg && <p className="text-[11px] font-mono text-carbon">{msg}</p>}

      {CBAM_FORM_SECTIONS.map((sec) => {
        if (sec.kind === "code_lists") {
          return (
            <SectionBlock key={sec.id} id={sec.id} title={sec.titleEn} titleZh={sec.titleZh} isZh={isZh}>
              {sec.noteEn && (
                <p className="text-[12px] text-muted-foreground -mt-1">
                  {isZh ? sec.noteZh : sec.noteEn}
                </p>
              )}
              {activePickKey ? (
                <p className="text-[11px] font-mono text-primary">
                  {isZh ? `选择代码以填入：${activePickKey}` : `Pick a code for: ${activePickKey}`}
                </p>
              ) : (
                <p className="text-[11px] font-mono text-muted-foreground">
                  {isZh
                    ? "在代码字段下点「从代码表选择」，再点击下方一行填入。"
                    : 'Use "Pick from code list" on a code field, then click a row below.'}
                </p>
              )}
              <CodeListsBrowser
                onSelect={(_kind, code) => {
                  if (activePickKey) {
                    setField(activePickKey, code);
                    setActivePickKey(null);
                  }
                }}
              />
            </SectionBlock>
          );
        }

        return (
          <SectionBlock key={sec.id} id={sec.id} title={sec.titleEn} titleZh={sec.titleZh} isZh={isZh}>
            {sec.noteEn && (
              <p className="text-[12px] text-muted-foreground -mt-1">
                {isZh ? sec.noteZh : sec.noteEn}
              </p>
            )}
            <FieldGrid>
              {(sec.fields ?? []).map((field) => (
                <CbamFieldInput
                  key={field.key}
                  field={field}
                  value={values[field.key] ?? ""}
                  onChange={(v) => setField(field.key, v)}
                  isZh={isZh}
                  onPickFromCodeList={
                    field.type === "code" ? () => pickCodeFor(field.key) : undefined
                  }
                />
              ))}
            </FieldGrid>
          </SectionBlock>
        );
      })}
    </FormShell>
  );
}
