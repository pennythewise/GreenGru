// ==============================================================================
// GreenGru Metallurgical & CBAM Regulatory Knowledge Graph — Seed Cypher
// Architecture: Physical Process Lineage -> Precursor Flows -> CBAM System Boundaries -> 十五五 Policy
// Compatible with Neo4j 5.x Community & Enterprise
// ==============================================================================

// --- 1. Schema Constraints & Indexes ---
CREATE CONSTRAINT unique_entity_id IF NOT EXISTS FOR (e:Entity) REQUIRE e.id IS UNIQUE;
CREATE INDEX entity_layer IF NOT EXISTS FOR (e:Entity) ON (e.layer);
CREATE INDEX customs_code IF NOT EXISTS FOR (c:CustomsNode) ON (c.cn_code);

// --- 2. Policy Directives (China 15th Five-Year Plan) ---
MERGE (p1:Entity:PolicyNode {id: "policy_15_5_ch21_s2"})
SET p1.layer = "policy",
    p1.name_en = "15th FYP Ch.21 §2 — Carbon footprint mutual recognition",
    p1.name_zh = "十五五 · 第21章第2节 · 产品碳足迹国际互认",
    p1.plan = "15th Five-Year Plan",
    p1.section = "Chapter 21 Section 2";

MERGE (p2:Entity:PolicyNode {id: "policy_15_5_ch18_s2"})
SET p2.layer = "policy",
    p2.name_en = "15th FYP Ch.18 §2 — Large–SME supply-chain synergy",
    p2.name_zh = "十五五 · 第18章第2节 · 大中小企业供应链协同",
    p2.plan = "15th Five-Year Plan",
    p2.section = "Chapter 18 Section 2";

MERGE (p3:Entity:PolicyNode {id: "policy_15_5_ch47_s1"})
SET p3.layer = "policy",
    p3.name_en = "15th FYP Ch.47 §1 — Dual control (volume & intensity)",
    p3.name_zh = "十五五 · 第47章第1节 · 碳排放双控",
    p3.plan = "15th Five-Year Plan",
    p3.section = "Chapter 47 Section 1";

// --- 3. CBAM Regulatory Boundaries & Exclusions (Reg EU 2025/2547) ---
MERGE (r1:Entity:CBAMBoundaryNode {id: "rule_3162"})
SET r1.layer = "boundary",
    r1.name_en = "Reg (EU) 2025/2547 Annex I §3.16.2 — steel fabrication monitoring",
    r1.name_zh = "欧盟法规 2025/2547 附件一 §3.16.2 · 钢铁深加工监测边界",
    r1.document = "Regulation (EU) 2025/2547 Annex I Section 3.16.2",
    r1.included_processes = ["re-heating", "pickling", "annealing", "galvanising", "coating"],
    r1.excluded_direct_processes = ["cutting", "welding", "finishing", "mobile_machinery"];

MERGE (b1:Entity:CBAMBoundaryNode {id: "bound_included_direct"})
SET b1.layer = "boundary", b1.name_en = "CBAM boundary · Included direct", b1.name_zh = "CBAM 边界 · 直接排放计入", b1.tag = "Included_Direct";

MERGE (b2:Entity:CBAMBoundaryNode {id: "bound_excluded_direct"})
SET b2.layer = "boundary", b2.name_en = "CBAM boundary · Excluded direct", b2.name_zh = "CBAM 边界 · 直接排放排除", b2.tag = "Excluded_Direct";

MERGE (b3:Entity:CBAMBoundaryNode {id: "bound_relevant_precursor"})
SET b3.layer = "boundary", b3.name_en = "CBAM boundary · Relevant precursor", b3.name_zh = "CBAM 边界 · 相关前体", b3.tag = "Relevant_Precursor";

// --- 4. Emission Sources ---
MERGE (e1:Entity:EmissionSourceNode {id: "emis_scope1_combustion"})
SET e1.layer = "emission", e1.name_en = "Scope 1 · Combustion", e1.name_zh = "范围一 · 燃烧", e1.tag = "Scope1_Combustion";

MERGE (e2:Entity:EmissionSourceNode {id: "emis_scope1_process"})
SET e2.layer = "emission", e2.name_en = "Scope 1 · Process reduction", e2.name_zh = "范围一 · 工艺还原", e2.tag = "Scope1_Process_Reduction";

