import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { discoverCategory, deepInvestigate } from "./discovery.server";
import { estimateOpportunity } from "./estimate.server";

const sourceKey = z.enum(["sam", "dibbs", "nspa", "ncia", "nato"]);

const coverage = z.object({
  mode: z.enum(["categories", "fsc", "naics", "keywords", "nsn"]).default("categories"),
  categories: z.array(z.string()).max(3).default([]),
  terms: z.string().max(500).default(""),
  weight: z.number().min(0.5).max(2).default(1),
  rawTarget: z.number().int().min(10).max(500).default(100),
  deepInvestigations: z.number().int().min(0).max(25).default(10),
});

const discoverSchema = z.object({
  categoryId: z.string().min(1).max(60),
  sources: z.array(sourceKey).min(1).max(5),
  coverage,
});

export const discoverCategoryFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => discoverSchema.parse(data))
  .handler(async ({ data }) => discoverCategory(data));

const deepSchema = z.object({
  opportunityId: z.string().min(1).max(120),
  title: z.string().min(1).max(400),
  url: z.string().url(),
  solicitation: z.string().max(120).default("—"),
  sourceLabel: z.string().max(80).default(""),
});

export const deepInvestigateFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => deepSchema.parse(data))
  .handler(async ({ data }) => deepInvestigate(data));

const estimateSchema = z.object({
  title: z.string().min(1).max(400),
  buyer: z.string().max(160).default(""),
  categoryLabel: z.string().max(120).default(""),
  solicitation: z.string().max(120).default("—"),
  noticeSummary: z.string().max(6000).default(""),
  supplierCount: z.number().int().min(0).max(200).default(0),
});

export const estimateOpportunityFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => estimateSchema.parse(data))
  .handler(async ({ data }) => estimateOpportunity(data));
