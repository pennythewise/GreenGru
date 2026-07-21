<p align="center">
  <img src="https://img.shields.io/badge/GreenGru-绿毂-0d9488?style=for-the-badge" alt="GreenGru" />
  <img src="https://img.shields.io/badge/CBAM-EU_2026-1d4ed8?style=for-the-badge" alt="CBAM" />
  <img src="https://img.shields.io/badge/IoT-ESP32-f59e0b?style=for-the-badge" alt="ESP32" />
  <img src="https://img.shields.io/badge/AI-Qwen_via_OpenRouter-8b5cf6?style=for-the-badge" alt="Qwen" />
</p>

<h1 align="center">GreenGru · 绿毂</h1>
<p align="center"><b>钢铁下游中小企业的碳护照 · 绿贷 · 零碳工厂补贴通道</b></p>
<p align="center">一套数据源，同时服务 <b>中小企业合规变现</b> 与 <b>宝武 / 鞍钢等链主 Scope 3 决策</b></p>

<p align="center">
  <a href="#-中文"><b>🇨🇳 中文</b></a>
  &nbsp;·&nbsp;
  <a href="./README.en.md"><b>🇬🇧 English</b></a>
</p>

---

<a id="-中文"></a>

## 🇨🇳 中文

### 为什么是现在？

2026 年起，欧盟 **CBAM** 进入实质计费：不会报实际排放的出口商，只能吃高额 **默认值路径**——文献与行业测算中，板坯默认路径约 **€172/t**、下游紧固件可达 **€526/t** 量级，足以吞噬中小企业薄利。

与此同时，国内 **绿贷 / 碳减排支持工具 / 零碳工厂补贴** 正在扩围，但 SME 缺计量、缺证据、缺双语文书；链主企业则急需把下游 **Scope 3 · 类别 10** 做成可审计的一张网。

**绿毂** 把「车间电表 + 发票 OCR + 确定性核算引擎 + Qwen 文书」打成一条可演示、可落地的产品通道。

| 谁痛 | 痛点 | 绿毂给什么 |
|------|------|------------|
| **下游 SME** | 不会做 CBAM、贷不到绿贷、补贴材料散 | 三通道一键跑通：欧盟许可 / 绿贷 / 补贴 |
| **宝武 · 鞍钢等链主** | Scope 3 靠表格、看不见供应商碳等级 | 上游组合视图 · CISA 分档 · 可行动预警 |
| **银行 / 评审方** | 缺可核验用电与排放证据 | ESP32 时间窗快照 + CISA 电网因子 |

> **信任铁律：** 所有管制数字（tCO₂e、CBAM €/t、CISA 档、补贴额）由 **确定性代码** 计算；Qwen **只读已算数字、写文书与分类**——从不反过来“编”一个关税。

---

### 产品一览

<p align="center">
  <img src="docs/assets/architecture-winwin.png" alt="绿毂双赢：SME × 链主" width="920" />
</p>

```text
SME 工厂端                          链主 / 核心企业端
─────────────                      ─────────────────
发票 + ESP32 电表                   全国供应商一张图
    ↓                                   ↓
六阶段流水线（绿贷/补贴/CBAM）      Scope 3 Cat.10 趋势
    ↓                                   ↓
护照 Excel · 融资报告 · 建议书      决策中枢 · 分级处置
```

- **三条通道：** 绿色贷款 · 零碳工厂补贴 · 欧盟 CBAM 许可  
- **边缘硬件：** ESP32 + ZMPT101B + SCT-013，HTTP 直达后端（可并行 Blynk）  
- **实时与存档：** 新建提交页保存 **最近 10 / 30 / 60 分钟** 用电窗，随流水线提交（仅融资证据，**不进 CBAM 关税**）

<p align="center">
  <img src="docs/assets/architecture-dss.png" alt="链主 DSS：一张图 · Scope 3 · 决策中枢" width="920" />
</p>

---

### 总架构

<p align="center">
  <img src="docs/assets/architecture-system.png" alt="GreenGru 系统全景" width="920" />
</p>