MERGE (e3:Entity:EmissionSourceNode {id: "emis_scope2_grid"})
SET e3.layer = "emission", e3.name_en = "Scope 2 · Grid electricity", e3.name_zh = "范围二 · 电网电力", e3.tag = "Scope2_GridElectricity";

// --- 5. Upstream Baowu Production Operations (85-90% Carbon Burden) ---
MERGE (up1:Entity:ProcessNode {id: "proc_sintering"})
SET up1.layer = "process", up1.stage = "upstream", up1.operator = "Baowu", up1.name_en = "Sintering", up1.name_zh = "烧结", up1.emission_tier = "RED";

MERGE (up2:Entity:ProcessNode {id: "proc_coking"})
SET up2.layer = "process", up2.stage = "upstream", up2.operator = "Baowu", up2.name_en = "Coking", up2.name_zh = "炼焦", up2.emission_tier = "RED";

MERGE (up3:Entity:ProcessNode {id: "proc_blast_furnace"})
SET up3.layer = "process", up3.stage = "upstream", up3.operator = "Baowu", up3.name_en = "Blast Furnace (BF)", up3.name_zh = "高炉（BF）", up3.emission_tier = "RED";

MERGE (up4:Entity:ProcessNode {id: "proc_bof"})
SET up4.layer = "process", up4.stage = "upstream", up4.operator = "Baowu", up4.name_en = "Basic Oxygen Furnace (BOF)", up4.name_zh = "转炉（BOF）", up4.emission_tier = "RED";

MERGE (up5:Entity:ProcessNode {id: "proc_eaf"})
SET up5.layer = "process", up5.stage = "upstream", up5.operator = "Baowu", up5.name_en = "Electric Arc Furnace (EAF)", up5.name_zh = "电弧炉（EAF）", up5.emission_tier = "ORANGE";

MERGE (up6:Entity:ProcessNode {id: "proc_continuous_casting"})
SET up6.layer = "process", up6.stage = "upstream", up6.operator = "Baowu", up6.name_en = "Continuous Casting", up6.name_zh = "连铸", up6.emission_tier = "ORANGE";

MERGE (up7:Entity:ProcessNode {id: "proc_hot_rolling"})
SET up7.layer = "process", up7.stage = "upstream", up7.operator = "Baowu", up7.name_en = "Hot Rolling Mill", up7.name_zh = "热轧", up7.emission_tier = "ORANGE";

// --- 6. Downstream SME Fabrication Operations (10-15% Carbon Processing) ---
MERGE (dn1:Entity:ProcessNode {id: "proc_cnc_cutting"})
SET dn1.layer = "process", dn1.stage = "downstream", dn1.operator = "SME", dn1.name_en = "CNC Cutting (laser/plasma/oxy-fuel)", dn1.name_zh = "数控切割（激光/等离子/火焰）", dn1.equipment = "Laser/Plasma Cutter";

MERGE (dn2:Entity:ProcessNode {id: "proc_punching"})
SET dn2.layer = "process", dn2.stage = "downstream", dn2.operator = "SME", dn2.name_en = "Punching & Drilling", dn2.name_zh = "冲孔与钻孔";

MERGE (dn3:Entity:ProcessNode {id: "proc_co2_welding"})
SET dn3.layer = "process", dn3.stage = "downstream", dn3.operator = "SME", dn3.name_en = "CO2 Shielded Welding", dn3.name_zh = "二氧化碳保护焊", dn3.equipment = "MIG/SAW Welder";

MERGE (dn4:Entity:ProcessNode {id: "proc_bending_milling"})
SET dn4.layer = "process", dn4.stage = "downstream", dn4.operator = "SME", dn4.name_en = "Bending & Milling", dn4.name_zh = "折弯与铣削";

MERGE (dn5:Entity:ProcessNode {id: "proc_assembly"})
SET dn5.layer = "process", dn5.stage = "downstream", dn5.operator = "SME", dn5.name_en = "Assembly", dn5.name_zh = "装配";

MERGE (dn6:Entity:ProcessNode {id: "proc_hot_dip_galvanizing"})
SET dn6.layer = "process", dn6.stage = "downstream", dn6.operator = "SME", dn6.name_en = "Hot-Dip Galvanizing", dn6.name_zh = "热浸镀锌", dn6.equipment = "Zinc Bath Furnace";

