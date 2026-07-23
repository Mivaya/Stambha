import type { RestPort, RestRequest } from "@stambha/core";

const CALLBACK_RE = /^\/interactions\/[^/]+\/[^/]+\/callback$/;

/**
 * RestPort that captures the first interaction callback POST as the HTTP response body.
 * Other routes forward to the underlying port (follow-ups, channel messages, …).
 */
export class CapturingInteractionRestPort implements RestPort {
  private captured: unknown | undefined;
  private capturedRoute: string | undefined;

  constructor(private readonly inner: RestPort | null) {}

  /** Interaction callback body captured for the HTTP response, if any. */
  getInteractionResponse(): unknown | undefined {
    return this.captured;
  }

  getCapturedRoute(): string | undefined {
    return this.capturedRoute;
  }

  async request<T = unknown>(req: RestRequest): Promise<T> {
    if (req.method === "POST" && CALLBACK_RE.test(req.route) && this.captured === undefined) {
      this.captured = req.body;
      this.capturedRoute = req.route;
      return {} as T;
    }
    if (!this.inner) {
      throw new Error(
        `HTTP interaction handler has no RestPort for ${req.method} ${req.route}. ` +
          "Provide restPort for follow-ups / deferred edits.",
      );
    }
    return this.inner.request<T>(req);
  }
}
