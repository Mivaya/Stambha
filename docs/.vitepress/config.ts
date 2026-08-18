import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import defineVersionedConfig from "vitepress-versioning-plugin";
import { apiSidebar } from "./sidebars/api";
import { mainSidebar } from "./sidebar";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Label for `/` docs. After a release is archived, keep showing "Next" until package.json is bumped. */
function readLatestVersionLabel(): string {
  const pkgPath = path.resolve(__dirname, "../../package.json");
  const version = (JSON.parse(readFileSync(pkgPath, "utf-8")) as { version: string }).version;
  const archived = path.resolve(__dirname, `../versions/${version}`);
  if (existsSync(archived)) {
    return "Next";
  }
  return version;
}

export default defineVersionedConfig(
  {
    title: "Stambha",
    description: "Native Discord bot framework for Node.js and TypeScript",
    base: "/Stambha/",
    cleanUrls: true,
    lastUpdated: true,

    /** Not published to GitHub Pages. */
    srcExclude: ["scripts/**", "decisions/**", "guide/hosting-the-docs.md"],

    versioning: {
      latestVersion: readLatestVersionLabel(),
      sidebars: {
        processSidebarURLs: true,
      },
    },

    themeConfig: {
      logo: "/logo.svg",
      versionSwitcher: {
        text: "Version",
        includeLatestVersion: true,
      },
      nav: [
        { text: "Getting started", link: "/guide/getting-started" },
        { text: "Features", link: "/features/gates" },
        { text: "API", link: "/api/" },
        { text: "Deployment", link: "/deployment/overview" },
        { text: "Migration", link: "/migration/" },
        { text: "GitHub", link: "https://github.com/mivaya/Stambha", process: false },
      ],

      sidebar: {
        "/api/": apiSidebar,
        "/": mainSidebar,
      },

      socialLinks: [{ icon: "github", link: "https://github.com/mivaya/Stambha" }],

      editLink: {
        pattern: "https://github.com/mivaya/Stambha/edit/main/docs/:path",
        text: "Edit this page on GitHub",
      },

      footer: {
        message: "Released under the MIT License.",
        copyright: "Copyright © Stambha contributors",
      },

      search: {
        provider: "local",
      },
    },

    ignoreDeadLinks: true,
  },
  __dirname,
);
