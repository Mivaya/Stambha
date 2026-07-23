import { createStambhaBot, MockBridge, type RestPort, type RestRequest, type StambhaClient } from "@stambha/core";
import {
  createHttpInteractionHandler,
  type HttpInteractionRequest,
  type HttpInteractionResult,
} from "@stambha/gateway";
import { loadPieces } from "@stambha/loader";
import { createNativeRestPort } from "@stambha/rest";

export interface HttpApp {
  client: StambhaClient;
  handle: (request: HttpInteractionRequest) => Promise<HttpInteractionResult>;
}

function createDemoRestPort(): RestPort {
  return {
    async request<T>(req: RestRequest) {
      const body = req.body as { content?: string; data?: { content?: string } } | undefined;
      const text = body?.content ?? body?.data?.content;
      if (text) console.log(`[demo:rest] ${text}`);
      return {} as T;
    },
  };
}

export async function createHttpApp(options: {
  demo?: boolean;
  publicKey: string;
  token?: string;
  applicationId?: string;
}): Promise<HttpApp> {
  const restPort = options.demo
    ? createDemoRestPort()
    : createNativeRestPort(options.token!);

  const client = createStambhaBot({ restPort });

  const loaded = await loadPieces(client, {
    paths: {
      gates: false,
      barriers: false,
      conduits: false,
      epilogues: false,
      scouts: false,
      signals: false,
      tasks: false,
      listeners: false,
    },
  });
  if (loaded.errors.length > 0) {
    for (const { file, error } of loaded.errors) {
      console.error(`[loader] ${file}:`, error);
    }
  }

  // No WebSocket — MockBridge satisfies start() for hooks / chron without a gateway.
  client.setBridge(new MockBridge());
  await client.start();

  const handle = createHttpInteractionHandler({
    publicKey: options.publicKey,
    client,
    restPort,
    ...(options.applicationId ? { applicationId: options.applicationId } : {}),
  });

  return { client, handle };
}
