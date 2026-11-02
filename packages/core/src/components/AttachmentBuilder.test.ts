import { describe, expect, it } from "vitest";
import { AttachmentBuilder, AttachmentFlags, attachment } from "./AttachmentBuilder.js";

describe("AttachmentBuilder", () => {
  it("applies spoiler filename prefix", () => {
    const a = attachment({ filename: "shot.png", spoiler: true, description: "hi" });
    expect(a.resolvedFilename).toBe("SPOILER_shot.png");
    expect(a.attachmentUrl).toBe("attachment://SPOILER_shot.png");
    expect(a.toJSON()).toMatchObject({
      filename: "SPOILER_shot.png",
      description: "hi",
    });
  });

  it("sets voice message flag and metadata", () => {
    const a = new AttachmentBuilder({ filename: "voice.ogg" }).setVoiceMessage({
      durationSecs: 3.5,
      waveform: "AAAA",
    });
    expect(a.toJSON()).toEqual({
      filename: "voice.ogg",
      duration_secs: 3.5,
      waveform: "AAAA",
      flags: AttachmentFlags.IsVoiceMessage,
    });
  });
});
