/**
 * EU CBAM Communication Template — workbook field schema.
 * Mirrors Commission Excel layout: Summary_Process → A_InstData → c_CodeLists.
 * Evaluation criteria only; regulated numbers still come from calculation_engine.
 */

export type CbamFieldType = "text" | "number" | "date" | "textarea" | "code" | "percent";

export type CbamField = {
  key: string;
  labelEn: string;
  labelZh: string;
  type: CbamFieldType;
  unit?: string;
  required?: boolean;
  /** Steel-downstream MVP — hide sector-specific rows when not applicable */
  appliesTo?: "all" | "steel" | "fertilizer" | "cement" | "aluminium";
};

export type CbamSection = {
  id: string;
  titleEn: string;
  titleZh: string;
  noteEn?: string;
  noteZh?: string;
  fields: CbamField[];
};

export type CbamSubSheet = {
  id: string;
  titleEn: string;
  titleZh: string;
  sections: CbamSection[];
};

export type CbamWorkbookDoc = {
  id: "summary_process" | "a_inst_data" | "c_code_lists";
  sheetName: string;
  titleEn: string;
  titleZh: string;
  descriptionEn: string;
  descriptionZh: string;
  order: number;
  subSheets?: CbamSubSheet[];
  sections?: CbamSection[];
};

const INSTALLATION_FIELDS: CbamField[] = [
  { key: "installation_name_en", labelEn: "Name of the installation (English name)", labelZh: "装置名称（英文）", type: "text", required: true },
  { key: "street_number", labelEn: "Street, Number", labelZh: "街道、门牌号", type: "text", required: true },
  { key: "economic_activity", labelEn: "Economic activity", labelZh: "经济活动", type: "text", required: true },
  { key: "country", labelEn: "Country", labelZh: "国家", type: "code", required: true },
  { key: "unlocode", labelEn: "UNLOCODE", labelZh: "联合国贸易地点代码", type: "code" },
  { key: "latitude", labelEn: "Coordinates — latitude", labelZh: "坐标 — 纬度", type: "number" },
  { key: "longitude", labelEn: "Coordinates — longitude", labelZh: "坐标 — 经度", type: "number" },
  { key: "reporting_period_start", labelEn: "Reporting period start", labelZh: "报告期起始", type: "date", required: true },
  { key: "reporting_period_end", labelEn: "Reporting period end", labelZh: "报告期截止", type: "date", required: true },
];

const PRODUCT_SEE_FIELDS: CbamField[] = [
  { key: "production_process", labelEn: "Production process from which the products arise", labelZh: "产品所属生产工序", type: "text", required: true },
  { key: "aggregated_good_type", labelEn: "Type of aggregated good or precursor", labelZh: "汇总货物或前体类型", type: "text", required: true },
  { key: "cn_code", labelEn: "CN code", labelZh: "CN 税则号", type: "code", required: true },
  { key: "cn_name", labelEn: "CN name", labelZh: "CN 名称", type: "text" },
  { key: "product_name", labelEn: "Product name (as on invoices to declarant)", labelZh: "产品名称（与申报人发票一致）", type: "text", required: true },
  { key: "see_direct", labelEn: "SEE (direct)", labelZh: "特定隐含排放（直接）", type: "number", unit: "tCO2e/t", required: true },
  { key: "see_indirect", labelEn: "SEE (indirect)", labelZh: "特定隐含排放（间接）", type: "number", unit: "tCO2e/t" },
  { key: "see_total", labelEn: "SEE (total)", labelZh: "特定隐含排放（合计）", type: "number", unit: "tCO2e/t", required: true },
  { key: "unit", labelEn: "Unit", labelZh: "单位", type: "text", required: true },
  { key: "share_default_values", labelEn: "Share of emissions by default value", labelZh: "默认值排放占比", type: "percent" },
  { key: "electricity_ef_source", labelEn: "Source for electricity EF", labelZh: "电力排放因子来源", type: "text" },
  { key: "embedded_electricity", labelEn: "Embedded electricity", labelZh: "隐含电力", type: "number", unit: "MWh/t" },
  { key: "electricity_ef", labelEn: "Electricity EF", labelZh: "电力排放因子", type: "number", unit: "tCO2/MWh" },
];

