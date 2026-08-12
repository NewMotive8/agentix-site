export type Level = "HIGH" | "MED" | "LOW";
export type Accessibility = "VERY HIGH" | "HIGH" | "MED" | "LOW" | "VERY LOW";
export type SourceKey = "sam" | "dibbs" | "nspa" | "ncia" | "nato";
export type Recommendation = "PURSUE" | "INVESTIGATE FURTHER" | "LOW PRIORITY" | "REJECT";

export type SupplySource = {
  name: string;
  type: "OEM" | "Distributor" | "Alternate Mfr" | "Surplus";
  geography: string;
  estPrice: number;
  qualification: "Qualified" | "Approved Source" | "Requires SAR" | "Unqualified";
};

export type Opportunity = {
  id: string;
  score: number;
  agency: string;
  solicitation: string;
  product: string;
  nsn: string;
  partNumber: string;
  fsc: string;
  quantity: number;
  deadline: string;
  source: SourceKey;
  sourceLabel: string;
  incumbents: number;
  demand: Level;
  accessibility: Accessibility;
  pricingConfidence: Level;
  estValue: number;
  estMargin: number;
  estGrossProfit: number;
  aiSummary: string;
  /** Live records only: notice class taken from the source's own type field. */
  liveNoticeClass?: string;
  /** Live records only: fields the source does not publish. */
  dataGaps?: string[];
  investigation: {
    platform: string;
    historicalQty: { year: string; qty: number; unitPrice: number }[];
    sources: SupplySource[];
    compliance: { label: string; state: "required" | "clear" | "watch" }[];
    waterfall: { govPrice: number; supplierCost: number; freight: number; inspCert: number };
    recommendation: Recommendation;
    rationale: string[];
  };
};

export type HuntParams = {
  minMargin: number;
  minValue: number;
  maxIncumbents: number;
  fscCodes: string[];
  sources: Record<SourceKey, boolean>;
};

export const SOURCE_LABELS: Record<SourceKey, string> = {
  sam: "SAM.gov",
  dibbs: "DLA DIBBS",
  nspa: "NSPA",
  ncia: "NCIA",
  nato: "NATO portals (HQ / ACT / ACO)",
};

export const defaultParams: HuntParams = {
  minMargin: 20,
  minValue: 100000,
  maxIncumbents: 3,
  fscCodes: [],
  sources: { sam: true, dibbs: true, nspa: true, ncia: true, nato: true },
};

export type PresetKey = "anchor" | "cluster" | "capital" | "nato" | "repeat";

export const PRESETS: { key: PresetKey; label: string; params: HuntParams }[] = [
  {
    key: "anchor",
    label: "ANCHOR",
    params: {
      minMargin: 35,
      minValue: 250000,
      maxIncumbents: 1,
      fscCodes: ["1650", "2530"],
      sources: { sam: true, dibbs: true, nspa: false, ncia: false, nato: false },
    },
  },
  {
    key: "cluster",
    label: "CLUSTER",
    params: {
      minMargin: 20,
      minValue: 100000,
      maxIncumbents: 5,
      fscCodes: ["1650", "2530", "4820", "1560"],
      sources: { sam: true, dibbs: true, nspa: true, ncia: true, nato: true },
    },
  },
  {
    key: "capital",
    label: "CAPITAL",
    params: {
      minMargin: 15,
      minValue: 750000,
      maxIncumbents: 4,
      fscCodes: [],
      sources: { sam: true, dibbs: false, nspa: true, ncia: true, nato: true },
    },
  },
  {
    key: "nato",
    label: "NATO",
    params: {
      minMargin: 18,
      minValue: 150000,
      maxIncumbents: 6,
      fscCodes: ["1650", "5895"],
      sources: { sam: false, dibbs: false, nspa: true, ncia: true, nato: true },
    },
  },
  {
    key: "repeat",
    label: "REPEAT DEMAND",
    params: {
      minMargin: 22,
      minValue: 80000,
      maxIncumbents: 8,
      fscCodes: ["2530", "4820", "1650"],
      sources: { sam: true, dibbs: true, nspa: true, ncia: false, nato: false },
    },
  },
];

