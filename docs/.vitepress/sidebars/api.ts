import type { DefaultTheme } from "vitepress";

/**
 * API reference sidebar (Phase 0 — placeholder tree until TypeDoc lands).
 * Generated pages will replace these stubs in DOCS-api-reference.
 */
export const apiSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: "API Reference",
    items: [{ text: "Overview", link: "/api/" }],
  },
  {
    text: "@stambha/core",
    collapsed: false,
    items: [
      { text: "Command", link: "/api/core/command" },
      { text: "Registry", link: "/api/core/registry" },
      { text: "createStambhaBot", link: "/api/core/create-stambha-bot" },
    ],
  },
  {
    text: "@stambha/loader",
    items: [{ text: "loadPieces", link: "/api/loader/load-pieces" }],
  },
  {
    text: "@stambha/gates",
    items: [{ text: "Gate helpers", link: "/api/gates/overview" }],
  },
  {
    text: "@stambha/vault",
    items: [
      { text: "Vault", link: "/api/vault/vault" },
      { text: "Record", link: "/api/vault/record" },
    ],
  },
  {
    text: "@stambha/rest",
    items: [{ text: "createNativeRestPort", link: "/api/rest/create-native-rest-port" }],
  },
  {
    text: "@stambha/gateway",
    items: [{ text: "attachStambhaClient", link: "/api/gateway/attach-stambha-client" }],
  },
  {
    text: "More packages",
    collapsed: true,
    items: [
      { text: "Transport map", link: "/reference/transport" },
      { text: "Package READMEs on GitHub", link: "https://github.com/mivaya/Stambha/tree/main/packages", process: false },
    ],
  },
];