const STEEL_PRODUCT_FIELDS: CbamField[] = [
  { key: "reducing_agent", labelEn: "Main reducing agent of the precursor, if known", labelZh: "前体主要还原剂（如已知）", type: "text", appliesTo: "steel" },
  { key: "steel_mill_id", labelEn: "Steel mill identification number", labelZh: "钢厂识别号", type: "text", appliesTo: "steel" },
  { key: "pct_mn", labelEn: "% Mn", labelZh: "% 锰", type: "percent", appliesTo: "steel" },
  { key: "pct_cr", labelEn: "% Cr", labelZh: "% 铬", type: "percent", appliesTo: "steel" },
  { key: "pct_ni", labelEn: "% Ni", labelZh: "% 镍", type: "percent", appliesTo: "steel" },
  { key: "pct_other_alloys", labelEn: "% other alloys", labelZh: "% 其他合金", type: "percent", appliesTo: "steel" },
  { key: "pct_carbon", labelEn: "% carbon", labelZh: "% 碳", type: "percent", appliesTo: "steel" },
  { key: "scrap_per_t_steel", labelEn: "t scrap per t steel", labelZh: "吨废钢/吨钢", type: "number", appliesTo: "steel" },
  { key: "pct_other_materials", labelEn: "% other materials", labelZh: "% 其他材料", type: "percent", appliesTo: "steel" },
  { key: "pct_pre_consumer_scrap", labelEn: "% pre-consumer scrap", labelZh: "% 消费前废钢", type: "percent", appliesTo: "steel" },
];

const EMISSIONS_METHODOLOGY_FIELDS: CbamField[] = [
  { key: "calc_based_excl_pfc", labelEn: "Calculation-based (excl. PFC emissions)", labelZh: "计算法（不含 PFC）", type: "number", unit: "tCO2e" },
  { key: "total_pfc", labelEn: "Total PFC emissions", labelZh: "PFC 排放合计", type: "number", unit: "tCO2e" },
  { key: "measurement_based", labelEn: "Measurement-based", labelZh: "测量法", type: "number", unit: "tCO2e" },
  { key: "other_methodology", labelEn: "Other", labelZh: "其他", type: "number", unit: "tCO2e" },
  { key: "total_direct", labelEn: "Total direct emissions during reporting period", labelZh: "报告期内直接排放合计", type: "number", unit: "tCO2e", required: true },
  { key: "total_indirect", labelEn: "Total indirect emissions during reporting period", labelZh: "报告期内间接排放合计", type: "number", unit: "tCO2e" },
  { key: "total_emissions", labelEn: "Total emissions during reporting period", labelZh: "报告期内排放合计", type: "number", unit: "tCO2e", required: true },
  { key: "data_quality_info", labelEn: "General information on data quality", labelZh: "数据质量总体说明", type: "textarea" },
  { key: "default_value_justification", labelEn: "Justification for use of default values (if relevant)", labelZh: "使用默认值的理由（如适用）", type: "textarea" },
  { key: "quality_assurance_info", labelEn: "Information on quality assurance", labelZh: "质量保证信息", type: "textarea" },
];

const FURTHER_INFO_FIELDS: CbamField[] = [
  { key: "carbon_price_instrument", labelEn: "Carbon price instrument", labelZh: "碳价工具", type: "textarea" },
  { key: "additional_information", labelEn: "Any additional information", labelZh: "其他补充信息", type: "textarea" },
];

