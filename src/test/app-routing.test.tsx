import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it.each(["/", "/start", "/auth", "/programs", "/me", "/me/journey", "/me/messages", "/me/settings"])("matches a page for %s instead of falling back to not found", (path) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes(path);

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it.each(["/me", "/me/journey", "/me/messages", "/me/settings"])("opens the participant demo at %s without an auth gate", (path) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes(path);

    expect(matches.some((match) => match.routeId.includes("_authenticated"))).toBe(false);
  });
});
