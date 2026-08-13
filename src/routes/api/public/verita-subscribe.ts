import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().trim().email().max(255),
});

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });

export const Route = createFileRoute("/api/public/verita-subscribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return json({ ok: false, error: "Please enter a valid email address." }, 400);
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin
          .from("verita_subscribers")
          .upsert({ email: parsed.email.toLowerCase() }, { onConflict: "email" });

        if (error) {
          console.error("verita-subscribe failed:", error.message);
          return json({ ok: false, error: "Could not save your email. Please try again." }, 500);
        }

        return json({ ok: true });
      },
    },
  },
});