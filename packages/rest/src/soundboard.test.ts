import type { RestPort } from "@stambha/core";
import { describe, expect, it, vi } from "vitest";
import {
  fetchGuildSoundboardSound,
  listDefaultSoundboardSounds,
  listGuildSoundboardSounds,
  sendSoundboardSound,
} from "./soundboard.js";

describe("soundboard", () => {
  it("listDefaultSoundboardSounds", async () => {
    const request = vi.fn().mockResolvedValue([{ sound_id: "1", name: "airhorn" }]);
    const rest: RestPort = { request };
    await listDefaultSoundboardSounds(rest);
    expect(request).toHaveBeenCalledWith({
      method: "GET",
      route: "/soundboard-default-sounds",
    });
  });

  it("listGuildSoundboardSounds unwraps items", async () => {
    const request = vi.fn().mockResolvedValue({ items: [{ sound_id: "2", name: "honk" }] });
    const rest: RestPort = { request };
    await expect(listGuildSoundboardSounds(rest, "g1")).resolves.toEqual([
      { sound_id: "2", name: "honk" },
    ]);
  });

  it("sendSoundboardSound posts snake_case body", async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    const rest: RestPort = { request };
    await expect(
      sendSoundboardSound(rest, "c1", { soundId: "s1", sourceGuildId: "g2" }),
    ).resolves.toBe(true);
    expect(request).toHaveBeenCalledWith({
      method: "POST",
      route: "/channels/c1/send-soundboard-sound",
      body: { sound_id: "s1", source_guild_id: "g2" },
    });
  });

  it("fetch returns null on failure", async () => {
    const rest: RestPort = { request: vi.fn().mockRejectedValue(new Error("404")) };
    await expect(fetchGuildSoundboardSound(rest, "g1", "s1")).resolves.toBeNull();
  });
});
