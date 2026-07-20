import { describe, expect, it } from "vitest";
import { fallbackBucketId, normalizeRoute, parseRouteKey } from "./routeKey.js";

describe("routeKey", () => {
  it("keeps channel and guild major parameters", () => {
    expect(normalizeRoute("/channels/123456789012345678/messages")).toBe(
      "/channels/123456789012345678/messages",
    );
    expect(normalizeRoute("guilds/987654321098765432/channels")).toBe(
      "/guilds/987654321098765432/channels",
    );
  });

  it("replaces non-major snowflakes with :id", () => {
    expect(normalizeRoute("/guilds/111111111111111111/members/222222222222222222")).toBe(
      "/guilds/111111111111111111/members/:id",
    );
    expect(normalizeRoute("/channels/111111111111111111/messages/222222222222222222")).toBe(
      "/channels/111111111111111111/messages/:id",
    );
    expect(normalizeRoute("/users/123456789012345678")).toBe("/users/:id");
  });

  it("keeps webhook id (and leaves token segments intact)", () => {
    expect(normalizeRoute("/webhooks/111111111111111111/abcToken/messages")).toBe(
      "/webhooks/111111111111111111/abcToken/messages",
    );
  });

  it("buckets distinct channels separately before server bucket header", () => {
    const a = parseRouteKey("/channels/111111111111111111/messages", "POST");
    const b = parseRouteKey("/channels/222222222222222222/messages", "POST");
    expect(a.route).not.toBe(b.route);
    expect(fallbackBucketId(a)).not.toBe(fallbackBucketId(b));
  });

  it("builds route keys with method", () => {
    const key = parseRouteKey("/channels/123456789012345678/messages", "POST");
    expect(key.method).toBe("POST");
    expect(key.route).toBe("/channels/123456789012345678/messages");
  });
});
