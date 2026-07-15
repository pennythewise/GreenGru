// Baowu/Baosteel downstream processing & distribution network — demo data for
// the Upstream 3D map. Chinese names follow Baosteel's registered naming
// convention (城市 + 宝钢 + 功能 + 有限公司); 济南宝钢钢材加工配送有限公司 is
// verified as a real registered subsidiary (baike.baidu.com), the others are
// standard-form renderings of the English demo names, and the TWB names follow
// the real 宝钢激光拼焊 JV lineage (originally 宝钢阿赛洛激光拼焊有限公司).

export type FacilityGroup = "east" | "guangdong" | "northwest" | "jv";
export type FacilityStatus = "low" | "watch" | "high";

export type Facility = {
  id: string;
  nameEn: string;
  nameZh: string;
  group: FacilityGroup;
  // Monitoring triage — drives marker color on the map. Three levels only:
  // bare dots can't separate four (gold vs amber fails without text labels).
  // The scorecard's four CBAM tiers collapse: Marginal/Exposed → "watch".
  status: FacilityStatus;
  focus: string;
  location: string;
  lat: number;
  lon: number;
};

// Network/ownership grouping — identity info, shown as text in the popup card.
export const facilityGroups: Record<FacilityGroup, { label: string; zh: string }> = {
  east:      { label: "East China hubs",         zh: "华东" },
  guangdong: { label: "Guangdong centers",       zh: "广东" },
  northwest: { label: "Northern & Western hubs", zh: "北方与西部" },
  jv:        { label: "Joint ventures",          zh: "合资网络" },
};

export const facilityStatuses: Record<FacilityStatus, { label: string; zh: string; color: string }> = {
  low:   { label: "Low risk",  zh: "低风险", color: "#1e8a5a" }, // carbon green
  watch: { label: "Watch",     zh: "关注",   color: "#a16207" }, // amber
  high:  { label: "High risk", zh: "高风险", color: "#b91c1c" }, // red
};

export const facilities: Facility[] = [
  {
    id: "wuxi",
    nameEn: "Wuxi Baosteel Steel Processing & Distribution Co., Ltd.",
    nameZh: "无锡宝钢钢材加工配送有限公司",
    group: "east",
    status: "low",
    focus: "Core slitting, precision blanking, and high-volume warehouse storage for East China engineering and fabrication SMEs.",
    location: "Huishan District, Wuxi, Jiangsu · 江苏无锡惠山区",
    lat: 31.6247, lon: 120.3582,
  },
  {
    id: "shanghai",
    nameEn: "Shanghai Baosteel Structural Steel Processing Center",
    nameZh: "上海宝钢结构钢加工中心",
    group: "east",
    status: "low",
    focus: "Heavy plate customization, precision laser cutting, and structural hardware prep.",
    location: "Fujin Rd, Baoshan District, Shanghai · 上海宝山区富锦路",
    lat: 31.4115, lon: 121.4322,
  },
  {
    id: "jinan",
    nameEn: "Jinan Baosteel Steel Processing & Distribution Co., Ltd.",
    nameZh: "济南宝钢钢材加工配送有限公司",
    group: "east",
    status: "watch",
    focus: "Multi-variety cold-rolled steel processing and logistics for northern Shandong.",
    location: "Licheng District, Jinan, Shandong · 山东济南历城区",
    lat: 36.6814, lon: 117.2341,
  },
  {
    id: "guangzhou",
    nameEn: "Guangzhou Baosteel Southern Steel Processing & Distribution Co., Ltd.",
    nameZh: "广州宝钢南方钢材加工配送有限公司",
    group: "guangdong",
    status: "low",
    focus: "Primary distribution, custom slitting, and premium electrical silicon steel for Pearl River Delta appliance and hardware SMEs.",
    location: "Huangpu District, Guangzhou, Guangdong · 广东广州黄埔区",
    lat: 23.1189, lon: 113.5214,
  },
  {
    id: "foshan",
    nameEn: "Foshan Baosteel Precision Sheet Processing Co., Ltd.",
    nameZh: "佛山宝钢精密板材加工有限公司",
    group: "guangdong",
    status: "watch",
    focus: "High-precision cold-rolled and galvanized sheet blanking for tiered hardware components.",
    location: "Shunde District, Foshan, Guangdong · 广东佛山顺德区",
    lat: 23.0292, lon: 113.1214,
  },
  {
    id: "tianjin",
    nameEn: "Tianjin Baosteel Northern Processing Center",
    nameZh: "天津宝钢北方加工中心",
    group: "northwest",
    status: "low",
    focus: "Serving structural stamping and component SMEs surrounding the Bohai Economic Rim.",
    location: "Binhai New Area, Tianjin · 天津滨海新区",
    lat: 39.0435, lon: 117.7214,
  },
  {
    id: "chongqing",
    nameEn: "Chongqing Baosteel Automotive Steel Processing Co., Ltd.",
    nameZh: "重庆宝钢汽车钢材加工有限公司",
    group: "northwest",
    status: "watch",
    focus: "Slitting, customized cutting, and distribution for Southwest China's automotive supply chain.",
    location: "Yubei District, Chongqing · 重庆渝北区",
    lat: 29.6341, lon: 106.5112,
  },
  {
    id: "wuhan",
    nameEn: "Wuhan Baosteel Central China Processing & Trading Co., Ltd.",
    nameZh: "武汉宝钢华中加工贸易有限公司",
    group: "northwest",
    status: "low",
    focus: "Downstream sheet metal slitting and component prep for the central industrial corridors.",
    location: "Caidian District, Wuhan, Hubei · 湖北武汉蔡甸区",
    lat: 30.4952, lon: 114.1611,
  },
  {
    id: "wuhan-twb",
    nameEn: "Wuhan TWB Laser Welded Blanks Co., Ltd.",
    nameZh: "武汉宝钢激光拼焊有限公司",
    group: "jv",
    status: "low",
    focus: "Advanced high-strength steel laser welding for intermediate automotive sub-assembly layers.",
    location: "Wuhan Economic & Tech Development Zone, Hubei · 武汉经开区",
    lat: 30.4811, lon: 114.1485,
  },
  {
    id: "changchun-twb",
    nameEn: "Changchun TWB Automotive Components Co., Ltd.",
    nameZh: "长春宝钢激光拼焊汽车部件有限公司",
    group: "jv",
    status: "high",
    focus: "Supplying downstream automotive stampers in Northeast China.",
    location: "Automotive Economic Development Zone, Changchun, Jilin · 吉林长春汽车经开区",
    lat: 43.8315, lon: 125.2155,
  },
  {
    id: "coilplus-gd",
    nameEn: "Coilplus (Guangdong) Steel Processing Co., Ltd.",
    nameZh: "科尔普（广东）钢材加工有限公司",
    group: "jv",
    status: "watch",
    focus: "Premium slitting systems preparing specialized electronic and advanced surface-treated sheets for downstream electronics manufacturers.",
    location: "Nansha District, Guangzhou, Guangdong · 广东广州南沙区",
    lat: 22.7241, lon: 113.5412,
  },
];
