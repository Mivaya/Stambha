import type { ReshardPlan } from "./plan.js";
import type { ReshardEvaluation } from "./policy.js";
import type { ReshardController, ReshardPhase } from "./ReshardController.js";

export type AutoReshardSkipReason = "not_needed" | "busy" | "cooldown";

export interface AutoReshardCheckOptions {
  /**
   * When true, call {@link ReshardController.start} after planning.
   * Default `false` — plan only so workers can prepare before identify.
   */
  autoStart?: boolean;
  /**
   * Minimum ms between successful auto plans (default 300_000 = 5 minutes).
   * Prevents flapping when guild count oscillates near the threshold.
   */
  cooldownMs?: number;
  /** Override clock (tests). */
  now?: () => number;
  onEvaluation?: (evaluation: ReshardEvaluation) => void;
  onPlan?: (plan: ReshardPlan, evaluation: ReshardEvaluation) => void;
}

export interface AutoReshardCheckResult {
  readonly evaluation: ReshardEvaluation;
  readonly planned: boolean;
  readonly started: boolean;
  readonly plan: ReshardPlan | null;
  readonly skippedReason?: AutoReshardSkipReason;
}

export interface AutoReshardMonitorOptions extends AutoReshardCheckOptions {
  controller: ReshardController;
  getGuildCount: () => number;
  /** Poll interval (default 60_000). */
  intervalMs?: number;
  onResult?: (result: AutoReshardCheckResult) => void;
}

export interface AutoReshardMonitor {
  /** Run one threshold check immediately. */
  check(): AutoReshardCheckResult;
  /** Start periodic checks. */
  start(): void;
  /** Stop periodic checks. */
  stop(): void;
  readonly running: boolean;
}

const DEFAULT_COOLDOWN_MS = 300_000;
const DEFAULT_INTERVAL_MS = 60_000;

function canAutoPlan(phase: ReshardPhase): boolean {
  return phase === "idle" || phase === "complete";
}

/**
 * Evaluate guild capacity and, when over threshold, plan (and optionally start)
 * a reshard via {@link ReshardController}. No-ops while a migration is in flight
 * or within the cooldown window after a prior auto plan.
 */
export function checkAutoReshard(
  controller: ReshardController,
  guildCount: number,
  options?: AutoReshardCheckOptions,
  state?: { lastPlanAt: number },
): AutoReshardCheckResult {
  const evaluation = controller.evaluate(guildCount);
  options?.onEvaluation?.(evaluation);

  if (!evaluation.needed) {
    return {
      evaluation,
      planned: false,
      started: false,
      plan: null,
      skippedReason: "not_needed",
    };
  }

  if (!canAutoPlan(controller.status)) {
    return {
      evaluation,
      planned: false,
      started: false,
      plan: controller.plan,
      skippedReason: "busy",
    };
  }

  const now = options?.now?.() ?? Date.now();
  const cooldownMs = options?.cooldownMs ?? DEFAULT_COOLDOWN_MS;
  if (state && state.lastPlanAt > 0 && now - state.lastPlanAt < cooldownMs) {
    return {
      evaluation,
      planned: false,
      started: false,
      plan: controller.plan,
      skippedReason: "cooldown",
    };
  }

  // After a completed migration, return to idle so planManual can run.
  if (controller.status === "complete") {
    controller.reset();
  }

  const plan = controller.planManual(evaluation.recommendedShards);
  options?.onPlan?.(plan, evaluation);
  if (state) state.lastPlanAt = now;

  let started = false;
  if (options?.autoStart) {
    controller.start(plan);
    started = true;
  }

  return {
    evaluation,
    planned: true,
    started,
    plan,
  };
}

/**
 * Poll {@link checkAutoReshard} on an interval. Callers still drive
 * {@link ReshardController.nextIdentify} / WebSocket reconnect after a plan starts.
 */
export function createAutoReshardMonitor(options: AutoReshardMonitorOptions): AutoReshardMonitor {
  const state = { lastPlanAt: 0 };
  let timer: ReturnType<typeof setInterval> | null = null;

  const check = (): AutoReshardCheckResult => {
    const result = checkAutoReshard(
      options.controller,
      options.getGuildCount(),
      options,
      state,
    );
    options.onResult?.(result);
    return result;
  };

  return {
    check,
    start() {
      if (timer) return;
      timer = setInterval(() => {
        check();
      }, options.intervalMs ?? DEFAULT_INTERVAL_MS);
      if (typeof timer === "object" && "unref" in timer) {
        timer.unref();
      }
    },
    stop() {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    },
    get running() {
      return timer !== null;
    },
  };
}
