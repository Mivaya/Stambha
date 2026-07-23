import { describe, expect, it } from "vitest";
import {
  authorizingIntegrationOwnersFromApi,
  integrationTypesToApi,
  interactionContextFromApi,
  interactionContextsToApi,
} from "./installContext.js";

describe("installContext mappers", () => {
  it("maps friendly integration types to Discord ints", () => {
    expect(integrationTypesToApi(["guild", "user"])).toEqual([0, 1]);
    expect(integrationTypesToApi(["user", "user"])).toEqual([1]);
  });

  it("maps friendly contexts to Discord ints", () => {
    expect(interactionContextsToApi(["guild", "bot_dm", "private_channel"])).toEqual([0, 1, 2]);
  });

  it("parses interaction context from API", () => {
    expect(interactionContextFromApi(0)).toBe("guild");
    expect(interactionContextFromApi(1)).toBe("bot_dm");
    expect(interactionContextFromApi(2)).toBe("private_channel");
    expect(interactionContextFromApi(99)).toBeUndefined();
  });

  it("parses authorizing_integration_owners", () => {
    expect(authorizingIntegrationOwnersFromApi({ "0": "g1", "1": "u1" })).toEqual({
      guildInstall: "g1",
      userInstall: "u1",
    });
    expect(authorizingIntegrationOwnersFromApi(undefined)).toBeUndefined();
  });
});