```mermaid
flowchart TB
  subgraph EDGE["边缘层 · Hardware"]
    AC["220V 负载"] --> ZMPT["ZMPT101B 电压"]
    AC --> SCT["SCT-013 电流钳"]
    ZMPT --> ESP["ESP32<br/>Vrms · Irms · W · kWh"]
    SCT --> ESP
  end

  subgraph APP["应用层"]
    FE["Frontend<br/>TanStack · React 19 · Tailwind"]
    BE["Backend<br/>FastAPI · Python 3.11"]
    FE <--> BE
  end

  subgraph AI["智能层 · MVP"]
    OR["OpenRouter → Qwen<br/>OCR 辅助 · CN 分类 · 文书 / 顾问"]
  end

  subgraph DATA["数据层 · MVP"]
    SB[("Supabase Postgres<br/>+ pgvector / RLS")]
    SQL[("本地 SQLite · 零配置开发")]
  end

  subgraph TRUST["信任核"]
    ENG["calculation_engine<br/>CBAM φ · 基准 · 证书价"]
    CISA["CISA / 绿贷 / 补贴评分"]
  end

  ESP -->|"POST /api/iot/ingest"| BE
  BE --> ENG
  BE --> CISA
  BE --> OR
  BE --> SB
  BE --> SQL
  ENG -.->|"数字只出这里"| BE
  OR -.->|"只读数字 · 写散文"| BE
```

> 产品信任层使用 **HMAC 授权包**（非 ZK / 非链上）。示意图侧重业务价值；实现以本仓库代码与 PRD 为准。

**MVP → 生产（中国栈）平滑升级**

| 能力 | MVP（易启动） | 生产（数据主权 / 水木叙事） |
|------|----------------|------------------------------|
| LLM | **OpenRouter · Qwen** | **阿里云百炼 DashScope**（北京）· ModelScope 作 Stage-0 可选 |
| Embedding | OpenRouter / Qwen embedding | 百炼 `text-embedding-v4` 或 ModelScope `Qwen3-Embedding-*` |
| 数据库 | **Supabase** | **阿里云 PolarDB / RDS Postgres**（同 SQLAlchemy 模型） |
| 对象存储 | Supabase Storage（可选） | 阿里云 OSS（护照 Excel / 发票） |
| IoT | ESP32 → HTTP → FastAPI | 同左；可加 MQTT 桥 |

---

### 六阶段流水线（固定编排，非自治 Agent）

<p align="center">
  <img src="docs/assets/architecture-channels.png" alt="中小企业多路径推进通道" width="920" />
</p>

```mermaid
flowchart LR
  S1["① 接入<br/>OCR / 发票"] --> S2["② 校验<br/>诺诺"]
  S2 --> S3["③ 分类<br/>Qwen · CN 码"]
  S3 --> S4["④ 核算<br/>Python 引擎"]
  S4 --> S5["⑤ 仪表盘<br/>提交快照"]
  S5 --> S6["⑥ 授权上传<br/>HMAC 防篡改"]
```

并行还有 **贷款 / 补贴 / CBAM** 三条路由评分与文书；Copilot（Agent 0）做意图分流。

预筛知识库（RAG）路径：官方合规文档 → MinerU → LangChain 分块 → Qwen Embedding → Supabase 向量库 → 通道专家代理。

<p align="center">
  <img src="docs/assets/architecture-rag.png" alt="预筛知识库 RAG" width="920" />
</p>

IoT 时间窗快照挂在 Stage 1 / Stage 6 包体中，标注：

`scope = financing_electricity_only_not_cbam`

---

### 硬件亮点（Hackathon 杀手锏）

非侵入式车间计量，**可夹在进线火线上演示**：

<p align="center">
  <img src="docs/assets/architecture-hardware.png" alt="ESP32 智能电表接线" width="720" />
</p>

| 部件 | 作用 |
|------|------|
| **ESP32** | Wi‑Fi 边缘计算，本地算 Vrms / Irms / Power / kWh |
| **ZMPT101B** | 交流电压隔离采样 |
| **SCT-013** | 钳式电流互感器 + 偏置调理电路 |
| **路径** | Blynk 仪表（可选）+ **HTTP → GreenGru**（产品路径） |

