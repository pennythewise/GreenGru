import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { ApplicationFormPdfUpload } from "@/components/ApplicationFormPdfUpload";
import {
  CheckRow,
  FieldGrid,
  FormShell,
  NumberField,
  SectionBlock,
  TextArea,
  TextField,
  TriToggle,
  scrollToSection,
} from "@/components/application-form-ui";
import { useApplicationForm } from "@/hooks/useApplicationForm";
import { defaultLoanApplication, type LoanApplicationForm } from "@/lib/application-forms/loan-template";
import { useLocale } from "@/lib/locale";

const SECTIONS = [
  { id: "company", label: "Company", labelZh: "企业信息" },
  { id: "loan", label: "Loan project", labelZh: "贷款项目" },
  { id: "funds", label: "Use of funds", labelZh: "资金用途" },
  { id: "carbon", label: "Carbon account", labelZh: "碳账户" },
  { id: "environment", label: "Benefits & reporting", labelZh: "环境效益" },
  { id: "compliance", label: "Compliance", labelZh: "合规声明" },
  { id: "glp", label: "GLP verification", labelZh: "绿贷原则" },
  { id: "subsidy", label: "Interest subsidy", labelZh: "贴息申请" },
  { id: "declaration", label: "Declaration", labelZh: "签章" },
] as const;

