/** Green loan application — PBOC / GZGFA aligned template (editable). */
export type LoanApplicationForm = {
  company_information: {
    company_name: string;
    unified_social_credit_code: string;
    registered_address: string;
    industry_classification: string;
    legal_representative: string;
    contact_person_title: string;
    phone: string;
    email: string;
    enterprise_size: { large: boolean; medium: boolean; small: boolean; micro: boolean };
  };
  loan_project_information: {
    lender_applied_to: string;
    loan_type: {
      working_capital: boolean;
      fixed_asset: boolean;
      project_loan: boolean;
      tech_upgrade: boolean;
      other: string;
    };
    requested_amount_rmb: number | null;
    tenor: string;
    contract_signing_date: string;
    disbursement_date: string;
    project_name: string;
    project_description: string;
    refinancing: {
      includes_refinancing_portion: boolean | null;
      estimated_financing_vs_refinancing_share: string;
      look_back_period_for_refinanced_projects: string;
    };
    management_of_proceeds: {
      method: { dedicated_account: boolean; internal_tracking_ledger: boolean; other: string };
      temporary_placement_arrangement_for_unallocated_proceeds: string;
      is_one_tranche_of_multi_tranche_facility: boolean | null;
      tranche_separately_labelled_green_and_tracked: boolean | null;
    };
  };
  use_of_funds_category: {
    selected_category_number: number | null;
    categories: {
      number: number;
      name_cn: string;
      name_en: string;
      selected: boolean;
    }[];
    glp_evaluation_and_selection_process: {
      environmental_sustainability_objectives: string;
      taxonomy_or_process_used_for_eligibility: string;
      exclusion_criteria: string;
      environmental_social_risk_identification_process: string;
      material_risks_identified_and_mitigants: string;
    };
  };
  carbon_account_addon: {
    applicable: boolean;
    enterprise_carbon_account_opened: boolean | null;
    carbon_account_platform_name: string;
    authorised_platform_to_issue_carbon_credit_report_to_lender: boolean | null;
    latest_carbon_emission_performance_rating: string;
    registered_capital: string;
    years_in_operation: string;
    profitability_summary_past_3yrs: string;
    existing_financing_liabilities_total: string;
    legal_rep_and_management_credit_standing: string;
    material_investment_plans_during_loan_term: string;
    proposed_collateral_guarantee_type: string;
    transition_plan_disclosed_to_lender: string;
  };
  environmental_benefit_and_reporting: {
    expected_realised_tco2e_reduction: string;
    expected_realised_energy_savings: string;
    expected_realised_water_savings: string;
    expected_realised_pollutant_reduction: string;
    other_notes: string;
    methodology_assumptions_disclosed: string;
    reporting_frequency: { annual: boolean; semi_annual: boolean; other: string };
    reports_renewed_until: { loan_fully_allocated: boolean; loan_maturity_revolving_facility: boolean };
    next_report_due_date: string;
    report_recipients: { lender: boolean; public_disclosure: boolean; both: boolean };
  };
  compliance_declaration: {
    no_major_environmental_violation_3yrs: boolean;
    no_safety_production_violation: boolean;
    not_on_phased_out_capacity_list: boolean;
    holds_valid_discharge_permit: boolean;
    has_ems_iso14001_or_equivalent: boolean;
    use_of_funds_maps_clearly_to_one_category: boolean;
    meets_gzgfa_baseline_eligibility: boolean;
  };
  glp_alignment_verification: {
    applicable: boolean;
    external_review: { selected: boolean; reviewer_name: string };
    self_certification: { selected: boolean; documentation_available_to_lenders: boolean | null };
    not_yet_determined: boolean;
  };
  interest_subsidy_addon: {
    applying_for_subsidy: boolean;
    contract_disbursement_within_policy_period: boolean | null;
    subsidy_year: string;
    interest_paid_this_year_rmb: number | null;
    total_subsidy_claimed_this_year_rmb: number | null;
    submitted_within_required_window: boolean | null;
  };
  declaration: { legal_rep_signature: string; date: string; company_seal_applied: boolean };
};

