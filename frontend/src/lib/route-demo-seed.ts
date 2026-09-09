/**
 * Hackathon demo seed — marks every Section A checklist slot as processed
 * so Route pipeline unlocks without real uploads. Filenames are illustrative only.
 */
import { docChecklists } from "@/lib/dashboard-data";
import type { RagChannel, RagQueryResult } from "@/lib/api";

type Slug = keyof typeof docChecklists;

export type DemoChecklistUpload = {
  done: boolean;
  fileName?: string;
  uploadedAt?: string;
  fileHash?: string;
  chunkCount?: number;
  ragStored?: boolean;
  statusNote?: string;
  processed?: boolean;
};

const DEMO_FILES: Record<Slug, Record<string, string>> = {
  passport: {
    "CN-code product list · 税则号": "demo_CN_product_list_7318_15_88.pdf",
    "Route-of-production statement": "demo_route_BF_BOF_statement.pdf",
    "Direct + indirect embedded emissions": "demo_embedded_emissions_ledger_2025.pdf",
    "Verifier accreditation": "demo_verifier_accreditation.pdf",
    "Purchased CBAM certificates (Q ledger)": "demo_CBAM_certificates_Q1_Q2_2026.pdf",
    "Installation-level emissions data": "demo_installation_emissions_P1.pdf",
  },
  loan: {
    "Business licence · 营业执照": "demo_business_licence.pdf",
    "Latest 12-mo utility invoices": "demo_utility_invoices_12mo.pdf",
    "Emissions ledger · Q1–Q4 2025": "demo_emissions_ledger_2025.pdf",
    "Bank statement · last 6 mo": "demo_bank_statement_6mo.pdf",
    "Green-project use-of-proceeds": "demo_use_of_proceeds.pdf",
    "Auditor attestation (optional)": "demo_auditor_attestation.pdf",
  },
  grant: {
    "Factory registration · 工厂登记": "demo_factory_registration.pdf",
    "Metering coverage report": "demo_metering_coverage.pdf",
    "Scrap-steel ratio evidence": "demo_scrap_ratio_evidence.pdf",
    "Green-electricity PPA / green cert": "demo_green_ppa.pdf",
    "Third-party emissions report (12 mo)": "demo_third_party_emissions_12mo.pdf",
    "Provincial 零碳工厂 pre-cert": "demo_provincial_precert.pdf",
  },
};

export function buildDemoChecklistUploads(slug: Slug): Record<string, DemoChecklistUpload> {
  const files = DEMO_FILES[slug];
  const out: Record<string, DemoChecklistUpload> = {};
  const now = new Date().toISOString();
  for (const item of docChecklists[slug].items) {
    const fileName = files[item.name] ?? `demo_${item.name.slice(0, 24).replace(/\s+/g, "_")}.pdf`;
    out[item.name] = {
      done: true,
      processed: true,
      fileName,
      uploadedAt: now,
      fileHash: `demo-${slug}-${item.name.length}`,
      chunkCount: 3,
      ragStored: true,
      statusNote: "Demo mock · pre-seeded for pipeline",
    };
  }
  return out;
}

/** Merge demo slots only where the user has not already processed a file. */
export function fillMissingChecklistWithDemo(
  slug: Slug,
  existing: Record<string, DemoChecklistUpload>,
): Record<string, DemoChecklistUpload> {
  const demo = buildDemoChecklistUploads(slug);
  const out: Record<string, DemoChecklistUpload> = { ...existing };
  for (const [key, value] of Object.entries(demo)) {
    const cur = out[key];
    if (cur?.processed && cur.fileName?.trim()) continue;
    out[key] = value;
  }
  return out;
}

/** Stage-1 Pre-screener fallback when live RAG returns no hits / errors. */
export function demoPrescreenerRag(channel: RagChannel, query: string): RagQueryResult {
  const kb =
    channel === "cbam"
      ? "EU CBAM Operator Guidance (DG TAXUD)"
      : channel === "grant"
        ? "GB/T 36132—2025 绿色工厂评价"
        : "绿色金融支持项目目录（2025）";

  const snippets =
    channel === "cbam"
      ? [
          {
            heading_path: "Page 12 · Monitoring methodology",
            chunk_text:
              "Installation operators must monitor direct emissions for iron and steel goods under Annex II. Default values may be used where actual data are not available, subject to the transitional period rules.",
            similarity: 0.86,
          },
          {
            heading_path: "Page 28 · Reporting to importer",
            chunk_text:
              "Embedded emissions communicated to the EU importer should cover CN-code level goods and identify the production route (e.g. BF-BOF) used for the reporting period.",
            similarity: 0.81,
          },
          {
            heading_path: "Page 41 · Default values · iron & steel",
            chunk_text:
              "Where actual emissions data cannot be verified, operators may apply the applicable default values published for the CN code and production route combination.",
            similarity: 0.77,
          },
        ]
      : channel === "grant"
        ? [
            {
              heading_path: "第 4.2 节 · 基本要求",
              chunk_text:
                "申报绿色工厂需满足质量管理、职业健康、环境与能源管理体系等基本否决项；计量器具配置应符合 GB 17167。",
              similarity: 0.84,
            },
            {
              heading_path: "评价指标 · 能源资源投入",
              chunk_text:
                "废钢比、绿色电力占比与单位产品综合能耗为评分重点；证据材料需覆盖近 12 个月运行数据。",
              similarity: 0.8,
            },
            {
              heading_path: "申报材料清单",
              chunk_text:
                "工厂登记、计量覆盖报告、废钢比证明、绿电 PPA/绿证、第三方排放报告与省级预认证材料一并提交。",
              similarity: 0.76,
            },
          ]
        : [
            {
              heading_path: "目录 3 · 工业节能节水环保",
              chunk_text:
                "钢铁下游技改、余热回收与计量补点项目可对照《绿色金融支持项目目录（2025）》工业节能节水环保类别申报。",
              similarity: 0.83,
            },
            {
              heading_path: "贷款用途与资金管理",
              chunk_text:
                "绿色贷款资金应专户管理或内部台账跟踪，用途需清晰映射至单一目录类别，并披露环境效益测算假设。",
              similarity: 0.79,
            },
            {
              heading_path: "材料要求",
              chunk_text:
                "营业执照、近 12 个月公用事业票据、排放台账、银行流水与资金用途说明为常见尽调材料。",
              similarity: 0.74,
            },
          ];

  const chunks = snippets.map((s, i) => ({
    chunk_text: s.chunk_text,
    heading_path: s.heading_path,
    source_file: kb,
    similarity: s.similarity,
    chunk_index: i,
    channel,
    language: channel === "cbam" ? "en" : "zh",
    corpus: "kb",
    matched_kb_file: kb,
    matched_kb_heading: s.heading_path,
  }));

  return {
    channel,
    query,
    hit_count: chunks.length,
    chunks,
    prompt_block: chunks.map((c) => c.chunk_text).join("\n\n"),
    source: "demo",
    confidence_score: 0.81,
    threshold: 0.7,
    passes_threshold: true,
    form_chunks_scored: 0,
    upload_chunks_scored: 0,
    kb_chunks_compared: chunks.length,
    matched_kb_files: [kb],
  };
}
