import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { discoverCategory, deepInvestigate } from "./discovery.server";

const sourceKey = z.enum(["sam", "dibbs", "nspa", "ncia", "nato"]);

const coverage = z.object({
  mode: z.enum(["all", "categories", "fsc", "naics", "keywords", "nsn"]).default("all"),
  categories: z.array(z.string()).max(30).default([]),
  terms: z.string().max(500).default(""),
  weight: z.number().min(0.5).max(2).default(1),
  rawTarget: z.number().int().min(10).max(500).default(100),
  deepInvestigations: z.number().int().min(0).max(25).default(10),
});

const discoverSchema = z.object({
  categoryId: z.string().min(1).max(40),
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
