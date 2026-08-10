export type PricingHistory = {
  date: string;
  price: number;
  vendor: string;
};

export type Opportunity = {
  id: string;
  score: number;
  source: "NSPA" | "SAM.gov" | "DLA DIBBS";
  nsn: string;
  partNumber: string;
  fsc: string;
  nomenclature: string;
  estValue: number;
  estMargin: number;
  incumbents: string[];
  closingDate: string;
  details: {
    description: string;
    qty: number;
    deliveryTerms: string;
    history: PricingHistory[];
  };
};

export type EnginePrefs = {
  minMargin: number;
  minValue: number;
  maxIncumbents: number;
  fscCodes: string[];
  sources: {
    nspa: boolean;
    sam: boolean;
    dla: boolean;
  };
};

export const defaultPrefs: EnginePrefs = {
  minMargin: 25,
  minValue: 150000,
  maxIncumbents: 1,
  fscCodes: [],
  sources: { nspa: true, sam: true, dla: true },
};

export function filterOpportunities(prefs: EnginePrefs, data: Opportunity[]): Opportunity[] {
  return data
    .filter((opp) => {
      if (opp.estMargin < prefs.minMargin) return false;
      if (opp.estValue < prefs.minValue) return false;
      if (opp.incumbents.length > prefs.maxIncumbents) return false;
      if (prefs.fscCodes.length > 0 && !prefs.fscCodes.includes(opp.fsc)) return false;
      if (opp.source === "NSPA" && !prefs.sources.nspa) return false;
      if (opp.source === "SAM.gov" && !prefs.sources.sam) return false;
      if (opp.source === "DLA DIBBS" && !prefs.sources.dla) return false;
      return true;
    })
    .sort((a, b) => b.score - a.score);
}

