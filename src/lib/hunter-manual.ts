export type ManualRow = { term: string; text: string };

export const QUICK_STEPS: string[] = [
  "Pick a strategy preset on the left (or skip it and set things yourself).",
  "Adjust the four search settings until they describe what you want to find.",
  "Press the big green Run hunt button. Results appear after a moment, best score first.",
  "Read the cards. Press Investigate on anything promising to see the full research view.",
];

export const CONTROL_TABLE: ManualRow[] = [
  { term: "Strategy presets", text: "Five ready-made setups. Clicking one fills in all the settings below. It does not search — you still press Run hunt." },
  { term: "Minimum margin", text: "The smallest profit margin you will accept. Higher value = fewer but richer results." },
  { term: "Minimum contract value", text: "The smallest total contract size worth your time. Higher value = only big jobs." },
  { term: "Maximum competitors", text: "How many existing suppliers you are willing to bid against. 1 means only near-monopoly items." },
  { term: "FSC codes", text: "Product category codes. Type one and press Enter to add it, click a code to remove it. Empty means every category." },
  { term: "Working capital (Execution constraints)", text: "The most cash you can put out before the government pays you. $0 is the default: only opportunities that need no pre-funding qualify. Pick a bigger figure, type a custom one, choose Unlimited, or Ignore constraint to switch the gate off. Whatever you pick is printed at the top of every report." },
  { term: "Where to search", text: "Turn each data source on or off. Results only come from the ticked sources." },
  { term: "Run hunt", text: "Runs the search with your current settings. Also clears anything you dismissed." },
  { term: "Light / Dark button", text: "Top right. Switches between dark text on white and white text on dark. Your choice is remembered." },
];

export const PRESET_TABLE: ManualRow[] = [
  { term: "Anchor", text: "High margin (35%), large contracts ($250k+), only one competitor. US sources. Use it when you want a small list of very strong candidates." },
  { term: "Cluster", text: "Moderate margin (20%), $100k+, up to five competitors, every source on. Use it to see the widest picture." },
  { term: "Capital", text: "Big money: $750k+ contracts, margin down to 15%, all categories. Use it when contract size matters more than margin." },
  { term: "NATO", text: "European buyers only (NSPA and NCIA), 18% margin, $150k+. Use it for NATO sustainment work." },
  { term: "Repeat demand", text: "Parts bought year after year: 22% margin, $80k+, up to eight competitors. Use it to build steady recurring business." },
];

export const CARD_TABLE: ManualRow[] = [
  { term: "Opportunity score", text: "How attractive the deal is: economics, sourcing, repeat demand, competition, compliance and timing. Green 'Strong' is above 80, amber 'Moderate' above 60." },
  { term: "Execution score", text: "Whether you can actually win and deliver it: qualified sources, technical data, compliance barriers, lead time, capital intensity. A high opportunity score with a low execution score is a Watch, not a buy." },
  { term: "Margin — theoretical / executable", text: "The first number ignores financing; the second is what is left after the cost of covering the cash gap. The executable number is the one that drives the score." },
  { term: "Cash-flow badge", text: "Green Cash-flow compatible = no real pre-funding. Amber Financeable = a gap you would need to fund. Red Cash-flow incompatible = large deposits, MOQ or lead time." },
  { term: "CAPITAL CONSTRAINED", text: "The deal is above the working-capital limit for this hunt. It is never deleted — it moves to 'Potential opportunities — financing required' so you can revisit it when financing changes." },
  { term: "Past demand for this part", text: "How regularly the government has bought this item before. High means it appears every year — the safest kind of business." },
  { term: "How easy to source", text: "How many suppliers can actually deliver it. Low means you may struggle to find anyone who can supply it at all." },
  { term: "Confidence in pricing", text: "How reliable the price estimate is. Medium or Low means the numbers on the card could move once you dig in." },
  { term: "Contract value", text: "Total value of the whole order at expected prices." },
  { term: "Cash needed before government pays", text: "Deposits, prepayments and MOQ overhang you must fund yourself before payment arrives." },
  { term: "Estimated gross profit", text: "The actual money left over, in dollars, across the whole order." },
  { term: "Analysis", text: "A plain-language read on why the item scored the way it did. The last sentence always names the main risk — read that first." },
  { term: "Save / Dismiss", text: "Save marks a card for yourself; Dismiss hides it from the list. Both only last for this session and reset when you run a new hunt." },
];

export const DRAWER_TABLE: ManualRow[] = [
  { term: "1. Demand and product", text: "What the part is, what it goes on, and how many were bought each year with the price paid. A rising quantity and rising price is the best pattern." },
  { term: "2. Who can supply it", text: "Every supplier that could fill the order, with their price and approval status." },
  { term: "Approved Source / Qualified", text: "Ready to use — no extra paperwork." },
  { term: "Requires SAR", text: "Needs a Source Approval Request before they can supply. Expect months of paperwork." },
  { term: "Unqualified", text: "Not approved at all. Treat their price as indicative only." },
  { term: "3. Compliance requirements", text: "Rules that apply to this order. 'Applies' means you must comply, 'check this' means confirm before bidding, 'not an issue' means ignore it." },
  { term: "4. Where the money goes", text: "The price the government pays, minus supplier cost, freight and inspection. What is left is your gross profit per unit, then multiplied by the order quantity." },
  { term: "5. Recommendation", text: "The verdict, with three reasons. 'Pursue this' means bid. 'Look into it further' means one thing needs checking. 'Low priority' means it works but is not worth the hours. 'Reject' means walk away." },
];

export const GLOSSARY: ManualRow[] = [
  { term: "NSN", text: "NATO Stock Number — the unique 13-digit ID for a part in defense supply systems." },
  { term: "Part number (P/N)", text: "The manufacturer's own code for the same item." },
  { term: "FSC", text: "Federal Supply Class — a four-digit product category, e.g. 1650 is aircraft hydraulic components." },
  { term: "OEM", text: "Original Equipment Manufacturer — the company that designed and built the part." },
  { term: "SAR", text: "Source Approval Request — the application that lets a new supplier be approved for a part." },
  { term: "ITAR / EAR", text: "US export control rules. If they apply, moving the goods across borders needs a licence." },
  { term: "Buy American", text: "A rule requiring US-made goods or components on certain contracts." },
  { term: "Berry Amendment", text: "A stricter US-sourcing rule covering textiles, food, metals and hand tools." },
  { term: "Source-Controlled", text: "The design belongs to the buyer or OEM, so only listed suppliers may make it." },
  { term: "SAM.gov", text: "The main US federal contracting portal." },
  { term: "DLA DIBBS", text: "The Defense Logistics Agency bid board for spare parts." },
  { term: "NSPA", text: "NATO Support and Procurement Agency, based in Luxembourg." },
  { term: "NCIA", text: "NATO Communications and Information Agency, based in Brussels." },
];

export const WORKED_EXAMPLE: string[] = [
  "Goal: find aerospace valves with almost no competition and a margin above 30%.",
  "Click the Anchor preset. It sets margin to 35%, contract value to $250k, competitors to 1, and ticks SAM.gov and DLA DIBBS.",
  "Leave the FSC codes as they are (1650 and 2530 cover hydraulic and vehicle components), or add 4820 for valves.",
  "Press Run hunt. After a moment you should see one or two Strong cards.",
  "If you get nothing, drag Minimum margin down to about 25% and Maximum competitors up to 2, then run again. Loosening one setting at a time tells you which one was blocking results.",
];