```mermaid
flowchart LR
  GRID["市电 220V"] --> LOAD["负载 / 灯泡原型"]
  LOAD --> CT["SCT-013"]
  GRID --> VT["ZMPT101B"]
  CT --> ESP32["ESP32"]
  VT --> ESP32
  ESP32 -->|"JSON 每 5s"| API["/api/iot/ingest"]
  API --> WIN["iot_window_snapshots<br/>10′ / 30′ / 60′"]
  WIN --> PIPE["流水线 · 绿贷证据"]
```

电网排放：企业选择是否参与 **市场化绿电交易** → CISA 附录 B.3  
`0.5568` 或 `0.5942` t/MWh → `tCO₂e = ΔkWh / 1000 × EF`

---

### 前端 · 后端 · 库表（鸟瞰）

**Frontend** `frontend/`  
TanStack Start · React 19 · Tailwind · Recharts · 双语 UI  
SME 总览 / 新建提交 / 三通道 Copilot / 链主上游组合（地图 · Scope 3 趋势）

**Backend** `backend/`  
FastAPI · 确定性 `calculation_engine` · 评分器 · OCR · IoT · 流水线编排 · WeasyPrint / CBAM Excel

**Database**（示意）

```mermaid
erDiagram
  companies ||--o{ products : has
  products ||--o{ submissions : has
  submissions ||--o{ intake_records : has
  submissions ||--o{ calculations : has
  calculations ||--o{ scores : has
  scores ||--o{ documents : has
  companies ||--o{ iot_readings : streams
  companies ||--o{ iot_window_snapshots : freezes

  iot_readings {
    string company_id
    float voltage
    float current
    float kwh
    datetime ingested_at
  }
  iot_window_snapshots {
    int window_minutes
    string green_trading
    float emission_factor_t_per_mwh
    float delta_kwh
    float tco2e
  }
  calculations {
    float intensity_tco2e_per_tonne
    float tariff_cost_eur_per_tonne
    string data_source
  }
```

完整 DDL：`supabase/migrations/0001_init.sql` · `0002_iot_window_snapshots.sql`

---

### 商业模式一句话

> **向下游卖合规与融资就绪，向链主卖 Scope 3 可见性与供应商分级。**  
> 同一条核验数据，两边都愿意付费——这是渠道型 SaaS，不是又一个碳计算器。

| 收入想象 | 说明 |
|----------|------|
| SME SaaS / 按次护照 | 出口季刚需 |
| 锚点企业席位 | 宝武式客户经理 DSS |
| 硬件 + 安装 | ESP32 计量包 |
| 银行 / 补贴渠道分成 | 绿贷获客与材料标准化 |

---

### 快速启动

```bash
# Backend
cd backend && python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env   # 配置 OPENROUTER / Supabase 等
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd frontend && npm install && npm run dev
```

零密钥时可跑 **mock LLM**；接真实 Qwen：在 `.env` 配置 **OpenRouter**（MVP）。生产切 **百炼** 只需换 base URL / key。

固件：`firmware/src/main.ino`（Blynk + GreenGru HTTP）。

---

### 仓库结构

```text
GreenGru/
├── frontend/          # TanStack · 仪表盘 · 三通道 · 上游
├── backend/           # FastAPI · 引擎 · 流水线 · IoT
├── firmware/          # ESP32 智能电表
├── supabase/          # Postgres 迁移 + RLS
└── PRD.md             # 产品与否决项（ZK / 区块链等已明确不做）
```

---

### 团队信条

1. **数字可信** — 引擎算，模型写。  
2. **通道可分发** — 通过宝武 / 鞍钢触达千家 SME。  
3. **边缘可核验** — 电表不是装饰，是绿贷证据。  
4. **主权可升级** — MVP 用全球易用栈，上线可迁中国云。

<p align="center"><b>绿毂 · 让碳合规变成可融资的产能。</b></p>

---

<a id="english"></a>

> For the full English version, open **[README.en.md](./README.en.md)**.
