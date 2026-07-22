import type { RestPort } from "@stambha/core";
import { describe, expect, it, vi } from "vitest";
import { createPoll, endPoll, fetchPollAnswerVoters, sendPollMessage } from "./polls.js";

describe("createPoll", () => {
  it("builds snake_case Discord create request", () => {
    expect(
      createPoll({
        question: "Lunch?",
        answers: ["Pizza", { text: "Sushi", emoji: "🍣" }],
        durationHours: 48,
        allowMultiselect: true,
      }),
    ).toEqual({
      question: { text: "Lunch?" },
      answers: [
        { poll_media: { text: "Pizza" } },
        { poll_media: { text: "Sushi", emoji: { name: "🍣" } } },
      ],
      duration: 48,
      allow_multiselect: true,
    });
  });

  it("rejects empty question or invalid answer counts", () => {
    expect(() => createPoll({ question: "  ", answers: ["a"] })).toThrow(/question/);
    expect(() => createPoll({ question: "Q", answers: [] })).toThrow(/answers/);
    expect(() =>
      createPoll({ question: "Q", answers: Array.from({ length: 11 }, (_, i) => String(i)) }),
    ).toThrow(/answers/);
  });
});

describe("poll REST helpers", () => {
  it("sendPollMessage posts channel message with poll", async () => {
    const request = vi.fn().mockResolvedValue({ id: "m1" });
    const rest: RestPort = { request };
    const poll = createPoll({ question: "Q?", answers: ["A", "B"] });
    await expect(sendPollMessage(rest, "c1", { content: "Vote:", poll })).resolves.toEqual({
      id: "m1",
    });
    expect(request).toHaveBeenCalledWith({
      method: "POST",
      route: "/channels/c1/messages",
      body: { content: "Vote:", poll },
    });
  });

  it("endPoll posts expire route", async () => {
    const request = vi.fn().mockResolvedValue({ id: "m1", content: "" });
    const rest: RestPort = { request };
    await endPoll(rest, "c1", "m1");
    expect(request).toHaveBeenCalledWith({
      method: "POST",
      route: "/channels/c1/polls/m1/expire",
    });
  });

  it("endPoll returns null on failure", async () => {
    const rest: RestPort = { request: vi.fn().mockRejectedValue(new Error("403")) };
    await expect(endPoll(rest, "c1", "m1")).resolves.toBeNull();
  });

  it("fetchPollAnswerVoters forwards query", async () => {
    const request = vi.fn().mockResolvedValue({ users: [{ id: "u1", username: "a" }] });
    const rest: RestPort = { request };
    const users = await fetchPollAnswerVoters(rest, "c1", "m1", 2, { after: "u0", limit: 10 });
    expect(users).toHaveLength(1);
    expect(request).toHaveBeenCalledWith({
      method: "GET",
      route: "/channels/c1/polls/m1/answers/2",
      query: { after: "u0", limit: "10" },
    });
  });
});