export function LoanApplicationForm() {
  const { isZh } = useLocale();
  const { data, set, replace, reset, completionPct } = useApplicationForm("loan", defaultLoanApplication);
  const [activeId, setActiveId] = useState<string>("company");

  function selectSection(id: string) {
    setActiveId(id);
    scrollToSection(id);
  }

  function setSize(key: keyof LoanApplicationForm["company_information"]["enterprise_size"]) {
    set((p) => ({
      ...p,
      company_information: {
        ...p.company_information,
        enterprise_size: { large: false, medium: false, small: false, micro: false, [key]: true },
      },
    }));
  }

  function selectCategory(num: number) {
    set((p) => ({
      ...p,
      use_of_funds_category: {
        ...p.use_of_funds_category,
        selected_category_number: num,
        categories: p.use_of_funds_category.categories.map((c) => ({ ...c, selected: c.number === num })),
      },
    }));
  }

  return (
    <FormShell
      title="Green loan application"
      titleZh="绿色贷款申请表"
      subtitle={
        isZh
          ? "可编辑申请表 — 可手工填写，或上传已填 PDF 自动映射；自动保存至浏览器。"
          : "Editable form — fill manually or upload a filled PDF to map fields; auto-saved in your browser."
      }
      completionPct={completionPct}
      sections={[...SECTIONS]}
      activeId={activeId}
      onSelect={selectSection}
      isZh={isZh}
    >
      <div className="flex flex-wrap items-start gap-3 mb-1">
        <ApplicationFormPdfUpload
          route="loan"
          isZh={isZh}
          onMapped={(form) => replace(form as LoanApplicationForm)}
        />
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-[11.5px] font-mono text-muted-foreground hover:bg-surface-2"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {isZh ? "重置表单" : "Reset form"}
        </button>
      </div>

      <SectionBlock id="company" title="Company information" titleZh="企业基本信息" isZh={isZh}>
        <FieldGrid>
          <TextField
            label="Company name"
            labelZh="企业名称"
            isZh={isZh}
            value={data.company_information.company_name}
            onChange={(v) => set((p) => ({ ...p, company_information: { ...p.company_information, company_name: v } }))}
          />
          <TextField
            label="Unified social credit code"
            labelZh="统一社会信用代码"
            isZh={isZh}
            mono
            value={data.company_information.unified_social_credit_code}
            onChange={(v) =>
              set((p) => ({ ...p, company_information: { ...p.company_information, unified_social_credit_code: v } }))
            }
          />
          <TextField
            label="Registered address"
            labelZh="注册地址"
            isZh={isZh}
            className="sm:col-span-2"
            value={data.company_information.registered_address}
            onChange={(v) =>
              set((p) => ({ ...p, company_information: { ...p.company_information, registered_address: v } }))
            }
          />
          <TextField
            label="Industry classification"
            labelZh="行业分类"
            isZh={isZh}
            className="sm:col-span-2"
            value={data.company_information.industry_classification}
            onChange={(v) =>
              set((p) => ({ ...p, company_information: { ...p.company_information, industry_classification: v } }))
            }
          />
          <TextField
            label="Legal representative"
            labelZh="法定代表人"
            isZh={isZh}
            value={data.company_information.legal_representative}
            onChange={(v) =>
              set((p) => ({ ...p, company_information: { ...p.company_information, legal_representative: v } }))
            }
          />
          <TextField
            label="Contact person title"
            labelZh="联系人职务"
            isZh={isZh}
            value={data.company_information.contact_person_title}
            onChange={(v) =>
              set((p) => ({ ...p, company_information: { ...p.company_information, contact_person_title: v } }))
            }
          />
          <TextField
            label="Phone"
            labelZh="电话"
            isZh={isZh}
            value={data.company_information.phone}
            onChange={(v) => set((p) => ({ ...p, company_information: { ...p.company_information, phone: v } }))}
          />
          <TextField
            label="Email"
            labelZh="邮箱"
            isZh={isZh}
            type="email"
            value={data.company_information.email}
            onChange={(v) => set((p) => ({ ...p, company_information: { ...p.company_information, email: v } }))}
          />
        </FieldGrid>
        <div>
          <div className="text-[11px] font-mono text-muted-foreground mb-2">{isZh ? "企业规模" : "Enterprise size"}</div>
          <div className="grid sm:grid-cols-2 gap-1">
            <CheckRow label="Large" labelZh="大型" isZh={isZh} checked={data.company_information.enterprise_size.large} onChange={() => setSize("large")} />
            <CheckRow label="Medium" labelZh="中型" isZh={isZh} checked={data.company_information.enterprise_size.medium} onChange={() => setSize("medium")} />
            <CheckRow label="Small" labelZh="小型" isZh={isZh} checked={data.company_information.enterprise_size.small} onChange={() => setSize("small")} />
            <CheckRow label="Micro" labelZh="微型" isZh={isZh} checked={data.company_information.enterprise_size.micro} onChange={() => setSize("micro")} />
          </div>
        </div>
      </SectionBlock>

      <SectionBlock id="loan" title="Loan project information" titleZh="贷款项目信息" isZh={isZh}>
        <FieldGrid>
          <TextField
            label="Lender applied to"
            labelZh="申请贷款银行/机构"
            isZh={isZh}
            className="sm:col-span-2"
            value={data.loan_project_information.lender_applied_to}
            onChange={(v) =>
              set((p) => ({
                ...p,
                loan_project_information: { ...p.loan_project_information, lender_applied_to: v },
              }))
            }
          />
          <NumberField
            label="Requested amount (RMB)"
            labelZh="申请金额（元）"
            isZh={isZh}
            value={data.loan_project_information.requested_amount_rmb}
            onChange={(v) =>
              set((p) => ({
                ...p,
                loan_project_information: { ...p.loan_project_information, requested_amount_rmb: v },
              }))
            }
          />
          <TextField
            label="Tenor"
            labelZh="贷款期限"
            isZh={isZh}
            value={data.loan_project_information.tenor}
            onChange={(v) =>
              set((p) => ({ ...p, loan_project_information: { ...p.loan_project_information, tenor: v } }))
            }
          />
          <TextField
            label="Contract signing date"
            labelZh="合同签订日期"
            isZh={isZh}
            type="date"
            value={data.loan_project_information.contract_signing_date}
            onChange={(v) =>
              set((p) => ({
                ...p,
                loan_project_information: { ...p.loan_project_information, contract_signing_date: v },
              }))
            }
          />
          <TextField
            label="Disbursement date"
            labelZh="放款日期"
            isZh={isZh}
            type="date"
            value={data.loan_project_information.disbursement_date}
            onChange={(v) =>
              set((p) => ({
                ...p,
                loan_project_information: { ...p.loan_project_information, disbursement_date: v },
              }))
            }
          />
          <TextField
            label="Project name"
            labelZh="项目名称"
            isZh={isZh}
            className="sm:col-span-2"
            value={data.loan_project_information.project_name}
            onChange={(v) =>
              set((p) => ({ ...p, loan_project_information: { ...p.loan_project_information, project_name: v } }))
            }
          />
          <TextArea
            label="Project description"
            labelZh="项目描述"
            isZh={isZh}
            value={data.loan_project_information.project_description}
            onChange={(v) =>
              set((p) => ({
                ...p,
                loan_project_information: { ...p.loan_project_information, project_description: v },
              }))
            }
          />
        </FieldGrid>
        <div>
          <div className="text-[11px] font-mono text-muted-foreground mb-2">{isZh ? "贷款类型" : "Loan type"}</div>
          <div className="grid sm:grid-cols-2 gap-1">
            {(
              [
                ["working_capital", "Working capital", "流动资金贷款"],
                ["fixed_asset", "Fixed asset", "固定资产贷款"],
                ["project_loan", "Project loan", "项目贷款"],
                ["tech_upgrade", "Tech upgrade", "技术改造贷款"],
              ] as const
            ).map(([key, en, zh]) => (
              <CheckRow
                key={key}
                label={en}
                labelZh={zh}
                isZh={isZh}
                checked={data.loan_project_information.loan_type[key]}
                onChange={(v) =>
                  set((p) => ({
                    ...p,
                    loan_project_information: {
                      ...p.loan_project_information,
                      loan_type: { ...p.loan_project_information.loan_type, [key]: v },
                    },
                  }))
                }
              />
            ))}
          </div>
          <TextField
            label="Other loan type"
            labelZh="其他贷款类型"
            isZh={isZh}
            className="mt-2"
            value={data.loan_project_information.loan_type.other}
            onChange={(v) =>
              set((p) => ({
                ...p,
                loan_project_information: {
                  ...p.loan_project_information,
                  loan_type: { ...p.loan_project_information.loan_type, other: v },
                },
              }))
            }
          />
        </div>
        <div className="rounded-lg border border-border/70 p-3 space-y-3">
          <div className="text-[12px] font-medium">{isZh ? "再融资" : "Refinancing"}</div>
          <TriToggle
            label="Includes refinancing portion"
            labelZh="含再融资部分"
            isZh={isZh}
            value={data.loan_project_information.refinancing.includes_refinancing_portion}
            onChange={(v) =>
              set((p) => ({
                ...p,
                loan_project_information: {
                  ...p.loan_project_information,
                  refinancing: { ...p.loan_project_information.refinancing, includes_refinancing_portion: v },
                },
              }))
            }
          />
          <FieldGrid>
            <TextField
              label="Financing vs refinancing share"
              labelZh="融资/再融资比例"
              isZh={isZh}
              value={data.loan_project_information.refinancing.estimated_financing_vs_refinancing_share}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  loan_project_information: {
                    ...p.loan_project_information,
                    refinancing: {
                      ...p.loan_project_information.refinancing,
                      estimated_financing_vs_refinancing_share: v,
                    },
                  },
                }))
              }
            />
            <TextField
              label="Look-back period"
              labelZh="再融资回溯期"
              isZh={isZh}
              value={data.loan_project_information.refinancing.look_back_period_for_refinanced_projects}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  loan_project_information: {
                    ...p.loan_project_information,
                    refinancing: {
                      ...p.loan_project_information.refinancing,
                      look_back_period_for_refinanced_projects: v,
                    },
                  },
                }))
              }
            />
          </FieldGrid>
        </div>
        <div className="rounded-lg border border-border/70 p-3 space-y-3">
          <div className="text-[12px] font-medium">{isZh ? "资金管理与追踪" : "Management of proceeds"}</div>
          <div className="grid sm:grid-cols-2 gap-1">
            <CheckRow
              label="Dedicated account"
              labelZh="专户管理"
              isZh={isZh}
              checked={data.loan_project_information.management_of_proceeds.method.dedicated_account}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  loan_project_information: {
                    ...p.loan_project_information,
                    management_of_proceeds: {
                      ...p.loan_project_information.management_of_proceeds,
                      method: { ...p.loan_project_information.management_of_proceeds.method, dedicated_account: v },
                    },
                  },
                }))
              }
            />
            <CheckRow
              label="Internal tracking ledger"
              labelZh="内部台账追踪"
              isZh={isZh}
              checked={data.loan_project_information.management_of_proceeds.method.internal_tracking_ledger}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  loan_project_information: {
                    ...p.loan_project_information,
                    management_of_proceeds: {
                      ...p.loan_project_information.management_of_proceeds,
                      method: {
                        ...p.loan_project_information.management_of_proceeds.method,
                        internal_tracking_ledger: v,
                      },
                    },
                  },
                }))
              }
            />
          </div>
          <TextField
            label="Other tracking method"
            labelZh="其他管理方式"
            isZh={isZh}
            value={data.loan_project_information.management_of_proceeds.method.other}
            onChange={(v) =>
              set((p) => ({
                ...p,
                loan_project_information: {
                  ...p.loan_project_information,
                  management_of_proceeds: {
                    ...p.loan_project_information.management_of_proceeds,
                    method: { ...p.loan_project_information.management_of_proceeds.method, other: v },
                  },
                },
              }))
            }
          />
          <TextArea
            label="Temporary placement for unallocated proceeds"
            labelZh="未分配资金临时存放安排"
            isZh={isZh}
            value={
              data.loan_project_information.management_of_proceeds
                .temporary_placement_arrangement_for_unallocated_proceeds
            }
            onChange={(v) =>
              set((p) => ({
                ...p,
                loan_project_information: {
                  ...p.loan_project_information,
                  management_of_proceeds: {
                    ...p.loan_project_information.management_of_proceeds,
                    temporary_placement_arrangement_for_unallocated_proceeds: v,
                  },
                },
              }))
            }
          />
          <TriToggle
            label="One tranche of multi-tranche facility"
            labelZh="多批次贷款中的一批"
            isZh={isZh}
            value={data.loan_project_information.management_of_proceeds.is_one_tranche_of_multi_tranche_facility}
            onChange={(v) =>
              set((p) => ({
                ...p,
                loan_project_information: {
                  ...p.loan_project_information,
                  management_of_proceeds: {
                    ...p.loan_project_information.management_of_proceeds,
                    is_one_tranche_of_multi_tranche_facility: v,
                  },
                },
              }))
            }
          />
          <TriToggle
            label="Tranche separately labelled green and tracked"
            labelZh="该批次单独标识为绿色并追踪"
            isZh={isZh}
            value={data.loan_project_information.management_of_proceeds.tranche_separately_labelled_green_and_tracked}
            onChange={(v) =>
              set((p) => ({
                ...p,
                loan_project_information: {
                  ...p.loan_project_information,
                  management_of_proceeds: {
                    ...p.loan_project_information.management_of_proceeds,
                    tranche_separately_labelled_green_and_tracked: v,
                  },
                },
              }))
            }
          />
        </div>
      </SectionBlock>

      <SectionBlock id="funds" title="Use of funds category" titleZh="绿色资金用途目录" isZh={isZh}>
        <p className="text-[12px] text-muted-foreground">
          {isZh ? "选择一项 PBOC 绿色金融支持项目目录类别：" : "Select one PBOC green project catalogue category:"}
        </p>
        <div className="space-y-1.5">
          {data.use_of_funds_category.categories.map((cat) => (
            <button
              key={cat.number}
              type="button"
              onClick={() => selectCategory(cat.number)}
              className={`w-full text-left rounded-lg border px-3 py-2.5 transition ${
                cat.selected
                  ? "border-primary/50 bg-primary/10"
                  : "border-border hover:border-primary/30 hover:bg-surface-2"
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-[11px] font-mono text-muted-foreground shrink-0 w-5">{cat.number}.</span>
                <span className="text-[12.5px] leading-snug">{isZh ? cat.name_cn : cat.name_en}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          <div className="text-[12px] font-medium">{isZh ? "GLP 评估与遴选流程" : "GLP evaluation & selection"}</div>
          <FieldGrid>
            <TextArea
              label="Environmental sustainability objectives"
              labelZh="环境可持续性目标"
              isZh={isZh}
              value={data.use_of_funds_category.glp_evaluation_and_selection_process.environmental_sustainability_objectives}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  use_of_funds_category: {
                    ...p.use_of_funds_category,
                    glp_evaluation_and_selection_process: {
                      ...p.use_of_funds_category.glp_evaluation_and_selection_process,
                      environmental_sustainability_objectives: v,
                    },
                  },
                }))
              }
            />
            <TextArea
              label="Taxonomy / eligibility process"
              labelZh="分类目录/遴选依据"
              isZh={isZh}
              value={data.use_of_funds_category.glp_evaluation_and_selection_process.taxonomy_or_process_used_for_eligibility}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  use_of_funds_category: {
                    ...p.use_of_funds_category,
                    glp_evaluation_and_selection_process: {
                      ...p.use_of_funds_category.glp_evaluation_and_selection_process,
                      taxonomy_or_process_used_for_eligibility: v,
                    },
                  },
                }))
              }
            />
            <TextArea
              label="Exclusion criteria"
              labelZh="排除标准"
              isZh={isZh}
              value={data.use_of_funds_category.glp_evaluation_and_selection_process.exclusion_criteria}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  use_of_funds_category: {
                    ...p.use_of_funds_category,
                    glp_evaluation_and_selection_process: {
                      ...p.use_of_funds_category.glp_evaluation_and_selection_process,
                      exclusion_criteria: v,
                    },
                  },
                }))
              }
            />
            <TextArea
              label="ES risk identification process"
              labelZh="环境社会风险识别流程"
              isZh={isZh}
              value={
                data.use_of_funds_category.glp_evaluation_and_selection_process
                  .environmental_social_risk_identification_process
              }
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  use_of_funds_category: {
                    ...p.use_of_funds_category,
                    glp_evaluation_and_selection_process: {
                      ...p.use_of_funds_category.glp_evaluation_and_selection_process,
                      environmental_social_risk_identification_process: v,
                    },
                  },
                }))
              }
            />
            <TextArea
              label="Material risks & mitigants"
              labelZh="重大风险及缓释措施"
              isZh={isZh}
              value={
                data.use_of_funds_category.glp_evaluation_and_selection_process.material_risks_identified_and_mitigants
              }
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  use_of_funds_category: {
                    ...p.use_of_funds_category,
                    glp_evaluation_and_selection_process: {
                      ...p.use_of_funds_category.glp_evaluation_and_selection_process,
                      material_risks_identified_and_mitigants: v,
                    },
                  },
                }))
              }
            />
          </FieldGrid>
        </div>
      </SectionBlock>

      <SectionBlock id="carbon" title="Carbon account add-on" titleZh="碳账户补充信息" isZh={isZh}>
        <CheckRow
          label="Section applicable"
          labelZh="本节适用"
          isZh={isZh}
          checked={data.carbon_account_addon.applicable}
          onChange={(v) => set((p) => ({ ...p, carbon_account_addon: { ...p.carbon_account_addon, applicable: v } }))}
        />
        {data.carbon_account_addon.applicable && (
          <FieldGrid>
            <TriToggle
              label="Enterprise carbon account opened"
              labelZh="已开立企业碳账户"
              isZh={isZh}
              value={data.carbon_account_addon.enterprise_carbon_account_opened}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  carbon_account_addon: { ...p.carbon_account_addon, enterprise_carbon_account_opened: v },
                }))
              }
            />
            <TextField
              label="Carbon account platform"
              labelZh="碳账户平台名称"
              isZh={isZh}
              value={data.carbon_account_addon.carbon_account_platform_name}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  carbon_account_addon: { ...p.carbon_account_addon, carbon_account_platform_name: v },
                }))
              }
            />
            <TriToggle
              label="Authorised to issue carbon report to lender"
              labelZh="授权平台向贷款行出具碳信用报告"
              isZh={isZh}
              value={data.carbon_account_addon.authorised_platform_to_issue_carbon_credit_report_to_lender}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  carbon_account_addon: {
                    ...p.carbon_account_addon,
                    authorised_platform_to_issue_carbon_credit_report_to_lender: v,
                  },
                }))
              }
            />
            <TextField
              label="Latest carbon performance rating"
              labelZh="最新碳排放绩效评级"
              isZh={isZh}
              value={data.carbon_account_addon.latest_carbon_emission_performance_rating}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  carbon_account_addon: { ...p.carbon_account_addon, latest_carbon_emission_performance_rating: v },
                }))
              }
            />
            <TextField
              label="Registered capital"
              labelZh="注册资本"
              isZh={isZh}
              value={data.carbon_account_addon.registered_capital}
              onChange={(v) =>
                set((p) => ({ ...p, carbon_account_addon: { ...p.carbon_account_addon, registered_capital: v } }))
              }
            />
            <TextField
              label="Years in operation"
              labelZh="经营年限"
              isZh={isZh}
              value={data.carbon_account_addon.years_in_operation}
              onChange={(v) =>
                set((p) => ({ ...p, carbon_account_addon: { ...p.carbon_account_addon, years_in_operation: v } }))
              }
            />
            <TextArea
              label="Profitability summary (past 3 yrs)"
              labelZh="近三年盈利概况"
              isZh={isZh}
              value={data.carbon_account_addon.profitability_summary_past_3yrs}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  carbon_account_addon: { ...p.carbon_account_addon, profitability_summary_past_3yrs: v },
                }))
              }
            />
            <TextArea
              label="Existing financing liabilities"
              labelZh="存量融资负债总额"
              isZh={isZh}
              value={data.carbon_account_addon.existing_financing_liabilities_total}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  carbon_account_addon: { ...p.carbon_account_addon, existing_financing_liabilities_total: v },
                }))
              }
            />
            <TextArea
              label="Legal rep & management credit standing"
              labelZh="法人及管理层信用状况"
              isZh={isZh}
              value={data.carbon_account_addon.legal_rep_and_management_credit_standing}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  carbon_account_addon: { ...p.carbon_account_addon, legal_rep_and_management_credit_standing: v },
                }))
              }
            />
            <TextArea
              label="Material investment plans during loan term"
              labelZh="贷款期内重大投资计划"
              isZh={isZh}
              value={data.carbon_account_addon.material_investment_plans_during_loan_term}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  carbon_account_addon: { ...p.carbon_account_addon, material_investment_plans_during_loan_term: v },
                }))
              }
            />
            <TextField
              label="Proposed collateral / guarantee"
              labelZh="拟提供抵质押/担保方式"
              isZh={isZh}
              value={data.carbon_account_addon.proposed_collateral_guarantee_type}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  carbon_account_addon: { ...p.carbon_account_addon, proposed_collateral_guarantee_type: v },
                }))
              }
            />
            <TextArea
              label="Transition plan disclosed to lender"
              labelZh="已向贷款行披露的转型计划"
              isZh={isZh}
              value={data.carbon_account_addon.transition_plan_disclosed_to_lender}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  carbon_account_addon: { ...p.carbon_account_addon, transition_plan_disclosed_to_lender: v },
                }))
              }
            />
          </FieldGrid>
        )}
      </SectionBlock>

      <SectionBlock id="environment" title="Environmental benefit & reporting" titleZh="环境效益与报告" isZh={isZh}>
        <FieldGrid>
          <TextField
            label="Expected tCO2e reduction"
            labelZh="预计减排量"
            isZh={isZh}
            value={data.environmental_benefit_and_reporting.expected_realised_tco2e_reduction}
            onChange={(v) =>
              set((p) => ({
                ...p,
                environmental_benefit_and_reporting: {
                  ...p.environmental_benefit_and_reporting,
                  expected_realised_tco2e_reduction: v,
                },
              }))
            }
          />
          <TextField
            label="Expected energy savings"
            labelZh="预计节能量"
            isZh={isZh}
            value={data.environmental_benefit_and_reporting.expected_realised_energy_savings}
            onChange={(v) =>
              set((p) => ({
                ...p,
                environmental_benefit_and_reporting: {
                  ...p.environmental_benefit_and_reporting,
                  expected_realised_energy_savings: v,
                },
              }))
            }
          />
          <TextField
            label="Expected water savings"
            labelZh="预计节水量"
            isZh={isZh}
            value={data.environmental_benefit_and_reporting.expected_realised_water_savings}
            onChange={(v) =>
              set((p) => ({
                ...p,
                environmental_benefit_and_reporting: {
                  ...p.environmental_benefit_and_reporting,
                  expected_realised_water_savings: v,
                },
              }))
            }
          />
          <TextField
            label="Expected pollutant reduction"
            labelZh="预计污染物减排"
            isZh={isZh}
            value={data.environmental_benefit_and_reporting.expected_realised_pollutant_reduction}
            onChange={(v) =>
              set((p) => ({
                ...p,
                environmental_benefit_and_reporting: {
                  ...p.environmental_benefit_and_reporting,
                  expected_realised_pollutant_reduction: v,
                },
              }))
            }
          />
          <TextArea
            label="Methodology & assumptions"
            labelZh="方法学与假设披露"
            isZh={isZh}
            value={data.environmental_benefit_and_reporting.methodology_assumptions_disclosed}
            onChange={(v) =>
              set((p) => ({
                ...p,
                environmental_benefit_and_reporting: {
                  ...p.environmental_benefit_and_reporting,
                  methodology_assumptions_disclosed: v,
                },
              }))
            }
          />
          <TextArea
            label="Other notes"
            labelZh="其他说明"
            isZh={isZh}
            value={data.environmental_benefit_and_reporting.other_notes}
            onChange={(v) =>
              set((p) => ({
                ...p,
                environmental_benefit_and_reporting: { ...p.environmental_benefit_and_reporting, other_notes: v },
              }))
            }
          />
          <TextField
            label="Next report due date"
            labelZh="下次报告截止日"
            isZh={isZh}
            type="date"
            value={data.environmental_benefit_and_reporting.next_report_due_date}
            onChange={(v) =>
              set((p) => ({
                ...p,
                environmental_benefit_and_reporting: { ...p.environmental_benefit_and_reporting, next_report_due_date: v },
              }))
            }
          />
        </FieldGrid>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] font-mono text-muted-foreground mb-2">{isZh ? "报告频率" : "Reporting frequency"}</div>
            <CheckRow
              label="Annual"
              labelZh="年度"
              isZh={isZh}
              checked={data.environmental_benefit_and_reporting.reporting_frequency.annual}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  environmental_benefit_and_reporting: {
                    ...p.environmental_benefit_and_reporting,
                    reporting_frequency: { ...p.environmental_benefit_and_reporting.reporting_frequency, annual: v },
                  },
                }))
              }
            />
            <CheckRow
              label="Semi-annual"
              labelZh="半年度"
              isZh={isZh}
              checked={data.environmental_benefit_and_reporting.reporting_frequency.semi_annual}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  environmental_benefit_and_reporting: {
                    ...p.environmental_benefit_and_reporting,
                    reporting_frequency: {
                      ...p.environmental_benefit_and_reporting.reporting_frequency,
                      semi_annual: v,
                    },
                  },
                }))
              }
            />
            <TextField
              label="Other frequency"
              labelZh="其他频率"
              isZh={isZh}
              className="mt-2"
              value={data.environmental_benefit_and_reporting.reporting_frequency.other}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  environmental_benefit_and_reporting: {
                    ...p.environmental_benefit_and_reporting,
                    reporting_frequency: { ...p.environmental_benefit_and_reporting.reporting_frequency, other: v },
                  },
                }))
              }
            />
          </div>
          <div>
            <div className="text-[11px] font-mono text-muted-foreground mb-2">{isZh ? "报告对象" : "Report recipients"}</div>
            <CheckRow
              label="Lender"
              labelZh="贷款行"
              isZh={isZh}
              checked={data.environmental_benefit_and_reporting.report_recipients.lender}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  environmental_benefit_and_reporting: {
                    ...p.environmental_benefit_and_reporting,
                    report_recipients: { ...p.environmental_benefit_and_reporting.report_recipients, lender: v },
                  },
                }))
              }
            />
            <CheckRow
              label="Public disclosure"
              labelZh="公开披露"
              isZh={isZh}
              checked={data.environmental_benefit_and_reporting.report_recipients.public_disclosure}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  environmental_benefit_and_reporting: {
                    ...p.environmental_benefit_and_reporting,
                    report_recipients: {
                      ...p.environmental_benefit_and_reporting.report_recipients,
                      public_disclosure: v,
                    },
                  },
                }))
              }
            />
            <CheckRow
              label="Both"
              labelZh="两者"
              isZh={isZh}
              checked={data.environmental_benefit_and_reporting.report_recipients.both}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  environmental_benefit_and_reporting: {
                    ...p.environmental_benefit_and_reporting,
                    report_recipients: { ...p.environmental_benefit_and_reporting.report_recipients, both: v },
                  },
                }))
              }
            />
          </div>
        </div>
      </SectionBlock>

      <SectionBlock id="compliance" title="Compliance declaration" titleZh="合规声明" isZh={isZh}>
        <div className="grid sm:grid-cols-2 gap-1">
          {(
            [
              ["no_major_environmental_violation_3yrs", "No major environmental violation (3 yrs)", "近三年无重大环境违法"],
              ["no_safety_production_violation", "No safety production violation", "无安全生产违法"],
              ["not_on_phased_out_capacity_list", "Not on phased-out capacity list", "不在淘汰落后产能名单"],
              ["holds_valid_discharge_permit", "Holds valid discharge permit", "持有有效排污许可证"],
              ["has_ems_iso14001_or_equivalent", "EMS ISO 14001 or equivalent", "已建环境管理体系"],
              ["use_of_funds_maps_clearly_to_one_category", "Use of funds maps to one category", "资金用途对应单一目录类别"],
              ["meets_gzgfa_baseline_eligibility", "Meets GZGFA baseline eligibility", "符合广州绿金协会基本准入"],
            ] as const
          ).map(([key, en, zh]) => (
            <CheckRow
              key={key}
              label={en}
              labelZh={zh}
              isZh={isZh}
              checked={data.compliance_declaration[key]}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  compliance_declaration: { ...p.compliance_declaration, [key]: v },
                }))
              }
            />
          ))}
        </div>
      </SectionBlock>

      <SectionBlock id="glp" title="GLP alignment verification" titleZh="绿贷原则符合性验证" isZh={isZh}>
        <CheckRow
          label="Section applicable"
          labelZh="本节适用"
          isZh={isZh}
          checked={data.glp_alignment_verification.applicable}
          onChange={(v) =>
            set((p) => ({
              ...p,
              glp_alignment_verification: { ...p.glp_alignment_verification, applicable: v },
            }))
          }
        />
        {data.glp_alignment_verification.applicable && (
          <div className="space-y-3">
            <CheckRow
              label="External review selected"
              labelZh="第三方外部审查"
              isZh={isZh}
              checked={data.glp_alignment_verification.external_review.selected}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  glp_alignment_verification: {
                    ...p.glp_alignment_verification,
                    external_review: { ...p.glp_alignment_verification.external_review, selected: v },
                  },
                }))
              }
            />
            {data.glp_alignment_verification.external_review.selected && (
              <TextField
                label="Reviewer name"
                labelZh="审查机构名称"
                isZh={isZh}
                value={data.glp_alignment_verification.external_review.reviewer_name}
                onChange={(v) =>
                  set((p) => ({
                    ...p,
                    glp_alignment_verification: {
                      ...p.glp_alignment_verification,
                      external_review: { ...p.glp_alignment_verification.external_review, reviewer_name: v },
                    },
                  }))
                }
              />
            )}
            <CheckRow
              label="Self-certification selected"
              labelZh="自我认证"
              isZh={isZh}
              checked={data.glp_alignment_verification.self_certification.selected}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  glp_alignment_verification: {
                    ...p.glp_alignment_verification,
                    self_certification: { ...p.glp_alignment_verification.self_certification, selected: v },
                  },
                }))
              }
            />
            {data.glp_alignment_verification.self_certification.selected && (
              <TriToggle
                label="Documentation available to lenders"
                labelZh="可向贷款行提供佐证材料"
                isZh={isZh}
                value={data.glp_alignment_verification.self_certification.documentation_available_to_lenders}
                onChange={(v) =>
                  set((p) => ({
                    ...p,
                    glp_alignment_verification: {
                      ...p.glp_alignment_verification,
                      self_certification: {
                        ...p.glp_alignment_verification.self_certification,
                        documentation_available_to_lenders: v,
                      },
                    },
                  }))
                }
              />
            )}
            <CheckRow
              label="Not yet determined"
              labelZh="尚未确定"
              isZh={isZh}
              checked={data.glp_alignment_verification.not_yet_determined}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  glp_alignment_verification: { ...p.glp_alignment_verification, not_yet_determined: v },
                }))
              }
            />
          </div>
        )}
      </SectionBlock>

      <SectionBlock id="subsidy" title="Interest subsidy add-on" titleZh="贴息申请补充" isZh={isZh}>
        <CheckRow
          label="Applying for subsidy"
          labelZh="申请贴息"
          isZh={isZh}
          checked={data.interest_subsidy_addon.applying_for_subsidy}
          onChange={(v) =>
            set((p) => ({
              ...p,
              interest_subsidy_addon: { ...p.interest_subsidy_addon, applying_for_subsidy: v },
            }))
          }
        />
        {data.interest_subsidy_addon.applying_for_subsidy && (
          <FieldGrid>
            <TriToggle
              label="Contract/disbursement within policy period"
              labelZh="合同/放款在政策期内"
              isZh={isZh}
              value={data.interest_subsidy_addon.contract_disbursement_within_policy_period}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  interest_subsidy_addon: {
                    ...p.interest_subsidy_addon,
                    contract_disbursement_within_policy_period: v,
                  },
                }))
              }
            />
            <TextField
              label="Subsidy year"
              labelZh="贴息年度"
              isZh={isZh}
              value={data.interest_subsidy_addon.subsidy_year}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  interest_subsidy_addon: { ...p.interest_subsidy_addon, subsidy_year: v },
                }))
              }
            />
            <NumberField
              label="Interest paid this year (RMB)"
              labelZh="本年度已付利息（元）"
              isZh={isZh}
              value={data.interest_subsidy_addon.interest_paid_this_year_rmb}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  interest_subsidy_addon: { ...p.interest_subsidy_addon, interest_paid_this_year_rmb: v },
                }))
              }
            />
            <NumberField
              label="Total subsidy claimed this year (RMB)"
              labelZh="本年度已申请贴息（元）"
              isZh={isZh}
              value={data.interest_subsidy_addon.total_subsidy_claimed_this_year_rmb}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  interest_subsidy_addon: {
                    ...p.interest_subsidy_addon,
                    total_subsidy_claimed_this_year_rmb: v,
                  },
                }))
              }
            />
            <TriToggle
              label="Submitted within required window"
              labelZh="在规定窗口期内提交"
              isZh={isZh}
              value={data.interest_subsidy_addon.submitted_within_required_window}
              onChange={(v) =>
                set((p) => ({
                  ...p,
                  interest_subsidy_addon: { ...p.interest_subsidy_addon, submitted_within_required_window: v },
                }))
              }
            />
          </FieldGrid>
        )}
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
