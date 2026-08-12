import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { searchSam } from "./sam.server";

const schema = z.object({
  keywords: z.array(z.string()).max(12).default([]),
  fscCodes: z.array(z.string()).max(12).default([]),
  lookbackDays: z.number().int().min(1).max(365).default(90),
});

export const fetchSamNotices = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => searchSam(data));
