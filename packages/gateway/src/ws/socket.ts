/** Minimal WebSocket surface for the native gateway client (Node `ws` or global WebSocket). */
export interface GatewayWebSocket {
  readonly readyState: number;
  send(data: string): void;
  close(code?: number, reason?: string): void;
  addEventListener(
    type: "open" | "message" | "close" | "error",
    listener: (event: unknown) => void,
  ): void;
  removeEventListener(
    type: "open" | "message" | "close" | "error",
    listener: (event: unknown) => void,
  ): void;
}

export type CreateGatewayWebSocket = (url: string) => GatewayWebSocket;

const WS_OPEN = 1;

function wrapNodeWs(socket: {
  readyState: number;
  send(data: string): void;
  close(code?: number, reason?: string): void;
  on(event: string, listener: (...args: unknown[]) => void): void;
  off(event: string, listener: (...args: unknown[]) => void): void;
}): GatewayWebSocket {
  const listeners = new Map<string, Set<(event: unknown) => void>>();

  const bridge =
    (type: string) =>
    (...args: unknown[]) => {
      const set = listeners.get(type);
      if (!set) return;
      let event: unknown;
      if (type === "message") {
        const data = args[0];
        const text =
          typeof data === "string"
            ? data
            : data instanceof Uint8Array
              ? new TextDecoder().decode(data)
              : String(data);
        event = { data: text };
      } else if (type === "close") {
        const code = typeof args[0] === "number" ? args[0] : 1000;
        const reason = typeof args[1] === "string" ? args[1] : "";
        event = { code, reason };
      } else {
        event = args[0];
      }
      for (const fn of set) fn(event);
    };

  return {
    get readyState() {
      return socket.readyState;
    },
    send: (data) => socket.send(data),
    close: (code, reason) => socket.close(code, reason),
    addEventListener(type, listener) {
      if (!listeners.has(type)) {
        listeners.set(type, new Set());
        socket.on(type, bridge(type));
      }
      listeners.get(type)?.add(listener);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
  };
}

function wrapGlobalWebSocket(socket: WebSocket): GatewayWebSocket {
  return {
    get readyState() {
      return socket.readyState;
    },
    send: (data) => socket.send(data),
    close: (code, reason) => socket.close(code, reason),
    addEventListener: (type, listener) =>
      socket.addEventListener(type, listener as (event: unknown) => void),
    removeEventListener: (type, listener) =>
      socket.removeEventListener(type, listener as (event: unknown) => void),
  };
}

/** Resolve a WebSocket factory — prefers global `WebSocket`, falls back to the `ws` package. */
export async function resolveWebSocketFactory(): Promise<CreateGatewayWebSocket> {
  if (typeof globalThis.WebSocket !== "undefined") {
    return (url) => wrapGlobalWebSocket(new globalThis.WebSocket(url));
  }

  try {
    const ws = await import("ws");
    const WsCtor = ws.default as new (
      url: string,
    ) => {
      readyState: number;
      send(data: string): void;
      close(code?: number, reason?: string): void;
      on(event: string, listener: (...args: unknown[]) => void): void;
      off(event: string, listener: (...args: unknown[]) => void): void;
    };
    return (url) => wrapNodeWs(new WsCtor(url));
  } catch {
    throw new Error(
      "Native gateway requires global WebSocket (Node 22+) or install the `ws` package",
    );
  }
}

export { WS_OPEN };
