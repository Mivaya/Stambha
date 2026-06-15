import { Epilogue, isOk, type EpilogueContext, type Registry } from "@stambha/core";

export class AuditEpilogue extends Epilogue {
  constructor(registry: Registry<Epilogue>) {
    super(registry, {
      name: "audit",
      runOn: "always",
      priority: 100,
    });
  }

  async run(ctx: EpilogueContext): Promise<void> {
    if (ctx.phase === "denied") {
      console.log(`[epilogue:audit] denied ${ctx.commandName} (${ctx.denied?.gate ?? "gate"})`);
      return;
    }
    if (ctx.phase === "blocked") {
      console.log(`[epilogue:audit] blocked ${ctx.commandName}`);
      return;
    }
    const status = ctx.outcome && isOk(ctx.outcome) ? "ok" : "fail";
    console.log(`[epilogue:audit] ${ctx.commandName} ${status} (${ctx.durationMs.toFixed(1)}ms)`);
  }
}