export const mockOpportunities: Opportunity[] = [
  {
    id: "OPT-101",
    score: 94,
    source: "SAM.gov",
    nsn: "4820-01-462-4859",
    partNumber: "12345678-3",
    fsc: "4820",
    nomenclature: "REGULATOR, THERMOSTATIC TEMPERATURE",
    estValue: 1596000,
    estMargin: 48,
    incumbents: ["Eaton Corporation"],
    closingDate: "2026-08-14",
    details: {
      description:
        "Heavy-duty thermostatic cooling fluid regulator for heavy combat ground vehicles (Abrams/Bradley). Source controlled. Category III SAR required for alternate sources.",
      qty: 114,
      deliveryTerms: "FOB Origin, 180 Days ARO",
      history: [
        { date: "2025-12-10", price: 14000, vendor: "Jamaica Bearings" },
        { date: "2024-03-15", price: 12500, vendor: "Jamaica Bearings" },
      ],
    },
  },
  {
    id: "OPT-102",
    score: 89,
    source: "DLA DIBBS",
    nsn: "4320-01-207-5313",
    partNumber: "79-320A",
    fsc: "4320",
    nomenclature: "VALVE, SERVO",
    estValue: 1150000,
    estMargin: 56,
    incumbents: ["Moog Inc"],
    closingDate: "2026-08-20",
    details: {
      description:
        "Electro-Hydraulic Servo Valve (EHSV) for F110 turbofan engine (F-16/F-15). Requires extreme precision spool lapping and dynamic frequency testing.",
      qty: 91,
      deliveryTerms: "FOB Destination, 240 Days ARO",
      history: [
        { date: "2026-06-01", price: 15248, vendor: "Moog Inc" },
        { date: "2024-11-20", price: 14100, vendor: "Moog Inc" },
        { date: "2022-09-05", price: 11756, vendor: "Moog Inc" },
      ],
    },
  },
  {
    id: "OPT-103",
    score: 92,
    source: "NSPA",
    nsn: "1630-01-464-8655",
    partNumber: "5008345-1",
    fsc: "1630",
    nomenclature: "DISC, ROTATING, BRAKE",
    estValue: 1850000,
    estMargin: 35,
    incumbents: ["Meggitt Aircraft Braking Systems"],
    closingDate: "2026-09-01",
    details: {
      description:
        "Aerospace friction material rotating brake disc. NATO Strategic Procurement.",
      qty: 1097,
      deliveryTerms: "Ex Works, 90 Days ARO",
      history: [
        { date: "2025-01-14", price: 1686, vendor: "MABS" },
        { date: "2023-04-12", price: 1550, vendor: "MABS" },
      ],
    },
  },
  {
    id: "OPT-104",
    score: 78,
    source: "SAM.gov",
    nsn: "4810-01-622-6215",
    partNumber: "AV24C-1120",
    fsc: "4810",
    nomenclature: "VALVE, REGULATING, FLUID PRESSURE",
    estValue: 448500,
    estMargin: 65,
    incumbents: ["Eaton Corporation"],
    closingDate: "2026-08-18",
    details: {
      description:
        "Hydraulic pressure regulating valve for V-22 Osprey. High distributor markup historically observed.",
      qty: 39,
      deliveryTerms: "FOB Origin, 120 Days ARO",
      history: [
        { date: "2026-01-05", price: 11500, vendor: "Jamaica Bearings" },
        { date: "2024-07-22", price: 9200, vendor: "Jamaica Bearings" },
      ],
    },
  },
  {
    id: "OPT-105",
    score: 82,
    source: "DLA DIBBS",
    nsn: "2915-01-060-1265",
    partNumber: "394700-3",
    fsc: "2915",
    nomenclature: "VALVE, FUEL PRESSURIZING",
    estValue: 312000,
    estMargin: 42,
    incumbents: ["ITT Aerospace"],
    closingDate: "2026-08-25",
    details: {
      description:
        "Fuel pressurizing and drain valve for KC-135 Stratotanker. Legacy fleet sustainment.",
      qty: 78,
      deliveryTerms: "FOB Destination, 160 Days ARO",
      history: [
        { date: "2025-08-19", price: 4000, vendor: "ITT" },
        { date: "2023-10-11", price: 3850, vendor: "ITT" },
      ],
    },
  },
  {
    id: "OPT-106",
    score: 45,
    source: "SAM.gov",
    nsn: "5330-00-076-4299",
    partNumber: "MS28775-214",
    fsc: "5330",
    nomenclature: "PACK ASSEMBLY",
    estValue: 85000,
    estMargin: 15,
    incumbents: ["Parker Hannifin", "TAT Technologies", "Federal Industries"],
    closingDate: "2026-08-12",
    details: {
      description:
        "Elastomeric pack assembly. 'CROWN JEWEL' designated but highly competitive commodity.",
      qty: 500,
      deliveryTerms: "FOB Origin, 60 Days ARO",
      history: [
        { date: "2025-11-01", price: 170, vendor: "Federal Industries" },
        { date: "2025-02-14", price: 195, vendor: "TAT Tech" },
      ],
    },
  },
  {
    id: "OPT-107",
    score: 85,
    source: "NSPA",
    nsn: "2530-01-123-4567",
    partNumber: "12480259",
    fsc: "2530",
    nomenclature: "ROTOR SEGMENT, VEHICULAR BRAKE",
    estValue: 890000,
    estMargin: 38,
    incumbents: ["Safran"],
    closingDate: "2026-09-10",
    details: {
      description:
        "Heavy military transport brake rotor segment. Requires precision casting and heat treatment.",
      qty: 450,
      deliveryTerms: "FCA, 150 Days ARO",
      history: [{ date: "2025-04-10", price: 1977, vendor: "Safran" }],
    },
  },
  {
    id: "OPT-108",
    score: 91,
    source: "SAM.gov",
    nsn: "4130-01-987-6543",
    partNumber: "CN-4471-02",
    fsc: "4130",
    nomenclature: "CONDENSER, REFRIGERATION",
    estValue: 1250000,
    estMargin: 51,
    incumbents: ["Collins Aerospace"],
    closingDate: "2026-08-30",
    details: {
      description:
        "Aerospace environmental control system condenser unit. Complex brazing required.",
      qty: 120,
      deliveryTerms: "FOB Origin, 180 Days ARO",
      history: [{ date: "2024-12-05", price: 10416, vendor: "Collins Aerospace" }],
    },
  },
  {
    id: "OPT-109",
    score: 87,
    source: "NSPA",
    nsn: "4820-01-338-9012",
    partNumber: "SV-7712-BA",
    fsc: "4820",
    nomenclature: "VALVE, SHUTOFF, BLEED AIR",
    estValue: 725000,
    estMargin: 44,
    incumbents: ["Honeywell International"],
    closingDate: "2026-09-18",
    details: {
      description:
        "Pneumatic bleed air shutoff valve for C-130J propulsion bleed manifold. Qualification testing to MIL-STD-810H required; single approved source since 2011.",
      qty: 64,
      deliveryTerms: "FCA, 200 Days ARO",
      history: [
        { date: "2025-06-22", price: 11328, vendor: "Honeywell International" },
        { date: "2023-08-30", price: 9840, vendor: "Honeywell International" },
      ],
    },
  },
  {
    id: "OPT-110",
    score: 73,
    source: "DLA DIBBS",
    nsn: "1630-01-551-2288",
    partNumber: "2-1622-3",
    fsc: "1630",
    nomenclature: "PLATE, BRAKE, STATIONARY",
    estValue: 528000,
    estMargin: 31,
    incumbents: ["Collins Aerospace"],
    closingDate: "2026-08-28",
    details: {
      description:
        "Carbon stationary brake plate for F/A-18E/F main wheel assembly. Friction coefficient certification per OEM data package.",
      qty: 320,
      deliveryTerms: "FOB Destination, 140 Days ARO",
      history: [
        { date: "2026-02-11", price: 1650, vendor: "Collins Aerospace" },
        { date: "2024-05-09", price: 1490, vendor: "Collins Aerospace" },
      ],
    },
  },
  {
    id: "OPT-111",
    score: 68,
    source: "SAM.gov",
    nsn: "4820-01-104-7731",
    partNumber: "TR-880-14",
    fsc: "4820",
    nomenclature: "REGULATOR, TEMPERATURE, THERMOSTATIC",
    estValue: 196000,
    estMargin: 29,
    incumbents: ["Parker Hannifin", "Ametek"],
    closingDate: "2026-09-04",
    details: {
      description:
        "Thermostatic regulator for shipboard auxiliary cooling loops. Two approved sources; NAVSEA level I material traceability required.",
      qty: 210,
      deliveryTerms: "FOB Origin, 110 Days ARO",
      history: [
        { date: "2025-09-30", price: 933, vendor: "Ametek" },
        { date: "2024-01-18", price: 870, vendor: "Parker Hannifin" },
      ],
    },
  },
  {
    id: "OPT-112",
    score: 96,
    source: "NSPA",
    nsn: "2530-01-449-7745",
    partNumber: "BRK-4490-SG",
    fsc: "2530",
    nomenclature: "PLATE, BRAKE, VEHICULAR",
    estValue: 1420000,
    estMargin: 62,
    incumbents: ["Meggitt Aircraft Braking Systems"],
    closingDate: "2026-08-22",
    details: {
      description:
        "Sintered brake plate set for NATO wheeled armoured platform. Single incumbent, 14-month historical lead time — strong arbitrage window against EU sub-tier suppliers.",
      qty: 860,
      deliveryTerms: "Ex Works, 210 Days ARO",
      history: [
        { date: "2026-03-02", price: 1651, vendor: "Meggitt ABS" },
        { date: "2024-10-17", price: 1402, vendor: "Meggitt ABS" },
        { date: "2023-02-08", price: 1288, vendor: "Meggitt ABS" },
      ],
    },
  },
];