// --- 7. Materials & Precursor Nodes ---
MERGE (m1:Entity:MaterialNode {id: "mat_iron_ore"}) SET m1.layer = "material", m1.name_en = "Iron Ore", m1.name_zh = "铁矿石";
MERGE (m2:Entity:MaterialNode {id: "mat_coke"}) SET m2.layer = "material", m2.name_en = "Metallurgical Coke", m2.name_zh = "冶金焦";
MERGE (m3:Entity:MaterialNode {id: "mat_pig_iron"}) SET m3.layer = "material", m3.name_en = "Pig Iron / Hot Metal", m3.name_zh = "生铁 / 铁水";
MERGE (m4:Entity:MaterialNode {id: "mat_steel_scrap"}) SET m4.layer = "material", m4.name_en = "Steel Scrap", m4.name_zh = "废钢";
MERGE (m5:Entity:MaterialNode {id: "mat_crude_steel_slab"}) SET m5.layer = "material", m5.name_en = "Crude Steel / Slab", m5.name_zh = "粗钢 / 板坯";
MERGE (m6:Entity:MaterialNode {id: "mat_hot_rolled_plate"}) SET m6.layer = "material", m6.name_en = "Hot-Rolled Plate / Coil", m6.name_zh = "热轧板 / 卷";
MERGE (m7:Entity:MaterialNode {id: "mat_fastener_bolt"}) SET m7.layer = "material", m7.name_en = "Finished Fastener (bolt/screw)", m7.name_zh = "成品紧固件（螺栓/螺钉）";
MERGE (m8:Entity:MaterialNode {id: "mat_steel_structure"}) SET m8.layer = "material", m8.name_en = "Fabricated Steel Structure / Beams (EN 1090)", m8.name_zh = "建筑钢结构构件 / 梁柱（EN 1090）";
MERGE (m9:Entity:MaterialNode {id: "mat_zinc_coating"}) SET m9.layer = "material", m9.name_en = "Zinc Coating", m9.name_zh = "锌镀层";

// --- 8. Customs CN Tariff Codes ---
MERGE (c1:Entity:CustomsNode {id: "cn_7207"}) SET c1.layer = "customs", c1.cn_code = "7207", c1.name_en = "CN 7207 · Semi-finished billets", c1.name_zh = "CN 7207 · 半成品钢坯";
MERGE (c2:Entity:CustomsNode {id: "cn_7208_10_00"}) SET c2.layer = "customs", c2.cn_code = "7208 10 00", c2.name_en = "CN 7208 10 00 · Hot-rolled coil", c2.name_zh = "CN 7208 10 00 · 热轧卷板";
MERGE (c3:Entity:CustomsNode {id: "cn_7213"}) SET c3.layer = "customs", c3.cn_code = "7213", c3.name_en = "CN 7213 · Hot-rolled bars", c3.name_zh = "CN 7213 · 热轧盘条";
MERGE (c4:Entity:CustomsNode {id: "cn_7214"}) SET c4.layer = "customs", c4.cn_code = "7214", c4.name_en = "CN 7214 · Hot-rolled wire rod", c4.name_zh = "CN 7214 · 热轧线材";
MERGE (c5:Entity:CustomsNode {id: "cn_7301"}) SET c5.layer = "customs", c5.cn_code = "7301", c5.name_en = "CN 7301 · Sheet piling / angles", c5.name_zh = "CN 7301 · 板桩 / 角钢";
MERGE (c6:Entity:CustomsNode {id: "cn_7302"}) SET c6.layer = "customs", c6.cn_code = "7302", c6.name_en = "CN 7302 · Railway track material", c6.name_zh = "CN 7302 · 铁路轨道材料";
MERGE (c7:Entity:CustomsNode {id: "cn_7308"}) SET c7.layer = "customs", c7.cn_code = "7308", c7.name_en = "CN 7308 · Fabricated steel structures (EN 1090)", c7.name_zh = "CN 7308 · 钢铁结构体及部件（EN 1090）";
MERGE (c8:Entity:CustomsNode {id: "cn_7318_15_42"}) SET c8.layer = "customs", c8.cn_code = "7318 15 42", c8.name_en = "CN 7318 15 42 · Bolts", c8.name_zh = "CN 7318 15 42 · 螺栓";
MERGE (c9:Entity:CustomsNode {id: "cn_7318_15_88"}) SET c9.layer = "customs", c9.cn_code = "7318 15 88", c9.name_en = "CN 7318 15 88 · Screws", c9.name_zh = "CN 7318 15 88 · 螺钉";
MERGE (c10:Entity:CustomsNode {id: "cn_7326"}) SET c10.layer = "customs", c10.cn_code = "7326", c10.name_en = "CN 7326 · Other steel articles", c10.name_zh = "CN 7326 · 其他钢铁制品";

