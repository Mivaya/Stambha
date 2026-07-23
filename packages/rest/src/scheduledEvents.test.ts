import type { RestPort } from "@stambha/core";
import { describe, expect, it, vi } from "vitest";
import {
  cancelGuildScheduledEvent,
  createGuildScheduledEvent,
  deleteGuildScheduledEvent,
  fetchGuildScheduledEvent,
  listGuildScheduledEvents,
  modifyGuildScheduledEvent,
  ScheduledEventEntityType,
  ScheduledEventPrivacyLevel,
  ScheduledEventStatus,
} from "./scheduledEvents.js";

describe("scheduledEvents", () => {
  it("listGuildScheduledEvents GETs with optional query", async () => {
    const request = vi.fn().mockResolvedValue([{ id: "e1", name: "Meetup" }]);
    const rest: RestPort = { request };
    await listGuildScheduledEvents(rest, "g1", { withUserCount: true });
    expect(request).toHaveBeenCalledWith({
      method: "GET",
      route: "/guilds/g1/scheduled-events",
      query: { with_user_count: "true" },
    });
  });

  it("createGuildScheduledEvent maps camelCase options", async () => {
    const request = vi.fn().mockResolvedValue({ id: "e1" });
    const rest: RestPort = { request };
    await createGuildScheduledEvent(rest, "g1", {
      name: "Launch",
      scheduledStartTime: "2026-08-01T18:00:00.000Z",
      entityType: ScheduledEventEntityType.External,
      location: "https://example.com",
      scheduledEndTime: "2026-08-01T19:00:00.000Z",
      description: "Ship party",
    });
    expect(request).toHaveBeenCalledWith({
      method: "POST",
      route: "/guilds/g1/scheduled-events",
      body: {
        name: "Launch",
        scheduled_start_time: "2026-08-01T18:00:00.000Z",
        entity_type: ScheduledEventEntityType.External,
        privacy_level: ScheduledEventPrivacyLevel.GuildOnly,
        entity_metadata: { location: "https://example.com" },
        scheduled_end_time: "2026-08-01T19:00:00.000Z",
        description: "Ship party",
      },
    });
  });

  it("modify + status helpers PATCH correctly", async () => {
    const request = vi.fn().mockResolvedValue({ id: "e1", status: 2 });
    const rest: RestPort = { request };
    await modifyGuildScheduledEvent(rest, "g1", "e1", { name: "Renamed" });
    await cancelGuildScheduledEvent(rest, "g1", "e1");
    expect(request).toHaveBeenNthCalledWith(1, {
      method: "PATCH",
      route: "/guilds/g1/scheduled-events/e1",
      body: { name: "Renamed" },
    });
    expect(request).toHaveBeenNthCalledWith(2, {
      method: "PATCH",
      route: "/guilds/g1/scheduled-events/e1",
      body: { status: ScheduledEventStatus.Canceled },
    });
  });

  it("fetch returns null and delete returns false on failure", async () => {
    const rest: RestPort = { request: vi.fn().mockRejectedValue(new Error("404")) };
    await expect(fetchGuildScheduledEvent(rest, "g1", "e1")).resolves.toBeNull();
    await expect(deleteGuildScheduledEvent(rest, "g1", "e1")).resolves.toBe(false);
  });
});
