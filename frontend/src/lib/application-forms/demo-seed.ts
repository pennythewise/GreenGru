/** Hackathon demo — pre-filled loan / grant application forms for pipeline runs. */
import { defaultGrantApplication, type GrantApplicationForm } from "@/lib/application-forms/grant-template";
import { defaultLoanApplication, type LoanApplicationForm } from "@/lib/application-forms/loan-template";

export function demoLoanApplication(): LoanApplicationForm {
  const base = defaultLoanApplication();
  return {
    ...base,
    company_information: {
      ...base.company_information,
      company_name: "宁波绿格紧固件有限公司",
      unified_social_credit_code: "91330200MA2ABCDEFG",
      registered_address: "浙江省宁波市北仑区临港工业区绿格路 18 号",
      legal_representative: "王建华",
      contact_person_title: "财务总监",
      phone: "0574-8888-6600",
      email: "finance@lvge-fastener.cn",
      enterprise_size: { large: false, medium: false, small: true, micro: false },
    },
    loan_project_information: {
      ...base.loan_project_information,
      lender_applied_to: "中国工商银行宁波分行 · 绿色专营支行",
      loan_type: {
        working_capital: false,
        fixed_asset: false,
        project_loan: false,
        tech_upgrade: true,
        other: "",
      },
      requested_amount_rmb: 8_500_000,
      tenor: "36 months",
      project_name: "废钢比提升与绿色电力采购技改",
      project_description:
        "数控切割线余热回收、焊接工序计量补点，以及绿电 PPA 采购，降低单位产品 tCO₂e 并支撑 CBAM 报告。",
      management_of_proceeds: {
        method: { dedicated_account: true, internal_tracking_ledger: true, other: "" },
        temporary_placement_arrangement_for_unallocated_proceeds: "闲置资金仅存入本行活期专户",
        is_one_tranche_of_multi_tranche_facility: false,
        tranche_separately_labelled_green_and_tracked: true,
      },
    },
    use_of_funds_category: {
      ...base.use_of_funds_category,
      selected_category_number: 3,
      categories: base.use_of_funds_category.categories.map((c) => ({
        ...c,
        selected: c.number === 3,
      })),
      glp_evaluation_and_selection_process: {
        ...base.use_of_funds_category.glp_evaluation_and_selection_process,
        environmental_sustainability_objectives: "降低单位产品隐含排放；提升废钢比与绿电占比",
        exclusion_criteria: "不涉及产能扩张；不投向淘汰类工艺",
        environmental_social_risk_identification_process: "内部 ESG 清单 + 银行绿色信贷尽调",
        material_risks_identified_and_mitigants: "计量缺口 — 计划补装分表；绿电交付 — 多年 PPA",
      },
    },
    environmental_benefit_and_reporting: {
      ...base.environmental_benefit_and_reporting,
      expected_realised_tco2e_reduction: "约 1,200 tCO₂e / 年",
      expected_realised_energy_savings: "约 180 万 kWh / 年",
      methodology_assumptions_disclosed: "对标 GB/T 36132 与厂内排放台账",
      reporting_frequency: { annual: true, semi_annual: false, other: "" },
      report_recipients: { lender: true, public_disclosure: false, both: false },
    },
    compliance_declaration: {
      no_major_environmental_violation_3yrs: true,
      no_safety_production_violation: true,
      not_on_phased_out_capacity_list: true,
      holds_valid_discharge_permit: true,
      has_ems_iso14001_or_equivalent: true,
      use_of_funds_maps_clearly_to_one_category: true,
      meets_gzgfa_baseline_eligibility: true,
    },
    declaration: {
      legal_rep_signature: "王建华",
      date: "2026-03-01",
      company_seal_applied: true,
    },
  };
}

export function demoGrantApplication(): GrantApplicationForm {
  const base = defaultGrantApplication();
  return {
    ...base,
    factory_basic_information: {
      factory_name: "宁波绿格紧固件有限公司 · 北仑工厂",
      factory_address: "浙江省宁波市北仑区临港工业区绿格路 18 号",
      industry_code_nbs_4digit: "C3340",
      main_products: "紧固件、结构件（CN 7318 15 88）",
      ownership_type: {
        domestic_state_owned: false,
        domestic_collective: false,
        domestic_private: true,
        sino_foreign_joint_venture: false,
        hk_macau_taiwan_invested: false,
        wholly_foreign_owned: false,
      },
      unified_social_credit_code: "91330200MA2ABCDEFG",
      legal_representative: "王建华",
      legal_representative_phone: "0574-8888-6601",
      application_contact_person: "李敏",
      contact_department: "安环部",
      contact_phone: "0574-8888-6618",
      contact_email: "ehs@lvge-fastener.cn",
    },
    certification_level_applied_for: { national: false, provincial: true, municipal: false },
    basic_veto_requirements: {
      registered_in_china_manufacturing_gb_t4754: true,
      qms_gb_t19001_in_place: true,
      ohsms_gb_t45001_28001_in_place: true,
      ems_gb_t24001_in_place: true,
      energy_mgmt_system_gb_t23331_in_place: true,
      no_phased_out_banned_tech_process_equipment: true,
      dedicated_solid_waste_storage_and_dust_recovery: true,
      emissions_comply_with_control_and_permit_requirements: true,
      energy_metering_per_gb17167: true,
      no_major_environmental_incident_past_3yrs: true,
    },
    indicator_scoring_self_evaluation: {
      infrastructure: { weight_pct: 20, self_score: 16 },
      management_system: { weight_pct: 15, self_score: 13 },
      energy_resource_input: { weight_pct: 15, self_score: 11 },
      product: { weight_pct: 10, self_score: 8 },
      environmental_emissions: { weight_pct: 10, self_score: 8 },
      performance: { weight_pct: 30, self_score: 22 },
      total_score: 78,
    },
    evaluation_method: {
      self_evaluation: true,
      third_party_evaluation: true,
      third_party_institution_name: "浙江绿色工厂评价中心",
    },
    evaluation_report_outline_attached: {
      section1_overview: true,
      section2_evaluation_content: true,
      section3_evaluation_conclusion: true,
      section4_recommendations: true,
      section5_reference_documents: true,
      annex_onsite_supporting_materials_checklist: true,
    },
    declaration: {
      legal_rep_signature: "王建华",
      date: "2026-03-01",
      company_seal_applied: true,
    },
  };
}

/** Persist demo loan/grant form when localStorage is empty or nearly blank. */
export function ensureDemoApplicationForm(slug: "loan" | "grant"): void {
  if (typeof window === "undefined") return;
  const key = `greengru-application-${slug}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const vals = Object.values(parsed);
      const filled = vals.filter((v) => {
        if (v === null || v === undefined) return false;
        if (typeof v === "boolean") return v;
        if (typeof v === "number") return !Number.isNaN(v);
        if (typeof v === "string") return v.trim().length > 0;
        if (typeof v === "object") return Object.values(v as object).some(Boolean);
        return false;
      }).length;
      if (vals.length > 0 && filled / vals.length >= 0.12) return;
    }
    const demo = slug === "loan" ? demoLoanApplication() : demoGrantApplication();
    localStorage.setItem(key, JSON.stringify(demo));
  } catch {
    /* ignore */
  }
}
