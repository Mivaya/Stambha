import type { DefaultTheme } from "vitepress";

/** Shared sidebar for latest docs and archived version snapshots. */
export const mainSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: "Introduction",
    items: [
      { text: "Why Stambha", link: "/guide/why-stambha" },
      { text: "Getting started", link: "/guide/getting-started" },
      { text: "Examples by scale", link: "/guide/examples" },
      { text: "Architecture", link: "/guide/architecture" },
      { text: "Known gaps", link: "/guide/known-gaps" },
      { text: "Project structure", link: "/guide/project-structure" },
      { text: "Pieces & pipeline", link: "/guide/pieces" },
    ],
  },
  {
    text: "Features",
    items: [
      { text: "Hooks (listeners)", link: "/features/hooks" },
      { text: "Scouts", link: "/features/scouts" },
      { text: "Conduits", link: "/features/conduits" },
      { text: "Barriers", link: "/features/barriers" },
      { text: "Gates", link: "/features/gates" },
      { text: "Capabilities", link: "/features/capabilities" },
      { text: "Monetization", link: "/features/monetization" },
      { text: "Epilogues", link: "/features/epilogues" },
      { text: "Signals", link: "/features/signals" },
      { text: "Collectors", link: "/features/collectors" },
      { text: "Components", link: "/features/components" },
      { text: "Polls", link: "/features/polls" },
      { text: "REST surface", link: "/features/rest-surface" },
      { text: "Arguments", link: "/features/args" },
      { text: "Help", link: "/features/help" },
      { text: "Command tree", link: "/features/command-tree" },
      { text: "Plugins", link: "/features/plugins" },
      { text: "Vault", link: "/features/vault" },
      { text: "Sequences", link: "/features/sequences" },
      { text: "Chron", link: "/features/chron" },
      { text: "Desired properties", link: "/features/desired-properties" },
    ],
  },
  {
    text: "Extensions",
    items: [
      { text: "Overview", link: "/extensions/" },
      { text: "Pagination", link: "/extensions/pagination" },
      { text: "HTTP API", link: "/extensions/api" },
      { text: "Cache", link: "/extensions/cache" },
      { text: "Metrics", link: "/extensions/metrics" },
    ],
  },
  {
    text: "Deployment",
    items: [
      { text: "Overview", link: "/deployment/overview" },
      { text: "Tier split", link: "/deployment/tier-split" },
      { text: "Native REST", link: "/deployment/native-rest" },
      { text: "Gateway", link: "/deployment/gateway" },
      { text: "HTTP interactions", link: "/deployment/http-interactions" },
      { text: "Slash deploy", link: "/deployment/slash-deploy" },
      { text: "Resharding", link: "/deployment/resharding" },
      { text: "Cross-runtime", link: "/deployment/cross-runtime" },
    ],
  },
  {
    text: "Reference",
    items: [
      { text: "Transport", link: "/reference/transport" },
    ],
  },
  {
    text: "Migration",
    items: [
      { text: "Overview", link: "/migration/" },
      { text: "Piece-based framework", link: "/migration/from-sapphire" },
      { text: "Native transport stack", link: "/migration/from-discordeno" },
    ],
  },
];
