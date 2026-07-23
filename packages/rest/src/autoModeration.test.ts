import type { RestPort } from "@stambha/core";
import { describe, expect, it, vi } from "vitest";
import {
  autoModAlert,
  autoModBlockMessage,
  AutoModEventType,
  autoModTimeout,
  AutoModTriggerType,
  createAutoModerationRule,
  deleteAutoModerationRule,
  listAutoModerationRules,
  modifyAutoModerationRule,
} from "./autoModeration.js";

describe("autoModeration", () => {
  it("lists rules", async () => {
    const request = vi.fn().mockResolvedValue([{ id: "r1", name: "spam" }]);
    const rest: RestPort = { request };
    await expect(listAutoModerationRules(rest, "g1")).resolves.toHaveLength(1);
    expect(request).toHaveBeenCalledWith({
      method: "GET",
      route: "/guilds/g1/auto-moderation/rules",
    });
  });

  it("createAutoModerationRule maps camelCase + action helpers", async () => {
    const request = vi.fn().mockResolvedValue({ id: "r1" });
    const rest: RestPort = { request };
    await createAutoModerationRule(rest, "g1", {
      name: "Keywords",
      eventType: AutoModEventType.MessageSend,
      triggerType: AutoModTriggerType.Keyword,
      triggerMetadata: { keyword_filter: ["*scam*"] },
      actions: [
        autoModBlockMessage("No scams"),
        autoModAlert("c-alert"),
        autoModTimeout(60),
      ],
      enabled: true,
      exemptRoles: ["role1"],
    });
    expect(request).toHaveBeenCalledWith({
      method: "POST",
      route: "/guilds/g1/auto-moderation/rules",
      body: {
        name: "Keywords",
        event_type: AutoModEventType.MessageSend,
        trigger_type: AutoModTriggerType.Keyword,
        trigger_metadata: { keyword_filter: ["*scam*"] },
        actions: [
          { type: 1, metadata: { custom_message: "No scams" } },
          { type: 2, metadata: { channel_id: "c-alert" } },
          { type: 3, metadata: { duration_seconds: 60 } },
        ],
        enabled: true,
        exempt_roles: ["role1"],
      },
    });
  });

  it("modify and delete", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce({ id: "r1", enabled: false })
      .mockResolvedValueOnce(undefined);
    const rest: RestPort = { request };
    await modifyAutoModerationRule(rest, "g1", "r1", { enabled: false });
    await expect(deleteAutoModerationRule(rest, "g1", "r1")).resolves.toBe(true);
    expect(request).toHaveBeenNthCalledWith(1, {
      method: "PATCH",
      route: "/guilds/g1/auto-moderation/rules/r1",
      body: { enabled: false },
    });
    expect(request).toHaveBeenNthCalledWith(2, {
      method: "DELETE",
      route: "/guilds/g1/auto-moderation/rules/r1",
    });
  });
});
