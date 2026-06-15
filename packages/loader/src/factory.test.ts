import { StambhaClient } from "@stambha/core";
import { describe, expect, it } from "vitest";
import { buildLoaderContext } from "./factory.js";

const PRISMA = Symbol("prisma");

describe("@stambha/loader factory", () => {
  it("buildLoaderContext injects binder and logger", () => {
    const client = new StambhaClient();
    const ctx = buildLoaderContext(client, { vault: {} });
    expect(ctx.binder).toBe(client.binder);
    expect(ctx.logger).toBe(client.container.logger);
    expect(ctx.vault).toEqual({});
  });

  it("static create can resolve binder tokens from context", () => {
    const client = new StambhaClient();
    const db = { query: () => "ok" };
    client.binder.registerSingleton(PRISMA, db);

    const ctx = buildLoaderContext(client, undefined);
    expect(ctx.binder?.resolve(PRISMA)).toBe(db);
  });
});
