import { describe, expect, it, vi } from "vitest";
import type { RestPort } from "@stambha/core";
import { fetchUser, userDisplayName } from "./resources.js";

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
});