export const opportunities: Opportunity[] = [
  {
    id: "opp-moog",
    score: 91,
    agency: "DLA Aviation",
    solicitation: "SPE4A7-26-R-0431",
    product: "Servo Valve, Hydraulic Flight Control",
    nsn: "1650-01-247-9932",
    partNumber: "MOOG 30-421A",
    fsc: "1650",
    quantity: 42,
    deadline: "2026-09-18",
    source: "dibbs",
    sourceLabel: "DLA DIBBS",
    incumbents: 1,
    demand: "HIGH",
    accessibility: "HIGH",
    pricingConfidence: "HIGH",
    estValue: 512400,
    estMargin: 38,
    estGrossProfit: 194712,
    aiSummary:
      "Strong candidate because the NSN shows recurring annual demand across three fiscal years, WebFLIS unit pricing is available at high confidence, and three commercial sources were identified outside the incumbent. Main risk: source qualification under the source-controlled drawing.",
    investigation: {
      platform: "F/A-18E/F flight control actuation subsystem",
      historicalQty: [
        { year: "FY23", qty: 36, unitPrice: 11240 },
        { year: "FY24", qty: 48, unitPrice: 11890 },
        { year: "FY25", qty: 40, unitPrice: 12200 },
      ],
      sources: [
        { name: "Moog Inc.", type: "OEM", geography: "US", estPrice: 9800, qualification: "Approved Source" },
        { name: "Aviall Services", type: "Distributor", geography: "US", estPrice: 10450, qualification: "Qualified" },
        { name: "TransDigm HR Textron", type: "Alternate Mfr", geography: "US", estPrice: 9120, qualification: "Requires SAR" },
        { name: "Aero Components BV", type: "Distributor", geography: "Neutral / EU", estPrice: 9640, qualification: "Unqualified" },
      ],
      compliance: [
        { label: "Buy American", state: "required" },
        { label: "ITAR / EAR", state: "required" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "watch" },
      ],
      waterfall: { govPrice: 12200, supplierCost: 9800, freight: 210, inspCert: 340 },
      recommendation: "PURSUE",
      rationale: [
        "Three consecutive fiscal years of demand with a rising unit price trend.",
        "Two qualified non-incumbent sources already hold approved-source status.",
        "Margin holds above 30% even at the highest quoted supplier cost.",
      ],
    },
  },
  {
    id: "opp-eaton",
    score: 84,
    agency: "DLA Land and Maritime",
    solicitation: "SPE7M2-26-Q-1188",
    product: "Regulator, Thermostatic, Engine Coolant",
    nsn: "4820-01-556-3341",
    partNumber: "EATON 92211-004",
    fsc: "4820",
    quantity: 310,
    deadline: "2026-09-04",
    source: "sam",
    sourceLabel: "SAM.gov",
    incumbents: 2,
    demand: "HIGH",
    accessibility: "VERY HIGH",
    pricingConfidence: "MED",
    estValue: 286300,
    estMargin: 31,
    estGrossProfit: 88753,
    aiSummary:
      "Solid repeat-demand item with very high source accessibility — the regulator has commercial equivalence and five distributors stock it. Pricing confidence is only medium because the last two awards were bundled line items. Main risk: price compression from two active incumbents.",
    investigation: {
      platform: "M1152 HMMWV and FMTV cooling systems",
      historicalQty: [
        { year: "FY23", qty: 280, unitPrice: 842 },
        { year: "FY24", qty: 265, unitPrice: 878 },
        { year: "FY25", qty: 320, unitPrice: 923 },
      ],
      sources: [
        { name: "Eaton Aerospace", type: "OEM", geography: "US", estPrice: 640, qualification: "Approved Source" },
        { name: "Motion Industries", type: "Distributor", geography: "US", estPrice: 688, qualification: "Qualified" },
        { name: "Kaman Distribution", type: "Distributor", geography: "US", estPrice: 702, qualification: "Qualified" },
        { name: "Tecnord Srl", type: "Alternate Mfr", geography: "Neutral / EU", estPrice: 596, qualification: "Requires SAR" },
      ],
      compliance: [
        { label: "Buy American", state: "required" },
        { label: "ITAR / EAR", state: "clear" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "clear" },
      ],
      waterfall: { govPrice: 923, supplierCost: 640, freight: 24, inspCert: 45 },
      recommendation: "PURSUE",
      rationale: [
        "Commercial-equivalent part with no source-control restriction.",
        "Quantity of 310 EA supports volume pricing below the last award unit cost.",
        "Two incumbents may compress price — bid at the FY25 award level, not above.",
      ],
    },
  },
  {
    id: "opp-meggitt",
    score: 76,
    agency: "NSPA Capellen",
    solicitation: "NSPA-26-1204-BRK",
    product: "Brake Plate Assembly, Carbon, Main Landing Gear",
    nsn: "1630-12-341-8890",
    partNumber: "MEGGITT 5011332-1",
    fsc: "1630",
    quantity: 18,
    deadline: "2026-10-02",
    source: "nspa",
    sourceLabel: "NSPA",
    incumbents: 3,
    demand: "MED",
    accessibility: "MED",
    pricingConfidence: "HIGH",
    estValue: 448000,
    estMargin: 26,
    estGrossProfit: 116480,
    aiSummary:
      "Moderate candidate: NSPA publishes full historical award pricing so margin modelling is reliable, but three incumbents already hold framework positions and the carbon stack is OEM-controlled. Main risk: limited alternate manufacturing base.",
    investigation: {
      platform: "Eurofighter Typhoon main landing gear brake stack",
      historicalQty: [
        { year: "FY23", qty: 22, unitPrice: 23400 },
        { year: "FY24", qty: 14, unitPrice: 24100 },
        { year: "FY25", qty: 20, unitPrice: 24880 },
      ],
      sources: [
        { name: "Meggitt Aircraft Braking", type: "OEM", geography: "UK", estPrice: 18400, qualification: "Approved Source" },
        { name: "Safran Landing Systems", type: "Alternate Mfr", geography: "Neutral / EU", estPrice: 19100, qualification: "Requires SAR" },
        { name: "AeroParts Global", type: "Distributor", geography: "Global", estPrice: 20250, qualification: "Unqualified" },
      ],
      compliance: [
        { label: "Buy American", state: "clear" },
        { label: "ITAR / EAR", state: "watch" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "required" },
      ],
      waterfall: { govPrice: 24880, supplierCost: 18400, freight: 620, inspCert: 480 },
      recommendation: "INVESTIGATE FURTHER",
      rationale: [
        "Only one approved source today; the alternate manufacturer needs a full SAR package.",
        "Award history is transparent, so the bid ceiling is known within 3%.",
        "Three framework incumbents make win probability the binding constraint, not margin.",
      ],
    },
  },
  {
    id: "opp-parker",
    score: 68,
    agency: "US Army CCDC",
    solicitation: "W56HZV-26-R-0092",
    product: "Valve, Pressure Regulating, Fuel Transfer",
    nsn: "4820-01-118-7742",
    partNumber: "PARKER 6E12-4A",
    fsc: "4820",
    quantity: 96,
    deadline: "2026-08-29",
    source: "sam",
    sourceLabel: "SAM.gov",
    incumbents: 4,
    demand: "MED",
    accessibility: "HIGH",
    pricingConfidence: "MED",
    estValue: 178500,
    estMargin: 24,
    estGrossProfit: 42840,
    aiSummary:
      "Acceptable fill-in opportunity: accessible commercial supply base and a stable NSN, but demand is intermittent and four incumbents bid the last three solicitations. Main risk: award goes to lowest price with no technical differentiation.",
    investigation: {
      platform: "Abrams M1A2 SEPv3 fuel transfer subsystem",
      historicalQty: [
        { year: "FY23", qty: 60, unitPrice: 1720 },
        { year: "FY24", qty: 0, unitPrice: 0 },
        { year: "FY25", qty: 110, unitPrice: 1860 },
      ],
      sources: [
        { name: "Parker Hannifin", type: "OEM", geography: "US", estPrice: 1390, qualification: "Approved Source" },
        { name: "Applied Industrial", type: "Distributor", geography: "US", estPrice: 1465, qualification: "Qualified" },
        { name: "Hydraulic Supply Co.", type: "Surplus", geography: "US", estPrice: 1180, qualification: "Unqualified" },
      ],
      compliance: [
        { label: "Buy American", state: "required" },
        { label: "ITAR / EAR", state: "clear" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "clear" },
      ],
      waterfall: { govPrice: 1860, supplierCost: 1390, freight: 38, inspCert: 26 },
      recommendation: "LOW PRIORITY",
      rationale: [
        "FY24 had zero procurement — demand is intermittent rather than recurring.",
        "Four incumbents historically drive award price to the bottom of the band.",
        "Margin is real but the absolute gross profit does not justify bid-team hours.",
      ],
    },
  },
  {
    id: "opp-honeywell",
    score: 88,
    agency: "NCIA Brussels",
    solicitation: "NCIA-26-IFB-3307",
    product: "Environmental Control Condenser Assembly",
    nsn: "1660-01-402-7715",
    partNumber: "HONEYWELL 3288721-3",
    fsc: "1660",
    quantity: 24,
    deadline: "2026-09-25",
    source: "ncia",
    sourceLabel: "NCIA",
    incumbents: 1,
    demand: "HIGH",
    accessibility: "MED",
    pricingConfidence: "HIGH",
    estValue: 684000,
    estMargin: 34,
    estGrossProfit: 232560,
    aiSummary:
      "High-conviction candidate: single incumbent, recurring NATO sustainment demand, and complete award pricing history. Two neutral-geography manufacturers can supply the condenser core. Main risk: ITAR licensing lead time on the US-origin control valve.",
    investigation: {
      platform: "NATO AWACS E-3A environmental control system",
      historicalQty: [
        { year: "FY23", qty: 18, unitPrice: 26900 },
        { year: "FY24", qty: 22, unitPrice: 27650 },
        { year: "FY25", qty: 26, unitPrice: 28500 },
      ],
      sources: [
        { name: "Honeywell Aerospace", type: "OEM", geography: "US", estPrice: 21100, qualification: "Approved Source" },
        { name: "Liebherr-Aerospace", type: "Alternate Mfr", geography: "Neutral / EU", estPrice: 19800, qualification: "Requires SAR" },
        { name: "TAT Technologies", type: "Alternate Mfr", geography: "Neutral / IL", estPrice: 18950, qualification: "Requires SAR" },
        { name: "Satair A/S", type: "Distributor", geography: "Neutral / EU", estPrice: 22400, qualification: "Qualified" },
      ],
      compliance: [
        { label: "Buy American", state: "clear" },
        { label: "ITAR / EAR", state: "required" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "watch" },
      ],
      waterfall: { govPrice: 28500, supplierCost: 21100, freight: 780, inspCert: 620 },
      recommendation: "PURSUE",
      rationale: [
        "Single incumbent against a rising three-year demand curve.",
        "Two neutral-geography manufacturers undercut the OEM by 6-10%.",
        "Start the ITAR licence workflow now — it is the schedule driver, not production.",
      ],
    },
  },
  {
    id: "opp-collins",
    score: 72,
    agency: "DLA Aviation",
    solicitation: "SPE4A1-26-R-0778",
    product: "Actuator, Electro-Mechanical, Flap Drive",
    nsn: "1650-01-338-2201",
    partNumber: "COLLINS 4128-3B",
    fsc: "1650",
    quantity: 64,
    deadline: "2026-09-11",
    source: "dibbs",
    sourceLabel: "DLA DIBBS",
    incumbents: 2,
    demand: "HIGH",
    accessibility: "HIGH",
    pricingConfidence: "HIGH",
    estValue: 394000,
    estMargin: 29,
    estGrossProfit: 114260,
    aiSummary:
      "Actuator, Electro-Mechanical, Flap Drive for C-130J flap drive actuation. HIGH recurring demand with high source accessibility; pricing confidence is high based on prior award history. Main risk: 2 incumbent supplier(s) already positioned on this NSN.",
    investigation: {
      platform: "C-130J flap drive actuation",
      historicalQty: [
        { year: "FY23", qty: 54, unitPrice: 5725 },
        { year: "FY24", qty: 60, unitPrice: 5971 },
        { year: "FY25", qty: 64, unitPrice: 6156 },
      ],
      sources: [
        { name: "Collins Aerospace", type: "OEM", geography: "US", estPrice: 4371, qualification: "Approved Source" },
        { name: "Aviall Services", type: "Distributor", geography: "US", estPrice: 4633, qualification: "Qualified" },
        { name: "Aero Components BV", type: "Alternate Mfr", geography: "Neutral / EU", estPrice: 4108, qualification: "Requires SAR" },
      ],
      compliance: [
        { label: "Buy American", state: "required" },
        { label: "ITAR / EAR", state: "required" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "watch" },
      ],
      waterfall: { govPrice: 6156, supplierCost: 4371, freight: 123, inspCert: 153 },
      recommendation: "PURSUE",
      rationale: [
        "Three consecutive fiscal years of demand on this NSN.",
        "At least one non-incumbent source is qualified or SAR-eligible.",
        "Modelled margin of 29% holds at the highest quoted supplier cost.",
      ],
    },
  },
  {
    id: "opp-crane",
    score: 58,
    agency: "DLA Land and Maritime",
    solicitation: "SPE7L1-26-Q-0455",
    product: "Pump, Fuel, Motor Driven",
    nsn: "2910-01-221-9087",
    partNumber: "CRANE 3407-11",
    fsc: "2910",
    quantity: 120,
    deadline: "2026-08-27",
    source: "sam",
    sourceLabel: "SAM.gov",
    incumbents: 3,
    demand: "MED",
    accessibility: "VERY HIGH",
    pricingConfidence: "MED",
    estValue: 243000,
    estMargin: 27,
    estGrossProfit: 65610,
    aiSummary:
      "Pump, Fuel, Motor Driven for FMTV fuel delivery. MED recurring demand with very high source accessibility; pricing confidence is med based on prior award history. Main risk: 3 incumbent supplier(s) already positioned on this NSN.",
    investigation: {
      platform: "FMTV fuel delivery",
      historicalQty: [
        { year: "FY23", qty: 102, unitPrice: 1883 },
        { year: "FY24", qty: 114, unitPrice: 1964 },
        { year: "FY25", qty: 120, unitPrice: 2025 },
      ],
      sources: [
        { name: "Crane Aerospace", type: "OEM", geography: "US", estPrice: 1478, qualification: "Approved Source" },
        { name: "Aviall Services", type: "Distributor", geography: "US", estPrice: 1566, qualification: "Qualified" },
        { name: "Aero Components BV", type: "Alternate Mfr", geography: "Neutral / EU", estPrice: 1389, qualification: "Requires SAR" },
      ],
      compliance: [
        { label: "Buy American", state: "required" },
        { label: "ITAR / EAR", state: "required" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "clear" },
      ],
      waterfall: { govPrice: 2025, supplierCost: 1478, freight: 40, inspCert: 50 },
      recommendation: "INVESTIGATE FURTHER",
      rationale: [
        "Three consecutive fiscal years of demand on this NSN.",
        "At least one non-incumbent source is qualified or SAR-eligible.",
        "Modelled margin of 27% holds at the highest quoted supplier cost.",
      ],
    },
  },
  {
    id: "opp-bae-track",
    score: 64,
    agency: "US Army TACOM",
    solicitation: "W56HZV-26-R-0140",
    product: "Track Shoe Assembly, Rubber Bushed",
    nsn: "2530-01-090-4471",
    partNumber: "BAE 12376440",
    fsc: "2530",
    quantity: 840,
    deadline: "2026-09-30",
    source: "sam",
    sourceLabel: "SAM.gov",
    incumbents: 2,
    demand: "HIGH",
    accessibility: "HIGH",
    pricingConfidence: "HIGH",
    estValue: 612000,
    estMargin: 23,
    estGrossProfit: 140760,
    aiSummary:
      "Track Shoe Assembly, Rubber Bushed for Bradley M2A4 running gear. HIGH recurring demand with high source accessibility; pricing confidence is high based on prior award history. Main risk: 2 incumbent supplier(s) already positioned on this NSN.",
    investigation: {
      platform: "Bradley M2A4 running gear",
      historicalQty: [
        { year: "FY23", qty: 714, unitPrice: 677 },
        { year: "FY24", qty: 798, unitPrice: 707 },
        { year: "FY25", qty: 840, unitPrice: 729 },
      ],
      sources: [
        { name: "BAE Systems Land", type: "OEM", geography: "US", estPrice: 561, qualification: "Approved Source" },
        { name: "Aviall Services", type: "Distributor", geography: "US", estPrice: 594, qualification: "Qualified" },
        { name: "Aero Components BV", type: "Alternate Mfr", geography: "Neutral / EU", estPrice: 527, qualification: "Requires SAR" },
      ],
      compliance: [
        { label: "Buy American", state: "required" },
        { label: "ITAR / EAR", state: "required" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "watch" },
      ],
      waterfall: { govPrice: 729, supplierCost: 561, freight: 15, inspCert: 20 },
      recommendation: "INVESTIGATE FURTHER",
      rationale: [
        "Three consecutive fiscal years of demand on this NSN.",
        "At least one non-incumbent source is qualified or SAR-eligible.",
        "Modelled margin of 23% holds at the highest quoted supplier cost.",
      ],
    },
  },
  {
    id: "opp-goodrich",
    score: 77,
    agency: "NSPA Capellen",
    solicitation: "NSPA-26-0917-WHL",
    product: "Wheel Assembly, Nose Landing Gear",
    nsn: "1620-12-388-1140",
    partNumber: "GOODRICH 3-1620-2",
    fsc: "1620",
    quantity: 26,
    deadline: "2026-10-14",
    source: "nspa",
    sourceLabel: "NSPA",
    incumbents: 1,
    demand: "MED",
    accessibility: "MED",
    pricingConfidence: "HIGH",
    estValue: 358000,
    estMargin: 33,
    estGrossProfit: 118140,
    aiSummary:
      "Wheel Assembly, Nose Landing Gear for A400M nose landing gear. MED recurring demand with med source accessibility; pricing confidence is high based on prior award history. Main risk: 1 incumbent supplier(s) already positioned on this NSN.",
    investigation: {
      platform: "A400M nose landing gear",
      historicalQty: [
        { year: "FY23", qty: 22, unitPrice: 12805 },
        { year: "FY24", qty: 24, unitPrice: 13355 },
        { year: "FY25", qty: 26, unitPrice: 13769 },
      ],
      sources: [
        { name: "Collins (Goodrich) Wheels", type: "OEM", geography: "US", estPrice: 9225, qualification: "Approved Source" },
        { name: "Aviall Services", type: "Distributor", geography: "US", estPrice: 9778, qualification: "Qualified" },
        { name: "Aero Components BV", type: "Alternate Mfr", geography: "Neutral / EU", estPrice: 8671, qualification: "Requires SAR" },
      ],
      compliance: [
        { label: "Buy American", state: "required" },
        { label: "ITAR / EAR", state: "required" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "watch" },
      ],
      waterfall: { govPrice: 13769, supplierCost: 9225, freight: 275, inspCert: 344 },
      recommendation: "PURSUE",
      rationale: [
        "Three consecutive fiscal years of demand on this NSN.",
        "At least one non-incumbent source is qualified or SAR-eligible.",
        "Modelled margin of 33% holds at the highest quoted supplier cost.",
      ],
    },
  },
  {
    id: "opp-thales",
    score: 71,
    agency: "NCIA Brussels",
    solicitation: "NCIA-26-IFB-3391",
    product: "Transceiver Module, VHF Tactical Radio",
    nsn: "5820-12-402-6633",
    partNumber: "THALES TRC-9210",
    fsc: "5820",
    quantity: 48,
    deadline: "2026-09-19",
    source: "ncia",
    sourceLabel: "NCIA",
    incumbents: 2,
    demand: "HIGH",
    accessibility: "MED",
    pricingConfidence: "MED",
    estValue: 892000,
    estMargin: 28,
    estGrossProfit: 249760,
    aiSummary:
      "Transceiver Module, VHF Tactical Radio for NATO deployable comms node. HIGH recurring demand with med source accessibility; pricing confidence is med based on prior award history. Main risk: 2 incumbent supplier(s) already positioned on this NSN.",
    investigation: {
      platform: "NATO deployable comms node",
      historicalQty: [
        { year: "FY23", qty: 40, unitPrice: 17282 },
        { year: "FY24", qty: 45, unitPrice: 18025 },
        { year: "FY25", qty: 48, unitPrice: 18583 },
      ],
      sources: [
        { name: "Thales Communications", type: "OEM", geography: "Neutral / EU", estPrice: 13380, qualification: "Approved Source" },
        { name: "Aviall Services", type: "Distributor", geography: "US", estPrice: 14182, qualification: "Qualified" },
        { name: "Aero Components BV", type: "Alternate Mfr", geography: "Neutral / EU", estPrice: 12577, qualification: "Requires SAR" },
      ],
      compliance: [
        { label: "Buy American", state: "clear" },
        { label: "ITAR / EAR", state: "watch" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "watch" },
      ],
      waterfall: { govPrice: 18583, supplierCost: 13380, freight: 371, inspCert: 464 },
      recommendation: "PURSUE",
      rationale: [
        "Three consecutive fiscal years of demand on this NSN.",
        "At least one non-incumbent source is qualified or SAR-eligible.",
        "Modelled margin of 28% holds at the highest quoted supplier cost.",
      ],
    },
  },
  {
    id: "opp-curtiss",
    score: 62,
    agency: "DLA Aviation",
    solicitation: "SPE4A5-26-R-0512",
    product: "Valve, Butterfly, Bleed Air",
    nsn: "1650-01-471-3320",
    partNumber: "CURTISS 213888-2",
    fsc: "1650",
    quantity: 58,
    deadline: "2026-09-08",
    source: "dibbs",
    sourceLabel: "DLA DIBBS",
    incumbents: 3,
    demand: "HIGH",
    accessibility: "HIGH",
    pricingConfidence: "MED",
    estValue: 327500,
    estMargin: 25,
    estGrossProfit: 81875,
    aiSummary:
      "Valve, Butterfly, Bleed Air for KC-135R bleed air system. HIGH recurring demand with high source accessibility; pricing confidence is med based on prior award history. Main risk: 3 incumbent supplier(s) already positioned on this NSN.",
    investigation: {
      platform: "KC-135R bleed air system",
      historicalQty: [
        { year: "FY23", qty: 49, unitPrice: 5251 },
        { year: "FY24", qty: 55, unitPrice: 5477 },
        { year: "FY25", qty: 58, unitPrice: 5647 },
      ],
      sources: [
        { name: "Curtiss-Wright", type: "OEM", geography: "US", estPrice: 4235, qualification: "Approved Source" },
        { name: "Aviall Services", type: "Distributor", geography: "US", estPrice: 4489, qualification: "Qualified" },
        { name: "Aero Components BV", type: "Alternate Mfr", geography: "Neutral / EU", estPrice: 3980, qualification: "Requires SAR" },
      ],
      compliance: [
        { label: "Buy American", state: "required" },
        { label: "ITAR / EAR", state: "required" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "clear" },
      ],
      waterfall: { govPrice: 5647, supplierCost: 4235, freight: 112, inspCert: 141 },
      recommendation: "INVESTIGATE FURTHER",
      rationale: [
        "Three consecutive fiscal years of demand on this NSN.",
        "At least one non-incumbent source is qualified or SAR-eligible.",
        "Modelled margin of 25% holds at the highest quoted supplier cost.",
      ],
    },
  },
  {
    id: "opp-ametek",
    score: 46,
    agency: "DLA Land and Maritime",
    solicitation: "SPE7M4-26-Q-1330",
    product: "Regulator, Thermostatic, Transmission Oil",
    nsn: "4820-01-330-2214",
    partNumber: "AMETEK 55-2210",
    fsc: "4820",
    quantity: 260,
    deadline: "2026-08-31",
    source: "sam",
    sourceLabel: "SAM.gov",
    incumbents: 4,
    demand: "MED",
    accessibility: "VERY HIGH",
    pricingConfidence: "MED",
    estValue: 198400,
    estMargin: 22,
    estGrossProfit: 43648,
    aiSummary:
      "Regulator, Thermostatic, Transmission Oil for Stryker ICV powerpack cooling. MED recurring demand with very high source accessibility; pricing confidence is med based on prior award history. Main risk: 4 incumbent supplier(s) already positioned on this NSN.",
    investigation: {
      platform: "Stryker ICV powerpack cooling",
      historicalQty: [
        { year: "FY23", qty: 221, unitPrice: 709 },
        { year: "FY24", qty: 247, unitPrice: 740 },
        { year: "FY25", qty: 260, unitPrice: 763 },
      ],
      sources: [
        { name: "AMETEK Aerospace", type: "OEM", geography: "US", estPrice: 595, qualification: "Approved Source" },
        { name: "Aviall Services", type: "Distributor", geography: "US", estPrice: 630, qualification: "Qualified" },
        { name: "Aero Components BV", type: "Alternate Mfr", geography: "Neutral / EU", estPrice: 559, qualification: "Requires SAR" },
      ],
      compliance: [
        { label: "Buy American", state: "required" },
        { label: "ITAR / EAR", state: "required" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "clear" },
      ],
      waterfall: { govPrice: 763, supplierCost: 595, freight: 15, inspCert: 20 },
      recommendation: "INVESTIGATE FURTHER",
      rationale: [
        "Three consecutive fiscal years of demand on this NSN.",
        "At least one non-incumbent source is qualified or SAR-eligible.",
        "Modelled margin of 22% holds at the highest quoted supplier cost.",
      ],
    },
  },
  {
    id: "opp-safran-brake",
    score: 74,
    agency: "NSPA Capellen",
    solicitation: "NSPA-26-1355-BRK",
    product: "Brake Assembly, Wheel, Carbon Stack",
    nsn: "1630-12-360-9922",
    partNumber: "SAFRAN C21188-4",
    fsc: "1630",
    quantity: 22,
    deadline: "2026-10-08",
    source: "nspa",
    sourceLabel: "NSPA",
    incumbents: 2,
    demand: "HIGH",
    accessibility: "MED",
    pricingConfidence: "HIGH",
    estValue: 528000,
    estMargin: 30,
    estGrossProfit: 158400,
    aiSummary:
      "Brake Assembly, Wheel, Carbon Stack for Rafale main landing gear. HIGH recurring demand with med source accessibility; pricing confidence is high based on prior award history. Main risk: 2 incumbent supplier(s) already positioned on this NSN.",
    investigation: {
      platform: "Rafale main landing gear",
      historicalQty: [
        { year: "FY23", qty: 18, unitPrice: 22320 },
        { year: "FY24", qty: 20, unitPrice: 23280 },
        { year: "FY25", qty: 22, unitPrice: 24000 },
      ],
      sources: [
        { name: "Safran Landing Systems", type: "OEM", geography: "Neutral / EU", estPrice: 16800, qualification: "Approved Source" },
        { name: "Aviall Services", type: "Distributor", geography: "US", estPrice: 17808, qualification: "Qualified" },
        { name: "Aero Components BV", type: "Alternate Mfr", geography: "Neutral / EU", estPrice: 15792, qualification: "Requires SAR" },
      ],
      compliance: [
        { label: "Buy American", state: "clear" },
        { label: "ITAR / EAR", state: "watch" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "watch" },
      ],
      waterfall: { govPrice: 24000, supplierCost: 16800, freight: 480, inspCert: 600 },
      recommendation: "PURSUE",
      rationale: [
        "Three consecutive fiscal years of demand on this NSN.",
        "At least one non-incumbent source is qualified or SAR-eligible.",
        "Modelled margin of 30% holds at the highest quoted supplier cost.",
      ],
    },
  },
  {
    id: "opp-woodward",
    score: 87,
    agency: "DLA Aviation",
    solicitation: "SPE4A2-26-R-0620",
    product: "Governor, Fuel Control, Turbine Engine",
    nsn: "2915-01-215-7734",
    partNumber: "WOODWARD 8290-183",
    fsc: "2915",
    quantity: 34,
    deadline: "2026-09-22",
    source: "dibbs",
    sourceLabel: "DLA DIBBS",
    incumbents: 1,
    demand: "HIGH",
    accessibility: "MED",
    pricingConfidence: "HIGH",
    estValue: 766000,
    estMargin: 36,
    estGrossProfit: 275760,
    aiSummary:
      "Governor, Fuel Control, Turbine Engine for T700-GE-701D engine fuel control. HIGH recurring demand with med source accessibility; pricing confidence is high based on prior award history. Main risk: 1 incumbent supplier(s) already positioned on this NSN.",
    investigation: {
      platform: "T700-GE-701D engine fuel control",
      historicalQty: [
        { year: "FY23", qty: 28, unitPrice: 20951 },
        { year: "FY24", qty: 32, unitPrice: 21853 },
        { year: "FY25", qty: 34, unitPrice: 22529 },
      ],
      sources: [
        { name: "Woodward Inc.", type: "OEM", geography: "US", estPrice: 14419, qualification: "Approved Source" },
        { name: "Aviall Services", type: "Distributor", geography: "US", estPrice: 15284, qualification: "Qualified" },
        { name: "Aero Components BV", type: "Alternate Mfr", geography: "Neutral / EU", estPrice: 13553, qualification: "Requires SAR" },
      ],
      compliance: [
        { label: "Buy American", state: "required" },
        { label: "ITAR / EAR", state: "required" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "watch" },
      ],
      waterfall: { govPrice: 22529, supplierCost: 14419, freight: 450, inspCert: 563 },
      recommendation: "PURSUE",
      rationale: [
        "Three consecutive fiscal years of demand on this NSN.",
        "At least one non-incumbent source is qualified or SAR-eligible.",
        "Modelled margin of 36% holds at the highest quoted supplier cost.",
      ],
    },
  },
  {
    id: "opp-l3-display",
    score: 62,
    agency: "US Air Force AFLCMC",
    solicitation: "FA8540-26-R-0033",
    product: "Multifunction Display Unit, Cockpit",
    nsn: "5895-01-522-8890",
    partNumber: "L3H MFD-8800",
    fsc: "5895",
    quantity: 30,
    deadline: "2026-09-16",
    source: "sam",
    sourceLabel: "SAM.gov",
    incumbents: 2,
    demand: "MED",
    accessibility: "MED",
    pricingConfidence: "MED",
    estValue: 545000,
    estMargin: 26,
    estGrossProfit: 141700,
    aiSummary:
      "Multifunction Display Unit, Cockpit for C-17 avionics modernization. MED recurring demand with med source accessibility; pricing confidence is med based on prior award history. Main risk: 2 incumbent supplier(s) already positioned on this NSN.",
    investigation: {
      platform: "C-17 avionics modernization",
      historicalQty: [
        { year: "FY23", qty: 25, unitPrice: 16895 },
        { year: "FY24", qty: 28, unitPrice: 17621 },
        { year: "FY25", qty: 30, unitPrice: 18167 },
      ],
      sources: [
        { name: "L3Harris Avionics", type: "OEM", geography: "US", estPrice: 13444, qualification: "Approved Source" },
        { name: "Aviall Services", type: "Distributor", geography: "US", estPrice: 14250, qualification: "Qualified" },
        { name: "Aero Components BV", type: "Alternate Mfr", geography: "Neutral / EU", estPrice: 12637, qualification: "Requires SAR" },
      ],
      compliance: [
        { label: "Buy American", state: "required" },
        { label: "ITAR / EAR", state: "required" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "watch" },
      ],
      waterfall: { govPrice: 18167, supplierCost: 13444, freight: 363, inspCert: 454 },
      recommendation: "INVESTIGATE FURTHER",
      rationale: [
        "Three consecutive fiscal years of demand on this NSN.",
        "At least one non-incumbent source is qualified or SAR-eligible.",
        "Modelled margin of 26% holds at the highest quoted supplier cost.",
      ],
    },
  },
  {
    id: "opp-hydro-cyl",
    score: 40,
    agency: "US Army CCDC",
    solicitation: "W56HZV-26-R-0166",
    product: "Cylinder, Hydraulic, Lift Assembly",
    nsn: "1560-01-410-0056",
    partNumber: "HYCO 442119-7",
    fsc: "1560",
    quantity: 74,
    deadline: "2026-08-25",
    source: "sam",
    sourceLabel: "SAM.gov",
    incumbents: 5,
    demand: "LOW",
    accessibility: "HIGH",
    pricingConfidence: "LOW",
    estValue: 132000,
    estMargin: 19,
    estGrossProfit: 25080,
    aiSummary:
      "Cylinder, Hydraulic, Lift Assembly for HEMTT crane lift assembly. LOW recurring demand with high source accessibility; pricing confidence is low based on prior award history. Main risk: 5 incumbent supplier(s) already positioned on this NSN.",
    investigation: {
      platform: "HEMTT crane lift assembly",
      historicalQty: [
        { year: "FY23", qty: 62, unitPrice: 1659 },
        { year: "FY24", qty: 70, unitPrice: 1730 },
        { year: "FY25", qty: 74, unitPrice: 1784 },
      ],
      sources: [
        { name: "HYCO International", type: "OEM", geography: "US", estPrice: 1445, qualification: "Approved Source" },
        { name: "Aviall Services", type: "Distributor", geography: "US", estPrice: 1531, qualification: "Qualified" },
        { name: "Aero Components BV", type: "Alternate Mfr", geography: "Neutral / EU", estPrice: 1358, qualification: "Requires SAR" },
      ],
      compliance: [
        { label: "Buy American", state: "required" },
        { label: "ITAR / EAR", state: "required" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "clear" },
      ],
      waterfall: { govPrice: 1784, supplierCost: 1445, freight: 35, inspCert: 44 },
      recommendation: "LOW PRIORITY",
      rationale: [
        "Three consecutive fiscal years of demand on this NSN.",
        "At least one non-incumbent source is qualified or SAR-eligible.",
        "Modelled margin of 19% holds at the highest quoted supplier cost.",
      ],
    },
  },
  {
    id: "opp-mtu-inject",
    score: 60,
    agency: "NSPA Capellen",
    solicitation: "NSPA-26-1401-INJ",
    product: "Injector Assembly, Diesel Engine",
    nsn: "2910-12-315-4477",
    partNumber: "MTU 5550700251",
    fsc: "2910",
    quantity: 190,
    deadline: "2026-09-29",
    source: "nspa",
    sourceLabel: "NSPA",
    incumbents: 3,
    demand: "HIGH",
    accessibility: "HIGH",
    pricingConfidence: "MED",
    estValue: 286000,
    estMargin: 24,
    estGrossProfit: 68640,
    aiSummary:
      "Injector Assembly, Diesel Engine for Leopard 2A7 MTU MB873 powerpack. HIGH recurring demand with high source accessibility; pricing confidence is med based on prior award history. Main risk: 3 incumbent supplier(s) already positioned on this NSN.",
    investigation: {
      platform: "Leopard 2A7 MTU MB873 powerpack",
      historicalQty: [
        { year: "FY23", qty: 161, unitPrice: 1399 },
        { year: "FY24", qty: 180, unitPrice: 1459 },
        { year: "FY25", qty: 190, unitPrice: 1505 },
      ],
      sources: [
        { name: "MTU Friedrichshafen", type: "OEM", geography: "Neutral / EU", estPrice: 1144, qualification: "Approved Source" },
        { name: "Aviall Services", type: "Distributor", geography: "US", estPrice: 1212, qualification: "Qualified" },
        { name: "Aero Components BV", type: "Alternate Mfr", geography: "Neutral / EU", estPrice: 1075, qualification: "Requires SAR" },
      ],
      compliance: [
        { label: "Buy American", state: "clear" },
        { label: "ITAR / EAR", state: "watch" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "clear" },
      ],
      waterfall: { govPrice: 1505, supplierCost: 1144, freight: 30, inspCert: 37 },
      recommendation: "INVESTIGATE FURTHER",
      rationale: [
        "Three consecutive fiscal years of demand on this NSN.",
        "At least one non-incumbent source is qualified or SAR-eligible.",
        "Modelled margin of 24% holds at the highest quoted supplier cost.",
      ],
    },
  },
  {
    id: "opp-kongsberg",
    score: 75,
    agency: "NCIA Brussels",
    solicitation: "NCIA-26-IFB-3420",
    product: "Antenna Assembly, SATCOM Terminal",
    nsn: "5985-12-377-1180",
    partNumber: "KONGSBERG SAT-440",
    fsc: "5985",
    quantity: 16,
    deadline: "2026-10-20",
    source: "ncia",
    sourceLabel: "NCIA",
    incumbents: 1,
    demand: "MED",
    accessibility: "MED",
    pricingConfidence: "HIGH",
    estValue: 712000,
    estMargin: 32,
    estGrossProfit: 227840,
    aiSummary:
      "Antenna Assembly, SATCOM Terminal for NATO deployable SATCOM terminal. MED recurring demand with med source accessibility; pricing confidence is high based on prior award history. Main risk: 1 incumbent supplier(s) already positioned on this NSN.",
    investigation: {
      platform: "NATO deployable SATCOM terminal",
      historicalQty: [
        { year: "FY23", qty: 13, unitPrice: 41385 },
        { year: "FY24", qty: 15, unitPrice: 43165 },
        { year: "FY25", qty: 16, unitPrice: 44500 },
      ],
      sources: [
        { name: "Kongsberg Defence", type: "OEM", geography: "Neutral / EU", estPrice: 30260, qualification: "Approved Source" },
        { name: "Aviall Services", type: "Distributor", geography: "US", estPrice: 32075, qualification: "Qualified" },
        { name: "Aero Components BV", type: "Alternate Mfr", geography: "Neutral / EU", estPrice: 28444, qualification: "Requires SAR" },
      ],
      compliance: [
        { label: "Buy American", state: "clear" },
        { label: "ITAR / EAR", state: "watch" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "watch" },
      ],
      waterfall: { govPrice: 44500, supplierCost: 30260, freight: 890, inspCert: 1112 },
      recommendation: "PURSUE",
      rationale: [
        "Three consecutive fiscal years of demand on this NSN.",
        "At least one non-incumbent source is qualified or SAR-eligible.",
        "Modelled margin of 32% holds at the highest quoted supplier cost.",
      ],
    },
  },
  {
    id: "opp-eaton-hose",
    score: 41,
    agency: "DLA Land and Maritime",
    solicitation: "SPE7M8-26-Q-1477",
    product: "Hose Assembly, Hydraulic, High Pressure",
    nsn: "4720-01-284-6612",
    partNumber: "EATON 6R4-0480",
    fsc: "4720",
    quantity: 1200,
    deadline: "2026-08-24",
    source: "sam",
    sourceLabel: "SAM.gov",
    incumbents: 6,
    demand: "HIGH",
    accessibility: "VERY HIGH",
    pricingConfidence: "HIGH",
    estValue: 164000,
    estMargin: 21,
    estGrossProfit: 34440,
    aiSummary:
      "Hose Assembly, Hydraulic, High Pressure for HMMWV / FMTV hydraulic lines. HIGH recurring demand with very high source accessibility; pricing confidence is high based on prior award history. Main risk: 6 incumbent supplier(s) already positioned on this NSN.",
    investigation: {
      platform: "HMMWV / FMTV hydraulic lines",
      historicalQty: [
        { year: "FY23", qty: 1020, unitPrice: 127 },
        { year: "FY24", qty: 1140, unitPrice: 132 },
        { year: "FY25", qty: 1200, unitPrice: 137 },
      ],
      sources: [
        { name: "Eaton Hydraulics", type: "OEM", geography: "US", estPrice: 108, qualification: "Approved Source" },
        { name: "Aviall Services", type: "Distributor", geography: "US", estPrice: 114, qualification: "Qualified" },
        { name: "Aero Components BV", type: "Alternate Mfr", geography: "Neutral / EU", estPrice: 101, qualification: "Requires SAR" },
      ],
      compliance: [
        { label: "Buy American", state: "required" },
        { label: "ITAR / EAR", state: "required" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "clear" },
      ],
      waterfall: { govPrice: 137, supplierCost: 108, freight: 15, inspCert: 20 },
      recommendation: "LOW PRIORITY",
      rationale: [
        "Three consecutive fiscal years of demand on this NSN.",
        "At least one non-incumbent source is qualified or SAR-eligible.",
        "Modelled margin of 21% holds at the highest quoted supplier cost.",
      ],
    },
  },
  {
    id: "opp-triumph",
    score: 80,
    agency: "DLA Aviation",
    solicitation: "SPE4A9-26-R-0844",
    product: "Gearbox, Accessory Drive",
    nsn: "1615-01-256-3391",
    partNumber: "TRIUMPH 21855-100",
    fsc: "1615",
    quantity: 12,
    deadline: "2026-10-05",
    source: "dibbs",
    sourceLabel: "DLA DIBBS",
    incumbents: 1,
    demand: "MED",
    accessibility: "LOW",
    pricingConfidence: "HIGH",
    estValue: 468000,
    estMargin: 35,
    estGrossProfit: 163800,
    aiSummary:
      "Gearbox, Accessory Drive for UH-60M accessory drive. MED recurring demand with low source accessibility; pricing confidence is high based on prior award history. Main risk: 1 incumbent supplier(s) already positioned on this NSN.",
    investigation: {
      platform: "UH-60M accessory drive",
      historicalQty: [
        { year: "FY23", qty: 10, unitPrice: 36270 },
        { year: "FY24", qty: 11, unitPrice: 37830 },
        { year: "FY25", qty: 12, unitPrice: 39000 },
      ],
      sources: [
        { name: "Triumph Gear Systems", type: "OEM", geography: "US", estPrice: 25350, qualification: "Approved Source" },
        { name: "Aviall Services", type: "Distributor", geography: "US", estPrice: 26871, qualification: "Qualified" },
        { name: "Aero Components BV", type: "Alternate Mfr", geography: "Neutral / EU", estPrice: 23829, qualification: "Requires SAR" },
      ],
      compliance: [
        { label: "Buy American", state: "required" },
        { label: "ITAR / EAR", state: "required" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "watch" },
      ],
      waterfall: { govPrice: 39000, supplierCost: 25350, freight: 780, inspCert: 975 },
      recommendation: "PURSUE",
      rationale: [
        "Three consecutive fiscal years of demand on this NSN.",
        "At least one non-incumbent source is qualified or SAR-eligible.",
        "Modelled margin of 35% holds at the highest quoted supplier cost.",
      ],
    },
  },
  {
    id: "opp-saab-radar",
    score: 58,
    agency: "NCIA Brussels",
    solicitation: "NCIA-26-IFB-3455",
    product: "Power Amplifier Module, Radar Transmitter",
    nsn: "5895-12-390-2277",
    partNumber: "SAAB PAM-3300",
    fsc: "5895",
    quantity: 20,
    deadline: "2026-09-27",
    source: "ncia",
    sourceLabel: "NCIA",
    incumbents: 3,
    demand: "MED",
    accessibility: "MED",
    pricingConfidence: "MED",
    estValue: 938000,
    estMargin: 27,
    estGrossProfit: 253260,
    aiSummary:
      "Power Amplifier Module, Radar Transmitter for NATO ground surveillance radar. MED recurring demand with med source accessibility; pricing confidence is med based on prior award history. Main risk: 3 incumbent supplier(s) already positioned on this NSN.",
    investigation: {
      platform: "NATO ground surveillance radar",
      historicalQty: [
        { year: "FY23", qty: 17, unitPrice: 43617 },
        { year: "FY24", qty: 19, unitPrice: 45493 },
        { year: "FY25", qty: 20, unitPrice: 46900 },
      ],
      sources: [
        { name: "Saab Surveillance", type: "OEM", geography: "Neutral / EU", estPrice: 34237, qualification: "Approved Source" },
        { name: "Aviall Services", type: "Distributor", geography: "US", estPrice: 36291, qualification: "Qualified" },
        { name: "Aero Components BV", type: "Alternate Mfr", geography: "Neutral / EU", estPrice: 32182, qualification: "Requires SAR" },
      ],
      compliance: [
        { label: "Buy American", state: "clear" },
        { label: "ITAR / EAR", state: "watch" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "clear" },
      ],
      waterfall: { govPrice: 46900, supplierCost: 34237, freight: 938, inspCert: 1172 },
      recommendation: "INVESTIGATE FURTHER",
      rationale: [
        "Three consecutive fiscal years of demand on this NSN.",
        "At least one non-incumbent source is qualified or SAR-eligible.",
        "Modelled margin of 27% holds at the highest quoted supplier cost.",
      ],
    },
  },
  {
    id: "opp-swagelok",
    score: 40,
    agency: "DLA Land and Maritime",
    solicitation: "SPE7L6-26-Q-1502",
    product: "Fitting, Tube, Stainless, Fuel System",
    nsn: "4730-01-119-2245",
    partNumber: "SWAGELOK SS-810-6",
    fsc: "4730",
    quantity: 4200,
    deadline: "2026-08-21",
    source: "sam",
    sourceLabel: "SAM.gov",
    incumbents: 8,
    demand: "HIGH",
    accessibility: "VERY HIGH",
    pricingConfidence: "HIGH",
    estValue: 96000,
    estMargin: 18,
    estGrossProfit: 17280,
    aiSummary:
      "Fitting, Tube, Stainless, Fuel System for Naval fuel transfer piping. HIGH recurring demand with very high source accessibility; pricing confidence is high based on prior award history. Main risk: 8 incumbent supplier(s) already positioned on this NSN.",
    investigation: {
      platform: "Naval fuel transfer piping",
      historicalQty: [
        { year: "FY23", qty: 3570, unitPrice: 21 },
        { year: "FY24", qty: 3990, unitPrice: 22 },
        { year: "FY25", qty: 4200, unitPrice: 23 },
      ],
      sources: [
        { name: "Swagelok Co.", type: "OEM", geography: "US", estPrice: 19, qualification: "Approved Source" },
        { name: "Aviall Services", type: "Distributor", geography: "US", estPrice: 20, qualification: "Qualified" },
        { name: "Aero Components BV", type: "Alternate Mfr", geography: "Neutral / EU", estPrice: 17, qualification: "Requires SAR" },
      ],
      compliance: [
        { label: "Buy American", state: "required" },
        { label: "ITAR / EAR", state: "required" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "clear" },
      ],
      waterfall: { govPrice: 23, supplierCost: 19, freight: 15, inspCert: 20 },
      recommendation: "LOW PRIORITY",
      rationale: [
        "Three consecutive fiscal years of demand on this NSN.",
        "At least one non-incumbent source is qualified or SAR-eligible.",
        "Modelled margin of 18% holds at the highest quoted supplier cost.",
      ],
    },
  },
  {
    id: "opp-leonardo",
    score: 63,
    agency: "NSPA Capellen",
    solicitation: "NSPA-26-1466-GBX",
    product: "Transmission Module, Rotorcraft Main Gearbox",
    nsn: "1615-12-344-8811",
    partNumber: "LEONARDO 4G6220V01",
    fsc: "1615",
    quantity: 8,
    deadline: "2026-10-23",
    source: "nspa",
    sourceLabel: "NSPA",
    incumbents: 2,
    demand: "LOW",
    accessibility: "LOW",
    pricingConfidence: "MED",
    estValue: 884000,
    estMargin: 31,
    estGrossProfit: 274040,
    aiSummary:
      "Transmission Module, Rotorcraft Main Gearbox for NH90 main gearbox overhaul kit. LOW recurring demand with low source accessibility; pricing confidence is med based on prior award history. Main risk: 2 incumbent supplier(s) already positioned on this NSN.",
    investigation: {
      platform: "NH90 main gearbox overhaul kit",
      historicalQty: [
        { year: "FY23", qty: 6, unitPrice: 102765 },
        { year: "FY24", qty: 7, unitPrice: 107185 },
        { year: "FY25", qty: 8, unitPrice: 110500 },
      ],
      sources: [
        { name: "Leonardo Helicopters", type: "OEM", geography: "Neutral / EU", estPrice: 76245, qualification: "Approved Source" },
        { name: "Aviall Services", type: "Distributor", geography: "US", estPrice: 80819, qualification: "Qualified" },
        { name: "Aero Components BV", type: "Alternate Mfr", geography: "Neutral / EU", estPrice: 71670, qualification: "Requires SAR" },
      ],
      compliance: [
        { label: "Buy American", state: "clear" },
        { label: "ITAR / EAR", state: "watch" },
        { label: "Berry Amendment", state: "clear" },
        { label: "Source-Controlled", state: "watch" },
      ],
      waterfall: { govPrice: 110500, supplierCost: 76245, freight: 2210, inspCert: 2762 },
      recommendation: "PURSUE",
      rationale: [
        "Three consecutive fiscal years of demand on this NSN.",
        "At least one non-incumbent source is qualified or SAR-eligible.",
        "Modelled margin of 31% holds at the highest quoted supplier cost.",
      ],
    },
  },
];

