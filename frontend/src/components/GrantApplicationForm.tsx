import { useState } from "react";
import { Download, RotateCcw } from "lucide-react";
import {
  CheckRow,
  FieldGrid,
  FormShell,
  NumberField,
  SectionBlock,
  TextField,
  scrollToSection,
} from "@/components/application-form-ui";
import { useApplicationForm } from "@/hooks/useApplicationForm";
import { defaultGrantApplication, type GrantApplicationForm } from "@/lib/application-forms/grant-template";
import { useLocale } from "@/lib/locale";

const SECTIONS = [
  { id: "factory", label: "Factory basics", labelZh: "工厂基本信息" },
  { id: "certification", label: "Certification level", labelZh: "申报等级" },
  { id: "veto", label: "Veto requirements", labelZh: "一票否决项" },
  { id: "scoring", label: "Self-evaluation", labelZh: "指标自评" },
  { id: "evaluation", label: "Evaluation method", labelZh: "评价方式" },
  { id: "declaration", label: "Declaration", labelZh: "签章" },
] as const;

const SCORE_KEYS = [
  { key: "infrastructure" as const, en: "Infrastructure", zh: "基础设施", weight: 20 },
  { key: "management_system" as const, en: "Management system", zh: "管理体系", weight: 15 },
  { key: "energy_resource_input" as const, en: "Energy & resource input", zh: "能源资源投入", weight: 15 },
  { key: "product" as const, en: "Product", zh: "产品", weight: 10 },
  { key: "environmental_emissions" as const, en: "Environmental emissions", zh: "环境排放", weight: 10 },
  { key: "performance" as const, en: "Performance", zh: "绩效", weight: 30 },
];

function weightedTotal(scoring: GrantApplicationForm["indicator_scoring_self_evaluation"]): number | null {
  const dims = SCORE_KEYS.map(({ key }) => scoring[key].self_score);
  if (dims.some((s) => s === null)) return null;
  return Math.round(
    SCORE_KEYS.reduce((sum, { key, weight }) => {
      const score = scoring[key].self_score ?? 0;
      return sum + (score * weight) / 100;
    }, 0) * 10,
  ) / 10;
}

