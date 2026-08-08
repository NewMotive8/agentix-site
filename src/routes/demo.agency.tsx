import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/demo/agency")({
  server: {
    handlers: {
      GET: async () =>
        new Response(null, {
          status: 307,
          headers: { Location: "/demo/agency/index.html" },
        }),
    },
  },
});
