import { describe, expect, it, vi } from "vitest";
import { MockBridge } from "../bridge/MockBridge.js";
import { createStambhaBot } from "../client/createStambhaBot.js";
import type { CommandContext } from "../context/types.js";
import { parseSequenceCustomId } from "./customId.js";
import { runSequence } from "./runSequence.js";
import { ensureSeqSignal } from "./SeqSignal.js";
import { sequence } from "./SequenceBuilder.js";

function mockCtx(
  client: ReturnType<typeof createStambhaBot>,
  overrides: Partial<CommandContext> = {},
): CommandContext {
  return {
    kind: "slash",
    commandName: "setup",
    userId: "user-1",
    guildId: "guild-1",
    channelId: "channel-1",
    raw: {},
    client,
    reply: vi.fn(async () => undefined),
    replyEphemeral: vi.fn(async () => undefined),
    deferReply: vi.fn(async () => undefined),
    editReply: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe("runSequence", () => {
  it("registers SeqSignal, drives steps, and returns answers", async () => {
    const client = createStambhaBot({ bridge: new MockBridge(), prefix: "!" });
    await client.start();

    const flow = sequence()
      .timeout(5_000)
      .button("role", "Pick:", [
        { id: "mod", label: "Mod" },
        { id: "member", label: "Member" },
      ])
      .select("channel", "Channel:", [
        { label: "General", value: "general" },
        { label: "News", value: "news" },
      ])
      .build();

    const ctx = mockCtx(client);
    const runPromise = runSequence(ctx, flow);

    // Wait until first waitForStep is pending, then complete via seq signal path.
    await vi.waitFor(() => {
      expect(client.registries.signals.get("seq")).toBeDefined();
    });

    // Find session from pending by completing after a microtask once reply/edit fired.
    await vi.waitFor(() => {
      expect(ctx.editReply).toHaveBeenCalled();
    });

    const firstPayload = (ctx.editReply as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as {
      components?: { components?: { custom_id?: string }[] }[];
    };
    const customId = firstPayload.components?.[0]?.components?.[0]?.custom_id;
    expect(customId).toBeTruthy();
    const parsed = parseSequenceCustomId(customId!);
    expect(parsed).not.toBeNull();

    expect(client.sequences.completeStep(parsed!.sessionId, "role", "user-1", "mod")).toBe("ok");

    await vi.waitFor(() => {
      expect((ctx.editReply as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThanOrEqual(
        2,
      );
    });

    const secondPayload = (ctx.editReply as ReturnType<typeof vi.fn>).mock.calls[1]?.[0] as {
      components?: { components?: { custom_id?: string }[] }[];
    };
    const selectId = secondPayload.components?.[0]?.components?.[0]?.custom_id;
    const parsedSelect = parseSequenceCustomId(selectId!);
    expect(
      client.sequences.completeStep(parsedSelect!.sessionId, "channel", "user-1", ["general"]),
    ).toBe("ok");

    const result = await runPromise;
    expect(result.cancelled).toBe(false);
    expect(result.answers).toEqual({ role: "mod", channel: ["general"] });
    expect(client.registries.signals.get("seq")).toBeDefined();

    await client.stop();
  });

  it("ensureSeqSignal is idempotent", () => {
    const client = createStambhaBot({ bridge: new MockBridge() });
    ensureSeqSignal(client);
    ensureSeqSignal(client);
    expect([...client.registries.signals.values()].filter((s) => s.name === "seq")).toHaveLength(1);
  });

  it("returns cancelled on timeout", async () => {
    const client = createStambhaBot({ bridge: new MockBridge() });
    await client.start();
    const flow = sequence()
      .timeout(20)
      .button("role", "Pick:", [{ id: "mod", label: "Mod" }])
      .build();

    const result = await runSequence(mockCtx(client), flow);
    expect(result.cancelled).toBe(true);
    await client.stop();
  });
});