export const defaultLoanApplication = (): LoanApplicationForm => ({
  company_information: {
    company_name: "",
    unified_social_credit_code: "",
    registered_address: "",
    industry_classification: "黑色金属冶炼和压延加工业 — 炼铁/炼钢/铁合金冶炼",
    legal_representative: "",
    contact_person_title: "",
    phone: "",
    email: "",
    enterprise_size: { large: false, medium: false, small: false, micro: false },
  },
  loan_project_information: {
    lender_applied_to: "",
    loan_type: {
      working_capital: false,
      fixed_asset: false,
      project_loan: false,
      tech_upgrade: false,
      other: "",
    },
    requested_amount_rmb: null,
    tenor: "",
    contract_signing_date: "",
    disbursement_date: "",
    project_name: "",
    project_description: "",
    refinancing: {
      includes_refinancing_portion: null,
      estimated_financing_vs_refinancing_share: "",
      look_back_period_for_refinanced_projects: "",
    },
    management_of_proceeds: {
      method: { dedicated_account: false, internal_tracking_ledger: false, other: "" },
      temporary_placement_arrangement_for_unallocated_proceeds: "",
      is_one_tranche_of_multi_tranche_facility: null,
      tranche_separately_labelled_green_and_tracked: null,
    },
  },
  use_of_funds_category: {
    selected_category_number: null,
    categories: [
      { number: 1, name_cn: "绿色农业开发", name_en: "Green agriculture development", selected: false },
      { number: 2, name_cn: "绿色林业开发", name_en: "Green forestry development", selected: false },
      { number: 3, name_cn: "工业节能节水环保", name_en: "Industrial energy/water-saving & environmental protection", selected: false },
      { number: 4, name_cn: "自然保护、生态修复及灾害防控", name_en: "Nature protection & ecological restoration", selected: false },
      { number: 5, name_cn: "资源循环利用", name_en: "Resource recycling", selected: false },
      { number: 6, name_cn: "垃圾处理及污染防治", name_en: "Waste treatment & pollution control", selected: false },
      { number: 7, name_cn: "可再生能源及清洁能源", name_en: "Renewable & clean energy", selected: false },
      { number: 8, name_cn: "农村及城市水", name_en: "Rural & urban water", selected: false },
      { number: 9, name_cn: "建筑节能及绿色建筑", name_en: "Building energy efficiency & green building", selected: false },
      { number: 10, name_cn: "绿色交通运输", name_en: "Green transport", selected: false },
      { number: 11, name_cn: "节能环保服务", name_en: "Energy-saving & environmental services", selected: false },
      { number: 12, name_cn: "境外项目（国际标准）", name_en: "Overseas projects (international standards)", selected: false },
    ],
    glp_evaluation_and_selection_process: {
      environmental_sustainability_objectives: "",
      taxonomy_or_process_used_for_eligibility: "PBOC 绿色金融支持项目目录 (2025) and/or T/CISA 452-2024, as applicable",
      exclusion_criteria: "",
      environmental_social_risk_identification_process: "",
      material_risks_identified_and_mitigants: "",
    },
  },
  carbon_account_addon: {
    applicable: false,
    enterprise_carbon_account_opened: null,
    carbon_account_platform_name: "",
    authorised_platform_to_issue_carbon_credit_report_to_lender: null,
    latest_carbon_emission_performance_rating: "",
    registered_capital: "",
    years_in_operation: "",
    profitability_summary_past_3yrs: "",
    existing_financing_liabilities_total: "",
    legal_rep_and_management_credit_standing: "",
    material_investment_plans_during_loan_term: "",
    proposed_collateral_guarantee_type: "",
    transition_plan_disclosed_to_lender: "",
  },
  environmental_benefit_and_reporting: {
    expected_realised_tco2e_reduction: "",
    expected_realised_energy_savings: "",
    expected_realised_water_savings: "",
    expected_realised_pollutant_reduction: "",
    other_notes: "",
    methodology_assumptions_disclosed: "",
    reporting_frequency: { annual: false, semi_annual: false, other: "" },
    reports_renewed_until: { loan_fully_allocated: false, loan_maturity_revolving_facility: false },
    next_report_due_date: "",
    report_recipients: { lender: false, public_disclosure: false, both: false },
  },
  compliance_declaration: {
    no_major_environmental_violation_3yrs: false,
    no_safety_production_violation: false,
    not_on_phased_out_capacity_list: false,
    holds_valid_discharge_permit: false,
    has_ems_iso14001_or_equivalent: false,
    use_of_funds_maps_clearly_to_one_category: false,
    meets_gzgfa_baseline_eligibility: false,
  },
  glp_alignment_verification: {
    applicable: false,
    external_review: { selected: false, reviewer_name: "" },
    self_certification: { selected: false, documentation_available_to_lenders: null },
    not_yet_determined: false,
  },
  interest_subsidy_addon: {
    applying_for_subsidy: false,
    contract_disbursement_within_policy_period: null,
    subsidy_year: "",
    interest_paid_this_year_rmb: null,
    total_subsidy_claimed_this_year_rmb: null,
    submitted_within_required_window: null,
  },
  declaration: { legal_rep_signature: "", date: "", company_seal_applied: false },
});
