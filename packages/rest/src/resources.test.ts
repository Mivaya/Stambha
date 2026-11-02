import type { RestPort } from "@stambha/core";
import { describe, expect, it, vi } from "vitest";
import {
  fetchActivityInstance,
  fetchApplication,
  fetchChannelMemberPermissions,
  fetchCurrentUserGuilds,
  fetchGuildMemberPermissions,
  fetchGuildRoleMemberCounts,
  fetchUser,
  parseAppPermissions,
  sendVoiceMessage,
  triggerTyping,
  userDisplayName,
  VoiceMessageAttachmentFlag,
} from "./resources.js";

describe("resources", () => {
  it("fetchUser returns null on REST failure", async () => {
    const rest: RestPort = {
      request: vi.fn().mockRejectedValue(new Error("404")),
    };
    await expect(fetchUser(rest, "1")).resolves.toBeNull();
  });

  it("fetchUser forwards GET /users/:id", async () => {
    const request = vi.fn().mockResolvedValue({ id: "1", username: "bot" });
    const rest: RestPort = { request };
    const user = await fetchUser(rest, "1");
    expect(user?.username).toBe("bot");
    expect(request).toHaveBeenCalledWith({ method: "GET", route: "/users/1" });
  });

  it("fetchCurrentUserGuilds forwards shard query for large bot sharding", async () => {
    const request = vi.fn().mockResolvedValue([{ id: "g1", name: "Guild" }]);
    const rest: RestPort = { request };
    const guilds = await fetchCurrentUserGuilds(rest, { shard: 0, limit: 100 });
    expect(guilds).toHaveLength(1);
    expect(request).toHaveBeenCalledWith({
      method: "GET",
      route: "/users/@me/guilds?limit=100&shard=0",
    });
  });

  it("userDisplayName prefers global_name", () => {
    expect(userDisplayName({ id: "1", global_name: "Display", username: "user" })).toBe("Display");
  });

  it("triggerTyping POSTs /channels/:id/typing", async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    const rest: RestPort = { request };
    await triggerTyping(rest, "c1");
    expect(request).toHaveBeenCalledWith({ method: "POST", route: "/channels/c1/typing" });
  });

  it("fetchApplication returns application with owner and team", async () => {
    const request = vi.fn().mockResolvedValue({
      id: "app1",
      name: "Demo",
      icon: null,
      description: "",
      bot_public: true,
      bot_require_code_grant: false,
      verify_key: "abc",
      owner: { id: "u1", username: "owner" },
      team: {
        id: "t1",
        name: "Team",
        icon: null,
        owner_user_id: "u1",
        members: [
          {
            membership_state: 2,
            team_id: "t1",
            user: { id: "u1", username: "owner" },
          },
        ],
      },
    });
    const rest: RestPort = { request };
    const app = await fetchApplication(rest);
    expect(app?.name).toBe("Demo");
    expect(app?.owner?.username).toBe("owner");
    expect(app?.team?.members?.[0]?.user.id).toBe("u1");
    expect(request).toHaveBeenCalledWith({
      method: "GET",
      route: "/oauth2/applications/@me",
    });
  });

  it("fetchApplication returns null on REST failure", async () => {
    const rest: RestPort = {
      request: vi.fn().mockRejectedValue(new Error("401")),
    };
    await expect(fetchApplication(rest)).resolves.toBeNull();
  });

  it("fetchGuildMemberPermissions hits the permissions route", async () => {
    const request = vi.fn().mockResolvedValue({ permissions: "8" });
    const rest: RestPort = { request };
    await expect(fetchGuildMemberPermissions(rest, "g1", "u1")).resolves.toEqual({
      permissions: "8",
    });
    expect(request).toHaveBeenCalledWith({
      method: "GET",
      route: "/guilds/g1/members/u1/permissions",
    });
  });

  it("fetchChannelMemberPermissions forwards implicit=false", async () => {
    const request = vi.fn().mockResolvedValue({ permissions: "0" });
    const rest: RestPort = { request };
    await fetchChannelMemberPermissions(rest, "c1", "u1", { implicit: false });
    expect(request).toHaveBeenCalledWith({
      method: "GET",
      route: "/channels/c1/members/u1/permissions?implicit=false",
    });
  });

  it("fetchGuildRoleMemberCounts returns map", async () => {
    const request = vi.fn().mockResolvedValue({ "11": 3 });
    const rest: RestPort = { request };
    await expect(fetchGuildRoleMemberCounts(rest, "g1")).resolves.toEqual({ "11": 3 });
    expect(request).toHaveBeenCalledWith({
      method: "GET",
      route: "/guilds/g1/roles/member-counts",
    });
  });

  it("fetchActivityInstance hits applications route", async () => {
    const request = vi.fn().mockResolvedValue({
      application_id: "a1",
      instance_id: "i1",
      launch_id: "l1",
      location: { id: "gc-1", kind: "gc", channel_id: "c1" },
      users: ["u1"],
    });
    const rest: RestPort = { request };
    const inst = await fetchActivityInstance(rest, "a1", "i1");
    expect(inst?.users).toEqual(["u1"]);
    expect(request).toHaveBeenCalledWith({
      method: "GET",
      route: "/applications/a1/activity-instances/i1",
    });
  });

  it("parseAppPermissions parses bitfields", () => {
    expect(parseAppPermissions("8")).toBe(8n);
    expect(parseAppPermissions(undefined)).toBe(0n);
  });

  it("sendVoiceMessage posts multipart voice attachment", async () => {
    const request = vi.fn().mockResolvedValue({ id: "m1" });
    const rest: RestPort = { request };
    const data = new Uint8Array([1, 2, 3]);
    await sendVoiceMessage(rest, "c1", {
      data,
      durationSecs: 2,
      waveform: "AA==",
      filename: "voice.ogg",
    });
    expect(request).toHaveBeenCalledWith({
      method: "POST",
      route: "/channels/c1/messages",
      body: {
        attachments: [
          {
            id: 0,
            filename: "voice.ogg",
            duration_secs: 2,
            waveform: "AA==",
            flags: VoiceMessageAttachmentFlag,
          },
        ],
      },
      files: [{ name: "files[0]", filename: "voice.ogg", data }],
    });
  });
});
