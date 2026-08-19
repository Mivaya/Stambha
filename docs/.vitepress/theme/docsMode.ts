/** True when the current docs URL is in API reference (handles site base + version prefix). */
export function isApiDocsPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  return (
    path === "/api" ||
    path.endsWith("/api") ||
    path.includes("/api/")
  );
}
