/**
 * Procurement category families used by the discovery matrix.
 * Discovery is deliberately broad: strategy/economic filters run AFTER discovery.
 */
export type CategoryFamily = {
  id: string;
  label: string;
  /** Product vocabulary used to build search queries. */
  vocabulary: string[];
  /** Federal Supply Class / PSC codes typically used by this family. */
  fsc: string[];
  naics: string[];
};

export const CATEGORY_FAMILIES: CategoryFamily[] = [
  {
    id: "aerospace",
    label: "Aerospace & aviation",
    vocabulary: ["aircraft spare parts", "avionics", "landing gear", "turbine engine parts", "helicopter components", "hydraulic actuator"],
    fsc: ["1560", "1650", "1680", "2840", "5826"],
    naics: ["336413", "336412"],
  },
  {
    id: "ground",
    label: "Ground vehicles & mobility",
    vocabulary: ["vehicular spare parts", "track and suspension", "armored vehicle components", "engine overhaul kit", "transmission assembly"],
    fsc: ["2510", "2520", "2530", "2540", "2590"],
    naics: ["336992", "336350"],
  },
  {
    id: "c4isr",
    label: "C4ISR, comms & electronics",
    vocabulary: ["tactical radio", "antenna assembly", "network equipment", "radar components", "electronic modules", "satellite communications"],
    fsc: ["5820", "5895", "5985", "5998", "7025"],
    naics: ["334220", "334111"],
  },
  {
    id: "weapons",
    label: "Weapons, ordnance & optics",
    vocabulary: ["weapon system spare parts", "ammunition components", "fire control optics", "night vision", "gun mount parts"],
    fsc: ["1005", "1010", "1240", "1290", "1305"],
    naics: ["332994", "333314"],
  },
  {
    id: "industrial",
    label: "Industrial, hardware & materials",
    vocabulary: ["bearings", "fasteners", "hydraulic fittings", "valves", "machined parts", "raw material supply"],
    fsc: ["3110", "4730", "4820", "5305", "5330", "9515"],
    naics: ["332710", "332912"],
  },
  {
    id: "power",
    label: "Power, energy & generators",
    vocabulary: ["generator sets", "batteries", "power distribution", "UPS systems", "solar power units"],
    fsc: ["6115", "6117", "6135", "6140", "6150"],
    naics: ["335312", "335911"],
  },
  {
    id: "medical",
    label: "Medical & field hospital",
    vocabulary: ["medical supplies", "field hospital equipment", "surgical instruments", "diagnostic devices", "pharmaceutical supply"],
    fsc: ["6505", "6515", "6520", "6530", "6545"],
    naics: ["339112", "423450"],
  },
  {
    id: "clothing",
    label: "Clothing, textiles & individual equipment",
    vocabulary: ["combat uniforms", "body armor", "helmets", "boots", "load carrying equipment", "tentage"],
    fsc: ["8405", "8415", "8430", "8465", "8470"],
    naics: ["315220", "314994"],
  },
  {
    id: "food",
    label: "Subsistence & food service",
    vocabulary: ["subsistence supply", "operational rations", "food service equipment", "bottled water supply", "catering services"],
    fsc: ["8940", "8970", "7310", "7320"],
    naics: ["311999", "424410"],
  },
  {
    id: "construction",
    label: "Construction, facilities & infrastructure",
    vocabulary: ["construction materials", "prefabricated shelters", "HVAC equipment", "base infrastructure works", "perimeter security"],
    fsc: ["5410", "5420", "4120", "5680"],
    naics: ["236220", "238220"],
  },
  {
    id: "cyber",
    label: "Cyber, software & IT services",
    vocabulary: ["cybersecurity services", "software licences", "IT support services", "cloud services", "systems integration"],
    fsc: ["7030", "7A20", "D302", "D307"],
    naics: ["541512", "541519"],
  },
  {
    id: "logistics",
    label: "Logistics, MRO & sustainment",
    vocabulary: ["depot maintenance", "repair and overhaul services", "warehousing services", "transportation services", "spare parts kitting"],
    fsc: ["J015", "J016", "V111", "W059"],
    naics: ["488510", "811310"],
  },
  {
    id: "chem",
    label: "CBRN, safety & fire protection",
    vocabulary: ["CBRN protective equipment", "gas masks", "decontamination kits", "firefighting equipment", "detection systems"],
    fsc: ["4210", "4240", "4230", "6665"],
    naics: ["339113", "334519"],
  },
  {
    id: "marine",
    label: "Naval & marine",
    vocabulary: ["shipboard spare parts", "marine propulsion", "naval valves", "deck equipment", "hull repair services"],
    fsc: ["2010", "2040", "2050", "1990"],
    naics: ["336611", "336612"],
  },
];

export const CATEGORY_IDS = CATEGORY_FAMILIES.map((c) => c.id);

export function categoriesFor(ids: string[]): CategoryFamily[] {
  if (ids.length === 0) return CATEGORY_FAMILIES;
  const set = new Set(ids);
  return CATEGORY_FAMILIES.filter((c) => set.has(c.id));
}

export function categoryLabel(id: string): string {
  return CATEGORY_FAMILIES.find((c) => c.id === id)?.label ?? id;
}
