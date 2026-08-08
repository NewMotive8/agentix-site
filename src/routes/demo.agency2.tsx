import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/demo/agency2")({
  server: {
    handlers: {
      GET: async () =>
        new Response(null, {
          status: 307,
          headers: { Location: "/demo/agency2/index.html" },
        }),
    },
  },
});