// --- 9. Material & Upstream Process Relationships ---
MATCH (p:Entity {id: "proc_sintering"}), (m:Entity {id: "mat_iron_ore"}) MERGE (p)-[:CONSUMES]->(m);
MATCH (p:Entity {id: "proc_coking"}), (m:Entity {id: "mat_coke"}) MERGE (p)-[:PRODUCES]->(m);
MATCH (p:Entity {id: "proc_blast_furnace"}), (m:Entity {id: "mat_iron_ore"}) MERGE (p)-[:CONSUMES]->(m);
MATCH (p:Entity {id: "proc_blast_furnace"}), (m:Entity {id: "mat_coke"}) MERGE (p)-[:CONSUMES]->(m);
MATCH (p:Entity {id: "proc_blast_furnace"}), (m:Entity {id: "mat_pig_iron"}) MERGE (p)-[:PRODUCES]->(m);
MATCH (p:Entity {id: "proc_blast_furnace"}), (e:Entity {id: "emis_scope1_process"}) MERGE (p)-[:EMITS]->(e);
MATCH (p:Entity {id: "proc_bof"}), (m:Entity {id: "mat_pig_iron"}) MERGE (p)-[:CONSUMES]->(m);
MATCH (p:Entity {id: "proc_bof"}), (m:Entity {id: "mat_crude_steel_slab"}) MERGE (p)-[:PRODUCES]->(m);
MATCH (p:Entity {id: "proc_bof"}), (e:Entity {id: "emis_scope1_process"}) MERGE (p)-[:EMITS]->(e);
MATCH (p:Entity {id: "proc_eaf"}), (m:Entity {id: "mat_steel_scrap"}) MERGE (p)-[:CONSUMES]->(m);
MATCH (p:Entity {id: "proc_eaf"}), (m:Entity {id: "mat_crude_steel_slab"}) MERGE (p)-[:PRODUCES]->(m);
MATCH (p:Entity {id: "proc_eaf"}), (e:Entity {id: "emis_scope2_grid"}) MERGE (p)-[:EMITS]->(e);
MATCH (p:Entity {id: "proc_continuous_casting"}), (m:Entity {id: "mat_crude_steel_slab"}) MERGE (p)-[:CONSUMES]->(m);
MATCH (p:Entity {id: "proc_continuous_casting"}), (e:Entity {id: "emis_scope1_combustion"}) MERGE (p)-[:EMITS]->(e);
MATCH (p:Entity {id: "proc_continuous_casting"}), (e:Entity {id: "emis_scope2_grid"}) MERGE (p)-[:EMITS]->(e);
MATCH (p:Entity {id: "proc_hot_rolling"}), (m:Entity {id: "mat_crude_steel_slab"}) MERGE (p)-[:CONSUMES]->(m);
MATCH (p:Entity {id: "proc_hot_rolling"}), (m:Entity {id: "mat_hot_rolled_plate"}) MERGE (p)-[:PRODUCES]->(m);
MATCH (p:Entity {id: "proc_hot_rolling"}), (e:Entity {id: "emis_scope1_combustion"}) MERGE (p)-[:EMITS]->(e);
MATCH (p:Entity {id: "proc_hot_rolling"}), (e:Entity {id: "emis_scope2_grid"}) MERGE (p)-[:EMITS]->(e);

MATCH (p1:Entity {id: "proc_blast_furnace"}), (p2:Entity {id: "proc_bof"}) MERGE (p1)-[:FEEDS]->(p2);
MATCH (p1:Entity {id: "proc_bof"}), (p2:Entity {id: "proc_continuous_casting"}) MERGE (p1)-[:FEEDS]->(p2);
MATCH (p1:Entity {id: "proc_continuous_casting"}), (p2:Entity {id: "proc_hot_rolling"}) MERGE (p1)-[:FEEDS]->(p2);

