/**
 * Routes that hide the site header and footer so the student sees only the
 * task (frontend master plan FW-3). The bite-sized player brings its own bar:
 * exit, progress and the accessibility menu.
 */
export function isFocusRoute(path: string | null): boolean {
  return Boolean(path?.startsWith("/learn/"));
}
