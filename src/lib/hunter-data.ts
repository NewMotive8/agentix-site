export type Level = "HIGH" | "MED" | "LOW";
export type Accessibility = "VERY HIGH" | "HIGH" | "MED" | "LOW" | "VERY LOW";
export type SourceKey = "sam" | "dibbs" | "nspa" | "ncia";
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
};

export const defaultParams: HuntParams = {
  minMargin: 20,
  minValue: 100000,
  maxIncumbents: 3,
  fscCodes: ["1650", "2530", "4820"],
  sources: { sam: true, dibbs: true, nspa: true, ncia: false },
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
      sources: { sam: true, dibbs: true, nspa: false, ncia: false },
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
      sources: { sam: true, dibbs: true, nspa: true, ncia: true },
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
      sources: { sam: true, dibbs: false, nspa: true, ncia: true },
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
      sources: { sam: false, dibbs: false, nspa: true, ncia: true },
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
      sources: { sam: true, dibbs: true, nspa: true, ncia: false },
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