const CARBON_PRICE_REBATE_FIELDS: CbamField[] = [
  { key: "cp_instrument_type", labelEn: "Type of instrument (carbon pricing)", labelZh: "工具类型（碳定价）", type: "text" },
  { key: "total_embedded_covered_cp", labelEn: "Total embedded emissions covered by the carbon price", labelZh: "碳价覆盖的隐含排放总量", type: "number", unit: "tCO2e" },
  { key: "embedded_covered_cp", labelEn: "Embedded emissions covered by the carbon price", labelZh: "碳价覆盖的隐含排放", type: "number", unit: "tCO2e/t" },
  { key: "currency", labelEn: "Currency", labelZh: "货币", type: "code" },
  { key: "carbon_price_due", labelEn: "Carbon price (CP) due (per produced t or MWh)", labelZh: "应付碳价（每吨或每 MWh）", type: "number" },
  { key: "rebate_type", labelEn: "Type of rebate", labelZh: "补贴类型", type: "text" },
  { key: "share_covered_rebate", labelEn: "Share of embedded emissions covered by the rebate", labelZh: "补贴覆盖的隐含排放占比", type: "percent" },
  { key: "embedded_covered_rebate", labelEn: "Embedded emissions covered by rebate", labelZh: "补贴覆盖的隐含排放", type: "number", unit: "tCO2e/t" },
  { key: "rebate_amount", labelEn: "Amount of rebate (per produced t or MWh)", labelZh: "补贴金额（每吨或每 MWh）", type: "number" },
  { key: "effective_cp_due", labelEn: "Result: Effective CP due (per produced t or MWh)", labelZh: "结果：有效应付碳价", type: "number" },
];

