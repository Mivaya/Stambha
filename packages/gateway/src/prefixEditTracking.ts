/** Maps a user's command message id → the bot reply created for it. */
export interface TrackedPrefixReply {
  channelId: string;
  replyId: string;
  userId: string;
}

export interface PrefixEditTrackerOptions {
  /** Max tracked source messages before oldest entries are dropped (default 500). */
  maxEntries?: number;
}

/**
 * In-memory store for prefix edit-tracking.
 * Keyed by the invoking user's message id.
 */
export class PrefixEditTracker {
  private readonly entries = new Map<string, TrackedPrefixReply>();
  private readonly maxEntries: number;

  constructor(options: PrefixEditTrackerOptions = {}) {
    this.maxEntries = options.maxEntries ?? 500;
  }

  get size(): number {
    return this.entries.size;
  }

  get(sourceMessageId: string): TrackedPrefixReply | undefined {
    return this.entries.get(sourceMessageId);
  }

  remember(sourceMessageId: string, entry: TrackedPrefixReply): void {
    if (this.entries.has(sourceMessageId)) {
      this.entries.delete(sourceMessageId);
    }
    this.entries.set(sourceMessageId, entry);
    while (this.entries.size > this.maxEntries) {
      const oldest = this.entries.keys().next().value;
      if (oldest === undefined) break;
      this.entries.delete(oldest);
    }
  }

  forget(sourceMessageId: string): boolean {
    return this.entries.delete(sourceMessageId);
  }

  clear(): void {
    this.entries.clear();
  }
}
