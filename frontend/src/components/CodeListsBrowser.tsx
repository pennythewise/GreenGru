import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

export type CodeListData = {
  sections: { num: number; title: string; titleZh?: string }[];
  countries: { code: string; name: string }[];
  currencies: { code: string; name: string }[];
  cnCodes: { cnCode: string; name: string; category: string }[];
  aggregatedGoods: { code: string; name: string }[];
  productionRoutes: { code: string; name: string; category?: string }[];
};

type TabId = "countries" | "currencies" | "cnCodes" | "aggregatedGoods" | "productionRoutes";

const PAGE_SIZE = 40;

const TABS: { id: TabId; en: string; zh: string; countKey: keyof CodeListData }[] = [
  { id: "countries", en: "Countries", zh: "国家", countKey: "countries" },
  { id: "currencies", en: "Currencies", zh: "货币", countKey: "currencies" },
  { id: "cnCodes", en: "CN codes", zh: "CN 税则号", countKey: "cnCodes" },
  { id: "aggregatedGoods", en: "Goods categories", zh: "货物类别", countKey: "aggregatedGoods" },
  { id: "productionRoutes", en: "Production routes", zh: "生产路线", countKey: "productionRoutes" },
];

function useCodeLists() {
  const [data, setData] = useState<CodeListData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/cbam-code-lists.json")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load code lists");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Load failed"));
  }, []);

  return { data, error };
}

export function CodeListsBrowser({
  onSelect,
}: {
  onSelect?: (kind: TabId, code: string, label: string) => void;
}) {
  const { isZh } = useLocale();
  const { data, error } = useCodeLists();
  const [tab, setTab] = useState<TabId>("countries");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [steelOnly, setSteelOnly] = useState(false);

  const rows = useMemo(() => {
    if (!data) return [];
    const needle = q.trim().toLowerCase();
    let list: { code: string; name: string; extra?: string }[] = [];

    if (tab === "countries") {
      list = data.countries.map((c) => ({ code: c.code, name: c.name }));
    } else if (tab === "currencies") {
      list = data.currencies.map((c) => ({ code: c.code, name: c.name }));
    } else if (tab === "cnCodes") {
      list = data.cnCodes
        .filter((c) => !steelOnly || c.cnCode.startsWith("72") || c.cnCode.startsWith("73"))
        .map((c) => ({ code: c.cnCode, name: c.name, extra: c.category }));
    } else if (tab === "aggregatedGoods") {
      list = data.aggregatedGoods.map((c) => ({ code: c.code, name: c.name }));
    } else {
      list = (data.productionRoutes ?? []).map((c) => ({
        code: c.code,
        name: c.name,
        extra: c.category,
      }));
    }

    if (needle) {
      list = list.filter(
        (r) =>
          r.code.toLowerCase().includes(needle) ||
          r.name.toLowerCase().includes(needle) ||
          (r.extra?.toLowerCase().includes(needle) ?? false),
      );
    }
    return list;
  }, [data, tab, q, steelOnly]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [tab, q, steelOnly]);

  if (error) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-[13px] text-danger">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-border bg-surface/40 p-6 text-center text-[12px] font-mono text-muted-foreground animate-pulse">
        {isZh ? "加载代码表…" : "Loading code lists…"}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => {
          const count = Array.isArray(data[t.countKey]) ? (data[t.countKey] as unknown[]).length : 0;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "px-2.5 py-1 rounded-md border text-[11px] font-mono transition",
                tab === t.id
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {isZh ? t.zh : t.en}
              <span className="ml-1 text-muted-foreground/70">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={isZh ? "搜索代码或名称…" : "Search code or name…"}
            className="flex-1 min-w-0 bg-transparent text-[12px] outline-none placeholder:text-muted-foreground/70"
          />
        </div>
        {tab === "cnCodes" && (
          <label className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={steelOnly}
              onChange={(e) => setSteelOnly(e.target.checked)}
              className="rounded border-border"
            />
            {isZh ? "仅钢铁 (72/73)" : "Steel only (72/73)"}
          </label>
        )}
        <span className="text-[10.5px] font-mono text-muted-foreground">
          {rows.length} {isZh ? "条" : "rows"}
        </span>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="max-h-[320px] overflow-y-auto">
          <table className="w-full text-[12px]">
            <thead className="sticky top-0 bg-surface/95 backdrop-blur border-b border-border z-10">
              <tr className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <th className="py-2 px-3 text-left w-[100px]">{isZh ? "代码" : "Code"}</th>
                <th className="py-2 px-3 text-left">{isZh ? "名称" : "Name"}</th>
                {(tab === "cnCodes" || tab === "productionRoutes") && (
                  <th className="py-2 px-3 text-left hidden sm:table-cell">{isZh ? "类别" : "Category"}</th>
                )}
              </tr>
            </thead>
            <tbody className="font-mono divide-y divide-border/60">
              {pageRows.map((r) => (
                <tr
                  key={`${r.code}-${r.name}`}
                  className={cn("hover:bg-surface/60 transition", onSelect && "cursor-pointer")}
                  onClick={() => onSelect?.(tab, r.code, r.name)}
                >
                  <td className="py-2 px-3 text-teal whitespace-nowrap">{r.code}</td>
                  <td className="py-2 px-3 text-foreground/90 font-sans text-[11.5px] leading-snug">{r.name}</td>
                  {(tab === "cnCodes" || tab === "productionRoutes") && (
                    <td className="py-2 px-3 text-muted-foreground text-[10.5px] hidden sm:table-cell truncate max-w-[180px]">
                      {r.extra ?? "—"}
                    </td>
                  )}
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-muted-foreground font-sans">
                    {isZh ? "无匹配结果" : "No matches"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-[11px] font-mono">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-2 py-1 rounded border border-border disabled:opacity-40 hover:bg-surface/60"
          >
            {isZh ? "上一页" : "Prev"}
          </button>
          <span className="text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-2 py-1 rounded border border-border disabled:opacity-40 hover:bg-surface/60"
          >
            {isZh ? "下一页" : "Next"}
          </button>
        </div>
      )}

      <p className="text-[10.5px] text-muted-foreground italic">
        {isZh
          ? "来源：欧盟 CBAM 沟通模板 c_CodeLists 工作表（2024-12-13）。点击行可填入当前字段。"
          : "Source: EU CBAM template c_CodeLists sheet (2024-12-13). Click a row to fill the active field."}
      </p>
    </div>
  );
}