export function runHunt(params: HuntParams, data: Opportunity[]): Opportunity[] {
  return data
    .filter((o) => {
      if (!params.sources[o.source]) return false;
      if (o.estMargin < params.minMargin) return false;
      if (o.estValue < params.minValue) return false;
      if (o.incumbents > params.maxIncumbents) return false;
      if (params.fscCodes.length > 0 && !params.fscCodes.includes(o.fsc)) return false;
      return true;
    })
    .sort((a, b) => b.score - a.score);
}

export type HuntDiagnostics = {
  total: number;
  matched: number;
  excluded: { reason: string; count: number }[];
};

export function explainHunt(params: HuntParams, data: Opportunity[]): HuntDiagnostics {
  const counts: Record<string, number> = {};
  let matched = 0;
  for (const o of data) {
    let reason: string | null = null;
    if (!params.sources[o.source]) reason = `Source not selected (${o.sourceLabel})`;
    else if (o.estMargin < params.minMargin) reason = `Margin below ${params.minMargin}%`;
    else if (o.estValue < params.minValue) reason = "Contract value too small";
    else if (o.incumbents > params.maxIncumbents) reason = `More than ${params.maxIncumbents} competitors`;
    else if (params.fscCodes.length > 0 && !params.fscCodes.includes(o.fsc))
      reason = "FSC code not in your list";
    if (reason) counts[reason] = (counts[reason] ?? 0) + 1;
    else matched += 1;
  }
  return {
    total: data.length,
    matched,
    excluded: Object.entries(counts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count),
  };
}
