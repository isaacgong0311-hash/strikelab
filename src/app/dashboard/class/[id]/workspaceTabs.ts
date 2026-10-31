/** The class workspace's sections, in nav order. The URL's ?tab= picks one. */
export const WORKSPACE_TABS = [
  { id: "overview", label: "Overview" },
  { id: "students", label: "Students" },
  { id: "plan", label: "Plan" },
  { id: "settings", label: "Settings" },
] as const;

export type WorkspaceTab = (typeof WORKSPACE_TABS)[number]["id"];

export function parseWorkspaceTab(raw: string | string[] | undefined): WorkspaceTab {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return WORKSPACE_TABS.some((t) => t.id === value) ? (value as WorkspaceTab) : "overview";
}