function downloadJson(data: GrantApplicationForm, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function GrantApplicationForm() {
  const { isZh } = useLocale();
  const { data, set, reset, completionPct } = useApplicationForm("grant", defaultGrantApplication);
  const [activeId, setActiveId] = useState<string>("factory");

  function selectSection(id: string) {
    setActiveId(id);
    scrollToSection(id);
  }

  function setScore(key: (typeof SCORE_KEYS)[number]["key"], score: number | null) {
    set((p) => {
      const scoring = {
        ...p.indicator_scoring_self_evaluation,
        [key]: { ...p.indicator_scoring_self_evaluation[key], self_score: score },
      };
      return {
        ...p,
        indicator_scoring_self_evaluation: {
          ...scoring,
          total_score: weightedTotal(scoring),
        },
      };
    });
  }

  return (
    <FormShell
      title="Zero-carbon factory grant application"
      titleZh="零碳工厂培育补贴申请表"
      subtitle={
        isZh
          ? "按 GB/T 36132 模板填写，自动保存至浏览器。"
          : "GB/T 36132-aligned template — auto-saved in your browser."
      }
      completionPct={completionPct}
      sections={[...SECTIONS]}
      activeId={activeId}
      onSelect={selectSection}
      isZh={isZh}
    >
      <div className="flex flex-wrap gap-2 mb-1">
        <button
          type="button"
          onClick={() => downloadJson(data, "zero-carbon-factory-grant-application.json")}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-[11.5px] font-mono hover:bg-surface-2"
        >
          <Download className="h-3.5 w-3.5" />
          {isZh ? "导出 JSON" : "Export JSON"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-[11.5px] font-mono text-muted-foreground hover:bg-surface-2"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {isZh ? "重置表单" : "Reset form"}
        </button>
      </div>

      <SectionBlock id="factory" title="Factory basic information" titleZh="工厂基本信息" isZh={isZh}>
        <FieldGrid>
          <TextField
            label="Factory name"
            labelZh="工厂名称"
            isZh={isZh}
            value={data.factory_basic_information.factory_name}
            onChange={(v) =>
              set((p) => ({
                ...p,
                factory_basic_information: { ...p.factory_basic_information, factory_name: v },
              }))
            }
          />
          <TextField
            label="Factory address"
            labelZh="工厂地址"
            isZh={isZh}
            value={data.factory_basic_information.factory_address}
            onChange={(v) =>
              set((p) => ({
                ...p,
                factory_basic_information: { ...p.factory_basic_information, factory_address: v },
              }))
            }
          />
          <TextField
            label="NBS industry code (4-digit)"
            labelZh="国民经济行业代码（4位）"
            isZh={isZh}
            mono
            value={data.factory_basic_information.industry_code_nbs_4digit}
            onChange={(v) =>
              set((p) => ({
                ...p,
                factory_basic_information: { ...p.factory_basic_information, industry_code_nbs_4digit: v },
              }))
            }
          />
          <TextField
            label="Main products"
            labelZh="主要产品"
            isZh={isZh}
            value={data.factory_basic_information.main_products}
            onChange={(v) =>
              set((p) => ({
                ...p,
                factory_basic_information: { ...p.factory_basic_information, main_products: v },
              }))
            }
          />
          <TextField
            label="Unified social credit code"
            labelZh="统一社会信用代码"
            isZh={isZh}
            mono
            value={data.factory_basic_information.unified_social_credit_code}
            onChange={(v) =>
              set((p) => ({
                ...p,
                factory_basic_information: { ...p.factory_basic_information, unified_social_credit_code: v },
              }))
            }
          />
          <TextField
            label="Legal representative"
            labelZh="法定代表人"
            isZh={isZh}
            value={data.factory_basic_information.legal_representative}
            onChange={(v) =>
              set((p) => ({
                ...p,
                factory_basic_information: { ...p.factory_basic_information, legal_representative: v },
              }))
            }
          />
          <TextField
            label="Legal rep phone"
            labelZh="法人电话"
            isZh={isZh}
            value={data.factory_basic_information.legal_representative_phone}
            onChange={(v) =>
              set((p) => ({
                ...p,
                factory_basic_information: { ...p.factory_basic_information, legal_representative_phone: v },
              }))
            }
          />
          <TextField
            label="Application contact"
            labelZh="申报联系人"
            isZh={isZh}
            value={data.factory_basic_information.application_contact_person}
            onChange={(v) =>
              set((p) => ({
                ...p,
                factory_basic_information: { ...p.factory_basic_information, application_contact_person: v },
              }))
            }
          />
          <TextField
            label="Contact department"
            labelZh="联系部门"
            isZh={isZh}
            value={data.factory_basic_information.contact_department}
            onChange={(v) =>
              set((p) => ({
                ...p,
                factory_basic_information: { ...p.factory_basic_information, contact_department: v },
              }))
            }
          />
          <TextField
            label="Contact phone"
            labelZh="联系电话"
            isZh={isZh}
            value={data.factory_basic_information.contact_phone}
            onChange={(v) =>
              set((p) => ({
                ...p,
                factory_basic_information: { ...p.factory_basic_information, contact_phone: v },
              }))
            }
          />
          <TextField
            label="Contact email"
            labelZh="联系邮箱"
            isZh={isZh}
            type="email"
            value={data.factory_basic_information.contact_email}
            onChange={(v) =>
              set((p) => ({
                ...p,
                factory_basic_information: { ...p.factory_basic_information, contact_email: v },
              }))
            }
          />
        </FieldGrid>
        <div>
          <div className="text-[11px] font-mono text-muted-foreground mb-2">{isZh ? "所有制类型" : "Ownership type"}</div>
          <div className="grid sm:grid-cols-2 gap-1">
            {(
              [
                ["domestic_state_owned", "Domestic state-owned", "国有"],
                ["domestic_collective", "Domestic collective", "集体"],
                ["domestic_private", "Domestic private", "民营"],
                ["sino_foreign_joint_venture", "Sino-foreign JV", "中外合资"],
                ["hk_macau_taiwan_invested", "HK/Macau/Taiwan invested", "港澳台资"],
                ["wholly_foreign_owned", "Wholly foreign-owned", "外商独资"],
              ] as const
            ).map(([key, en, zh]) => (
              <CheckRow
                key={key}
                label={en}
                labelZh={zh}
                isZh={isZh}
                checked={data.factory_basic_information.ownership_type[key]}
                onChange={(v) =>
                  set((p) => ({
                    ...p,
                    factory_basic_information: {
                      ...p.factory_basic_information,
                      ownership_type: { ...p.factory_basic_information.ownership_type, [key]: v },
                    },
                  }))
                }
              />
            ))}
          </div>
        </div>
      </SectionBlock>

      <SectionBlock id="certification" title="Certification level applied for" titleZh="申报认证等级" isZh={isZh}>
        <div className="grid sm:grid-cols-3 gap-1">
          <CheckRow
            label="National"
            labelZh="国家级"
            isZh={isZh}
            checked={data.certification_level_applied_for.national}
            onChange={(v) =>
              set((p) => ({
                ...p,
                certification_level_applied_for: { ...p.certification_level_applied_for, national: v },
              }))
            }
          />
          <CheckRow
            label="Provincial"
            labelZh="省级"
            isZh={isZh}
            checked={data.certification_level_applied_for.provincial}
            onChange={(v) =>
              set((p) => ({
                ...p,
                certification_level_applied_for: { ...p.certification_level_applied_for, provincial: v },
              }))
            }
          />
          <CheckRow
            label="Municipal"
            labelZh="市级"
            isZh={isZh}
            checked={data.certification_level_applied_for.municipal}
            onChange={(v) =>
              set((p) => ({
                ...p,
                certification_level_applied_for: { ...p.certification_level_applied_for, municipal: v },
              }))
            }
          />
        </div>
      </SectionBlock>

      <SectionBlock id="veto" title="Basic veto requirements" titleZh="基本准入（一票否决）" isZh={isZh}>
        <p className="text-[12px] text-muted-foreground mb-2">
          {isZh ? "以下各项须全部满足方可进入评分环节。" : "All items must be satisfied to proceed to scoring."}
        </p>
        <div className="grid sm:grid-cols-2 gap-1">
          {(
            [
              ["registered_in_china_manufacturing_gb_t4754", "Registered in China manufacturing (GB/T 4754)", "在中国境内注册且属制造业"],
              ["qms_gb_t19001_in_place", "QMS GB/T 19001 in place", "质量管理体系 GB/T 19001"],
              ["ohsms_gb_t45001_28001_in_place", "OHSMS GB/T 45001/28001 in place", "职业健康安全管理体系"],
              ["ems_gb_t24001_in_place", "EMS GB/T 24001 in place", "环境管理体系 GB/T 24001"],
              ["energy_mgmt_system_gb_t23331_in_place", "Energy mgmt GB/T 23331 in place", "能源管理体系 GB/T 23331"],
              ["no_phased_out_banned_tech_process_equipment", "No phased-out/banned tech or equipment", "无淘汰/禁止工艺设备"],
              ["dedicated_solid_waste_storage_and_dust_recovery", "Solid waste storage & dust recovery", "固废贮存与粉尘回收设施"],
              ["emissions_comply_with_control_and_permit_requirements", "Emissions comply with permit requirements", "排放符合许可及管控要求"],
              ["energy_metering_per_gb17167", "Energy metering per GB 17167", "能源计量符合 GB 17167"],
              ["no_major_environmental_incident_past_3yrs", "No major environmental incident (3 yrs)", "近三年无重大环境事件"],
            ] as const
          ).map(([key, en, zh]) => (
            <CheckRow
              key={key}
              label={en}
              labelZh={zh}
              isZh={isZh}
              checked={data.basic_veto_requirements[key]}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  basic_veto_requirements: { ...p.basic_veto_requirements, [key]: v },
                }))
              }
            />
          ))}
        </div>
      </SectionBlock>

      <SectionBlock id="scoring" title="Indicator scoring self-evaluation" titleZh="指标评分自评" isZh={isZh}>
        <p className="text-[12px] text-muted-foreground">
          {isZh
            ? "各维度满分 100 分，总分按权重自动加权计算。"
            : "Score each dimension out of 100; total is weighted automatically."}
        </p>
        <div className="space-y-3 mt-2">
          {SCORE_KEYS.map(({ key, en, zh, weight }) => (
            <div
              key={key}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface/40 px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium">{isZh ? zh : en}</div>
                <div className="text-[10.5px] font-mono text-muted-foreground">{isZh ? `权重 ${weight}%` : `Weight ${weight}%`}</div>
              </div>
              <div className="w-28">
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0–100"
                  value={data.indicator_scoring_self_evaluation[key].self_score ?? ""}
                  onChange={(e) =>
                    setScore(key, e.target.value === "" ? null : Math.min(100, Math.max(0, Number(e.target.value))))
                  }
                  className="w-full rounded-md border border-input bg-surface px-2.5 py-2 text-[13px] font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <span className="text-[13px] font-medium">{isZh ? "加权总分" : "Weighted total score"}</span>
          <span className="text-[22px] font-mono font-semibold text-primary">
            {data.indicator_scoring_self_evaluation.total_score ?? "—"}
            <span className="text-[12px] text-muted-foreground font-normal"> / 100</span>
          </span>
        </div>
      </SectionBlock>

      <SectionBlock id="evaluation" title="Evaluation method & report outline" titleZh="评价方式与报告提纲" isZh={isZh}>
        <div className="space-y-4">
          <div>
            <div className="text-[11px] font-mono text-muted-foreground mb-2">{isZh ? "评价方式" : "Evaluation method"}</div>
            <CheckRow
              label="Self-evaluation"
              labelZh="企业自评"
              isZh={isZh}
              checked={data.evaluation_method.self_evaluation}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  evaluation_method: { ...p.evaluation_method, self_evaluation: v },
                }))
              }
            />
            <CheckRow
              label="Third-party evaluation"
              labelZh="第三方评价"
              isZh={isZh}
              checked={data.evaluation_method.third_party_evaluation}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  evaluation_method: { ...p.evaluation_method, third_party_evaluation: v },
                }))
              }
            />
            {data.evaluation_method.third_party_evaluation && (
              <TextField
                label="Third-party institution"
                labelZh="第三方机构名称"
                isZh={isZh}
                className="mt-2"
                value={data.evaluation_method.third_party_institution_name}
                onChange={(v) =>
                  set((p) => ({
                    ...p,
                    evaluation_method: { ...p.evaluation_method, third_party_institution_name: v },
                  }))
                }
              />
            )}
          </div>
          <div>
            <div className="text-[11px] font-mono text-muted-foreground mb-2">
              {isZh ? "评价报告提纲（附件勾选）" : "Evaluation report outline attached"}
            </div>
            <div className="grid sm:grid-cols-2 gap-1">
              {(
                [
                  ["section1_overview", "§1 Overview", "第一章 概述"],
                  ["section2_evaluation_content", "§2 Evaluation content", "第二章 评价内容"],
                  ["section3_evaluation_conclusion", "§3 Conclusion", "第三章 评价结论"],
                  ["section4_recommendations", "§4 Recommendations", "第四章 改进建议"],
                  ["section5_reference_documents", "§5 Reference documents", "第五章 参考文件"],
                  ["annex_onsite_supporting_materials_checklist", "Annex: onsite materials checklist", "附件 现场佐证材料清单"],
                ] as const
              ).map(([key, en, zh]) => (
                <CheckRow
                  key={key}
                  label={en}
                  labelZh={zh}
                  isZh={isZh}
                  checked={data.evaluation_report_outline_attached[key]}
                  onChange={(v) =>
                    set((p) => ({
                      ...p,
                      evaluation_report_outline_attached: {
                        ...p.evaluation_report_outline_attached,
                        [key]: v,
                      },
                    }))
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock id="declaration" title="Declaration" titleZh="声明与签章" isZh={isZh}>
        <FieldGrid>
          <TextField
            label="Legal representative signature"
            labelZh="法定代表人签字"
            isZh={isZh}
            value={data.declaration.legal_rep_signature}
            onChange={(v) => set((p) => ({ ...p, declaration: { ...p.declaration, legal_rep_signature: v } }))}
          />
          <TextField
            label="Date"
            labelZh="日期"
            isZh={isZh}
            type="date"
            value={data.declaration.date}
            onChange={(v) => set((p) => ({ ...p, declaration: { ...p.declaration, date: v } }))}
          />
        </FieldGrid>
        <CheckRow
          label="Company seal applied"
          labelZh="已加盖企业公章"
          isZh={isZh}
          checked={data.declaration.company_seal_applied}
          onChange={(v) =>
            set((p) => ({ ...p, declaration: { ...p.declaration, company_seal_applied: v } }))
          }
        />
      </SectionBlock>
    </FormShell>
  );
}