// --- 10. Customs & Precursor Multiplier (m = 1.176 for 15% scrap rate) ---
MATCH (m:Entity {id: "mat_crude_steel_slab"}), (c:Entity {id: "cn_7207"}) MERGE (m)-[:HAS_CN_CODE]->(c);
MATCH (m:Entity {id: "mat_hot_rolled_plate"}), (c:Entity {id: "cn_7208_10_00"}) MERGE (m)-[:HAS_CN_CODE]->(c);
MATCH (m:Entity {id: "mat_hot_rolled_plate"}), (b:Entity {id: "bound_relevant_precursor"}) MERGE (m)-[:CLASSIFIED_AS]->(b);

MATCH (m1:Entity {id: "mat_hot_rolled_plate"}), (m2:Entity {id: "mat_fastener_bolt"})
MERGE (m1)-[r:PRECURSOR_OF]->(m2)
SET r.yield_factor_m = 1.176, r.scrap_pct = 15.0, r.formula = "m = 1 / (1 - scrap_rate)";

MATCH (m1:Entity {id: "mat_hot_rolled_plate"}), (m2:Entity {id: "mat_steel_structure"})
MERGE (m1)-[r:PRECURSOR_OF]->(m2)
SET r.yield_factor_m = 1.176, r.scrap_pct = 15.0, r.formula = "m = 1 / (1 - scrap_rate)";

MATCH (m:Entity {id: "mat_fastener_bolt"}), (c:Entity {id: "cn_7318_15_42"}) MERGE (m)-[:HAS_CN_CODE]->(c);
MATCH (m:Entity {id: "mat_fastener_bolt"}), (c:Entity {id: "cn_7318_15_88"}) MERGE (m)-[:HAS_CN_CODE]->(c);
MATCH (m:Entity {id: "mat_steel_structure"}), (c:Entity {id: "cn_7308"}) MERGE (m)-[:HAS_CN_CODE]->(c);

// --- 11. Downstream Governance & Statutory Exclusions (§3.16.2) ---
MATCH (p:Entity {id: "proc_cnc_cutting"}), (r:Entity {id: "rule_3162"})
MERGE (p)-[g:GOVERNED_BY]->(r)
SET g.direct_status = "EXCLUDED", g.indirect_status = "MONITORING_ONLY_NOT_CBAM_PRICED", g.cite = "Reg (EU) 2025/2547 Annex I §3.16.2 — cutting excluded";
MATCH (p:Entity {id: "proc_cnc_cutting"}), (e:Entity {id: "emis_scope2_grid"}) MERGE (p)-[:EMITS]->(e);
MATCH (p:Entity {id: "proc_cnc_cutting"}), (b:Entity {id: "bound_excluded_direct"}) MERGE (p)-[:CLASSIFIED_AS]->(b);
MATCH (p:Entity {id: "proc_cnc_cutting"}), (m:Entity {id: "mat_hot_rolled_plate"}) MERGE (p)-[:CONSUMES]->(m);

MATCH (p:Entity {id: "proc_co2_welding"}), (r:Entity {id: "rule_3162"})
MERGE (p)-[g:GOVERNED_BY]->(r)
SET g.direct_status = "EXCLUDED", g.indirect_status = "MONITORING_ONLY_NOT_CBAM_PRICED", g.cite = "Reg (EU) 2025/2547 Annex I §3.16.2 — welding excluded";
MATCH (p:Entity {id: "proc_co2_welding"}), (e:Entity {id: "emis_scope2_grid"}) MERGE (p)-[:EMITS]->(e);
MATCH (p:Entity {id: "proc_co2_welding"}), (b:Entity {id: "bound_excluded_direct"}) MERGE (p)-[:CLASSIFIED_AS]->(b);

MATCH (p:Entity {id: "proc_punching"}), (r:Entity {id: "rule_3162"})
MERGE (p)-[g:GOVERNED_BY]->(r)
SET g.direct_status = "EXCLUDED", g.indirect_status = "MONITORING_ONLY_NOT_CBAM_PRICED";
MATCH (p:Entity {id: "proc_punching"}), (e:Entity {id: "emis_scope2_grid"}) MERGE (p)-[:EMITS]->(e);
MATCH (p:Entity {id: "proc_punching"}), (m:Entity {id: "mat_hot_rolled_plate"}) MERGE (p)-[:CONSUMES]->(m);

