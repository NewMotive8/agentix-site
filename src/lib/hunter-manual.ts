export type ManualRow = { term: string; text: string };

export const QUICK_STEPS: string[] = [
  "Choose up to three markets on the left (Aerospace, Ground vehicles, C4ISR and so on). You cannot search everything at once — narrow searches give readable results.",
  "Or type your own keywords instead, one per line. Keywords work on their own; you do not need a market selected.",
  "Set the working-capital limit to the cash you can actually put out before you get paid.",
  "Press Run hunt. The engine searches official buyer sites, then shows one card per opportunity, strongest signal first.",
  "Read the card: the Signal number, the 'Why this is interesting' bullets, then the risk line underneath.",
  "Open 'Full research report' on the card for requirements, blocking rules and possible suppliers, or 'Open the original notice' to read the buyer's own page.",
];

export const CONTROL_TABLE: ManualRow[] = [
  { term: "Markets (max 3)", text: "Each market is a family of searches across official buyer sites. Three is the cap on purpose: the engine runs many queries per market and more than three produces an unreadable pile." },
  { term: "Keywords", text: "Type your own terms, one per line, and the engine builds searches around them. Keywords can be used alone, without any market selected." },
  { term: "Depth / coverage weight", text: "How many query variations the engine runs per market. Higher finds more but takes longer." },
  { term: "How many to research deeply", text: "The strongest few results get their documents opened and read, and suppliers researched. That work is slow, so it is capped." },
  { term: "Working capital", text: "The most cash you can lay out before the buyer pays you. Anything needing more is not deleted — it moves to 'Need financing first'." },
  { term: "Where to search", text: "The official sources the engine is allowed to use. Sources actually reachable right now are listed as connected." },
  { term: "Advanced / Developer settings", text: "Contains Demo mode, which uses invented data for testing only. Normal use stays in LIVE mode; live and demo data are never mixed." },
  { term: "Light / Dark button", text: "Top right. Your choice is remembered." },
];

export const PRESET_TABLE: ManualRow[] = [
  { term: "Anchor", text: "Few, rich, low-competition results. Use when you want a short list." },
  { term: "Cluster", text: "Wider net, moderate margins, all sources on." },
  { term: "Capital", text: "Large contracts first, margin second." },
  { term: "NATO", text: "European buyers (NSPA, NCIA) only." },
  { term: "Repeat demand", text: "Items bought again year after year — steady rather than spectacular." },
];

export const CARD_TABLE: ManualRow[] = [
  { term: "Signal (0-100)", text: "How strong the real, published evidence is: is it a live buy or just a survey, is there a deadline you can still meet, are there part identifiers, is the buyer specific. It is not a profit forecast." },
  { term: "Worth pursuing / Worth a look / Weak signal", text: "The one-line verdict next to the Signal number." },
  { term: "Why this is interesting", text: "Bullets built only from facts the buyer actually published. Nothing here is guessed." },
  { term: "The risk line", text: "The amber sentence under the bullets. Always read it — it names the thing most likely to kill the deal." },
  { term: "Estimated — not published by the buyer", text: "The blue dashed box. Contract size, margin and cash needed are our estimates, each tagged High, Medium or Low confidence with the reasoning. Never quote these to anyone." },
  { term: "Buyer / source / closes", text: "The line above the title: who is buying, which official site it came from, and the response deadline." },
  { term: "Reference codes", text: "The grey line of NSN, part number, class and notice reference — needed when you contact the buyer, ignorable otherwise." },
  { term: "Full research report", text: "Collapsible panel: what the buyer wants, what you would have to deliver, rules that could block you, who could supply it, and the documents found." },
  { term: "Open the original notice", text: "Takes you to the buyer's own page. Anything important should be confirmed there." },
  { term: "Save / Dismiss", text: "Session only — both reset when you run a new hunt." },
];

export const DRAWER_TABLE: ManualRow[] = [
  { term: "What the buyer is asking for", text: "A short summary pulled from the notice and its attachments." },
  { term: "What you would have to deliver", text: "Concrete requirements: certifications, quantities, delivery terms, inspection." },
  { term: "Rules that could block you", text: "Export control, domestic-sourcing rules, approved-source restrictions. Check these before spending time on a quote." },
  { term: "Who could supply it", text: "Manufacturers and distributors found on the open web, each with the page the claim came from. This is commercial research, not buyer confirmation." },
  { term: "OEM / Distributor / Unverified", text: "OEM made it. Distributor resells it. Unverified means a company appears to sell it and nothing more. Selling a product never means being an approved source." },
  { term: "Documents found", text: "Direct links to the specifications and attachments the engine read." },
];

export const GLOSSARY: ManualRow[] = [
  { term: "Live buy", text: "A notice you can actually respond to now, with a deadline." },
  { term: "Market survey", text: "The buyer is asking who exists. No contract yet — good for positioning, not for quoting." },
  { term: "Forecast", text: "A planned future purchase. Too early to bid." },
  { term: "NSN", text: "NATO Stock Number — the unique 13-digit ID for a part." },
  { term: "Part number (P/N)", text: "The manufacturer's own code for the same item." },
  { term: "FSC / class", text: "Product category code, e.g. 1650 is aircraft hydraulic components." },
  { term: "OEM", text: "The company that designed and built the part." },
  { term: "Approved source", text: "A supplier the buyer already accepts for that part. Being able to sell an item is not the same thing." },
  { term: "SAR", text: "Source Approval Request — the application that gets a new supplier approved. Expect months." },
  { term: "ITAR / EAR", text: "US export control rules. If they apply, crossing borders needs a licence." },
  { term: "Buy American / Berry Amendment", text: "US domestic-sourcing rules that can exclude foreign goods." },
  { term: "SAM.gov", text: "The main US federal contracting portal." },
  { term: "DLA DIBBS", text: "The Defense Logistics Agency bid board for spare parts." },
  { term: "NSPA", text: "NATO Support and Procurement Agency, Luxembourg." },
  { term: "NCIA", text: "NATO Communications and Information Agency, Brussels." },
  { term: "LIVE mode", text: "Every result comes from a real, official published source with a link." },
  { term: "Demo mode", text: "Invented data for testing the interface. Never used for real decisions." },
];

export const WORKED_EXAMPLE: string[] = [
  "Goal: find aerospace parts you could realistically supply with limited cash.",
  "Select just Aerospace on the left. The counter shows 1 of 3 markets — leave it there for a first run.",
  "Set working capital to what you could genuinely fund, say $50k.",
  "Press Run hunt. While it runs you see each market with its query count and hits.",
  "When results appear, look only at cards with Signal 70 or above first.",
  "Read the amber risk line on each. If the risk is 'closes in 4 days' and you cannot quote in four days, move on.",
  "Open 'Full research report' on the best one to see requirements and possible suppliers, then open the original notice to confirm.",
  "Got nothing? Add a second market, or switch to keywords, raise the working-capital limit, and run again — change one thing at a time.",
];
