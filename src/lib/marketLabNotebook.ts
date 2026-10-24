import { DEFAULT_SCENARIO, LAB_MISSIONS, isLabMode, isLabScenario, type LabMode, type LabScenario, type MissionId } from "./marketLab";

export const LAB_NOTEBOOK_KEY = "strikelab:market-lab:v1";
const EVENT = "strikelab:market-lab-changed";
export interface SavedExperiment { id: string; createdAt: string; mode: LabMode; scenario: LabScenario }
export interface LabNotebook { version: 1; completed: MissionId[]; experiments: SavedExperiment[] }

function cleanScenario(s: LabScenario): LabScenario {
  return { stock: s.stock, strike: s.strike, days: s.days, volatility: s.volatility, rate: s.rate, option: s.option };
}

export function parseLabNotebook(raw: string): LabNotebook {
  const empty: LabNotebook = { version: 1, completed: [], experiments: [] };
  try {
    const data = JSON.parse(raw) as Partial<LabNotebook> | null;
    if (!data || data.version !== 1) return empty;
    const completed = Array.isArray(data.completed)
      ? LAB_MISSIONS.filter((mission) => data.completed!.includes(mission.id)).map((mission) => mission.id)
      : [];
    const experiments: SavedExperiment[] = [];
    if (Array.isArray(data.experiments)) {
      for (const item of data.experiments.slice(0, 6)) {
        if (!item || typeof item.id !== "string" || !/^[a-zA-Z0-9-]{1,64}$/.test(item.id) ||
            typeof item.createdAt !== "string" || !Number.isFinite(Date.parse(item.createdAt)) ||
            !isLabMode(item.mode) || !isLabScenario(item.scenario) || experiments.some((entry) => entry.id === item.id)) continue;
        experiments.push({ id: item.id, createdAt: new Date(item.createdAt).toISOString(), mode: item.mode, scenario: cleanScenario(item.scenario) });
      }
    }
    return { version: 1, completed, experiments };
  } catch {
    return empty;
  }
}

export function notebookSnapshot(): string {
  try { return window.localStorage.getItem(LAB_NOTEBOOK_KEY) ?? ""; } catch { return ""; }
}
export function emptyNotebookSnapshot(): string { return ""; }
export function subscribeNotebook(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => { if (event.key === LAB_NOTEBOOK_KEY || event.key === null) onChange(); };
  window.addEventListener("storage", onStorage);
  window.addEventListener(EVENT, onChange);
  return () => { window.removeEventListener("storage", onStorage); window.removeEventListener(EVENT, onChange); };
}
function writeNotebook(notebook: LabNotebook): boolean {
  try {
    window.localStorage.setItem(LAB_NOTEBOOK_KEY, JSON.stringify(notebook));
    window.dispatchEvent(new Event(EVENT));
    return true;
  } catch { return false; }
}
export function saveExperiment(mode: LabMode, scenario: LabScenario): boolean {
  if (!isLabMode(mode) || !isLabScenario(scenario)) return false;
  const notebook = parseLabNotebook(notebookSnapshot());
  const createdAt = new Date().toISOString();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return writeNotebook({ ...notebook, experiments: [{ id, createdAt, mode, scenario: cleanScenario(scenario) }, ...notebook.experiments].slice(0, 6) });
}
export function recordMissionComplete(id: MissionId): boolean {
  if (!LAB_MISSIONS.some((mission) => mission.id === id)) return false;
  const notebook = parseLabNotebook(notebookSnapshot());
  return writeNotebook({ ...notebook, completed: [...new Set([...notebook.completed, id])] });
}
export function removeExperiment(id: string): boolean {
  const notebook = parseLabNotebook(notebookSnapshot());
  return writeNotebook({ ...notebook, experiments: notebook.experiments.filter((entry) => entry.id !== id) });
}
export function clearLabNotebook(): boolean {
  try {
    window.localStorage.removeItem(LAB_NOTEBOOK_KEY);
    window.dispatchEvent(new Event(EVENT));
    return true;
  } catch { return false; }
}
export function baselineForMode(mode: LabMode): LabScenario {
  return { ...(LAB_MISSIONS.find((mission) => mission.id === mode)?.baseline ?? DEFAULT_SCENARIO) };
}