MATCH (p:Entity {id: "proc_bending_milling"}), (r:Entity {id: "rule_3162"})
MERGE (p)-[g:GOVERNED_BY]->(r)
SET g.direct_status = "EXCLUDED", g.indirect_status = "MONITORING_ONLY_NOT_CBAM_PRICED";
MATCH (p:Entity {id: "proc_bending_milling"}), (e:Entity {id: "emis_scope2_grid"}) MERGE (p)-[:EMITS]->(e);

MATCH (p:Entity {id: "proc_assembly"}), (r:Entity {id: "rule_3162"})
MERGE (p)-[g:GOVERNED_BY]->(r)
SET g.direct_status = "EXCLUDED", g.indirect_status = "MONITORING_ONLY_NOT_CBAM_PRICED", g.cite = "Internal mobile diesel excluded (Annex II §B.1.c)";
MATCH (p:Entity {id: "proc_assembly"}), (e:Entity {id: "emis_scope2_grid"}) MERGE (p)-[:EMITS]->(e);

MATCH (p:Entity {id: "proc_hot_dip_galvanizing"}), (r:Entity {id: "rule_3162"})
MERGE (p)-[g:GOVERNED_BY]->(r)
SET g.direct_status = "INCLUDED", g.indirect_status = "INCLUDED", g.cite = "§3.16.2 mandates monitoring for galvanising / coating";
MATCH (p:Entity {id: "proc_hot_dip_galvanizing"}), (e:Entity {id: "emis_scope1_combustion"}) MERGE (p)-[:EMITS]->(e);
MATCH (p:Entity {id: "proc_hot_dip_galvanizing"}), (e:Entity {id: "emis_scope2_grid"}) MERGE (p)-[:EMITS]->(e);
MATCH (p:Entity {id: "proc_hot_dip_galvanizing"}), (b:Entity {id: "bound_included_direct"}) MERGE (p)-[:CLASSIFIED_AS]->(b);
MATCH (p:Entity {id: "proc_hot_dip_galvanizing"}), (m:Entity {id: "mat_zinc_coating"}) MERGE (p)-[:CONSUMES]->(m);
MATCH (p:Entity {id: "proc_hot_dip_galvanizing"}), (m:Entity {id: "mat_fastener_bolt"}) MERGE (p)-[:PRODUCES]->(m);
MATCH (p:Entity {id: "proc_hot_dip_galvanizing"}), (m:Entity {id: "mat_steel_structure"}) MERGE (p)-[:PRODUCES]->(m);

// --- 12. Policy Alignment (China 15th Five-Year Plan) ---
MATCH (c:Entity {id: "cn_7318_15_88"}), (pol:Entity {id: "policy_15_5_ch21_s2"}) MERGE (c)-[:ALIGNED_WITH_POLICY]->(pol);
MATCH (c:Entity {id: "cn_7318_15_42"}), (pol:Entity {id: "policy_15_5_ch21_s2"}) MERGE (c)-[:ALIGNED_WITH_POLICY]->(pol);
MATCH (c:Entity {id: "cn_7308"}), (pol:Entity {id: "policy_15_5_ch21_s2"}) MERGE (c)-[:ALIGNED_WITH_POLICY]->(pol);
MATCH (c:Entity {id: "cn_7208_10_00"}), (pol:Entity {id: "policy_15_5_ch18_s2"}) MERGE (c)-[:ALIGNED_WITH_POLICY]->(pol);
MATCH (p:Entity {id: "proc_blast_furnace"}), (pol:Entity {id: "policy_15_5_ch47_s1"}) MERGE (p)-[:ALIGNED_WITH_POLICY]->(pol);
MATCH (p:Entity {id: "proc_bof"}), (pol:Entity {id: "policy_15_5_ch18_s2"}) MERGE (p)-[:ALIGNED_WITH_POLICY]->(pol);
MATCH (m:Entity {id: "mat_fastener_bolt"}), (pol:Entity {id: "policy_15_5_ch21_s2"}) MERGE (m)-[:ALIGNED_WITH_POLICY]->(pol);
MATCH (m:Entity {id: "mat_steel_structure"}), (pol:Entity {id: "policy_15_5_ch21_s2"}) MERGE (m)-[:ALIGNED_WITH_POLICY]->(pol);
