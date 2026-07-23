import type { RestPort } from "@stambha/core";
import { describe, expect, it, vi } from "vitest";
import { fetchApplication, fetchUser, triggerTyping, userDisplayName } from "./resources.js";

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
});
