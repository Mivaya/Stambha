import { describe, expect, it } from "vitest";
import {
  channelMentionArg,
  parseUserMentionId,
  roleMentionArg,
  snowflakeArg,
  userMentionArg,
} from "./resolvers.js";
import { unwrapArg } from "./errors.js";

describe("mention resolvers", () => {
  it("parses user mentions and raw ids", () => {
    expect(unwrapArg(userMentionArg("<@123456789012345678>"))).toBe("123456789012345678");
    expect(unwrapArg(userMentionArg("<@!123456789012345678>"))).toBe("123456789012345678");
    expect(unwrapArg(parseUserMentionId("123456789012345678"))).toBe("123456789012345678");
  });

  it("parses channel and role mentions", () => {
    expect(unwrapArg(channelMentionArg("<#987654321098765432>"))).toBe("987654321098765432");
    expect(unwrapArg(roleMentionArg("<@&111111111111111111>"))).toBe("111111111111111111");
  });

  it("rejects invalid snowflakes", () => {
    expect(snowflakeArg("not-an-id").ok).toBe(false);
  });
});
