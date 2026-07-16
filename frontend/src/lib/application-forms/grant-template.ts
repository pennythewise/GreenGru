/** Zero-carbon factory grant application — GB/T 36132 aligned template (editable). */
export type GrantApplicationForm = {
  factory_basic_information: {
    factory_name: string;
    factory_address: string;
    industry_code_nbs_4digit: string;
    main_products: string;
    ownership_type: {
      domestic_state_owned: boolean;
      domestic_collective: boolean;
      domestic_private: boolean;
      sino_foreign_joint_venture: boolean;
      hk_macau_taiwan_invested: boolean;
      wholly_foreign_owned: boolean;
    };
    unified_social_credit_code: string;
    legal_representative: string;
    legal_representative_phone: string;
    application_contact_person: string;
    contact_department: string;
    contact_phone: string;
    contact_email: string;
  };
  certification_level_applied_for: { national: boolean; provincial: boolean; municipal: boolean };
  basic_veto_requirements: {
    registered_in_china_manufacturing_gb_t4754: boolean;
    qms_gb_t19001_in_place: boolean;
    ohsms_gb_t45001_28001_in_place: boolean;
    ems_gb_t24001_in_place: boolean;
    energy_mgmt_system_gb_t23331_in_place: boolean;
    no_phased_out_banned_tech_process_equipment: boolean;
    dedicated_solid_waste_storage_and_dust_recovery: boolean;
    emissions_comply_with_control_and_permit_requirements: boolean;
    energy_metering_per_gb17167: boolean;
    no_major_environmental_incident_past_3yrs: boolean;
  };
  indicator_scoring_self_evaluation: {
    infrastructure: { weight_pct: number; self_score: number | null };
    management_system: { weight_pct: number; self_score: number | null };
    energy_resource_input: { weight_pct: number; self_score: number | null };
    product: { weight_pct: number; self_score: number | null };
    environmental_emissions: { weight_pct: number; self_score: number | null };
    performance: { weight_pct: number; self_score: number | null };
    total_score: number | null;
  };
  evaluation_method: {
    self_evaluation: boolean;
    third_party_evaluation: boolean;
    third_party_institution_name: string;
  };
  evaluation_report_outline_attached: {
    section1_overview: boolean;
    section2_evaluation_content: boolean;
    section3_evaluation_conclusion: boolean;
    section4_recommendations: boolean;
    section5_reference_documents: boolean;
    annex_onsite_supporting_materials_checklist: boolean;
  };
  declaration: { legal_rep_signature: string; date: string; company_seal_applied: boolean };
};

export const defaultGrantApplication = (): GrantApplicationForm => ({
  factory_basic_information: {
    factory_name: "",
    factory_address: "",
    industry_code_nbs_4digit: "",
    main_products: "",
    ownership_type: {
      domestic_state_owned: false,
      domestic_collective: false,
      domestic_private: false,
      sino_foreign_joint_venture: false,
      hk_macau_taiwan_invested: false,
      wholly_foreign_owned: false,
    },
    unified_social_credit_code: "",
    legal_representative: "",
    legal_representative_phone: "",
    application_contact_person: "",
    contact_department: "",
    contact_phone: "",
    contact_email: "",
  },
  certification_level_applied_for: { national: false, provincial: false, municipal: false },
  basic_veto_requirements: {
    registered_in_china_manufacturing_gb_t4754: false,
    qms_gb_t19001_in_place: false,
    ohsms_gb_t45001_28001_in_place: false,
    ems_gb_t24001_in_place: false,
    energy_mgmt_system_gb_t23331_in_place: false,
    no_phased_out_banned_tech_process_equipment: false,
    dedicated_solid_waste_storage_and_dust_recovery: false,
    emissions_comply_with_control_and_permit_requirements: false,
    energy_metering_per_gb17167: false,
    no_major_environmental_incident_past_3yrs: false,
  },
  indicator_scoring_self_evaluation: {
    infrastructure: { weight_pct: 20, self_score: null },
    management_system: { weight_pct: 15, self_score: null },
    energy_resource_input: { weight_pct: 15, self_score: null },
    product: { weight_pct: 10, self_score: null },
    environmental_emissions: { weight_pct: 10, self_score: null },
    performance: { weight_pct: 30, self_score: null },
    total_score: null,
  },
  evaluation_method: {
    self_evaluation: false,
    third_party_evaluation: false,
    third_party_institution_name: "",
  },
  evaluation_report_outline_attached: {
    section1_overview: false,
    section2_evaluation_content: false,
    section3_evaluation_conclusion: false,
    section4_recommendations: false,
    section5_reference_documents: false,
    annex_onsite_supporting_materials_checklist: false,
  },
  declaration: { legal_rep_signature: "", date: "", company_seal_applied: false },
});
