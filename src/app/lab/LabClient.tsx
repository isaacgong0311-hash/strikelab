"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  LAB_CONTROLS, LAB_MISSIONS, experimentCsvRows, getLabMission, labPrice, meetsMissionTarget,
  type LabMode, type LabScenario, type LabVariable,
} from "@/lib/marketLab";
import {
  baselineForMode, clearLabNotebook, emptyNotebookSnapshot, notebookSnapshot, parseLabNotebook,
  recordMissionComplete, removeExperiment, saveExperiment, subscribeNotebook, type SavedExperiment,
} from "@/lib/marketLabNotebook";
import { downloadCsv, toCsv } from "@/lib/csv";
import { rangeFill } from "@/lib/rangeFill";
import MarketLabChart, { dollars } from "@/components/lab/MarketLabChart";
import styles from "./lab.module.css";

export default function LabClient({ initialMode }: { initialMode: LabMode }) {
  const [mode, setMode] = useState<LabMode>(initialMode);
  const [restored, setRestored] = useState<SavedExperiment | null>(null);
  const [notebookMessage, setNotebookMessage] = useState("");
  const raw = useSyncExternalStore(subscribeNotebook, notebookSnapshot, emptyNotebookSnapshot);
  const notebook = useMemo(() => parseLabNotebook(raw), [raw]);
  const workspace = useRef<HTMLDivElement>(null);

  function openMode(nextMode: LabMode, experiment: SavedExperiment | null = null) {
    setMode(nextMode);
    setRestored(experiment);
    requestAnimationFrame(() => workspace.current?.focus());
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div><p className={styles.eyebrow}>StrikeLab / Market Lab</p><h1>Build your market intuition.</h1><p>Make a prediction. Change one assumption. See what the model actually does.</p></div>
        <Link href="/lessons" className={styles.quietLink}>Your learning path ↗</Link>
      </header>
      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Lab missions">
          <p className={styles.eyebrow}>Field notes / 001</p>
          <h2>Learn through experiments</h2>
          <p className={styles.muted}>Three guided investigations. Then take the controls yourself.</p>
          <nav className={styles.missionList} aria-label="Choose an experiment">
            {LAB_MISSIONS.map((mission) => (
              <button key={mission.id} type="button" className={styles.mission} aria-pressed={mode === mission.id} onClick={() => openMode(mission.id)}>
                <span className={styles.missionNumber}>{notebook.completed.includes(mission.id) ? "✓" : mission.number}</span>
                <span><strong>{mission.title}</strong><small>{mission.description}</small></span>
              </button>
            ))}
            <button type="button" className={styles.mission} aria-pressed={mode === "free"} onClick={() => openMode("free")}>
              <span className={styles.missionNumber}>↗</span><span><strong>Free experiment</strong><small>Change every input. Compare calls and puts.</small></span>
            </button>
          </nav>
          <div className={styles.localNote}><strong>{notebook.completed.length} of 3 missions completed</strong><p>Saved on this device. Lab missions are separate from course credit and XP.</p></div>
        </aside>

        <div ref={workspace} tabIndex={-1} className={styles.workspace}>
          <ExperimentWorkspace key={`${mode}-${restored?.id ?? "new"}`} mode={mode} initialScenario={restored?.scenario} />
        </div>
      </div>

      <section className={styles.notebook} aria-labelledby="notebook-title">
        <div className={styles.sectionHead}><div><p className={styles.eyebrow}>Keep the evidence</p><h2 id="notebook-title">Your lab notebook</h2><p className={styles.muted}>Your six most recent saved experiments. Restore the inputs or download a result to explain.</p></div>
          {(notebook.experiments.length > 0 || notebook.completed.length > 0) && <button type="button" className={styles.textButton} onClick={() => setNotebookMessage(clearLabNotebook() ? "Notebook cleared from this device." : "Browser storage is unavailable.")}>Clear notebook</button>}
        </div>
        <p role="status" className={styles.muted}>{notebookMessage}</p>
        {notebook.experiments.length === 0 ? <div className={styles.emptyNotebook}><span aria-hidden="true">＋</span><p>Change an input and save your first experiment.<br /><small>Your work stays in this browser. No account needed.</small></p></div> : (
          <div className={styles.savedGrid}>{notebook.experiments.map((entry) => (
            <article key={entry.id} className={styles.savedCard}>
              <p className={styles.eyebrow}>{entry.scenario.option} / {new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
              <h3>{getLabMission(entry.mode)?.title ?? "Free experiment"}</h3>
              <strong className={styles.savedPrice}>{dollars(labPrice(entry.scenario))}<small> / share</small></strong>
              <p className={styles.muted}>Stock ${entry.scenario.stock} · {entry.scenario.days} days · {entry.scenario.volatility}% volatility</p>
              <div className={styles.actions}>
                <button type="button" className={styles.secondary} onClick={() => openMode(entry.mode, entry)}>Restore</button>
                <button type="button" className={styles.textButton} onClick={() => downloadCsv("strikelab-experiment.csv", toCsv(experimentCsvRows(baselineForMode(entry.mode), entry.scenario)))}>Export CSV</button>
                <button type="button" className={styles.textButton} aria-label={`Delete saved ${getLabMission(entry.mode)?.title ?? "free experiment"}`} onClick={() => setNotebookMessage(removeExperiment(entry.id) ? "Experiment removed." : "Could not update browser storage.")}>Delete</button>
              </div>
            </article>
          ))}</div>
        )}
      </section>
      <p className={styles.assumptions}>Model lab, not live quotes. Black-Scholes assumes European exercise, no dividends, and constant volatility and interest rates. Values are dollars per share; price differences are not trading profit.</p>
    </div>
  );
}

function ExperimentWorkspace({ mode, initialScenario }: { mode: LabMode; initialScenario?: LabScenario }) {
  const mission = getLabMission(mode);
  const baseline = baselineForMode(mode);
  const [scenario, setScenario] = useState<LabScenario>(() => ({ ...(initialScenario ?? baseline) }));
  const [phase, setPhase] = useState<"predict" | "experiment" | "explain" | "done">(mission ? "predict" : "experiment");
  const [prediction, setPrediction] = useState<"up" | "down" | null>(null);
  const [reflection, setReflection] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [freeVariable, setFreeVariable] = useState<LabVariable>("stock");
  const title = useRef<HTMLHeadingElement>(null);
  const before = labPrice(baseline);
  const after = labPrice(scenario);
  const difference = after - before;
  const variable = mission?.variable ?? freeVariable;
  const locked = mission && phase !== "experiment";
  const nextMission = mission ? LAB_MISSIONS[LAB_MISSIONS.indexOf(mission) + 1] : undefined;

  function transition(next: typeof phase) {
    setPhase(next);
    setMessage("");
    requestAnimationFrame(() => title.current?.focus());
  }

  function reset() {
    setScenario({ ...baseline });
    setPrediction(null);
    setReflection(null);
    transition(mission ? "predict" : "experiment");
  }

  function finish() {
    if (!mission) return;
    if (reflection !== mission.correct) {
      setMessage("Revisit the result: " + mission.explanation + " Choose the explanation that matches it.");
      return;
    }
    setPhase("done");
    setMessage(recordMissionComplete(mission.id) ? "Mission saved to your notebook on this device." : "Mission complete for this visit. Browser storage is unavailable.");
    requestAnimationFrame(() => title.current?.focus());
  }

  return (
    <>
      <div className={styles.workspaceTop}><span className={styles.liveBadge}>● Interactive model</span><button type="button" className={styles.textButton} onClick={reset}>Reset experiment</button></div>
      <div className={styles.experimentHead}><p className={styles.eyebrow}>{mission ? `Experiment ${mission.number}` : "Open workspace"}</p><h2 ref={title} tabIndex={-1}>{mission?.title ?? "Your question. Your experiment."}</h2><p>{mission?.description ?? "Hold a baseline, change the assumptions, and inspect the difference."}</p></div>
      {mission && <ol className={styles.steps} aria-label="Mission progress">{["Predict", "Experiment", "Explain"].map((step, i) => <li key={step} aria-current={(phase === "predict" && i === 0) || (phase === "experiment" && i === 1) || ((phase === "explain" || phase === "done") && i === 2) ? "step" : undefined}><span>{i + 1}</span>{step}</li>)}</ol>}

      {mission && phase === "predict" && <section className={styles.checkpoint} aria-label="Make a prediction">
        <h3>{mission.question}</h3>
        <fieldset className={styles.predictions}><legend className="sl-visually-hidden">Your prediction</legend>{(["up", "down"] as const).map((value) => <label key={value}><input type="radio" name="prediction" value={value} checked={prediction === value} onChange={() => setPrediction(value)} /><span>{value === "up" ? "↗ It rises" : "↘ It falls"}</span></label>)}</fieldset>
        <button type="button" className={styles.primary} disabled={!prediction} onClick={() => transition("experiment")}>Make my prediction →</button>
      </section>}

      <div className={styles.experimentGrid}>
        <div className={styles.visual}>
          <div className={styles.priceSummary}><div><span>Baseline {baseline.option}</span><strong>{dollars(before)}</strong></div><div><span>Your {scenario.option}</span><strong>{dollars(after)}</strong></div><div><span>Model difference</span><strong>{difference > 0 ? "+" : ""}{dollars(difference)}</strong></div></div>
          <MarketLabChart baseline={baseline} scenario={scenario} variable={variable} />
          {!mission && <label className={styles.selectLabel}>Chart horizontal axis<select value={freeVariable} onChange={(e) => setFreeVariable(e.target.value as LabVariable)}>{Object.entries(LAB_CONTROLS).map(([key, control]) => <option key={key} value={key}>{control.label}</option>)}</select></label>}
        </div>
        <div className={styles.controls}>
          <h3>Your assumptions</h3>
          <p className={styles.muted}>Strike $100 · risk-free rate 4.5% · no dividends</p>
          {!mission && <label className={styles.selectLabel}>Option type<select value={scenario.option} onChange={(e) => setScenario({ ...scenario, option: e.target.value as "call" | "put" })}><option value="call">Call — right to buy</option><option value="put">Put — right to sell</option></select></label>}
          {(Object.keys(LAB_CONTROLS) as LabVariable[]).map((key) => {
            const control = LAB_CONTROLS[key];
            return <div className={styles.control} key={key}><div><label htmlFor={`lab-${key}`}>{control.label}</label><output htmlFor={`lab-${key}`}>{key === "stock" ? `$${scenario[key]}` : `${scenario[key]}${key === "days" ? " days" : "%"}`}</output></div>
              <input id={`lab-${key}`} type="range" min={control.min} max={control.max} step={control.step} value={scenario[key]} disabled={Boolean(locked || (mission && key !== mission.variable))} style={rangeFill(scenario[key], control.min, control.max)} onChange={(e) => { setScenario({ ...scenario, [key]: Number(e.target.value) }); setMessage(""); }} />
            </div>;
          })}
          {mission && <p className={styles.target}>{phase === "predict" ? "Make your prediction to unlock the experiment." : mission.target}</p>}
          {mission && phase === "experiment" && <button type="button" className={styles.primary} onClick={() => {
            if (!meetsMissionTarget(mission, scenario)) { setMessage(mission.target); return; }
            transition("explain");
          }}>Test my scenario →</button>}
          <div className={styles.saveActions}><button type="button" className={styles.secondary} disabled={phase === "predict"} onClick={() => setMessage(saveExperiment(mode, scenario) ? "Experiment saved. Find it in your lab notebook below." : "Could not save to this browser. You can still export your experiment.")}>Save experiment</button><button type="button" className={styles.textButton} onClick={() => downloadCsv("strikelab-experiment.csv", toCsv(experimentCsvRows(baseline, scenario)))}>Export CSV ↗</button></div>
        </div>
      </div>

      {mission && (phase === "explain" || phase === "done") && <section className={styles.checkpoint} aria-label="Explain the result">
        <p className={styles.eyebrow}>{prediction === mission.prediction ? "Your prediction held up" : "A useful surprise"}</p>
        <h3>{phase === "done" ? "Experiment complete. Now build the model." : mission.reflection}</h3>
        <p className={styles.muted}>The call moved from {dollars(before)} to {dollars(after)} per share with only {LAB_CONTROLS[mission.variable].label.toLowerCase()} changed.</p>
        {phase === "explain" ? <><fieldset className={styles.reflections}><legend className="sl-visually-hidden">Choose an explanation</legend>{mission.answers.map((answer, i) => <label key={answer}><input type="radio" name="reflection" checked={reflection === i} onChange={() => { setReflection(i); setMessage(""); }} /><span>{answer}</span></label>)}</fieldset><button type="button" className={styles.primary} disabled={reflection === null} onClick={finish}>Finish mission →</button></> : <><p>{mission.explanation}</p><div className={styles.actions}><Link href={mission.lessonHref} className={styles.primary}>{mission.lessonTitle} in Python ↗</Link>{nextMission && <Link href={`/lab?mission=${nextMission.id}`} className={styles.secondary}>Next experiment →</Link>}<Link href="/playground" className={styles.textButton}>Open coding playground</Link></div></>}
      </section>}
      <p role="status" className={styles.status}>{message}</p>
    </>
  );
}