export const CBAM_WORKBOOK_DOCS: CbamWorkbookDoc[] = [
  {
    id: "summary_process",
    sheetName: "Summary_Process",
    order: 1,
    titleEn: "Summary_Process",
    titleZh: "汇总工序",
    descriptionEn:
      "Commission communication template — summarizes installation, production routes, products, and emissions for the EU declarant. Fill Summary_Communication, Summary_Processes, and Summary_Products.",
    descriptionZh:
      "欧盟委员会沟通模板 — 向欧盟申报人汇总装置、生产路线、产品与排放。须填写 Summary_Communication、Summary_Processes、Summary_Products。",
    subSheets: [
      {
        id: "summary_communication",
        titleEn: "Summary_Communication",
        titleZh: "汇总沟通",
        sections: [
          {
            id: "inst_summary",
            titleEn: "1 · Summary of the installation",
            titleZh: "1 · 装置摘要",
            fields: INSTALLATION_FIELDS,
          },
          {
            id: "routes_matrix",
            titleEn: "2 · Summary of production processes and routes",
            titleZh: "2 · 生产工序与路线摘要",
            noteEn: "Map aggregated goods (G1–G10) to production routes (Route 1–6).",
            noteZh: "将汇总货物（G1–G10）映射至生产路线（Route 1–6）。",
            fields: [
              { key: "goods_routes_matrix", labelEn: "Aggregated goods × routes matrix", labelZh: "汇总货物 × 路线矩阵", type: "textarea", required: true },
              { key: "process_goods_matrix", labelEn: "Production process (P1–P10) × goods categories", labelZh: "生产工序（P1–P10）× 货物类别", type: "textarea", required: true },
            ],
          },
          {
            id: "products_summary",
            titleEn: "2 · Summary of products",
            titleZh: "2 · 产品摘要",
            fields: [...PRODUCT_SEE_FIELDS, ...STEEL_PRODUCT_FIELDS],
          },
          {
            id: "emissions_methodology",
            titleEn: "3 · Summary of emissions by monitoring methodology and data quality",
            titleZh: "3 · 按监测方法与数据质量的排放摘要",
            fields: EMISSIONS_METHODOLOGY_FIELDS,
          },
          {
            id: "further_info",
            titleEn: "4 · Further information",
            titleZh: "4 · 补充信息",
            fields: [...FURTHER_INFO_FIELDS, ...CARBON_PRICE_REBATE_FIELDS],
          },
        ],
      },
      {
        id: "summary_processes",
        titleEn: "Summary_Processes",
        titleZh: "汇总工序明细",
        sections: [
          {
            id: "process_boundaries",
            titleEn: "Relevant production processes (P1–P10)",
            titleZh: "相关生产工序（P1–P10）",
            noteEn: "List aggregated goods categories requiring distinct production processes and system boundaries.",
            noteZh: "列出需建立独立生产工序与系统边界的汇总货物类别。",
            fields: [
              { key: "process_id", labelEn: "Process ID (P1–P10)", labelZh: "工序编号（P1–P10）", type: "code", required: true },
              { key: "aggregated_goods_category", labelEn: "Aggregated goods category", labelZh: "汇总货物类别", type: "text", required: true },
              { key: "included_goods_1_6", labelEn: "Included goods categories listed under (a) — slots 1–6", labelZh: "所含货物类别（a）— 1–6 位", type: "textarea", required: true },
              { key: "process_name", labelEn: "Name", labelZh: "名称", type: "text", required: true },
            ],
          },
          {
            id: "completeness",
            titleEn: "Completeness check",
            titleZh: "完整性检查",
            fields: [
              { key: "completeness_status", labelEn: "Completeness check result", labelZh: "完整性检查结果", type: "text" },
            ],
          },
        ],
      },
      {
        id: "summary_products",
        titleEn: "Summary_Products",
        titleZh: "汇总产品明细",
        sections: [
          {
            id: "product_rows",
            titleEn: "Product-level embedded emissions",
            titleZh: "产品级隐含排放",
            fields: PRODUCT_SEE_FIELDS,
          },
          {
            id: "steel_params",
            titleEn: "Steel-specific parameters (if applicable)",
            titleZh: "钢铁专用参数（如适用）",
            fields: STEEL_PRODUCT_FIELDS,
          },
        ],
      },
    ],
  },
  {
    id: "a_inst_data",
    sheetName: "A_InstData",
    order: 2,
    titleEn: "A_InstData",
    titleZh: "装置数据",
    descriptionEn:
      "General information, production processes, and purchased precursors for the installation — follows Summary_Process.",
    descriptionZh: "装置一般信息、生产工序与购入前体 — 在 Summary_Process 之后填写。",
    sections: [
      {
        id: "reporting_period",
        titleEn: "1 · Reporting period",
        titleZh: "1 · 报告期",
        noteEn: "All emissions and activity data in the workbook must relate to this period.",
        noteZh: "工作簿中所有排放与活动数据均须对应此期间。",
        fields: [
          { key: "period_start", labelEn: "Start", labelZh: "起始", type: "date", required: true },
          { key: "period_end", labelEn: "End", labelZh: "截止", type: "date", required: true },
        ],
      },
      {
        id: "about_installation",
        titleEn: "2 · About the installation",
        titleZh: "2 · 装置信息",
        fields: [
          { key: "installation_name_optional", labelEn: "Name of the installation (optional)", labelZh: "装置名称（可选）", type: "text" },
          { key: "installation_name_en", labelEn: "Name of the installation (English name)", labelZh: "装置名称（英文）", type: "text", required: true },
          { key: "street_number", labelEn: "Street, Number", labelZh: "街道、门牌号", type: "text", required: true },
          { key: "economic_activity", labelEn: "Economic activity", labelZh: "经济活动", type: "text", required: true },
          { key: "post_code", labelEn: "Post code", labelZh: "邮编", type: "text" },
          { key: "po_box", labelEn: "P.O. Box", labelZh: "邮政信箱", type: "text" },
          { key: "city", labelEn: "City", labelZh: "城市", type: "text", required: true },
          { key: "country", labelEn: "Country", labelZh: "国家", type: "code", required: true },
          { key: "unlocode", labelEn: "UNLOCODE", labelZh: "联合国贸易地点代码", type: "code" },
          { key: "latitude", labelEn: "Coordinates — latitude", labelZh: "坐标 — 纬度", type: "number" },
          { key: "longitude", labelEn: "Coordinates — longitude", labelZh: "坐标 — 经度", type: "number" },
          { key: "authorized_rep_name", labelEn: "Name of authorized representative", labelZh: "授权代表姓名", type: "text" },
          { key: "authorized_rep_email", labelEn: "Email", labelZh: "邮箱", type: "text" },
          { key: "authorized_rep_telephone", labelEn: "Telephone", labelZh: "电话", type: "text" },
        ],
      },
      {
        id: "verifier",
        titleEn: "3 · Verifier of the report (if available)",
        titleZh: "3 · 报告核查机构（如有）",
        noteEn: "Not required during transitional period.",
        noteZh: "过渡期内非必填。",
        fields: [
          { key: "verifier_company", labelEn: "Company name", labelZh: "公司名称", type: "text" },
          { key: "verifier_street", labelEn: "Street, Number", labelZh: "街道、门牌号", type: "text" },
          { key: "verifier_city", labelEn: "City", labelZh: "城市", type: "text" },
          { key: "verifier_postcode", labelEn: "Postcode / ZIP", labelZh: "邮编", type: "text" },
          { key: "verifier_country", labelEn: "Country", labelZh: "国家", type: "code" },
          { key: "verifier_rep_name", labelEn: "Authorised representative — name", labelZh: "授权代表 — 姓名", type: "text" },
          { key: "verifier_rep_email", labelEn: "Email address", labelZh: "邮箱", type: "text" },
          { key: "verifier_rep_telephone", labelEn: "Telephone number", labelZh: "电话", type: "text" },
          { key: "verifier_accreditation_state", labelEn: "Accreditation member state", labelZh: "认可成员国", type: "code" },
          { key: "verifier_accreditation_body", labelEn: "National accreditation body", labelZh: "国家认可机构", type: "text" },
          { key: "verifier_registration_number", labelEn: "Registration number", labelZh: "注册号", type: "text" },
        ],
      },
      {
        id: "aggregated_goods",
        titleEn: "4 · Aggregated goods categories and production processes",
        titleZh: "4 · 汇总货物类别与生产工序",
        fields: [
          { key: "goods_id", labelEn: "ID (G1–G10)", labelZh: "编号（G1–G10）", type: "code", required: true },
          { key: "aggregated_goods_category", labelEn: "Aggregated goods category", labelZh: "汇总货物类别", type: "text", required: true },
          { key: "route_1", labelEn: "Route 1", labelZh: "路线 1", type: "text", required: true },
          { key: "routes_2_6", labelEn: "Routes 2–6 (if applicable)", labelZh: "路线 2–6（如适用）", type: "textarea" },
          { key: "relevant_precursors", labelEn: "Relevant precursors", labelZh: "相关前体", type: "textarea" },
        ],
      },
      {
        id: "production_processes",
        titleEn: "4(b) · Relevant production processes (P1–P10)",
        titleZh: "4(b) · 相关生产工序（P1–P10）",
        fields: [
          { key: "process_id", labelEn: "ID (P1–P10)", labelZh: "编号（P1–P10）", type: "code", required: true },
          { key: "process_aggregated_category", labelEn: "Aggregated goods category", labelZh: "汇总货物类别", type: "text", required: true },
          { key: "included_goods_slots", labelEn: "Included goods categories (slots 1–6)", labelZh: "所含货物类别（1–6 位）", type: "textarea", required: true },
          { key: "process_name", labelEn: "Name", labelZh: "名称", type: "text", required: true },
        ],
      },
      {
        id: "purchased_precursors",
        titleEn: "Purchased precursors (PP1–PP20)",
        titleZh: "购入前体（PP1–PP20）",
        noteEn: "Precursors produced outside the installation — use c_CodeLists for country codes.",
        noteZh: "装置外生产的前体 — 国家代码见 c_CodeLists。",
        fields: [
          { key: "precursor_id", labelEn: "ID (PP1–PP20)", labelZh: "编号（PP1–PP20）", type: "code" },
          { key: "precursor_process", labelEn: "Production process", labelZh: "生产工序", type: "text" },
          { key: "precursor_country_code", labelEn: "Country code", labelZh: "国家代码", type: "code" },
          { key: "precursor_route_1", labelEn: "Route 1", labelZh: "路线 1", type: "text" },
          { key: "precursor_routes_2_5", labelEn: "Routes 2–5", labelZh: "路线 2–5", type: "textarea" },
          { key: "precursor_name", labelEn: "Name", labelZh: "名称", type: "text" },
        ],
      },
    ],
  },
  {
    id: "c_code_lists",
    sheetName: "c_CodeLists",
    order: 3,
    titleEn: "c_CodeLists",
    titleZh: "代码表",
    descriptionEn:
      "Reference sheet — country codes, routes, aggregated goods categories, and UNLOCODE lookups from the EU template. Attachment import pending.",
    descriptionZh: "参考表 — 国家代码、路线、汇总货物类别与 UNLOCODE 查询。附件导入待完成。",
    sections: [
      {
        id: "code_lists_pending",
        titleEn: "Reference codes (import from EU template)",
        titleZh: "参考代码（从欧盟模板导入）",
        noteEn: "Upload or sync the official c_CodeLists sheet when the file attachment is available.",
        noteZh: "附件就绪后上传或同步官方 c_CodeLists 工作表。",
        fields: [
          { key: "country_codes", labelEn: "Country codes", labelZh: "国家代码", type: "textarea" },
          { key: "production_routes", labelEn: "Production routes", labelZh: "生产路线", type: "textarea" },
          { key: "aggregated_goods_categories", labelEn: "Aggregated goods categories", labelZh: "汇总货物类别", type: "textarea" },
          { key: "unlocode_list", labelEn: "UNLOCODE list", labelZh: "UNLOCODE 列表", type: "textarea" },
          { key: "cn_code_crosswalk", labelEn: "CN code crosswalk (steel)", labelZh: "CN 税则号对照（钢铁）", type: "textarea" },
        ],
      },
    ],
  },
];

/** Demo values — illustrative; SEE totals should match calculation engine when wired */
export const CBAM_WORKBOOK_DEMO: Record<string, string> = {
  installation_name_en: "Ningbo Hengfeng Precision Fasteners Co., Ltd.",
  installation_name_optional: "宁波恒峰精密紧固件有限公司",
  street_number: "No. 88 Jingang Road, Beilun District",
  economic_activity: "Manufacture of fasteners and structural steel components",
  country: "CN",
  city: "Ningbo",
  post_code: "315800",
  unlocode: "CNNGB",
  latitude: "29.8683",
  longitude: "121.5440",
  reporting_period_start: "2025-01-01",
  reporting_period_end: "2025-12-31",
  period_start: "2025-01-01",
  period_end: "2025-12-31",
  production_process: "P1 · BF-BOF downstream finishing",
  aggregated_good_type: "Iron or steel products",
  cn_code: "7318 15 88",
  cn_name: "Hex bolts and screws of iron or steel",
  product_name: "Hex bolt M12 · 碳钢六角螺栓 M12",
  see_direct: "1.87",
  see_indirect: "0.12",
  see_total: "1.99",
  unit: "t",
  share_default_values: "37",
  electricity_ef_source: "East China grid factor · 华东电网因子",
  scrap_per_t_steel: "0.245",
  pct_pre_consumer_scrap: "24.5",
  total_direct: "4120",
  total_indirect: "268",
  total_emissions: "4388",
  goods_id: "G1",
  aggregated_goods_category: "Iron or steel products",
  route_1: "BF-BOF",
  process_id: "P1",
  process_name: "Bolt & fastener finishing line",
  process_aggregated_category: "Iron or steel products",
  included_goods_slots: "G1",
  authorized_rep_email: "qc-ops@hengfeng.cn",
  completeness_status: "2 mandatory rows pending · verifier optional",
};

export function countWorkbookFields(doc: CbamWorkbookDoc): number {
  if (doc.subSheets) {
    return doc.subSheets.reduce((n, sh) => n + sh.sections.reduce((m, s) => m + s.fields.length, 0), 0);
  }
  return (doc.sections ?? []).reduce((m, s) => m + s.fields.length, 0);
}

export function countRequiredFields(doc: CbamWorkbookDoc): number {
  const fields: CbamField[] = [];
  const collect = (sections: CbamSection[]) => {
    for (const sec of sections) fields.push(...sec.fields);
  };
  if (doc.subSheets) doc.subSheets.forEach((sh) => collect(sh.sections));
  else collect(doc.sections ?? []);
  return fields.filter((f) => f.required).length;
}
